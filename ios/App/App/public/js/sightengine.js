// ============================================
// SIGHTENGINE MODERATION - COMPLETE
// Independent translations - NO conflicts
// ============================================

const SIGHTENGINE_USER = "364558902";
const SIGHTENGINE_SECRET = "X5efWsoxdYzbYzbcRYc93hCvyc3KSNho";

// Independent translations - one source of truth
const VIOLATION_MESSAGES = {
  firearm: {
    en: "❌ Cannot upload: Image contains a weapon (firearm)",
    vi: "❌ Không thể tải lên: Ảnh chứa vũ khí (súng)",
    zh: "❌ 无法上传：图像包含武器（枪支）",
    es: "❌ No se puede subir: La imagen contiene un arma de fuego",
    hi: "❌ अपलोड नहीं कर सकते: छवि में हथियार (बंदूक) है",
    ar: "❌ لا يمكن الرفع: الصورة تحتوي على سلاح ناري",
  },
  knife: {
    en: "❌ Cannot upload: Image contains a weapon (knife)",
    vi: "❌ Không thể tải lên: Ảnh chứa dao",
    zh: "❌ 无法上传：图像包含刀具",
    es: "❌ No se puede subir: La imagen contiene un cuchillo",
    hi: "❌ अपलोड नहीं कर सकते: छवि में चाकू है",
    ar: "❌ لا يمكن الرفع: الصورة تحتوي على سكين",
  },
  explicit: {
    en: "❌ Cannot upload: Image contains explicit or adult content",
    vi: "❌ Không thể tải lên: Ảnh chứa nội dung khiêu dâm",
    zh: "❌ 无法上传：图像包含色情内容",
    es: "❌ No se puede subir: La imagen contiene contenido explícito",
    hi: "❌ अपलोड नहीं कर सकते: छवि में अश्लील सामग्री है",
    ar: "❌ لا يمكن الرفع: الصورة تحتوي على محتوى صريح",
  },
  gore: {
    en: "❌ Cannot upload: Image contains violent or gore content",
    vi: "❌ Không thể tải lên: Ảnh chứa nội dung bạo lực",
    zh: "❌ 无法上传：图像包含暴力内容",
    es: "❌ No se puede subir: La imagen contiene contenido violento",
    hi: "❌ अपलोड नहीं कर सकते: छवि में हिंसक सामग्री है",
    ar: "❌ لا يمكن الرفع: الصورة تحتوي على محتوى عنيف",
  },
  alcohol: {
    en: "❌ Cannot upload: Image contains alcohol references",
    vi: "❌ Không thể tải lên: Ảnh có nội dung rượu bia",
    zh: "❌ 无法上传：图像包含酒精相关内容",
    es: "❌ No se puede subir: La imagen contiene referencias al alcohol",
    hi: "❌ अपलोड नहीं कर सकते: छवि में शराब संबंधी सामग्री है",
    ar: "❌ لا يمكن الرفع: الصورة تحتوي على كحول",
  },
};

async function moderateImageWithSightEngine(file) {
  return new Promise(async (resolve) => {
    try {
      const formData = new FormData();
      formData.append("media", file);
      formData.append("models", "nudity-2.1,weapon,gore,alcohol");
      formData.append("api_user", SIGHTENGINE_USER);
      formData.append("api_secret", SIGHTENGINE_SECRET);

      const response = await fetch(
        "https://api.sightengine.com/1.0/check.json",
        {
          method: "POST",
          body: formData,
        },
      );

      const data = await response.json();

      if (data.status === "failure") {
        console.error("SightEngine error:", data.error);
        resolve({ safe: true, reason: null });
        return;
      }

      let isUnsafe = false;
      let reason = null;

      // Check for weapons
      if (data.weapon?.classes?.firearm > 0.4) {
        isUnsafe = true;
        reason = "firearm";
      } else if (data.weapon?.classes?.knife > 0.4) {
        isUnsafe = true;
        reason = "knife";
      }
      // Check for explicit content
      else if (
        data.nudity?.sexual_activity > 0.3 ||
        data.nudity?.sexual_display > 0.3
      ) {
        isUnsafe = true;
        reason = "explicit";
      }
      // Check for gore/violence
      else if (data.gore?.prob > 0.4) {
        isUnsafe = true;
        reason = "gore";
      }
      // Check for alcohol
      else if (data.alcohol?.prob > 0.5) {
        isUnsafe = true;
        reason = "alcohol";
      }

      if (isUnsafe) {
        console.log("🚫 Image blocked:", reason);
        resolve({ safe: false, reason: reason });
      } else {
        resolve({ safe: true, reason: null });
      }
    } catch (error) {
      console.error("SightEngine error:", error);
      resolve({ safe: true, reason: null });
    }
  });
}

// Helper function to get violation message
function getViolationMessage(reason, lang) {
  const messages = VIOLATION_MESSAGES[reason];
  if (messages && messages[lang]) {
    return messages[lang];
  }
  return messages?.en || "❌ Cannot upload: Image contains prohibited content";
}

// Make available globally
window.moderateImageWithSightEngine = moderateImageWithSightEngine;
window.getViolationMessage = getViolationMessage;

console.log("✅ SightEngine moderation loaded");
