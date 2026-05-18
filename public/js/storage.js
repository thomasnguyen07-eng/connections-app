// storage.js - UPDATED WITH DIRECT FIREBASE IMPORTS
// Import the necessary Firebase Storage functions
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
} from "https://www.gstatic.com/firebasejs/10.11.1/firebase-storage.js";

// You'll need your Firebase config. It's likely already global, or you can import it.
// We'll assume the Firebase app is already initialized by dashboard.js and accessible.
async function uploadImage(file, storagePath = null) {
  if (!file) return Promise.resolve(null);

  console.log("DEBUG: uploadImage function called.");
  console.log("DEBUG: File to process:", file.name, file.size);

  // 1. Compress the image using our new function
  const processedFile = await compressImageForUpload(file);
  console.log(
    "DEBUG: File after compression:",
    processedFile.name,
    processedFile.size
  );

  // 2. If no custom path was provided, generate a default one
  const finalStoragePath =
    storagePath || `reports/${Date.now()}_${processedFile.name}`;

  try {
    // 3. ✅ USE DIRECT IMPORTS - NO DEPENDENCY ON window.fb
    // Get the default storage instance (already initialized by dashboard.js)
    const storage = getStorage();
    // Create a storage reference
    const storageRef = ref(storage, finalStoragePath);
    // Upload the file
    const snapshot = await uploadBytes(storageRef, processedFile);
    // ✅ Get the CORRECT public download URL
    const downloadUrl = await getDownloadURL(snapshot.ref);
    console.log("✅ DEBUG: Correct download URL generated:", downloadUrl);
    return downloadUrl;
  } catch (error) {
    console.error("❌ Upload failed using Firebase v9 SDK:", error);
    throw error;
  }
}

// NEW FUNCTION: Upload multiple images with limit check
async function uploadMultipleImages(files, userId) {
  console.log("🖼️ Uploading multiple images:", files.length);

  // Check premium status for image limits
  const isPremium = await checkUserPremiumStatus(userId);
  const MAX_IMAGES = isPremium ? 5 : 0; // Trial: 0 images, Premium: 5 images

  if (files.length > MAX_IMAGES) {
    const currentLang = localStorage.getItem("userLanguage") || "en";
    const errorMessages = {
      en: `Maximum ${MAX_IMAGES} images allowed. Please subscribe for more.`,
      vi: `Tối đa ${MAX_IMAGES} hình ảnh được cho phép. Vui lòng đăng ký để có thêm.`,
      zh: `最多允许 ${MAX_IMAGES} 张图片。请订阅以获得更多。`,
      es: `Máximo ${MAX_IMAGES} imágenes permitidas. Por favor suscríbete para más.`,
      hi: `अधिकतम ${MAX_IMAGES} छवियों की अनुमति है। अधिक के लिए कृपया सदस्यता लें।`,
      ar: `الحد الأقصى ${MAX_IMAGES} صورة مسموح بها. يرجى الاشتراك للمزيد.`,
    };
    throw new Error(errorMessages[currentLang] || errorMessages.en);
  }

  const uploadPromises = files.map((file, index) => {
    const storagePath = `reports/${userId}/${Date.now()}_${index}_${file.name}`;
    return uploadImage(file, storagePath);
  });

  return Promise.all(uploadPromises);
}

// NEW FUNCTION: Check user premium status
async function checkUserPremiumStatus(userId) {
  try {
    // Simple check - you'll integrate with your actual premium system
    const isPremium = localStorage.getItem(`premium_${userId}`) === "true";
    console.log("💰 User premium status:", isPremium, "for user:", userId);
    return isPremium;
  } catch (error) {
    console.error("❌ Premium check error:", error);
    return false;
  }
}

// NEW FUNCTION: Validate file selection before upload
function validateImageSelection(files) {
  const currentLang = localStorage.getItem("userLanguage") || "en";

  if (files.length === 0) {
    return { valid: true };
  }

  // Check file types
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
