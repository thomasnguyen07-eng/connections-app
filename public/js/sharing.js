// ============================================
// VIOLATION CHECKER FOR RESHARE (Self-contained)
// ============================================
const ReshareViolationChecker = {
  keywords: {
    violence: [
      "đánh bom",
      "bomb",
      "khủng bố",
      "terror",
      "giết",
      "kill",
      "vũ khí",
      "weapon",
    ],
    personal: [
      "tài khoản ngân hàng",
      "bank account",
      "cmnd",
      "cccd",
      "passport",
    ],
    scam: ["lừa đảo", "scam", "trúng thưởng", "lottery", "bitcoin"],
    adult: ["khiêu dâm", "porn", "sex", "nude", "xxx"],
  },

  getMessage(key) {
    const lang = localStorage.getItem("userLanguage") || "en";
    const messages = {
      cannotReshare: {
        en: "❌ Cannot reshare: This content contains prohibited language",
        vi: "❌ Không thể chia sẻ lại: Nội dung này chứa ngôn ngữ bị cấm",
        zh: "❌ 无法转发：此内容包含禁止使用的语言",
        es: "❌ No se puede compartir: Este contenido contiene lenguaje prohibido",
        hi: "❌ पुनः साझा नहीं कर सकते: इस सामग्री में प्रतिबंधित भाषा है",
        ar: "❌ لا يمكن إعادة المشاركة: هذا المحتوى يحتوي على لغة محظورة",
      },
      accountBlocked: {
        en: "Your account has been blocked.",
        vi: "Tài khoản của bạn đã bị khóa.",
        zh: "您的帐户已被封锁。",
        es: "Tu cuenta ha sido bloqueada.",
        hi: "आपका खाता ब्लॉक कर दिया गया है।",
        ar: "تم حظر حسابك.",
      },
    };
    return messages[key]?.[lang] || messages[key]?.en || key;
  },

  check(title, description) {
    const textToCheck = (title + " " + description).toLowerCase();
    const violations = [];
    for (const [category, keywords] of Object.entries(this.keywords)) {
      for (const keyword of keywords) {
        if (textToCheck.includes(keyword.toLowerCase())) {
          violations.push({ category, keyword });
        }
      }
    }
    return violations;
  },

  async blockUser(userId, reason, violations) {
    try {
      await window.fb.firestore.collection("users").doc(userId).update({
        status: "blocked",
        blockedReason: reason,
        blockedAt: new Date(),
        blockedBy: "auto_moderation",
      });
      await window.fb.firestore.collection("security_logs").add({
        eventType: "RESHARE_VIOLATION_ATTEMPT",
        userId: userId,
        severity: "high",
        details: { reason, violations },
        timestamp: new Date(),
      });
      return true;
    } catch (error) {
      console.error("Failed to block user:", error);
      return false;
    }
  },
};

// ============================================
// CONTENT VIOLATION CHECKER
// ============================================

// At the top of sharing.js - SIMPLE ARRAY STRUCTURE (not nested by language)
const VIOLATING_KEYWORDS = {
  violence: [
    "đánh bom",
    "bomb",
    "khủng bố",
    "terror",
    "giết",
    "kill",
    "vũ khí",
    "weapon",
    "súng",
    "gun",
  ],
  personal: ["tài khoản ngân hàng", "bank account", "cmnd", "cccd", "passport"],
  scam: ["lừa đảo", "scam", "trúng thưởng", "lottery", "bitcoin"],
  adult: ["khiêu dâm", "porn", "sex", "nude", "xxx", "khỏa thân"],
};

// Simplified checkContentViolation
function checkContentViolation(title, description) {
  const textToCheck = (title + " " + description).toLowerCase();
  const violations = [];
  for (const [category, keywords] of Object.entries(VIOLATING_KEYWORDS)) {
    for (const keyword of keywords) {
      if (textToCheck.includes(keyword.toLowerCase())) {
        violations.push({ category, keyword });
      }
    }
  }
  return violations;
}

// In sharing.js, replace the block function with:
async function blockViolatingUser(userId, reason, violations) {
  try {
    // ✅ FIX: Use correct Firestore syntax
    const userRef = window.fb.firestore.collection("users").doc(userId);
    await userRef.update({
      status: "blocked",
      blockedReason: reason,
      blockedAt: new Date(),
      blockedBy: "auto_moderation",
    });

    // Add to security logs
    await window.fb.firestore.collection("security_logs").add({
      eventType: "RESHARE_VIOLATION_ATTEMPT",
      userId: userId,
      severity: "high",
      details: { reason, violations },
      timestamp: new Date(),
    });

    console.log(`✅ User ${userId} blocked for: ${reason}`);
    return true;
  } catch (error) {
    console.error("Failed to block user:", error);
    return false;
  }
}

// Global Telegram lock to prevent double messages
window.telegramLock = {
  share: false,
  reshare: false,
};

// Helper function to detect Yahoo email
function isYahooEmail(email) {
  return email && email.toLowerCase().includes("@yahoo.com");
}

// Helper to get Yahoo-friendly image text
function getYahooImageText(imageResult, t, lang) {
  if (!imageResult || !imageResult.url) return "";

  const baseText =
    imageResult.type === "package"
      ? `🖼️ ${t.fieldLabels.images[lang]} (${imageResult.count}): ${imageResult.url}`
      : `🖼️ ${t.fieldLabels.image[lang]}: ${imageResult.url}`;

  // This will be replaced with actual recipient email when we have it
  return baseText;
}

// Add this function at the top of sharing.js (or anywhere)
function ensureFacebookImageAccessibility(imageUrl) {
  if (!imageUrl) return imageUrl;

  // If it's a Firebase Storage URL, make sure it has ?alt=media
  if (imageUrl.includes("firebasestorage.googleapis.com")) {
    // 🚨 CRITICAL FIX: Check if this is a PACKAGE PAGE link, not an image link.
    // Package page links contain 'image-package.html', image links do not.
    if (imageUrl.includes("image-package.html")) {
      // This is a package link, NOT a direct image. Do NOT modify it.
      console.log(
        "🔗 Skipping fix for package URL:",
        imageUrl.substring(0, 80),
      );
      return imageUrl;
    }
    // Only modify direct Firebase image URLs
    if (!imageUrl.includes("?alt=media")) {
      const separator = imageUrl.includes("?") ? "&" : "?";
      const correctedUrl = imageUrl + separator + "alt=media";
      console.log("🔗 Fixed direct image URL:", correctedUrl.substring(0, 80));
      return correctedUrl;
    }
  }
  // If it's not a Firebase URL or already correct, return as-is
  return imageUrl;
}

// Add this function to sharing.js (anywhere at top level)
function updateFacebookMetaTagsForSharing(title, description, imageUrl) {
  const tags = {
    "og:title": title || "Connections Report",
    "og:description": description || "Find missing persons and lost items",
    "og:image":
      imageUrl || "https://connectionsfinder.com/images/default-avatar.png",
    "og:url": window.location.href,
    "og:type": "website",
    "og:site_name": "Connections",
  };

  Object.entries(tags).forEach(([property, content]) => {
    let tag = document.querySelector(`meta[property="${property}"]`);
    if (!tag) {
      tag = document.createElement("meta");
      tag.setAttribute("property", property);
      document.head.appendChild(tag);
    }
    tag.setAttribute("content", content);
  });
}
// ===== SAFE FIREBASE DIAGNOSTIC =====
function diagnoseFirebaseEnvironment() {
  console.log("🔍 FIREBASE ENVIRONMENT DIAGNOSTIC");
  console.log("==================================");

  // Check global Firebase availability
  console.log("1. Global Firebase Objects:");
  console.log("   - typeof firebase:", typeof firebase);
  console.log("   - typeof window.firebase:", typeof window.firebase);

  if (typeof firebase !== "undefined") {
    console.log("   - firebase.apps:", firebase.apps);
    console.log(
      "   - firebase.apps.length:",
      firebase.apps ? firebase.apps.length : "N/A",
    );
    console.log("   - typeof firebase.firestore:", typeof firebase.firestore);
    console.log("   - typeof firebase.auth:", typeof firebase.auth);
  }

  // Check for any Firebase-related global variables
  console.log("2. All Global Variables containing 'firebase':");
  let firebaseVars = [];
  for (let key in window) {
    if (key.toLowerCase().includes("firebase")) {
      firebaseVars.push(key);
    }
  }
  console.log(
    "   - Found:",
    firebaseVars.length > 0 ? firebaseVars.join(", ") : "None",
  );

  // Check if we're in a module context
  console.log("3. Module Context:");
  console.log("   - typeof module:", typeof module);
  console.log("   - typeof exports:", typeof exports);
  console.log("   - typeof require:", typeof require);

  // Check current script context
  console.log("4. Script Context:");
  console.log("   - Current URL:", window.location.href);
  console.log(
    "   - Scripts loaded:",
    performance
      .getEntriesByType("resource")
      .filter((r) => r.name.includes(".js"))
      .map((r) => r.name.split("/").pop())
      .join(", "),
  );

  console.log("==================================");
}

// Run diagnostic when sharing.js loads
diagnoseFirebaseEnvironment();

// Also run diagnostic when window loads (in case Firebase loads later)
window.addEventListener("load", () => {
  console.log("🔄 Running diagnostic after window load...");
  setTimeout(diagnoseFirebaseEnvironment, 1000);
});

// ===== VERIFY SHARED FIREBASE =====
function verifySharedFirebase() {
  console.log("🔍 VERIFYING SHARED FIREBASE:");
  console.log("window.initializedFirebase:", typeof window.initializedFirebase);

  if (window.initializedFirebase) {
    console.log("✅ Shared Firebase available");
    console.log("Apps count:", window.initializedFirebase.apps.length);
    console.log("Firestore:", typeof window.initializedFirebase.firestore);
    console.log("Auth:", typeof window.initializedFirebase.auth);
  } else {
    console.log("❌ Shared Firebase not available yet");
  }
}

// Check after a delay to allow dashboard to share Firebase
setTimeout(verifySharedFirebase, 3000);

// === ADVANCED WHATSAPP HANDLER WITH HINDI SUPPORT ===
function shareToWhatsApp(message, reportTitle = "") {
  try {
    let finalMessage = message;
    const encodedLength =
      `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`
        .length;

    // ONLY shorten if absolutely necessary
    if (encodedLength > 1900) {
      console.log("Message shortened for WhatsApp");
      finalMessage = shortenMessageForWhatsApp(message, reportTitle);
    }

    // Advanced encoding for Hindi and special characters
    const encodedMessage = encodeURIComponent(finalMessage) // Use finalMessage here
      .replace(/'/g, "%27")
      .replace(/\(/g, "%28")
      .replace(/\)/g, "%29")
      .replace(/\*/g, "%2A")
      .replace(/_/g, "%5F");

    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodedMessage}`;

    // Final length check
    if (whatsappUrl.length > 2000) {
      // Emergency truncation - use current language
      const lang = localStorage.getItem("userLanguage") || "en";
      const t = TRANSLATION_PATCH;
      const emergencyMessage = `*${reportTitle}*\n\n${t.reportSharedVia[lang]} ${window.location.href}`;
      window.open(
        `https://api.whatsapp.com/send?text=${encodeURIComponent(
          emergencyMessage,
        )}`,
        "_blank",
      );
    } else {
      window.open(whatsappUrl, "_blank");
    }
  } catch (error) {
    console.error("WhatsApp share error:", error);
    const simpleMessage = `Shared report: ${reportTitle || "Untitled"}`;
    window.open(
      `https://api.whatsapp.com/send?text=${encodeURIComponent(simpleMessage)}`,
      "_blank",
    );
  }
}

// === SMART MESSAGE SHORTENER ===
// ===== SMART MESSAGE SHORTENER (IMPROVED) =====
function shortenMessageForWhatsApp(fullMessage, reportTitle) {
  const lang = localStorage.getItem("userLanguage") || "en";
  const t = TRANSLATION_PATCH;

  console.log(`🌐 Language: ${lang}, Original length: ${fullMessage.length}`);

  const isLongLanguage = ["hi", "ar"].includes(lang);

  // For long languages, create a BALANCED message (not ultra-short)
  if (isLongLanguage && fullMessage.length > 1500) {
    console.log("🔄 Creating balanced message for long language");

    let imagePart = "";
    if (window.lastUploadedImages && window.lastUploadedImages.length > 0) {
      const currentPackageId =
        window.currentPackageId || "img_" + Date.now().toString(36);
      imagePart = `\n\n${t.fieldLabels.images[lang]}: https://connectionsfinder.com/image-package.html?id=${currentPackageId}`;
    }

    // BALANCED version - keep more content but stay under limits
    const balancedMessage = [
      `_${t.greetings[lang]}_`,
      `\n\n*${reportTitle}*`,
      `\n\n${t.fieldLabels.description[lang]}: ${getFirstWords(
        fullMessage,
        50,
      )}`, // Keep some description
      imagePart,
      `\n\n${t.closingLines.thank_you[lang]}`,
      `\n${t.reportSharedVia[lang]} ${window.location.hostname}`,
    ]
      .filter(Boolean)
      .join("");

    console.log(`⚖️ Balanced message length: ${balancedMessage.length}`);

    if (balancedMessage.length <= 2500) {
      return balancedMessage;
    }
  }

  // EXISTING LOGIC for other cases
  let imagePart = "";
  if (window.lastUploadedImages && window.lastUploadedImages.length > 0) {
    // Always include image package link, even for short messages
    const currentPackageId =
      window.currentPackageId || "img_" + Date.now().toString(36);
    imagePart = `\n\n${t.fieldLabels.images[lang]}: https://connectionsfinder.com/image-package.html?id=${currentPackageId}`;
  }

  // Build shorter message but keep essential info
  const shortenedMessage = [
    `${t.greetings[lang]}`,
    `\n\n*${reportTitle}*`,
    imagePart, // ← THIS IS CRITICAL - KEEP THE IMAGE LINK
    `\n${t.reportSharedVia[lang]} ${window.location.href}`,
  ]
    .filter(Boolean)
    .join("");

  console.log(`📝 Shortened message length: ${shortenedMessage.length}`);

  // Only shorten if absolutely necessary (over 2500 chars for WhatsApp)
  if (shortenedMessage.length > 2500) {
    // Ultra-short version as last resort
    const ultraShort = [
      `*${reportTitle}*`,
      imagePart, // STILL KEEP THE IMAGE LINK
      `\n${t.reportSharedVia[lang]} ${window.location.hostname}`,
    ].join("");

    console.log(`🚨 ULTRA Short message length: ${ultraShort.length}`);
    return ultraShort;
  }

  return shortenedMessage;
}

// Helper function to get first words
function getFirstWords(text, wordCount) {
  const words = text.split(" ").slice(0, wordCount).join(" ");
  // Only add "..." if we actually shortened it
  return words.split(" ").length >= wordCount ? words + "..." : words;
}

// === DEBUG FUNCTION ===
function debugWhatsAppIssue(message, reportTitle) {
  const encodedLength =
    `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`.length;
  console.log("WhatsApp Debug:", {
    messageLength: message.length,
    urlLength: encodedLength,
    hasHindi: /[\u0900-\u097F]/.test(message),
    title: reportTitle,
    status: encodedLength > 2000 ? "❌ TOO LONG" : "✅ OK",
  });
}

// SAFE TRANSLATION HELPER (ADD THIS FIRST)
function t(key, lang = localStorage.getItem("userLanguage") || "en") {
  const keys = key.split(".");
  let value = TRANSLATION_PATCH;

  for (const k of keys) {
    value = value?.[k];
    if (value === undefined) break;
  }

  return value?.[lang] || key.split(".").pop(); // Fallback to last key part
}

// ===== UNIVERSAL IMAGE PROVIDER (NEW - SAFE ADDITION) =====
// ===== IMAGE PROVIDER USING WINDOW.FB =====
class ImageProvider {
  static async getImagesForPlatform(imageUrls, platform) {
    // 🔍 ADD DIAGNOSTIC LOG
    console.log(`🔍 getImagesForPlatform CALLED for ${platform}:`, {
      receivedUrlsCount: imageUrls?.length,
      firstUrl: imageUrls?.[0]?.substring(0, 100),
    });
    console.log(`🔍 Full array:`, imageUrls);

    console.log(`🖼️ Getting images for ${platform}:`, imageUrls?.length);

    if (!imageUrls || imageUrls.length === 0) {
      return { type: "none" };
    }

    // ===== CRITICAL FIX FOR FACEBOOK =====
    // ===== UPDATED LOGIC FOR FACEBOOK =====
    if (platform === "facebook") {
      console.log("📱 Facebook: Creating a package for the clickable link.");
      // For Facebook, ALSO create a package so the click opens multiple images.
      try {
        if (imageUrls.length === 1) {
          // If only one image, just use it directly
          return { type: "single", url: imageUrls[0] };
        } else {
          // For multiple images, create a package
          const packageUrl = await this.createPackageWithFirestore(imageUrls);
          return { type: "package", url: packageUrl, count: imageUrls.length };
        }
      } catch (error) {
        console.error(`❌ Facebook package failed, fallback to single:`, error);
        // Fallback to first image if package fails
        return { type: "single", url: imageUrls[0] };
      }
    }

    if (platform === "telegram") {
      console.log("📱 Telegram detected, handling", imageUrls.length, "images");

      if (imageUrls.length === 1) {
        return {
          type: "single",
          url: imageUrls[0],
        };
      } else {
        // ✅ FIX: Use the correct function name
        const packageUrl = await this.createPackageWithFirestore(imageUrls);
        console.log("📦 Telegram package created:", packageUrl);

        // Extract packageId from URL for logging
        const packageId = packageUrl.match(/id=([^&]+)/)?.[1];
        console.log("📦 Package ID:", packageId);

        return {
          type: "package",
          url: packageUrl,
          count: imageUrls.length,
        };
      }
    }
    // ===== END UPDATE =====

    // UPDATED: Create packages for ALL platforms including Facebook and Email
    try {
      if (imageUrls.length === 1) {
        return { type: "single", url: imageUrls[0] };
      } else {
        const packageUrl = await this.createPackageWithFirestore(imageUrls);
        return { type: "package", url: packageUrl, count: imageUrls.length };
      }
    } catch (error) {
      console.error(`❌ ImageProvider failed:`, error);
      return { type: "single", url: imageUrls[0] };
    }
  }

  static async createPackageWithFirestore(imageUrls) {
    const packageId =
      "img_" +
      Date.now().toString(36) +
      Math.random().toString(36).substr(2, 5);
    console.log(
      `📦 Creating package: ${packageId} with ${imageUrls.length} images`,
    );
    window.currentPackageId = packageId;

    const firestoreSuccess = await this.storeInFirestore(packageId, imageUrls);
    this.storeInMultipleLocations(packageId, imageUrls);

    // ✅ CLEAN, SHORT URL
    const packageUrl = `https://connectionsfinder.com/image-package.html?id=${packageId}&forceFirestore=true`;

    console.log(`✅ Package created: ${packageUrl}`);
    console.log(`📊 Firestore storage: ${firestoreSuccess ? "✅" : "❌"}`);
    return packageUrl;
  }

  // ADD THIS VERIFICATION METHOD

  static async storeInFirestore(packageId, imageUrls) {
    try {
      console.log("🔥 FIX: Storing with packageId as document ID:", packageId);

      if (!window.fb || !window.fb.firestore) {
        console.log("❌ window.fb.firestore not available");
        return false;
      }

      const userId = this.getUserId();
      const packageData = {
        images: imageUrls,
        userId: userId,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 DAYS
        isPublic: true,
        imageCount: imageUrls.length,
        createdFrom: window.location.origin,
        // REMOVED: No 'id' field - packageId IS the document ID
      };

      // CRITICAL FIX: Use .doc(packageId).set() to create document with YOUR ID
      // Check which method exists in your window.fb.firestore
      if (window.fb.firestore.collection("imagePackages").doc) {
        // Method 1: .doc().set() - PREFERRED
        await window.fb.firestore
          .collection("imagePackages")
          .doc(packageId) // Your img_ ID becomes the document ID
          .set(packageData);
        console.log("✅ SUCCESS: Used .doc().set() method");
      } else if (window.fb.firestore.setDoc) {
        // Method 2: setDoc() alternative
        await window.fb.firestore.setDoc(
          window.fb.firestore.doc(`imagePackages/${packageId}`),
          packageData,
        );
        console.log("✅ SUCCESS: Used setDoc() method");
      } else {
        // Method 3: Fallback to old way
        await window.fb.firestore.addDoc(
          window.fb.firestore.collection("imagePackages"),
          { ...packageData, id: packageId },
        );
        console.log("🔄 Used addDoc fallback (will still have the problem)");
      }

      return true;
    } catch (error) {
      console.error("❌ Firestore storage failed:", error);
      return false;
    }
  }

  // ADD THIS METHOD RIGHT HERE:
  static storeInWhatsAppStorage(packageId, imageUrls) {
    try {
      const waKey = "whatsapp_" + packageId;
      localStorage.setItem(
        waKey,
        JSON.stringify({
          images: imageUrls,
          timestamp: Date.now(),
        }),
      );
      console.log("💾 Stored in WhatsApp storage:", waKey);
    } catch (error) {
      console.warn("⚠️ WhatsApp storage failed:", error);
    }
  }

  static getUserId() {
    let userId = localStorage.getItem("anonymousUserId");
    if (!userId) {
      userId = "anon_" + Math.random().toString(36).substr(2, 9);
      localStorage.setItem("anonymousUserId", userId);
    }
    return userId;
  }

  static storeInMultipleLocations(packageId, imageUrls) {
    // ❌ Comment out or remove these lines to prevent quota issues
    /*
    const storageData = {
        images: imageUrls,
        timestamp: Date.now(),
        createdFrom: window.location.origin,
    };

    const storageKeys = [
        packageId,
        "whatsapp_" + packageId,
        "imgpkg_" + packageId,
    ];

    storageKeys.forEach((key) => {
        try {
            localStorage.setItem(key, JSON.stringify(storageData));
        } catch (error) {
            console.warn(`⚠️ Failed to store as ${key}:`, error);
        }
    });
    */

    // ✅ Keep this empty or just log
    console.log("📦 Package stored in Firestore, skipping localStorage backup");
    return;
  }
}

// HARD-CODED TELEGRAM TRANSLATIONS
// ============================================
const telegramText = {
  en: {
    greeting: "Hello friends,",
    closing: "Please help find. Share widely",
    thankYou: "Thank you for your assistance",
    sharedVia: "Shared via Connections Finder",
  },
  vi: {
    greeting: "Chào các bạn,",
    closing: "Vui lòng giúp tìm kiếm. Chia sẻ rộng rãi",
    thankYou: "Cảm ơn sự hỗ trợ của bạn",
    sharedVia: "Được chia sẻ qua Connections Finder",
  },
  zh: {
    greeting: "大家好，",
    closing: "请帮助寻找。广泛分享",
    thankYou: "感谢您的帮助",
    sharedVia: "通过 Connections Finder 分享",
  },
  es: {
    greeting: "Hola amigos,",
    closing: "Por favor ayude a encontrar. Comparta ampliamente",
    thankYou: "Gracias por su asistencia",
    sharedVia: "Compartido a través de Connections Finder",
  },
  hi: {
    greeting: "नमस्ते दोस्तों,",
    closing: "कृपया खोजने में मदद करें। व्यापक रूप से साझा करें",
    thankYou: "आपकी सहायता के लिए धन्यवाद",
    sharedVia: "Connections Finder के माध्यम से साझा किया गया",
  },
  ar: {
    greeting: "مرحبا أصدقاء،",
    closing: "يرجى المساعدة في العثور. شارك على نطاق واسع",
    thankYou: "شكرا لمساعدتكم",
    sharedVia: "تمت المشاركة عبر Connections Finder",
  },
};

// === ADD DEBUG FUNCTION RIGHT HERE ===
// === FIREBASE DEBUGGING FUNCTION ===
async function debugFirebaseStorage(packageId, imageUrls) {
  console.log("🐛 DEBUG: Starting Firebase storage check...");

  // Check if Firebase is available
  console.log("🐛 window.fb exists:", !!window.fb);
  console.log(
    "🐛 window.fb.firestore exists:",
    !!(window.fb && window.fb.firestore),
  );

  if (window.fb && window.fb.firestore) {
    try {
      console.log("🐛 Attempting to store in Firestore...");

      const firestoreData = {
        images: imageUrls,
        userId: ImageProvider.getUserId(),
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        isPublic: true,
        imageCount: imageUrls.length,
        userAgent: navigator.userAgent,
        source: "zalo_mobile_debug",
        debug: true,
      };

      // Try to store in Firestore
      await window.fb.firestore.addDoc(
        window.fb.firestore.collection("imagePackages"),
        { ...firestoreData, id: packageId },
      );

      console.log("🐛 SUCCESS: Stored in Firestore during debug");
      return true;
    } catch (error) {
      console.log("🐛 ERROR: Firestore storage failed:", error);
      console.log("🐛 Error details:", error.message, error.code, error.stack);
      return false;
    }
  } else {
    console.log("🐛 ERROR: Firebase not properly initialized");
    return false;
  }
}

// === UPDATED ENHANCED IMAGE PACKAGE STORAGE FOR MOBILE ===
// === HEAVILY DEBUGGED IMAGE PACKAGE STORAGE ===
async function ensureImagePackageStorage(imageUrls) {
  if (!imageUrls || imageUrls.length === 0) {
    console.log("❌ No images to package");
    return null;
  }

  console.log("📱 MOBILE DEBUG: Starting image package storage...");
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  console.log("📱 Device detection:", isMobile ? "MOBILE" : "DESKTOP");
  console.log("📱 UserAgent:", navigator.userAgent);

  // Generate package ID
  const packageId =
    "img_" + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
  console.log("📱 Generated package ID:", packageId);

  // 1. CRITICAL: ALWAYS STORE IN FIRESTORE FOR MOBILE
  let firestoreSuccess = false;
  if (window.fb && window.fb.firestore) {
    console.log("🔥 Firestore is available - attempting storage...");

    try {
      const firestoreData = {
        images: imageUrls,
        userId: ImageProvider.getUserId(),
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        isPublic: true,
        imageCount: imageUrls.length,
        userAgent: navigator.userAgent,
        source: "zalo_mobile",
        packageId: packageId, // Explicitly include packageId
        timestamp: Date.now(),
      };

      console.log("🔥 Firestore data prepared:", firestoreData);

      // Use the EXACT same method as WhatsApp/Twitter
      const docRef = await window.fb.firestore.addDoc(
        window.fb.firestore.collection("imagePackages"),
        firestoreData,
      );

      console.log(
        "🔥 SUCCESS: Firestore document created with ID:",
        docRef?.id,
      );
      firestoreSuccess = true;

      // Verify the storage worked
      console.log("🔥 Running Firestore verification...");
      await debugFirebaseStorage(packageId, imageUrls);
    } catch (error) {
      console.log("🔥 CRITICAL ERROR: Firestore storage failed completely");
      console.log("🔥 Error details:", error.message);
      console.log("🔥 Error code:", error.code);
      console.log("🔥 Error name:", error.name);

      // Try alternative Firestore method
      try {
        console.log("🔥 Attempting alternative Firestore method...");
        // Some Firebase versions use different methods
        if (window.fb.firestore.collection("imagePackages").add) {
          await window.fb.firestore.collection("imagePackages").add({
            images: imageUrls,
            id: packageId,
            createdAt: new Date(),
            mobile: true,
          });
          console.log("🔥 Alternative method succeeded");
          firestoreSuccess = true;
        }
      } catch (altError) {
        console.log("🔥 Alternative method also failed:", altError.message);
      }
    }
  } else {
    console.log("❌ FIREBASE NOT AVAILABLE - window.fb.firestore is missing");
    console.log("❌ Available window.fb:", window.fb);
  }

  // 2. Store in local storage as fallback
  console.log("💾 Storing in local storage as fallback...");
  const packageData = {
    images: imageUrls,
    timestamp: Date.now(),
    createdFrom: window.location.origin,
    userAgent: navigator.userAgent,
    storedInFirestore: firestoreSuccess,
    packageId: packageId,
  };

  try {
    localStorage.setItem(packageId, JSON.stringify(packageData));
    localStorage.setItem("mobile_" + packageId, JSON.stringify(packageData));
    localStorage.setItem("zalo_" + packageId, JSON.stringify(packageData));
    console.log("💾 Local storage successful");
  } catch (e) {
    console.log("💾 Local storage failed:", e.message);
  }

  // 3. Final package URL
  const packageUrl = `https://connectionsfinder.com/image-package.html?id=${packageId}`;

  console.log("📦 FINAL PACKAGE SUMMARY:");
  console.log("📦 Package URL:", packageUrl);
  console.log("📦 Firestore Success:", firestoreSuccess);
  console.log("📦 Is Mobile:", isMobile);
  console.log("📦 Image Count:", imageUrls.length);

  if (isMobile && !firestoreSuccess) {
    console.log(
      "🚨 MOBILE WARNING: Package may not work when shared via Zalo!",
    );
    console.log(
      "🚨 Firestore storage failed - images only available in original app",
    );
  }

  return packageUrl;
}

// === ADD IMAGE PACKAGE SYSTEM RIGHT HERE ===
// Image Package System - FINAL SOLUTION
function createImagePackage(imageUrls) {
  console.log("🔄 Creating image package with URLs:", imageUrls);

  if (!imageUrls || imageUrls.length === 0) {
    console.log("❌ No images to package");
    return null;
  }

  // For single image, just return the image URL
  if (imageUrls.length === 1) {
    return imageUrls[0];
  }

  try {
    // Generate unique package ID
    const packageId = "img_" + Date.now().toString(36);

    // Store in MULTIPLE locations
    const packageData = {
      images: imageUrls,
      timestamp: Date.now(),
    };

    const storageData = JSON.stringify(packageData);
    sessionStorage.setItem(packageId, storageData);
    localStorage.setItem(packageId, storageData);

    console.log("💾 Stored package with ID:", packageId);

    // Create URL with IP address (WhatsApp prefers this)
    const packageUrl = getImagePackageUrl(packageId);
    console.log("📦 Created package URL:", packageUrl);
    console.log("📦 Package URL length:", packageUrl.length);

    return packageUrl;
  } catch (error) {
    console.error("❌ Error creating image package:", error);
    return imageUrls[0];
  }
}

function getImagePackageUrl(packageId) {
  // SIMPLE FIX: Always use the correct production URL without /public/
  return `https://connectionsfinder.com/image-package.html?id=${packageId}`;
}

// Cleanup function (keep this)
function cleanupOldPackages() {
  const now = Date.now();
  const oneHourAgo = now - 60 * 60 * 1000; // 1 hour (shorter for testing)

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith("img")) {
      try {
        const data = JSON.parse(localStorage.getItem(key));
        if (data && data.timestamp && data.timestamp < oneHourAgo) {
          localStorage.removeItem(key);
          console.log("🧹 Cleaned up old package:", key);
        }
      } catch (e) {
        localStorage.removeItem(key);
      }
    }
  }
}

// Initialize cleanup
document.addEventListener("DOMContentLoaded", function () {
  cleanupOldPackages();
});

// === END OF IMAGE PACKAGE SYSTEM ===

// ===== LANGUAGE SAFETY INIT =====
if (!window._appLang) {
  window._appLang = localStorage.getItem("userLanguage") || "en";
}

// === UNIVERSAL EMAIL FUNCTION FOR ALL PLATFORMS ===
// === IMPROVED GMAIL FUNCTION WITH EMOJIS ===
function openGmail(subject, body, recipient = "") {
  console.log("Universal email function called");

  const isAppleDevice = /iPhone|iPad|iPod/i.test(navigator.userAgent);

  if (isAppleDevice) {
    // Apple devices: use mailto: with FULL formatting
    let mailtoUrl = `mailto:${recipient || ""}?`;
    if (subject) mailtoUrl += `subject=${encodeURIComponent(subject)}&`;
    if (body) mailtoUrl += `body=${encodeURIComponent(body)}`;

    console.log("Using mailto: on Apple device:", mailtoUrl);
    window.location.href = mailtoUrl;
  } else {
    // Android and desktop: use Gmail web WITH EMOJIS
    const params = new URLSearchParams();
    params.set("su", subject);

    // KEEP EMOJIS AND FORMATTING - only clean extra line breaks
    const cleanBody = body.replace(/\n{3,}/g, "\n\n"); // Keep emojis! 🎉

    params.set("body", cleanBody);
    if (recipient) params.set("to", recipient);

    const gmailUrl = `https://mail.google.com/mail/?view=cm&${params.toString()}`;
    console.log("Using Gmail web with emojis:", gmailUrl);
    window.open(gmailUrl, "_blank");
  }
}

// ===== EMAIL MODAL (Keep original content generation) =====
// ===== 1. ADD THESE HELPER FUNCTIONS FIRST =====
function escapeHtml(text) {
  return text?.replace(/</g, "&lt;").replace(/>/g, "&gt;") || "";
}

function showEmailShareModal(params = {}) {
  // 1. Destructure with safe defaults
  const {
    subject: inputSubject = TRANSLATION_PATCH?.defaultSubject?.[
      window._appLang
    ] || "Shared Report",
    body: inputBody = "No content provided",
    lang = window._appLang,
    showEmailInput = true,
    recipientEmail = "",
  } = params;

  // 2. Escape content
  const subject = escapeHtml(inputSubject);
  const body = escapeHtml(inputBody);
  const recipient = escapeHtml(recipientEmail);

  // ✅ ADD UNIVERSAL TIP TO EMAIL BODY HERE
  const universalEmailTip = {
    en: "\n\n📌 TIP: If images don't load, copy this link and paste into Chrome or Safari.",
    vi: "\n\n📌 MẸO: Nếu hình ảnh không tải, hãy sao chép liên kết này và dán vào Chrome hoặc Safari.",
    zh: "\n\n📌 提示：如果图片无法加载，请复制此链接并粘贴到Chrome或Safari浏览器中。",
    es: "\n\n📌 CONSEJO: Si las imágenes no cargan, copie este enlace y péguelo en Chrome o Safari.",
    hi: "\n\n📌 टिप: यदि छवियाँ लोड नहीं होती हैं, तो इस लिंक को कॉपी करें और Chrome या Safari में पेस्ट करें।",
    ar: "\n\n📌 تلميح: إذا لم يتم تحميل الصور، انسخ هذا الرابط والصقه في كروم أو سفاري۔",
  };

  const tipText = universalEmailTip[lang] || universalEmailTip.en;
  const enhancedBody = body + tipText;

  console.log(
    "📝 Universal tip added to email body:",
    tipText.substring(0, 30) + "...",
  );

  // 3. Create modal
  const modal = document.createElement("div");
  modal.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0,0,0,0.8); z-index: 10000; display: flex;
        justify-content: center; align-items: center;
    `;

  // 4. Build modal HTML with close button - USE enhancedBody HERE
  modal.innerHTML = `
    <div style="background: white; padding: 20px; border-radius: 8px; max-width: 90%; width: 500px; max-height: 90vh; overflow: auto; box-shadow: 0 4px 8px rgba(0,0,0,0.1); position: relative;">
        <!-- Close Button -->
        <button id="email-modal-close" style="position: absolute; top: 10px; right: 10px; background: none; border: none; font-size: 20px; cursor: pointer;">×</button>
        
        <h3 style="margin-top: 0; color: #333;">
            ${TRANSLATION_PATCH?.emailShareTitle?.[lang] || "Share via Email"}
        </h3>
        
        ${
          showEmailInput
            ? `
            <div style="margin-bottom: 15px;">
                <label style="display: block; margin-bottom: 5px; font-weight: bold; color: #555;">
                    ${TRANSLATION_PATCH?.fieldLabels?.emailAddress?.[lang] || "Recipient Email:"}
                </label>
                <input type="email" id="recipient-email" value="${recipient}"
                       style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;"
                       placeholder="${TRANSLATION_PATCH?.placeholders?.email?.[lang] || "email@example.com"}">
            </div>
        `
            : ""
        }
        
        <div style="margin-bottom: 15px;">
            <label style="display: block; margin-bottom: 5px; font-weight: bold; color: #555;">
                ${TRANSLATION_PATCH?.fieldLabels?.subject?.[lang] || "Subject:"}
            </label>
            <input type="text" id="email-subject" value="${subject}" 
                   style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
        </div>

        <div style="margin-bottom: 15px;">
            <label style="display: block; margin-bottom: 5px; font-weight: bold; color: #555;">
                ${TRANSLATION_PATCH?.fieldLabels?.message?.[lang] || "Message:"}
            </label>
            <textarea id="email-body" 
                      style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; min-height: 100px;"
                      readonly>${enhancedBody}</textarea>  <!-- USE enhancedBody HERE -->
        </div>

        <!-- ✅ YAHOO TIP - WITH TRANSLATIONS (this stays as is) -->
<div style="margin-bottom: 15px; padding: 8px; background: #f8f9fa; border-left: 4px solid #720E9E; font-size: 12px;">
    <strong>📧 Yahoo Users:</strong> 
    <span>${TRANSLATION_PATCH?.yahooDuplicateTip?.[lang] || "After sending, look for the 'Show images' button in your Yahoo inbox to view photos. If you receive duplicate emails, it's a Yahoo feature - you can safely ignore the extra copy."}</span>
</div>

        <div style="display: flex; justify-content: space-between; margin-top: 20px;">
            <button class="email-provider-btn" data-provider="gmail" style="flex: 1; padding: 10px; background: #D44638; color: white; border: none; border-radius: 4px; cursor: pointer;">
                Gmail
            </button>
            <button class="email-provider-btn" data-provider="outlook" style="flex: 1; padding: 10px; background: #0072C6; color: white; border: none; border-radius: 4px; cursor: pointer; margin: 0 10px;">
                Outlook
            </button>
            <button class="email-provider-btn" data-provider="yahoo" style="flex: 1; padding: 10px; background: #720E9E; color: white; border: none; border-radius: 4px; cursor: pointer;">
                Yahoo ⓘ
            </button>
        </div>
    </div>
`;

  // 5. Add to DOM
  document.body.appendChild(modal);

  // 6. Close button handler (NEW)
  document.getElementById("email-modal-close").addEventListener("click", () => {
    document.body.removeChild(modal);
  });

  // 7. Email provider handlers
  // === REPLACE THE EMAIL BUTTON HANDLER CODE ===
  function setupEmailButtonHandlers() {
    document.querySelectorAll(".email-provider-btn").forEach((btn) => {
      btn.addEventListener("click", function () {
        const getElement = (id) => document.getElementById(id) || { value: "" };
        const { value: subject } = getElement("email-subject");
        const { value: body } = getElement("email-body");
        const { value: recipient } = getElement("recipient-email");

        if (this.dataset.provider === "gmail") {
          openGmail(subject, body, recipient);
        } else if (this.dataset.provider === "outlook") {
          let finalBody = body;
          const recipient =
            document.getElementById("recipient-email")?.value || "";
          const subject = document.getElementById("email-subject")?.value || "";
          const lang = localStorage.getItem("userLanguage") || "en";

          // ✅ FIXED MOBILE DETECTION
          const isMobile = /iPhone|iPad|iPod|Android/i.test(
            navigator.userAgent,
          );

          if (isMobile) {
            console.log("📱 Mobile Outlook - using Outlook deep link");

            // Try Outlook deep link first
            const outlookDeepLink = `ms-outlook://compose?to=${encodeURIComponent(recipient)}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(finalBody)}`;

            // Fallback to mailto if Outlook not installed
            window.location.href = outlookDeepLink;

            // If Outlook not installed, this will fail silently, so also open mailto
            setTimeout(() => {
              const mailtoLink = `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(finalBody)}`;
              window.location.href = mailtoLink;
            }, 500);
          } else {
            console.log("💻 Desktop Outlook - using web interface");
            const outlookLink = `https://outlook.live.com/mail/0/deeplink/compose?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(finalBody)}${recipient ? "&to=" + encodeURIComponent(recipient) : ""}`;
            window.open(outlookLink, "_blank", "width=800,height=600");
          }
        } else if (this.dataset.provider === "yahoo") {
          // Get values
          let subject = document.getElementById("email-subject")?.value || "";
          let body = document.getElementById("email-body")?.value || "";
          // Add right after getting the body
          console.log("📝 Original body length:", body.length);
          console.log("📝 Body preview:", body.substring(0, 100) + "...");

          const recipient =
            document.getElementById("recipient-email")?.value || "";
          const lang = localStorage.getItem("userLanguage") || "en";

          // Create Yahoo mail URL
          const params = new URLSearchParams();
          params.set("subject", subject);
          params.set("body", body);
          if (recipient) params.set("to", recipient);

          // Open Yahoo mail
          window.open(
            `https://compose.mail.yahoo.com/?${params.toString()}`,
            "_blank",
            "width=800,height=600",
          );
        }
      });
    });
  }

  // Call this function after creating the email modal
  setupEmailButtonHandlers();

  // Add event listener for when email is entered
  const emailInput = document.getElementById("recipient-email");
  if (emailInput) {
    emailInput.addEventListener("change", function () {
      const recipient = this.value;

      // 🔥 SPECIAL HANDLING FOR OUTLOOK TO YAHOO RESHARE
      if (recipient && recipient.includes("yahoo.com")) {
        // Check if this is a reshare (you can detect this from context)
        const isReshare =
          window.location.hash.includes("reshare") ||
          document.querySelector(".reshare-active");

        if (isReshare) {
          // Show a special notice for Outlook users resharing to Yahoo
          const outlookToYahooNotice = document.getElementById(
            "outlook-yahoo-notice",
          );
          if (outlookToYahooNotice) {
            outlookToYahooNotice.style.display = "block";
          }
        }
      }
    });
  }

  // Update the Yahoo button handler for reshare scenarios
  // In your showEmailShareModal function, update the Yahoo button section:

  // First, remove any existing Yahoo button to prevent duplicates
  const existingYahooBtn = document.querySelector('[data-provider="yahoo"]');
  if (existingYahooBtn) {
    // Clone and replace to remove all listeners
    const newYahooBtn = existingYahooBtn.cloneNode(true);
    existingYahooBtn.parentNode.replaceChild(newYahooBtn, existingYahooBtn);
  }

  // Now add the handler to the fresh button
  const yahooBtn = document.querySelector('[data-provider="yahoo"]');
  if (yahooBtn) {
    // Use a flag to prevent multiple executions
    let isProcessing = false;

    yahooBtn.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();

      // 🔥 PREVENT DOUBLE CLICKS
      if (isProcessing) {
        console.log("⏳ Already processing a Yahoo email, please wait...");
        return;
      }
      isProcessing = true;

      const recipient = document.getElementById("recipient-email")?.value || "";
      const subject = document.getElementById("email-subject")?.value || "";
      const body = document.getElementById("email-body")?.value || "";

      // Reset the flag after a delay
      setTimeout(() => {
        isProcessing = false;
      }, 3000); // 3 second cooldown

      // 🔥 SPECIAL HANDLING: Outlook to Yahoo reshare
      if (recipient && recipient.includes("yahoo.com") && isReshareScenario()) {
        console.log("📧 Outlook to Yahoo reshare - using mailto");

        const mailtoLink = `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        window.location.href = mailtoLink;

        // Reset flag sooner for mailto
        setTimeout(() => {
          isProcessing = false;
        }, 1000);
      } else {
        console.log("📧 Normal Yahoo flow");

        const params = new URLSearchParams();
        params.set("subject", subject);
        params.set("body", body);
        if (recipient) params.set("to", recipient);

        const yahooWindow = window.open(
          `https://compose.mail.yahoo.com/?${params.toString()}`,
          "_blank",
          "width=800,height=600",
        );

        // Reset flag when window closes or after timeout
        const checkWindow = setInterval(() => {
          if (yahooWindow && yahooWindow.closed) {
            clearInterval(checkWindow);
            isProcessing = false;
            console.log("✅ Yahoo window closed, ready for next email");
          }
        }, 500);

        // Safety timeout
        setTimeout(() => {
          clearInterval(checkWindow);
          isProcessing = false;
        }, 30000); // 30 seconds max
      }
    });

    console.log("✅ Yahoo button handler installed (single only)");
  }
}

// Helper to detect if we're in reshare mode
function isReshareScenario() {
  return (
    window.location.hash.includes("reshare") ||
    document.querySelector(".reshare-active") !== null ||
    document.body.classList.contains("reshare-mode") ||
    document.querySelector('[data-reshare="true"]') !== null
  );
}

// ===== ENHANCED EMAIL MODAL CREATION =====
function createEmailModal() {
  // Only create if doesn't exist
  if (document.getElementById("email-share-modal")) return;

  const modalHTML = `
    <div id="email-share-modal" style="display:none;position:fixed;...">[...]</div>
  `;
  document.body.insertAdjacentHTML("beforeend", modalHTML);

  // Cancel button
  document.getElementById("email-cancel-btn")?.addEventListener("click", () => {
    document.getElementById("email-share-modal").style.display = "none";
  });

  // Send button
  document.getElementById("email-send-btn")?.addEventListener("click", () => {
    const subject = document.getElementById("email-subject-input").value;
    const body = document.getElementById("email-body-input").value;
    window.open(
      `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(
        body,
      )}`,
    );
  });
}

function handleYahooShare(subject, body, recipient) {
  // Check if the email has image links
  const hasImages =
    body.includes("http") &&
    (body.includes(".jpg") ||
      body.includes(".png") ||
      body.includes(".jpeg") ||
      body.includes("storage.googleapis.com"));

  if (hasImages) {
    // Show warning about Yahoo image blocking
    const userConfirmed = confirm(
      "⚠️ YAHOO MAIL NOTICE:\n\n" +
        "Yahoo blocks automatic image display for security reasons.\n\n" +
        "To view images:\n" +
        "1. After sending, open the email in Yahoo\n" +
        "2. Click 'Show images' or 'Display images below' button\n" +
        "3. Images will then appear\n\n" +
        "Continue to Yahoo Mail?",
    );

    if (!userConfirmed) return;
  }

  // Prepare Yahoo-friendly email body
  let yahooBody = body;

  // Add instruction note at the top
  if (hasImages) {
    yahooBody =
      "📸 IMPORTANT: To view images, click 'Show Images' or 'Display Images' in your Yahoo toolbar.\n\n---\n\n" +
      body;
  }

  // Create Yahoo compose URL
  const params = new URLSearchParams();
  params.set("subject", subject);
  params.set("body", yahooBody);
  if (recipient) params.set("to", recipient);

  // Open Yahoo compose window
  window.open(
    `https://compose.mail.yahoo.com/?${params.toString()}`,
    "_blank",
    "width=800,height=600",
  );
}

function safeTranslate(key, fallback = "") {
  const lang = localStorage.getItem("userLanguage") || "en";
  try {
    return (
      TRANSLATION_PATCH[key]?.[lang] || TRANSLATION_PATCH[key]?.en || fallback
    );
  } catch {
    return fallback;
  }
}
// Add this at the TOP of sharing.js
let lastAlertTime = 0;

function showCopiedAlert() {
  const now = Date.now();
  if (now - lastAlertTime < 3000) return; // Prevent repeats for 3 seconds

  const translations = {
    en: "Copied to clipboard",
    vi: "Đã sao chép vào bộ nhớ tạm",
    ar: "تم النسخ إلى الحافظة",
    es: "Copiado al portapapeles",
    hi: "क्लिपबोर्ड पर कॉपी किया गया",
    zh: "已复制到剪贴板",
  };

  const lang = localStorage.getItem("userLanguage") || "en";
  alert(translations[lang]); // Use simple alert to avoid CSS issues

  lastAlertTime = now;
}

function getTranslatedShareText(report, platform) {
  const lang = localStorage.getItem("userLanguage") || "en";
  const t = TRANSLATION_PATCH; // Shortcut

  const baseText = [
    `${t.greetings[lang]}\n`,
    `${t.fieldLabels.title[lang]} ${report.title}`,
    `${t.fieldLabels.description[lang]} ${
      report.description?.substring(0, 80) || ""
    }`,
    `${t.fieldLabels.location[lang]} ${report.location}${
      report.coordinates ? ` (${report.coordinates})` : ""
    }`,
    report.contact ? `${t.fieldLabels.contact[lang]} ${report.contact}` : "",
    report.imageUrl ? t.fieldLabels.image[lang] : "",
    t.closingLines[report.type]?.[lang] || "",
    t.closingLines.thank_you[lang],
  ]
    .filter(Boolean)
    .join("\n");

  switch (platform) {
    case "twitter":
      return `${baseText}\n${window.location.href}`;
    case "facebook":
      return `${baseText}\n\n${t.reportSharedVia[lang]} ${window.location.href}`;
    case "email":
      return `${baseText}\n\n--\n${t.reportSharedVia[lang]} MissingLostAndFoundApp`;
    default:
      return baseText;
  }
}

// Helper function to get user-specific storage key
function getUserReportsKey() {
  const user = window.fb.auth?.currentUser;
  const userId = user ? user.uid : null;
  if (!userId) {
    console.log("No authenticated user");
    return null;
  }
  return `savedReports_${userId}`;
}

// Make it globally accessible
window.getUserReportsKey = getUserReportsKey;

let lastResharedReport = null;
// In sharing.js (FIRST LINE)
console.log("[1] sharing.js loaded");
/* ====== Saved Reports Core Functionality ====== */

// ============================================
// IIFE FOR RENDER SAVED REPORTS
// ============================================

(function () {
  window.renderSavedReports = function () {
    try {
      const lang =
        window.currentLanguage || localStorage.getItem("appLanguage") || "en";
      console.log("Rendering reports in:", lang);

      const container = document.getElementById("saved-reports-container");
      if (!container) {
        console.error("Container not found");
        return;
      }

      const user = window.fb.auth?.currentUser;
      if (!user) {
        container.innerHTML = `<p class="no-reports">Please sign in to view your saved reports</p>`;
        return;
      }

      const storageKey = window.getUserReportsKey();
      if (!storageKey) {
        container.innerHTML = `<p class="no-reports">Please sign in to view your saved reports</p>`;
        return;
      }

      let savedReports = [];
      try {
        savedReports = JSON.parse(localStorage.getItem(storageKey) || "[]");
      } catch (e) {
        console.error("Failed to parse saved reports:", e);
      }

      const noDescText =
        TRANSLATION_PATCH.emptyDescription?.[lang] || "No description";

      if (savedReports.length === 0) {
        container.innerHTML = `<p class="no-reports">${
          TRANSLATION_PATCH.messages?.noSavedReports?.[lang] ||
          "No saved reports yet"
        }</p>`;
        return;
      }

      savedReports.sort((a, b) => {
        const timeA = parseInt(a.timestamp) || 0;
        const timeB = parseInt(b.timestamp) || 0;
        return timeB - timeA;
      });

      const reshareText =
        TRANSLATION_PATCH.buttons?.reshare?.[lang] || "Reshare";
      const deleteText = TRANSLATION_PATCH.buttons?.delete?.[lang] || "Delete";

      function escapeHtml(text) {
        if (!text) return "";
        const div = document.createElement("div");
        div.textContent = text;
        return div.innerHTML;
      }

      container.innerHTML = savedReports
        .map((report, index) => {
          // Truncate description if too long (optional)
          const maxDescLength = 100;
          const truncatedDesc =
            report.description && report.description.length > maxDescLength
              ? report.description.substring(0, maxDescLength) + "..."
              : report.description || "";

          // Truncate contact for privacy (optional)
          const maxContactLength = 50;
          const truncatedContact =
            report.contact && report.contact.length > maxContactLength
              ? report.contact.substring(0, maxContactLength) + "..."
              : report.contact || "";

          // Build image link
          // Build image link (without inline onclick)
          // Inside renderSavedReports, update the image link generation:
          const lang =
            window.currentLanguage ||
            localStorage.getItem("appLanguage") ||
            "en";

          // Translations for image link text
          const imageLinkTranslations = {
            single: {
              en: "1 image available",
              vi: "1 hình ảnh có sẵn",
              zh: "1张图片可用",
              es: "1 imagen disponible",
              hi: "1 छवि उपलब्ध है",
              ar: "صورة واحدة متاحة",
            },
            multiple: {
              en: "{count} images available",
              vi: "{count} hình ảnh có sẵn",
              zh: "{count}张图片可用",
              es: "{count} imágenes disponibles",
              hi: "{count} छवियाँ उपलब्ध हैं",
              ar: "{count} صور متاحة",
            },
          };

          let imageLinkHtml = "";
          if (report.imageUrls && report.imageUrls.length > 0) {
            const imageCount = report.imageUrls.length;
            let imageLinkText;
            if (imageCount === 1) {
              imageLinkText =
                imageLinkTranslations.single[lang] ||
                imageLinkTranslations.single.en;
            } else {
              imageLinkText = (
                imageLinkTranslations.multiple[lang] ||
                imageLinkTranslations.multiple.en
              ).replace("{count}", imageCount);
            }
            imageLinkHtml = `<div class="report-images-link">
        <a href="#" class="image-link" data-index="${index}" data-action="view-images">
            📸 ${imageLinkText}
        </a>
    </div>`;
          } else if (report.imageUrl) {
            imageLinkHtml = `<div class="report-images-link">
        <a href="#" class="image-link" data-index="${index}" data-action="view-images">
            📸 ${imageLinkTranslations.single[lang] || imageLinkTranslations.single.en}
        </a>
    </div>`;
          }

          // Build location with coordinates
          let locationHtml = "";
          if (report.location) {
            locationHtml = `<div class="report-location">📍 ${escapeHtml(report.location)}`;
            if (report.coordinates) {
              locationHtml += ` <span class="report-coordinates">(${escapeHtml(report.coordinates)})</span>`;
            }
            locationHtml += `</div>`;
          }

          // Build contact if exists
          let contactHtml = "";
          if (report.contact) {
            contactHtml = `<div class="report-contact">📞 ${escapeHtml(truncatedContact)}</div>`;
          }

          // Format date
          const formattedDate = new Date(
            parseInt(report.timestamp) || Date.now(),
          ).toLocaleString();

          return `
        <div class="saved-report" data-id="${report.timestamp}" data-index="${index}">
            ${report.title && report.title !== "Report" ? `<h4 class="report-title">${escapeHtml(report.title)}</h4>` : ""}
            ${truncatedDesc ? `<p class="report-description">${escapeHtml(truncatedDesc)}</p>` : ""}
            ${locationHtml}
            ${contactHtml}
            ${imageLinkHtml}
            <div class="report-meta">
                <small class="report-date">📅 ${formattedDate}</small>
            </div>
            <div class="report-actions">
                <button class="reshare-btn" data-index="${index}" data-id="${report.timestamp}">${reshareText}</button>
                <button class="delete-btn" data-index="${index}" data-id="${report.timestamp}">${deleteText}</button>
            </div>
        </div>
    `;
        })
        .join("");

      attachSavedReportEventListeners();
    } catch (error) {
      console.error("Render failed:", error);
    }
  };

  function setupImageLinkHandlers() {
    const container = document.getElementById("saved-reports-container");
    if (!container) return;

    // Remove existing listener if any to prevent duplicates
    if (container._imageLinkHandler) {
      container.removeEventListener("click", container._imageLinkHandler);
    }

    // Create and store the handler
    const handler = function (e) {
      const imageLink = e.target.closest(".image-link");
      if (!imageLink) return;

      e.preventDefault();
      e.stopPropagation();

      const index = imageLink.dataset.index;
      if (index !== undefined) {
        openImagesFromSaved(index);
      }
    };

    container._imageLinkHandler = handler;
    container.addEventListener("click", handler);
  }

  function openImagesFromSaved(index) {
    const user = window.fb.auth?.currentUser;
    if (!user) {
      alert("Please sign in to view images");
      return;
    }

    const storageKey = window.getUserReportsKey();
    if (!storageKey) return;

    const savedReports = JSON.parse(localStorage.getItem(storageKey) || "[]");
    const report = savedReports[parseInt(index)];

    if (!report) {
      alert("Report not found");
      return;
    }

    const imageUrls =
      report.imageUrls || (report.imageUrl ? [report.imageUrl] : []);

    if (imageUrls.length === 0) {
      alert("No images available for this report");
      return;
    }

    if (imageUrls.length === 1) {
      window.open(imageUrls[0], "_blank");
    } else {
      // Create a simple HTML gallery
      showImageGallery(imageUrls);
    }
  }

  function showImageGallery(imageUrls) {
    const lang = localStorage.getItem("userLanguage") || "en";

    // Translations for gallery
    const translations = {
      title: {
        en: "Images",
        vi: "Hình ảnh",
        zh: "图片",
        es: "Imágenes",
        hi: "छवियाँ",
        ar: "الصور",
      },
      tip: {
        en: "Tip: Right-click on any image to save it",
        vi: "Mẹo: Nhấp chuột phải vào bất kỳ hình ảnh nào để lưu",
        zh: "提示：右键单击任何图像以保存",
        es: "Consejo: Haga clic derecho en cualquier imagen para guardarla",
        hi: "टिप: किसी भी छवि को सहेजने के लिए उस पर राइट-क्लिक करें",
        ar: "تلميح: انقر بزر الماوس الأيمن على أي صورة لحفظها",
      },
      openInNewTab: {
        en: "Open Image",
        vi: "Mở hình ảnh",
        zh: "打开图片",
        es: "Abrir imagen",
        hi: "छवि खोलें",
        ar: "فتح الصورة",
      },
    };

    const titleText = translations.title[lang] || translations.title.en;
    const tipText = translations.tip[lang] || translations.tip.en;
    const openText =
      translations.openInNewTab[lang] || translations.openInNewTab.en;

    const galleryWindow = window.open("", "_blank");
    if (!galleryWindow) {
      alert("Please allow popups to view images");
      return;
    }

    const imagesHtml = imageUrls
      .map(
        (url, i) => `
        <div style="margin-bottom: 25px; text-align: center;">
            <img src="${url}" style="max-width: 100%; max-height: 450px; border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            <p style="margin-top: 10px;">
                <a href="${url}" target="_blank" style="color: #4267B2; text-decoration: none;">
                    📸 ${openText} ${i + 1}
                </a>
            </p>
        </div>
    `,
      )
      .join("");

    galleryWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>${titleText} (${imageUrls.length})</title>
            <meta charset="UTF-8">
            <style>
                body { 
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
                    padding: 20px; 
                    max-width: 900px; 
                    margin: 0 auto; 
                    background: #f5f5f5;
                }
                h1 { 
                    color: #333; 
                    text-align: center;
                    margin-bottom: 20px;
                }
                .images-container { 
                    background: white; 
                    border-radius: 12px; 
                    padding: 20px; 
                    box-shadow: 0 2px 12px rgba(0,0,0,0.1);
                }
                img { 
                    border-radius: 8px; 
                    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                }
                a { 
                    color: #4267B2; 
                    text-decoration: none;
                    font-weight: 500;
                }
                a:hover { 
                    text-decoration: underline;
                }
                .tip {
                    text-align: center;
                    margin-top: 20px;
                    color: #666;
                    font-size: 13px;
                }
            </style>
        </head>
        <body>
            <h1>📸 ${titleText} (${imageUrls.length})</h1>
            <div class="images-container">
                ${imagesHtml}
            </div>
            <div class="tip">
                💡 ${tipText}
            </div>
        </body>
        </html>
    `);
    galleryWindow.document.close();
  }

  // ============================================
  // MODAL FUNCTIONS FOR SAVED REPORTS
  // ============================================

  function showCopiedAlert() {
    const lang = localStorage.getItem("userLanguage") || "en";
    const messages = {
      en: "✅ Copied to clipboard!",
      vi: "✅ Đã sao chép!",
      zh: "✅ 已复制！",
      es: "✅ ¡Copiado!",
      hi: "✅ कॉपी किया गया!",
      ar: "✅ تم النسخ!",
    };
    alert(messages[lang] || messages.en);
  }

  function showFacebookShareModalForSaved(report) {
    const lang = localStorage.getItem("userLanguage") || "en";
    const message = report.message || buildFacebookMessage(report, lang);

    const imagesToShare = report.imageUrls || [];

    // Update meta tags
    function updateMetaTagsForFacebook() {
      if (imagesToShare.length === 0) return;
      ImageProvider.getImagesForPlatform(imagesToShare, "facebook")
        .then((imageResult) => {
          const targetUrl = imageResult.url || imagesToShare[0];
          let ogImageTag = document.querySelector('meta[property="og:image"]');
          if (!ogImageTag) {
            ogImageTag = document.createElement("meta");
            ogImageTag.setAttribute("property", "og:image");
            document.head.appendChild(ogImageTag);
          }
          ogImageTag.setAttribute("content", targetUrl);
        })
        .catch((error) => console.error("Failed to update meta tags:", error));
    }
    updateMetaTagsForFacebook();
    setTimeout(updateMetaTagsForFacebook, 100);

    const modal = document.createElement("div");
    modal.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.8); z-index: 10000; display: flex;
            justify-content: center; align-items: center;
        `;

    modal.innerHTML = `
            <div style="background: white; padding: 20px; border-radius: 8px;
                max-width: 90%; width: 500px; max-height: 90vh; overflow: auto;">
                <h3 style="margin-top: 0;">${TRANSLATION_PATCH.facebookShare?.title?.[lang] || "Share on Facebook"}</h3>
                <p>${TRANSLATION_PATCH.facebookShare?.instructions?.[lang] || "Copy the message below and paste on Facebook:"}</p>
                <textarea id="fb-report" style="width: 100%; height: 200px; padding: 8px; margin: 10px 0;
                    border: 1px solid #ddd; border-radius: 4px;">${message}</textarea>
                <div style="display: flex; gap: 10px;">
                    <button id="copy-fb" style="padding: 8px 12px; background: #4267B2; color: white;
                        border: none; border-radius: 4px; flex-grow: 1;">${TRANSLATION_PATCH.facebookShare?.buttons?.copy?.[lang] || "Copy"}</button>
                    <a href="https://www.facebook.com" target="_blank" style="padding: 8px 12px;
                        background: #4267B2; color: white; border-radius: 4px; text-decoration: none;
                        flex-grow: 1; text-align: center;">${TRANSLATION_PATCH.facebookShare?.buttons?.open?.[lang] || "Open Facebook"}</a>
                </div>
                <button id="close-fb" style="padding: 8px 12px; margin-top: 10px; width: 100%;
                    background: #f1f1f1; border: none; border-radius: 4px;">${TRANSLATION_PATCH.facebookShare?.buttons?.close?.[lang] || "Close"}</button>
            </div>
        `;

    document.body.appendChild(modal);

    document.getElementById("copy-fb")?.addEventListener("click", () => {
      const textarea = document.getElementById("fb-report");
      textarea.select();
      document.execCommand("copy");
      showCopiedAlert();
    });

    document.getElementById("close-fb")?.addEventListener("click", () => {
      document.body.removeChild(modal);
    });
  }

  async function buildFacebookMessage(report, lang) {
    const t = TRANSLATION_PATCH;

    // Get actual image package URL from ImageProvider
    let imagePart = "";
    if (report.imageUrls && report.imageUrls.length > 0) {
      try {
        const imageResult = await ImageProvider.getImagesForPlatform(
          report.imageUrls,
          "facebook",
        );
        if (imageResult.url) {
          imagePart = `\n🖼️ ${t.fieldLabels?.images?.[lang] || "Images"} (${report.imageUrls.length}): ${imageResult.url}`;
        }
      } catch (error) {
        console.error("Failed to get image package:", error);
        // Fallback to first image
        imagePart = `\n🖼️ ${t.fieldLabels?.image?.[lang] || "Image"}: ${report.imageUrls[0]}`;
      }
    } else if (report.imageUrl) {
      imagePart = `\n🖼️ ${t.fieldLabels?.image?.[lang] || "Image"}: ${report.imageUrl}`;
    }

    // Build location with coordinates
    let locationPart = "";
    if (report.location) {
      locationPart = `\n\n📍 ${t.fieldLabels?.location?.[lang] || "Location"}: ${report.location}`;
      if (report.coordinates) {
        locationPart += ` (${report.coordinates})`;
      }
    }

    return [
      `${t.greetings?.[lang] || "Hello"}`,
      report.title && `\n\n📌 ${report.title}`,
      report.description &&
        `\n\n📝 ${t.fieldLabels?.description?.[lang] || "Description"}: ${report.description}`,
      locationPart,
      report.contact &&
        `\n📞 ${t.fieldLabels?.contact?.[lang] || "Contact"}: ${report.contact}`,
      imagePart,
      `\n\n${t.closingLines?.[report.type]?.[lang] || "Thank you for your help"}`,
      `\n❤️ ${t.closingLines?.thank_you?.[lang] || "Thank you"}`,
      `\n\n${t.reportSharedVia?.[lang] || "Report shared via"} ${window.location.href}`,
    ]
      .filter(Boolean)
      .join("");
  }

  // Facebook Notice Translations
  const FACEBOOK_NOTICE_TRANSLATIONS = {
    en: {
      title: "Facebook Sharing Tip",
      message:
        "After clicking Share, Facebook will open in a new tab. If you see a spinning circle, don't worry! Just wait a moment or click on the Facebook tab - your post will be ready there. This is normal and your content is being prepared.",
      button: "Don't show this again",
    },
    vi: {
      title: "Mẹo Chia Sẻ Facebook",
      message:
        "Sau khi nhấp Chia sẻ, Facebook sẽ mở trong tab mới. Nếu bạn thấy vòng tròn xoay, đừng lo lắng! Chỉ cần chờ một chút hoặc nhấp vào tab Facebook - bài đăng của bạn sẽ sẵn sàng ở đó. Điều này bình thường và nội dung của bạn đang được chuẩn bị.",
      button: "Không hiển thị lại",
    },
    zh: {
      title: "Facebook分享提示",
      message:
        "点击分享后，Facebook将在新标签页中打开。如果您看到旋转的圆圈，请不要担心！只需稍等片刻或点击Facebook标签 - 您的帖子将在那里准备就绪。这是正常现象，您的内容正在准备中。",
      button: "不再显示",
    },
    es: {
      title: "Consejo para Compartir en Facebook",
      message:
        "Después de hacer clic en Compartir, Facebook se abrirá en una nueva pestaña. Si ves un círculo giratorio, ¡no te preocupes! Solo espera un momento o haz clic en la pestaña de Facebook: tu publicación estará lista allí. Esto es normal y tu contenido se está preparando.",
      button: "No volver a mostrar",
    },
    hi: {
      title: "फेसबुक शेयरिंग टिप",
      message:
        "शेयर पर क्लिक करने के बाद, फेसबुक एक नए टैब में खुलेगा। यदि आपको एक घूमता हुआ वृत्त दिखाई देता है, तो चिंता न करें! बस एक क्षण प्रतीक्षा करें या फेसबुक टैब पर क्लिक करें - आपकी पोस्ट वहां तैयार होगी। यह सामान्य है और आपकी सामग्री तैयार की जा रही है।",
      button: "फिर से न दिखाएं",
    },
    ar: {
      title: "نصائح المشاركة على فيسبوك",
      message:
        "بعد النقر على مشاركة، سيتم فتح فيسبوك في علامة تبويب جديدة. إذا رأيت دائرة دوارة، لا تقلق! فقط انتظر لحظة أو انقر على علامة تبويب فيسبوك - سيكون منشورك جاهزًا هناك. هذا أمر طبيعي ويتم إعداد المحتوى الخاص بك.",
      button: "لا تظهر مرة أخرى",
    },
  };

  function showFacebookSharingNotice() {
    const hasDismissed =
      localStorage.getItem("facebookNoticeDismissed") === "true";
    if (hasDismissed) return;

    const lang = localStorage.getItem("userLanguage") || "en";
    const translations =
      FACEBOOK_NOTICE_TRANSLATIONS[lang] || FACEBOOK_NOTICE_TRANSLATIONS.en;

    const overlay = document.createElement("div");
    overlay.id = "facebook-notice-overlay";
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.5);
        z-index: 9999;
    `;

    const popup = document.createElement("div");
    popup.id = "facebook-sharing-notice";
    popup.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        padding: 25px;
        border-radius: 12px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        z-index: 10000;
        max-width: 500px;
        width: 90%;
        font-family: Arial, sans-serif;
        border-left: 5px solid #4267B2;
    `;

    popup.innerHTML = `
        <div style="margin-bottom: 20px;">
            <div style="display: flex; align-items: center; margin-bottom: 15px;">
                <div style="background: #4267B2; color: white; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 15px;">
                    <i class="fab fa-facebook-f"></i>
                </div>
                <h2 style="margin: 0; color: #333; font-size: 20px;">${translations.title}</h2>
            </div>
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">${translations.message}</p>
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center;">
            <label style="display: flex; align-items: center; color: #666; font-size: 14px;">
                <input type="checkbox" id="dont-show-again" style="margin-right: 8px;">
                ${translations.button}
            </label>
            <button id="close-facebook-notice" style="background: #4267B2; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-weight: bold;">
                OK
            </button>
        </div>
    `;

    document.body.appendChild(overlay);
    document.body.appendChild(popup);

    const closeNotice = () => {
      const dontShowAgain = document.getElementById("dont-show-again").checked;
      if (dontShowAgain) {
        localStorage.setItem("facebookNoticeDismissed", "true");
      }
      document.body.removeChild(popup);
      document.body.removeChild(overlay);
    };

    document
      .getElementById("close-facebook-notice")
      ?.addEventListener("click", closeNotice);
    overlay.addEventListener("click", closeNotice);
  }

  function showNoticeBeforeFacebookShare() {
    if (!localStorage.getItem("facebookNoticeDismissed")) {
      setTimeout(() => {
        showFacebookSharingNotice();
      }, 500);
    }
  }

  function getYahooTipTitle(lang) {
    const titles = {
      en: "Yahoo Users:",
      vi: "Người dùng Yahoo:",
      zh: "雅虎用户：",
      es: "Usuarios de Yahoo:",
      hi: "याहू उपयोगकर्ता:",
      ar: "مستخدمو ياهو:",
    };
    return titles[lang] || titles.en;
  }

  function getYahooTipMessage(lang) {
    const messages = {
      en: "After sending, look for the 'Show images' button in your Yahoo inbox to view photos. If you receive duplicate emails, it's a Yahoo feature - you can safely ignore the extra copy.",
      vi: "Sau khi gửi, hãy tìm nút 'Hiển thị hình ảnh' trong hộp thư Yahoo để xem ảnh. Nếu bạn nhận được email trùng lặp, đó là tính năng của Yahoo - bạn có thể bỏ qua bản sao thêm một cách an toàn.",
      zh: "发送后，请在 Yahoo 收件箱中查找“显示图片”按钮以查看照片。如果您收到重复的电子邮件，这是 Yahoo 的功能 - 您可以安全地忽略额外的副本。",
      es: "Después de enviar, busque el botón 'Mostrar imágenes' en su bandeja de entrada de Yahoo para ver las fotos. Si recibe correos electrónicos duplicados, es una función de Yahoo; puede ignorar la copia adicional de manera segura.",
      hi: "भेजने के बाद, फ़ोटो देखने के लिए अपने Yahoo इनबॉक्स में 'Show images' बटन देखें। यदि आपको डुप्लिकेट ईमेल प्राप्त होते हैं, तो यह Yahoo की एक सुविधा है - आप अतिरिक्त प्रति को सुरक्षित रूप से अनदेखा कर सकते हैं।",
      ar: "بعد الإرسال، ابحث عن زر 'عرض الصور' في صندوق الوارد Yahoo لمشاهدة الصور. إذا تلقيت رسائل بريد إلكتروني مكررة، فهذه ميزة من Yahoo - يمكنك تجاهل النسخة الإضافية بأمان.",
    };
    return messages[lang] || messages.en;
  }

  function showEmailShareModalForSaved(report, lang) {
    const subject = report.title || "Shared Report";
    const body = report.body || "";

    // Add universal email tip
    // ✅ ADD UNIVERSAL TIP TO EMAIL BODY HERE
    const universalEmailTip = {
      en: "\n\n📌 TIP: If images don't load, copy this link and paste into Chrome or Safari.",
      vi: "\n\n📌 MẸO: Nếu hình ảnh không tải, hãy sao chép liên kết này và dán vào Chrome hoặc Safari.",
      zh: "\n\n📌 提示：如果图片无法加载，请复制此链接并粘贴到Chrome或Safari浏览器中。",
      es: "\n\n📌 CONSEJO: Si las imágenes no cargan, copie este enlace y péguelo en Chrome o Safari.",
      hi: "\n\n📌 टिप: यदि छवियाँ लोड नहीं होती हैं, तो इस लिंक को कॉपी करें और Chrome या Safari में पेस्ट करें।",
      ar: "\n\n📌 تلميح: إذا لم يتم تحميل الصور، انسخ هذا الرابط والصقه في كروم أو سفاري۔",
    };

    const tipText = universalEmailTip[lang] || universalEmailTip.en;
    const enhancedBody = body + tipText;

    // Close any existing modal
    const existingModal = document.getElementById("email-share-modal-saved");
    if (existingModal) existingModal.remove();

    const modal = document.createElement("div");
    modal.id = "email-share-modal-saved";
    modal.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0,0,0,0.8); z-index: 10000; display: flex;
        justify-content: center; align-items: center;
    `;

    // Add this div right before the button group (around line where buttons are)
    modal.innerHTML = `
    <div style="background: white; padding: 20px; border-radius: 8px; max-width: 90%; width: 500px; max-height: 90vh; overflow: auto; position: relative;">
        <button id="email-modal-close" style="position: absolute; top: 10px; right: 10px; background: none; border: none; font-size: 24px; cursor: pointer; color: #666;">&times;</button>
        <h3 style="margin-top: 0;">${TRANSLATION_PATCH?.emailShareTitle?.[lang] || "Share via Email"}</h3>
        <div style="margin-bottom: 15px;">
            <label>${TRANSLATION_PATCH?.fieldLabels?.emailAddress?.[lang] || "Recipient Email:"}</label>
            <input type="email" id="recipient-email" style="width: 100%; padding: 8px; margin-top: 5px; border: 1px solid #ddd; border-radius: 4px;">
        </div>
        <div style="margin-bottom: 15px;">
            <label>${TRANSLATION_PATCH?.fieldLabels?.subject?.[lang] || "Subject:"}</label>
            <input type="text" id="email-subject" value="${escapeHtml(subject)}" style="width: 100%; padding: 8px; margin-top: 5px; border: 1px solid #ddd; border-radius: 4px;">
        </div>
        <div style="margin-bottom: 15px;">
            <label>${TRANSLATION_PATCH?.fieldLabels?.message?.[lang] || "Message:"}</label>
            <textarea id="email-body" style="width: 100%; height: 200px; padding: 8px; margin-top: 5px; border: 1px solid #ddd; border-radius: 4px; font-family: monospace;">${escapeHtml(enhancedBody)}</textarea>
        </div>
        
        <!-- ✅ ADD THE YAHOO TIP HERE -->
        <div style="margin-bottom: 15px; padding: 10px; background: #f8f9fa; border-left: 4px solid #720E9E; border-radius: 4px; font-size: 13px;">
            <strong>📧 ${getYahooTipTitle(lang)}</strong>
            <span>${getYahooTipMessage(lang)}</span>
        </div>
        
        <div style="display: flex; gap: 10px; margin-top: 10px;">
            <button id="email-send-gmail" style="flex:1; padding: 10px; background: #D44638; color: white; border: none; border-radius: 4px; cursor: pointer;">Gmail</button>
            <button id="email-send-outlook" style="flex:1; padding: 10px; background: #0072C6; color: white; border: none; border-radius: 4px; cursor: pointer;">Outlook</button>
            <button id="email-send-yahoo" style="flex:1; padding: 10px; background: #720E9E; color: white; border: none; border-radius: 4px; cursor: pointer;">Yahoo</button>
        </div>
        <button id="email-cancel" style="width: 100%; padding: 10px; margin-top: 10px; background: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer;">${TRANSLATION_PATCH?.buttons?.close?.[lang] || "Close"}</button>
    </div>
`;

    document.body.appendChild(modal);

    const closeModal = () => {
      const modalElement = document.getElementById("email-share-modal-saved");
      if (modalElement) modalElement.remove();
    };

    const getCurrentValues = () => ({
      to: document.getElementById("recipient-email")?.value || "",
      subject: document.getElementById("email-subject")?.value || "",
      body: document.getElementById("email-body")?.value || "",
    });

    // Close buttons
    document
      .getElementById("email-modal-close")
      ?.addEventListener("click", closeModal);
    document
      .getElementById("email-cancel")
      ?.addEventListener("click", closeModal);

    // Gmail button - mobile friendly
    document
      .getElementById("email-send-gmail")
      ?.addEventListener("click", () => {
        const { to, subject, body } = getCurrentValues();
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

        if (isMobile) {
          window.location.href = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        } else {
          window.open(
            `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(to)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`,
            "_blank",
          );
        }
      });

    // Outlook button - with Outlook deep link for mobile
    const outlookBtn = document.getElementById("email-send-outlook");
    if (outlookBtn) {
      outlookBtn.addEventListener("click", () => {
        const { to, subject, body } = getCurrentValues();
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

        if (isMobile) {
          // Use Outlook deep link protocol
          const outlookDeepLink = `ms-outlook://compose?to=${encodeURIComponent(to)}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
          console.log("Opening Outlook deep link:", outlookDeepLink);
          window.location.href = outlookDeepLink;

          // Fallback to mailto if Outlook not installed
          setTimeout(() => {
            if (document.hasFocus()) {
              console.log("Outlook not installed, falling back to mailto");
              window.location.href = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
            }
          }, 500);
        } else {
          // Desktop: open Outlook web
          window.open(
            `https://outlook.live.com/mail/0/deeplink/compose?to=${encodeURIComponent(to)}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`,
            "_blank",
          );
        }
      });
    }

    // Yahoo button
    document
      .getElementById("email-send-yahoo")
      ?.addEventListener("click", () => {
        const { to, subject, body } = getCurrentValues();
        window.open(
          `https://compose.mail.yahoo.com/?to=${encodeURIComponent(to)}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`,
          "_blank",
        );
      });
  }

  async function buildEmailBody(report, lang) {
    const t = TRANSLATION_PATCH;

    // Images - Use the image package for a short, clean link
    let imagePart = "";
    if (report.imageUrls && report.imageUrls.length > 0) {
      try {
        const imageResult = await ImageProvider.getImagesForPlatform(
          report.imageUrls,
          "email",
        );
        if (imageResult && imageResult.url) {
          imagePart = `\n\n📸 ${t.fieldLabels?.images?.[lang] || "Images"} (${report.imageUrls.length}): ${imageResult.url}`;
        } else {
          // Fallback: list URLs
          const urls = report.imageUrls.join("\n• ");
          imagePart = `\n\n📸 ${t.fieldLabels?.images?.[lang] || "Images"} (${report.imageUrls.length}):\n• ${urls}`;
        }
      } catch (err) {
        console.error("ImageProvider failed:", err);
        // Fallback: list URLs
        const urls = report.imageUrls.join("\n• ");
        imagePart = `\n\n📸 ${t.fieldLabels?.images?.[lang] || "Images"} (${report.imageUrls.length}):\n• ${urls}`;
      }
    } else if (report.imageUrl) {
      imagePart = `\n\n🖼️ ${t.fieldLabels?.image?.[lang] || "Image"}: ${report.imageUrl}`;
    }

    // Build location with coordinates
    let locationPart = "";
    if (report.location) {
      locationPart = `📍 ${t.fieldLabels?.location?.[lang] || "Location"}: ${report.location}`;
      if (report.coordinates) {
        locationPart += ` (${report.coordinates})`;
      }
    }

    const result = [
      `${t.greetings?.[lang] || "Hello"}\n\n`,
      report.title && `📌 ${report.title}\n\n`,
      report.description &&
        `📝 ${t.fieldLabels?.description?.[lang] || "Description"}: ${report.description}\n\n`,
      locationPart && `${locationPart}\n\n`,
      report.contact &&
        `📞 ${t.fieldLabels?.contact?.[lang] || "Contact"}: ${report.contact}\n\n`,
      imagePart,
      `\n\n${t.closingLines?.[report.type]?.[lang] || "Thank you for your help"}\n`,
      `❤️ ${t.closingLines?.thank_you?.[lang] || "Thank you"}\n\n`,
      `${t.reportSharedVia?.[lang] || "Report shared via"} ${window.location.href}`,
    ]
      .filter(Boolean)
      .join("");

    console.log("Email body built, length:", result.length);
    return result;
  }

  function createZaloModalForSaved(message, url, reportTitle, lang) {
    const existingModal = document.getElementById("zalo-modal-saved");
    if (existingModal) existingModal.remove();

    // Extract image package URL from message
    const imageUrlMatch = message.match(
      /(https:\/\/[^\s]+image-package\.html\?id=img_[^\s]+)/,
    );
    const imagePackageUrl = imageUrlMatch ? imageUrlMatch[0] : url;

    const modalHTML = `
        <div id="zalo-modal-saved" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.8); display: flex; justify-content: center; align-items: center; z-index: 10000;">
            <div style="background: white; padding: 25px; border-radius: 15px; max-width: 90%; text-align: center;">
                <h2 style="color: #0068FF;">📱 ${getZaloModalTitle(lang)}</h2>
                <p>${getZaloModalMessage(lang)}</p>
                <div style="display: flex; gap: 10px; justify-content: center; margin-top: 20px; flex-wrap: wrap;">
                    <button id="zalo-safari-open" style="background: #0068FF; color: white; padding: 10px 20px; border: none; border-radius: 25px;">🌐 ${getSafariButtonText(lang)}</button>
                    <button id="zalo-copy-message" style="background: #28a745; color: white; padding: 10px 20px; border: none; border-radius: 25px;">📋 ${getCopyButtonText(lang)}</button>
                    <button id="zalo-close-modal" style="background: #6c757d; color: white; padding: 10px 20px; border: none; border-radius: 25px;">${getCloseButtonText(lang)}</button>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML("beforeend", modalHTML);

    document
      .getElementById("zalo-safari-open")
      ?.addEventListener("click", () => {
        // Open the image package URL so users can see all images
        window.open(imagePackageUrl, "_blank");
        // Don't close modal - let user close when ready
      });

    document
      .getElementById("zalo-copy-message")
      ?.addEventListener("click", () => {
        navigator.clipboard.writeText(message).then(() => {
          const copyMessages = {
            en: "✅ Message copied to clipboard!",
            vi: "✅ Đã sao chép tin nhắn!",
            zh: "✅ 消息已复制！",
            es: "✅ ¡Mensaje copiado!",
            hi: "✅ संदेश कॉपी किया गया!",
            ar: "✅ تم نسخ الرسالة!",
          };
          alert(copyMessages[lang] || copyMessages.en);
          // Don't close modal - let user close when ready
        });
      });

    document
      .getElementById("zalo-close-modal")
      ?.addEventListener("click", () => {
        document.getElementById("zalo-modal-saved")?.remove();
      });
  }

  function getZaloModalTitle(lang) {
    const titles = {
      en: "Share via Zalo",
      vi: "Chia sẻ qua Zalo",
      es: "Compartir via Zalo",
      zh: "通过 Zalo 分享",
      hi: "Zalo के माध्यम से साझा करें",
      ar: "شارك عبر Zalo",
    };
    return titles[lang] || titles.en;
  }

  function getZaloModalMessage(lang) {
    const messages = {
      en: "For the best experience with images, we recommend opening in Safari. You can also copy the message to share directly in Zalo.",
      vi: "Để có trải nghiệm tốt nhất với hình ảnh, chúng tôi khuyên bạn nên mở trong Safari. Bạn cũng có thể sao chép tin nhắn để chia sẻ trực tiếp trong Zalo.",
      es: "Para la mejor experiencia con imágenes, recomendamos abrir en Safari. También puede copiar el mensaje para compartir directamente en Zalo.",
      zh: "为了获得最佳的图片体验，我们建议在 Safari 中打开。您也可以复制消息以直接在 Zalo 中分享。",
      hi: "छवियों के साथ सर्वोत्तम अनुभव के लिए, हम Safari में खोलने की सलाह देते हैं। आप Zalo में सीधे साझा करने के लिए संदेश को कॉपी भी कर सकते हैं।",
      ar: "لأفضل تجربة مع الصور، نوصي بالفتح في Safari. يمكنك أيضًا نسخ الرسالة للمشاركة مباشرة في Zalo.",
    };
    return messages[lang] || messages.en;
  }

  function getSafariButtonText(lang) {
    const texts = {
      en: "Open in Safari",
      vi: "Mở trong Safari",
      es: "Abrir en Safari",
      zh: "在 Safari 中打开",
      hi: "Safari में खोलें",
      ar: "فتح في Safari",
    };
    return texts[lang] || texts.en;
  }

  function getCopyButtonText(lang) {
    const texts = {
      en: "Copy Message",
      vi: "Sao chép tin nhắn",
      es: "Copiar mensaje",
      zh: "复制消息",
      hi: "संदेश कॉपी करें",
      ar: "نسخ الرسالة",
    };
    return texts[lang] || texts.en;
  }

  function getCloseButtonText(lang) {
    const texts = {
      en: "Close",
      vi: "Đóng",
      es: "Cerrar",
      zh: "关闭",
      hi: "बंद करें",
      ar: "إغلاق",
    };
    return texts[lang] || texts.en;
  }

  // ============================================
  // MAIN RESHARE FUNCTION
  // ============================================

  async function handleReshareFromSaved(e) {
    if (window._resharingInProgress) {
      console.log("Reshare already in progress");
      return;
    }
    window._resharingInProgress = true;
    setTimeout(() => {
      window._resharingInProgress = false;
    }, 3000);

    e.preventDefault();
    e.stopPropagation();

    try {
      const index = e.target.dataset.index;
      if (index === undefined) {
        window._resharingInProgress = false;
        return;
      }

      const user = window.fb.auth?.currentUser;
      if (!user) {
        alert("Please sign in to reshare");
        window._resharingInProgress = false;
        return;
      }

      const storageKey = window.getUserReportsKey();
      const savedReports = JSON.parse(localStorage.getItem(storageKey) || "[]");
      const report = savedReports[parseInt(index)];

      if (!report) {
        alert("Report not found");
        window._resharingInProgress = false;
        return;
      }

      // In handleReshareFromSaved, after getting the report, add:

      // ============================================
      // ✅ CHECK FOR CONTENT VIOLATIONS
      // ============================================

      // Complete translations for reshare violation
      // Inside handleReshareFromSaved, replace the violation check with:

      // Reshare violation messages
      const reshareViolationMessages = {
        en: {
          cannotReshare:
            "❌ Cannot reshare: This content contains prohibited language",
          found: "Prohibited keywords found",
          accountBlocked: "Your account has been blocked due to violation.",
        },
        vi: {
          cannotReshare:
            "❌ Không thể chia sẻ lại: Nội dung này chứa ngôn ngữ bị cấm",
          found: "Từ khóa bị cấm được tìm thấy",
          accountBlocked: "Tài khoản của bạn đã bị khóa do vi phạm.",
        },
        zh: {
          cannotReshare: "❌ 无法转发：此内容包含禁止使用的语言",
          found: "发现禁用关键词",
          accountBlocked: "您的帐户已被封锁。",
        },
        es: {
          cannotReshare:
            "❌ No se puede compartir: Este contenido contiene lenguaje prohibido",
          found: "Palabras clave prohibidas encontradas",
          accountBlocked: "Tu cuenta ha sido bloqueada.",
        },
        hi: {
          cannotReshare:
            "❌ पुनः साझा नहीं कर सकते: इस सामग्री में प्रतिबंधित भाषा है",
          found: "प्रतिबंधित कीवर्ड मिले",
          accountBlocked: "आपका खाता ब्लॉक कर दिया गया है।",
        },
        ar: {
          cannotReshare:
            "❌ لا يمكن إعادة المشاركة: هذا المحتوى يحتوي على لغة محظورة",
          found: "الكلمات الرئيسية المحظورة موجودة",
          accountBlocked: "تم حظر حسابك.",
        },
      };

      // Check for violations
      const violations = checkContentViolation(
        report.title,
        report.description,
      );

      // In handleReshareFromSaved, after the violation check:
      if (violations.length > 0) {
        const violationList = violations.map((v) => v.keyword).join(", ");
        const lang = localStorage.getItem("userLanguage") || "en";
        const t = reshareViolationMessages[lang];

        alert(
          `${t.cannotReshare}\n\n${t.found}: ${violationList}\n\n${t.accountBlocked}`,
        );

        await blockViolatingUser(
          user.uid,
          "Attempted to reshare prohibited content",
          violations,
        );
        await window.fb.auth.signOut();
        window.location.href = "/dashboard";
        return; // ✅ IMPORTANT: This stops the reshare from continuing
      }
      // ============================================
      // END OF CONTENT VIOLATION CHECK
      // ============================================

      console.log("✅ Resharing report:", report.title);

      const lang = localStorage.getItem("userLanguage") || "en";
      const t = TRANSLATION_PATCH;

      const platform = prompt(
        `${t.resharePrompt?.[lang]?.title || "Share"} "${report.title}" ${t.resharePrompt?.[lang]?.onPlatform || "on"}:\n\n` +
          `1. WhatsApp\n2. Twitter\n3. Facebook\n4. Email\n5. Zalo\n6. Telegram\n\nEnter number:`,
      );

      if (!platform) {
        window._resharingInProgress = false;
        return;
      }

      switch (platform.trim()) {
        case "1": {
          // WhatsApp
          // ✅ Define lang FIRST
          const lang = localStorage.getItem("userLanguage") || "en";

          // Add translations here
          const whatsappNotice = {
            en: "ℹ️ WhatsApp may shorten long messages. Title, images, and link are preserved.",
            vi: "ℹ️ WhatsApp có thể rút gọn tin nhắn dài. Tiêu đề, hình ảnh và liên kết vẫn được giữ nguyên.",
            zh: "ℹ️ WhatsApp可能会缩短长消息。标题、图片和链接仍然保留。",
            es: "ℹ️ WhatsApp puede acortar mensajes largos. El título, las imágenes y el enlace se conservan.",
            hi: "ℹ️ WhatsApp लंबे संदेशों को छोटा कर सकता है। शीर्षक, चित्र और लिंक सुरक्षित रहते हैं।",
            ar: "ℹ️ قد يقوم واتساب بتقصير الرسائل الطويلة. العنوان والصور والرابط محفوظة.",
          };

          const whatsappParts = [];
          if (
            report.description ||
            report.location ||
            report.contact ||
            report.title
          ) {
            whatsappParts.push(`_${t.greetings?.[lang] || "Hello"}_`);
            if (report.title) whatsappParts.push(`\n\n*${report.title}*`);
            if (report.description)
              whatsappParts.push(
                `\n\n*${t.fieldLabels?.description?.[lang] || "Description"}:* ${report.description}`,
              );
            if (report.location) {
              let locationLine = `\n\n*${t.fieldLabels?.location?.[lang] || "Location"}:* ${report.location}`;
              if (report.coordinates)
                locationLine += ` (${report.coordinates})`;
              whatsappParts.push(locationLine);
            }
            if (report.contact)
              whatsappParts.push(
                `\n\n*${t.fieldLabels?.contact?.[lang] || "Contact"}:* ${report.contact}`,
              );

            if (report.imageUrls && report.imageUrls.length > 0) {
              try {
                const imageResult = await ImageProvider.getImagesForPlatform(
                  report.imageUrls,
                  "whatsapp",
                );
                if (imageResult.url) {
                  whatsappParts.push(
                    `\n\n*${t.fieldLabels?.images?.[lang] || "Images"} (${report.imageUrls.length}):* ${imageResult.url}`,
                  );
                }
              } catch (err) {
                whatsappParts.push(
                  `\n\n*${t.fieldLabels?.image?.[lang] || "Image"}:* ${report.imageUrls[0]}`,
                );
              }
            }

            whatsappParts.push(
              `\n\n_${t.closingLines?.[report.type]?.[lang] || "Thank you for your help"}_`,
            );
            whatsappParts.push(
              `\n_${t.closingLines?.thank_you?.[lang] || "Thank you"}_`,
            );
            whatsappParts.push(
              `\n\n_${t.reportSharedVia?.[lang] || "Shared via"} ${window.location.href}_`,
            );
          }
          let whatsappMsg = whatsappParts.filter(Boolean).join("");

          // ============================================
          // SIMPLIFIED: Only show notice for Hindi (no truncation)
          // ============================================
          if (lang === "hi") {
            alert(whatsappNotice[lang]);
          }
          // ============================================

          const isMobile = /iPhone|iPad|iPod|Android/i.test(
            navigator.userAgent,
          );
          const encodedMsg = encodeURIComponent(whatsappMsg);

          if (isMobile) {
            const whatsappProtocol = `whatsapp://send?text=${encodedMsg}`;
            window.location.href = whatsappProtocol;
            setTimeout(() => {
              if (document.hasFocus()) {
                window.location.href = `https://wa.me/?text=${encodedMsg}`;
              }
            }, 500);
          } else {
            window.open(`https://wa.me/?text=${encodedMsg}`, "_blank");
          }
          break;
        }

        case "2": {
          // Twitter
          const lang = localStorage.getItem("userLanguage") || "en";
          let twitterImageLink = "";
          if (report.imageUrls?.length) {
            try {
              const imgResult = await ImageProvider.getImagesForPlatform(
                report.imageUrls,
                "twitter",
              );
              if (imgResult.url) twitterImageLink = `📸 ${imgResult.url}`;
            } catch (e) {}
          }
          const twitterMsg = [
            report.title,
            twitterImageLink,
            report.contact ? `Contact: ${report.contact}` : "",
            `🙏 ${t.closingLines?.thank_you?.[lang] || "Thank you"}`,
            `via ${window.location.hostname}`,
          ]
            .filter(Boolean)
            .join(" • ")
            .substring(0, 280);
          window.open(
            `https://twitter.com/intent/tweet?text=${encodeURIComponent(twitterMsg)}`,
            "_blank",
          );
          break;
        }

        case "3": {
          // Facebook with Modal
          const lang = localStorage.getItem("userLanguage") || "en";
          // Show notice before sharing
          showNoticeBeforeFacebookShare();

          const facebookMessage = await buildFacebookMessage(report, lang);
          showFacebookShareModalForSaved({
            ...report,
            message: facebookMessage,
          });
          break;
        }

        case "4": {
          // Email with Modal
          const lang = localStorage.getItem("userLanguage") || "en";
          // IMPORTANT: await here to get the actual string, not a Promise
          const emailBody = await buildEmailBody(report, lang);
          console.log("Email body created, length:", emailBody.length); // Debug
          showEmailShareModalForSaved({ ...report, body: emailBody }, lang);
          break;
        }

        case "5": {
          // Zalo with Modal
          const lang = localStorage.getItem("userLanguage") || "en";
          const zaloMsg = await buildZaloMessage(report, lang);
          createZaloModalForSaved(
            zaloMsg,
            window.location.href,
            report.title,
            lang,
          );
          break;
        }

        case "6": {
          // Telegram
          const lang = localStorage.getItem("userLanguage") || "en";
          let telegramImageLink = "";
          if (report.imageUrls?.length) {
            try {
              const imgResult = await ImageProvider.getImagesForPlatform(
                report.imageUrls,
                "telegram",
              );
              if (imgResult.url)
                telegramImageLink = `\n🖼️ ${t.fieldLabels?.image?.[lang] || "Image"}: ${imgResult.url}`;
            } catch (e) {}
          }

          // ✅ Add cache-busting parameter to URL
          const shareUrl = window.location.href.split("?")[0] + "?v=5";

          const telegramMsg = [
            `${t.greetings?.[lang] || "Hello"}`,
            report.title && `\n\n📌 ${report.title}`,
            report.description &&
              `\n\n📝 ${t.fieldLabels?.description?.[lang] || "Description"}: ${report.description}`,
            report.location &&
              `\n\n📍 ${t.fieldLabels?.location?.[lang] || "Location"}: ${report.location}`,
            report.contact &&
              `\n📞 ${t.fieldLabels?.contact?.[lang] || "Contact"}: ${report.contact}`,
            telegramImageLink,
            `\n\n${t.closingLines?.[report.type]?.[lang] || "Thank you for your help"}`,
            `\n❤️ ${t.closingLines?.thank_you?.[lang] || "Thank you"}`,
            `\n\n${t.reportSharedVia?.[lang] || "Report shared via"} ${shareUrl}`,
          ]
            .filter(Boolean)
            .join("");

          window.open(
            `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(telegramMsg)}`,
            "_blank",
          );
          break;
        }

        default:
          alert("Invalid choice");
      }
      window._resharingInProgress = false;
    } catch (error) {
      console.error("Reshare error:", error);
      alert("Failed to reshare");
      window._resharingInProgress = false;
    }
  }

  async function buildZaloMessage(report, lang) {
    const t = TRANSLATION_PATCH;

    // Get actual image package URL from ImageProvider
    let imagePart = "";
    if (report.imageUrls && report.imageUrls.length > 0) {
      try {
        const imageResult = await ImageProvider.getImagesForPlatform(
          report.imageUrls,
          "zalo",
        );
        if (imageResult.url) {
          imagePart = `\n🖼️ ${t.fieldLabels?.images?.[lang] || "Images"} (${report.imageUrls.length}): ${imageResult.url}`;
        }
      } catch (error) {
        console.error("Failed to get image package:", error);
        imagePart = `\n🖼️ ${t.fieldLabels?.image?.[lang] || "Image"}: ${report.imageUrls[0]}`;
      }
    } else if (report.imageUrl) {
      imagePart = `\n🖼️ ${t.fieldLabels?.image?.[lang] || "Image"}: ${report.imageUrl}`;
    }

    // Build location with coordinates
    let locationPart = "";
    if (report.location) {
      locationPart = `\n📍 ${t.fieldLabels?.location?.[lang] || "Location"}: ${report.location}`;
      if (report.coordinates) {
        locationPart += ` (${report.coordinates})`;
      }
    }

    return [
      `${t.greetings?.[lang] || "Hello"}`,
      report.title && `\n\n${report.title}`,
      report.description &&
        `\n${t.fieldLabels?.description?.[lang] || "Description"}: ${report.description}`,
      locationPart,
      report.contact &&
        `\n${t.fieldLabels?.contact?.[lang] || "Contact"}: ${report.contact}`,
      imagePart,
      `\n\n${t.closingLines?.[report.type]?.[lang] || "Thank you for your help"}`,
      `\n${t.closingLines?.thank_you?.[lang] || "Thank you"}`,
      `\n\n${t.reportSharedVia?.[lang] || "Report shared via"} ${window.location.href}`,
    ]
      .filter(Boolean)
      .join("\n");
  }

  // ============================================
  // DELETE AND EVENT LISTENERS
  // ============================================

  function handleDelete(e) {
    const index = e.target.dataset.index;
    const user = window.fb.auth?.currentUser;
    if (!user) return;

    const lang = localStorage.getItem("appLanguage") || "en";
    const confirmText =
      TRANSLATION_PATCH.confirmations?.deleteReport?.[lang] ||
      "Are you sure you want to delete this report?";
    if (!confirm(confirmText)) return;

    const storageKey = window.getUserReportsKey();
    if (!storageKey) return;

    let savedReports = JSON.parse(localStorage.getItem(storageKey) || "[]");
    savedReports.splice(index, 1);
    localStorage.setItem(storageKey, JSON.stringify(savedReports));
    window.renderSavedReports();
  }

  function attachSavedReportEventListeners() {
    // Reshare buttons
    const reshareBtns = document.querySelectorAll(
      "#saved-reports-container .reshare-btn",
    );
    reshareBtns.forEach((btn) => {
      btn.removeEventListener("click", handleReshareFromSaved);
      btn.addEventListener("click", handleReshareFromSaved);
    });

    // Delete buttons
    const deleteBtns = document.querySelectorAll(
      "#saved-reports-container .delete-btn",
    );
    deleteBtns.forEach((btn) => {
      btn.removeEventListener("click", handleDelete);
      btn.addEventListener("click", handleDelete);
    });

    // Setup image link handlers
    setupImageLinkHandlers();
  }

  window.handleDelete = handleDelete;

  if (document.readyState !== "loading") {
    setTimeout(window.renderSavedReports, 500);
  } else {
    document.addEventListener("DOMContentLoaded", () => {
      setTimeout(window.renderSavedReports, 500);
    });
  }
})();

// Ensure saveCurrentReport is preserved (if it exists)
if (
  typeof window.saveCurrentReport === "undefined" &&
  typeof saveCurrentReport === "function"
) {
  window.saveCurrentReport = saveCurrentReport;
}

// ============================================
// EXPORT TOP-LEVEL FUNCTIONS
// ============================================

window.getUserReportsKey = getUserReportsKey;

// ===== SIMPLIFIED & RELIABLE SHARING SOLUTION =====
document.addEventListener("DOMContentLoaded", function () {
  // ===== 1. CORE REPORT FUNCTIONS =====
  function getReport() {
    // Try to get images from multiple sources
    const savedImages = localStorage.getItem("lastUploadedImages");
    const parsedImages = savedImages ? JSON.parse(savedImages) : null;

    const hasImage = window.lastReport?.imageUrl?.startsWith("http");
    const hasMultipleImages =
      window.lastUploadedImages?.length > 0 || parsedImages?.length > 0;

    // Use the most reliable source
    const imageUrls =
      window.lastUploadedImages?.length > 0
        ? window.lastUploadedImages
        : parsedImages || [];

    const imageCount = imageUrls.length;

    return {
      title: document.getElementById("report-title")?.value || "Report",
      description: document.getElementById("report-description")?.value || "",
      location: document.getElementById("location-text-input")?.value || "",
      coordinates: document.getElementById("selected-coordinates")?.value || "",
      contact: document.getElementById("reporter-contact")?.value || "",
      hasImage: hasImage,
      imageUrl: hasImage ? window.lastReport.imageUrl : imageUrls[0] || null,
      // Multiple image support
      imageUrls: imageUrls,
      imageCount: imageCount,
      pageUrl: window.location.href,
      type: document.getElementById("report-type")?.value || "other",
      timestamp: Date.now(),
    };

    // ✅ ADD VIOLATION CHECK
    if (isReportViolating(report)) {
      showViolationAlert();
      return;
    }
  }

  function getReportClosure(type = "") {
    // Convert to lowercase for consistent comparison
    type = type.toLowerCase().trim();
    if (type === "missing_person") return "\n\nPlease help find. Share widely!";
    if (type === "lost_item") return "\n\nPlease help locate.";
    if (type === "found_person") return "\n\nPlease help reunite with family.";
    if (type === "found_item") return "\n\nPlease contact if this is yours.";
    if (type === "event") return "\n\nJoin us! Spread the word!";

    return "\n\nThank you for your assistance.";
  }

  // ===== 2. SAVED REPORTS SOLUTION =====
  const SAVED_REPORTS_KEY = "savedReports";

  function saveCurrentReport() {
    console.log("saveCurrentReport() called");

    const report = getReport();
    console.log("Current report data:", report);

    // ============================================
    // ✅ CHECK FOR VIOLATING CONTENT BEFORE SAVING
    // ============================================
    const prohibitedWords = [
      "đánh bom",
      "bomb",
      "khủng bố",
      "tài khoản ngân hàng",
      "bank account",
      "porn",
      "sex",
      "khiêu dâm",
    ];
    const textToCheck = (report.title + " " + report.description).toLowerCase();
    let isViolating = false;
    let foundWord = "";
    for (const word of prohibitedWords) {
      if (textToCheck.includes(word.toLowerCase())) {
        isViolating = true;
        foundWord = word;
        break;
      }
    }

    if (isViolating) {
      console.log("⚠️ Cannot save violating report to Saved Reports");
      const lang = localStorage.getItem("userLanguage") || "en";
      const msg =
        lang === "vi"
          ? `❌ Không thể lưu báo cáo vi phạm (từ: ${foundWord})`
          : `❌ Cannot save violating report (word: ${foundWord})`;
      alert(msg);
      return; // ✅ This prevents saving
    }
    // ============================================

    // Simple empty check
    const isReportEmpty = !report.title && !report.description;
    if (isReportEmpty) {
      console.log("Report is empty, not saving");
      return;
    }

    // Check if user is signed in
    const user = window.fb.auth?.currentUser;
    if (!user) {
      console.log("No user signed in, cannot save report");
      const lang = localStorage.getItem("userLanguage") || "en";
      const messages = {
        en: "Please sign in to save reports",
        vi: "Vui lòng đăng nhập để lưu báo cáo",
        zh: "请登录以保存报告",
        es: "Por favor inicie sesión para guardar informes",
        hi: "रिपोर्ट सहेजने के लिए कृपया साइन इन करें",
        ar: "يرجى تسجيل الدخول لحفظ التقارير",
      };
      alert(messages[lang] || messages.en);
      return;
    }

    const storageKey = window.getUserReportsKey();
    if (!storageKey) return;

    // Get user-specific saved reports
    let savedReports = JSON.parse(localStorage.getItem(storageKey) || "[]");

    // Check for duplicates
    const isDuplicate = savedReports.some(
      (savedReport) =>
        savedReport.title === report.title &&
        savedReport.description === report.description &&
        savedReport.type === report.type,
    );

    if (isDuplicate) {
      console.log("Duplicate report found, not saving");
      return;
    }

    // Store ONLY references, not actual images
    const reportToSave = {
      title: report.title,
      description: report.description,
      location: report.location,
      coordinates: report.coordinates,
      contact: report.contact,
      type: report.type,
      timestamp: report.timestamp || Date.now().toString(),
      userId: user.uid,
      imageUrls: report.imageUrls || [],
      imageCount: report.imageUrls ? report.imageUrls.length : 0,
      hasImages: (report.imageUrls && report.imageUrls.length > 0) || false,
    };

    savedReports.unshift(reportToSave);

    // Try to save with auto-cleanup on quota error
    try {
      localStorage.setItem(storageKey, JSON.stringify(savedReports));
      console.log("✅ Saved report for user:", user.uid);
    } catch (error) {
      if (error.name === "QuotaExceededError") {
        console.warn(
          "⚠️ localStorage quota exceeded, cleaning image backups...",
        );

        // Clean only image package backups, NOT saved reports
        let cleanedCount = 0;
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (
            key &&
            (key.startsWith("img_") ||
              key.startsWith("whatsapp_") ||
              key.startsWith("imgpkg_"))
          ) {
            localStorage.removeItem(key);
            cleanedCount++;
          }
        }
        console.log(`🧹 Removed ${cleanedCount} image backup(s)`);

        // Try saving again
        localStorage.setItem(storageKey, JSON.stringify(savedReports));
        console.log("✅ Saved after cleanup");
      } else {
        console.error("❌ Failed to save:", error);
      }
    }

    // Show success message with translations
    const lang = localStorage.getItem("userLanguage") || "en";
    const successMessages = {
      en: "Report saved successfully",
      vi: "Đã lưu báo cáo thành công",
      zh: "报告保存成功",
      es: "Informe guardado correctamente",
      hi: "रिपोर्ट सफलतापूर्वक सहेजी गई",
      ar: "تم حفظ التقرير بنجاح",
    };
    alert(successMessages[lang] || successMessages.en);

    if (window.renderSavedReports) {
      window.renderSavedReports();
    }
  }

  // ✅ Add this line to make it globally accessible
  window.saveCurrentReport = saveCurrentReport;

  // Original deleteReport (inside DOMContentLoaded)
  function deleteReport(timestamp) {
    const lang = localStorage.getItem("appLanguage") || "en";

    if (!confirm(TRANSLATION_PATCH.confirmations.deleteReport[lang])) return;

    const savedReports =
      JSON.parse(localStorage.getItem(SAVED_REPORTS_KEY)) || [];
    localStorage.setItem(
      SAVED_REPORTS_KEY,
      JSON.stringify(savedReports.filter((r) => r.timestamp !== timestamp)),
    );
    renderSavedReports();
  }

  function reshareReport(timestamp) {
    const savedReports =
      JSON.parse(localStorage.getItem(SAVED_REPORTS_KEY)) || [];
    const report = savedReports.find((r) => r.timestamp === timestamp);

    if (report) {
      // Load ALL report data into the form
      document.getElementById("report-title").value = report.title;
      document.getElementById("report-description").value =
        report.description || "";
      document.getElementById("location-text-input").value =
        report.location || "";
      document.getElementById("reporter-contact").value = report.contact || "";
      document.getElementById("report-type").value = report.type || "other";

      // Store for sharing
      window.lastReport = {
        imageUrl: report.imageUrl,
        title: report.title,
        description: report.description,
        location: report.location,
        contact: report.contact,
        type: report.type,
      };

      // Get the current language from storage, check BOTH possible keys
      let currentLang =
        localStorage.getItem("appLanguage") ||
        localStorage.getItem("userLanguage") ||
        "en";
      // Define the translations for the alert message
      const alertTranslations = {
        en: "loaded - form updated and ready to share",
        es: "cargado - formulario actualizado y listo para compartir",
        zh: "已加载 - 表单已更新并准备分享",
        vi: "đã tải - biểu mẫu được cập nhật và sẵn sàng để chia sẻ",
        hi: "लोड किया गया - फॉर्म अपडेट किया गया और साझा करने के लिए तैयार",
        ar: "تم التحميل - النموذج محدث وجاهز للمشاركة",
      };
      // Get the correct translation, use English if not found
      const message = alertTranslations[currentLang] || alertTranslations.en;
      // Show the translated alert
      alert(`"${report.title}" ${message}`);
    }
  }

  // Original clearAllReports (inside DOMContentLoaded)
  function clearAllReports() {
    const user = window.fb.auth?.currentUser;
    if (!user) {
      const lang = localStorage.getItem("appLanguage") || "en";
      alert("Please sign in to clear reports");
      return;
    }

    const lang = localStorage.getItem("appLanguage") || "en";

    if (!confirm(TRANSLATION_PATCH.confirmations?.clearAll?.[lang])) return;

    try {
      const storageKey = getUserReportsKey();
      if (storageKey) {
        localStorage.removeItem(storageKey);
      }

      if (typeof window.renderSavedReports === "function") {
        window.renderSavedReports();
      }

      const successText =
        TRANSLATION_PATCH.successMessages?.clearedAll?.[lang] ||
        "All reports cleared";
      alert(successText);
    } catch (error) {
      console.error("Clear failed:", error);
      alert(
        TRANSLATION_PATCH.errorMessages?.clearAllFailed?.[lang] ||
          "Failed to clear reports",
      );
    }
  }

  window.clearAllReports = clearAllReports;

  // ===== SHARING.JS UPDATED CODE =====
  function initSavedReports() {
    document
      .getElementById("save-report-btn")
      ?.addEventListener("click", saveCurrentReport);
    document
      .getElementById("clear-all-reports")
      ?.addEventListener("click", clearAllReports);

    // Updated event delegation for report actions
    document.addEventListener("click", function (e) {
      // Delete button handler
      if (e.target.classList.contains("delete-btn")) {
        e.preventDefault();
        deleteReport(Number(e.target.dataset.id));
      }

      // ===== COMPLETE RESHARE HANDLER (FIXED) =====
      async function handleReshareClick(e) {
        // 🔒 Add lock to prevent double execution
        if (window._resharingInProgress) {
          console.log("Reshare already in progress, ignoring");
          return;
        }
        window._resharingInProgress = true;

        // Release lock after 2 seconds
        setTimeout(() => {
          window._resharingInProgress = false;
        }, 2000);

        const lang = localStorage.getItem("userLanguage") || "en";
        e.preventDefault();
        e.stopImmediatePropagation();

        try {
          // ✅ Get current user
          const user = window.fb.auth?.currentUser;

          // Get the ID or index from the event
          const reportId = e.target.dataset.id;
          const reportIndex = e.target.dataset.index;

          console.log(
            "Looking for report - ID:",
            reportId,
            "Index:",
            reportIndex,
          );

          let report = null;

          // ✅ Try user-specific storage first (if user is logged in)
          if (user) {
            const storageKey = `savedReports_${user.uid}`;
            let savedReports = JSON.parse(
              localStorage.getItem(storageKey) || "[]",
            );

            // Try by index first (new way)
            if (
              reportIndex !== undefined &&
              savedReports[parseInt(reportIndex)]
            ) {
              report = savedReports[parseInt(reportIndex)];
              console.log(
                "✅ Found report by index in user storage:",
                report?.title,
              );
            }

            // If not found by index, try by ID
            if (!report && reportId) {
              report = savedReports.find(
                (r) => String(r.timestamp) === String(reportId),
              );
              if (report) {
                console.log(
                  "✅ Found report by ID in user storage:",
                  report.title,
                );
              }
            }
          }

          // ✅ If not found in user storage, try the old shared storage (backward compatibility)
          if (!report) {
            let savedReports = JSON.parse(
              localStorage.getItem("savedReports") || "[]",
            );

            // Try by index
            if (
              reportIndex !== undefined &&
              savedReports[parseInt(reportIndex)]
            ) {
              report = savedReports[parseInt(reportIndex)];
              console.log(
                "✅ Found report by index in shared storage:",
                report?.title,
              );
            }

            // Try by ID
            if (!report && reportId) {
              report = savedReports.find(
                (r) => String(r.timestamp) === String(reportId),
              );
              if (report) {
                console.log(
                  "✅ Found report by ID in shared storage:",
                  report.title,
                );
              }
            }
          }

          // If not found, check for temporary reshare report
          if (!report) {
            const tempReport = localStorage.getItem("currentReshareReport");
            if (tempReport) {
              const parsed = JSON.parse(tempReport);
              if (String(parsed.timestamp) === String(reportId)) {
                report = parsed;
                console.log("✅ Found report in temporary storage");
              }
            }
          }

          if (!report) {
            console.error(
              "❌ Report not found with ID:",
              reportId,
              "Index:",
              reportIndex,
            );
            alert("Report not found");
            window._resharingInProgress = false;
            return;
          }

          console.log("✅ Found report:", report.title);

          // ========== THE REST OF YOUR EXISTING CODE STAYS EXACTLY THE SAME ==========
          // Your existing code from here onward remains unchanged
          // (Check if report has images, hasContent, platform prompt, switch statement, etc.)

          // Check if report has images
          const hasImages = report.imageUrls && report.imageUrls.length > 0;
          console.log(
            "Report images:",
            report.imageUrls,
            "hasImages:",
            hasImages,
          );

          // Check if report is empty by looking at actual content
          const hasContent =
            report.description ||
            report.location ||
            report.contact ||
            report.imageUrl ||
            (report.title && report.title !== "Report");

          // Show platform selection prompt
          const platform = prompt(
            `${TRANSLATION_PATCH.resharePrompt[lang].title} ${hasContent ? `"${report.title}"` : ""} ` +
              `${TRANSLATION_PATCH.resharePrompt[lang].onPlatform}:\n\n` +
              `1. ${TRANSLATION_PATCH.resharePrompt[lang].whatsapp}\n` +
              `2. ${TRANSLATION_PATCH.resharePrompt[lang].twitter}\n` +
              `3. ${TRANSLATION_PATCH.platforms.facebook[lang]}\n` +
              `4. ${TRANSLATION_PATCH.resharePrompt[lang].email}\n` +
              `5. ${TRANSLATION_PATCH.resharePrompt[lang].zalo}\n` +
              `6. Telegram\n\n` +
              `${TRANSLATION_PATCH.resharePrompt[lang].enterChoice}`,
          );

          if (!platform) return;

          // Store report for platform handlers to access
          localStorage.setItem("currentReshareReport", JSON.stringify(report));

          switch (platform.trim()) {
            case "1": // WhatsApp
              console.log("🔍 RESHARE DEBUG - Report data:", report);
              console.log("🔍 RESHARE DEBUG - imageUrls:", report.imageUrls);

              // CORRECTED RESHARE MESSAGE FORMATTING
              const whatsappParts = [];

              if (hasContent) {
                whatsappParts.push(`_${t("greetings", lang)}_`);

                if (report.title) {
                  whatsappParts.push(`\n\n*${report.title}*`);
                }

                if (report.description) {
                  whatsappParts.push(
                    `\n\n*${t("fieldLabels.description", lang)}:* ${
                      report.description
                    }`,
                  );
                }

                if (report.location) {
                  let locationLine = `\n\n*${t(
                    "fieldLabels.location",
                    lang,
                  )}:* ${report.location}`;
                  if (report.coordinates) {
                    locationLine += ` (${report.coordinates})`;
                  }
                  whatsappParts.push(locationLine);
                }

                if (report.contact) {
                  whatsappParts.push(
                    `\n\n*${t("fieldLabels.contact", lang)}:* ${report.contact}`,
                  );
                }

                // Images - full format
                if (report.imageUrls && report.imageUrls.length > 0) {
                  try {
                    console.log(
                      "🔄 Using ImageProvider for WhatsApp RESHARE...",
                    );
                    const imageResult =
                      await ImageProvider.getImagesForPlatform(
                        report.imageUrls,
                        "whatsapp",
                      );

                    if (imageResult.type === "single") {
                      whatsappParts.push(
                        `\n\n*${t("fieldLabels.image", lang)}:* ${
                          imageResult.url
                        }`,
                      );
                    } else if (imageResult.type === "package") {
                      whatsappParts.push(
                        `\n\n*${t("fieldLabels.images", lang)} (${
                          report.imageUrls.length
                        }):* ${imageResult.url}`,
                      );
                    }
                  } catch (error) {
                    console.log("❌ ImageProvider failed for reshare:", error);
                    // Fallback to first image
                    whatsappParts.push(
                      `\n\n*${t("fieldLabels.image", lang)}:* ${
                        report.imageUrls[0]
                      }`,
                    );
                  }
                }

                whatsappParts.push(
                  `\n\n_${t(`closingLines.${report.type}`, lang)}_`,
                );
                whatsappParts.push(`\n_${t("closingLines.thank_you", lang)}_`);
                whatsappParts.push(
                  `\n\n_${t("reportSharedVia", lang)} ${window.location.href}_`,
                );
              }

              const whatsappMsg = whatsappParts.filter(Boolean).join("");

              console.log(
                "📱 Full reshare WhatsApp message length:",
                whatsappMsg.length,
              );
              debugWhatsAppIssue(whatsappMsg, report.title);
              shareToWhatsApp(whatsappMsg, report.title);
              break;

            case "2": // Twitter
              (async function () {
                // ✅ ADD THESE TWO LINES AT THE TOP
                const t = TRANSLATION_PATCH;
                const lang = localStorage.getItem("userLanguage") || "en";

                console.log("🐦 Twitter reshare with optimized format...");

                // GET SHORT IMAGE PACKAGE FOR TWITTER
                let imageLink = "";
                ImageProvider.getImagesForPlatform(report.imageUrls, "twitter")
                  .then((imageResult) => {
                    if (imageResult.url) {
                      imageLink = `📸 ${imageResult.url}`;
                    }
                    console.log("✅ Twitter reshare image package:", imageLink);

                    // TWITTER-OPTIMIZED MESSAGE (keep your existing format)
                    const twitterMsg = [
                      report.title,
                      imageLink,
                      report.contact ? `Contact: ${report.contact}` : "",
                      `🙏 ${t.closingLines.thank_you[lang]}`,
                      `via ${window.location.hostname}`,
                    ]
                      .filter((part) => part && part.trim())
                      .join(" • ")
                      .substring(0, 280);

                    console.log(
                      "🐦 Twitter reshare length:",
                      twitterMsg.length,
                    );

                    window.open(
                      `https://twitter.com/intent/tweet?text=${encodeURIComponent(twitterMsg)}`,
                      "_blank",
                    );
                  })
                  .catch((error) => {
                    console.error("❌ Twitter reshare failed:", error);
                    // Fallback without images
                    const fallbackMsg = [
                      report.title,
                      `via ${window.location.hostname}`,
                    ]
                      .filter(Boolean)
                      .join(" • ");

                    window.open(
                      `https://twitter.com/intent/tweet?text=${encodeURIComponent(fallbackMsg)}`,
                      "_blank",
                    );
                  });
              })();
              break;

            case "3": // Facebook
              (async function () {
                // ✅ ADD THESE TWO LINES AT THE TOP
                const t = TRANSLATION_PATCH;
                const lang = localStorage.getItem("userLanguage") || "en";

                // Create a clean report object without default "Report" title
                const cleanReport = {
                  ...report,
                  title:
                    report.title && report.title !== "Report"
                      ? report.title
                      : "",
                };

                // Check if report is truly empty
                const isEmptyReport =
                  !cleanReport.title &&
                  !cleanReport.description &&
                  !cleanReport.location &&
                  !cleanReport.contact;

                // GET IMAGE PACKAGE FOR FACEBOOK RESHARE
                let imagePart = "";
                try {
                  console.log(
                    "💙 Getting image package for Facebook reshare...",
                  );
                  const imageResult = await ImageProvider.getImagesForPlatform(
                    report.imageUrls || [],
                    "facebook",
                  );

                  console.log("💙 Facebook reshare image result:", imageResult);

                  if (imageResult.type === "single" && imageResult.url) {
                    // ✅ FIX: Use object notation
                    imagePart = `\n🖼️ ${t.fieldLabels.image[lang]}: ${imageResult.url}`;
                  } else if (
                    imageResult.type === "package" &&
                    imageResult.url
                  ) {
                    imagePart = `\n🖼️ ${t.fieldLabels.images[lang]} (${imageResult.count}): ${imageResult.url}`;
                  }
                  console.log("✅ Facebook reshare image package:", imagePart);
                } catch (error) {
                  console.log(
                    "❌ Facebook reshare image package failed:",
                    error.message,
                  );
                  if (report.imageUrls && report.imageUrls.length > 0) {
                    imagePart = `\n🖼️ ${t.fieldLabels.image[lang]}: ${report.imageUrls[0]}`;
                    console.log(
                      "🔄 Using fallback single image from report.imageUrls",
                    );
                  }
                }

                const facebookMsg = [
                  `${t.greetings[lang]}`,
                  !isEmptyReport &&
                    cleanReport.title &&
                    `\n\n📌 ${cleanReport.title}`,
                  cleanReport.description &&
                    `\n\n📝 ${t.fieldLabels.description[lang]}: ${cleanReport.description}`,
                  (cleanReport.location || cleanReport.coordinates) &&
                    `\n\n📍 ${t.fieldLabels.location[lang]}: ${cleanReport.location || ""}${cleanReport.coordinates ? ` (${cleanReport.coordinates})` : ""}`,
                  cleanReport.contact &&
                    `\n📞 ${t.fieldLabels.contact[lang]}: ${cleanReport.contact}`,
                  imagePart,
                  `\n\n${t.closingLines[cleanReport.type][lang]}`,
                  `\n❤️ ${t.closingLines.thank_you[lang]}`,
                  `\n\n${t.reportSharedVia[lang]} ${window.location.href}`,
                ]
                  .filter(Boolean)
                  .join("");

                console.log("🐛 Final Facebook reshare message:", facebookMsg);
                console.log(
                  "🐛 Contains image package:",
                  facebookMsg.includes("image-package.html"),
                );

                // ✅ Keep your existing modal functions
                showFacebookShareModal({
                  ...cleanReport,
                  message: facebookMsg,
                });
                showNoticeBeforeFacebookShare();
              })();
              break;

            case "4": // Email
              (async function () {
                // ✅ Define t and lang at the top
                const t = TRANSLATION_PATCH;
                const lang = localStorage.getItem("userLanguage") || "en";

                const isMobile = /iPhone|iPad|iPod|Android/i.test(
                  navigator.userAgent,
                );
                console.log("🐛 DEBUG: Email reshare - isMobile:", isMobile);

                // GET IMAGE PACKAGE FOR EMAIL RESHARE
                let imagePart = "";
                try {
                  console.log("💙 Getting image package for Email reshare...");
                  const imageResult = await ImageProvider.getImagesForPlatform(
                    report.imageUrls || [],
                    "email",
                  );

                  if (imageResult.type === "package" && imageResult.url) {
                    imagePart = `\n🖼️ ${t.fieldLabels.images[lang]} (${imageResult.count}): ${imageResult.url}`;
                  } else if (imageResult.type === "single" && imageResult.url) {
                    imagePart = `\n🖼️ ${t.fieldLabels.image[lang]}: ${imageResult.url}`;
                  }
                } catch (error) {
                  console.log("❌ Email reshare image package failed:", error);
                  if (report.imageUrls && report.imageUrls.length > 0) {
                    imagePart = `\n🖼️ ${t.fieldLabels.image[lang]}: ${report.imageUrls[0]}`;
                  }
                }

                const emailBody = [
                  `${t.greetings[lang]}\n`,
                  report.title && `📌 ${report.title}\n`,
                  report.description &&
                    `📝 ${t.fieldLabels.description[lang]}: ${report.description}\n`,
                  (report.location || report.coordinates) &&
                    `📍 ${t.fieldLabels.location[lang]}: ${report.location || ""}${report.coordinates ? ` (${report.coordinates})` : ""}\n`,
                  report.contact &&
                    `📞 ${t.fieldLabels.contact[lang]}: ${report.contact}\n`,
                  imagePart,
                  `\n${t.closingLines[report.type][lang]}\n`,
                  `❤️${t.closingLines.thank_you[lang]}\n`,
                  `${t.reportSharedVia[lang]} ${window.location.href}`,
                ]
                  .filter(Boolean)
                  .join("");

                showEmailShareModal({
                  subject: report.title || t.defaultSubject[lang],
                  body: emailBody,
                  lang: lang,
                  showEmailInput: true,
                });
              })();
              break;

            // In your sharing.js, inside the reshare function, add a new case:
            case "5": // Zalo
              (async function () {
                // ✅ ADD THESE TWO LINES AT THE TOP
                const t = TRANSLATION_PATCH;
                const lang = localStorage.getItem("userLanguage") || "en";

                try {
                  console.log(
                    "💙 Zalo reshare using existing ImageProvider...",
                  );

                  // USE THE EXISTING IMAGEPROVIDER
                  let imagePart = "";
                  const imageResult = await ImageProvider.getImagesForPlatform(
                    report.imageUrls,
                    "zalo",
                  );

                  if (imageResult.type === "single" && imageResult.url) {
                    // ✅ FIX: Use object notation
                    imagePart = `\n${t.fieldLabels.image[lang]}: ${imageResult.url}`;
                  } else if (
                    imageResult.type === "package" &&
                    imageResult.url
                  ) {
                    imagePart = `\n${t.fieldLabels.images[lang]} (${imageResult.count}): ${imageResult.url}`;
                  }
                  console.log("✅ Zalo reshare image package:", imagePart);

                  const zaloMsg = [
                    `${t.greetings[lang]}`,
                    hasContent && report.title && `\n\n${report.title}`,
                    report.description &&
                      `\n${t.fieldLabels.description[lang]}: ${report.description}`,
                    report.location &&
                      `\n${t.fieldLabels.location[lang]}: ${report.location}`,
                    report.coordinates ? ` (${report.coordinates})` : "",
                    report.contact &&
                      `\n${t.fieldLabels.contact[lang]}: ${report.contact}`,
                    imagePart,
                    `\n\n${t.closingLines[report.type][lang]}`,
                    `\n${t.closingLines.thank_you[lang]}`,
                    `\n\n${t.reportSharedVia[lang]} ${window.location.href}`,
                  ]
                    .filter(Boolean)
                    .join("\n");

                  console.log(
                    "🎯 Showing professional Zalo modal for reshare...",
                  );
                  createZaloSafariModal(
                    zaloMsg,
                    window.location.href,
                    report.title,
                    lang,
                  );
                } catch (error) {
                  console.error("❌ Zalo reshare failed:", error);
                  // Fallback without images
                  const fallbackMsg = [
                    `${t.greetings[lang]}`,
                    hasContent && report.title && `\n\n${report.title}`,
                    report.description &&
                      `\n${t.fieldLabels.description[lang]}: ${report.description}`,
                    report.location &&
                      `\n${t.fieldLabels.location[lang]}: ${report.location}`,
                    report.coordinates ? ` (${report.coordinates})` : "",
                    report.contact &&
                      `\n${t.fieldLabels.contact[lang]}: ${report.contact}`,
                    `\n\n${t.closingLines[report.type][lang]}`,
                    `\n${t.closingLines.thank_you[lang]}`,
                    `\n\n${t.reportSharedVia[lang]} ${window.location.href}`,
                  ]
                    .filter(Boolean)
                    .join("\n");

                  createZaloSafariModal(
                    fallbackMsg,
                    window.location.href,
                    report.title,
                    lang,
                  );
                }
              })();
              break;

            case "6": // Telegram
              (async function () {
                // ============================================
                // LOCK MECHANISM
                // ============================================
                const lockId = Date.now() + Math.random().toString(36);
                if (window._telegramReshareActive) {
                  console.log(
                    `🚫 TELEGRAM RESHARE BLOCKED ${lockId} - Already active`,
                  );
                  return;
                }
                window._telegramReshareActive = Date.now();

                try {
                  console.log(`📱 TELEGRAM RESHARE STARTED ${lockId}`);

                  // ============================================
                  // DEBUG - Inspect raw report data
                  // ============================================
                  console.log("📋 RAW REPORT DATA:", {
                    title: report.title,
                    description: report.description,
                    location: report.location,
                    coordinates: report.coordinates,
                    contact: report.contact,
                    type: report.type,
                    imageUrls: report.imageUrls?.length || 0,
                    hasContent: hasContent,
                  });

                  const t = TRANSLATION_PATCH;
                  const lang = localStorage.getItem("userLanguage") || "en";

                  // Create clean report
                  const cleanReport = {
                    ...report,
                    title:
                      report.title && report.title !== "Report"
                        ? report.title
                        : "",
                  };

                  // Check if empty
                  const isEmptyReport =
                    !cleanReport.title &&
                    !cleanReport.description &&
                    !cleanReport.location &&
                    !cleanReport.contact;

                  console.log("📋 CLEAN REPORT:", {
                    title: cleanReport.title,
                    description: cleanReport.description,
                    location: cleanReport.location,
                    coordinates: cleanReport.coordinates,
                    contact: cleanReport.contact,
                    type: cleanReport.type,
                    isEmpty: isEmptyReport,
                  });

                  // Get image package
                  let imagePart = "";
                  if (report.imageUrls?.length) {
                    try {
                      console.log(
                        `📸 Getting image package for ${report.imageUrls.length} images...`,
                      );
                      const imageResult =
                        await ImageProvider.getImagesForPlatform(
                          report.imageUrls,
                          "telegram",
                        );

                      if (imageResult.type === "package") {
                        imagePart = `\n🖼️ ${t.fieldLabels.images[lang]} (${imageResult.count}): ${imageResult.url}`;
                        console.log(
                          "✅ Image package created:",
                          imageResult.url,
                        );
                      } else {
                        console.log(
                          "⚠️ Unexpected image result type:",
                          imageResult.type,
                        );
                      }
                    } catch (error) {
                      console.log("❌ Image package failed:", error);
                    }
                  }

                  // Build message parts individually for debugging
                  const parts = {
                    greeting: t.greetings[lang],
                    title:
                      !isEmptyReport && cleanReport.title
                        ? `\n\n📌 ${cleanReport.title}`
                        : null,
                    description: cleanReport.description
                      ? `\n\n📝 ${t.fieldLabels.description[lang]}: ${cleanReport.description}`
                      : null,
                    location:
                      cleanReport.location || cleanReport.coordinates
                        ? `\n\n📍 ${t.fieldLabels.location[lang]}: ${cleanReport.location || ""}${cleanReport.coordinates ? ` (${cleanReport.coordinates})` : ""}`
                        : null,
                    contact: cleanReport.contact
                      ? `\n📞 ${t.fieldLabels.contact[lang]}: ${cleanReport.contact}`
                      : null,
                    image: imagePart || null,
                    closing: `\n\n${t.closingLines[cleanReport.type][lang]}`,
                    thankYou: `\n❤️ ${t.closingLines.thank_you[lang]}`,
                  };

                  console.log("📝 MESSAGE PARTS:", parts);

                  // Build message WITHOUT any URL first
                  const message = Object.values(parts).filter(Boolean).join("");

                  console.log("📏 MESSAGE LENGTH (base):", message.length);

                  // Add "Shared via" text and URL at the bottom
                  const fullMessage =
                    message +
                    `\n\n${t.reportSharedVia[lang]} ${window.location.href}`;

                  // Put FULL message in url parameter, leave text empty
                  const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(fullMessage)}&text=`;
                  console.log("📱 Telegram URL:", telegramUrl);
                  window.open(telegramUrl, "_blank");

                  console.log(`✅ TELEGRAM RESHARE COMPLETED ${lockId}`);
                } finally {
                  // Release lock
                  delete window._telegramReshareActive;
                  console.log(`🔓 TELEGRAM RESHARE LOCK RELEASED ${lockId}`);
                }
              })();
              break;

            default:
              alert(
                TRANSLATION_PATCH.errorMessages?.invalidPlatform?.[lang] ||
                  "Invalid choice",
              );
          }

          // Clean up temporary storage after a delay
          setTimeout(() => {
            localStorage.removeItem("currentReshareReport");
          }, 5000);

          window._resharingInProgress = false;
        } catch (error) {
          console.error("Reshare error:", error);
          alert("Reshare failed. Please try again.");
          window._resharingInProgress = false;
        }
      }

      // Add this NEW function - do not replace anything
      function handleReportReshare(report) {
        console.log("Resharing saved report ID:", report.id);
        console.log("Using custom platform selection popup");

        // Call the fallback function directly (no Web Share API)
        useFallbackReshare(report);
      }

      function useFallbackReshare(report) {
        console.log("✅ useFallbackReshare called with report:", report.id);
        console.log("📸 Report has images:", {
          imageUrls: report.imageUrls,
          imageCount: report.imageCount,
          firstImage: report.imageUrls?.[0],
        });

        // Store the report in a temporary location that handleReshareClick can find
        const reportToReshare = {
          ...report,
          timestamp: report.timestamp || Date.now().toString(),
        };

        // Save to localStorage with a special key for reshare
        localStorage.setItem(
          "currentReshareReport",
          JSON.stringify(reportToReshare),
        );

        // Create a fake event with the timestamp
        const fakeEvent = {
          target: {
            dataset: {
              id: reportToReshare.timestamp,
            },
          },
          preventDefault: () => {},
          stopImmediatePropagation: () => {},
        };

        console.log(
          "Calling handleReshareClick with timestamp:",
          reportToReshare.timestamp,
        );

        // Call your existing reshare handler
        if (typeof handleReshareClick === "function") {
          handleReshareClick(fakeEvent);
        } else {
          console.error("❌ handleReshareClick is not defined");
        }
      }

      // Make them globally accessible
      window.handleReportReshare = handleReportReshare;
      window.useFallbackReshare = useFallbackReshare;

      // ===== FACEBOOK MODAL (identical to your working version) =====
      // ===== UPDATED FACEBOOK MODAL (USES PASSED MESSAGE) =====
      function showFacebookShareModal(report) {
        const lang = localStorage.getItem("userLanguage") || "en";

        // USE THE PRE-BUILT MESSAGE FROM RESHARE, DON'T RECREATE IT
        const message = report.message; // This contains the image package

        console.log("🐛 Facebook modal - Using passed message:", message);
        console.log(
          "🐛 Contains image package:",
          message.includes("image-package.html"),
        );

        // Get the array of images for this report
        const imagesToShare = window.lastUploadedImages || [];

        // Update the Open Graph image tags (for Facebook crawler)
        for (let i = 0; i < 5; i++) {
          const metaTag = document.getElementById(`og-image-${i}`);
          if (metaTag && imagesToShare[i]) {
            metaTag.setAttribute("content", imagesToShare[i]);
          } else if (metaTag) {
            // Remove tag if no image for this slot
            metaTag.remove();
          }
        }

        // 🔧 ADD THIS NEW BLOCK RIGHT HERE, AFTER THE FOR LOOP
        // 🔧 REPLACE THE ENTIRE EXISTING BLOCK WITH THIS NEW FUNCTION
        // Update meta tags for Facebook with the correct URL (package or single)
        function updateMetaTagsForFacebook() {
          if (imagesToShare.length === 0) return;

          // Get the correct URL from ImageProvider
          ImageProvider.getImagesForPlatform(imagesToShare, "facebook")
            .then((imageResult) => {
              // Use the package URL for multiple images, or the single image URL
              const targetUrl = imageResult.url || imagesToShare[0];
              console.log("🔄 Setting og:image to:", targetUrl);

              // 1. Update the primary og:image tag
              let ogImageTag = document.querySelector(
                'meta[property="og:image"]',
              );
              if (!ogImageTag) {
                ogImageTag = document.createElement("meta");
                ogImageTag.setAttribute("property", "og:image");
                document.head.appendChild(ogImageTag);
              }
              ogImageTag.setAttribute("content", targetUrl);

              // 2. Also update og:url to help Facebook's context
              let ogUrlTag = document.querySelector('meta[property="og:url"]');
              if (!ogUrlTag) {
                ogUrlTag = document.createElement("meta");
                ogUrlTag.setAttribute("property", "og:url");
                document.head.appendChild(ogUrlTag);
              }
              ogUrlTag.setAttribute("content", window.location.href);

              console.log("✅ Meta tags updated for Facebook.");
            })
            .catch((error) =>
              console.error("❌ Failed to update meta tags:", error),
            );
        }

        // Run the update immediately and once more after a short delay
        updateMetaTagsForFacebook();
        setTimeout(updateMetaTagsForFacebook, 100);
        // 🔧 END OF REPLACEMENT BLOCK

        const modal = document.createElement("div");
        modal.style.cssText = `
    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
    background: rgba(0,0,0,0.8); z-index: 10000; display: flex;
    justify-content: center; align-items: center;
  `;

        modal.innerHTML = `
    <div style="
      background: white; padding: 20px; border-radius: 8px;
      max-width: 90%; width: 500px; max-height: 90vh;
      overflow: auto; box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    ">
      <h3 style="margin-top: 0;">${TRANSLATION_PATCH.facebookShare.title[lang]}</h3>
      <p>${TRANSLATION_PATCH.facebookShare.instructions[lang]}</p>
      <textarea id="fb-report" style="
        width: 100%; height: 200px; padding: 8px; margin: 10px 0;
        border: 1px solid #ddd; border-radius: 4px;
      ">${message}</textarea>
      <div style="display: flex; gap: 10px;">
        <button id="copy-fb" style="
          padding: 8px 12px; background: #4267B2; color: white;
          border: none; border-radius: 4px; flex-grow: 1;
        ">
          ${TRANSLATION_PATCH.facebookShare.buttons.copy[lang]}
        </button>
        <a href="https://www.facebook.com" target="_blank" style="
          padding: 8px 12px; background: #4267B2; color: white;
          border-radius: 4px; text-decoration: none; flex-grow: 1;
          text-align: center;
        ">
          ${TRANSLATION_PATCH.facebookShare.buttons.open[lang]}
        </a>
      </div>
      <button id="close-fb" style="
        padding: 8px 12px; margin-top: 10px; width: 100%;
        background: #f1f1f1; border: none; border-radius: 4px;
      ">
        ${TRANSLATION_PATCH.facebookShare.buttons.close[lang]}
      </button>
    </div>
  `;

        document.body.appendChild(modal);

        // Set up event listeners
        document
          .getElementById("copy-fb")
          .addEventListener("click", function () {
            const textarea = document.getElementById("fb-report");
            textarea.select();
            document.execCommand("copy");
            showCopiedAlert();
          });

        document
          .getElementById("close-fb")
          .addEventListener("click", function () {
            document.body.removeChild(modal);
          });
      }

      // Helper function
      function escapeHtml(text) {
        const div = document.createElement("div");
        div.textContent = text;
        return div.innerHTML;
      }

      // ===== EVENT LISTENER SETUP =====
      document.querySelectorAll(".reshare-btn").forEach((btn) => {
        btn.removeEventListener("click", handleReshareClick);
        btn.addEventListener("click", handleReshareClick);
      });

      // New function to fill the form
      function fillForm(report) {
        document.getElementById("report-title").value = report.title;
        document.getElementById("report-description").value =
          report.description || "";
        document.getElementById("location-text-input").value =
          report.location || "";
        document.getElementById("reporter-contact").value =
          report.contact || "";
        document.getElementById("report-type").value = report.type || "other";

        if (report.imageUrl) {
          localStorage.setItem("currentReshareImage", report.imageUrl);
        }
      }

      // Add this to check for reshared reports when page loads
      window.addEventListener("DOMContentLoaded", function () {
        const lastReshared = localStorage.getItem("lastResharedReport");
        if (lastReshared) {
          currentResharedReport = JSON.parse(lastReshared);
          fillForm(currentResharedReport);
          localStorage.removeItem("lastResharedReport");
        }
      });
    });

    // New Report button handler
    document
      .getElementById("new-report-btn")
      ?.addEventListener("click", function () {
        // Clear the form
        document.getElementById("report-title").value = "";
        document.getElementById("report-description").value = "";
        document.getElementById("location-text-input").value = "";
        document.getElementById("reporter-contact").value = "";
        document.getElementById("report-type").value = "other";
        window.lastReport = null;
        localStorage.removeItem("currentReshareImage");

        // Focus on first field
        document.getElementById("report-title").focus();
      });

    // Back to Dashboard button
    document
      .getElementById("back-to-dashboard")
      ?.addEventListener("click", function () {
        const possiblePaths = [
          "/dashboard.html",
          "/public/dashboard.html",
          "dashboard.html",
          "../dashboard.html",
          "/index.html",
        ];

        let validPath = possiblePaths.find((path) => {
          try {
            const xhr = new XMLHttpRequest();
            xhr.open("HEAD", path, false);
            xhr.send();
            return xhr.status === 200;
          } catch {
            return false;
          }
        });

        if (validPath) {
          window.location.href = validPath;
        } else {
          window.location.href = "/";
        }
      });

    renderSavedReports();
  }
  // ===== ADD THIS NEW FUNCTION IF NOT EXISTS =====
  function switchTab(tabId) {
    currentTab = tabId;

    // Hide all tab contents
    document.querySelectorAll(".tab-content").forEach((tab) => {
      tab.classList.remove("active");
    });

    // Show selected tab content
    document.getElementById(tabId).classList.add("active");

    // Update tab buttons
    document.querySelectorAll(".tab").forEach((tab) => {
      tab.classList.toggle("active", tab.dataset.tab === tabId);
    });

    // Focus on title field when switching to new report
    if (tabId === "new-report") {
      document.getElementById("report-title").focus();
    }

    // 🔥 FIX: Load saved reports from localStorage, not Firestore
    if (tabId === "saved-reports") {
      console.log(
        "📋 Saved Reports tab selected - loading reports from localStorage...",
      );
      setTimeout(() => {
        // Use the localStorage-based renderSavedReports function
        if (typeof window.renderSavedReports === "function") {
          window.renderSavedReports();
        } else {
          console.error("window.renderSavedReports not found");
          // Fallback: try to use the sharing.js version
          if (typeof renderSavedReports === "function") {
            renderSavedReports();
          }
        }
      }, 100);
    }
  }

  // Initialize when DOM is ready
  if (document.readyState !== "loading") {
    initSavedReports();
  } else {
    document.addEventListener("DOMContentLoaded", initSavedReports);
  }
  // ===== [START NEW SHARING FUNCTIONS] =====

  // Updated getStandardMessage (preserves all existing calls)
  // Updated for labels, emojis, and app link
  function getStandardMessage(report) {
    // Context line with emoji
    const contextLine = (() => {
      const lines = {
        missing_person: "🙏 Please help find. Share widely",
        lost_item: "🔍 Please help locate",
        found_person: "🏠 Please help reunite with family",
        found_item: "📞 Please contact if this is yours",
        other: "🎉 Join us. Spread the word",
      };
      return lines[(report.type || "").toLowerCase().trim()] || "";
    })();

    // Build message (with labels, emojis, and forced coordinates)
    return [
      `*${report.title}*`,
      `*Description:* ${report.description}`,
      `*Location:* ${report.location}${
        report.coords ? ` (${report.coords})` : ""
      }`,
      `*Contact:* ${report.contact}`,
      report.imageUrl ? `*Image:* ${report.imageUrl}` : "",
      `${contextLine}\n❤️ Thank you for your assistance`,
      `\n\n_Report generated via MissingLostAndFoundApp: ${window.location.href}_`, // App link
    ]
      .filter(Boolean)
      .join("\n");
  }

  // ===== [END NEW FUNCTIONS] =====
  function generateShareContent(reportData) {
    const lang = localStorage.getItem("userLanguage") || "en";
    const type = reportData.type || "other";

    // Get all translations
    const t = {
      greeting:
        TRANSLATION_PATCH.greetings[lang] || TRANSLATION_PATCH.greetings.en,
      fields: {
        title:
          TRANSLATION_PATCH.fieldLabels.title[lang] ||
          TRANSLATION_PATCH.fieldLabels.title.en,
        description:
          TRANSLATION_PATCH.fieldLabels.description[lang] ||
          TRANSLATION_PATCH.fieldLabels.description.en,
        location:
          TRANSLATION_PATCH.fieldLabels.location[lang] ||
          TRANSLATION_PATCH.fieldLabels.location.en,
        contact:
          TRANSLATION_PATCH.fieldLabels.contact[lang] ||
          TRANSLATION_PATCH.fieldLabels.contact.en,
        image:
          TRANSLATION_PATCH.fieldLabels.image[lang] ||
          TRANSLATION_PATCH.fieldLabels.image.en,
      },
      closing:
        TRANSLATION_PATCH.closingLines[type]?.[lang] ||
        TRANSLATION_PATCH.closingLines[type]?.en ||
        "",
      thankYou:
        TRANSLATION_PATCH.closingLines.thank_you[lang] ||
        TRANSLATION_PATCH.closingLines.thank_you.en,
    };

    // Build the message
    return [
      `${t.greeting}\n`,
      `${t.fields.title} ${reportData.title}`,
      `${t.fields.description} ${reportData.description}`,
      `${t.fields.location} ${reportData.location}`,
      reportData.coordinates ? ` (${reportData.coordinates})` : "",
      `${t.fields.contact} ${reportData.contact}`,
      reportData.imageUrl ? `\n${t.fields.image} ${reportData.imageUrl}` : "",
      `\n\n${t.closing}`,
      `\n${t.thankYou}`,
      `\n\n${TRANSLATION_PATCH.reportSharedVia[lang]} MissingLostAndFoundApp`,
    ]
      .filter(Boolean)
      .join("\n");
  }

  // ============================================
  // VIOLATION CHECK BEFORE SHARING
  // ============================================
  function isReportViolating(report) {
    const prohibitedWords = [
      "đánh bom",
      "bomb",
      "khủng bố",
      "tài khoản ngân hàng",
      "bank account",
      "porn",
      "sex",
      "khiêu dâm",
    ];
    const textToCheck = (report.title + " " + report.description).toLowerCase();

    for (const word of prohibitedWords) {
      if (textToCheck.includes(word.toLowerCase())) {
        return true;
      }
    }
    return false;
  }

  function showViolationAlert() {
    const lang = localStorage.getItem("userLanguage") || "en";
    const messages = {
      en: "❌ Cannot share: This content violates our terms of service.",
      vi: "❌ Không thể chia sẻ: Nội dung này vi phạm điều khoản dịch vụ.",
      zh: "❌ 无法分享：此内容违反服务条款。",
      es: "❌ No se puede compartir: Este contenido viola nuestros términos de servicio.",
      hi: "❌ साझा नहीं कर सकते: यह सामग्री हमारी सेवा की शर्तों का उल्लंघन करती है।",
      ar: "❌ لا يمكن المشاركة: هذا المحتوى ينتهك شروط الخدمة الخاصة بنا.",
    };
    alert(messages[lang] || messages.en);
  }

  // ===== 3. SHARING SECTION INIT =====
  const shareSection = document.getElementById("share-section");
  if (shareSection) {
    shareSection.style.display = "block";

    // ===== 4. EXISTING SHARE FUNCTIONS =====

    // Twitter sharing
    // Twitter sharing - OPTIMIZED FOR IMAGE PACKAGES
    const originalTwitterHandler =
      document.getElementById("twitter-share").onclick;
    document.getElementById("twitter-share").onclick = async function (e) {
      e.preventDefault();

      // 1. GET REPORT DATA
      let report;
      try {
        report = getReport() || {};

        // ✅ ADD VIOLATION CHECK
        if (isReportViolating(report)) {
          showViolationAlert();
          return;
        }
      } catch {
        report = {};
      }

      // 2. GET SHORT IMAGE PACKAGE URL FOR TWITTER
      let imageLink = "";
      try {
        console.log("🐦 Getting short image package for Twitter...");
        const imageResult = await ImageProvider.getImagesForPlatform(
          report.imageUrls || [],
          "twitter",
        );

        if (imageResult.url) {
          // Twitter needs the shortest possible URL
          imageLink = `📸 ${imageResult.url}`;
          console.log("✅ Twitter image package:", imageLink);
        }
      } catch (error) {
        console.log("❌ Twitter image package failed:", error.message);
      }

      // 3. TWITTER-OPTIMIZED MESSAGE (MINIMAL FIELDS)
      const lang = localStorage.getItem("userLanguage") || "en";
      const tweetContent = [
        report.title || t("defaultTitle", lang),
        imageLink, // SHORT IMAGE PACKAGE LINK
        report.contact ? `Contact: ${report.contact}` : "", // OPTIONAL CONTACT
        `🙏 ${t("closingLines.thank_you", lang)}`,
        `via ${window.location.hostname}`,
      ]
        .filter((part) => part && part.trim()) // Remove empty parts
        .join(" • ") // Twitter-friendly separator
        .substring(0, 280); // Hard Twitter limit

      console.log("🐦 TWITTER-OPTIMIZED TWEET:", tweetContent);
      console.log("🐦 Tweet length:", tweetContent.length);

      // 4. OPEN TWITTER
      window.open(
        `https://twitter.com/intent/tweet?text=${encodeURIComponent(
          tweetContent,
        )}`,
        "_blank",
      );
    };

    // 1. FACEBOOK SHARING (revert to reliable copy-paste method)
    // ===== FACEBOOK SHARING =====
    // ===== DEBUGGED FACEBOOK SHARING WITH 5-IMAGE PACKAGES =====
    document
      .getElementById("facebook-share")
      ?.addEventListener("click", async function (e) {
        e.preventDefault();
        console.log("🐛 DEBUG: Facebook share clicked");

        // ADD THIS LINE RIGHT HERE, after the console.log:
        showNoticeBeforeFacebookShare(); // ← ADD THIS LINE

        const lang = localStorage.getItem("userLanguage") || "en";
        const t = TRANSLATION_PATCH;
        const report = getReport();

        // ✅ ADD VIOLATION CHECK
        if (isReportViolating(report)) {
          showViolationAlert();
          return;
        }

        // DEBUG: Check what images are available
        console.log("🐛 window.lastUploadedImages:", window.lastUploadedImages);
        console.log("🐛 report.imageUrl:", report.imageUrl);
        console.log("🐛 All report data:", report);

        // Check if report is empty (ignore the default "Report" title)
        const isEmptyReport =
          !document.getElementById("report-title").value &&
          !document.getElementById("report-description").value &&
          !document.getElementById("location-text-input").value &&
          !document.getElementById("reporter-contact").value;

        // GET IMAGE PACKAGE FOR FACEBOOK (5 IMAGES)
        let imagePart = "";
        try {
          console.log("💙 Getting image package for Facebook...");

          // Use the actual uploaded images, not report.imageUrl
          const imagesToPackage = window.lastUploadedImages || [];
          console.log("💙 Images to package:", imagesToPackage);

          const imageResult = await ImageProvider.getImagesForPlatform(
            imagesToPackage,
            "facebook",
          );

          // ADD THIS LINE (after the await, before using imageResult):
          if (imageResult && imageResult.url) {
            imageResult.url = ensureFacebookImageAccessibility(imageResult.url);
          }

          console.log("💙 ImageProvider result:", imageResult);

          if (imageResult.type === "single" && imageResult.url) {
            imagePart = `\n🖼️ ${t.fieldLabels.image[lang]}: ${imageResult.url}`;
          } else if (imageResult.type === "package" && imageResult.url) {
            imagePart = `\n🖼️ ${t.fieldLabels.images[lang]} (${imageResult.count}): ${imageResult.url}`;
          }
          console.log("✅ Facebook image package result:", imagePart);

          // ===== ADD THE META TAG UPDATE RIGHT HERE =====
          const firstImage = window.lastUploadedImages?.[0] || report.imageUrl;
          updateFacebookMetaTagsForSharing(
            report.title,
            report.description,
            firstImage,
          );
          // ===== END ADDITION =====
        } catch (error) {
          console.log("❌ Facebook image package failed:", error.message);
          // Fallback to single image from report
          if (report.imageUrl) {
            imagePart = `\n🖼️ ${t.fieldLabels.image[lang]}: ${report.imageUrl}`;
            console.log("🔄 Using fallback single image");
          }
        }

        // Build message components (skip title for empty reports)
        const messageParts = [
          `${t.greetings[lang]}`,
          // Only include title if report isn't empty
          !isEmptyReport && report.title ? `\n\n📌 ${report.title}` : "",
          report.description &&
            `\n\n📝 ${t.fieldLabels.description[lang]}: ${report.description}`,
          (report.location || report.coordinates) &&
            `\n\n📍 ${t.fieldLabels.location[lang]}: ${report.location || ""}${
              report.coordinates ? ` (${report.coordinates})` : ""
            }`,
          report.contact &&
            `\n📞 ${t.fieldLabels.contact[lang]}: ${report.contact}`,
          imagePart, // USE IMAGE PACKAGE INSTEAD OF SINGLE IMAGE
          `\n\n${t.closingLines[report.type][lang]}`,
          `\n❤️ ${t.closingLines.thank_you[lang]}`,
          `\n\n${t.reportSharedVia[lang]} ${report.pageUrl}`,
        ];

        // Filter out empty parts and join
        const message = messageParts.filter(Boolean).join("");

        console.log("🐛 Final Facebook message:", message);
        console.log(
          "🐛 Contains image package:",
          message.includes("image-package.html"),
        );

        // Create and show modal (using your existing structure)
        const modal = document.createElement("div");
        modal.style.cssText = `
      position: fixed; top: 0; left: 0; width: 100%; height: 100%;
      background: rgba(0,0,0,0.8); z-index: 10000; display: flex;
      justify-content: center; align-items: center;
    `;

        modal.innerHTML = `
      <div style="
          background: white; padding: 20px; border-radius: 8px;
          max-width: 90%; width: 500px; max-height: 90vh;
          overflow: auto; box-shadow: 0 4px 8px rgba(0,0,0,0.1);
      ">
          <h3 style="margin-top: 0;">${t.facebookShare.title[lang]}</h3>
          <p>${t.facebookShare.instructions[lang]}</p>
          <textarea id="fb-report" style="
              width: 100%; height: 200px; padding: 8px; margin: 10px 0;
              border: 1px solid #ddd; border-radius: 4px;
          ">${message}</textarea>
          <div style="display: flex; gap: 10px;">
              <button id="copy-fb" style="
                  padding: 8px 12px; background: #4267B2; color: white;
                  border: none; border-radius: 4px; flex-grow: 1;
              ">
                  ${t.facebookShare.buttons.copy[lang]}
              </button>
              <a href="https://www.facebook.com" target="_blank" style="
                  padding: 8px 12px; background: #4267B2; color: white;
                  border-radius: 4px; text-decoration: none; flex-grow: 1;
                  text-align: center;
              ">
                  ${t.facebookShare.buttons.open[lang]}
              </a>
          </div>
          <button id="close-fb" style="
              padding: 8px 12px; margin-top: 10px; width: 100%;
              background: #f1f1f1; border: none; border-radius: 4px;
          ">
              ${t.facebookShare.buttons.close[lang]}
          </button>
      </div>
    `;

        document.body.appendChild(modal);

        // Set up event listeners
        document
          .getElementById("copy-fb")
          .addEventListener("click", function () {
            const textarea = document.getElementById("fb-report");
            textarea.select();
            document.execCommand("copy");
            showCopiedAlert();
          });

        document
          .getElementById("close-fb")
          .addEventListener("click", function () {
            document.body.removeChild(modal);
          });
      });

    // ===== EMAIL SHARE HANDLER =====
    // ===== DEBUGGED EMAIL SHARE HANDLER FOR MOBILE =====
    document
      .getElementById("email-share")
      ?.addEventListener("click", async function (e) {
        e.preventDefault();
        console.log("🐛 DEBUG: Email share clicked");

        const lang = localStorage.getItem("userLanguage") || "en";
        const t = TRANSLATION_PATCH;
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

        try {
          // 1. Get report and check if it's empty by looking at actual inputs
          const report = getReport();

          // ✅ ADD VIOLATION CHECK
          if (isReportViolating(report)) {
            showViolationAlert();
            return;
          }
          const isEmptyReport =
            !document.getElementById("report-title").value &&
            !document.getElementById("report-description").value &&
            !document.getElementById("location-text-input").value &&
            !document.getElementById("reporter-contact").value;

          // DEBUG: Check what images are available on mobile
          console.log("🐛 Mobile check - isMobile:", isMobile);
          console.log(
            "🐛 window.lastUploadedImages:",
            window.lastUploadedImages,
          );
          console.log("🐛 report.imageUrl:", report.imageUrl);

          // 2. GET IMAGE PACKAGE FOR EMAIL (5 IMAGES)
          let imagePart = "";
          if (!isEmptyReport) {
            try {
              console.log("💙 Getting image package for Email...");

              // Use the actual uploaded images, ensure we have the array
              const imagesToPackage = window.lastUploadedImages || [];
              console.log("💙 Images to package:", imagesToPackage);

              const imageResult = await ImageProvider.getImagesForPlatform(
                imagesToPackage,
                "email",
              );

              console.log("💙 Email image result:", imageResult);

              if (imageResult.type === "single" && imageResult.url) {
                imagePart = `🖼️ ${t.fieldLabels.image[lang]}: ${imageResult.url}\n\n`;
                if (isMobile) console.log("📱 MOBILE: Using single image");
              } else if (imageResult.type === "package" && imageResult.url) {
                imagePart = `🖼️ ${t.fieldLabels.images[lang]} (${imageResult.count}): ${imageResult.url}\n\n`;
                if (isMobile) console.log("📱 MOBILE: Using image package");
              }
              console.log("✅ Email image package result:", imagePart);
            } catch (error) {
              console.log("❌ Email image package failed:", error.message);
              // Fallback to single image
              if (report.imageUrl) {
                imagePart = `🖼️ ${t.fieldLabels.image[lang]}: ${report.imageUrl}\n\n`;
                if (isMobile)
                  console.log("📱 MOBILE: Using fallback single image");
              }
            }
          }

          // 3. Build subject - empty for empty reports
          const subject = isEmptyReport
            ? "" // Empty subject for empty reports
            : report.title || t.defaultTitle[lang];

          // 4. Build email body - skip all fields for empty reports
          const emailBody = isEmptyReport
            ? [
                `${t.greetings[lang]}\n\n`,
                `${t.closingLines.thank_you[lang]}\n\n`,
                `${t.reportSharedVia[lang]} ${
                  report.pageUrl || window.location.href
                }`,
              ]
                .filter(Boolean)
                .join("")
            : [
                `${t.greetings[lang]}\n\n`,
                report.title && `📌 ${report.title}\n\n`,
                report.description &&
                  `📝 ${t.fieldLabels.description[lang]}: ${report.description}\n\n`,
                (report.location || report.coordinates) &&
                  `📍 ${t.fieldLabels.location[lang]}: ${
                    report.location || ""
                  }${report.coordinates ? ` (${report.coordinates})` : ""}\n\n`,
                report.contact &&
                  `📞 ${t.fieldLabels.contact[lang]}: ${report.contact}\n\n`,
                imagePart, // USE IMAGE PACKAGE INSTEAD OF SINGLE IMAGE
                `${t.closingLines[report.type][lang]}\n\n`,
                `❤️ ${t.closingLines.thank_you[lang]}\n\n`,
                `${t.reportSharedVia[lang]} ${
                  report.pageUrl || window.location.href
                }`,
              ]
                .filter(Boolean)
                .join("");

          console.log(
            "🐛 Final Email body contains image package:",
            emailBody.includes("image-package.html"),
          );
          if (isMobile) {
            console.log(
              "📱 MOBILE FINAL CHECK - Image package in body:",
              emailBody.includes("image-package.html"),
            );
            if (!emailBody.includes("image-package.html")) {
              console.log(
                "🚨 MOBILE PROBLEM: Image package missing from email body!",
              );
            }
          }

          // 5. Show your existing email modal
          // 5. Show email modal with Yahoo detection
          showEmailShareModal({
            subject: subject,
            body: emailBody,
            lang: lang,
            showEmailInput: true,
            onEmailEntered: function (recipientEmail) {
              // This function will be called when user enters an email
              if (isYahooEmail(recipientEmail)) {
                // Store that this is a Yahoo recipient
                sessionStorage.setItem("lastRecipientIsYahoo", "true");
              }
            },
          });
          // In your email share function, when showing the modal
          const recipientEmail =
            document.getElementById("recipient-email")?.value;
          if (recipientEmail && isYahooEmail(recipientEmail)) {
            console.log("📧 Yahoo recipient detected - will add instructions");
          }
        } catch (error) {
          console.error("Email error:", error);
          const lang = localStorage.getItem("userLanguage") || "en";
          showEmailShareModal({
            subject: t.errorMessages.emailError[lang],
            body: t.errorMessages.emailFailed[lang],
            lang: lang,
          });
        }
        // Add this function to detect Yahoo
        function isYahooEmail(email) {
          return email && email.toLowerCase().includes("@yahoo.com");
        }
      });

    // Telegram Share Function
    document
      .getElementById("telegram-share")
      ?.addEventListener("click", async function (e) {
        e.preventDefault();

        // ============================================
        // LOCK MECHANISM
        // ============================================
        const lockId = Date.now() + Math.random().toString(36);
        if (window._telegramShareActive) {
          console.log(`🚫 TELEGRAM SHARE BLOCKED ${lockId} - Already active`);
          return;
        }
        window._telegramShareActive = Date.now();

        try {
          console.log(`📱 TELEGRAM SHARE STARTED ${lockId}`);

          const report = getReport();

          // ✅ ADD VIOLATION CHECK
          if (isReportViolating(report)) {
            showViolationAlert();
            return;
          }

          const t = TRANSLATION_PATCH;
          const lang = localStorage.getItem("userLanguage") || "en";

          if (!report || !report.title) {
            alert("Please create a report first");
            return;
          }

          // ============================================
          // SAVE CURRENT FORM DATA BEFORE SHARING
          // ============================================
          const formDataBeforeShare = {
            title: document.getElementById("report-title")?.value || "",
            description:
              document.getElementById("report-description")?.value || "",
            location:
              document.getElementById("location-text-input")?.value || "",
            coordinates:
              document.getElementById("selected-coordinates")?.value || "",
            contact: document.getElementById("reporter-contact")?.value || "",
            type: document.getElementById("report-type")?.value || "",
            imageUrls: window.lastUploadedImages || [],
            imageCount: window.lastUploadedImages?.length || 0,
            timestamp: Date.now(),
          };
          localStorage.setItem(
            "savedFormDataBeforeShare",
            JSON.stringify(formDataBeforeShare),
          );
          console.log("💾 Form data saved before Telegram share");

          // ============================================
          // DEBUG - Inspect raw report data
          // ============================================
          console.log("📋 RAW REPORT DATA:", {
            title: report.title,
            description: report.description,
            location: report.location,
            coordinates: report.coordinates,
            contact: report.contact,
            type: report.type,
            lastUploadedImages: window.lastUploadedImages?.length || 0,
          });

          // Create clean report
          const cleanReport = {
            ...report,
            title:
              report.title && report.title !== "Report" ? report.title : "",
          };

          // Check if empty
          const isEmptyReport =
            !cleanReport.title &&
            !cleanReport.description &&
            !cleanReport.location &&
            !cleanReport.contact;

          // Get image package
          let imagePart = "";
          if (window.lastUploadedImages?.length) {
            try {
              console.log(
                `📸 Getting image package for ${window.lastUploadedImages.length} images...`,
              );
              const imageResult = await ImageProvider.getImagesForPlatform(
                window.lastUploadedImages,
                "telegram",
              );

              if (imageResult.type === "package") {
                imagePart = `\n🖼️ ${t.fieldLabels.images[lang]} (${imageResult.count}): ${imageResult.url}`;
                console.log("✅ Image package created:", imageResult.url);
              }
            } catch (error) {
              console.log("❌ Image package failed:", error);
            }
          }

          // Build message parts individually for debugging
          const parts = {
            greeting: t.greetings[lang],
            title:
              !isEmptyReport && cleanReport.title
                ? `\n\n📌 ${cleanReport.title}`
                : null,
            description: cleanReport.description
              ? `\n\n📝 ${t.fieldLabels.description[lang]}: ${cleanReport.description}`
              : null,
            location:
              cleanReport.location || cleanReport.coordinates
                ? `\n\n📍 ${t.fieldLabels.location[lang]}: ${cleanReport.location || ""}${cleanReport.coordinates ? ` (${cleanReport.coordinates})` : ""}`
                : null,
            contact: cleanReport.contact
              ? `\n📞 ${t.fieldLabels.contact[lang]}: ${cleanReport.contact}`
              : null,
            image: imagePart || null,
            closing: `\n\n${t.closingLines[cleanReport.type][lang]}`,
            thankYou: `\n❤️ ${t.closingLines.thank_you[lang]}`,
          };

          console.log("📝 MESSAGE PARTS:", parts);

          // Build message WITHOUT any URL first
          const message = Object.values(parts).filter(Boolean).join("");
          console.log("📏 MESSAGE LENGTH (base):", message.length);

          // Add "Shared via" text and URL at the bottom
          const fullMessage =
            message + `\n\n${t.reportSharedVia[lang]} ${window.location.href}`;

          // Put FULL message in url parameter, leave text empty
          const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(fullMessage)}&text=`;
          console.log("📱 Telegram URL:", telegramUrl);
          window.open(telegramUrl, "_blank");

          console.log(`✅ TELEGRAM SHARE COMPLETED ${lockId}`);

          // ============================================
          // RESTORE FORM DATA AFTER SHARE (when user returns)
          // ============================================
          // Check periodically if the Telegram window is closed
          const restoreTimer = setInterval(() => {
            // If the user has returned (window is focused), restore data
            if (document.hasFocus()) {
              const savedData = localStorage.getItem(
                "savedFormDataBeforeShare",
              );
              if (savedData) {
                const data = JSON.parse(savedData);
                console.log("🔄 Restoring form data after Telegram share");

                // Restore form fields
                if (data.title)
                  document.getElementById("report-title").value = data.title;
                if (data.description)
                  document.getElementById("report-description").value =
                    data.description;
                if (data.location)
                  document.getElementById("location-text-input").value =
                    data.location;
                if (data.coordinates)
                  document.getElementById("selected-coordinates").value =
                    data.coordinates;
                if (data.contact)
                  document.getElementById("reporter-contact").value =
                    data.contact;
                if (data.type)
                  document.getElementById("report-type").value = data.type;

                // Restore images
                if (data.imageUrls && data.imageUrls.length > 0) {
                  window.lastUploadedImages = data.imageUrls;
                  const fileLabel = document.getElementById("file-input-label");
                  if (fileLabel) {
                    const lang = localStorage.getItem("userLanguage") || "en";
                    const fileText =
                      data.imageCount === 1
                        ? TRANSLATION_PATCH?.fileInput?.oneFile?.[lang] ||
                          "1 file selected"
                        : TRANSLATION_PATCH?.fileInput?.multipleFiles?.[lang] ||
                          `${data.imageCount} files selected`;
                    fileLabel.textContent = fileText;
                  }
                }

                // Clean up
                localStorage.removeItem("savedFormDataBeforeShare");
                clearInterval(restoreTimer);
              }
            }
          }, 1000);

          // Safety timeout: clear after 30 seconds if not restored
          setTimeout(() => {
            clearInterval(restoreTimer);
            localStorage.removeItem("savedFormDataBeforeShare");
          }, 30000);
        } finally {
          // Release lock after a delay (not immediately, to allow restore)
          setTimeout(() => {
            delete window._telegramShareActive;
            console.log(`🔓 TELEGRAM SHARE LOCK RELEASED ${lockId}`);
          }, 2000);
        }
      });

    // === SAFE TRANSLATION FUNCTION FOR SHARING (STANDALONE) ===
    // This function ensures sharing always has translations, independent of other code.
    function getSharingTranslation(key, languageCode) {
      // Define a full, local dictionary of all translations needed for sharing.
      // This eliminates any dependency on other loaded files.
      const sharingTranslations = {
        en: {
          greetings: "Hello, I would like to share this report:",
          fieldLabels: {
            description: "Description",
            location: "Location",
            contact: "Contact",
            image: "Image",
            images: "Images",
          },
          closingLines: {
            missing_person: "Please help find this missing person.",
            lost_item: "Please help locate this lost item.",
            found_person: "Please help reunite with family",
            found_item: "Please claim this found item if it's yours.",
            event: "Please join and share this event.",
            other: "Please see this report.",
            thank_you: "Thank you for your assistance!",
          },
          reportSharedVia: "Report shared via Connections App:",
        },
        vi: {
          greetings: "Xin chào, tôi muốn chia sẻ thông tin này:",
          fieldLabels: {
            description: "Mô tả",
            location: "Địa điểm",
            contact: "Liên hệ",
            image: "Hình ảnh",
            images: "Hình ảnh",
          },
          closingLines: {
            missing_person: "Xin hãy giúp tìm người mất tích này.",
            lost_item: "Xin hãy giúp tìm đồ vật bị mất này.",
            found_person: "Vui lòng giúp đoàn tụ với gia đình",
            found_item: "Nếu là tài sản của bạn, hãy đến nhận lại.",
            event: "Hãy tham gia và chia sẻ sự kiện này.",
            other: "Vui lòng xem báo cáo này.",
            thank_you: "Cảm ơn sự hỗ trợ của bạn!",
          },
          reportSharedVia: "Báo cáo được chia sẻ từ Ứng dụng Kết Nối:",
        },
        zh: {
          greetings: "你好，我想分享这份报告：",
          fieldLabels: {
            description: "描述",
            location: "地点",
            contact: "联系方式",
            image: "图片",
            images: "图片",
          },
          closingLines: {
            missing_person: "请帮助我们找到这个失踪的人。",
            lost_item: "请帮我找到这个丢失的物品。",
            found_person: "请帮助与家人团聚",
            found_item: "如果是你的，请认领这个找到的物品。",
            event: "请参加或分享这个活动。",
            other: "请查看这份报告。",
            thank_you: "谢谢你的帮助！",
          },
          reportSharedVia: "报告通过“连接”应用分享：",
        },
        es: {
          greetings: "Hola, me gustaría compartir este reporte:",
          fieldLabels: {
            description: "Descripción",
            location: "Ubicación",
            contact: "Contacto",
            image: "Imagen",
            images: "Imágenes",
          },
          closingLines: {
            missing_person:
              "Por favor, ayúdenos a encontrar a esta persona desaparecida.",
            lost_item: "Por favor, ayúdame a encontrar este objeto perdido.",
            found_person: "Por favor, ayude a reunirse con la familia",
            found_item: "Por favor, reclame este objeto encontrado si es suyo.",
            event: "Por favor, únase o comparta este evento.",
            other: "Por favor, vea este reporte.",
            thank_you: "¡Gracias por su ayuda!",
          },
          reportSharedVia: "Reporte compartido via App Conexiones:",
        },
        hi: {
          greetings: "नमस्ते, मैं यह रिपोर्ट साझा करना चाहता हूँ:",
          fieldLabels: {
            description: "विवरण",
            location: "स्थान",
            contact: "संपर्क",
            image: "छवि",
            images: "छवियाँ",
          },
          closingLines: {
            missing_person:
              "कृपया इस लापता व्यक्ति को खोजने में हमारी मदद करें।",
            lost_item: "कृपया इस खोई हुई वस्तु को खोजने में मेरी सहायता करें।",
            found_person: "कृपया परिवार के साथ पुनर्मिलन में मदद करें",
            found_item:
              "यदि यह आपका है, तो कृपया इस मिली हुई वस्तु का दावा करें।",
            event: "कृपया इस कार्यक्रम में शामिल हों या इसे साझा करें。",
            other: "कृपया इस रिपोर्ट को देखें।",
            thank_you: "आपकी सहायता के लिए धन्यवाद!",
          },
          reportSharedVia: "कनेक्शन ऐप के माध्यम से साझा की गई रिपोर्ट:",
        },
        ar: {
          greetings: "مرحبًا، أود مشاركة هذا التقرير:",
          fieldLabels: {
            description: "الوصف",
            location: "الموقع",
            contact: "جهة الاتصال",
            image: "صورة",
            images: "الصور",
          },
          closingLines: {
            missing_person: "من فضلك ساعدنا في العثور على هذا الشخص المفقود.",
            lost_item: "من فضلك ساعدني في العثور على هذا العنصر المفقود.",
            found_person: "يرجى المساعدة في لم الشمل مع الأسرة",
            found_item: "إذا كان هذا العنصر ملكك, من فضلك تقم بالمطالبة به.",
            event: "من فضلك انضم أو شارك هذا الحدث.",
            other: "من فضلك اطلع على هذا التقرير.",
            thank_you: "شكرًا لك على مساعدتك!",
          },
          reportSharedVia: "تم مشاركة التقرير عبر تطبيق Connections:",
        },
      };

      // Get the chosen language dictionary, or fallback to English
      const langDict =
        sharingTranslations[languageCode] || sharingTranslations.en;

      // Safely navigate the key path (e.g., "fieldLabels.description")
      const keys = key.split(".");
      let value = langDict;

      for (const k of keys) {
        if (value && value.hasOwnProperty(k)) {
          value = value[k];
        } else {
          // If the key path is broken, fallback to English
          console.warn(
            `Translation key "${key}" not found for language "${languageCode}". Falling back to English.`,
          );
          const enValue = keys.reduce(
            (obj, k) => (obj && obj[k] !== undefined ? obj[k] : ""),
            sharingTranslations.en,
          );
          return enValue || key; // Return the English value, or the key itself as a last resort
        }
      }
      return value || key; // Return the found value, or the key as a last resort
    }

    // === UNIVERSAL ZALO SHARE FUNCTION ===
    // === PROFESSIONAL ZALO SHARE WITH SAFARI BUTTON ===
    // === UPDATED UNIVERSAL ZALO SHARE FUNCTION ===
    function shareViaZalo(message, url, reportTitle = "") {
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      const lang = localStorage.getItem("userLanguage") || "en";

      if (isMobile) {
        createZaloSafariModal(message, url, reportTitle, lang);
      } else {
        const messages = {
          en: "Zalo sharing is optimized for mobile devices. Please use your phone to share via Zalo, or use another sharing option.",
          vi: "Chia sẻ Zalo được tối ưu hóa cho thiết bị di động. Vui lòng sử dụng điện thoại để chia sẻ qua Zalo hoặc sử dụng tùy chọn chia sẻ khác.",
          es: "Compartir por Zalo está optimizado para dispositivos móviles. Por favor use su teléfono para compartir via Zalo, o use otra opción de compartir.",
          zh: "Zalo 分享已针对移动设备进行优化。请使用手机通过 Zalo 分享，或使用其他分享选项。",
          hi: "Zalo शेयरिंग मोबाइल उपकरणों के लिए अनुकूलित है। कृपया Zalo के माध्यम से sझा करने के लिए अपने फोन का उपयोग करें, या किसी अन्य साझा विकल्प का उपयोग करें।",
          ar: "تم تحسين مشاركة Zalo للأجهزة المحمولة. يرجى استخدام هاتفك للمشاركة عبر Zalo، أو استخدام خيار مشاركة آخر.",
        };
        alert(messages[lang] || messages.en);
      }
    }

    // === UPDATED PROFESSIONAL MODAL ===
    // === UPDATED ZALO MODAL FOR MOBILE SUPPORT ===
    // === SIMPLIFIED ZALO MODAL (REVERT TO WORKING VERSION) ===
    function createZaloSafariModal(message, url, reportTitle, lang) {
      const existingModal = document.getElementById("zalo-safari-modal");
      if (existingModal) existingModal.remove();

      // SIMPLE URL EXTRACTION - USE WHAT WAS WORKING
      const imageUrlMatch = message.match(
        /(https:\/\/[^\s]+image-package\.html\?id=img_[^\s]+)/,
      );
      const imagePackageUrl = imageUrlMatch ? imageUrlMatch[0] : null;

      console.log("📱 Image package URL detected:", imagePackageUrl);

      const modalHTML = `
    <div id="zalo-safari-modal" style="
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.8);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 10000;
      font-family: Arial, sans-serif;
    ">
      <div style="
        background: white;
        padding: 25px;
        border-radius: 15px;
        max-width: 90%;
        max-height: 80%;
        overflow-y: auto;
        text-align: center;
        box-shadow: 0 10px 30px rgba(0,0,0,0.3);
      ">
        <h2 style="color: #0068FF; margin-bottom: 15px;">📱 ${getZaloModalTitle(
          lang,
        )}</h2>
        <p style="color: #666; margin-bottom: 20px; line-height: 1.4;">${getZaloModalMessage(
          lang,
        )}</p>
        
        <div style="display: flex; gap: 10px; justify-content: center; margin-top: 25px; flex-wrap: wrap;">
          <button id="safari-btn" style="
            background: #0068FF;
            color: white;
            border: none;
            padding: 12px 25px;
            border-radius: 25px;
            font-size: 16px;
            cursor: pointer;
            font-weight: bold;
          ">🌐 ${getSafariButtonText(lang)}</button>
          
          <button id="copy-btn" style="
            background: #28a745;
            color: white;
            border: none;
            padding: 12px 25px;
            border-radius: 25px;
            font-size: 16px;
            cursor: pointer;
            font-weight: bold;
          ">📋 ${getCopyButtonText(lang)}</button>
          
          <button id="close-btn" style="
            background: #6c757d;
            color: white;
            border: none;
            padding: 12px 25px;
            border-radius: 25px;
            font-size: 16px;
            cursor: pointer;
            font-weight: bold;
          ">${getCloseButtonText(lang)}</button>
        </div>
      </div>
    </div>
  `;

      document.body.insertAdjacentHTML("beforeend", modalHTML);

      // SIMPLE SAFARI BUTTON - USE IMAGE PACKAGE URL WHEN AVAILABLE
      document
        .getElementById("safari-btn")
        .addEventListener("click", function () {
          const urlToOpen = imagePackageUrl || url;
          console.log("🌐 Opening URL:", urlToOpen);
          window.open(urlToOpen, "_blank");
          document.getElementById("zalo-safari-modal").remove();
        });

      // SIMPLE COPY BUTTON - USE ORIGINAL MESSAGE
      document
        .getElementById("copy-btn")
        .addEventListener("click", function () {
          navigator.clipboard
            .writeText(message)
            .then(() => {
              const messages = {
                en: "✅ Message copied to clipboard!",
                vi: "✅ Đã sao chép tin nhắn!",
                es: "✅ ¡Mensaje copiado!",
                zh: "✅ 消息已复制！",
                hi: "✅ संदेश कॉपी किया गया!",
                ar: "✅ تم نسخ الرسالة!",
              };
              alert(messages[lang] || messages.en);
              document.getElementById("zalo-safari-modal").remove();
            })
            .catch(() => {
              alert("Please copy the message manually: " + message);
            });
        });

      document
        .getElementById("close-btn")
        .addEventListener("click", function () {
          document.getElementById("zalo-safari-modal").remove();
        });
    }

    // === UPDATED ZALO SHARE SETUP WITH PERMANENT URLS ===
    // === UPDATED ZALO SHARE SETUP USING EXISTING IMAGEPROVIDER ===
    function setupZaloShare() {
      const zaloBtn = document.getElementById("zalo-share");
      if (!zaloBtn) return;

      zaloBtn.addEventListener("click", async function (e) {
        e.preventDefault();
        const lang = localStorage.getItem("userLanguage") || "en";
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

        console.log("📱 Device detection:", {
          isMobile,
          userAgent: navigator.userAgent,
        });

        // Get report data
        const report = {
          title: document.getElementById("report-title")?.value || "",
          description:
            document.getElementById("report-description")?.value || "",
          location: document.getElementById("location-text-input")?.value || "",
          coordinates:
            document.getElementById("selected-coordinates")?.value || "",
          contact: document.getElementById("reporter-contact")?.value || "",
          type: document.getElementById("report-type")?.value || "other",
          imageUrls: window.lastUploadedImages || [],
        };

        // ✅ ADD VIOLATION CHECK
        if (isReportViolating(report)) {
          showViolationAlert();
          return;
        }

        // USE THE EXISTING IMAGEPROVIDER THAT WORKS FOR WHATSAPP/TWITTER
        // USE ENHANCED STORAGE FOR MOBILE COMPATIBILITY
        // In setupZaloShare, update the image package part:
        let imagePart = "";
        try {
          console.log("💙 Creating image package with enhanced storage...");
          const packageUrl = await ensureImagePackageStorage(report.imageUrls);

          if (packageUrl) {
            imagePart = `\n${getSharingTranslation(
              "fieldLabels.images",
              lang,
            )} (${report.imageUrls.length}): ${packageUrl}`;
            console.log("✅ Image package created:", packageUrl);

            // Double-check Firestore storage for mobile
            const isMobile = /iPhone|iPad|iPod|Android/i.test(
              navigator.userAgent,
            );
            if (isMobile) {
              console.log(
                "📱 Mobile package created - Firestore should guarantee cross-app access",
              );
            }
          }
        } catch (error) {
          console.log("❌ Enhanced storage failed:", error.message);
          // Fallback to existing ImageProvider
          try {
            const imageResult = await ImageProvider.getImagesForPlatform(
              report.imageUrls,
              "zalo",
            );
            if (imageResult.type === "package" && imageResult.url) {
              imagePart = `\n${getSharingTranslation(
                "fieldLabels.images",
                lang,
              )} (${imageResult.count}): ${imageResult.url}`;
              console.log("🔄 Using ImageProvider fallback");
            }
          } catch (fallbackError) {
            console.log(
              "❌ All storage methods failed:",
              fallbackError.message,
            );
          }
        }

        // Build the message - ensure image package URL is included
        const message = [
          `${getSharingTranslation("greetings", lang)}`,
          report.title && `\n\n${report.title}`,
          report.description &&
            `\n${getSharingTranslation("fieldLabels.description", lang)}: ${
              report.description
            }`,
          report.location &&
            `\n${getSharingTranslation("fieldLabels.location", lang)}: ${
              report.location
            }`,
          report.coordinates ? ` (${report.coordinates})` : "",
          report.contact &&
            `\n${getSharingTranslation("fieldLabels.contact", lang)}: ${
              report.contact
            }`,
          imagePart, // This contains the image package URL
          `\n\n${getSharingTranslation(`closingLines.${report.type}`, lang)}`,
          `\n${getSharingTranslation("closingLines.thank_you", lang)}`,
          `\n\n${getSharingTranslation("reportSharedVia", lang)} ${
            window.location.href
          }`,
        ]
          .filter(Boolean)
          .join("");

        console.log("🎯 Final message for Zalo:", message);
        createZaloSafariModal(
          message,
          window.location.href,
          report.title,
          lang,
        );
      });
    }

    // Translation functions remain the same
    function getZaloModalTitle(lang) {
      const titles = {
        en: "Share via Zalo",
        vi: "Chia sẻ qua Zalo",
        es: "Compartir via Zalo",
        zh: "通过 Zalo 分享",
        hi: "Zalo के माध्यम से साझा करें",
        ar: "شارك عبر Zalo",
      };
      return titles[lang] || titles.en;
    }

    function getZaloModalMessage(lang) {
      const messages = {
        en: "For the best experience with images, we recommend opening in Safari. You can also copy the message to share directly in Zalo.",
        vi: "Để có trải nghiệm tốt nhất với hình ảnh, chúng tôi khuyên bạn nên mở trong Safari. Bạn cũng có thể sao chép tin nhắn để chia sẻ trực tiếp trong Zalo.",
        es: "Para la mejor experiencia con imágenes, recomendamos abrir en Safari. También puede copiar el mensaje para compartir directamente en Zalo.",
        zh: "为了获得最佳的图片体验，我们建议在 Safari 中打开。您也可以复制消息以直接在 Zalo 中分享。",
        hi: "छवियों के साथ सर्वोत्तम अनुभव के लिए, हम Safari में खोलने की सलाह देते हैं। आप Zalo में सीधे साझा करने के लिए संदेश को कॉपी भी कर सकते हैं।",
        ar: "لأفضل تجربة مع الصور، نوصي بالفتح في Safari. يمكنك أيضًا نسخ الرسالة للمشاركة مباشرة في Zalo.",
      };
      return messages[lang] || messages.en;
    }

    function getSafariButtonText(lang) {
      const texts = {
        en: "Open in Safari",
        vi: "Mở trong Safari",
        es: "Abrir en Safari",
        zh: "在 Safari 中打开",
        hi: "Safari में खोलें",
        ar: "فتح في Safari",
      };
      return texts[lang] || texts.en;
    }

    function getCopyButtonText(lang) {
      const texts = {
        en: "Copy Message",
        vi: "Sao chép tin nhắn",
        es: "Copiar mensaje",
        zh: "复制消息",
        hi: "संदेश कॉपी करें",
        ar: "نسخ الرسالة",
      };
      return texts[lang] || texts.en;
    }

    function getCloseButtonText(lang) {
      const texts = {
        en: "Close",
        vi: "Đóng",
        es: "Cerrar",
        zh: "关闭",
        hi: "बंद करें",
        ar: "إغلاق",
      };
      return texts[lang] || texts.en;
    }

    // === ADD VALIDATE IMAGE PACKAGE URL FUNCTION RIGHT HERE ===
    function validateImagePackageUrl(message) {
      // Look for image package URL in the message
      const urlMatch = message.match(
        /(https:\/\/[^\s]+image-package\.html\?id=img_[^\s]+)/,
      );

      if (urlMatch) {
        const url = urlMatch[0];
        console.log("🔍 Validating image package URL:", url);

        // Ensure the URL is complete and properly encoded
        const cleanUrl = url.split(" ")[0]; // Remove any trailing spaces
        return cleanUrl;
      }

      return null;
    }

    // Initialize when page loads
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", setupZaloShare);
    } else {
      setupZaloShare();
    }

    // ===== 5. INITIALIZE EVERYTHING =====
    function initSavedReports() {
      // Save button
      document
        .getElementById("save-report-btn")
        ?.addEventListener("click", saveCurrentReport);

      // Add cleanup initialization here:
      document.addEventListener("DOMContentLoaded", function () {
        cleanupOldPackages();
      });

      // Clear All button
      document
        .getElementById("clear-all-reports")
        ?.addEventListener("click", clearAllReports);

      // New Report button
      document
        .getElementById("new-report-btn")
        ?.addEventListener("click", function () {
          // Clear form logic
        });

      // Back to Dashboard
      document
        .getElementById("back-to-dashboard")
        ?.addEventListener("click", function () {
          window.location.href = "/dashboard.html";
        });

      // Delegated event listeners
      document.addEventListener("click", function (e) {
        if (e.target.classList.contains("delete-btn")) {
          e.preventDefault();
          deleteReport(Number(e.target.dataset.id));
        }
        if (e.target.classList.contains("reshare-btn")) {
          e.preventDefault();
          reshareReport(Number(e.target.dataset.id));
        }
      });

      renderSavedReports();
    }

    initSavedReports();
  }
});

// Restore form data if coming back from Telegram share
const savedFormData = localStorage.getItem("savedFormDataBeforeShare");
if (savedFormData) {
  const data = JSON.parse(savedFormData);
  console.log("🔄 Restoring form data from previous share session");

  if (data.title) document.getElementById("report-title").value = data.title;
  if (data.description)
    document.getElementById("report-description").value = data.description;
  if (data.location)
    document.getElementById("location-text-input").value = data.location;
  if (data.coordinates)
    document.getElementById("selected-coordinates").value = data.coordinates;
  if (data.contact)
    document.getElementById("reporter-contact").value = data.contact;
  if (data.type) document.getElementById("report-type").value = data.type;

  if (data.imageUrls && data.imageUrls.length > 0) {
    window.lastUploadedImages = data.imageUrls;
    const fileLabel = document.getElementById("file-input-label");
    if (fileLabel) {
      const lang = localStorage.getItem("userLanguage") || "en";
      const fileText =
        data.imageCount === 1
          ? TRANSLATION_PATCH?.fileInput?.oneFile?.[lang] || "1 file selected"
          : TRANSLATION_PATCH?.fileInput?.multipleFiles?.[lang] ||
            `${data.imageCount} files selected`;
      fileLabel.textContent = fileText;
    }
  }

  localStorage.removeItem("savedFormDataBeforeShare");
}

// ADD THIS AT THE VERY BOTTOM OF THE FILE:
function debugWindowFb() {
  console.log("🔍 DEEP DEBUG: window.fb contents");
  console.log("window.fb:", window.fb);

  if (window.fb) {
    for (let key in window.fb) {
      console.log(`window.fb.${key}:`, typeof window.fb[key]);
      if (window.fb[key] && typeof window.fb[key] === "object") {
        console.log(`  Methods:`, Object.keys(window.fb[key]).slice(0, 10));
      }
    }
  }
}

// Run the debug
setTimeout(debugWindowFb, 2000);

// === MAKE MODAL FUNCTIONS GLOBAL ===
// Add this at the VERY BOTTOM of sharing.js
if (typeof openInSafari !== "undefined") window.openInSafari = openInSafari;
if (typeof copyZaloMessage !== "undefined")
  window.copyZaloMessage = copyZaloMessage;
if (typeof closeZaloModal !== "undefined")
  window.closeZaloModal = closeZaloModal;
if (typeof createZaloSafariModal !== "undefined")
  window.createZaloSafariModal = createZaloSafariModal;
