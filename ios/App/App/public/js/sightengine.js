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

  moderation_unavailable: {
    en: "\u26a0\ufe0f Cannot verify image safety right now. Please try again later.",
    vi: "\u26a0\ufe0f Kh\u00f4ng th\u1ec3 x\u00e1c minh an to\u00e0n h\u00ecnh \u1ea3nh l\u00fac n\u00e0y. Vui l\u00f2ng th\u1eed l\u1ea1i sau.",
    zh: "\u26a0\ufe0f \u76ee\u524d\u65e0\u6cd5\u9a8c\u8bc1\u56fe\u7247\u5b89\u5168\u6027\u3002\u8bf7\u7a0d\u540e\u518d\u8bd5\u3002",
    es: "\u26a0\ufe0f No se puede verificar la seguridad de la imagen ahora. Int\u00e9ntelo m\u00e1s tarde.",
    hi: "\u26a0\ufe0f \u0905\u092d\u0940 \u091b\u0935\u093f \u0938\u0941\u0930\u0915\u094d\u0937\u093e \u0938\u0924\u094d\u092f\u093e\u092a\u093f\u0924 \u0928\u0939\u0940\u0902 \u0915\u0930 \u0938\u0915\u0924\u0947\u0964 \u0915\u0943\u092a\u092f\u093e \u092c\u093e\u0926 \u092e\u0947\u0902 \u092a\u0941\u0928\u0903 \u092a\u094d\u0930\u092f\u093e\u0938 \u0915\u0930\u0947\u0902\u0964",
    ar: "\u26a0\ufe0f \u0644\u0627 \u064a\u0645\u0643\u0646 \u0627\u0644\u062a\u062d\u0642\u0642 \u0645\u0646 \u0633\u0644\u0627\u0645\u0629 \u0627\u0644\u0635\u0648\u0631\u0629 \u0627\u0644\u0622\u0646. \u0627\u0644\u0631\u062c\u0627\u0621 \u0627\u0644\u0645\u062d\u0627\u0648\u0644\u0629 \u0644\u0627\u062d\u0642\u0627\u064b.",
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
        // FAIL OPEN: Allow upload so users can post missing person photos
        // We return "moderation_unavailable" so the app can warn the user and log it
        resolve({ safe: true, reason: "moderation_unavailable" });
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
      // TEMPORARY: fail-open to allow uploads while API quota issue is fixed
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
