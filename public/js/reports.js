// At the top of reports.js, after existing constants but before functions
// Add this at the top of your file, outside any function
window._languageLock = false;
window._translationLock = false;

// ============================================
// APPEAL MESSAGES AND FUNCTIONS
// ============================================

const appealMessages = {
  en: {
    title: "Request Report Approval",
    desc: "If your report contains sensitive content but is urgent (e.g., missing person), please explain why it should be approved:",
    submitted:
      "Your appeal has been submitted. Admin will review and contact you.",
    error: "Failed to submit appeal. Please try again.",
    contact: "Your email or phone",
  },
  vi: {
    title: "Yêu Cầu Phê Duyệt Báo Cáo",
    desc: "Nếu báo cáo của bạn chứa nội dung nhạy cảm nhưng khẩn cấp (ví dụ: người mất tích), vui lòng giải thích lý do nên được phê duyệt:",
    submitted:
      "Yêu cầu của bạn đã được gửi. Quản trị viên sẽ xem xét và liên hệ với bạn.",
    error: "Gửi yêu cầu thất bại. Vui lòng thử lại.",
    contact: "Email hoặc số điện thoại của bạn",
  },
  zh: {
    title: "请求报告批准",
    desc: "如果您的报告包含敏感内容但很紧急（例如失踪人员），请解释为什么应该批准：",
    submitted: "您的请求已提交。管理员将审核并与您联系。",
    error: "提交请求失败。请重试。",
    contact: "您的电子邮件或电话",
  },
  es: {
    title: "Solicitar Aprobación de Informe",
    desc: "Si tu informe contiene contenido sensible pero es urgente (ej: persona desaparecida), explica por qué debería ser aprobado:",
    submitted:
      "Tu solicitud ha sido enviada. El administrador la revisará y te contactará.",
    error: "Error al enviar la solicitud. Por favor, inténtalo de nuevo.",
    contact: "Tu correo electrónico o teléfono",
  },
  hi: {
    title: "रिपोर्ट स्वीकृति का अनुरोध करें",
    desc: "यदि आपकी रिपोर्ट में संवेदनशील सामग्री है लेकिन अत्यावश्यक है (जैसे: लापता व्यक्ति), कृपया बताएं कि इसे क्यों स्वीकृत किया जाना चाहिए:",
    submitted:
      "आपका अनुरोध सबमिट कर दिया गया है। व्यवस्थापक समीक्षा करेगा और आपसे संपर्क करेगा।",
    error: "अनुरोध सबमिट करने में विफल। कृपया पुनः प्रयास करें।",
    contact: "आपका ईमेल या फ़ोन",
  },
  ar: {
    title: "طلب الموافقة على التقرير",
    desc: "إذا كان تقريرك يحتوي على محتوى حساس ولكنه عاجل (مثال: شخص مفقود)، يرجى توضيح سبب وجوب الموافقة عليه:",
    submitted: "تم إرسال طلبك. سيقوم المسؤول بمراجعته والاتصال بك.",
    error: "فشل إرسال الطلب. يرجى المحاولة مرة أخرى.",
    contact: "بريدك الإلكتروني أو هاتفك",
  },
};

// Then add the appeal functions after this object
function showAppealModal(reportData) {
  const lang = localStorage.getItem("userLanguage") || "en";
  const t = appealMessages[lang];

  // Create modal if it doesn't exist
  let modal = document.getElementById("appealModal");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "appealModal";
    modal.style.cssText =
      "display: none; position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: white; padding: 20px; border-radius: 8px; z-index: 10000; max-width: 500px; width: 90%; box-shadow: 0 4px 8px rgba(0,0,0,0.2);";
    modal.innerHTML = `
            <h3 id="appealTitle">Request Report Approval</h3>
            <p id="appealDesc">If your report contains sensitive content but is urgent (e.g., missing person), please explain why it should be approved:</p>
            <textarea id="appealReason" rows="4" style="width: 100%; margin: 10px 0; padding: 8px; border: 1px solid #ddd; border-radius: 4px;" placeholder="Explain why this report is important..."></textarea>
            <input type="text" id="appealContact" placeholder="Your email or phone" style="width: 100%; margin: 10px 0; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
            <div style="display: flex; gap: 10px; justify-content: flex-end;">
                <button onclick="closeAppealModal()" style="padding: 8px 16px; background: #6c757d; color: white; border: none; border-radius: 4px;">Cancel</button>
                <button onclick="submitAppeal()" style="padding: 8px 16px; background: #4267B2; color: white; border: none; border-radius: 4px;">Submit Request</button>
            </div>
        `;
    document.body.appendChild(modal);
  }

  document.getElementById("appealTitle").innerText = t.title;
  document.getElementById("appealDesc").innerText = t.desc;
  document.getElementById("appealContact").placeholder = t.contact;
  modal.style.display = "block";

  window.currentAppealReport = reportData;
}

function closeAppealModal() {
  const modal = document.getElementById("appealModal");
  if (modal) modal.style.display = "none";
  window.currentAppealReport = null;
}

async function submitAppeal() {
  const reason = document.getElementById("appealReason").value;
  const contact = document.getElementById("appealContact").value;
  const lang = localStorage.getItem("userLanguage") || "en";
  const t = appealMessages[lang];

  if (!reason) {
    alert("Please explain why your report should be approved.");
    return;
  }

  try {
    await window.fb.firestore.collection("appeal_requests").add({
      report: window.currentAppealReport,
      reason: reason,
      contact: contact,
      userId: window.fb.auth.currentUser.uid,
      userEmail: window.fb.auth.currentUser.email,
      status: "pending",
      createdAt: new Date().toISOString(),
    });

    alert(t.submitted);
    closeAppealModal();

    document.getElementById("appealReason").value = "";
    document.getElementById("appealContact").value = "";
  } catch (error) {
    console.error("Error submitting appeal:", error);
    alert(t.error);
  }
}

// Make functions global
window.showAppealModal = showAppealModal;
window.closeAppealModal = closeAppealModal;
window.submitAppeal = submitAppeal;

// 🔥 Wait for saveCurrentReport to be available (add at the VERY TOP)
function waitForSaveCurrentReport(callback, maxAttempts = 20) {
  let attempts = 0;
  const check = setInterval(() => {
    attempts++;
    if (typeof window.saveCurrentReport === "function") {
      clearInterval(check);
      console.log(
        "✅ window.saveCurrentReport is now available after",
        attempts,
        "attempts",
      );
      callback();
    } else if (attempts >= maxAttempts) {
      clearInterval(check);
      console.error(
        "❌ window.saveCurrentReport still not available after",
        maxAttempts,
        "attempts",
      );
    }
  }, 100);
}

// ============================================
// YOUR EXISTING REPORTS.JS CODE STARTS HERE
// ============================================

// ✅ CORRECTED uploadImage function for reports.js
async function uploadImage(file, storagePath = null) {
  if (!file) return Promise.resolve(null);

  console.log("DEBUG: uploadImage in reports.js called.");

  // 1. Compress the image (ensure compressImageForUpload is available)
  const processedFile = await compressImageForUpload(file);

  // 2. Generate the storage path
  const finalStoragePath =
    storagePath || `reports/${Date.now()}_${processedFile.name}`;

  try {
    // 3. ✅ USE THE PROVEN HELPER - This is the key line.
    // This is your original, working helper. We assume it returns a correct URL.
    const downloadUrl = await window.fb.storage.uploadFile(
      finalStoragePath,
      processedFile,
    );
    console.log("DEBUG: Upload successful, URL:", downloadUrl);
    return downloadUrl;
  } catch (error) {
    console.error("Upload failed:", error);
    throw error;
  }
}

// ▼▼▼ COMPLETE RESTORE AFTER LANGUAGE RELOAD ▼▼▼
(function () {
  // ============================================
  // SKIP FOR SIGNED-OUT USERS
  // ============================================
  const user = window.fb?.auth?.currentUser;
  if (!user) {
    console.log("⚠️ User not signed in - skipping form restore");
    return;
  }

  console.log("=== 🔄 LANGUAGE CHANGE RESTORE START ===");

  // 1. RESTORE FORM DATA
  const savedForm = localStorage.getItem("preReloadFormData");
  if (savedForm) {
    try {
      const data = JSON.parse(savedForm);
      console.log("📦 Form data to restore:", data);

      const now = new Date().getTime();
      if (now - data.savedAt > 15000) {
        console.log("Data too old, skipping");
        localStorage.removeItem("preReloadFormData");
      } else {
        setTimeout(() => {
          console.log("🔄 Restoring form data...");

          const fields = [
            { id: "report-title", value: data.title },
            { id: "report-type", value: data.type },
            { id: "report-description", value: data.description },
            { id: "location-text-input", value: data.location },
            { id: "reporter-contact", value: data.contact },
          ];

          if (data.searchAddress) {
            const addressField = document.getElementById("address-input");
            if (addressField) {
              addressField.value = data.searchAddress;
              console.log(`✅ Restored address-input: ${data.searchAddress}`);
            }
          }

          fields.forEach((field) => {
            const el = document.getElementById(field.id);
            if (el && field.value) {
              el.value = field.value;
              console.log(`✅ Restored ${field.id}: ${field.value}`);
            }
          });

          if (data.imageCount > 0) {
            console.log(
              `📸 Previously had ${data.imageCount} images:`,
              data.imageNames,
            );
          }

          localStorage.removeItem("preReloadFormData");
          console.log("✅ Form restoration complete");
        }, 1500);
      }
    } catch (error) {
      console.error("❌ Form restore error:", error);
      localStorage.removeItem("preReloadFormData");
    }
  }

  // 2. RESTORE TAB POSITION
  const savedTab = localStorage.getItem("preReloadTab");
  console.log("Saved tab to restore:", savedTab);

  if (savedTab === "saved-reports") {
    console.log("🔄 Restoring saved-reports tab...");

    setTimeout(() => {
      console.log("🔄 Attempting to load saved reports...");

      if (typeof loadSavedReports === "function") {
        console.log("✅ Calling loadSavedReports()");
        loadSavedReports();
      } else {
        console.log("❌ loadSavedReports function not found");
        const savedTabBtn = document.querySelector(
          '[data-tab="saved-reports"]',
        );
        if (savedTabBtn) {
          console.log("✅ Clicking saved reports tab");
          savedTabBtn.click();
        }
      }

      setTimeout(() => {
        const hasReports =
          document.querySelectorAll("#saved-reports-container .report-item")
            .length > 0;
        console.log("Has reports after loading attempt?", hasReports);

        if (hasReports) {
          switchTab("saved-reports");
          console.log("✅ Successfully switched to saved-reports");
        } else {
          console.log("⚠️ No reports found, staying on current tab");
        }

        localStorage.removeItem("preReloadTab");
      }, 3000);
    }, 2000);
  }

  console.log("=== 🔄 LANGUAGE CHANGE RESTORE END ===");
})();
// ▲▲▲ END RESTORE FUNCTION ▲▲▲

// ===== LOADING POPUP SYSTEM =====
const LOADING_TRANSLATIONS = {
  en: { submitting: "Submitting report...", pleaseWait: "Please wait" },
  vi: { submitting: "Đang gửi báo cáo...", pleaseWait: "Vui lòng chờ" },
  zh: { submitting: "正在提交报告...", pleaseWait: "请稍候" },
  es: { submitting: "Enviando reporte...", pleaseWait: "Por favor espera" },
  hi: {
    submitting: "रिपोर्ट सबमिट की जा रही है...",
    pleaseWait: "कृपया प्रतीक्षा करें",
  },
  ar: { submitting: "جاري إرسال التقرير...", pleaseWait: "يرجى الانتظار" },
};

function showLoadingPopup(message = null) {
  // Remove existing popup first
  hideLoadingPopup();

  const lang = localStorage.getItem("userLanguage") || "en";
  const texts = LOADING_TRANSLATIONS[lang] || LOADING_TRANSLATIONS.en;

  // Create popup
  const popup = document.createElement("div");
  popup.id = "submitting-popup";
  popup.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(0, 0, 0, 0.9);
        color: white;
        padding: 25px 35px;
        border-radius: 12px;
        z-index: 10000;
        text-align: center;
        min-width: 250px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.5);
        border: 1px solid rgba(255,255,255,0.2);
        font-family: Arial, sans-serif;
    `;

  popup.innerHTML = `
        <div class="spinner" style="
            width: 40px;
            height: 40px;
            border: 4px solid rgba(255,255,255,0.3);
            border-radius: 50%;
            border-top-color: #4CAF50;
            animation: spin 1s linear infinite;
            margin: 0 auto 15px;
        "></div>
        <div style="font-weight: bold; margin-bottom: 5px; font-size: 16px;">
            ${message || texts.submitting}
        </div>
        <div style="font-size: 14px; opacity: 0.8;">
            ${texts.pleaseWait}
        </div>
    `;

  // Add backdrop
  const backdrop = document.createElement("div");
  backdrop.id = "submitting-popup-backdrop";
  backdrop.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.5);
        z-index: 9999;
    `;

  // Add CSS animation
  const style = document.createElement("style");
  style.textContent = `
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    `;

  document.head.appendChild(style);
  document.body.appendChild(backdrop);
  document.body.appendChild(popup);
}

function hideLoadingPopup() {
  const popup = document.getElementById("submitting-popup");
  const backdrop = document.getElementById("submitting-popup-backdrop");
  if (popup) popup.remove();
  if (backdrop) backdrop.remove();
}

function disableSubmitButton(disabled = true) {
  const submitBtn =
    document.getElementById("submit-report") ||
    document.querySelector('button[type="submit"]') ||
    document.querySelector(".submit-btn");

  if (submitBtn) {
    submitBtn.disabled = disabled;
    submitBtn.style.opacity = disabled ? "0.6" : "1";
    submitBtn.style.cursor = disabled ? "not-allowed" : "pointer";

    // Store original text if not already stored
    if (disabled && !submitBtn.dataset.originalText) {
      submitBtn.dataset.originalText = submitBtn.innerHTML;
      submitBtn.innerHTML =
        '<i class="fas fa-spinner fa-spin"></i> ' +
        (LOADING_TRANSLATIONS[localStorage.getItem("userLanguage") || "en"]
          ?.submitting || "Submitting...");
    } else if (!disabled && submitBtn.dataset.originalText) {
      submitBtn.innerHTML = submitBtn.dataset.originalText;
      delete submitBtn.dataset.originalText;
    }
  }
}
// ===== END LOADING POPUP SYSTEM =====

// ===== NUCLEAR IMAGE CLEARING FUNCTION =====
function nuclearImageClear() {
  console.log("☢️ NUCLEAR IMAGE CLEAR ACTIVATED");

  // 1. Clear ALL image-related global variables
  const imageVars = [
    "lastUploadedImages",
    "imageUrls",
    "currentImages",
    "uploadedImages",
    "selectedImages",
    "compressedImages",
    "imageFiles",
    "lastReport",
    "reportImages",
    "imagePreviewState",
    "imageFileCache",
  ];

  imageVars.forEach((varName) => {
    if (window[varName] !== undefined) {
      console.log(`   Clearing: window.${varName}`);
      if (Array.isArray(window[varName])) {
        window[varName] = [];
      } else {
        window[varName] = null;
      }
    }
  });

  // 2. NUCLEAR file input reset
  const fileInput = document.getElementById("report-image");
  if (fileInput) {
    console.log("💥 Replacing file input...");

    // Simple method: Just clear the value
    fileInput.value = "";

    // Also clear any data attributes
    fileInput.removeAttribute("data-files");
    fileInput.removeAttribute("data-urls");
  }

  // 3. NUCLEAR preview clear - This is the KEY FIX!
  const preview = document.getElementById("image-preview");
  if (preview) {
    console.log("💥 Nuclear preview clearing...");

    // Remove ALL children
    while (preview.firstChild) {
      const child = preview.firstChild;
      if (child.tagName === "IMG" && child.src.startsWith("blob:")) {
        URL.revokeObjectURL(child.src); // Free memory
      }
      preview.removeChild(child);
    }

    // Add fresh empty state WITH DIFFERENT ID/CLASS
    preview.innerHTML = `
            <div id="empty-preview-state" style="text-align:center;padding:30px;color:#666;border:2px dashed #ddd;border-radius:8px;margin:10px;">
                <i class="fas fa-images" style="font-size:48px;color:#ddd;margin-bottom:10px;"></i>
                <div style="color:#666;font-size:14px;">No images selected</div>
                <div style="color:#999;font-size:12px;margin-top:5px;">Click "Choose files" above</div>
            </div>
        `;

    console.log("✅ Preview nuked and replaced");
  }

  // 4. Clear localStorage for images
  try {
    localStorage.removeItem("lastUploadedImages"); // 🔥 ADD THIS LINE
    const keys = Object.keys(localStorage).filter(
      (key) =>
        key.includes("image") ||
        key.includes("Image") ||
        key.includes("preview"),
    );
    keys.forEach((key) => localStorage.removeItem(key));
  } catch (e) {}

  console.log("☢️ NUCLEAR CLEAR COMPLETE");
}
// ===== END NUCLEAR FUNCTION =====

// ===== IMAGE DEBUGGING FUNCTION =====
function debugImageStorage() {
  console.log("🔍 IMAGE DEBUG REPORT:");
  console.log("======================");

  // 1. Check ALL window variables that might store images
  const imageVariables = [
    "lastUploadedImages",
    "imageUrls",
    "currentImages",
    "uploadedImages",
    "selectedImages",
    "compressedImages",
    "imageFiles",
    "lastReport",
    "reportImages",
    "imagePreviewState",
    "imageFileCache",
    "currentReportImages",
  ];

  imageVariables.forEach((varName) => {
    if (window[varName] !== undefined) {
      console.log(`📦 window.${varName}:`, window[varName]);
    }
  });

  // 2. Check DOM elements
  const fileInput = document.getElementById("report-image");
  if (fileInput) {
    console.log(`📁 File input: ${fileInput.files.length} files`);
  }

  const preview = document.getElementById("image-preview");
  if (preview) {
    console.log(`🖼️ Preview area: ${preview.children.length} children`);
    if (preview.children.length > 0) {
      console.log("Preview children:", preview.innerHTML.substring(0, 200));
    }
  }

  // 3. Check localStorage
  try {
    const keys = Object.keys(localStorage).filter(
      (k) => k.includes("image") || k.includes("Image") || k.includes("report"),
    );
    console.log(`💾 localStorage image keys:`, keys);
  } catch (e) {}

  console.log("======================");
}
// ===== END DEBUG FUNCTION =====

// ▼ Add this at the top of your file ▼
const BUTTON_TEXTS = {
  reshare: {
    en: "Reshare",
    vi: "Chia sẻ lại",
    ar: "إعادة مشاركة",
    es: "Volver a compartir",
    hi: "पुनः साझा करें",
    zh: "重新分享",
  },
  delete: {
    en: "Delete",
    vi: "Xóa",
    ar: "حذف",
    es: "Eliminar",
    hi: "हटाएं",
    zh: "删除",
  },
};

// ▼ DOM Protection System (add right after BUTTON_TEXTS) ▼

function applyButtonText(btn, lang) {
  const text = btn.classList.contains("reshare-btn")
    ? BUTTON_TEXTS.reshare[lang]
    : BUTTON_TEXTS.delete[lang];
  btn.textContent = text;
  btn.setAttribute("data-translated", "locked");
}
// ▼ Add at top of reports.js ▼
function fixButtonTranslations() {
  const lang = window.currentLanguage || "en";
  document.querySelectorAll(".reshare-btn, .delete-btn").forEach((btn) => {
    btn.textContent = btn.classList.contains("reshare-btn")
      ? TRANSLATION_PATCH.buttons.reshare[lang]
      : TRANSLATION_PATCH.buttons.delete[lang];
  });
}

// Add at the top of reports.js, with other global variables
let isSubmitting = false;

// Helper function for image validation
async function validateImageSelection(files) {
  const currentLang = localStorage.getItem("userLanguage") || "en";
  const userId = window.fb.auth.currentUser?.uid;

  if (files.length === 0) {
    return { valid: true };
  }

  // Check premium status - localStorage first, then Firestore
  let isPremium = localStorage.getItem(`premium_${userId}`) === "true";

  if (!isPremium && userId && userId !== "anonymous") {
    try {
      const userDoc = await window.fb.firestore
        .collection("users")
        .doc(userId)
        .get();
      isPremium = userDoc.exists && userDoc.data().isPremium === true;
      if (isPremium) {
        localStorage.setItem(`premium_${userId}`, "true");
      }
    } catch (e) {
      console.error("Failed to check premium from Firestore:", e);
    }
  }

  const MAX_IMAGES = isPremium ? 5 : 0;

  if (files.length > MAX_IMAGES) {
    const errorMessages = {
      en: `Maximum ${MAX_IMAGES} images allowed. Please subscribe for more.`,
      vi: `Tối đa ${MAX_IMAGES} hình ảnh được cho phép. Vui lòng đăng ký để có thêm.`,
      zh: `最多允许 ${MAX_IMAGES} 张图片。请订阅以获得更多。`,
      es: `Máximo ${MAX_IMAGES} imágenes permitidas. Por favor suscríbete para más.`,
      hi: `अधिकतम ${MAX_IMAGES} छवियों की अनुमति है। अधिक के लिए कृपया सदस्यता लें।`,
      ar: `الحد الأقصى ${MAX_IMAGES} صورة مسموح بها. يرجى الاشتراك للمزيد.`,
    };
    return {
      valid: false,
      error: errorMessages[currentLang] || errorMessages.en,
    };
  }

  // Rest of your validation code...
  for (let file of files) {
    if (!file.type.startsWith("image/")) {
      const errorMessages = {
        en: "Please select only image files (JPEG, PNG, etc.)",
        vi: "Vui lòng chỉ chọn tệp hình ảnh (JPEG, PNG, v.v.)",
        zh: "请仅选择图像文件（JPEG、PNG 等）",
        es: "Por favor seleccione solo archivos de imagen (JPEG, PNG, etc.)",
        hi: "कृपया केवल छवि फ़ाइलें चुनें (JPEG, PNG, आदि)",
        ar: "يرجى تحديد ملفات الصور فقط (JPEG، PNG، إلخ)",
      };
      return {
        valid: false,
        error: errorMessages[currentLang] || errorMessages.en,
      };
    }

    // Check file size (5MB limit per file)
    if (file.size > 5 * 1024 * 1024) {
      const errorMessages = {
        en: `File "${file.name}" is too large. Maximum size is 5MB per file.`,
        vi: `Tệp "${file.name}" quá lớn. Kích thước tối đa là 5MB mỗi tệp.`,
        zh: `文件"${file.name}"太大。每个文件最大大小为5MB。`,
        es: `El archivo "${file.name}" es demasiado grande. El tamaño máximo es de 5MB por archivo.`,
        hi: `फ़ाइल "${file.name}" बहुत बड़ी है। प्रति फ़ाइल अधिकतम आकार 5MB है।`,
        ar: `الملف "${file.name}" كبير جدًا. الحد الأقصى للحجم هو 5MB لكل ملف.`,
      };
      return {
        valid: false,
        error: errorMessages[currentLang] || errorMessages.en,
      };
    }
  }

  return { valid: true };
}

// Makes button text IMMUTABLE
function lockButtonText(btn) {
  const lang = window.currentLanguage || "en";
  const text = btn.classList.contains("reshare-btn")
    ? TRANSLATION_PATCH.buttons.reshare[lang]
    : TRANSLATION_PATCH.buttons.delete[lang];

  // Nuclear lock - prevents any changes
  Object.defineProperty(btn, "textContent", {
    get: () => text,
    set: () => {}, // Discards any attempted changes
    configurable: false,
  });
}

// Updates all buttons on screen
function refreshAllButtons() {
  document.querySelectorAll(".reshare-btn, .delete-btn").forEach((btn) => {
    lockButtonText(btn);
  });
}

// ▼ Simple Button Translation Lock ▼
let isTranslatingButtons = false;
const safeTranslateButtons = () => {
  if (isTranslatingButtons) return;
  isTranslatingButtons = true;

  const lang = window.currentLanguage || "en";
  document.querySelectorAll(".reshare-btn, .delete-btn").forEach((btn) => {
    btn.textContent = btn.classList.contains("reshare-btn")
      ? TRANSLATION_PATCH.buttons.reshare[lang]
      : TRANSLATION_PATCH.buttons.delete[lang];
  });

  isTranslatingButtons = false;
};
// ▼▼▼ ADD THIS AT THE VERY TOP OF reports.js ▼▼▼

// ▼ Simple Button Translation Anchor ▼
function anchorButtonTranslations() {
  const buttons = document.querySelectorAll(".reshare-btn, .delete-btn");
  buttons.forEach((btn) => {
    btn.dataset.originalText = btn.textContent; // Anchor current translation
  });
}
// ▼ Call this after initial translations ▼
anchorButtonTranslations();

// ▼▼▼ TOP OF FILE (REPLACEMENT) ▼▼▼
let buttonUpdateLog = [];

function logButtonUpdate(action, btn) {
  const entry = {
    time: new Date().toISOString(),
    action,
    id: btn?.dataset?.id,
    text: btn?.textContent?.trim(),
    lang: window.currentLanguage,
    stack: new Error().stack.split("\n").slice(1, 4).join("|"),
  };
  buttonUpdateLog.push(entry);
  console.log("Button Update:", entry);
}
function initializeApp() {
  // 1. Notification permission
  if ("Notification" in window && Notification.permission !== "denied") {
    Notification.requestPermission();
  }

  // 2. Language setup
  const defaultLang = localStorage.getItem("userLanguage") || "en";
  setLanguage(defaultLang);

  // 3. UI Translations
  setTimeout(() => {
    updateLogoutButton();
    updatePatchedTranslations();
    updateFileInputDisplay();
    updateLocationFieldPlaceholders();
    updateTitleExamplePlaceholder();
    updateDashboardButton();
    translateDropdown();
  }, 300);

  // 4. Event listeners
  document
    .getElementById("language-switcher")
    ?.addEventListener("change", (e) => {
      setLanguage(e.target.value);
    });

  const fileInput = document.getElementById("report-image");
  if (fileInput) fileInput.addEventListener("change", updateFileInputDisplay);
}
// ===== ADD THIS RIGHT AFTER updatePatchedTranslations() ===== //
function setupSaveButton() {
  console.log("DEBUG: setupSaveButton() started");

  const saveBtn = document.getElementById("save-report-btn");
  if (!saveBtn) {
    console.error("DEBUG: Save button not found!");
    return;
  }
  console.log("DEBUG: Save button found");

  // 1. REMOVE ALL existing click listeners
  const newSaveBtn = saveBtn.cloneNode(true);
  saveBtn.parentNode.replaceChild(newSaveBtn, saveBtn);

  // 2. ADD ONLY OUR listener
  newSaveBtn.onclick = function (e) {
    e.preventDefault();
    console.log("FINAL save handler working");

    const lang = (localStorage.getItem("userLanguage") || "en").split("-")[0];
    const report = getReport();

    console.log(
      "🔍 MANUAL SAVE - window.lastUploadedImages:",
      window.lastUploadedImages,
    );
    console.log(
      "🔍 MANUAL SAVE - window.lastUploadedImages length:",
      window.lastUploadedImages?.length,
    );
    console.log("🔍 MANUAL SAVE - report.imageUrls:", report.imageUrls);
    console.log(
      "🔍 MANUAL SAVE - report.imageUrls length:",
      report.imageUrls?.length,
    );

    // Add this debug right after const report = getReport();
    console.log(
      "🔍 SAVE BUTTON - window.lastUploadedImages:",
      window.lastUploadedImages,
    );
    console.log(
      "🔍 SAVE BUTTON - window.lastUploadedImages length:",
      window.lastUploadedImages?.length,
    );
    console.log("🔍 SAVE BUTTON - report.imageUrls:", report.imageUrls);
    console.log(
      "🔍 SAVE BUTTON - report.imageUrls length:",
      report.imageUrls?.length,
    );

    console.log("Current report data:", report);

    // Simple empty check
    const isReportEmpty = !report.title && !report.description;
    if (isReportEmpty) {
      console.log("Report is empty (no title or description), not saving");
      return;
    }

    // 🔥 FIX: Get current user and use user-specific key
    const user = window.fb?.auth?.currentUser;
    if (!user) {
      alert("Please sign in to save reports");
      return;
    }

    const savedReportsKey = `savedReports_${user.uid}`;
    const savedReports =
      JSON.parse(localStorage.getItem(savedReportsKey)) || [];

    // Check for duplicates - CONTENT-BASED
    const isDuplicate = savedReports.some(
      (savedReport) =>
        savedReport.title === report.title &&
        savedReport.description === report.description &&
        savedReport.type === report.type,
    );

    if (isDuplicate) {
      const messages = {
        en: "This report is already saved.",
        vi: "Báo cáo này đã được lưu.",
        ar: "تم حفظ هذا التقرير بالفعل.",
        es: "Este informe ya está guardado.",
        hi: "यह रिपोर्ट पहले से सहेजी जा चुकी है।",
        zh: "该报告已保存。",
      };
      alert(messages[lang] || messages.en);
      return;
    }

    // Save the report
    // ENHANCED: Save report with ALL images
    const reportToSave = {
      ...report,
      timestamp: Date.now().toString(),
      savedBy: user.uid,
      savedAt: new Date().toISOString(),

      // ✅ CRITICAL: Add ALL image URLs from window.lastUploadedImages
      imageUrls:
        window.lastUploadedImages && window.lastUploadedImages.length > 0
          ? window.lastUploadedImages
          : report.imageUrls || [],

      imageCount:
        window.lastUploadedImages && window.lastUploadedImages.length > 0
          ? window.lastUploadedImages.length
          : report.imageUrls?.length || 0,

      imageUrl: window.lastUploadedImages?.[0] || report.imageUrl || "",
    };

    console.log("📸 SAVING WITH IMAGES:", {
      fromWindow: window.lastUploadedImages?.length,
      savedCount: reportToSave.imageCount,
      savedUrls: reportToSave.imageUrls,
    });

    savedReports.unshift(reportToSave);
    localStorage.setItem(savedReportsKey, JSON.stringify(savedReports));

    console.log(
      `✅ Saved report for user ${user.uid} with ${reportToSave.imageCount} images:`,
      reportToSave.imageUrls,
    );

    // Show translated success message
    const successMessages = {
      en: "Report saved successfully",
      vi: "Đã lưu báo cáo thành công",
      ar: "تم حفظ التقرير بنجاح",
      es: "Informe guardado correctamente",
      hi: "रिपोर्ट सफलतापूर्वक सहेजी गई",
      zh: "报告保存成功",
    };
    alert(successMessages[lang] || successMessages.en);

    if (window.renderSavedReports) {
      window.renderSavedReports();
    }
  };
}

// Nuclear error handler override
window.addEventListener("error", (event) => {
  if (
    event.message.includes("address") ||
    event.message.includes("Address") ||
    event.error?.message?.includes("address")
  ) {
    event.preventDefault();
    showAddressError();
  }
});
// At the VERY TOP (before any other code):

// ===== ONLY KEEP THIS ===== //
function getCurrentLanguage() {
  return (
    localStorage.getItem("userLanguage") ||
    document.documentElement.lang ||
    navigator.language.split("-")[0] ||
    "en"
  );
}

// In reports.js (FIRST LINE)
console.log("[2] reports.js loaded");
// ===== 1. ABSOLUTELY SAFE DEBUG CHECK =====
if (window.console && window.console.group) {
  console.group("Firebase Status Check");
}

// Auth Check
if (window.fb && window.fb.auth) {
  console.log("Auth: LOADED");
} else {
  console.log("Auth: MISSING");
}

// Storage Check
if (window.fb && window.fb.storage && window.fb.storage.uploadFile) {
  console.log("Storage: READY");
} else {
  console.log("Storage: BROKEN");
}

// Firestore Check
var firestoreOk = {
  db: !!(window.fb && window.fb.firestore && window.fb.firestore.db),
  addDoc:
    "function" ===
    typeof (window.fb && window.fb.firestore && window.fb.firestore.addDoc),
  collection:
    "function" ===
    typeof (window.fb && window.fb.firestore && window.fb.firestore.collection),
};
console.log("Firestore Status:", firestoreOk);

// User Check
var userId = "Not signed in";
if (window.fb && window.fb.auth && window.fb.auth.currentUser) {
  userId = window.fb.auth.currentUser.uid;
}
console.log("Current User:", userId);

if (window.console && window.console.groupEnd) {
  console.groupEnd();
}

// ===== 2. INITIALIZATION GUARD =====
if (typeof window.reportsInitialized === "undefined") {
  window.reportsInitialized = true;
  console.log("Reports.js initialized - starting setup");

  // Your existing setup code here...

  // ===== 1. GLOBAL VARIABLES ===== //
  let formHandlerInitialized = false;
  let map, marker;
  let mapReady = false;
  let mapInitializationInProgress = false;
  let currentTab = "new-report";
  let savedReports = [];
  let currentTranslations = window.currentTranslations || {};

  // ===== 2. CORE FUNCTIONS ===== //
  function translate(key) {
    // Skip dropdown option translation
    if (
      key &&
      (key.startsWith("reportTypes.") || key === "reportType.select")
    ) {
      return key; // Return the key so it gets skipped
    }
    const value = key
      .split(".")
      .reduce((o, k) => (o || {})[k], currentTranslations);
    return value || key;
  }

  // Add this function to reports.js
  function showSavedReports() {
    // ADD THIS LINE FIRST:
    document.getElementById("saved-reports-section").style.display = "block";
    // DEBUG: Verify data and dependencies FIRST
    console.log("Saved reports debug:", {
      storage: JSON.parse(localStorage.getItem("savedReports")) || [],
      container: document.getElementById("saved-reports-container"),
      renderFunc: typeof renderSavedReports,
      section: document.getElementById("saved-reports-section"),
    });
    // 1. Force render the saved reports
    if (typeof renderSavedReports === "function") {
      renderSavedReports(); // Refresh the display
    } else {
      console.error("renderSavedReports() not found!");
      return;
    }

    // 2. Scroll to the section
    const savedSection = document.getElementById("saved-reports-section");
    if (savedSection) {
      // Make section visible if hidden
      savedSection.style.display = "block";

      // Smooth scroll
      savedSection.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });

      // Visual feedback (optional)
      savedSection.style.transition = "box-shadow 0.3s";
      savedSection.style.boxShadow = "0 0 0 3px rgba(52, 152, 219, 0.3)";
      setTimeout(() => (savedSection.style.boxShadow = "none"), 1000);
    }

    // 3. Update tab states
    document.querySelectorAll(".tab").forEach((tab) => {
      tab.classList.toggle("active", tab.dataset.tab === "saved-reports");
    });
  }

  function showAlert(key) {
    const translation = translate(key);
    console.log(`Showing alert [${key}]:`, translation);
    alert(translation);
  }

  function showConfirm(key) {
    const translation = translate(key);
    console.log(`Showing confirm [${key}]:`, translation);
    return confirm(translation);
  }

  // ===== DASHBOARD BUTTON TRANSLATION ===== //
  function updateDashboardButton() {
    const dashboardBtnText = document.querySelector(
      "#floating-dashboard-btn .back-text",
    );
    if (!dashboardBtnText) return;

    // Use appLanguage (consistent)
    const lang =
      localStorage.getItem("appLanguage") ||
      localStorage.getItem("userLanguage") ||
      "en";
    console.log("🔄 Dashboard button language:", lang);

    const texts = {
      en: "Dashboard",
      vi: "Bảng điều khiển",
      zh: "仪表板",
      es: "Tablero",
      hi: "डैशबोर्ड",
      ar: "لوحة التحكم",
    };

    dashboardBtnText.textContent = texts[lang] || texts.en;
  }

  // Initialize on load

  // Update when language changes
  document
    .getElementById("language-switcher")
    ?.addEventListener("change", () => {
      setTimeout(updateDashboardButton, 100); // Short delay to ensure language is set

      // ✅ ADD THIS
      setTimeout(() => {
        if (typeof window.renderSavedReports === "function") {
          console.log("🔄 Reloading saved reports after language change");
          window.renderSavedReports();
        }
      }, 200);
    });

  function goToDashboard() {
    switchTab("new-report");
    window.scrollTo(0, 0);
  }

  // ===== 3. TAB MANAGEMENT ===== //
  // Replace your existing tab handler with this enhanced version
  // Find this function and UPDATE it:

  function switchTab(tabName) {
    if (tabName === "new-report") {
      console.log("🔄 Switching to New Report tab...");

      // 1. Clear file input FIRST
      const fileInput = document.getElementById("report-image");
      if (fileInput) {
        fileInput.value = "";
        console.log("🗑️ File input cleared");
      }

      // 2. Clear the label IMMEDIATELY
      const fileLabel = document.getElementById("file-input-label");
      if (fileLabel) {
        const lang = localStorage.getItem("userLanguage") || "en";
        // Use the EXACT same text as updateFileInputDisplay()
        fileLabel.textContent = `${FILE_INPUT_TEXTS.chooseFile[lang]} • ${FILE_INPUT_TEXTS.noFile[lang]}`;
        console.log("🔄 Label reset to default");
      }

      // 3. Clear other form fields
      const fieldsToClear = [
        "report-title",
        "report-type",
        "report-description",
        "location-text-input",
        "address-input",
        "reporter-contact",
      ];
      fieldsToClear.forEach((id) => {
        const el = document.getElementById(id);
        if (el) el.value = el.tagName === "SELECT" ? "" : "";
      });

      // 4. Clear JavaScript variables
      window.lastUploadedImages = [];
      window.lastReport = null;

      console.log("✅ Form cleared");

      // Focus
      document.getElementById("report-title")?.focus();
    }

    // Tab UI switching
    document.querySelectorAll(".tab").forEach((tab) => {
      tab.classList.toggle("active", tab.dataset.tab === tabName);
    });
    document.querySelectorAll(".tab-content").forEach((content) => {
      content.classList.toggle("active", content.id === tabName);
    });
  }

  // ===== 4. MAP FUNCTIONS ===== //
  function initMap() {
    const mapContainer = document.getElementById("map");
    if (!mapContainer || mapContainer._leaflet_id) return null;
    if (typeof L === "undefined") {
      console.warn("Leaflet not loaded yet");
      setTimeout(initMap, 100);
      return null;
    }

    try {
      // Initialize map with default view
      window.map = L.map("map").setView([10.7610112, 106.6893312], 13);

      // Add tile layer
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
        maxZoom: 19,
      }).addTo(window.map);

      // Add zoom control
      L.control.zoom({ position: "topright" }).addTo(window.map);

      console.log("Map initialized successfully");
      return window.map;
    } catch (error) {
      console.error("Map initialization error:", error);
      setTimeout(initMap, 500); // Retry after delay
      return null;
    }
  }

  function useCurrentLocation() {
    if (!navigator.geolocation) {
      showAlert("errors.geolocationUnavailable");
      return;
    }

    const btn = document.querySelector('[onclick*="useCurrentLocation"]');
    if (btn) {
      btn.disabled = true;
      const langNow =
        localStorage.getItem("appLanguage") ||
        localStorage.getItem("userLanguage") ||
        "en";
      const locatingTranslations = {
        en: "Locating...",
        es: "Localizando...",
        zh: "定位中...",
        vi: "Đang định vị...",
        hi: "लोकेशन ढूंढ रहा है...",
        ar: "جاري تحديد الموقع...",
      };
      btn.innerHTML =
        '<i class="fas fa-spinner fa-spin"></i> ' +
        (locatingTranslations[langNow] || locatingTranslations.en);
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const langNow =
          localStorage.getItem("appLanguage") ||
          localStorage.getItem("userLanguage") ||
          "en";
        const coords = pos.coords;
        console.log("GPS Coordinates:", coords.latitude, coords.longitude);

        document.getElementById("selected-coordinates").value =
          `${coords.latitude}, ${coords.longitude}`;

        if (window.map) {
          window.map.flyTo([coords.latitude, coords.longitude], 15);
          L.marker([coords.latitude, coords.longitude])
            .addTo(window.map)
            .bindPopup(
              (() => {
                const yourLocationTranslations = {
                  en: "Your Location",
                  es: "Tu Ubicación",
                  zh: "你的位置",
                  vi: "Vị trí của bạn",
                  hi: "आपका स्थान",
                  ar: "موقعك",
                };
                return (
                  yourLocationTranslations[langNow] ||
                  yourLocationTranslations.en
                );
              })(),
            )
            .openPopup();
        }

        if (btn) {
          btn.disabled = false;
          const buttonTranslations = {
            en: "Use My Location",
            vi: "Dùng vị trí của tôi",
            ar: "استخدم موقعي",
            es: "Usar mi ubicación",
            hi: "میرا موقع استعمال کریں",
            zh: "使用我的位置",
          };
          btn.textContent =
            buttonTranslations[langNow] || buttonTranslations.en;
        }
      },
      (err) => {
        console.error("GPS Error:", err);

        // Better error messages
        let errorKey = "errors.locationAccess";
        if (err.code === err.TIMEOUT) {
          errorKey = "errors.locationTimeout";
        } else if (err.code === err.PERMISSION_DENIED) {
          errorKey = "errors.locationDenied";
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          errorKey = "errors.locationUnavailable";
        }

        showAlert(errorKey);

        if (btn) {
          const langNow =
            localStorage.getItem("appLanguage") ||
            localStorage.getItem("userLanguage") ||
            "en";
          const buttonTranslations = {
            en: "Use My Location",
            vi: "Dùng vị trí của tôi",
            ar: "استخدم موقعي",
            es: "Usar mi ubicación",
            hi: "میرا موقع استعمال کریں",
            zh: "使用我的位置",
          };
          btn.textContent =
            buttonTranslations[langNow] || buttonTranslations.en;
          btn.disabled = false; // IMPORTANT: Re-enable button
        }
      },
      {
        timeout: 30000, // Increased from 10000 to 30000
        enableHighAccuracy: true,
        maximumAge: 60000, // Cache for 1 minute
      },
    );
  }
  // ▼▼▼ 1. PLACEHOLDER TRANSLATION FUNCTION (ADD THIS NEAR findAddress) ▼▼▼

  // ▼▼▼ YOUR EXISTING findAddress FUNCTION (LEAVE UNTOUCHED) ▼▼▼
  async function findAddress() {
    const address = document.getElementById("address-input").value.trim();
    // Suppress fetch errors in console (optional)
    const originalConsoleError = console.error;
    console.error = function (...args) {
      if (args[0] && args[0].includes && args[0].includes("CORS")) {
        return; // Ignore CORS errors
      }
      originalConsoleError.apply(console, args);
    };
    const locationName = document
      .getElementById("location-text-input")
      .value.trim();

    if (!address) {
      // Get the current language safely, default to English
      const lang =
        localStorage.getItem("appLanguage") ||
        localStorage.getItem("userLanguage") ||
        "en";

      // Define the translations for the empty field error
      const emptyLocationTranslations = {
        en: "Error: Please enter an address",
        es: "Error: Por favor ingrese una dirección",
        zh: "错误：请输入地址",
        vi: "Lỗi: Vui lòng nhập địa chỉ",
        hi: "त्रुटि: कृपया एक पता दर्ज करें",
        ar: "خطأ: يرجى إدخال عنوان",
      };

      const errorMessage =
        emptyLocationTranslations[lang] || emptyLocationTranslations.en;
      alert(errorMessage);
      return;
    }

    // Show loading state on the button
    const findBtn = document.querySelector('button[onclick="findAddress()"]');
    const originalText = findBtn.textContent;
    findBtn.textContent = "Searching...";
    findBtn.disabled = true;

    try {
      // 🔥 FIX: Add proper headers and implement retry logic
      let data = null;
      let attempts = 0;
      const maxAttempts = 2;

      while (attempts < maxAttempts && !data) {
        attempts++;

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
              address,
            )}${attempts > 1 ? "&limit=1&addressdetails=1" : ""}`,
            {
              headers: {
                Accept: "application/json",
                "User-Agent": "ConnectionsFinder/1.0", // Required by Nominatim
              },
            },
          );

          if (response.ok) {
            data = await response.json();
          } else {
            console.log(`Attempt ${attempts} failed, retrying...`);
            // Wait a bit before retrying
            await new Promise((resolve) => setTimeout(resolve, 500));
          }
        } catch (fetchError) {
          console.log(
            `Fetch error on attempt ${attempts}:`,
            fetchError.message,
          );
          // Wait before retry
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
      }

      if (!data || !data.length) {
        showAddressError();
        return;
      }

      // Use the first result
      const { lat, lon, display_name } = data[0];

      // Update coordinates WITHOUT affecting location text
      document.getElementById("selected-coordinates").value = `${lat}, ${lon}`;

      // Update map only if coordinates changed
      if (window.map) {
        window.map.flyTo([lat, lon], 15);
        L.marker([lat, lon])
          .addTo(window.map)
          .bindPopup(display_name)
          .openPopup();
      }
    } catch (error) {
      console.error("Address error:", error);
      showAddressError();
    } finally {
      // Reset button
      findBtn.textContent = originalText;
      findBtn.disabled = false;
    }
  }

  function updateMap(lat, lng, title) {
    if (!mapReady) {
      const initializedMap = initMap();
      if (!initializedMap) {
        setTimeout(() => updateMap(lat, lng, title), 100);
        return;
      }
    }

    try {
      if (marker && map.hasLayer(marker)) {
        map.removeLayer(marker);
      }

      marker = L.marker([lat, lng], {
        icon: L.divIcon({
          className: "map-marker-icon",
          iconSize: [20, 20],
        }),
      })
        .addTo(map)
        .bindPopup(title || translate("labels.selectedLocation"))
        .openPopup();

      map.flyTo([lat, lng], 15, {
        duration: 1,
        easeLinearity: 0.25,
      });
    } catch (error) {
      console.error("Map update failed:", error);
      map.setView([lat, lng], 15);
    }
  }

  // Before submitting report, check content
  async function checkReportContent(title, description) {
    try {
      const checkContent = firebase
        .functions()
        .httpsCallable("checkReportContent");
      const result = await checkContent({ title, description });

      if (!result.data.allowed) {
        alert(result.data.message);
        return false;
      }
      return true;
    } catch (error) {
      console.error("Content check failed:", error);
      return true; // Allow submission if check fails (fail open)
    }
  }

  // ===== 5. FORM HANDLING ===== //
  async function initializeFormHandler() {
    if (formHandlerInitialized) return;
    const form = document.getElementById("report-form");
    if (!form) return;
    formHandlerInitialized = true;

    document.getElementById("report-image")?.addEventListener("change", () => {
      const lang = localStorage.getItem("userLanguage") || "en";
      showAlert(TRANSLATION_PATCH.popups.dataWarning[lang]);
    });

    // ============================================
    // VIOLATION CHECKER FUNCTIONS
    // ============================================
    const VIOLATING_KEYWORDS = {
      violence: {
        en: [
          "bomb",
          "kill",
          "murder",
          "terror",
          "weapon",
          "gun",
          "pistol",
          "rifle",
          "shoot",
          "attack",
          "threat",
          "explosive",
        ],
        vi: [
          "bom",
          "giết",
          "sát hại",
          "khủng bố",
          "vũ khí",
          "súng",
          "súng lục",
          "súng trường",
          "bắn",
          "tấn công",
          "đe dọa",
          "chất nổ",
        ],
        zh: [
          "炸弹",
          "杀",
          "谋杀",
          "恐怖",
          "武器",
          "枪",
          "手枪",
          "步枪",
          "射击",
          "攻击",
          "威胁",
          "爆炸物",
        ],
        es: [
          "bomba",
          "matar",
          "asesinato",
          "terror",
          "arma",
          "pistola",
          "rifle",
          "disparar",
          "ataque",
          "amenaza",
          "explosivo",
        ],
        hi: [
          "बम",
          "मारना",
          "हत्या",
          "आतंक",
          "हथियार",
          "बंदूक",
          "पिस्तौल",
          "राइफल",
          "गोली",
          "हमला",
          "धमकी",
          "विस्फोटक",
        ],
        ar: [
          "قنبلة",
          "قتل",
          "اغتيال",
          "إرهاب",
          "سلاح",
          "مسدس",
          "بندقية",
          "إطلاق نار",
          "هجوم",
          "تهديد",
          "متفجرات",
        ],
      },
      personal: {
        en: [
          "bank account",
          "credit card",
          "ssn",
          "passport",
          "id card",
          "driver license",
          "cvv",
          "pin code",
        ],
        vi: [
          "tài khoản ngân hàng",
          "thẻ tín dụng",
          "cmnd",
          "cccd",
          "hộ chiếu",
          "thẻ căn cước",
          "bằng lái xe",
          "cvv",
          "mã pin",
        ],
        zh: [
          "银行账户",
          "信用卡",
          "社保号",
          "护照",
          "身份证",
          "驾照",
          "安全码",
          "密码",
        ],
        es: [
          "cuenta bancaria",
          "tarjeta de crédito",
          "número de seguro social",
          "pasaporte",
          "identificación",
          "licencia de conducir",
          "cvv",
          "código pin",
        ],
        hi: [
          "बैंक खाता",
          "क्रेडिट कार्ड",
          "सामाजिक सुरक्षा",
          "पासपोर्ट",
          "आधार कार्ड",
          "ड्राइविंग लाइसेंस",
          "सीवीवी",
          "पिन कोड",
        ],
        ar: [
          "حساب بنكي",
          "بطاقة ائتمان",
          "الرقم القومي",
          "جواز سفر",
          "بطاقة هوية",
          "رخصة قيادة",
          "رمز التحقق",
          "رمز الدخول",
        ],
      },
      adult: {
        en: [
          "porn",
          "sex",
          "nude",
          "xxx",
          "adult",
          "explicit",
          "sexual",
          "naked",
        ],
        vi: [
          "khiêu dâm",
          "sex",
          "khỏa thân",
          "xxx",
          "người lớn",
          "tục tĩu",
          "dâm ô",
          "trần truồng",
        ],
        zh: ["色情", "性", "裸体", "成人", "露骨", "性行为", "裸露"],
        es: [
          "pornografía",
          "sexo",
          "desnudo",
          "xxx",
          "adulto",
          "explícito",
          "sexual",
          "desnuda",
        ],
        hi: [
          "अश्लील",
          "सेक्स",
          "नग्न",
          "xxx",
          "वयस्क",
          "स्पष्ट",
          "यौन",
          "नग्न",
        ],
        ar: ["إباحية", "جنس", "عارية", "للبالغين", "صريح", "جنسي", "عاري"],
      },
      scam: {
        en: [
          "lottery",
          "winner",
          "bitcoin",
          "crypto",
          "urgent transfer",
          "inheritance",
          "prince",
          "nigerian",
          "phishing",
        ],
        vi: [
          "trúng thưởng",
          "lừa đảo",
          "bitcoin",
          "tiền ảo",
          "chuyển tiền gấp",
          "thừa kế",
          "hoàng tử",
          "lừa đảo nigeria",
          "lừa đảo trực tuyến",
        ],
        zh: [
          "彩票",
          "中奖",
          "比特币",
          "加密货币",
          "紧急转账",
          "遗产",
          "王子",
          "网络钓鱼",
          "诈骗",
        ],
        es: [
          "lotería",
          "ganador",
          "bitcoin",
          "cripto",
          "transferencia urgente",
          "herencia",
          "príncipe",
          "estafa",
          "phishing",
        ],
        hi: [
          "लॉटरी",
          "विजेता",
          "बिटकॉइन",
          "क्रिप्टो",
          "तत्काल स्थानांतरण",
          "विरासत",
          "राजकुमार",
          "फ़िशिंग",
          "घोटाला",
        ],
        ar: [
          "يانصيب",
          "فائز",
          "بيتكوين",
          "عملات رقمية",
          "تحويل عاجل",
          "ميراث",
          "أمير",
          "تصيد",
          "احتيال",
        ],
      },
    };

    // ============================================
    // VIOLATION MESSAGES (Self-contained)
    // ============================================

    const reportViolationMessages = {
      en: {
        cannotSubmit:
          "❌ Cannot submit: This content contains prohibited language",
        found: "Prohibited keywords found",
        accountBlocked: "Your account has been blocked due to violation.",
      },
      vi: {
        cannotSubmit: "❌ Không thể gửi: Nội dung này chứa ngôn ngữ bị cấm",
        found: "Từ khóa bị cấm được tìm thấy",
        accountBlocked: "Tài khoản của bạn đã bị khóa do vi phạm.",
      },
      zh: {
        cannotSubmit: "❌ 无法提交：此内容包含禁止使用的语言",
        found: "发现禁用关键词",
        accountBlocked: "您的帐户已被封锁。",
      },
      es: {
        cannotSubmit:
          "❌ No se puede enviar: Este contenido contiene lenguaje prohibido",
        found: "Palabras clave prohibidas encontradas",
        accountBlocked: "Tu cuenta ha sido bloqueada.",
      },
      hi: {
        cannotSubmit:
          "❌ सबमिट नहीं कर सकते: इस सामग्री में प्रतिबंधित भाषा है",
        found: "प्रतिबंधित कीवर्ड मिले",
        accountBlocked: "आपका खाता ब्लॉक कर दिया गया है।",
      },
      ar: {
        cannotSubmit: "❌ لا يمكن الإرسال: هذا المحتوى يحتوي على لغة محظورة",
        found: "الكلمات الرئيسية المحظورة موجودة",
        accountBlocked: "تم حظر حسابك.",
      },
    };

    function getViolationMessage(key) {
      const lang = localStorage.getItem("userLanguage") || "en";
      return (
        reportViolationMessages[lang]?.[key] ||
        reportViolationMessages.en[key] ||
        key
      );
    }

    // Helper function to check violations across all languages
    function checkContentViolation(title, description) {
      const textToCheck = (title + " " + description).toLowerCase();
      const violations = [];

      for (const [category, langKeywords] of Object.entries(
        VIOLATING_KEYWORDS,
      )) {
        for (const [lang, keywords] of Object.entries(langKeywords)) {
          for (const keyword of keywords) {
            if (textToCheck.includes(keyword.toLowerCase())) {
              violations.push({ category, keyword, language: lang });
            }
          }
        }
      }

      // Remove duplicates
      const uniqueViolations = [];
      const seen = new Set();
      for (const v of violations) {
        const key = `${v.category}_${v.keyword}`;
        if (!seen.has(key)) {
          seen.add(key);
          uniqueViolations.push(v);
        }
      }

      return uniqueViolations;
    }

    // ============================================
    // CHECK IMAGE FILENAMES FOR VIOLATIONS
    // ============================================
    function checkImageFilenames(imageUrls) {
      const prohibitedWords = {
        en: ["bomb", "kill", "weapon", "gun", "bank account", "porn", "sex"],
        vi: [
          "bom",
          "giết",
          "vũ khí",
          "súng",
          "tài khoản ngân hàng",
          "khiêu dâm",
          "sex",
        ],
        zh: ["炸弹", "杀", "武器", "枪", "银行账户", "色情", "性"],
        es: [
          "bomba",
          "matar",
          "arma",
          "pistola",
          "cuenta bancaria",
          "pornografía",
          "sexo",
        ],
        hi: ["बम", "मारना", "हथियार", "बंदूक", "बैंक खाता", "अश्लील", "सेक्स"],
        ar: ["قنبلة", "قتل", "سلاح", "مسدس", "حساب بنكي", "إباحية", "جنس"],
      };

      for (const url of imageUrls) {
        // Extract filename from URL
        try {
          const filename = decodeURIComponent(
            url.split("/").pop().split("?")[0],
          ).toLowerCase();
          for (const word of prohibitedWords) {
            if (filename.includes(word)) {
              return { isViolating: true, word: word, filename: filename };
            }
          }
        } catch (e) {
          console.warn("Could not parse filename from URL:", url);
        }
      }
      return { isViolating: false };
    }

    // Image violation messages with translations
    function getImageViolationMessage(word, lang) {
      const messages = {
        en: `❌ Cannot submit: Image filename contains prohibited word "${word}"`,
        vi: `❌ Không thể gửi: Tên file ảnh chứa từ bị cấm "${word}"`,
        zh: `❌ 无法提交：图片文件名包含禁止的词语 "${word}"`,
        es: `❌ No se puede enviar: El nombre del archivo de imagen contiene la palabra prohibida "${word}"`,
        hi: `❌ सबमिट नहीं कर सकते: छवि फ़ाइल नाम में प्रतिबंधित शब्द "${word}" है`,
        ar: `❌ لا يمكن الإرسال: اسم ملف الصورة يحتوي على كلمة محظورة "${word}"`,
      };
      return messages[lang] || messages.en;
    }

    async function blockViolatingUser(userId, reason, violations) {
      try {
        // ✅ FIX: Use userId parameter, not user.uid
        const userRef = window.fb.firestore.collection("users").doc(userId);
        await userRef.update({
          status: "blocked",
          blockedReason: reason,
          blockedAt: new Date(),
          blockedBy: "auto_moderation",
        });
        await window.fb.firestore.collection("security_logs").add({
          eventType: "REPORT_VIOLATION_ATTEMPT",
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
    }
    // ============================================
    // END OF VIOLATION CHECKER
    // ============================================

    // Remove ALL initialization checks - keep only the form handler
    // In reports.js form submit handler, ensure the order is correct:

    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      // ============================================
      // ✅ ADD VIOLATION CHECK HERE (RIGHT AFTER e.preventDefault())
      // ============================================
      // In form submit handler, after e.preventDefault()
      // ============================================
      // CHECK TEXT CONTENT FOR VIOLATIONS
      // ============================================
      const title = document.getElementById("report-title")?.value || "";
      const description =
        document.getElementById("report-description")?.value || "";

      // Prohibited words in all languages
      const prohibitedWords = {
        en: ["bomb", "kill", "weapon", "gun", "bank account", "porn", "sex"],
        vi: [
          "bom",
          "giết",
          "vũ khí",
          "súng",
          "tài khoản ngân hàng",
          "khiêu dâm",
          "sex",
        ],
        zh: ["炸弹", "杀", "武器", "枪", "银行账户", "色情", "性"],
        es: [
          "bomba",
          "matar",
          "arma",
          "pistola",
          "cuenta bancaria",
          "pornografía",
          "sexo",
        ],
        hi: ["बम", "मारना", "हथियार", "बंदूक", "बैंक खाता", "अश्लील", "सेक्स"],
        ar: ["قنبلة", "قتل", "سلاح", "مسدس", "حساب بنكي", "إباحية", "جنس"],
      };

      const lang = localStorage.getItem("userLanguage") || "en";
      const wordsToCheck = prohibitedWords[lang] || prohibitedWords.en;
      const textToCheck = (title + " " + description).toLowerCase();

      let hasViolation = false;
      let foundWord = "";
      for (const word of wordsToCheck) {
        if (textToCheck.includes(word.toLowerCase())) {
          hasViolation = true;
          foundWord = word;
          break;
        }
      }

      if (hasViolation) {
        const violationMessages = {
          en: {
            title: "❌ Cannot submit: Content contains prohibited language",
            found: "Prohibited word found",
            blocked: "Your account has been blocked due to violation.",
            appeal: "If you believe this is an error, please contact support.",
          },
          vi: {
            title: "❌ Không thể gửi: Nội dung chứa ngôn ngữ bị cấm",
            found: "Thấy từ bị cấm",
            blocked: "Tài khoản của bạn đã bị khóa do vi phạm.",
            appeal: "Nếu bạn cho rằng đây là lỗi, vui lòng liên hệ hỗ trợ.",
          },
          zh: {
            title: "❌ 无法提交：内容包含禁止使用的语言",
            found: "发现禁用词",
            blocked: "您的帐户已被封锁。",
            appeal: "如果您认为这是错误，请联系支持人员。",
          },
          es: {
            title:
              "❌ No se puede enviar: El contenido contiene lenguaje prohibido",
            found: "Palabra prohibida encontrada",
            blocked: "Tu cuenta ha sido bloqueada.",
            appeal: "Si crees que es un error, contacta a soporte.",
          },
          hi: {
            title: "❌ सबमिट नहीं कर सकते: सामग्री में प्रतिबंधित भाषा है",
            found: "प्रतिबंधित शब्द मिला",
            blocked: "आपका खाता ब्लॉक कर दिया गया है।",
            appeal:
              "यदि आपको लगता है कि यह त्रुटि है, तो कृपया सहायता से संपर्क करें।",
          },
          ar: {
            title: "❌ لا يمكن الإرسال: المحتوى يحتوي على لغة محظورة",
            found: "الكلمة المحظورة موجودة",
            blocked: "تم حظر حسابك.",
            appeal: "إذا كنت تعتقد أن هذا خطأ، يرجى الاتصال بالدعم.",
          },
        };

        const t = violationMessages[lang];
        alert(
          `${t.title}\n\n${t.found}: ${foundWord}\n\n${t.blocked}\n\n${t.appeal}`,
        );

        // Block the user
        const currentUser = window.fb.auth?.currentUser;
        if (currentUser) {
          try {
            const userRef = window.fb.firestore
              .collection("users")
              .doc(currentUser.uid);
            await userRef.update({
              status: "blocked",
              blockedReason: `Attempted to submit prohibited content: ${foundWord}`,
              blockedAt: new Date(),
              blockedBy: "auto_moderation",
            });
            await window.fb.auth.signOut();
          } catch (err) {
            console.error("Failed to block user:", err);
          }
        }
        window.location.href = "/dashboard";
        return;
      }
      // ============================================
      // END OF VIOLATION CHECK
      // ============================================

      console.log("🚀 FORM SUBMIT TRIGGERED!"); // This should show

      // ===== ADD THIS LINE =====
      showLoadingPopup();
      disableSubmitButton(true);
      // ===== END ADDITION =====

      // ▼▼▼ ADD THIS EXACT CODE HERE ▼▼▼
      // ▼▼▼ REPLACE YOUR EXISTING SIGN-IN CHECK WITH THIS ▼▼▼
      console.log("=== FORM SUBMIT SIGN-IN CHECK ===");

      // SIMPLE, DIRECT CHECK
      const auth = window.fb?.auth;
      console.log("Auth available?", !!auth);

      if (!auth) {
        // ===== ADD THESE 2 LINES =====
        hideLoadingPopup();
        disableSubmitButton(false);
        // ===== END ADDITION =====
        console.error("Auth not available");
        alert("Authentication error. Please refresh.");
        return;
      }

      const user = auth.currentUser;
      console.log("Current user:", user ? user.email : "NO USER");

      if (!user) {
        // ===== ADD THESE 2 LINES =====
        hideLoadingPopup();
        disableSubmitButton(false);
        // ===== END ADDITION =====
        console.log("❌ NO USER - Showing sign-in popup");
        const lang = localStorage.getItem("userLanguage") || "en";
        const messages = {
          en: "Please sign in to submit reports.",
          vi: "Vui lòng đăng nhập để gửi báo cáo.",
          zh: "请登录以提交报告。",
          es: "Por favor inicie sesión para enviar informes.",
          hi: "रिपोर्ट सबमिट करने के लिए कृपया साइन इन करें।",
          ar: "يرجى تسجيل الدخول لإرسال التقارير。",
        };
        alert(messages[lang] || messages.en);
        return;
      }

      console.log("✅ User signed in as:", user.email);
      // ▲▲▲ END SIGN-IN CHECK ▲▲▲

      // ▼▼▼ REPLACE YOUR VALIDATION CODE WITH THIS ▼▼▼
      console.log("Translation Debug:", {
        title: TRANSLATION_PATCH?.fieldLabels?.title,
        type: TRANSLATION_PATCH?.fieldLabels?.type,
      });
      console.log("Report Type Translations:", {
        translations: TRANSLATION_PATCH.fieldLabels.type,
        current: getTranslation(TRANSLATION_PATCH?.fieldLabels?.type),
        element: document.getElementById("report-type"),
      });

      const requiredFields = [
        {
          id: "report-title",
          // ▼▼▼ PRESERVE EXISTING TITLE TRANSLATION ▼▼▼
          name: getTranslation(TRANSLATION_PATCH?.fieldLabels?.title, "Title"),
          validate: () =>
            !document.getElementById("report-title")?.value?.trim(),
        },
        {
          id: "report-type",
          name:
            getTranslation(
              TRANSLATION_PATCH?.popups?.fieldLabels?.type,
              "Report Type",
            ) + ":", // Colon added
          validate: () =>
            !document.getElementById("report-type")?.value?.trim(),
        },
        {
          id: "report-description",
          name: getTranslation(
            TRANSLATION_PATCH?.fieldLabels?.description,
            "Description",
          ),
          validate: () =>
            !(
              document.getElementById("report-description")?.value?.trim() || ""
            ),
        },

        {
          id: "location-text-input",
          name: getTranslation(
            TRANSLATION_PATCH?.fieldLabels?.location,
            "Location",
          ),
          validate: () =>
            !(
              document.getElementById("location-text-input")?.value?.trim() ||
              ""
            ),
        },
      ].filter(Boolean);

      const missingFields = requiredFields.filter((field) => field.validate());

      requiredFields.forEach((field) => {
        document.getElementById(field.id)?.classList.toggle(
          "invalid-field",
          missingFields.some((f) => f.id === field.id),
        );
      });

      if (missingFields.length > 0) {
        showAlert(
          `${getTranslation(TRANSLATION_PATCH.popups.dataWarning)}\n\n` +
            `${getTranslation(TRANSLATION_PATCH.popups.missingFields)}: ` +
            `${missingFields.map((f) => f.name).join(", ")}`,
        );
        return;
      }
      // ▲▲▲ END OF ADDED CODE ▲▲▲

      // ▼▼▼ BLOCK FREE USERS COMPLETELY ▼▼▼
      // DEBUG: Check premium status
      console.log("Premium check debug:", {
        userId: window.fb.auth.currentUser?.uid,
        premiumKey: `premium_${window.fb.auth.currentUser?.uid}`,
        premiumValue: localStorage.getItem(
          `premium_${window.fb.auth.currentUser?.uid}`,
        ),
        isPremium:
          localStorage.getItem(`premium_${window.fb.auth.currentUser?.uid}`) ===
          "true",
        currentUser: window.fb.auth.currentUser,
      });

      const currentUser = window.fb.auth.currentUser;
      const userId = currentUser?.uid;
      const isPremium = userId
        ? localStorage.getItem(`premium_${userId}`) === "true"
        : false;

      // BLOCK ALL submissions for free users
      if (!isPremium) {
        // ===== ADD THESE 2 LINES =====
        hideLoadingPopup();
        disableSubmitButton(false);
        // ===== END ADDITION =====
        const lang = localStorage.getItem("userLanguage") || "en";
        const blockMessages = {
          en: "Please subscribe to submit reports. Free trial allows viewing features only.",
          vi: "Vui lòng đăng ký để gửi báo cáo. Bản dùng thử chỉ cho phép xem tính năng.",
          zh: "请订阅以提交报告。免费试用仅允许查看功能。",
          es: "Por favor suscríbete para enviar informes. La prueba gratuita solo permite ver funciones.",
          hi: "रिपोर्ट सबमिट करने के लिए कृपया सदस्यता लें। निःशुल्क परीक्षण केवल सुविधाएँ देखने की अनुमति देता है।",
          ar: "يرجى الاشتراك لإرسال التقارير. تتيح النسخة التجريبية المجانية عرض الميزات فقط.",
        };
        alert(blockMessages[lang] || blockMessages.en);
        window.open("./premium-iap.html", "_blank");
        return; // STOP submission completely
      }
      // ▲▲▲ END BLOCK ▲▲▲

      try {
        await window.fbReady;

        // 1. Collect form data
        const formData = {
          title: document.getElementById("report-title").value,
          type: document.getElementById("report-type").value,
          description: document.getElementById("report-description").value,
          contact: document.getElementById("reporter-contact").value,
          locationText: document.getElementById("location-text-input").value,
          coordinates:
            document.getElementById("selected-coordinates").value || "", // Ensure string
          userId: window.fb.auth.currentUser?.uid || "anonymous",
          timestamp: new Date().toISOString(),
        };

        // 2. Handle file upload (if any)
        // 2. Handle file upload (if any) - TRUE MULTIPLE IMAGE UPLOAD
        const fileInput = document.getElementById("report-image");

        // Check premium status
        const userId = window.fb.auth.currentUser?.uid || "anonymous";

        // Check localStorage first, then Firestore
        let isPremium = localStorage.getItem(`premium_${userId}`) === "true";

        if (!isPremium && userId !== "anonymous") {
          try {
            const userDoc = await window.fb.firestore
              .collection("users")
              .doc(userId)
              .get();
            isPremium = userDoc.exists && userDoc.data().isPremium === true;
            if (isPremium) {
              localStorage.setItem(`premium_${userId}`, "true");
            }
          } catch (e) {
            console.error("Failed to check premium from Firestore:", e);
          }
        }

        const MAX_IMAGES = isPremium ? 5 : 0;

        console.log("🖼️ Image upload:", {
          filesSelected: fileInput.files.length,
          userPremium: isPremium,
          maxAllowed: MAX_IMAGES,
        });

        const imageUrls = []; // Array for multiple image URLs

        if (fileInput.files.length > 0) {
          // Check premium restriction
          if (!isPremium) {
            const currentLang = localStorage.getItem("userLanguage") || "en";
            const errorMessages = {
              en: "Please subscribe to premium to upload images with reports.",
              vi: "Vui lòng đăng ký gói premium để tải hình ảnh lên với báo cáo.",
              zh: "请订阅高级版以在报告中上传图片。",
              es: "Por favor suscríbete a premium para subir imágenes con reportes.",
              hi: "रिपोर्ट के साथ छवियां अपलोड करने के लिए कृपया प्रीमियम की सदस्यता लें।",
              ar: "يرجى الاشتراك في النسخة المميزة لتحميل الصور مع التقارير.",
            };
            alert(errorMessages[currentLang] || errorMessages.en);
            return;
          }

          // Check image limit
          if (fileInput.files.length > MAX_IMAGES) {
            // ===== ADD THESE 2 LINES =====
            hideLoadingPopup();
            disableSubmitButton(false);
            // ===== END ADDITION =====
            const currentLang = localStorage.getItem("userLanguage") || "en";
            const errorMessages = {
              en: `Maximum ${MAX_IMAGES} images allowed per report.`,
              vi: `Tối đa ${MAX_IMAGES} hình ảnh được cho phép cho mỗi báo cáo.`,
              zh: `每个报告最多允许 ${MAX_IMAGES} 张图片。`,
              es: `Máximo ${MAX_IMAGES} imágenes permitidas por reporte.`,
              hi: `प्रति रिपोर्ट अधिकतम ${MAX_IMAGES} छवियों की अनुमति है।`,
              ar: `الحد الأقصى ${MAX_IMAGES} صورة مسموح بها لكل تقرير.`,
            };
            alert(errorMessages[currentLang] || errorMessages.en);
            return;
          }

          try {
            // ============================================
            // STEP 1: CHECK ALL IMAGES BEFORE UPLOAD
            // ============================================
            // Use the existing fileInput (do NOT redeclare it)
            const lang =
              localStorage.getItem("userLanguage") ||
              localStorage.getItem("appLanguage") ||
              "en";

            if (fileInput && fileInput.files && fileInput.files.length > 0) {
              // First, check each image filename
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

              for (let i = 0; i < fileInput.files.length; i++) {
                const file = fileInput.files[i];
                const fileName = file.name.toLowerCase();

                for (const word of badWords) {
                  if (fileName.includes(word)) {
                    hideLoadingPopup();
                    disableSubmitButton(false);

                    const msg =
                      lang === "vi"
                        ? `❌ Không thể gửi: Tên file ảnh chứa từ bị cấm "${word}"`
                        : `❌ Cannot submit: Image filename contains prohibited word "${word}"`;
                    alert(msg);
                    return;
                  }
                }
              }

              // Second, check each image content with SightEngine
              for (let i = 0; i < fileInput.files.length; i++) {
                const imageFile = fileInput.files[i];
                console.log("🔍 Running SightEngine on:", imageFile.name);

                const analysis =
                  await window.moderateImageWithSightEngine(imageFile);

                if (!analysis.safe) {
                  hideLoadingPopup();
                  disableSubmitButton(false);

                  const msg = window.getViolationMessage(analysis.reason, lang);
                  alert(msg);

                  // Block the user
                  const currentUser = window.fb.auth?.currentUser;
                  if (currentUser) {
                    try {
                      await window.fb.firestore
                        .collection("users")
                        .doc(currentUser.uid)
                        .update({
                          status: "blocked",
                          blockedReason: `Attempted to upload prohibited image: ${analysis.reason}`,
                          blockedAt: new Date(),
                          blockedBy: "auto_moderation",
                        });
                      await window.fb.auth.signOut();
                    } catch (err) {
                      console.error("Block failed:", err);
                    }
                  }
                  window.location.href = "/dashboard";
                  return;
                }
              }

              // ============================================
              // STEP 2: UPLOAD IMAGES (only if all checks passed)
              // ============================================
              console.log(`🔄 Uploading ${fileInput.files.length} images...`);
              const imageUrls = [];

              for (let i = 0; i < fileInput.files.length; i++) {
                const file = fileInput.files[i];
                const storagePath = `reports/${userId}/${Date.now()}_${i}_${file.name}`;

                console.log(
                  `📤 Uploading image ${i + 1}/${fileInput.files.length}:`,
                  file.name,
                );
                console.log("Original image size:", file.size, "bytes");

                const compressedFile = await compressImageForUpload(file);
                console.log(
                  "Compressed image size:",
                  compressedFile.size,
                  "bytes",
                );

                let imageUrl = await uploadImage(compressedFile, storagePath);

                if (imageUrl) {
                  imageUrls.push(imageUrl);
                  console.log(`✅ Image ${i + 1} uploaded:`, imageUrl);
                } else {
                  console.warn(`⚠️ Image ${i + 1} upload returned no URL.`);
                }
              }

              console.log(
                `🎉 All ${imageUrls.length} images uploaded successfully`,
              );

              // Store images for sharing
              window.lastUploadedImages = imageUrls;
              localStorage.setItem(
                "lastUploadedImages",
                JSON.stringify(imageUrls),
              );
              console.log(
                "💾 Stored images for sharing:",
                window.lastUploadedImages,
              );

              // Store first image for backward compatibility
              formData.imageUrl = imageUrls.length > 0 ? imageUrls[0] : "";
            } else {
              formData.imageUrl = "";
            }
          } catch (uploadError) {
            console.error("❌ Image upload failed:", uploadError);
            hideLoadingPopup();
            disableSubmitButton(false);
            formData.imageUrl = "";
          }
        } else {
          formData.imageUrl = "";
        }

        // 3. Prepare Firestore data (UPDATED FOR MULTIPLE IMAGES)
        const firestoreData = {
          title: formData.title || "",
          type: formData.type || "",
          description: formData.description || "",
          contact: formData.contact || "",
          locationText: formData.locationText || "",
          coordinates: formData.coordinates || "",
          userId: formData.userId,
          timestamp: formData.timestamp,
          imageUrl: formData.imageUrl || "", // First image for backward compatibility
          imageUrls: imageUrls, // NEW: Array of all image URLs
          imageCount: imageUrls.length, // NEW: Number of images
        };

        // DEBUG: Log data before submission
        console.log("Submitting to Firestore:", firestoreData);

        // 4. Submit to Firestore (SAFE METHOD)
        const docRef = await window.fb.firestore.addDoc(
          window.fb.firestore.collection("reports"),
          firestoreData,
        );

        console.log("Report submitted with ID:", docRef.id);

        // ✅ ADD THIS LINE RIGHT HERE
        window.lastSubmittedReportId = docRef.id;

        // 🔍 ADD THIS DEBUG LINE
        console.log(
          "🔍 DEBUG - imageUrls before auto-save:",
          imageUrls,
          "length:",
          imageUrls.length,
        );

        // ===== ADD THESE 2 LINES =====
        hideLoadingPopup();
        disableSubmitButton(false);
        // ===== END ADDITION =====

        const lang = localStorage.getItem("userLanguage") || "en";
        alert(TRANSLATION_PATCH["successSubmit"][lang]);
      } catch (error) {
        // ===== ADD THESE 2 LINES =====
        hideLoadingPopup();
        disableSubmitButton(false);
        // ===== END ADDITION =====
        console.error(
          "SUBMISSION FAILED:",
          error.message,
          "\nFull error:",
          error,
        );
        showAlert("errors.submit");
      }
    });
  }
  // Place near other utility functions
  function generateShareContent(reportData) {
    const lang = localStorage.getItem("userLanguage") || "en";
    return `
    ${TRANSLATION_PATCH.reportContent?.greetings?.[lang] || "Shared:"}
    ${reportData.title}
    ${reportData.description}
  `;
  }

  function initializeSharing() {
    document.querySelectorAll("[data-platform]").forEach((btn) => {
      btn.onclick = async (e) => {
        e.preventDefault();
        const platform = btn.dataset.platform;
        const message = `${lastReport.title}\n\n${lastReport.description}`;

        switch (platform) {
          case "whatsapp":
            window.open(`https://wa.me/?text=${encodeURIComponent(message)}`);
            break;
          case "twitter":
            window.open(
              `https://twitter.com/intent/tweet?text=${encodeURIComponent(
                message,
              )}`,
            );
            break;
          case "telegram":
            window.open(
              `https://t.me/share/url?url=&text=${encodeURIComponent(message)}`,
            );
            break;
        }
      };
    });
  }

  // ===== 6. SAVED REPORTS ===== //
  // Make loadSavedReports globally accessible
  window.loadSavedReports = async function loadSavedReports() {
    // ✅ Redirect to localStorage-based function to avoid Firestore errors
    if (typeof window.renderSavedReports === "function") {
      console.log("🔄 Redirecting to localStorage-based renderSavedReports");
      window.renderSavedReports();
      return;
    }

    console.log("🔍 DEBUG: loadSavedReports called");

    const container = document.getElementById("saved-reports-container");
    if (!container) {
      console.error("Container not found");
      return;
    }

    const lang = window.currentLanguage || "en";

    try {
      // Check user
      const user = window.fb.auth.currentUser;
      if (!user) {
        container.innerHTML = `<div class="auth-error">Please sign in to view your saved reports</div>`;
        return;
      }

      // Check Firestore
      if (!window.fb.firestore || !window.fb.firestore.collection) {
        container.innerHTML = `<div class="loading">Initializing Firestore...</div>`;
        setTimeout(window.loadSavedReports, 500);
        return;
      }

      console.log("Loading reports for user:", user.uid);
      container.innerHTML = `<div class="loading">Loading your reports...</div>`;

      // 🔑 Get the Firestore instance
      const firestore = window.fb.firestore;
      const db = firestore.db; // This is the Firestore instance

      // Method 1: Try using the native Firestore instance
      let querySnapshot;

      if (db && typeof db.collection === "function") {
        // Use native Firestore methods
        const reportsRef = db.collection("reports");
        const query = reportsRef.where("userId", "==", user.uid);
        querySnapshot = await query.get();
      } else if (
        firestore.collection &&
        typeof firestore.collection === "function"
      ) {
        // Fallback to the wrapper methods
        const reportsRef = firestore.collection("reports");
        // Since we don't have where, we'll filter manually
        const allReports = await firestore.getDocs(reportsRef);
        querySnapshot = allReports;

        // Manual filtering will be done below
        const reports = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.userId === user.uid) {
            reports.push({ id: doc.id, ...data });
          }
        });

        // Create a fake querySnapshot
        querySnapshot = {
          empty: reports.length === 0,
          forEach: (callback) => reports.forEach(callback),
          docs: reports,
        };
      } else {
        throw new Error("No working Firestore method found");
      }

      // Process reports
      const userReports = [];

      if (querySnapshot.forEach) {
        querySnapshot.forEach((doc) => {
          const data = doc.data ? doc.data() : doc;
          userReports.push({
            id: doc.id,
            title: data.title || "",
            description: data.description || "",
            imageUrl:
              data.imageUrl || (data.imageUrls && data.imageUrls[0]) || "",
            timestamp: data.timestamp || new Date().toISOString(),
          });
        });
      }

      if (userReports.length === 0) {
        container.innerHTML = `<p class="no-reports">${
          TRANSLATION_PATCH.messages?.noSavedReports?.[lang] ||
          "No saved reports yet"
        }</p>`;
        return;
      }

      // Sort by timestamp (newest first)
      userReports.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      const noDescText =
        TRANSLATION_PATCH.emptyDescription?.[lang] || "No description";
      const reshareText =
        TRANSLATION_PATCH.buttons?.reshare?.[lang] || "Reshare";
      const deleteText = TRANSLATION_PATCH.buttons?.delete?.[lang] || "Delete";

      container.innerHTML = userReports
        .map(
          (report) => `
            <div class="saved-report" data-id="${report.id}">
                ${report.title ? `<h4>${escapeHtml(report.title)}</h4>` : ""}
                <p>${escapeHtml(report.description || noDescText)}</p>
                ${report.imageUrl ? `<img src="${escapeHtml(report.imageUrl)}" class="report-image" onclick="window.open('${escapeHtml(report.imageUrl)}', '_blank')">` : ""}
                <small>${new Date(report.timestamp).toLocaleString()}</small>
                <div class="report-actions">
                    <button onclick="window.handleReshare('${report.id}')">${reshareText}</button>
                    <button onclick="window.handleDelete('${report.id}')">${deleteText}</button>
                </div>
            </div>
        `,
        )
        .join("");

      console.log(
        "✅ Loaded",
        userReports.length,
        "reports for user:",
        user.uid,
      );
    } catch (error) {
      console.error("Error loading reports:", error);
      container.innerHTML = `<div class="error">Failed to load: ${error.message}. <button onclick="window.loadSavedReports()">Retry</button></div>`;
    }
  };

  // Helper function to escape HTML
  function escapeHtml(text) {
    if (!text) return "";
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  // Reshare function
  window.handleReshare = async function (reportId) {
    console.log("Resharing report:", reportId);
    try {
      const firestore = window.fb.firestore;
      const db = firestore.db;

      if (db && typeof db.collection === "function") {
        const docRef = db.collection("reports").doc(reportId);
        const docSnap = await docRef.get();
        if (docSnap.exists) {
          const reportData = docSnap.data();
          console.log("Report data for sharing:", reportData);
          if (typeof window.openShareDialog === "function") {
            window.openShareDialog(reportData);
          } else {
            alert("Share function ready. Report data logged to console.");
          }
        }
      } else {
        const docRef = firestore.doc("reports", reportId);
        const docSnap = await firestore.getDoc(docRef);
        if (docSnap.exists) {
          const reportData = docSnap.data();
          console.log("Report data for sharing:", reportData);
        }
      }
    } catch (error) {
      console.error("Reshare failed:", error);
      alert("Failed to load report for sharing");
    }
  };

  // Delete function
  window.handleDelete = async function (reportId) {
    if (!confirm("Are you sure you want to delete this report?")) return;
    try {
      const firestore = window.fb.firestore;
      const db = firestore.db;

      if (db && typeof db.collection === "function") {
        await db.collection("reports").doc(reportId).delete();
      } else {
        await firestore.deleteDoc(firestore.doc("reports", reportId));
      }
      console.log("Report deleted:", reportId);
      window.loadSavedReports();
    } catch (error) {
      console.error("Delete failed:", error);
      alert("Failed to delete report");
    }
  };

  // ===== NEW FUNCTION =====
  // ▼ REPLACE THE ENTIRE FUNCTION WITH THIS ▼
  function refreshButtonTranslations() {
    const lang = window.currentLanguage || "en";

    // Handle ALL buttons (reshare/delete) in one place
    document.querySelectorAll(".reshare-btn .btn-text").forEach((el) => {
      el.textContent = TRANSLATION_PATCH.buttons.reshare[lang] || "Reshare";
    });

    document.querySelectorAll(".delete-btn .btn-text").forEach((el) => {
      el.textContent = TRANSLATION_PATCH.buttons.delete[lang] || "Delete";
    });

    // Optional: Keep disabled state handling if needed
    document
      .querySelectorAll(".delete-btn[disabled] .btn-text")
      .forEach((el) => {
        el.textContent = TRANSLATION_PATCH.deleting?.[lang] || "Deleting...";
      });
  }

  // ▼ Add this NEW FUNCTION ▼ (around line 765)
  function refreshSavedReportButtons() {
    const lang = window.currentLanguage || "en";

    document.querySelectorAll("#reports-list .btn-text").forEach((el) => {
      if (el.closest(".reshare-btn")) {
        el.textContent = TRANSLATION_PATCH.buttons.reshare[lang] || "Reshare";
      } else if (el.closest(".delete-btn")) {
        el.textContent = TRANSLATION_PATCH.buttons.delete[lang] || "Delete";
      }
    });
  }

  function renderSavedReport(report) {
    const reportElement = document.createElement("div");
    reportElement.className = "saved-report";

    const lang = window.currentLanguage || "en";
    const reshareText = TRANSLATION_PATCH.buttons.reshare[lang];
    const deleteText = TRANSLATION_PATCH.buttons.delete[lang];

    // Format date if timestamp exists
    let dateStr = "";
    if (report.timestamp) {
      const date = new Date(report.timestamp);
      dateStr = date.toLocaleDateString() + " " + date.toLocaleTimeString();
    }

    // Get location (handle both location and locationText fields)
    const location = report.locationText || report.location || "";

    // Get first image for thumbnail
    const thumbnailUrl = report.imageUrls?.[0] || report.imageUrl || "";

    reportElement.innerHTML = `
        <!-- REPORT CONTENT (ADDED) -->
        <div class="report-content">
            <h4>${report.title || "Untitled Report"}</h4>
            ${dateStr ? `<span class="report-date">${dateStr}</span>` : ""}
            ${report.description ? `<p>${report.description}</p>` : ""}
            ${location ? `<p>📍 ${location}${report.coordinates ? ` (${report.coordinates})` : ""}</p>` : ""}
            ${report.contact ? `<p>📞 ${report.contact}</p>` : ""}
            ${thumbnailUrl ? `<img src="${thumbnailUrl}" alt="Report thumbnail" class="report-thumbnail" onclick="window.open('${thumbnailUrl}', '_blank')">` : ""}
        </div>
        
        <!-- EXISTING BUTTONS (UNCHANGED) -->
        <div class="report-actions">
            <button class="reshare-btn" 
                    data-id="${report.id}"
                    data-translated="locked">
                ${reshareText}
            </button>
            <button class="delete-btn"
                    data-id="${report.id}"
                    data-translated="locked">
                ${deleteText}
            </button>
        </div>
    `;

    // Attach event listeners (EXACTLY AS BEFORE)
    reportElement
      .querySelector(".reshare-btn")
      .addEventListener("click", () => {
        console.log("🔍 RENDER - report being passed to handleReportReshare:", {
          id: report.id,
          title: report.title,
          imageUrls: report.imageUrls,
          imageUrlsLength: report.imageUrls?.length,
          imageCount: report.imageCount,
        });
        handleReportReshare(report);
      });
    reportElement
      .querySelector(".delete-btn")
      .addEventListener("click", () => handleReportDeletion(report.id));

    // Button translation lock (EXACTLY AS BEFORE)
    lockButtonText(reportElement.querySelector(".reshare-btn"));
    lockButtonText(reportElement.querySelector(".delete-btn"));

    return reportElement;
  }

  // Original deleteReport (kept as is)
  async function deleteReport(reportId) {
    if (!showConfirm("warnings.deleteConfirm")) return;

    const btn = document.querySelector(
      `[onclick*="deleteReport('${reportId}')"]`,
    );
    const currentLang = window.currentLanguage || "en";

    if (btn) {
      btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> ${TRANSLATION_PATCH.deleting?.[currentLang] || "Deleting..."}`;
      btn.disabled = true;
    }

    try {
      await window.fb.firestore.deleteDoc(
        window.fb.firestore.doc(window.fb.db, "reports", reportId),
      );

      await loadSavedReports();
      showAlert("success.delete");
    } catch (error) {
      console.error("Delete failed:", { error: error, fb: window.fb });
      showAlert("errors.delete");
    } finally {
      if (btn) {
        btn.innerHTML = `<i class="fas fa-trash"></i> ${TRANSLATION_PATCH.deleteBtn?.[currentLang] || "Delete"}`;
        btn.disabled = false;
      }
    }
  }

  // Original clearAllReports
  async function clearAllReports() {
    const lang = localStorage.getItem("appLanguage") || "en";

    if (!confirm(TRANSLATION_PATCH.confirmations?.clearAll?.[lang])) return;

    try {
      localStorage.removeItem("savedReports");

      if (typeof db !== "undefined" && db && userId) {
        const reportsRef = db
          .collection("users")
          .doc(userId)
          .collection("savedReports");
        const snapshot = await reportsRef.get();
        const batch = db.batch();
        snapshot.forEach((doc) => batch.delete(doc.ref));
        await batch.commit();
      }

      if (typeof renderSavedReports === "function") {
        renderSavedReports();
      }

      const successText = TRANSLATION_PATCH.successMessages?.clearedAll?.[lang];
      alert(successText);
    } catch (error) {
      console.error("Clear failed:", error);
      showAlert(
        "error",
        TRANSLATION_PATCH.errorMessages?.clearAllFailed?.[lang] ||
          "Failed to clear reports",
      );
    }
  }

  window.clearAllReports = clearAllReports; // Global access

  async function reshareReport(reportId) {
    const report = savedReports.find((r) => r.id === reportId);
    if (!report) return;

    document.getElementById("report-title").value = report.title;
    document.getElementById("report-type").value = report.type;
    document.getElementById("report-description").value = report.description;
    document.getElementById("location-text-input").value = report.locationText;
    document.getElementById("selected-coordinates").value = report.coordinates;
    document.getElementById("reporter-contact").value = report.contact;

    switchTab("new-report");
    document.getElementById("share-section").style.display = "block";

    if (report.coordinates) {
      const [lat, lng] = report.coordinates.split(",").map(Number);
      updateMap(lat, lng, report.locationText || report.title);
    }
  }

  // ===== 7. INITIALIZATION ===== //
  async function initializeApp() {
    try {
      // Wait for Firebase to be fully ready
      await new Promise((resolve) => {
        if (window.firebaseInitialized) return resolve();

        const checkInterval = setInterval(() => {
          if (window.firebaseInitialized) {
            clearInterval(checkInterval);
            resolve();
          }
        }, 100);

        // Timeout after 3 seconds
        setTimeout(() => {
          clearInterval(checkInterval);
          resolve();
        }, 3000);
      });

      // Verify auth is available
      if (!window.fb?.auth) {
        throw new Error("Firebase Auth not available");
      }

      console.log("Firebase auth confirmed:", window.fb.auth);

      // Rest of your initialization code...
      document.querySelectorAll(".tab").forEach((tab) => {
        tab.addEventListener("click", () => switchTab(tab.dataset.tab));
      });

      window.fb.auth.onAuthStateChanged((user) => {
        // Initialize form handler for ALL users (signed in or not)
        initializeFormHandler();

        // Only run these for signed-in users
        if (user) {
          document
            .getElementById("clear-all")
            ?.addEventListener("click", clearAllReports);
          if (currentTab === "saved-reports") loadSavedReports();
        }
      });
    } catch (error) {
      console.error("Initialization failed:", error);
      showAlert("errors.initialization");
      // Optional: Retry after delay
      setTimeout(initializeApp, 2000);
    }
  }
  // Start the app
  initializeApp();

  // ===== TRANSLATION SYSTEM ===== //
  // ===== IMPROVED TRANSLATION SYSTEM ===== //
  const TRANSLATIONS = {
    en: {
      reportType: { select: "Select Type" },
      imageLabel: "Upload Image",
      buttons: {
        submit: "Submit Report",
        save: "Save Report",
      },
      // Add other English keys as needed
    },
    vi: {
      reportType: { select: "Chọn loại" },
      imageLabel: "Tải lên hình ảnh",
      buttons: {
        submit: "Gửi báo cáo",
        save: "Lưu báo cáo",
      },
    },
    // Add other languages similarly
  };

  function translate(key) {
    // Skip dropdown option translation
    if (
      key &&
      (key.startsWith("reportTypes.") || key === "reportType.select")
    ) {
      return key; // Return the key so it gets skipped
    }

    const lang = localStorage.getItem("userLanguage") || "en";
    const translation = TRANSLATIONS[lang] || TRANSLATIONS.en;

    // Special case for report type selector
    if (key === "reportType.select") {
      return translation.reportType?.select || "Select Type";
    }

    return key.split(".").reduce((o, k) => (o || {})[k], translation) || key;
  }

  function applyTranslations() {
    // Translate labels and buttons, BUT SKIP dropdown options
    document.querySelectorAll("[data-translate]").forEach((el) => {
      // SKIP dropdown options - they are handled by translateDropdown()
      if (el.parentElement?.id === "report-type" || el.tagName === "OPTION") {
        return;
      }
      el.textContent = translate(el.getAttribute("data-translate"));
    });

    // Special handling for select placeholder
    const select = document.querySelector('#report-type option[value=""]');
    if (select) select.textContent; // Add this at the end

    if (typeof translateButtons === "function") translateButtons();
  }
  // ===== LANGUAGE PERSISTENCE ===== //
  // ============================================
  // 3. setLanguage() - MODIFIED with retry
  // ============================================
  function setLanguage(lang) {
    // 🔒 GUARD: Prevent infinite loop
    if (window._languageLock) {
      console.log("⚠️ Language change already in progress, skipping...");
      return;
    }
    window._languageLock = true;

    try {
      // Safety: Check if critical DOM elements exist
      if (!document.body || !document.getElementById("report-type")) {
        console.log(
          "⚠️ DOM not ready (missing critical elements), delaying setLanguage",
        );
        setTimeout(() => {
          window._languageLock = false;
          setLanguage(lang);
        }, 100);
        return;
      }

      // FORCE save the language
      localStorage.setItem("userLanguage", lang);
      localStorage.setItem("appLanguage", lang);
      window.currentLanguage = lang;
      console.log("🔧 setLanguage() called with:", lang);

      const isSignedIn = window.fb?.auth?.currentUser ? true : false;

      if (!isSignedIn) {
        console.log("📢 Signed out - using signed-out translation system");
        const selector = document.getElementById("language-switcher");
        if (selector) selector.value = lang;
        const userSelector = document.getElementById("usersLanguageSwitcher");
        if (userSelector) userSelector.value = lang;
        if (typeof window.applySignedOutTranslations === "function") {
          window.applySignedOutTranslations();
        } else {
          setTimeout(() => location.reload(), 100);
        }
        return;
      }

      // ============================================
      // SIGNED-IN USER TRANSLATIONS
      // ============================================

      // Guide button
      const guideText = document.getElementById("guide-text");
      if (guideText) {
        guideText.innerText =
          {
            en: "Guide",
            vi: "Hướng dẫn",
            zh: "指南",
            es: "Guía",
            hi: "गाइड",
            ar: "دليل",
          }[lang] || "Guide";
      }

      // Subscribe button
      const subscribeSpan = document.querySelector("#subscribeBtn span");
      if (subscribeSpan) {
        subscribeSpan.innerText =
          {
            en: "Subscribe",
            vi: "Đăng ký",
            zh: "订阅",
            es: "Suscribirse",
            hi: "सदस्यता लें",
            ar: "اشتراك",
          }[lang] || "Subscribe";
      }

      // Copyright text
      const copyrightSpan = document.getElementById("footerCopyright");
      if (copyrightSpan) {
        const copyrightText = {
          en: "All rights reserved.",
          vi: "Đã đăng ký bản quyền.",
          zh: "保留所有权利。",
          es: "Todos los derechos reservados.",
          hi: "सर्वाधिकार सुरक्षित।",
          ar: "جميع الحقوق محفوظة.",
        };
        copyrightSpan.textContent = copyrightText[lang] || copyrightText.en;
      }

      // Support label
      const supportLabel = document.getElementById("supportLabel");
      if (supportLabel) {
        const supportText = {
          en: "Support:",
          vi: "Hỗ trợ:",
          zh: "支持:",
          es: "Soporte:",
          hi: "समर्थन:",
          ar: "الدعم:",
        };
        supportLabel.textContent = supportText[lang] || supportText.en;
      }

      // Logout button
      const logoutBtn = document.getElementById("logoutBtn");
      if (logoutBtn) {
        logoutBtn.innerText =
          {
            en: "Logout",
            vi: "Đăng xuất",
            zh: "退出",
            es: "Cerrar sesión",
            hi: "लॉगआउट",
            ar: "تسجيل الخروج",
          }[lang] || "Logout";
      }

      // Run existing UI updates
      if (typeof applyTranslations === "function") applyTranslations();
      if (typeof updatePatchedTranslations === "function")
        updatePatchedTranslations();
      if (typeof updateShareHeading === "function") updateShareHeading();
      if (typeof updateFileInputDisplay === "function")
        updateFileInputDisplay();
      if (typeof translateSavedReportsLabel === "function")
        translateSavedReportsLabel();
      if (typeof updateAllWarnings === "function") updateAllWarnings();
      if (typeof updateLocationButtonText === "function")
        updateLocationButtonText();
      if (typeof updateDashboardIntro === "function") updateDashboardIntro();
      if (typeof updateFormPlaceholders === "function")
        updateFormPlaceholders(lang);
      if (typeof translateButtons === "function") translateButtons();

      // ✅ ONLY CALL translateDropdown() ONCE
      if (typeof translateDropdown === "function") translateDropdown();

      // ============================================
      // FORCE UPDATE LABELS AFTER ALL OTHER FUNCTIONS
      // ============================================
      const labelTranslations = {
        reportTypeLabel: {
          en: "Report Type:",
          vi: "Loại báo cáo:",
          zh: "报告类型：",
          es: "Tipo de informe:",
          hi: "रिपोर्ट प्रकार:",
          ar: "نوع التقرير:",
        },
        titleLabel: {
          en: "Title:",
          vi: "Tiêu đề:",
          zh: "标题：",
          es: "Título:",
          hi: "शीर्षक:",
          ar: "العنوان:",
        },
        descriptionLabel: {
          en: "Description:",
          vi: "Mô tả:",
          zh: "描述：",
          es: "Descripción:",
          hi: "विवरण:",
          ar: "الوصف:",
        },
        locationLabel: {
          en: "Location Details:",
          vi: "Chi tiết địa điểm:",
          zh: "位置详情：",
          es: "Detalles de ubicación:",
          hi: "स्थान विवरण:",
          ar: "تفاصيل الموقع:",
        },
        contactLabel: {
          en: "Your Contact:",
          vi: "Liên hệ của bạn:",
          zh: "您的联系方式：",
          es: "Su contacto:",
          hi: "आपका संपर्क:",
          ar: "جهة اتصالك:",
        },
        "reportTypes.select": {
          en: "-- Select Type --",
          vi: "-- Chọn loại --",
          zh: "-- 选择类型 --",
          es: "-- Seleccione tipo --",
          hi: "-- प्रकार चुनें --",
          ar: "-- اختر النوع --",
        },
        "buttons.showOnMap": {
          en: "Show on Map",
          vi: "Hiện trên bản đồ",
          zh: "在地图上显示",
          es: "Mostrar en mapa",
          hi: "मानचित्र पर दिखाएं",
          ar: "عرض على الخريطة",
        },
      };

      // Update ALL data-translate elements
      document.querySelectorAll("[data-translate]").forEach((el) => {
        const key = el.getAttribute("data-translate");
        if (labelTranslations[key] && labelTranslations[key][lang]) {
          if (el.tagName === "OPTION") {
            el.textContent = labelTranslations[key][lang];
          } else if (el.tagName === "LABEL") {
            el.textContent = labelTranslations[key][lang];
          } else {
            el.textContent = labelTranslations[key][lang];
          }
        }
      });

      // Update the map button specifically
      const mapBtn = document.querySelector('button[onclick="findAddress()"]');
      if (mapBtn) {
        mapBtn.textContent =
          labelTranslations["buttons.showOnMap"][lang] || "Show on Map";
      }

      const selector = document.getElementById("language-switcher");
      if (selector) selector.value = lang;
      const userSelector = document.getElementById("usersLanguageSwitcher");
      if (userSelector) userSelector.value = lang;

      // ============================================
      // UPDATE DROPDOWN OPTIONS (SIGNED IN)
      // ============================================
      const reportTypeTranslations = {
        missing_person: {
          en: "Missing Person",
          vi: "Người mất tích",
          zh: "失踪人员",
          es: "Persona desaparecida",
          hi: "लापता व्यक्ति",
          ar: "شخص مفقود",
        },
        lost_item: {
          en: "Lost Item",
          vi: "Tài sản bị mất",
          zh: "丢失物品",
          es: "Objeto perdido",
          hi: "खोई हुई वस्तु",
          ar: "عنصر مفقود",
        },
        found_person: {
          en: "Found Person",
          vi: "Tìm thấy người",
          zh: "找到人员",
          es: "Persona encontrada",
          hi: "मिला व्यक्ति",
          ar: "شخص تم العثور عليه",
        },
        found_item: {
          en: "Found Item",
          vi: "Tìm thấy tài sản",
          zh: "找到物品",
          es: "Objeto encontrado",
          hi: "मिली वस्तु",
          ar: "عنصر تم العثور عليه",
        },
        event: {
          en: "Event",
          vi: "Sự kiện",
          zh: "活动",
          es: "Evento",
          hi: "कार्यक्रम",
          ar: "حدث",
        },
      };

      const selectElement = document.getElementById("report-type");
      if (selectElement && selectElement.options) {
        const options = selectElement.options;
        for (let i = 0; i < options.length; i++) {
          const opt = options[i];
          const value = opt.value;
          if (value && reportTypeTranslations[value]) {
            const translation = reportTypeTranslations[value][lang];
            if (translation) {
              let emoji = "";
              if (value === "missing_person") emoji = "🚨 ";
              else if (value === "lost_item") emoji = "🔍 ";
              else if (value === "found_person") emoji = "🙏 ";
              else if (value === "found_item") emoji = "🔄 ";
              else if (value === "event") emoji = "🎉 ";
              opt.textContent = emoji + translation;
            }
          }
        }
        // Translate the first option (-- Select Type --)
        const firstOption = selectElement.options[0];
        if (firstOption) {
          const selectTypeText = {
            en: "-- Select Type --",
            vi: "-- Chọn loại --",
            zh: "-- 选择类型 --",
            es: "-- Seleccione tipo --",
            hi: "-- प्रकार चुनें --",
            ar: "-- اختر النوع --",
          };
          firstOption.textContent = selectTypeText[lang] || "-- Select Type --";
        }
      }

      console.log("🔧 setLanguage() completed for signed-in user");
    } finally {
      // Release the lock
      window._languageLock = false;
    }
  }

  function updateSupportLabel() {
    const supportSpan = document.getElementById("supportLabel");
    if (!supportSpan) return;

    const lang =
      localStorage.getItem("userLanguage") ||
      localStorage.getItem("appLanguage") ||
      "en";
    const labels = {
      en: "📧 Support:",
      vi: "📧 Hỗ trợ:",
      zh: "📧 支持：",
      es: "📧 Soporte:",
      hi: "📧 सहायता:",
      ar: "📧 الدعم:",
    };
    supportSpan.textContent = labels[lang] || labels.en;
  }

  // Call this function on page load and language change
  document.addEventListener("DOMContentLoaded", updateSupportLabel);

  // ▼▼▼ ADD THIS NEW FUNCTION RIGHT HERE ▼▼▼
  function updateFormPlaceholders(lang) {
    if (!lang) {
      lang =
        localStorage.getItem("appLanguage") ||
        localStorage.getItem("userLanguage") ||
        "en";
    }
    console.log("🔄 updateFormPlaceholders using language:", lang);

    // Title field
    const titleField = document.getElementById("report-title");
    if (titleField) {
      const placeholders = {
        en: "e.g. Missing boy, Lost wallet",
        vi: "vd. Bé trai mất tích, Ví bị mất",
        zh: "例如：失踪男孩，丢失钱包",
        es: "ej. Niño perdido, Billetera perdida",
        hi: "जैसे: लापता लड़का, खोया हुआ बटुआ",
        ar: "مثال: فتى مفقود، محفظة ضائعة",
      };
      titleField.placeholder = placeholders[lang] || placeholders.en;
    }

    // Location field
    const locationField = document.getElementById("location-text-input");
    if (locationField) {
      const placeholders = {
        en: "Specific place",
        vi: "Địa điểm cụ thể",
        zh: "具体地点",
        es: "Lugar específico",
        hi: "विशिष्ट स्थान",
        ar: "مكان محدد",
      };
      locationField.placeholder = placeholders[lang] || placeholders.en;
    }

    // Address field
    const addressField = document.getElementById("address-input");
    if (addressField) {
      const placeholders = {
        en: "Search address",
        vi: "Tìm kiếm địa chỉ",
        zh: "搜索地址",
        es: "Buscar dirección",
        hi: "पता खोजें",
        ar: "ابحث عن العنوان",
      };
      addressField.placeholder = placeholders[lang] || placeholders.en;
    }
  }
  // ▲▲▲ END NEW FUNCTION ▲▲▲

  // ============================================
  // FILE INPUT LABEL - ADD THIS FUNCTION HERE
  // ============================================

  function updateFileInputLabel() {
    const fileLabel = document.querySelector(".file-input-text");
    if (!fileLabel) return;

    const lang =
      localStorage.getItem("appLanguage") ||
      localStorage.getItem("userLanguage") ||
      "en";
    console.log("🔄 Updating file label for language:", lang);

    const labels = {
      en: "Choose files (max 5)",
      vi: "Chọn tệp (tối đa 5)",
      zh: "选择文件（最多5个）",
      es: "Elegir archivos (máx. 5)",
      hi: "फ़ाइलें चुनें (अधिकतम 5)",
      ar: "اختر الملفات (5 كحد أقصى)",
    };

    const fileInput = document.getElementById("report-image");
    if (fileInput && fileInput.files.length > 0) {
      if (fileInput.files.length === 1) {
        fileLabel.textContent = fileInput.files[0].name;
      } else {
        const fileText = {
          en: "files selected",
          vi: "tệp đã chọn",
          zh: "个文件已选择",
          es: "archivos seleccionados",
          hi: "फ़ाइलें चुनी गईं",
          ar: "ملفات مختارة",
        };
        fileLabel.textContent = `${fileInput.files.length} ${fileText[lang] || fileText.en}`;
      }
    } else {
      fileLabel.textContent = labels[lang] || labels.en;
    }
  }
  // Initialize on load

  // ===== 8. GLOBAL EXPORTS ===== //
  window.initMap = initMap;
  window.findAddress = findAddress;
  window.useCurrentLocation = useCurrentLocation;
  window.updateMap = updateMap;
  window.switchTab = switchTab;
  window.deleteReport = deleteReport;
  window.reshareReport = reshareReport;
  window.clearAllReports = clearAllReports;

  console.log("Reports.js setup complete");
}
// ===== SAFE TRANSLATION PATCH ===== //
// ===== RELIABLE TRANSLATION PATCH ===== //
const LOGOUT_TRANSLATIONS = {
  en: "Logout",
  vi: "Đăng xuất",
  ar: "تسجيل الخروج",
  es: "Cerrar sesión",
  hi: "लॉग आउट",
  zh: "退出登录",
};

function updateLogoutButton() {
  const logoutBtn = document.getElementById("logoutBtn");
  if (!logoutBtn) return;

  const lang =
    localStorage.getItem("appLanguage") ||
    localStorage.getItem("userLanguage") ||
    "en";
  const LOGOUT_TRANSLATIONS = {
    en: "Logout",
    vi: "Đăng xuất",
    zh: "退出",
    es: "Cerrar sesión",
    hi: "लॉगआउट",
    ar: "تسجيل الخروج",
  };
  logoutBtn.textContent = LOGOUT_TRANSLATIONS[lang] || LOGOUT_TRANSLATIONS.en;
}

// 1. Update on load

// 2. Update when language changes
document.getElementById("language-switcher")?.addEventListener("change", () => {
  setTimeout(updateLogoutButton, 300);
});

// ===== SCALED TRANSLATION PATCH ===== // (NEW CODE - ADD BELOW)
const TRANSLATION_PATCH = {
  // ============================================
  // COMPACT WARNING - ALL 6 LANGUAGES
  // ============================================
  compact_warning: {
    en: '⚠️ By using this app, you agree to our <a href="./terms.html" target="_blank" style="color: #4CAF50; text-decoration: none;">Terms</a> &amp; <a href="./privacy-policy.html" target="_blank" style="color: #4CAF50; text-decoration: none;">Privacy Policy</a>. No sensitive info. Reports auto-delete after 180 days.',

    vi: '⚠️ Khi sử dụng ứng dụng này, bạn đồng ý với <a href="./terms.html" target="_blank" style="color: #4CAF50; text-decoration: none;">Điều khoản</a> &amp; <a href="./privacy-policy.html" target="_blank" style="color: #4CAF50; text-decoration: none;">Chính sách bảo mật</a> của chúng tôi. Không chia sẻ thông tin nhạy cảm. Báo cáo tự động xóa sau 180 ngày.',

    zh: '⚠️ 使用本应用即表示您同意我们的<a href="./terms.html" target="_blank" style="color: #4CAF50; text-decoration: none;">服务条款</a>和<a href="./privacy-policy.html" target="_blank" style="color: #4CAF50; text-decoration: none;">隐私政策</a>。请勿分享敏感信息。报告将在180天后自动删除。',

    es: '⚠️ Al usar esta aplicación, aceptas nuestros <a href="./terms.html" target="_blank" style="color: #4CAF50; text-decoration: none;">Términos</a> y <a href="./privacy-policy.html" target="_blank" style="color: #4CAF50; text-decoration: none;">Política de Privacidad</a>. No compartas información sensible. Los informes se eliminan automáticamente después de 180 días.',

    hi: '⚠️ इस ऐप का उपयोग करके, आप हमारी <a href="./terms.html" target="_blank" style="color: #4CAF50; text-decoration: none;">सेवा शर्तों</a> और <a href="./privacy-policy.html" target="_blank" style="color: #4CAF50; text-decoration: none;">गोपनीयता नीति</a> से सहमत होते हैं। कोई संवेदनशील जानकारी नहीं। रिपोर्ट 180 दिनों के बाद स्वचालित रूप से हटा दी जाती हैं।',

    ar: '⚠️ باستخدام هذا التطبيق، فإنك توافق على <a href="./terms.html" target="_blank" style="color: #4CAF50; text-decoration: none;">الشروط</a> و<a href="./privacy-policy.html" target="_blank" style="color: #4CAF50; text-decoration: none;">سياسة الخصوصية</a> الخاصة بنا. لا تشارك معلومات حساسة. يتم حذف التقارير تلقائيًا بعد 180 يومًا.',
  },

  //warnings: {
  // REMOVED - Now using compact warning
  //fraud: {
  en: "False reports harm the community. Intentionally submitting fake listings may result in a permanent ban and legal action.",
  vi: "Báo cáo giả gây hại cho cộng đồng. Cố tình gửi danh sách giả có thể dẫn đến cấm vĩnh viễn và hành động pháp lý.",
  ar: "التقارير الكاذبة تضر المجتمع. التقديم المتعمد لقوائم مزيفة قد يؤدي إلى حظر دائم وإجراءات قانونية.",
  es: "Los informes falsos dañan a la comunidad. Enviar intencionalmente listados falsos puede resultar en una prohibición permanente y acciones legales.",
  hi: "झूठी रिपोर्ट समुदाय को नुकसान पहुँचाती हैं। जानबूझकर नकली सूचियाँ जमा करने से स्थायी प्रतिबंध और कानूनी कार्रवाई हो सकती है।",
  zh: "虚假报告危害社区。故意提交虚假列表可能导致永久封禁和法律诉讼。",
  //},
  //spam: {
  en: "Subscription required for all features. Your subscription supports our community service.",
  vi: "Đăng ký để sử dụng tất cả tính năng. Đăng ký của bạn hỗ trợ dịch vụ cộng đồng của chúng tôi.",
  ar: "يوجد اشتراك مطلوب لجميع الميزات. يدعم اشتراكك خدمتنا المجتمعية.",
  es: "Se requiere suscripción para todas las funciones. Su suscripción apoya nuestro servicio comunitario.",
  hi: "सभी सुविधाओं के लिए सदस्यता आवश्यक है। आपकी सदस्यता हमारी सामुदायिक सेवा का समर्थन करती है।",
  zh: "所有功能都需要订阅。您的订阅支持我们的社区服务。",
  //},
  //privacy: {
  en: "Do NOT share sensitive info (e.g., credit cards, IDs). Violations will be removed and reported to authorities.",
  vi: "KHÔNG chia sẻ thông tin nhạy cảm (ví dụ: thẻ tín dụng, CMND). Vi phạm sẽ bị xóa và báo cáo với cơ quan chức năng.",
  ar: "لا تشارك معلومات حساسة (مثل بطاقات الائتمان، الهويات). سيتم إزالة الانتهاكات وإبلاغ السلطات.",
  es: "NO comparta información sensible (ej. tarjetas de crédito, identificaciones). Las violaciones serán eliminadas y reportadas a las autoridades.",
  hi: "संवेदनशील जानकारी साझा न करें (जैसे क्रेडिट कार्ड, आईडी)। उल्लंघनों को हटा दिया जाएगा और अधिकारियों को रिपोर्ट किया जाएगा।",
  zh: "请勿分享敏感信息（如信用卡、身份证）。违规内容将被删除并报告给当局。",
  //},
  //images: {
  en: "Upload only relevant item photos. No explicit/offensive content. Repeat violations will ban your account.",
  vi: "Chỉ tải lên ảnh phù hợp. Không nội dung khiêu dâm/phản cảm. Vi phạm nhiều lần sẽ bị khóa tài khoản.",
  ar: "قم بتحميل صور العناصر ذات الصلة فقط. لا يوجد محتوى صريح/مسيء. ستؤدي الانتهاكات المتكررة إلى حظر حسابك.",
  es: "Suba solo fotos relevantes del artículo. Sin contenido explícito/ofensivo. Las violaciones repetidas prohibirán su cuenta.",
  hi: "केवल प्रासंगिक आइटम की तस्वीरें अपलोड करें। कोई स्पष्ट/आपत्तिजनक सामग्री नहीं। दोहराए गए उल्लंघन आपके खाते पर प्रतिबंध लगा देंगे।",
  zh: "仅上传相关物品照片。禁止露骨/冒犯性内容。重复违规将封禁您的账户。",
  //},
  //tos: {
  en: "By using this app, you agree to our Terms of Service and Privacy Policy. Misuse may lead to account termination.",
  vi: "Khi sử dụng ứng dụng này, bạn đồng ý với Điều khoản Dịch vụ và Chính sách Bảo mật của chúng tôi. Lạm dụng có thể dẫn đến chấm dứt tài khoản.",
  ar: "باستخدام هذا التطبيق، فإنك توافق على شروط الخدمة وسياسة الخصوصية الخاصة بنا. قد يؤدي سوء الاستخدام إلى إنهاء الحساب.",
  es: "Al usar esta aplicación, aceptas nuestros Términos de Servicio y Política de Privacidad. El uso inadecuado puede llevar a la terminación de la cuenta.",
  hi: "इस ऐप का उपयोग करके, आप हमारी सेवा की शर्तों और गोपनीयता नीति से सहमत होते हैं। दुरुपयोग से खाता समाप्ति हो सकती है।",
  zh: "使用本应用即表示您同意我们的服务条款和隐私政策。滥用可能导致账户终止。",
  //},
  //legal: {
  en: "We cooperate with law enforcement. Illegal activity (e.g., stolen goods) will be reported.",
  vi: "Chúng tôi hợp tác với cơ quan thực thi pháp luật. Hành động phạm pháp (ví dụ: hàng ăn cắp) sẽ bị báo cáo.",
  ar: "نحن نتعاون مع إنفاذ القانون. سيتم الإبلاغ عن الأنشطة غير القانونية (مثل البضائع المسروقة).",
  es: "Cooperamos con las fuerzas del orden. Se informará de actividades ilegales (ej. artículos robados).",
  hi: "हम कानून प्रवर्तन के साथ सहयोग करते हैं। अवैध गतिविधि (जैसे चोरी का सामान) की रिपोर्ट की जाएगी।",
  zh: "我们与执法部门合作。非法活动（如赃物）将被举报。",
  //},
  //scams: {
  en: "Never share payment details. Report anyone demanding money for lost items.",
  vi: "Không bao giờ chia sẻ chi tiết thanh toán. Báo cáo bất kỳ ai yêu cầu tiền cho đồ vật bị mất.",
  ar: "لا تشارك تفاصيل الدفع أبدًا. أبلغ عن أي شخص يطالب بالمال مقابل العناصر المفقودة.",
  es: "Nunca comparta detalles de pago. Informe a cualquiera que exija dinero por artículos perdidos.",
  hi: "भुगतान विवरण कभी साझा न करें। खोई हुई वस्तुओं के लिए पैसे मांगने वाले किसी भी व्यक्ति की रिपोर्ट करें।",
  zh: "切勿分享付款详情。举报任何为失物索要钱财的人。",
  //},
  //meetings: {
  en: "Meet in public places. We're not liable for offline interactions.",
  vi: "Gặp nhau ở nơi công cộng. Chúng tôi không chịu trách nhiệm cho tương tác ngoại tuyến.",
  ar: "التق في الأماكن العامة. نحن لسنا مسؤولين عن التفاعلات غير المتصلة بالإنترنت.",
  es: "Reúnase en lugares públicos. No somos responsables de las interacciones fuera de línea.",
  hi: "सार्वजनिक स्थानों पर मिलें। हम ऑफ़लाइन इंटरैक्शन के लिए उत्तरदायी नहीं हैं।",
  zh: "在公共场所见面。我们对线下互动不承担责任。",
  //},
  //subscription: {
  en: "Subscription required for all features. Your subscription supports our community service.",
  vi: "Đăng ký để sử dụng tất cả tính năng. Đăng ký của bạn hỗ trợ dịch vụ cộng đồng của chúng tôi.",
  ar: "يوجد اشتراك مطلوب لجميع الميزات. يدعم اشتراكك خدمتنا المجتمعية.",
  es: "Se requiere suscripción para todas las funciones. Su suscripción apoya nuestro servicio comunitario.",
  hi: "सभी सुविधाओं के लिए सदस्यता आवश्यक है। आपकी सदस्यता हमारी सामुदायिक सेवा का समर्थन करती है।",
  zh: "所有功能都需要订阅。您的订阅支持我们的社区服务。",
  //},
  //retention: {
  en: "📌 Reports and images are stored for a maximum of 180 days (6 months). After 180 days, they are automatically deleted. Please save any important information before then.",
  vi: "📌 Báo cáo và hình ảnh được lưu trữ tối đa 180 ngày (6 tháng). Sau 180 ngày, chúng sẽ tự động bị xóa. Vui lòng lưu lại bất kỳ thông tin quan trọng trước thời điểm đó.",
  ar: "📌 يتم تخزين التقارير والصور لمدة أقصاها 180 يومًا (6 أشهر). بعد 180 يومًا، يتم حذفها تلقائيًا. يرجى حفظ أي معلومات مهمة قبل ذلك الوقت.",
  es: "📌 Los informes e imágenes se almacenan por un máximo de 180 días (6 meses). Después de 180 días, se eliminan automáticamente. Guarde cualquier información importante antes de ese momento.",
  hi: "📌 रिपोर्ट और छवियाँ अधिकतम 180 दिनों (6 महीने) के लिए संग्रहीत की जाती हैं। 180 दिनों के बाद, वे स्वचालित रूप से हटा दी जाती हैं। कृपया उस समय से पहले कोई भी महत्वपूर्ण जानकारी सहेज लें।",
  zh: "📌 报告和图片最多存储180天（6个月）。180天后将自动删除。请在此之前保存任何重要信息。",
  //},
  //},

  dashboardIntro: {
    en: "Your all-in-one hub for community communication. Report missing people, lost items, found property, and announce events. Connect and share across platforms instantly.",
    es: "Su centro integral para la comunicación comunitaria. Reporte personas desaparecidas, objetos perdidos, propiedades encontradas y anuncie eventos. Conéctese y comparte a través de plataformas al instante.",
    zh: "您的一站式社区交流中心。报告失踪人员、丢失物品、找到的财产并发布活动公告。即时跨平台连接和分享。",
    vi: "Trung tâm liên lạc cộng đồng tất cả trong một của bạn. Báo cáo người mất tích, đồ vật thất lạc, thấy tài sản thất lạc và thông báo sự kiện. Kết nối và chia sẻ trên nhiều nền tảng ngay lập tức.",
    hi: "समुदाय संचार के लिए आपका ऑल-इन-वन हब। गुमशुदा लोगों, खोई हुई वस्तुओं, मिली संपत्ति की रिपोर्ट करें और कार्यक्रमों की घोषणा करें। तुरंत प्लेटफार्मों में जुड़ें और साझा करें।",
    ar: "مركزك الشامل للتواصل المجتمعي. بلغ عن الأشخاص المفقودين، والأشياء المفقودة، والممتلكات الموجودة، وأعلن عن الفعاليات. تواصل وشارك عبر المنصات على الفور.",
  },

  // New section for subscription messages
  subscriptionMessages: {
    subscriptionBenefits: {
      en: "Your subscription includes unlimited reporting and premium features",
      vi: "Gói đăng ký của bạn bao gồm báo cáo không giới hạn và các tính năng cao cấp",
      ar: "يشمل اشتراكك الإبلاغ غير المحدود والميزات المتميزة",
      es: "Su suscripción incluye informes ilimitados y funciones premium",
      hi: "आपकी सदस्यता में असीमित रिपोर्टिंग और प्रीमियम सुविधाएँ शामिल हैं",
      zh: "您的订阅包括无限报告和高级功能",
    },
    renewalReminder: {
      en: "Your subscription will renew in 7 days. Manage in account settings.",
      vi: "Gói đăng ký của bạn sẽ gia hạn trong 7 ngày. Quản lý trong cài đặt tài khoản.",
      ar: "سيتم تجديد اشتراكك بعد 7 أيام. قم بإدارته في إعدادات الحساب.",
      es: "Su suscripción se renovará en 7 días. Administrar en configuración de cuenta.",
      hi: "आपकी सदस्यता 7 दिनों में नवीनीकृत हो जाएगी। खाता सेटिंग्स में प्रबंधित करें।",
      zh: "您的订阅将在7天后续订。在帐户设置中管理。",
    },
    pricingNotice: {
      en: "Prices may change due to market conditions or promotional periods",
      vi: "Giá có thể thay đổi do điều kiện thị trường hoặc các giai đoạn khuyến mãi",
      ar: "قد تتغير الأسعار بسبب ظروف السوق أو فترات الترويج",
      es: "Los precios pueden cambiar debido a condiciones del mercado o períodos promocionales",
      hi: "बाजार की स्थितियों या प्रचारक अवधियों के कारण कीमतें बदल सकती हैं",
      zh: "价格可能因市场状况或促销期而变化",
    },
  },

  // ===== 2. NEW REPORT SECTION =====
  // A. Tab Buttons
  newReportTab: {
    en: "New Report",
    vi: "Báo cáo mới",
    ar: "تقرير جديد",
    es: "Nuevo informe",
    hi: "नई रिपोर्ट",
    zh: "新报告",
  },
  savedReportTab: {
    en: "Saved Reports",
    vi: "Báo cáo đã lưu",
    ar: "التقارير المحفوظة",
    es: "Informes guardados",
    hi: "सहेजी गई रिपोर्ट",
    zh: "已保存报告",
  },

  reportTypeLabel: {
    en: "Report Type",
    vi: "Loại báo cáo",
    zh: "报告类型",
    es: "Tipo de informe",
    hi: "रिपोर्ट प्रकार",
    ar: "نوع التقرير",
  },

  titleLabel: {
    en: "Title",
    vi: "Tiêu đề",
    zh: "标题",
    es: "Título",
    hi: "शीर्षक",
    ar: "العنوان",
  },
  descriptionLabel: {
    en: "Description",
    vi: "Mô tả",
    zh: "描述",
    es: "Descripción",
    hi: "विवरण",
    ar: "الوصف",
  },
  locationLabel: {
    en: "Location Details",
    vi: "Chi tiết địa điểm",
    zh: "位置详情",
    es: "Detalles de ubicación",
    hi: "स्थान विवरण",
    ar: "تفاصيل الموقع",
  },
  contactLabel: {
    en: "Your Contact",
    vi: "Thông tin liên hệ",
    zh: "您的联系方式",
    es: "Su contacto",
    hi: "आपका संपर्क",
    ar: "جهة اتصالك",
  },

  buttons: {
    showOnMap: {
      en: "Show on Map",
      vi: "Hiện trên bản đồ",
      zh: "在地图上显示",
      es: "Mostrar en mapa",
      hi: "मानचित्र पर दिखाएं",
      ar: "عرض على الخريطة",
    },
  },

  dropdowns: {
    selectType: {
      en: "Select Type",
      vi: "Chọn loại",
      ar: "اختر النوع",
      es: "Seleccionar tipo",
      hi: "प्रकार चुनें",
      zh: "选择类型",
    },
    shareReport: {
      en: "Share this report",
      vi: "Chia sẻ báo cáo",
      ar: "مشاركة هذا التقرير",
      es: "Compartir este informe",
      hi: "इस रिपोर्ट को साझा करें",
      zh: "分享此报告",
    },
  },
  buttons: {
    saveReport: {
      en: "Save Report",
      vi: "Lưu báo cáo",
      ar: "حفظ التقرير",
      es: "Guardar informe",
      hi: "रिपोर्ट सहेजें",
      zh: "保存报告",
    },
    clearAllBtn: {
      // Matches your existing key
      en: "Clear All",
      vi: "Xóa tất cả",
      ar: "مسح الكل",
      es: "Limpiar todo",
      hi: "सभी साफ करें",
      zh: "全部清除",
    },
    reshare: {
      en: "Reshare",
      vi: "Chia sẻ lại",
      ar: "إعادة مشاركة",
      es: "Volver a compartir",
      hi: "पुनः साझा करें",
      zh: "重新分享",
    },
    delete: {
      en: "Delete",
      vi: "Xóa",
      ar: "حذف",
      es: "Eliminar",
      hi: "हटाएं",
      zh: "删除",
    },
    subscribe: {
      en: "Subscribe",
      vi: "Đăng ký",
      zh: "订阅",
      es: "Suscribirse",
      hi: "सदस्यता लें",
      ar: "اشتراك",
    },
  },
  labels: {
    savedReports: {
      en: "Your saved reports",
      vi: "Báo cáo đã lưu của bạn",
      ar: "تقاريرك المحفوظة",
      es: "Tus informes guardados",
      hi: "आपकी सहेजी गई रिपोर्ट",
      zh: "您保存的报告",
    },
  },

  // B. Report Type Dropdown
  reportTypes: {
    select: {
      // ▼ Add this new section ▼
      en: "Select Type",
      vi: "Chọn loại",
      ar: "اختر النوع",
      es: "Seleccionar tipo",
      hi: "प्रकार चुनें",
      zh: "选择类型",
    },
    missing_person: {
      en: "Missing Person",
      vi: "Người mất tích",
      ar: "شخص مفقود",
      es: "Persona desaparecida",
      hi: "लापता व्यक्ति",
      zh: "失踪人员",
    },
    lost_item: {
      en: "Lost Item",
      vi: "Tài sản thất lạc",
      ar: "عنصر مفقود",
      es: "Objeto perdido",
      hi: "खोई हुई वस्तु",
      zh: "丢失物品",
    },
    found_person: {
      en: "Found Person",
      vi: "Thấy người mất tích",
      ar: "شخص موجود",
      es: "Persona encontrada",
      hi: "मिला हुआ व्यक्ति",
      zh: "找到人员",
    },
    found_item: {
      en: "Found Item",
      vi: "Thấy tài sản thất lạc",
      ar: "عنصر موجود",
      es: "Objeto encontrado",
      hi: "मिला हुआ सामान",
      zh: "找到物品",
    },
    event: {
      en: "Event",
      vi: "Sự kiện",
      ar: "حدث",
      es: "Evento",
      hi: "कार्यक्रम",
      zh: "活动",
    },
  },
  // B. Buttons

  popups: {
    dataWarning: {
      en: "Form submission failed",
      vi: "Gửi biểu mẫu thất bại",
      ar: "فشل إرسال النموذج",
      es: "Envío de formulario fallido",
      hi: "फॉर्म जमा करने में विफल",
      zh: "表单提交失败",
    },
    missingFields: {
      en: "Missing fields",
      vi: "Thiếu trường",
      ar: "الحقول المفقودة",
      es: "Campos faltantes",
      hi: "लुप्त फील्ड",
      zh: "缺失字段",
    },
    addressNotFound: {
      en: "Error: Address not found",
      vi: "Lỗi: Không tìm thấy địa chỉ",
      ar: "خطأ: العنوان غير موجود",
      es: "Error: Dirección no encontrada",
      hi: "त्रुटि: पता नहीं मिला",
      zh: "错误：未找到地址",
    },
    // C. Field Labels
    fieldLabels: {
      type: {
        en: "Report Type",
        vi: "Loại báo cáo",
        ar: "نوع التقرير",
        es: "Tipo de informe",
        hi: "रिपोर्ट प्रकार",
        zh: "报告类型",
      },
      title: {
        en: "Title",
        vi: "Tiêu đề",
        ar: "عنوان",
        es: "Título",
        hi: "शीर्षक",
        zh: "标题",
      },
      description: {
        en: "Description",
        vi: "Mô tả",
        ar: "الوصف",
        es: "Descripción",
        hi: "विवरण",
        zh: "描述",
      },
      location: {
        en: "Location Details",
        vi: "Chi tiết địa điểm",
        ar: "تفاصيل الموقع",
        es: "Detalles de ubicación",
        hi: "स्थान विवरण",
        zh: "位置详情",
      },
      contact: {
        en: "Your Contact",
        vi: "Thông tin liên hệ",
        ar: "اتصالك",
        es: "Tu contacto",
        hi: "आपका संपर्क",
        zh: "您的联系方式",
      },
      image: {
        en: "Upload Image",
        vi: "Tải lên hình ảnh",
        ar: "تحميل الصورة",
        es: "Subir imagen",
        hi: "छवि अपलोड करें",
        zh: "上传图片",
      },
      images: {
        // ← ADD THIS NEW ENTRY
        en: "Images",
        vi: "Hình ảnh",
        zh: "图片",
        es: "Imágenes",
        hi: "छवियाँ",
        ar: "الصور",
      },
    },

    // D. Action Buttons
    useLocationBtn: {
      en: "Use My Location",
      vi: "Dùng vị trí của tôi",
      ar: "استخدم موقعي",
      es: "Usar mi ubicación",
      hi: "मेरा स्थान प्रयोग करें",
      zh: "使用我的位置",
    },
    showMapBtn: {
      en: "Show on Map",
      vi: "Hiển thị trên bản đồ",
      ar: "عرض على الخريطة",
      es: "Mostrar en mapa",
      hi: "मानचित्र पर दिखाएं",
      zh: "在地图上显示",
    },
    submitReportBtn: {
      en: "Submit Report",
      vi: "Gửi báo cáo",
      ar: "إرسال التقرير",
      es: "Enviar informe",
      hi: "रिपोर्ट जमा करें",
      zh: "提交报告",
    },

    imageWarning: {
      en: "Warning: Be careful with images",
      vi: "Cảnh báo: Cẩn thận với hình ảnh",
      ar: "تحذير: كن حذرا مع الصور",
      es: "Advertencia: Cuidado con las imágenes",
      hi: "चेतावनी: छवियों के साथ सावधान रहें",
      zh: "警告：注意图片处理",
    },

    dataWarning: {
      en: "Warning: Check your data carefully",
      vi: "Cảnh báo: Kiểm tra dữ liệu cẩn thận",
      ar: "تحذير: تحقق من البيانات بعناية",
      es: "Advertencia: Verifique los datos cuidadosamente",
      hi: "चेतावनी: अपना डेटा सावधानी से जांचें",
      zh: "警告：仔细检查数据",
    },

    reportSaved: {
      en: "Report saved successfully",
      vi: "Lưu báo cáo thành công",
      ar: "تم حفظ التقرير بنجاح",
      es: "Informe guardado con éxito",
      hi: "रिपोर्ट सफलतापूर्वक सहेजी गई",
      zh: "报告保存成功",
    },
    copied: {
      en: "Copied to clipboard",
      vi: "Đã sao chép",
      ar: "تم النسخ",
      es: "Copiado al portapapeles",
      hi: "क्लिपबोर्ड पर कॉपी किया गया",
      zh: "已复制到剪贴板",
    },
  },
  // A. New Terms
  dashboardLabel: {
    en: "Dashboard",
    vi: "Bảng điều khiển",
    ar: "لوحة التحكم",
    es: "Panel",
    hi: "डैशबोर्ड",
    zh: "仪表板",
  },
  fileInputLabel: {
    en: "Choose file. No file chosen",
    vi: "Chọn tệp. Chưa có tệp nào được chọn",
    ar: "اختر ملفًا. لم يتم اختيار ملف",
    es: "Elegir archivo. Ningún archivo seleccionado",
    hi: "फ़ाइल चुनें। कोई फ़ाइल नहीं चुनी गई",
    zh: "选择文件。未选择任何文件",
  },
  shareReportSubheading: {
    en: "Share this report",
    vi: "Chia sẻ báo cáo này",
    ar: "شارك هذا التقرير",
    es: "Compartir este informe",
    hi: "इस रिपोर्ट को साझा करें",
    zh: "分享此报告",
  },
  uiTexts: {
    shareSubheading: {
      en: "Share This Report",
      vi: "Chia sẻ báo cáo này",
      ar: "شارك هذا التقرير",
      es: "Compartir este informe",
      hi: "इस रिपोर्ट को साझा करें",
      zh: "分享此报告",
    },
    dashboard: {
      en: "Dashboard",
      vi: "Bảng điều khiển",
      ar: "لوحة التحكم",
      es: "Panel",
      hi: "डैशबोर्ड",
      zh: "仪表板",
    },
  },
  warningsData: {
    en: "Warning: Check your data carefully",
    vi: "Cảnh báo: Kiểm tra dữ liệu cẩn thận",
    ar: "تحذير: تحقق من البيانات بعناية",
    es: "Advertencia: Verifique los datos cuidadosamente",
    hi: "चेतावनी: अपना डेटा सावधानी से जांचें",
    zh: "警告：仔细检查数据",
  },
  successSubmit: {
    en: "Report submitted successfully!",
    vi: "Gửi báo cáo thành công!",
    ar: "تم تقديم التقرير بنجاح!",
    es: "¡Informe enviado con éxito!",
    hi: "रिपोर्ट सफलतापूर्वक सबमिट की गई!",
    zh: "报告提交成功！",
  },

  defaultTitle: {
    en: "Report",
    vi: "Báo cáo",
    es: "Informe",
    zh: "报告",
    hi: "रिपोर्ट",
    ar: "تقرير",
  },
  defaultSubject: {
    en: "Shared Report",
    vi: "Báo cáo được chia sẻ",
    es: "Informe compartido",
    zh: "已分享的报告",
    hi: "साझा की गई रिपोर्ट",
    ar: "تقرير مشترك",
  },

  messages: {
    noSavedReports: {
      en: "No saved reports yet",
      es: "Aún no hay informes guardados",
      zh: "暂无保存的报告",
      vi: "Chưa có báo cáo nào được lưu",
      hi: "अभी तक कोई सहेजी गई रिपोर्ट नहीं",
      ar: "لا توجد تقارير محفوظة بعد",
    },
  },

  errorMessages: {
    zaloNotAvailable: {
      en: "Zalo sharing is not available right now. Please try again later.",
      es: "El uso compartido de Zalo no está disponible en este momento. Por favor, inténtelo de nuevo más tarde.",
      zh: "Zalo 分享目前不可用。请稍后再试。",
      vi: "Tính năng chia sẻ Zalo hiện không khả dụng. Vui lòng thử lại sau.",
      hi: "Zalo साझाकरण वर्तमान में उपलब्ध नहीं है। कृपया बाद में पुन: प्रयास करें।",
      ar: "مشاركة Zalo غير متاحة حاليا. يرجى المحاولة مرة أخرى في وقت لاحق.",
    },
    renderError: {
      en: "Error loading reports",
      es: "Error al cargar informes",
      zh: "加载报告时出错",
      vi: "Lỗi khi tải báo cáo",
      hi: "रिपोर्ट लोड करने में त्रुटि",
      ar: "خطأ في تحميل التقارير",
    },
    emailError: {
      en: "Error",
      vi: "Lỗi",
      es: "Error",
      zh: "错误",
      hi: "त्रुटि",
      ar: "خطأ",
    },
    emailFailed: {
      en: "Failed to prepare email content",
      vi: "Không thể tạo nội dung email",
      es: "Error al preparar el correo",
      zh: "无法准备邮件内容",
      hi: "ईमेल सामग्री तैयार करने में विफल",
      ar: "فشل تحضير محتوى البريد",
    },
    reportNotFound: {
      en: "Report not found!",
      vi: "Không tìm thấy báo cáo!",
      es: "¡Informe no encontrado!",
      zh: "未找到报告！",
      hi: "रिपोर्ट नहीं मिली!",
      ar: "التقرير غير موجود!",
    },
  },

  platforms: {
    facebook: {
      en: "Facebook",
      vi: "Facebook",
      es: "Facebook",
      zh: "Facebook",
      hi: "Facebook",
      ar: "Facebook",
    },
    telegram: {
      en: "Telegram",
      vi: "Telegram",
      zh: "电报",
      es: "Telegram",
      hi: "टेलीग्राम",
      ar: "تيليغرام",
    },
  },

  facebookShare: {
    title: {
      en: "Share on Facebook",
      vi: "Chia sẻ lên Facebook",
      es: "Compartir en Facebook",
      zh: "分享到Facebook",
      hi: "Facebook पर साझा करें",
      ar: "مشاركة على فيسبوك",
    },
    instructions: {
      en: "1. Copy the report below:",
      vi: "1. Sao chép báo cáo bên dưới:",
      es: "1. Copie el informe a continuación:",
      zh: "1. 复制以下报告:",
      hi: "1. नीचे दी गई रिपोर्ट कॉपी करें:",
      ar: "1. انسخ التقرير أدناه:",
    },
    buttons: {
      copy: {
        en: "Copy Text",
        vi: "Sao chép văn bản",
        es: "Copiar texto",
        zh: "复制文本",
        hi: "पाठ कॉपी करें",
        ar: "نسخ النص",
      },
      open: {
        en: "Open Facebook",
        vi: "Mở Facebook",
        es: "Abrir Facebook",
        zh: "打开Facebook",
        hi: "Facebook खोलें",
        ar: "فتح فيسبوك",
      },
      close: {
        en: "Close",
        vi: "Đóng",
        es: "Cerrar",
        zh: "关闭",
        hi: "बंद करें",
        ar: "إغلاق",
      },
    },
  },

  emptyDescription: {
    en: "No description",
    es: "Sin descripción",
    zh: "无描述",
    vi: "Không có mô tả",
    hi: "कोई विवरण नहीं",
    ar: "لا يوجد وصف",
  },

  emptyFields: {
    en: "No Description",
    es: "Sin Descripción",
    zh: "无描述",
    vi: "Không có mô tả",
    hi: "कोई विवरण नहीं",
    ar: "لا يوجد وصف",
  },

  reshareConfirmation: {
    en: "loaded - form updated and ready to share",
    es: "cargado - formulario actualizado y listo para compartir",
    zh: "已加载 - 表单已更新并准备分享",
    vi: "đã tải - biểu mẫu được cập nhật và sẵn sàng để chia sẻ",
    hi: "लोड किया गया - फॉर्म अपडेट किया गया और साझा करने के लिए तैयार",
    ar: "تم التحميل - النموذج محدث وجاهز للمشاركة",
  },

  resharePrompt: {
    en: {
      title: "Reshare",
      onPlatform: "on",
      whatsapp: "WhatsApp",
      twitter: "Twitter",
      email: "Email (Webmail)",
      zalo: "Zalo",
      telegram: "Telegram", // ✅ ADD THIS
      enterChoice: "Enter 1-6:",
    },
    es: {
      title: "Volver a compartir",
      onPlatform: "en",
      whatsapp: "WhatsApp",
      twitter: "Twitter",
      email: "Correo (Webmail)",
      zalo: "Zalo",
      telegram: "Telegram",
      enterChoice: "Ingrese 1-6:",
    },
    zh: {
      title: "重新分享",
      onPlatform: "到",
      whatsapp: "WhatsApp",
      twitter: "Twitter",
      email: "电子邮件(网页版)",
      zalo: "Zalo",
      telegram: "电报",
      enterChoice: "输入1-6:",
    },
    vi: {
      title: "Chia sẻ lại",
      onPlatform: "trên",
      whatsapp: "WhatsApp",
      twitter: "Twitter",
      email: "Email (Webmail)",
      zalo: "Zalo",
      telegram: "Telegram", // ✅ ADD THIS
      enterChoice: "Nhập 1-6:",
    },
    hi: {
      title: "पुनः साझा करें",
      onPlatform: "पर",
      whatsapp: "WhatsApp",
      twitter: "Twitter",
      email: "ईमेल (वेबमेल)",
      zalo: "Zalo",
      telegram: "टेलीग्राम",
      enterChoice: "1-6 दर्ज करें:",
    },
    ar: {
      title: "إعادة مشاركة",
      onPlatform: "على",
      whatsapp: "واتساب",
      twitter: "تويتر",
      email: "البريد الإلكتروني (ويب ميل)",
      zalo: "Zalo",
      telegram: "تيليغرام",
      enterChoice: "أدخل 1-6:",
    },
  },

  confirmations: {
    deleteReport: {
      en: "Permanently delete this report?",
      es: "¿Eliminar permanentemente este informe?",
      zh: "永久删除此报告？",
      vi: "Xóa báo cáo này vĩnh viễn?",
      hi: "इस रिपोर्ट को स्थायी रूप से हटाएं?",
      ar: "حذف هذا التقرير بشكل دائم؟",
    },
    clearAll: {
      en: "Permanently delete ALL saved reports? This cannot be undone.",
      es: "¿Eliminar TODOS los informes guardados? Esto no se puede deshacer.",
      zh: "永久删除所有保存的报告？此操作无法撤消。",
      vi: "Xóa TẤT CẢ báo cáo đã lưu? Không thể hoàn tác.",
      hi: "सभी सहेजे गए रिपोर्ट्स हटाएं? यह कार्रवाई पूर्ववत नहीं की जा सकती।",
      ar: "حذف جميع التقارير المحفوظة؟ لا يمكن التراجع عن هذا.",
    },
  },
  successMessages: {
    clearedAll: {
      en: "All reports cleared successfully",
      es: "Todos los informes eliminados correctamente",
      zh: "所有报告已成功清除",
      vi: "Đã xóa tất cả báo cáo thành công",
      hi: "सभी रिपोर्ट्स सफलतापूर्वक हटाई गईं",
      ar: "تم مسح جميع التقارير بنجاح",
    },
  },

  errorMessages: {
    clearAllFailed: {
      en: "Failed to clear reports",
      es: "Error al eliminar los informes",
      zh: "清除报告失败",
      vi: "Không thể xóa báo cáo",
      hi: "रिपोर्ट्स हटाने में विफल",
      ar: "فشل مسح التقارير",
    },
  },

  mobileEmailPrompt: {
    en: "Choose your email provider:",
    vi: "Chọn nhà cung cấp email của bạn:",
    zh: "选择您的电子邮件提供商：",
    es: "Elija su proveedor de correo electrónico:",
    hi: "अपना ईमेल प्रदाता चुनें:",
    ar: "اختر مزود البريد الإلكتروني الخاص بك:",
  },
  defaultMailApp: {
    en: "Default Mail App",
    vi: "Ứng dụng Mail Mặc định",
    zh: "默认邮件应用",
    es: "Aplicación de Correo Predeterminada",
    hi: "डिफ़ॉल्ट मेल ऐप",
    ar: "تطبيق البريد الافتراضي",
  },

  // B. Report Content Templates
  // Add to TRANSLATION_PATCH in reports.js
  defaultSubject: {
    en: "Shared Report",
    es: "Reporte Compartido",
    zh: "共享报告",
    vi: "Báo cáo được chia sẻ",
    hi: "साझा रिपोर्ट",
    ar: "تقرير مشترك",
  },
  emailShareTitle: {
    en: "Share via Email",
    es: "Compartir por correo",
    zh: "通过邮件分享",
    vi: "Chia sẻ qua email",
    hi: "ईमेल के माध्यम से साझा करें",
    ar: "مشاركة عبر البريد الإلكتروني",
  },
  greetings: {
    en: "Dear friends, I'm sharing this information",
    vi: "Các bạn thân mến, tôi chia sẻ thông tin này",
    ar: "أعزائي الأصدقاء ، أنا أشارك هذه المعلومات",
    es: "Queridos amigos, comparto esta información",
    hi: "प्रिय दोस्तों, मैं यह जानकारी साझा कर रहा हूं",
    zh: "亲爱的朋友们，我分享此信息",
  },
  seeDetails: {
    en: "see details",
    vi: "xem chi tiết",
    ar: "انظر التفاصيل",
    es: "ver detalles",
    hi: "विवरण देखें",
    zh: "查看详情",
  },
  fullDetails: {
    en: "Full details",
    vi: "Chi tiết đầy đủ",
    ar: "تفاصيل كاملة",
    es: "Detalles completos",
    hi: "पूर्ण विवरण",
    zh: "完整详情",
  },
  fieldLabels: {
    emailAddress: {
      en: "Recipient Email",
      es: "Correo del destinatario",
      zh: "收件人邮箱",
      vi: "Email người nhận",
      hi: "प्राप्तकर्ता ईमेल",
      ar: "بريد المستلم",
    },
    message: {
      en: "Message",
      es: "Mensaje",
      zh: "信息",
      vi: "Tin nhắn",
      hi: "संदेश",
      ar: "رسالة",
    },
    subject: {
      en: "Subject",
      es: "Asunto",
      zh: "主题",
      vi: "Chủ đề",
      hi: "विषय",
      ar: "الموضوع",
    },
    title: {
      en: "Title",
      vi: "Tiêu đề",
      ar: "العنوان",
      es: "Título",
      hi: "शीर्षक",
      zh: "标题",
    },
    description: {
      en: "Description",
      vi: "Mô tả",
      ar: "الوصف",
      es: "Descripción",
      hi: "विवरण",
      zh: "描述",
    },
    location: {
      en: "Location",
      vi: "Địa điểm",
      ar: "الموقع",
      es: "Ubicación",
      hi: "स्थान",
      zh: "位置",
    },
    contact: {
      en: "Contact",
      vi: "Liên hệ",
      ar: "الاتصال",
      es: "Contacto",
      hi: "संपर्क",
      zh: "联系方式",
    },
    image: {
      en: "Image",
      vi: "Hình ảnh",
      ar: "صورة",
      es: "Imagen",
      hi: "छवि",
      zh: "图片",
    },
    images: {
      // ← This should be lowercase "images"
      en: "Images",
      vi: "Hình ảnh",
      zh: "图片",
      es: "Imágenes",
      hi: "छवियाँ",
      ar: "الصور",
    },
  },
  placeholders: {
    email: {
      en: "email@example.com",
      es: "correo@ejemplo.com",
      zh: "邮箱@示例.com",
      vi: "email@vidu.com",
      hi: "email@udaharan.com",
      ar: "email@example.com",
    },
  },
  errorMessages: {
    reshareErrorTitle: {
      en: "Reshare Error",
      es: "Error al recompartir",
      zh: "重新分享错误",
      vi: "Lỗi chia sẻ lại",
      hi: "पुनः साझा करने में त्रुटि",
      ar: "خطأ في إعادة المشاركة",
    },
    reshareFailed: {
      en: "Couldn't load report. Please try again.",
      es: "No se pudo cargar el informe. Por favor, inténtelo de nuevo.",
      zh: "无法加载报告。请再试一次。",
      vi: "Không thể tải báo cáo. Vui lòng thử lại.",
      hi: "रिपोर्ट लोड नहीं हो सकी। कृपया पुनः प्रयास करें।",
      ar: "تعذر تحميل التقرير. يرجى المحاولة مرة أخرى.",
    },
  },
  closingLines: {
    event: {
      // Fallback for empty reports
      en: "Please join and share this event.",
      vi: "Xin mời tham gia và chia sẻ sự kiện này",
      es: "Por favor, únase o comparta este evento.",
      zh: "请参加或分享这个活动。",
      hi: "कृपया इस कार्यक्रम में शामिल हों या इसे साझा करें。",
      ar: "من فضلك انضم أو شارك هذا الحدث.",
    },
    missing_person: {
      en: "Please help find. Share widely",
      vi: "Vui lòng giúp tìm kiếm. Chia sẻ rộng rãi",
      ar: "يرجى المساعدة في العثور عليه. انشره على نطاق واسع",
      es: "Por favor, ayude a encontrar. Comparta ampliamente",
      hi: "कृपया खोजने में मदद करें। व्यापक रूप से साझा करें",
      zh: "请帮忙寻找。广泛分享",
    },
    lost_item: {
      en: "Please help locate",
      vi: "Vui lòng tìm giúp",
      ar: "يرجى المساعدة في تحديد الموقع",
      es: "Por favor, ayude a localizar",
      hi: "कृपया स्थान खोजने में मदद करें",
      zh: "请帮忙定位",
    },
    found_person: {
      en: "Please help reunite with family",
      vi: "Vui lòng giúp đoàn tụ với gia đình",
      ar: "يرجى المساعدة في لم الشمل مع الأسرة",
      es: "Por favor, ayude a reunirse con la familia",
      hi: "कृपया परिवार के साथ पुनर्मिलन में मदद करें",
      zh: "请帮助与家人团聚",
    },
    found_item: {
      en: "Please contact if this is yours",
      vi: "Vui lòng liên hệ nếu đây là tài sản của bạn",
      ar: "يرجى الاتصال إذا كان هذا ملكك",
      es: "Por favor, contacte si esto es suyo",
      hi: "अगर यह आपका है तो कृपया संपर्क करें",
      zh: "如果这是您的物品，请联系我们",
    },
    other: {
      en: "Join us. Spread the word",
      vi: "Tham gia cùng chúng tôi. Lan tỏa thông tin",
      ar: "انضم إلينا. انشر الكلمة",
      es: "Únase a nosotros. Corra la voz",
      hi: "हमसे जुड़ें। इसके बारे में बताएं",
      zh: "加入我们。帮忙传播",
    },
    thank_you: {
      en: "Thank you for your assistance",
      vi: "Cảm ơn sự hỗ trợ của bạn",
      ar: "شكرا لكم على مساعدتكم",
      es: "Gracias por su ayuda",
      hi: "आपकी सहायता के लिए धन्यवाद",
      zh: "感谢您的帮助",
    },
    thank_you: {
      en: "Thank you for your assistance",
      vi: "Cảm ơn sự hỗ trợ của bạn",
      ar: "شكرا لكم على مساعدتكم",
      es: "Gracias por su ayuda",
      hi: "आपकी सहायता के लिए धन्यवाद",
      zh: "感谢您的帮助",
    },
  },
  reportSharedVia: {
    en: "Report shared via",
    vi: "Báo cáo được chia sẻ qua",
    ar: "تم مشاركة التقرير عبر",
    es: "Informe compartido a través de",
    hi: "रिपोर्ट इसके माध्यम से साझा की गई",
    zh: "报告通过以下方式分享",
  },
  // Add to your translations object
  yahooDuplicateTip: {
    en: "After sending, look for the 'Show images' button in your Yahoo inbox to view photos. If you receive duplicate emails, it's a Yahoo feature - you can safely ignore the extra copy.",
    vi: "Sau khi gửi, hãy tìm nút 'Hiển thị hình ảnh' trong hộp thư Yahoo để xem ảnh. Nếu bạn nhận được email trùng lặp, đó là tính năng của Yahoo - bạn có thể yên tâm bỏ qua bản sao thêm.",
    zh: "发送后，请在雅虎收件箱中查找“显示图片”按钮以查看照片。如果您收到重复的电子邮件，这是雅虎的功能 - 您可以放心地忽略额外的副本。",
    es: "Después de enviar, busque el botón 'Mostrar imágenes' en su bandeja de entrada de Yahoo para ver las fotos. Si recibe correos electrónicos duplicados, es una función de Yahoo; puede ignorar la copia adicional de manera segura.",
    hi: "भेजने के बाद, फ़ोटो देखने के लिए अपने Yahoo इनबॉक्स में 'छवियाँ दिखाएँ' बटन देखें। यदि आपको डुप्लिकेट ईमेल प्राप्त होते हैं, तो यह एक Yahoo सुविधा है - आप अतिरिक्त प्रतिलिपि को सुरक्षित रूप से अनदेखा कर सकते हैं।",
    ar: "بعد الإرسال، ابحث عن زر 'عرض الصور' في صندوق الوارد الخاص بك في ياهو لمشاهدة الصور. إذا تلقيت رسائل بريد إلكتروني مكررة، فهذه ميزة ياهو - يمكنك تجاهل النسخة الإضافية بأمان.",
  },
  yahooTip: {
    en: "Yahoo Users: After sending, look for the 'Show images' button in your Yahoo inbox to view photos.",
    vi: "Người dùng Yahoo: Sau khi gửi, hãy tìm nút 'Hiển thị hình ảnh' trong hộp thư Yahoo để xem ảnh.",
    zh: "雅虎用户：发送后，请在雅虎收件箱中查找“显示图片”按钮以查看照片。",
    es: "Usuarios de Yahoo: Después de enviar, busque el botón 'Mostrar imágenes' en su bandeja de entrada de Yahoo para ver las fotos.",
    hi: "Yahoo उपयोगकर्ता: भेजने के बाद, फ़ोटो देखने के लिए अपने Yahoo इनबॉक्स में 'छवियाँ दिखाएँ' बटन देखें।",
    ar: "مستخدمو ياهو: بعد الإرسال، ابحث عن زر 'عرض الصور' في صندوق الوارد الخاص بك في ياهو لمشاهدة الصور.",
  },

  telegram: {
    greeting: {
      en: "Hello friends,",
      vi: "Chào các bạn,",
      zh: "大家好，",
      es: "Hola amigos,",
      hi: "नमस्ते दोस्तों,",
      ar: "مرحبا أصدقاء،",
    },
    closing: {
      en: "Please help find. Share widely",
      vi: "Vui lòng giúp tìm kiếm. Chia sẻ rộng rãi",
      zh: "请帮助寻找。广泛分享",
      es: "Por favor ayude a encontrar. Comparta ampliamente",
      hi: "कृपया खोजने में मदद करें। व्यापक रूप से साझा करें",
      ar: "يرجى المساعدة في العثور. شارك على نطاق واسع",
    },
    thankYou: {
      en: "Thank you for your assistance",
      vi: "Cảm ơn sự hỗ trợ của bạn",
      zh: "感谢您的帮助",
      es: "Gracias por su asistencia",
      hi: "आपकी सहायता के लिए धन्यवाद",
      ar: "شكرا لمساعدتكم",
    },
    images: {
      en: "Images",
      vi: "Hình ảnh",
      zh: "图片",
      es: "Imágenes",
      hi: "छवियाँ",
      ar: "الصور",
    },
    viewAll: {
      en: "View all {count} images",
      vi: "Xem tất cả {count} hình ảnh",
      zh: "查看所有{count}张图片",
      es: "Ver todas las {count} imágenes",
      hi: "सभी {count} छवियाँ देखें",
      ar: "عرض جميع الصور {count}",
    },
  },
};
// Single universal tip for all email providers
const universalEmailTip = {
  en: "\n\n📌 TIP: If images don't load, copy this link and paste into Chrome or Safari.",
  vi: "\n\n📌 MẸO: Nếu hình ảnh không tải, hãy sao chép liên kết này và dán vào Chrome hoặc Safari.",
  zh: "\n\n📌 提示：如果图片无法加载，请复制此链接并粘贴到Chrome或Safari浏览器中。",
  es: "\n\n📌 CONSEJO: Si las imágenes no cargan, copie este enlace y péguelo en Chrome o Safari.",
  hi: "\n\n📌 टिप: यदि छवियाँ लोड नहीं होती हैं, तो इस लिंक को कॉपी करें और Chrome या Safari में पेस्ट करें।",
  ar: "\n\n📌 تلميح: إذا لم يتم تحميل الصور، انسخ هذا الرابط والصقه في كروم أو سفاري۔",
};

const FACEBOOK_NOTICE_TRANSLATIONS = {
  en: {
    title: "Facebook Sharing Notice",
    message:
      "If you see a spinning circle or 'Facebook Page Not Found' message, you can safely ignore it. Your post will still appear on Facebook. Just continue to the Facebook app to see your shared post.",
    button: "Got it, don't show again",
    showAgain: "Show this tip again",
  },
  vi: {
    title: "Thông báo chia sẻ Facebook",
    message:
      "Nếu bạn thấy vòng tròn quay hoặc thông báo 'Không tìm thấy Trang Facebook', bạn có thể bỏ qua nó. Bài đăng của bạn vẫn sẽ xuất hiện trên Facebook. Chỉ cần tiếp tục vào ứng dụng Facebook để xem bài đăng đã chia sẻ.",
    button: "Đã hiểu, đừng hiển thị lại",
    showAgain: "Hiển thị mẹo này lại",
  },
  zh: {
    title: "Facebook 分享通知",
    message:
      "如果您看到旋转圆圈或'未找到 Facebook 页面'消息，您可以安全地忽略它。您的帖子仍会出现在 Facebook 上。只需继续到 Facebook 应用查看您分享的帖子。",
    button: "明白了，不再显示",
    showAgain: "再次显示此提示",
  },
  es: {
    title: "Aviso de Compartir en Facebook",
    message:
      "Si ves un círculo girando o el mensaje 'Página de Facebook no encontrada', puedes ignorarlo con seguridad. Tu publicación aún aparecerá en Facebook. Solo continúa a la aplicación de Facebook para ver tu publicación compartida.",
    button: "Entendido, no mostrar de nuevo",
    showAgain: "Mostrar este consejo nuevamente",
  },
  hi: {
    title: "फेसबुक शेयरिंग नोटिस",
    message:
      "यदि आपको एक घूमता हुआ चक्र या 'फेसबुक पेज नहीं मिला' संदेश दिखाई देता है, तो आप इसे सुरक्षित रूप से नजरअंदाज कर सकते हैं। आपकी पोस्ट अभी भी फेसबुक पर दिखाई देगी। बस साझा की गई पोस्ट देखने के लिए फेसबुक ऐप पर जारी रखें।",
    button: "समझ गया, फिर से न दिखाएं",
    showAgain: "इस टिप को फिर से दिखाएं",
  },
  ar: {
    title: "إشعار مشاركة الفيسبوك",
    message:
      "إذا رأيت دائرة تدور أو رسالة 'صفحة الفيسبوك غير موجودة'، يمكنك تجاهلها بأمان. سيظل منشورك يظهر على الفيسبوك. فقط تابع إلى تطبيق الفيسبوك لرؤية منشورك المشترك.",
    button: "فهمت، لا تظهر مرة أخرى",
    showAgain: "إظهار هذه النصيحة مرة أخرى",
  },
};

// Add these functions somewhere after your other helper functions:

function showFacebookSharingNotice() {
  // Check if user has already dismissed this notice
  const hasDismissed =
    localStorage.getItem("facebookNoticeDismissed") === "true";
  if (hasDismissed) return;

  // Get current language
  const lang = localStorage.getItem("userLanguage") || "en";
  const translations =
    FACEBOOK_NOTICE_TRANSLATIONS[lang] || FACEBOOK_NOTICE_TRANSLATIONS.en;

  // Create popup container
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

  // Create content
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

  // Add overlay
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

  // Add to page
  document.body.appendChild(overlay);
  document.body.appendChild(popup);

  // Add event listeners
  document
    .getElementById("close-facebook-notice")
    .addEventListener("click", () => {
      const dontShowAgain = document.getElementById("dont-show-again").checked;
      if (dontShowAgain) {
        localStorage.setItem("facebookNoticeDismissed", "true");
      }
      document.body.removeChild(popup);
      document.body.removeChild(overlay);
    });

  overlay.addEventListener("click", () => {
    const dontShowAgain = document.getElementById("dont-show-again").checked;
    if (dontShowAgain) {
      localStorage.setItem("facebookNoticeDismissed", "true");
    }
    document.body.removeChild(popup);
    document.body.removeChild(overlay);
  });
}

function showNoticeBeforeFacebookShare() {
  // Show notice only for Facebook sharing
  if (!localStorage.getItem("facebookNoticeDismissed")) {
    setTimeout(() => {
      showFacebookSharingNotice();
    }, 500);
  }
}

// In reports.js, after TRANSLATION_PATCH definition
console.log(
  "[Final Verification] Success Translations:",
  JSON.stringify(TRANSLATION_PATCH.successMessages.clearedAll, null, 2),
);

// ▼ Add this after TRANSLATION_PATCH but before any functions that use it ▼
// ▼▼▼ SINGLE LANGUAGE CHANGE HANDLER ▼▼▼
// ============================================
// 4. handleLanguageChange() - MODIFIED with routing and retry
// ============================================
function handleLanguageChange(lang) {
  const user = window.fb?.auth?.currentUser;
  if (!user) {
    console.log("⚠️ User not signed in - routing to signed-out handler");
    handleSignedOutLanguageChange(lang);
    return;
  }

  // ============================================
  // SIGNED-IN USER CODE (YOUR ORIGINAL CODE)
  // ============================================

  console.log("=== 🔍 LANGUAGE CHANGE DEBUG START ===");
  console.log("Called with language:", lang);

  // Capture current state
  const beforeState = {
    title: document.getElementById("report-title")?.value || "",
    type: document.getElementById("report-type")?.value || "",
    description: document.getElementById("report-description")?.value || "",
    location: document.getElementById("location-text-input")?.value || "",
    contact: document.getElementById("reporter-contact")?.value || "",
    currentTab: document.querySelector(".tab.active")?.dataset.tab,
    savedReportsCount: document.querySelectorAll(
      "#saved-reports-container .report-item",
    ).length,
  };

  try {
    localStorage.setItem("preLanguageChangeState", JSON.stringify(beforeState));
  } catch (error) {
    console.warn("Could not save language state:", error);
  }

  localStorage.setItem("userLanguage", lang);
  window.currentLanguage = lang;

  // Update UI
  applyTranslations();
  updateLogoutButton();
  updatePatchedTranslations();
  updateShareHeading();
  updateFileInputDisplay();
  translateSavedReportsLabel();
  updateAllWarnings();
  updateLocationButtonText();
  updateDashboardIntro();
  if (typeof translateDropdown === "function") translateDropdown(); // <-- ADD THIS

  setTimeout(() => {
    if (typeof window.renderSavedReports === "function") {
      window.renderSavedReports();
    }
  }, 200);

  const selector = document.getElementById("language-switcher");
  if (selector) selector.value = lang;
  const userSelector = document.getElementById("usersLanguageSwitcher");
  if (userSelector) userSelector.value = lang;

  // Restore form state
  let attempt = 1;
  const maxAttempts = 10;

  function restoreState() {
    const elements = {
      title: document.getElementById("report-title"),
      type: document.getElementById("report-type"),
    };

    if (elements.title && elements.type) {
      const savedState = JSON.parse(
        localStorage.getItem("preLanguageChangeState") || "{}",
      );
      elements.title.value = savedState.title || "";
      elements.type.value = savedState.type || "";
      document.getElementById("report-description").value =
        savedState.description || "";
      document.getElementById("location-text-input").value =
        savedState.location || "";
      document.getElementById("reporter-contact").value =
        savedState.contact || "";
      return true;
    } else if (attempt < maxAttempts) {
      attempt++;
      setTimeout(restoreState, 200);
      return false;
    }
    return false;
  }

  setTimeout(restoreState, 300);

  // Retry translations after 200ms
  setTimeout(() => {
    if (typeof applyTranslations === "function") applyTranslations();
    if (typeof updatePatchedTranslations === "function")
      updatePatchedTranslations();
    if (typeof updateAllWarnings === "function") updateAllWarnings();
    if (typeof updateFormPlaceholders === "function")
      updateFormPlaceholders(lang);
  }, 200);

  console.log("=== ✅ LANGUAGE CHANGE COMPLETE ===");
}

// ============================================
// 5. handleSignedOutLanguageChange() - NEW with retry
// ============================================
function handleSignedOutLanguageChange(newLang) {
  console.log("📢 Handling signed-out language change to:", newLang);

  localStorage.setItem("userLanguage", newLang);
  localStorage.setItem("appLanguage", newLang);
  window.currentLanguage = newLang;

  document
    .querySelectorAll("#language-switcher, #usersLanguageSwitcher")
    .forEach((sel) => {
      if (sel) sel.value = newLang;
    });

  if (typeof window.applySignedOutTranslations === "function") {
    window.applySignedOutTranslations();
    // Retry after 200ms
    setTimeout(() => {
      window.applySignedOutTranslations();
    }, 200);
    // Retry again after 500ms for safety
    setTimeout(() => {
      window.applySignedOutTranslations();
    }, 500);
  }
}

// Connect language selectors
function setupLanguageSelectors() {
  const ids = ["language-switcher", "usersLanguageSwitcher"];
  ids.forEach((id) => {
    const select = document.getElementById(id);
    if (select) {
      select.addEventListener("change", function () {
        handleLanguageChange(this.value);
      });
      console.log(`✅ Connected ${id}`);
    }
  });
}

// Run when page loads
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", setupLanguageSelectors);
} else {
  setupLanguageSelectors();
}
// Add this function to update the intro text
function updateDashboardIntro() {
  const introText = document.getElementById("intro-text");
  const lang = localStorage.getItem("appLanguage") || "en";

  if (introText && TRANSLATION_PATCH.dashboardIntro) {
    introText.textContent =
      TRANSLATION_PATCH.dashboardIntro[lang] ||
      TRANSLATION_PATCH.dashboardIntro.en;
  }
}

// Call this function when the page loads and when language changes
document.addEventListener("DOMContentLoaded", updateDashboardIntro);
// Also call it after your applyTranslations() function runs

function updateLocationButtonText() {
  const btn = document.querySelector('[onclick*="useCurrentLocation"]');
  if (btn) {
    const isLoading = btn.innerHTML.includes("fa-spinner");
    if (!isLoading) {
      // Use our direct translation method
      const lang =
        localStorage.getItem("appLanguage") ||
        localStorage.getItem("userLanguage") ||
        "en";
      const buttonTranslations = {
        en: "Use My Location",
        vi: "Dùng vị trí của tôi",
        ar: "استخدم موقعي",
        es: "Usar mi ubicación",
        hi: "میرا موقع استعمال کریں", // Corrected Hindi translation
        zh: "使用我的位置",
      };
      btn.textContent = buttonTranslations[lang] || buttonTranslations.en;
    }
  }
}

// Initialize button texts on first load
document.addEventListener("DOMContentLoaded", () => {
  if (document.querySelector(".saved-reports-container")) {
    setTimeout(handleLanguageChange, 100);
  }
});

// ▼ Add this after TRANSLATION_PATCH ▼
let lastButtonUpdate = null;

// ▼ ADD THIS NEW FUNCTION RIGHT HERE ▼

function debugButtonStates(action) {
  const lang = window.currentLanguage || "en";
  console.group(`Button Debug (${action})`);
  console.log("Current language:", lang);
  console.log("Available translations:", {
    reshare: TRANSLATION_PATCH.buttons.reshare[lang],
    delete: TRANSLATION_PATCH.buttons.delete[lang],
  });
  document.querySelectorAll(".reshare-btn, .delete-btn").forEach((btn) => {
    console.log(
      "Button:",
      btn.className,
      "Text:",
      btn.querySelector(".btn-text")?.textContent,
    );
  });
  console.groupEnd();
}

// Add this after TRANSLATION_PATCH declaration
function verifyTranslationResources() {
  if (window.TRANSLATION_PATCH && window.currentLanguage) {
    console.log("Resources confirmed loaded");
  }
}

// Call after language initialization
setTimeout(verifyTranslationResources, 1000); // ◀◀◀ 1-second safety check

// ▼▼▼ ADD THIS RIGHT AFTER YOUR TRANSLATION_PATCH ▼▼▼
function translateButtons() {
  const lang = window.currentLanguage || "en";
  // Translate Submit Button (using your existing popups.submitReportBtn)
  const submitBtn = document.querySelector('button[type="submit"]');
  if (submitBtn) {
    submitBtn.textContent =
      TRANSLATION_PATCH.popups?.submitReportBtn?.[lang] || "Submit Report";
  }
  // Translate "Save Report" button (target by ID)
  const saveBtn = document.getElementById("save-report-btn");
  if (saveBtn) {
    saveBtn.innerHTML = `<i class="fas fa-save"></i> ${
      TRANSLATION_PATCH.buttons.saveReport[lang] || "Save Report"
    }`;
  }

  // ✅ ADD THIS: Translate Subscribe Button
  const subscribeBtn = document.getElementById("subscribeBtn");
  if (subscribeBtn) {
    const span = subscribeBtn.querySelector("span");
    if (span) {
      span.textContent =
        TRANSLATION_PATCH.buttons?.subscribe?.[lang] || "Subscribe";
    }
  }

  // Translate STATIC buttons/labels
  const elements = {
    clearAllBtn: { selector: ".clear-all-btn", key: "clearAllBtn" }, // Matches your existing key
    savedReportsLabel: {
      selector: ".saved-reports-label",
      key: "savedReports",
    },
  };

  // Update dynamic buttons (if already rendered)
  document.querySelectorAll(".reshare-btn .btn-text").forEach((el) => {
    el.textContent = TRANSLATION_PATCH.buttons.reshare[lang] || "Reshare";
  });
  document.querySelectorAll(".delete-btn .btn-text").forEach((el) => {
    el.textContent = TRANSLATION_PATCH.buttons.delete[lang] || "Delete";
  });

  Object.values(elements).forEach(({ selector, key }) => {
    document.querySelectorAll(selector).forEach((el) => {
      el.textContent =
        TRANSLATION_PATCH.buttons?.[key]?.[lang] || // Check buttons first (e.g., clearAllBtn)
        TRANSLATION_PATCH.labels?.[key]?.[lang] || // Fallback to labels (e.g., savedReports)
        el.textContent; // Ultimate fallback
    });
  });
}

// Add this after deletions
// ▼ REPLACE your current deletion handler with this ▼
// Original handleReportDeletion
function handleReportDeletion(reportId) {
  setTimeout(refreshAllButtons, 50);

  if (!confirm(TRANSLATION_PATCH.confirmDelete[window.currentLanguage])) return;

  db.collection("reports")
    .doc(reportId)
    .delete()
    .then(() => {
      loadSavedReports().then(() => {
        setTimeout(() => {
          document
            .querySelectorAll(".reshare-btn, .delete-btn")
            .forEach((btn) => {
              btn.textContent = btn.classList.contains("reshare-btn")
                ? BUTTON_TEXTS.reshare[currentLang]
                : BUTTON_TEXTS.delete[currentLang];
            });
        }, 50);
      });
    });
}

// ▲▲▲ END OF NEW FUNCTION ▲▲▲

// Fallback function for non-Web-Share-API browsers
function fallbackShare(content) {
  // Example: Open mailto link
  const mailtoLink = `mailto:?subject=${encodeURIComponent(
    content.title,
  )}&body=${encodeURIComponent(content.text)}`;
  window.open(mailtoLink, "_blank");
}

// ▼▼▼ ADD THIS SAFE TRANSLATION FUNCTION ▼▼▼
const getTranslation = (obj, fallback = "") => {
  try {
    if (!obj) return fallback;
    const lang = localStorage.getItem("userLanguage") || "en";
    return obj[lang] || obj.en || Object.values(obj)[0] || fallback;
  } catch {
    return fallback;
  }
};
// ▲▲▲ END OF ADDITION ▲▲▲
function updatePatchedTranslations() {
  try {
    const lang = window.currentLanguage || "en";
    if (!TRANSLATION_PATCH) return;

    document.querySelectorAll("[data-translate]").forEach((el) => {
      // SKIP dropdown options - they are handled by translateDropdown()
      if (el.parentElement?.id === "report-type" || el.tagName === "OPTION") {
        return;
      }

      const key = el.getAttribute("data-translate");
      const translation = TRANSLATION_PATCH[key]?.[lang] || el.textContent;
      el.textContent = translation;
    });
  } catch (e) {
    console.error("Translation error:", e);
  }
}

// Initialize patch translations

// Add this to your existing initialization (DOMContentLoaded)
function updateShareHeading() {
  const heading = document.getElementById("share-subheading");
  if (!heading) return;

  const lang =
    localStorage.getItem("appLanguage") ||
    localStorage.getItem("userLanguage") ||
    "en";
  heading.textContent =
    TRANSLATION_PATCH.uiTexts.shareSubheading[lang] ||
    TRANSLATION_PATCH.uiTexts.shareSubheading.en;
}

// Call it with other translations

document.getElementById("language-switcher")?.addEventListener("change", () => {
  setTimeout(() => {
    updateDashboardButton(); // Add this line
    updateLogoutButton(); // Existing
    updatePatchedTranslations(); // New
  }, 300);
});
// ===== FILE INPUT TRANSLATION PATCH ===== //
// ===== POPUP TRANSLATIONS ===== //
const POPUP_TEXTS = {
  copiedToClipboard: {
    en: "Copied to clipboard",
    vi: "Đã sao chép vào bộ nhớ tạm",
    ar: "تم النسخ إلى الحافظة",
    es: "Copiado al portapapeles",
    hi: "क्लिपबोर्ड पर कॉपी किया गया",
    zh: "已复制到剪贴板",
  },
};
// ===== LOCATION FIELD TRANSLATIONS ===== //
const LOCATION_FIELD_TEXTS = {
  specificPlace: {
    en: "Specific place",
    vi: "Địa điểm cụ thể",
    ar: "مكان محدد",
    es: "Lugar específico",
    hi: "विशिष्ट स्थान",
    zh: "具体地点",
  },
  searchAddress: {
    en: "Search address",
    vi: "Tìm kiếm địa chỉ",
    ar: "بحث عن العنوان",
    es: "Buscar dirección",
    hi: "पता खोजें",
    zh: "搜索地址",
  },
};

// ===== TITLE EXAMPLE TRANSLATIONS ===== //
const TITLE_EXAMPLE_TEXTS = {
  titleExample: {
    en: "e.g. Missing boy, Lost wallet",
    vi: "vd. Bé trai mất tích, Ví bị mất",
    ar: "مثال: طفل مفقود، محفظة ضائعة",
    es: "ej. Niño perdido, Billetera perdida",
    hi: "जैसे: लापता लड़का, खोया हुआ बटुआ",
    zh: "例如：失踪男孩，丢失的钱包",
  },
};

// ===== FILE INPUT TRANSLATION ===== //
const FILE_INPUT_TEXTS = {
  chooseFile: {
    en: "Choose file",
    vi: "Chọn tệp",
    ar: "اختر ملفًا",
    es: "Elegir archivo",
    hi: "फ़ाइल चुनें",
    zh: "选择文件",
  },
  noFile: {
    en: "No file chosen",
    vi: "Chưa chọn tệp",
    ar: "لم يتم اختيار ملف",
    es: "Ningún archivo seleccionado",
    hi: "कोई फ़ाइल नहीं चुनी",
    zh: "未选择文件",
  },
};

function updateTitleExamplePlaceholder() {
  const lang = localStorage.getItem("userLanguage") || "en";
  const titleInput = document.getElementById("report-title");

  if (titleInput) {
    titleInput.placeholder = TITLE_EXAMPLE_TEXTS.titleExample[lang];
  }
}

function updateLocationFieldPlaceholders() {
  const lang = localStorage.getItem("userLanguage") || "en";

  // Update "Specific place" input
  const specificPlaceInput = document.getElementById("location-text-input");
  if (specificPlaceInput) {
    specificPlaceInput.placeholder = LOCATION_FIELD_TEXTS.specificPlace[lang];
  }

  // Update "Search address" input
  const searchAddressInput = document.getElementById("address-input");
  if (searchAddressInput) {
    searchAddressInput.placeholder = LOCATION_FIELD_TEXTS.searchAddress[lang];
  }
}

function updateFileInputDisplay() {
  const fileInput = document.getElementById("report-image");
  const label = document.getElementById("file-input-label");
  const lang = localStorage.getItem("userLanguage") || "en";

  if (fileInput && label) {
    // Update text based on selection
    if (fileInput.files.length > 0) {
      label.textContent = fileInput.files[0].name;
    } else {
      label.textContent = `${FILE_INPUT_TEXTS.chooseFile[lang]} • ${FILE_INPUT_TEXTS.noFile[lang]}`;
    }
  }
}

// SIMPLIFIED VERSION - Add this to reports.js
function translateDropdown() {
  // 🔒 GUARD: Prevent infinite loop
  if (window._translationLock) {
    console.log("⚠️ Translation already in progress, skipping...");
    return;
  }
  window._translationLock = true;

  try {
    const lang =
      window.currentLanguage || localStorage.getItem("appLanguage") || "en";

    console.log("🔄 translateDropdown() called for language:", lang);

    // ============================================
    // 1. Translate the dropdown (if it exists)
    // ============================================
    const dropdown = document.getElementById("report-type");
    if (dropdown && dropdown.options) {
      console.log("📋 Translating dropdown options...");
      try {
        Array.from(dropdown.options).forEach((option) => {
          const value = option.value;

          if (value === "") {
            if (TRANSLATION_PATCH.reportTypes?.select?.[lang]) {
              option.textContent = TRANSLATION_PATCH.reportTypes.select[lang];
            }
            return;
          }

          if (value && TRANSLATION_PATCH.reportTypes?.[value]?.[lang]) {
            let emoji = "";
            if (value === "missing_person") emoji = "🚨 ";
            else if (value === "lost_item") emoji = "🔍 ";
            else if (value === "found_person") emoji = "🙏 ";
            else if (value === "found_item") emoji = "🔄 ";
            else if (value === "event") emoji = "🎉 ";

            option.textContent =
              emoji + TRANSLATION_PATCH.reportTypes[value][lang];
          }
        });
      } catch (e) {
        console.log("⚠️ Error translating dropdown:", e);
      }
    }

    // ============================================
    // 2. Translate icon buttons
    // ============================================
    const iconButtons = document.querySelectorAll(".type-btn");
    if (iconButtons.length > 0) {
      console.log("🎨 Translating icon buttons...");
      iconButtons.forEach((btn) => {
        try {
          const type = btn.dataset.type;
          if (type && TRANSLATION_PATCH.reportTypes?.[type]?.[lang]) {
            const label = btn.querySelector(".type-label");
            if (label) {
              label.textContent = TRANSLATION_PATCH.reportTypes[type][lang];
            }
          }
        } catch (e) {
          console.log("⚠️ Error translating button:", e);
        }
      });
    }

    // ============================================
    // 3. Translate form labels
    // ============================================
    try {
      const labelMap = {
        reportTypeLabel: "reportTypeLabel",
        titleLabel: "titleLabel",
        descriptionLabel: "descriptionLabel",
        locationLabel: "locationLabel",
        contactLabel: "contactLabel",
      };

      Object.keys(labelMap).forEach((id) => {
        const el = document.getElementById(id);
        if (el && TRANSLATION_PATCH[labelMap[id]]?.[lang]) {
          el.textContent = TRANSLATION_PATCH[labelMap[id]][lang];
        }
      });
    } catch (e) {
      console.log("⚠️ Error translating labels:", e);
    }

    // ============================================
    // 4. Translate "Show on Map" button
    // ============================================
    try {
      const showOnMapBtn = document.getElementById("showOnMapBtn");
      if (showOnMapBtn && TRANSLATION_PATCH.buttons?.showOnMap?.[lang]) {
        showOnMapBtn.textContent = TRANSLATION_PATCH.buttons.showOnMap[lang];
      }
    } catch (e) {
      console.log("⚠️ Error translating showOnMap button:", e);
    }

    console.log("✅ translateDropdown() completed");
  } finally {
    // ✅ Release the lock at the END of the function
    window._translationLock = false;
  }
}

function translateSavedReportsLabel() {
  const lang = window.currentLanguage || "en";
  const label = document.getElementById("saved-reports-heading");
  if (label && TRANSLATION_PATCH.labels.savedReports[lang]) {
    label.textContent = TRANSLATION_PATCH.labels.savedReports[lang];
  }
}

// ▼▼▼ Add this with translateDropdown(), translateSavedReportsLabel(), etc. ▼▼▼
function updateAllWarnings() {
  const lang = window.currentLanguage || "en";
  document.querySelectorAll("[data-warning]").forEach((el) => {
    const key = el.getAttribute("data-warning");
    el.textContent = TRANSLATION_PATCH.warnings[key]?.[lang] || key;
  });
}

// ▼▼▼ INITIALIZE ON PAGE LOAD ▼▼▼

// Example: Connect to language switcher (if exists)
const languageSwitcher = document.querySelector(".language-switcher");
if (languageSwitcher) {
  languageSwitcher.addEventListener("change", (e) => {
    handleLanguageChange(e.target.value);
  });
}

// Initialize

// Update on language change
document.getElementById("language-switcher")?.addEventListener("change", () => {
  setTimeout(updateFileInputDisplay, 300);

  // ✅ ADD THIS - Reload saved reports after language change
  setTimeout(() => {
    if (typeof window.renderSavedReports === "function") {
      console.log("🔄 Reloading saved reports after language change");
      window.renderSavedReports();
    }
  }, 400);
});

// ===== ENHANCED ERROR DISPLAY ===== //
// ===== ONLY REPLACE THIS FUNCTION ===== //
function showAddressError() {
  // 1. Get language (with verification)
  const lang = (localStorage.getItem("userLanguage") || "en").split("-")[0];
  console.log("[LANG] Current:", lang); // Verify in browser console

  // 2. Hardcoded translations
  const translations = {
    en: "Error: Address not found",
    vi: "Lỗi: Không tìm thấy địa chỉ",
    ar: "خطأ: العنوان غير موجود",
    es: "Error: Dirección no encontrada",
    hi: "त्रुटि: पता नहीं मिला",
    zh: "错误：未找到地址",
  };

  // 3. Create error popup (pure JavaScript - no dependencies)
  const popup = document.createElement("div");
  popup.id = "custom-address-error";
  popup.style.cssText = `
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    padding: 12px 24px;
    background: #4CAF50;
    color: white;
    border-radius: 4px;
    z-index: 9999;
    font-family: Arial;
    box-shadow: 0 3px 6px rgba(0,0,0,0.16);
    animation: fadeIn 0.3s;
  `;
  popup.textContent = translations[lang] || translations.en;
  document.body.appendChild(popup);

  // 4. Auto-remove after 5 seconds
  setTimeout(() => popup.remove(), 5000);
}
// ===== ADD THIS AT THE BOTTOM OF reports.js ===== //
function showSaveSuccess() {
  // Remove any existing popups first
  const oldPopups = document.querySelectorAll("#save-success-popup");
  oldPopups.forEach((popup) => popup.remove());

  // Get language
  const lang = (localStorage.getItem("userLanguage") || "en").split("-")[0];

  // Translations
  const messages = {
    en: "Report saved successfully",
    vi: "Đã lưu báo cáo thành công",
    ar: "تم حفظ التقرير بنجاح",
    es: "Informe guardado correctamente",
    hi: "रिपोर्ट सफलतापूर्वक सहेजी गई",
    zh: "报告保存成功",
  };

  // Create popup
  const popup = document.createElement("div");
  popup.id = "save-success-popup";
  popup.style.cssText = `
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    padding: 12px 24px;
    background: #4CAF50;
    color: white;
    border-radius: 4px;
    z-index: 9999;
    font-family: Arial;
    box-shadow: 0 3px 6px rgba(0,0,0,0.16);
  `;
  popup.textContent = messages[lang] || messages.en;
  document.body.appendChild(popup);

  // Auto-remove after 3 seconds
  setTimeout(() => popup.remove(), 3000);
}

/****** [4] BOTTOM OF FILE ******/
// ▼ ONLY KEEP THIS (REMOVE OTHERS) ▼
document.addEventListener("DOMContentLoaded", function () {
  initializeApp();
  setupSubscribeButton(); // Add this line
});
// ▼ Add this as the LAST CODE BLOCK in your file ▼
(function () {
  const buttonTexts = {
    vi: { reshare: "Chia Sẻ Lại", delete: "Xóa" },
    en: { reshare: "Reshare", delete: "Delete" },
    es: { reshare: "Volver a compartir", delete: "Eliminar" },
    zh: { reshare: "重新分享", delete: "删除" }, // Chinese
    hi: { reshare: "पुनः साझा करें", delete: "हटाएं" }, // Hindi
    ar: { reshare: "إعادة مشاركة", delete: "حذف" }, // Arabic
    // Add other languages if needed
  };

  const buttonObserver = new MutationObserver((mutations) => {
    const lang = window.currentLanguage || "en";
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === 1 && node.querySelector) {
          const buttons = node.querySelectorAll(".reshare-btn, .delete-btn");
          buttons.forEach((btn) => {
            const type = btn.classList.contains("reshare-btn")
              ? "reshare"
              : "delete";
            btn.textContent = buttonTexts[lang]?.[type] || buttonTexts.en[type];
          });
        }
      });
    });
  });

  // Auto-start when DOM is ready
  if (document.readyState !== "loading") {
    initObserver();
  } else {
    document.addEventListener("DOMContentLoaded", initObserver);
  }

  function initObserver() {
    const container = document.getElementById("saved-reports-container");
    if (container) {
      buttonObserver.observe(container, {
        childList: true,
        subtree: true,
      });
      console.log("Button translation observer activated");
    }
  }
})();

// ============================================
// MASTER UI UPDATE FUNCTION
// ============================================

function updateAllUI() {
  const lang =
    localStorage.getItem("appLanguage") ||
    localStorage.getItem("userLanguage") ||
    "en";
  console.log("🔄 Updating ALL UI for language:", lang);

  // 1. Update warnings
  if (typeof updateAllWarnings === "function") {
    updateAllWarnings();
  }

  // 2. Update form placeholders
  if (typeof updateFormPlaceholders === "function") {
    updateFormPlaceholders(lang);
  }

  updateFileInputLabel();

  // 3. Update dashboard button
  if (typeof updateDashboardButton === "function") {
    updateDashboardButton();
  }

  // 4. Update share heading
  const shareHeading = document.getElementById("share-subheading");
  if (shareHeading) {
    const headings = {
      en: "Share This Report",
      vi: "Chia sẻ báo cáo này",
      zh: "分享此报告",
      es: "Compartir este informe",
      hi: "यह रिपोर्ट साझा करें",
      ar: "مشاركة هذا التقرير",
    };
    shareHeading.textContent = headings[lang] || headings.en;
  }

  // 5. Update location button
  const locationBtn = document.querySelector('[onclick*="useCurrentLocation"]');
  if (locationBtn) {
    const texts = {
      en: "Use My Location",
      vi: "Dùng vị trí của tôi",
      zh: "使用我的位置",
      es: "Usar mi ubicación",
      hi: "मेरा स्थान उपयोग करें",
      ar: "استخدم موقعي",
    };
    const span = locationBtn.querySelector("span");
    if (span) {
      span.textContent = texts[lang] || texts.en;
    } else {
      locationBtn.textContent = texts[lang] || texts.en;
    }
  }

  // 6. Update file label (if no files selected)
  const fileInput = document.getElementById("report-image");
  const fileLabel = document.querySelector(".file-input-text");
  if (fileLabel && fileInput && fileInput.files.length === 0) {
    const labels = {
      en: "Choose files (max 5)",
      vi: "Chọn tệp (tối đa 5)",
      zh: "选择文件（最多5个）",
      es: "Elegir archivos (máx. 5)",
      hi: "फ़ाइलें चुनें (अधिकतम 5)",
      ar: "اختر الملفات (5 كحد أقصى)",
    };
    fileLabel.textContent = labels[lang] || labels.en;
  }

  console.log("✅ UI update complete");
}

// Call on page load
document.addEventListener("DOMContentLoaded", function () {
  setTimeout(updateAllUI, 100);
  // Force update placeholders on page load
  setTimeout(function () {
    updateFormPlaceholders();
    updateFileInputLabel();
  }, 500);
});

// Make available globally
window.updateAllUI = updateAllUI;

// ============================================
// END OF MASTER UI UPDATE FUNCTION
// ============================================

// AT THE VERY END OF reports.js, ADD:
window.TRANSLATION_PATCH = TRANSLATION_PATCH;
console.log("Translations loaded:", Object.keys(TRANSLATION_PATCH));

// === DEBUG FUNCTIONS - ADD AT BOTTOM OF reports.js ===
// === DEBUG FUNCTIONS - ADD AT VERY BOTTOM OF reports.js ===

// Add this function FIRST - before debugPremiumCheck
function showUpgradePrompt() {
  const lang = localStorage.getItem("userLanguage") || "en";
  const upgradeMessages = {
    en: "You've reached the free limit of 5 reports. Would you like to subscribe to unlock unlimited reports and premium features?",
    vi: "Bạn đã đạt giới hạn miễn phí 5 báo cáo. Bạn có muốn đăng ký để mở khóa báo cáo không giới hạn và các tính năng cao cấp?",
    zh: "您已达到5个报告的免费限制。是否要订阅以解锁无限报告和高级功能？",
    es: "Has alcanzado el límite gratuito de 5 informes. ¿Te gustaría suscribirte para desbloquear informes ilimitados y funciones premium?",
    hi: "आप 5 रिपोर्टों की मुफ्त सीमा तक पहुँच गए हैं। क्या आप असीमित रिपोर्ट और प्रीमियम सुविधाएँ अनलॉक करने के लिए सदस्यता लेना चाहेंगे?",
    ar: "لقد وصلت إلى الحد المجاني البالغ 5 تقارير. هل ترغب في الاشتراك لفتح التقارير غير المحدودة والميزات المتميزة؟",
  };

  if (confirm(upgradeMessages[lang] || upgradeMessages.en)) {
    window.open("./premium-iap.html", "_blank");
  }
}

// Safe debug function
async function debugPremiumCheck() {
  try {
    const user = window.fb.auth.currentUser;
    console.log("=== PREMIUM SYSTEM DEBUG ===");

    if (user) {
      console.log("User:", user.uid, user.email);

      // SAFE premium check
      let isPremium = false;
      if (
        window.premiumManager &&
        typeof window.premiumManager.checkUserPremium === "function"
      ) {
        isPremium = await window.premiumManager.checkUserPremium(user.uid);
      } else {
        console.log("ℹ️ Premium manager not available in main app context");
      }
      console.log("Premium status:", isPremium);

      // Test saved reports count
      const savedReports =
        JSON.parse(localStorage.getItem("savedReports")) || [];
      console.log("Saved reports count:", savedReports.length);

      // Test the limit logic
      if (!isPremium && savedReports.length >= 5) {
        console.log("🚫 Upgrade would be required");
      } else {
        console.log("✅ Can save reports");
      }
    } else {
      console.log("No user logged in");

      // Safe test with fallback
      let testPremium = false;
      if (
        window.premiumManager &&
        typeof window.premiumManager.checkUserPremium === "function"
      ) {
        testPremium =
          await window.premiumManager.checkUserPremium("test_user_123");
      }
      console.log("Test user premium status:", testPremium);
    }
  } catch (error) {
    console.error("Debug error:", error);
  }
}

// Simple subscribe button handler - in main app
function setupSubscribeButton() {
  const subscribeBtn = document.getElementById("subscribeBtn");
  if (subscribeBtn) {
    // Remove any existing event listeners
    const newBtn = subscribeBtn.cloneNode(true);
    subscribeBtn.parentNode.replaceChild(newBtn, subscribeBtn);

    newBtn.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();

      // Open in new tab - completely separate
      window.open("./premium-iap.html", "_blank");
    });
  }
}

// Initialize subscribe button when DOM is ready
document.addEventListener("DOMContentLoaded", function () {
  setupSubscribeButton();
  // === ADD THIS LINE ===
  setupImageUploadHandler();
});

// Make it globally available
window.debugPremiumCheck = debugPremiumCheck;
window.showUpgradePrompt = showUpgradePrompt;
console.log(
  "Debug: debugPremiumCheck() and showUpgradePrompt() available - run in console",
);

// === ADD THIS AT THE VERY END OF reports.js ===

// Image Upload Handler for file selection and previews
function setupImageUploadHandler() {
  let fileInput = document.getElementById("report-image");
  const fileLabel = document.getElementById("file-input-label");

  if (!fileInput || !fileLabel) {
    console.log("❌ File input elements not found");
    return;
  }

  console.log("✅ Setting up image upload handler in reports.js");

  // Remove any existing event listeners by cloning
  const newFileInput = fileInput.cloneNode(true);
  fileInput.parentNode.replaceChild(newFileInput, fileInput);

  // Update reference to the NEW element
  fileInput = document.getElementById("report-image");

  // Add event listener to the NEW element
  fileInput.addEventListener("change", function (e) {
    const files = Array.from(e.target.files);
    console.log("📁 File input changed:", files.length, "files selected");

    // Use appLanguage (consistent with other translations)
    const currentLang =
      localStorage.getItem("appLanguage") ||
      localStorage.getItem("userLanguage") ||
      "en";

    const translations = {
      chooseFiles: {
        en: "Choose files (max 5)",
        vi: "Chọn tệp (tối đa 5)",
        zh: "选择文件（最多5个）",
        es: "Elegir archivos (máx. 5)",
        hi: "फ़ाइलें चुनें (अधिकतम 5)",
        ar: "اختر الملفات (5 كحد أقصى)",
      },
      filesSelected: {
        en: "files selected",
        vi: "tệp đã chọn",
        zh: "个文件已选择",
        es: "archivos seleccionados",
        hi: "फ़ाइलें चुनी गईं",
        ar: "ملفات مختارة",
      },
    };

    if (files.length === 0) {
      fileLabel.textContent =
        translations.chooseFiles[currentLang] || translations.chooseFiles.en;
    } else if (files.length === 1) {
      fileLabel.textContent = files[0].name;
    } else {
      fileLabel.textContent = `${files.length} ${translations.filesSelected[currentLang] || translations.filesSelected.en}`;
    }
  });

  console.log("✅ Image upload handler setup complete");
}

// Helper function to remove images
function removeImageAtIndex(indexToRemove) {
  const fileInput = document.getElementById("report-image");
  const files = Array.from(fileInput.files);

  // Remove file from array
  files.splice(indexToRemove, 1);

  // Create new FileList
  const dataTransfer = new DataTransfer();
  files.forEach((file) => dataTransfer.items.add(file));
  fileInput.files = dataTransfer.files;

  // Trigger change event to update UI
  fileInput.dispatchEvent(new Event("change"));
}

// Initialize when page loads
document.addEventListener("DOMContentLoaded", setupImageUploadHandler);

// === END OF ADDED CODE ===
// Ensure language selectors are connected
function connectLanguageSelectors() {
  ["language-switcher", "usersLanguageSwitcher"].forEach((id) => {
    const select = document.getElementById(id);
    if (select) {
      // Remove old listeners
      select.onchange = null;

      // Add new listener
      select.addEventListener("change", function () {
        console.log(`🎯 Language selector ${id} changed to:`, this.value);
        window.handleLanguageChange(this.value);
      });

      console.log(`✅ Connected ${id} to handleLanguageChange`);
    }
  });
}

// Connect when page loads
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", connectLanguageSelectors);
} else {
  connectLanguageSelectors();
}

// 🔥 Direct click handler for Saved Reports tab
document.addEventListener("click", function (e) {
  // Check if the clicked element is the Saved Reports tab or its child
  const savedTab = e.target.closest('[data-tab="saved-reports"]');
  if (savedTab) {
    console.log(
      "📋 Saved Reports tab clicked (direct handler) - using localStorage",
    );
    setTimeout(() => {
      // ✅ Use localStorage-based renderSavedReports instead
      if (typeof window.renderSavedReports === "function") {
        window.renderSavedReports();
      } else if (typeof window.loadSavedReports === "function") {
        // Fallback to original (but we'll make it use localStorage too)
        window.loadSavedReports();
      }
    }, 100);
  }
});
