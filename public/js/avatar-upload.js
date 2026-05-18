// SIMPLE FIX: Prevent double file dialogs
let lastAvatarUploadTime = 0;
// avatar-upload.js - COMPLETELY ISOLATED VERSION
// No dependencies, no interference with other code

// Safe debug - check if window.fb exists first
console.log("🔍 window.fb exists:", !!window.fb);
if (window.fb) {
  console.log("🔍 window.fb contents:", Object.keys(window.fb));
}

class SimpleAvatarUpload {
  constructor() {
    this.lastFileSelectTime = 0;

    console.log("🎯 AvatarUpload - ISOLATED VERSION LOADED");
    this.initialized = false;
    // TEMPORARY: Direct debug
    console.log("=== DIRECT DEBUG ===");
    console.log("1. window.fb exists?", !!window.fb);
    console.log("2. window.fb.firestore?", !!window.fb?.firestore);
    console.log("3. Type:", typeof window.fb?.firestore);
    console.log("=== END DIRECT DEBUG ===");
    this.debugFirebase(); // ADD THIS
    this.translations = {
      en: {
        subscribe: "Subscribe",
        premiumRequired: "Please subscribe to premium to upload avatars",
        uploadSuccess: "Avatar updated successfully!",
        uploadFailed: "Upload failed. Please try again.",
        fileTooLarge: "File is too large. Maximum size is 2MB.",
        notImage: "Please select an image file (JPEG, PNG, etc.)",
        fileReadError: "Failed to read file. Please try again.",
        tooltip: "Subscribe to upload avatar",
        sponsored_fixed:
          "This account is sponsored. The avatar is fixed and cannot be changed.",
        blockedFilename: "Cannot upload: Filename contains prohibited word",
        blockedContent: "Cannot upload: Image contains prohibited content",
        accountBlocked: "Your account has been blocked due to violation",
      },

      vi: {
        subscribe: "Đăng ký",
        premiumRequired: "Vui lòng đăng ký gói premium để tải ảnh đại diện lên",
        uploadSuccess: "Cập nhật ảnh đại diện thành công!",
        uploadFailed: "Tải lên thất bại. Vui lòng thử lại.",
        fileTooLarge: "Tệp quá lớn. Kích thước tối đa là 2MB.",
        notImage: "Vui lòng chọn tệp hình ảnh (JPEG, PNG, v.v.)",
        fileReadError: "Đọc tệp thất bại. Vui lòng thử lại.",
        tooltip: "Đăng ký để tải ảnh đại diện lên",
        sponsored_fixed:
          "Tài khoản này được tài trợ. Hình đại diện cố định và không thể thay đổi.",
        blockedFilename: "Không thể tải lên: Tên file chứa từ bị cấm",
        blockedContent: "Không thể tải lên: Ảnh chứa nội dung bị cấm",
        accountBlocked: "Tài khoản của bạn đã bị khóa do vi phạm",
      },

      zh: {
        subscribe: "订阅",
        premiumRequired: "请订阅高级版以上传头像",
        uploadSuccess: "头像更新成功！",
        uploadFailed: "上传失败。请再试一次。",
        fileTooLarge: "文件太大。最大大小为2MB。",
        notImage: "请选择图像文件（JPEG、PNG 等）",
        fileReadError: "读取文件失败。请再试一次。",
        tooltip: "订阅以上传头像",
        sponsored_fixed: "此帐户为赞助帐户。头像已固定，无法更改。",
        blockedFilename: "无法上传：文件名包含禁止的词语",
        blockedContent: "无法上传：图像包含禁止的内容",
        accountBlocked: "您的帐户已被封锁",
      },

      es: {
        subscribe: "Suscribirse",
        premiumRequired: "Por favor suscríbete a premium para subir avatares",
        uploadSuccess: "¡Avatar actualizado con éxito!",
        uploadFailed: "Error al subir. Por favor, inténtelo de nuevo.",
        fileTooLarge:
          "El archivo es demasiado grande. El tamaño máximo es de 2MB.",
        notImage: "Por favor seleccione un archivo de imagen (JPEG, PNG, etc.)",
        fileReadError:
          "Error al leer el archivo. Por favor, inténtelo de nuevo.",
        tooltip: "Suscríbete para subir avatar",
        sponsored_fixed:
          "Esta cuenta está patrocinada. El avatar está fijo y no se puede cambiar.",
        blockedFilename:
          "No se puede subir: El nombre del archivo contiene palabras prohibidas",
        blockedContent:
          "No se puede subir: La imagen contiene contenido prohibido",
        accountBlocked: "Tu cuenta ha sido bloqueada",
      },

      hi: {
        subscribe: "सदस्यता लें",
        premiumRequired:
          "कृपया अवतार अपलोड करने के लिए प्रीमियम की सदस्यता लें",
        uploadSuccess: "अवतार सफलतापूर्वक अपडेट किया गया!",
        uploadFailed: "अपलोड विफल। कृपया पुनः प्रयास करें।",
        fileTooLarge: "फ़ाइल बहुत बड़ी है। अधिकतम आकार 2MB है।",
        notImage: "कृपया एक छवि फ़ाइल चुनें (JPEG, PNG, आदि)",
        fileReadError: "फ़ाइल पढ़ने में विफल। कृपया पुनः प्रयास करें।",
        tooltip: "अवतार अपलोड करने के लिए सदस्यता लें",
        sponsored_fixed:
          "यह खाता प्रायोजित है। अवतार स्थिर है और इसे बदला नहीं जा सकता।",
        blockedFilename: "अपलोड नहीं कर सकते: फ़ाइल नाम में प्रतिबंधित शब्द है",
        blockedContent: "अपलोड नहीं कर सकते: छवि में प्रतिबंधित सामग्री है",
        accountBlocked: "आपका खाता ब्लॉक कर दिया गया है",
      },

      ar: {
        subscribe: "اشترك",
        premiumRequired: "يرجى الاشتراك في النسخة المميزة لتحميل الصور الرمزية",
        uploadSuccess: "تم تحديث الصورة الرمزية بنجاح!",
        uploadFailed: "فشل التحميل. يرجى المحاولة مرة أخرى.",
        fileTooLarge: "الملف كبير جدًا. الحد الأقصى للحجم هو 2MB.",
        notImage: "يرجى تحديد ملف صورة (JPEG، PNG، إلخ)",
        fileReadError: "فشل قراءة الملف. يرجى المحاولة مرة أخرى.",
        tooltip: "اشترك لتحميل الصورة الرمزية",
        sponsored_fixed:
          "هذا الحساب مدعوم. الصورة الرمزية ثابتة ولا يمكن تغييرها.",
        blockedFilename: "لا يمكن الرفع: اسم الملف يحتوي على كلمة محظورة",
        blockedContent: "لا يمكن الرفع: الصورة تحتوي على محتوى محظور",
        accountBlocked: "تم حظر حسابك",
      },
    };

    // ✅ ADD THESE FLAGS
    this._setupDone = false;
    this._setupComplete = false;
    this._uploadClickLock = false;

    this.init();
  }

  init() {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => this.setup());
    } else {
      this.setup();
    }
  }

  getCurrentLanguage() {
    // ONLY use main page language - completely isolated
    return localStorage.getItem("userLanguage") || "en";
  }

  getTranslation(key) {
    const lang = this.getCurrentLanguage();
    return this.translations[lang]?.[key] || this.translations.en[key] || key;
  }

  checkAvatarFilename(filename) {
    const lang = localStorage.getItem("userLanguage") || "en";
    const prohibitedWords = {
      en: ["porn", "sex", "nude", "gun", "weapon", "violence"],
      vi: ["khiêu dâm", "sex", "khỏa thân", "súng", "vũ khí", "bạo lực"],
      zh: ["色情", "性", "裸体", "枪", "武器", "暴力"],
      es: ["pornografía", "sexo", "desnudo", "arma", "violencia"],
      hi: ["अश्लील", "सेक्स", "नग्न", "बंदूक", "हथियार", "हिंसा"],
      ar: ["إباحية", "جنس", "عارية", "سلاح", "عنف"],
    };

    const lowerName = filename.toLowerCase();
    const words = prohibitedWords[lang] || prohibitedWords.en;

    for (const word of words) {
      if (lowerName.includes(word.toLowerCase())) {
        return { blocked: true, word: word };
      }
    }
    return { blocked: false };
  }

  // Direct mobile upload method
  async directMobileUpload() {
    console.log("📱 DIRECT MOBILE UPLOAD");

    // Check permissions
    const permissions = await this.checkUploadPermissions();
    if (!permissions.canUpload) {
      if (permissions.reason === "sponsored_user") {
        alert(this.getTranslation("sponsored_fixed"));
      } else if (permissions.reason === "not_premium") {
        alert(this.getTranslation("premiumRequired"));
        window.open("./premium-iap.html", "_blank");
      } else if (permissions.reason === "not_logged_in") {
        alert("Please sign in to upload an avatar.");
      } else {
        alert(this.getTranslation("premiumRequired"));
        window.open("./premium-iap.html", "_blank");
      }
      return;
    }

    // Create a simple file input
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "image/*";
    fileInput.style.cssText =
      "position:fixed;top:0;left:0;width:100%;height:100%;opacity:0;z-index:99999;";

    // Handle file selection
    const handleFileSelect = async (e) => {
      const file = e.target.files[0];
      if (!file) {
        fileInput.remove();
        return;
      }

      // ✅ ADD FILENAME CHECK HERE
      const fileName = file.name.toLowerCase();
      if (
        fileName.includes("sex") ||
        fileName.includes("gun") ||
        fileName.includes("porn") ||
        fileName.includes("nude")
      ) {
        alert("❌ Cannot upload: Filename contains prohibited word");
        fileInput.remove();
        return;
      }

      console.log("📱 File selected:", file.name, file.size);

      // Send mobile log
      await this.sendMobileLogToFirestore({
        event: "avatar_file_selected",
        fileName: file.name,
        fileSize: file.size,
        timestamp: new Date().toISOString(),
      });

      // Process the file
      this.processAvatarFileDirect(file);

      // Clean up
      fileInput.remove();
    };

    fileInput.addEventListener("change", handleFileSelect);
    document.body.appendChild(fileInput);

    // Trigger file picker
    setTimeout(() => {
      fileInput.click();
      console.log("📱 File picker triggered");
    }, 100);
  }

  // Direct file processing without complex compression
  processAvatarFileDirect(file) {
    console.log("📱 Processing avatar file");

    // Check file type
    if (!file.type.startsWith("image/")) {
      alert(this.getTranslation("notImage"));
      return;
    }

    // Show loading indicator
    this.showUploadingIndicator();

    const reader = new FileReader();

    reader.onload = (e) => {
      console.log("✅ File loaded, updating avatar");
      this.updateAvatarImage(e.target.result);
      this.showUploadSuccessMessage();

      // Send success log
      this.sendMobileLogToFirestore({
        event: "avatar_upload_success",
        fileSize: file.size,
        timestamp: new Date().toISOString(),
      });

      this.hideUploadingIndicator();
    };

    reader.onerror = (error) => {
      console.error("❌ File read error:", error);
      alert(this.getTranslation("fileReadError"));
      this.hideUploadingIndicator();
    };

    reader.readAsDataURL(file);
  }

  // Show/hide loading indicator
  showUploadingIndicator() {
    const avatarImg = document.getElementById("userAvatar");
    if (avatarImg) {
      avatarImg.style.opacity = "0.5";
    }
  }

  hideUploadingIndicator() {
    const avatarImg = document.getElementById("userAvatar");
    if (avatarImg) {
      avatarImg.style.opacity = "1";
    }
  }

  setup() {
    if (this._setupComplete) {
      console.log("⚠️ Setup already completed, skipping");
      return;
    }

    console.log("🔧 Starting avatar upload setup...");

    const uploadBtn = document.getElementById("uploadAvatarBtn");
    const avatarImg = document.getElementById("userAvatar");

    if (!uploadBtn || !avatarImg) {
      console.error("❌ Required elements not found!");
      return;
    }

    console.log("✅ All elements found successfully");

    // Get or create the hidden file input
    let fileInput = document.getElementById("avatarFileInput");
    if (!fileInput) {
      fileInput = document.createElement("input");
      fileInput.type = "file";
      fileInput.id = "avatarFileInput";
      fileInput.accept = "image/*";
      fileInput.style.display = "none";
      document.body.appendChild(fileInput);
      console.log("📱 Created file input");
    }

    // Remove any existing change listeners
    const newFileInput = fileInput.cloneNode(true);
    fileInput.parentNode.replaceChild(newFileInput, fileInput);
    fileInput = newFileInput;

    // Single change event handler
    const handleFileChange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      console.log("📁 File selected:", file.name, file.size);

      const lang =
        localStorage.getItem("userLanguage") ||
        localStorage.getItem("appLanguage") ||
        "en";

      // ============================================
      // CHECK FILENAME
      // ============================================
      const fileName = file.name.toLowerCase();
      const badWords = [
        "sex",
        "porn",
        "nude",
        "gun",
        "violence",
        "khiêu dâm",
        "súng",
        "weapon",
        "kill",
        "blood",
      ];

      let blockedWord = null;
      for (const word of badWords) {
        if (fileName.includes(word)) {
          blockedWord = word;
          break;
        }
      }

      if (blockedWord) {
        const filenameMessages = {
          en: (word) =>
            `❌ Cannot upload: Filename contains prohibited word "${word}"`,
          vi: (word) =>
            `❌ Không thể tải lên: Tên file chứa từ bị cấm "${word}"`,
          zh: (word) => `❌ 无法上传：文件名包含禁止的词语 "${word}"`,
          es: (word) =>
            `❌ No se puede subir: El nombre del archivo contiene la palabra prohibida "${word}"`,
          hi: (word) =>
            `❌ अपलोड नहीं कर सकते: फ़ाइल नाम में प्रतिबंधित शब्द "${word}" है`,
          ar: (word) =>
            `❌ لا يمكن الرفع: اسم الملف يحتوي على كلمة محظورة "${word}"`,
        };
        const msg = filenameMessages[lang](blockedWord);
        alert(msg);
        e.target.value = "";
        this.isProcessingFile = false;
        return;
      }

      // ============================================
      // ADD SIGHTENGINE CHECK HERE
      // ============================================
      console.log("🔍 Running SightEngine check...");
      const analysis = await window.moderateImageWithSightEngine(file);

      if (!analysis.safe) {
        const msg = window.getViolationMessage(analysis.reason, lang);
        alert(msg);
        e.target.value = "";
        this.isProcessingFile = false;
        return;
      }

      // ============================================
      // SIGHTENGINE CONTENT CHECK
      // ============================================
      console.log("🔍 Running SightEngine check...");

      if (!analysis.safe) {
        const msg = window.getViolationMessage(analysis.reason, lang);
        alert(msg);
        e.target.value = "";
        this.isProcessingFile = false;
        return;
      }

      // Check permissions
      const permissions = await this.checkUploadPermissions();
      if (!permissions.canUpload) {
        if (permissions.reason === "sponsored_user") {
          alert(this.getTranslation("sponsored_fixed"));
        } else if (permissions.reason === "not_premium") {
          alert(this.getTranslation("premiumRequired"));
          window.open("./premium-iap.html", "_blank");
        } else if (permissions.reason === "not_logged_in") {
          alert("Please sign in to upload an avatar.");
        }
        e.target.value = "";
        return;
      }

      // Send log
      await this.sendMobileLogToFirestore({
        event: "avatar_file_selected",
        fileName: file.name,
        fileSize: file.size,
        timestamp: new Date().toISOString(),
      });

      // Process the file
      this.processAvatarFile(file);

      // Clear input
      e.target.value = "";
    };

    fileInput.addEventListener("change", handleFileChange);

    // Remove any existing click listeners from button
    const newButton = uploadBtn.cloneNode(true);
    uploadBtn.parentNode.replaceChild(newButton, uploadBtn);

    // Single click handler for the camera button
    const clickHandler = (e) => {
      e.preventDefault();
      e.stopPropagation();
      console.log("🖱️ Camera button clicked");

      // Visual feedback
      newButton.style.transform = "scale(0.9)";
      setTimeout(() => {
        newButton.style.transform = "";
      }, 150);

      // Trigger file input
      fileInput.click();
      console.log("📁 File input triggered");
    };

    newButton.addEventListener("click", clickHandler);

    // Store references
    this.uploadButton = newButton;
    this.fileInput = fileInput;

    // Load current avatar
    this.loadAvatarFromFirebase();
    this.applyPremiumRestrictions();
    this.translateSubscribeButton();
    this.setupComplimentaryAccount();

    this._setupComplete = true;
    console.log("✅ Avatar upload setup completed");
  }

  async loadAvatarFromFirebase() {
    const user = window.fb?.auth?.currentUser;
    if (!user) return;

    try {
      // Get avatar URL from Firestore user document
      const userDoc = await window.fb.firestore
        .collection("users")
        .doc(user.uid)
        .get();
      if (userDoc.exists && userDoc.data().avatarUrl) {
        const avatarImg = document.getElementById("userAvatar");
        if (avatarImg) {
          avatarImg.src = userDoc.data().avatarUrl;
        }
      }
    } catch (error) {
      console.error("Error loading avatar from Firebase:", error);
    }
  }

  setupMainPageLanguageListener() {
    // ONLY listen to main page language switcher - NO storage events
    const languageSwitcher = document.getElementById("language-switcher");
    if (languageSwitcher) {
      languageSwitcher.addEventListener("change", (e) => {
        const newLang = e.target.value;
        console.log("🔄 Main page language changed to:", newLang);
        localStorage.setItem("userLanguage", newLang);

        // Update all translations
        this.translateSubscribeButton();
        this.applyPremiumRestrictions();
      });
    }
  }

  translateSubscribeButton() {
    const subscribeBtn = document.getElementById("subscribeBtn");
    if (!subscribeBtn) return;

    const span = subscribeBtn.querySelector("span");
    if (span) {
      span.textContent = this.getTranslation("subscribe");
      console.log("✅ Subscribe button translated to:", span.textContent);
    }
  }

  debugFirebase() {
    console.log("=== SIMPLE DEBUG ===");
    console.log("1. window exists?", !!window);
    console.log("2. window.fb exists?", !!window.fb);
    console.log("3. window.fb type:", typeof window.fb);

    if (window.fb) {
      console.log("4. window.fb keys:", Object.keys(window.fb));
      console.log("5. window.fb.firestore:", window.fb.firestore);
      console.log(
        "6. Is firestore a function?",
        typeof window.fb.firestore === "function",
      );

      // Try to call it if it's a function
      if (typeof window.fb.firestore === "function") {
        try {
          const result = window.fb.firestore();
          console.log("7. window.fb.firestore() returns:", result);
        } catch (e) {
          console.log("7. window.fb.firestore() error:", e.message);
        }
      }
    }

    console.log("8. window.firebase exists?", !!window.firebase);
    console.log("=== END SIMPLE DEBUG ===");
  }

  async checkUploadPermissions() {
    try {
      if (!window.fb || !window.fb.auth) {
        return { canUpload: false, reason: "firebase_not_ready" };
      }

      const user = window.fb.auth.currentUser;
      if (!user) return { canUpload: false, reason: "not_logged_in" };

      console.log("👤 Checking permissions for user:", user.uid);

      // ✅ STEP 1: Check sponsored account FIRST (most restrictive)
      const isSponsored = await this.checkIfSponsored(user.uid);
      if (isSponsored) {
        console.log("🎫 Sponsored user detected - cannot change avatar");
        return { canUpload: false, reason: "sponsored_user" };
      }

      // ✅ STEP 2: Check complimentary owner account
      const isComplimentaryOwner =
        localStorage.getItem(`complimentary_${user.uid}`) === "true";
      if (isComplimentaryOwner) {
        console.log("👑 Complimentary OWNER account detected");
        return { canUpload: true, reason: "complimentary_owner" };
      }

      // ✅ STEP 3: Check premium status
      const isPremium = await this.checkPremiumStatus();
      if (isPremium) {
        return { canUpload: true, reason: "premium_individual" };
      }

      return { canUpload: false, reason: "not_premium" };
    } catch (error) {
      console.error("❌ Permission check error:", error);
      return { canUpload: false, reason: "error", error: error.message };
    }
  }

  // Add this method to your SimpleAvatarUpload class
  async checkIfSponsored(userId) {
    if (!userId) return false;

    try {
      // Get Firestore instance
      let firestoreDb;
      if (window.fb && window.fb.firestore && window.fb.firestore.db) {
        firestoreDb = window.fb.firestore.db;
      } else {
        return false;
      }

      // ✅ SIMPLER: Check the users collection instead!
      const { doc, getDoc } =
        await import("https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js");

      const userDocRef = doc(firestoreDb, "users", userId);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) return false;

      const userData = userDoc.data();

      // ✅ Check if accountType is 'sponsored'
      const isSponsored = userData.accountType === "sponsored";

      if (isSponsored) {
        console.log("✅ User is sponsored (from users collection)");
        // Cache it
        localStorage.setItem(`sponsored_${userId}`, "true");
      }

      return isSponsored;
    } catch (error) {
      console.log("⚠️ Sponsored check failed:", error.message);

      // Fallback to localStorage cache
      const cached = localStorage.getItem(`sponsored_${userId}`);
      return cached === "true";
    }
  }

  // Simple mobile-specific upload function
  // Add this to your avatar-upload.js inside the SimpleAvatarUpload class

  async handleMobileUpload() {
    console.log("📱 Starting mobile upload");

    // ✅ ADD MOBILE LOGGING
    try {
      const { collection, addDoc } =
        await import("https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js");
      const db = window.fb.firestore.db;

      await addDoc(collection(db, "mobile_logs"), {
        event: "mobile_upload_start",
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        userId: window.fb?.auth?.currentUser?.uid || "unknown",
        email: window.fb?.auth?.currentUser?.email || "unknown",
      });
    } catch (e) {
      console.log("📱 Log failed:", e.message);
    }

    try {
      // Create a completely new, simple file input
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";
      input.style.position = "fixed";
      input.style.top = "0";
      input.style.left = "0";
      input.style.width = "100%";
      input.style.height = "100%";
      input.style.opacity = "0";
      input.style.zIndex = "999999";
      input.style.pointerEvents = "auto"; // Important!

      // Handle file selection
      input.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) {
          document.body.removeChild(input);
          return;
        }

        // ✅ ADD FILENAME CHECK HERE
        const fileName = file.name.toLowerCase();
        if (
          fileName.includes("sex") ||
          fileName.includes("gun") ||
          fileName.includes("porn") ||
          fileName.includes("nude")
        ) {
          alert("❌ Cannot upload: Filename contains prohibited word");
          document.body.removeChild(input);
          return;
        }

        console.log("📱 File selected:", file.name);

        // ✅ LOG FILE SELECTION
        try {
          const { collection, addDoc } =
            await import("https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js");
          const db = window.fb.firestore.db;

          await addDoc(collection(db, "mobile_logs"), {
            event: "mobile_file_selected",
            fileName: file.name,
            fileSize: file.size,
            timestamp: new Date().toISOString(),
          });
        } catch (e) {}

        // Process the file
        await this.processMobileFile(file);

        // Clean up
        document.body.removeChild(input);
      };

      // Add to DOM and trigger click
      document.body.appendChild(input);

      // Force click with multiple attempts
      setTimeout(() => {
        console.log("📱 Triggering file picker");
        input.click();
      }, 100);

      // Fallback click
      setTimeout(() => {
        if (input.parentNode) {
          console.log("📱 Fallback click");
          input.click();
        }
      }, 500);
    } catch (error) {
      console.error("📱 Mobile upload error:", error);
      alert("Could not open file picker. Please try again.");
    }
  }

  async processMobileFile(file) {
    console.log("📱 Processing file:", file.name);

    // Read and display the image
    const reader = new FileReader();
    reader.onload = (e) => {
      const imageData = e.target.result;

      // Update avatar
      const avatarImg = document.getElementById("userAvatar");
      if (avatarImg) {
        avatarImg.src = imageData;
      }

      // Save to localStorage
      localStorage.setItem("userAvatar", imageData);

      alert("Avatar uploaded successfully!");
      console.log("📱 Mobile upload complete");
    };

    reader.onerror = () => {
      alert("Error reading file. Please try again.");
    };

    reader.readAsDataURL(file);
  }

  // Handle the selected file
  async handleMobileFile(file) {
    console.log("📱 Processing mobile file:", file.name);

    const user = window.fb?.auth?.currentUser;
    if (!user) {
      alert("Please sign in first");
      return;
    }

    const lang =
      localStorage.getItem("userLanguage") ||
      localStorage.getItem("appLanguage") ||
      "en";

    // ============================================
    // STEP 1: FILENAME CHECK (Keep this)
    // ============================================
    const fileName = file.name.toLowerCase();
    const badWords = [
      "sex",
      "porn",
      "nude",
      "gun",
      "violence",
      "khiêu dâm",
      "súng",
      "weapon",
      "kill",
      "blood",
    ];

    for (const word of badWords) {
      if (fileName.includes(word)) {
        const filenameMessages = {
          en: (w) =>
            `❌ Cannot upload: Filename contains prohibited word "${w}"`,
          vi: (w) => `❌ Không thể tải lên: Tên file chứa từ bị cấm "${w}"`,
          zh: (w) => `❌ 无法上传：文件名包含禁止的词语 "${w}"`,
          es: (w) =>
            `❌ No se puede subir: El nombre del archivo contiene la palabra prohibida "${w}"`,
          hi: (w) =>
            `❌ अपलोड नहीं कर सकते: फ़ाइल नाम में प्रतिबंधित शब्द "${w}" है`,
          ar: (w) => `❌ لا يمكن الرفع: اسم الملف يحتوي على كلمة محظورة "${w}"`,
        };
        const msg = filenameMessages[lang](word);
        alert(msg);
        return;
      }
    }

    // ============================================
    // STEP 2: SIGHTENGINE CONTENT CHECK
    // ============================================
    const analysis = await window.moderateImageWithSightEngine(file);
    if (!analysis.safe) {
      const msg = window.getViolationMessage(analysis.reason, lang);
      alert(msg);
      return;
    }

    // ============================================
    // STEP 3: SPONSORED CHECK
    // ============================================
    const isSponsored =
      localStorage.getItem(`sponsored_${user.uid}`) === "true";
    if (isSponsored) {
      const sponsoredMessages = {
        en: "This is a sponsored account. Avatar is fixed and cannot be changed.",
        vi: "Tài khoản được tài trợ. Không thể thay đổi avatar.",
        zh: "这是赞助账户。头像已固定，无法更改。",
        es: "Esta es una cuenta patrocinada. El avatar está fijo y no se puede cambiar.",
        hi: "यह एक प्रायोजित खाता है। अवतार स्थिर है और इसे बदला नहीं जा सकता।",
        ar: "هذا حساب برعاية. الصورة الرمزية ثابتة ولا يمكن تغييرها.",
      };
      alert(sponsoredMessages[lang] || sponsoredMessages.en);
      return;
    }

    // ============================================
    // STEP 4: OWNER CHECK
    // ============================================
    if (user.email === "thomasnguyen07@gmail.com") {
      console.log("👑 App owner detected, proceeding with upload");
      await this.uploadFile(file);
      return;
    }

    // ============================================
    // STEP 5: PREMIUM CHECK
    // ============================================
    const isPremium = localStorage.getItem(`premium_${user.uid}`) === "true";
    if (!isPremium) {
      const premiumMessages = {
        en: "Please subscribe to upload an avatar",
        vi: "Vui lòng đăng ký để tải ảnh đại diện",
        zh: "请订阅以上传头像",
        es: "Por favor suscríbete para subir un avatar",
        hi: "अवतार अपलोड करने के लिए कृपया सदस्यता लें",
        ar: "يرجى الاشتراك لتحميل صورة رمزية",
      };
      alert(premiumMessages[lang] || premiumMessages.en);
      window.open("./premium-iap.html", "_blank");
      return;
    }

    // ============================================
    // STEP 6: UPLOAD
    // ============================================
    await this.uploadFile(file);
  }

  // Simple file upload
  async uploadFile(file) {
    try {
      // Show loading
      alert("Uploading avatar...");

      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target.result;
        this.updateAvatarImage(dataUrl);
        alert("Avatar uploaded successfully!");
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Upload error:", error);
      alert("Upload failed: " + error.message);
    }
  }

  async handleUploadClick(event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    // This is now primarily for desktop
    console.log("💻 Desktop upload handler");

    // Simple lock to prevent multiple clicks
    if (this._uploadClickLock) {
      console.log("🔒 Upload already in progress, ignoring");
      return;
    }
    this._uploadClickLock = true;

    // Release lock after 2 seconds
    setTimeout(() => {
      this._uploadClickLock = false;
      console.log("🔓 Upload click lock released");
    }, 2000);

    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    console.log("📱 Mobile check:", isMobile);

    // Visual feedback for mobile
    if (isMobile && this.uploadButton) {
      this.uploadButton.style.transform = "scale(0.95)";
      setTimeout(() => {
        if (this.uploadButton) {
          this.uploadButton.style.transform = "";
        }
      }, 150);
    }

    // Check permissions
    const permissions = await this.checkUploadPermissions();
    console.log("📋 Permissions result:", permissions);

    if (!permissions.canUpload) {
      if (permissions.reason === "sponsored_user") {
        alert(this.getTranslation("sponsored_fixed"));
      } else if (permissions.reason === "not_premium") {
        alert(this.getTranslation("premiumRequired"));
        window.open("./premium-iap.html", "_blank");
      } else if (permissions.reason === "not_logged_in") {
        alert("Please sign in to upload an avatar.");
      } else {
        alert(this.getTranslation("premiumRequired"));
        window.open("./premium-iap.html", "_blank");
      }
      this._uploadClickLock = false;
      return;
    }

    // Remove any existing file input
    let fileInput = document.getElementById("avatarFile");
    if (fileInput) {
      fileInput.remove();
      fileInput = null;
    }

    // Create fresh file input
    fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.id = "avatarFile";
    fileInput.accept = "image/*";
    fileInput.style.cssText =
      "position:absolute;left:-9999px;top:-9999px;opacity:0;";
    document.body.appendChild(fileInput);

    // Single change event listener - use once option
    const handleChange = (e) => {
      console.log("📁 File selected event fired");
      if (e.target.files && e.target.files.length > 0) {
        this.handleFileSelect(e);
      }
      // Clean up
      fileInput.removeEventListener("change", handleChange);
      setTimeout(() => {
        if (fileInput && fileInput.parentNode) {
          fileInput.remove();
        }
      }, 500);
    };

    fileInput.addEventListener("change", handleChange);

    // Trigger file picker
    console.log(
      "🖱️ Triggering file picker on",
      isMobile ? "mobile" : "desktop",
    );

    if (isMobile) {
      // Mobile needs a more robust approach
      // Create a temporary click with a promise
      const triggerClick = () => {
        try {
          fileInput.click();
          console.log("📱 fileInput.click() called");
        } catch (err) {
          console.error("❌ click() failed:", err);
        }
      };

      // Use setTimeout for mobile
      setTimeout(triggerClick, 100);

      // Also try again after a delay if needed (fallback)
      setTimeout(() => {
        if (document.getElementById("avatarFile") && !this.isProcessingFile) {
          console.log("📱 Retrying file picker...");
          triggerClick();
        }
      }, 500);
    } else {
      fileInput.click();
    }
  }

  // Add this method inside the SimpleAvatarUpload class
  async sendMobileLogToFirestore(logData) {
    try {
      // Only run on mobile
      if (!/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) return;

      const user = window.fb?.auth?.currentUser;
      if (!user) return;

      // Import Firestore functions
      const { collection, addDoc } =
        await import("https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js");

      // Get Firestore instance
      let db;
      if (window.fb && window.fb.firestore && window.fb.firestore.db) {
        db = window.fb.firestore.db;
      } else if (
        window.fb &&
        window.fb.firestore &&
        typeof window.fb.firestore === "function"
      ) {
        db = window.fb.firestore();
      } else {
        console.log("📱 Firestore not available for logging");
        return;
      }

      // Add log to Firestore
      await addDoc(collection(db, "mobile_logs"), {
        ...logData,
        userId: user.uid,
        userEmail: user.email,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        appVersion: "1.0",
      });

      console.log("📱 Mobile log sent to Firestore");
    } catch (error) {
      // Silently fail - don't interrupt user
      console.log("📱 Logging failed (non-critical):", error.message);
    }
  }

  async setupComplimentaryAccount() {
    try {
      const user = window.fb?.auth?.currentUser;
      if (!user) return;

      const ownerEmails = ["thomasnguyen07@gmail.com"];
      const isOwner = ownerEmails.includes(user.email);

      if (isOwner) {
        console.log("👑 App owner detected, granting complimentary premium");
        localStorage.setItem(`premium_${user.uid}`, "true");
        localStorage.setItem(`complimentary_${user.uid}`, "true");
        this.applyPremiumRestrictions(); // Refresh button state
      }
    } catch (error) {
      console.error("❌ Complimentary account setup error:", error);
    }
  }

  // ▼▼▼ ADD THIS FUNCTION RIGHT HERE - after existing methods, before applyPremiumRestrictions ▼▼▼
  async checkPremiumStatus() {
    try {
      console.log("🔍 [Premium Check] Starting...");
      const user = window.fb?.auth?.currentUser;

      if (!user) {
        console.log("❌ No authenticated user");
        return false;
      }

      console.log("Checking user:", user.uid, "Email:", user.email);

      // 1. APP OWNER CHECK
      if (user.email === "thomasnguyen07@gmail.com") {
        console.log("✅ App owner detected - premium access granted");
        localStorage.setItem(`premium_${user.uid}`, "true");
        return true;
      }

      // ✅ ADD THIS - STILL MISSING FROM YOUR CODE
      const isSponsored = await this.checkIfSponsored(user.uid);
      if (isSponsored) {
        console.log("✅ Sponsored user detected - premium access granted");
        localStorage.setItem(`premium_${user.uid}`, "true");
        return true;
      }

      // 2. CHECK LOCALSTORAGE CACHE (For incognito/offline)
      const cachedPremium = localStorage.getItem(`premium_${user.uid}`);
      if (cachedPremium === "true") {
        console.log("✅ Using cached premium status from localStorage");
        return true;
      }

      // 3. GET FIRESTORE INSTANCE - Use the CORRECT method
      let firestoreDb;

      // Method A: Use db from window.fb (from firebase-loader.js)
      if (window.fb && window.fb.db) {
        console.log("📁 Using window.fb.db");
        firestoreDb = window.fb.db;
      }
      // Method B: Try to get it from firestore() function
      else if (
        window.fb &&
        window.fb.firestore &&
        typeof window.fb.firestore === "function"
      ) {
        console.log("📁 Using window.fb.firestore()");
        firestoreDb = window.fb.firestore();
      }
      // Method C: Last resort - check if firestore is already an object
      else if (window.fb && window.fb.firestore && window.fb.firestore.db) {
        console.log("📁 Using window.fb.firestore.db");
        firestoreDb = window.fb.firestore.db;
      } else {
        console.error("❌ Could not find Firestore instance in window.fb");
        console.log("window.fb object:", window.fb);
        return false;
      }

      // 4. QUERY USER DOCUMENT
      let userData = null; // ← DECLARE HERE

      try {
        // Import the modular functions
        const { doc, getDoc } =
          await import("https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js");

        // Create document reference
        const userDocRef = doc(firestoreDb, "users", user.uid);
        const userDoc = await getDoc(userDocRef);

        if (!userDoc.exists()) {
          console.log("📭 No user document found");
          return false;
        }

        userData = userDoc.data(); // ← ASSIGN HERE
        console.log("User data:", userData);
      } catch (importError) {
        console.error("❌ Failed to import Firebase modules:", importError);
        return false;
      }

      // 5. CHECK PREMIUM FLAGS - NOW userData IS DEFINED
      const isPremium =
        userData?.hasActiveSubscription === true ||
        userData?.isSubscribed === true ||
        userData?.premium === true ||
        userData?.subscriptionStatus === "active";

      if (isPremium) {
        console.log("✅ User has active premium subscription");
        // Cache for future incognito sessions
        localStorage.setItem(`premium_${user.uid}`, "true");
        return true;
      }

      console.log("❌ No premium subscription found");
      return false;
    } catch (error) {
      console.error("💥 Premium check error:", error);

      // On error, check localStorage as fallback
      if (user) {
        const cached = localStorage.getItem(`premium_${user.uid}`);
        if (cached === "true") {
          console.log("⚠️ Using cached premium due to error");
          return true;
        }
      }

      return false;
    }
  }

  // ▲▲▲ END OF ADDED FUNCTION ▲▲▲

  async applyPremiumRestrictions() {
    const uploadBtn = document.getElementById("uploadAvatarBtn");
    if (!uploadBtn) return;

    const isPremium = await this.checkPremiumStatus();

    if (!isPremium) {
      uploadBtn.style.opacity = "0.5";
      uploadBtn.style.cursor = "not-allowed";
      uploadBtn.title = this.getTranslation("tooltip");
    } else {
      uploadBtn.style.opacity = "1";
      uploadBtn.style.cursor = "pointer";
      uploadBtn.title = "";
    }
  }

  // In avatar-upload.js - Add these methods to your SimpleAvatarUpload class

  // Add these methods to your SimpleAvatarUpload class

  // Add this method to SimpleAvatarUpload class
  checkImageContentViolation(filename) {
    const sensitiveWords = [
      "porn",
      "sex",
      "nude",
      "xxx",
      "adult",
      "violence",
      "gore",
      "khiêu dâm",
      "khỏa thân",
      "bạo lực",
      "súng",
      "gun",
      "weapon",
    ];

    const lowerName = filename.toLowerCase();
    for (const word of sensitiveWords) {
      if (lowerName.includes(word)) {
        return { isViolating: true, word: word };
      }
    }
    return { isViolating: false };
  }

  getAvatarViolationMessage(key) {
    const lang = localStorage.getItem("userLanguage") || "en";
    const messages = {
      en: {
        blockedFilename: "❌ Cannot upload: Filename contains prohibited word",
        blockedContent: "❌ Cannot upload: Image contains prohibited content",
      },
      vi: {
        blockedFilename: "❌ Không thể tải lên: Tên file chứa từ bị cấm",
        blockedContent: "❌ Không thể tải lên: Ảnh chứa nội dung bị cấm",
      },
      zh: {
        blockedFilename: "❌ 无法上传：文件名包含禁止的词语",
        blockedContent: "❌ 无法上传：图像包含禁止的内容",
      },
      es: {
        blockedFilename:
          "❌ No se puede subir: El nombre del archivo contiene palabras prohibidas",
        blockedContent:
          "❌ No se puede subir: La imagen contiene contenido prohibido",
      },
      hi: {
        blockedFilename:
          "❌ अपलोड नहीं कर सकते: फ़ाइल नाम में प्रतिबंधित शब्द है",
        blockedContent: "❌ अपलोड नहीं कर सकते: छवि में प्रतिबंधित सामग्री है",
      },
      ar: {
        blockedFilename: "❌ لا يمكن الرفع: اسم الملف يحتوي على كلمة محظورة",
        blockedContent: "❌ لا يمكن الرفع: الصورة تحتوي على محتوى محظور",
      },
    };
    return messages[lang]?.[key] || messages.en[key] || key;
  }

  logAvatarViolation(userId, reason, details) {
    return window.fb.firestore.collection("security_logs").add({
      eventType: "AVATAR_VIOLATION_ATTEMPT",
      userId: userId,
      severity: "high",
      details: { reason, ...details },
      timestamp: new Date(),
    });
  }

  async handleFileSelect(event) {
    console.log("🔍 MAIN handleFileSelect CALLED");

    if (this.isProcessingFile) {
      console.log("⏳ Already processing a file, ignoring duplicate event");
      return;
    }

    this.isProcessingFile = true;
    console.log("🎯 handleFileSelect STARTED");

    const file = event.target.files[0];
    if (!file) {
      console.warn("⚠️ No file in event!");
      this.isProcessingFile = false;
      return;
    }

    console.log("📄 File selected:", file.name, file.size, file.type);

    // Check file type
    if (!file.type.startsWith("image/")) {
      alert(this.getTranslation("notImage"));
      event.target.value = "";
      this.isProcessingFile = false;
      return;
    }

    const lang =
      localStorage.getItem("userLanguage") ||
      localStorage.getItem("appLanguage") ||
      "en";

    // ============================================
    // STEP 1: CHECK FILENAME
    // ============================================
    const fileName = file.name.toLowerCase();
    const badWords = [
      "sex",
      "porn",
      "nude",
      "gun",
      "violence",
      "khiêu dâm",
      "súng",
      "weapon",
      "kill",
      "blood",
    ];

    let blockedWord = null;
    for (const word of badWords) {
      if (fileName.includes(word)) {
        blockedWord = word;
        break;
      }
    }

    if (blockedWord) {
      const filenameMessages = {
        en: (word) =>
          `❌ Cannot upload: Filename contains prohibited word "${word}"`,
        vi: (word) => `❌ Không thể tải lên: Tên file chứa từ bị cấm "${word}"`,
        zh: (word) => `❌ 无法上传：文件名包含禁止的词语 "${word}"`,
        es: (word) =>
          `❌ No se puede subir: El nombre del archivo contiene la palabra prohibida "${word}"`,
        hi: (word) =>
          `❌ अपलोड नहीं कर सकते: फ़ाइल नाम में प्रतिबंधित शब्द "${word}" है`,
        ar: (word) =>
          `❌ لا يمكن الرفع: اسم الملف يحتوي على كلمة محظورة "${word}"`,
      };
      const msg = filenameMessages[lang](blockedWord);
      alert(msg);
      event.target.value = "";
      this.isProcessingFile = false;
      return;
    }

    // ============================================
    // ADD SIGHTENGINE CHECK HERE
    // ============================================
    console.log("🔍 Running SightEngine check on avatar...");
    const analysis = await window.moderateImageWithSightEngine(file);

    if (!analysis.safe) {
      const msg = window.getViolationMessage(analysis.reason, lang);
      alert(msg);
      event.target.value = "";
      this.isProcessingFile = false;
      return;
    }

    // ============================================
    // STEP 2: SIGHTENGINE CONTENT CHECK
    // ============================================
    console.log("🔍 Running SightEngine check on avatar...");

    if (!analysis.safe) {
      const msg = window.getViolationMessage(analysis.reason, lang);
      alert(msg);
      event.target.value = "";
      this.isProcessingFile = false;
      return;
    }

    // Send mobile log
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (isMobile && typeof this.sendMobileLogToFirestore === "function") {
      this.sendMobileLogToFirestore({
        event: "avatar_file_selected",
        fileName: file.name,
        fileSize: file.size,
        timestamp: new Date().toISOString(),
      });
    }

    // Process the image
    console.log("🔄 Compressing image for avatar...");

    const processImage = (imageFile) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.updateAvatarImage(e.target.result);
        this.showUploadSuccessMessage();
        this.isProcessingFile = false;
      };
      reader.onerror = (error) => {
        console.error("❌ File read error:", error);
        alert(this.getTranslation("fileReadError"));
        this.isProcessingFile = false;
      };
      reader.readAsDataURL(imageFile);
    };

    if (typeof window.compressImage === "function") {
      window
        .compressImage(file, {
          maxWidth: 300,
          maxHeight: 300,
          quality: 0.8,
          maxSizeMB: 0.5,
        })
        .then((compressedFile) => {
          console.log("✅ Image compressed:", compressedFile.size, "bytes");
          processImage(compressedFile);
        })
        .catch((error) => {
          console.error("❌ Compression failed:", error);
          processImage(file);
        });
    } else {
      console.log("⚠️ Compressor not available, using original file");
      processImage(file);
    }
  }

  // New method to process the compressed file
  processAvatarFile(file) {
    console.log("📱 Processing final avatar file, size:", file.size);

    // Check file type again for safety
    if (!file.type.startsWith("image/")) {
      alert(this.getTranslation("notImage"));
      this.isProcessingFile = false;
      return;
    }

    // Show loading indicator
    const avatarImg = document.getElementById("userAvatar");
    if (avatarImg) {
      avatarImg.style.opacity = "0.5";
    }

    const reader = new FileReader();

    reader.onload = (e) => {
      console.log("✅ Avatar loaded successfully");

      // Update the avatar image on the page
      this.updateAvatarImage(e.target.result);

      // Show success message
      this.showUploadSuccessMessage();

      // Save to localStorage (compressed version)
      try {
        console.log("✅ Avatar saved to localStorage");
      } catch (error) {
        console.warn("Could not save to localStorage:", error.message);
        // Still show success even if localStorage fails
      }

      // Send success log to Firestore
      if (typeof this.sendMobileLogToFirestore === "function") {
        this.sendMobileLogToFirestore({
          event: "avatar_upload_success",
          fileSize: file.size,
          timestamp: new Date().toISOString(),
        });
      }

      // Hide loading indicator
      if (avatarImg) {
        avatarImg.style.opacity = "1";
      }

      // Reset processing flag
      this.isProcessingFile = false;
    };

    reader.onerror = (error) => {
      console.error("❌ File read error:", error);
      alert(this.getTranslation("fileReadError"));

      // Hide loading indicator
      if (avatarImg) {
        avatarImg.style.opacity = "1";
      }

      // Reset processing flag
      this.isProcessingFile = false;
    };

    reader.readAsDataURL(file);
  }

  // Replace the saveToLocalStorage method with this:
  saveToLocalStorage(dataUrl) {
    // Skip localStorage completely - avatars are in Firebase Storage
    console.log("Avatar stored in Firebase, skipping localStorage");
    return;
  }

  showUploadSuccessMessage() {
    const msg = document.createElement("div");
    msg.textContent =
      this.getTranslation("uploadSuccess") || "Avatar uploaded!";
    msg.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #4CAF50;
    color: white;
    padding: 10px 20px;
    border-radius: 5px;
    z-index: 10000;
    animation: fadeOut 3s forwards;
  `;

    document.body.appendChild(msg);

    setTimeout(() => {
      if (msg.parentNode) {
        msg.parentNode.removeChild(msg);
      }
    }, 3000);
  }

  updateAvatarImage(imageUrl) {
    // Small delay to ensure DOM is ready
    setTimeout(() => {
      const avatarImg = document.getElementById("userAvatar");
      if (avatarImg) {
        avatarImg.src = imageUrl;

        console.log("✅ Avatar updated and saved");
        // ADD THIS LINE
        lastAvatarUploadTime = Date.now();
      } else {
        console.error("Avatar element #userAvatar not found on page");
      }
    }, 50);
  }

  updateButtonStyles() {
    const style = document.createElement("style");
    style.textContent = `
      .avatar-upload-btn {
        position: absolute !important;
        bottom: -5px !important;
        right: -5px !important;
        width: 20px !important;
        height: 20px !important;
        background: #007bff !important;
        color: white !important;
        border: 2px solid white !important;
        border-radius: 50% !important;
        cursor: pointer !important;
        font-size: 10px !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        z-index: 10 !important;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2) !important;
      }
      
      .avatar-upload-btn:hover {
        background: #0056b3 !important;
        transform: scale(1.1) !important;
      }
      
      .avatar-upload-btn[style*="not-allowed"]:hover {
        transform: none !important;
      }
      
      .avatar-section {
        position: relative !important;
        display: inline-block !important;
        width: 50px !important;
        height: 50px !important;
      }
      
      .avatar-image {
        width: 100% !important;
        height: 100% !important;
        border-radius: 50% !important;
        object-fit: cover !important;
        border: 2px solid #ddd !important;
      }
    `;
    document.head.appendChild(style);
  }

  // Call this after login
  async checkAndShowOrgLogo() {
    const user = window.fb?.auth?.currentUser;
    if (!user) return;

    const isOrg = await this.checkIfOrganization(user.uid);
    if (isOrg) {
      // You can show a simple button here
      console.log("🏢 Organization account detected");
      // Add a small button to upload logo
      const avatarSection = document.querySelector(".avatar-section");
      if (avatarSection && !document.getElementById("orgLogoBtn")) {
        const btn = document.createElement("button");
        btn.id = "orgLogoBtn";
        btn.innerHTML = "📋 Upload Logo";
        btn.style.marginLeft = "10px";
        btn.onclick = () => alert("Organization logo upload coming soon");
        avatarSection.appendChild(btn);
      }
    }
  }

  // Add to your SimpleAvatarUpload class
  isFilenameBlocked(fileName) {
    const blockedWords = [
      "porn",
      "sex",
      "nude",
      "xxx",
      "adult",
      "violence",
      "gore",
    ];
    const lowerName = fileName.toLowerCase();
    for (const word of blockedWords) {
      if (lowerName.includes(word)) return { blocked: true, word: word };
    }
    return { blocked: false };
  }
}

// ============================================
// TEST MOBILE UPLOAD FUNCTION (Temporary)
// ============================================
async function testMobileUpload() {
  console.log("📱 TEST MOBILE UPLOAD");

  try {
    // Create simple file input
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.style.display = "none";

    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (file) {
        console.log("📱 File selected:", file.name);
        alert(`Selected: ${file.name}`);

        // Log to Firestore
        try {
          const { collection, addDoc } =
            await import("https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js");
          const db = window.fb.firestore.db;

          await addDoc(collection(db, "mobile_logs"), {
            event: "test_upload",
            fileName: file.name,
            fileSize: file.size,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
          });
          console.log("📱 Test log sent to Firestore");
        } catch (e) {
          console.log("📱 Test log failed:", e.message);
        }
      }
    };

    document.body.appendChild(input);
    setTimeout(() => input.click(), 100);
  } catch (error) {
    console.error("📱 Test error:", error);
  }
}

// Initialize ONLY on main page
// REPLACE everything from the "Initialize ONLY on main page" if statement
// REPLACE the bottom part (from "Initialize ONLY on main page") with:

// MINIMAL INITIALIZATION - Run once only
(function () {
  console.log("🔍 avatar-upload.js: Starting initialization...");

  // Self-executing function to prevent duplicate execution
  if (window.avatarUploadInitialized) {
    console.log("⏭️ avatar-upload.js: Already initialized, skipping");
    return;
  }
  window.avatarUploadInitialized = true;

  // Wait for Firebase
  function waitForFirebase() {
    if (!window.fb || !window.fb.auth) {
      console.log("⏳ avatar-upload.js: Waiting for window.fb.auth...");
      setTimeout(waitForFirebase, 200);
      return;
    }

    console.log("✅ avatar-upload.js: Firebase ready!");

    // Check if on main page
    const isMainPage =
      window.location.pathname.includes("dashboard.html") ||
      window.location.pathname === "/" ||
      window.location.pathname.includes("index.html");

    if (!isMainPage) {
      console.log("📄 avatar-upload.js: Not a main page, skipping");
      return;
    }

    // Initialize
    console.log("🚀 avatar-upload.js: Initializing SimpleAvatarUpload...");
    try {
      window.avatarUpload = new SimpleAvatarUpload();
      console.log("✅ avatar-upload.js: Initialization complete");
    } catch (error) {
      console.error("❌ avatar-upload.js: Initialization failed:", error);
    }
  }

  // Start after a short delay
  setTimeout(waitForFirebase, 500);
})();
