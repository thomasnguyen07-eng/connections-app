// ▼ Add this new file to your project ▼

// 1. Empty Report Detection
function isReportEmpty(report) {
  return !report || (!report.title && !report.description && !report.location);
}

// 2. Safe Sharing Wrapper
function safeShare(platform, report, originalFunction) {
  if (isReportEmpty(report)) {
    const lang = window.currentLanguage || "en";
    alert(
      {
        en: "Please add content before sharing",
        vi: "Vui lòng thêm nội dung trước khi chia sẻ",
        es: "Por favor agregue contenido antes de compartir",
        zh: "请添加内容后再分享",
        hi: "कृपया साझा करने से पहले सामग्री जोड़ें",
        ar: "يرجى إضافة محتوى قبل المشاركة",
      }[lang]
    );
    return false;
  }
  return originalFunction(report);
}

// 3. Wrap Existing Functions (no code changes needed)
function initEmptyReportHandler() {
  // WhatsApp
  const originalWhatsApp = window.shareToWhatsApp;
  window.shareToWhatsApp = (report) =>
    safeShare("whatsapp", report, originalWhatsApp);

  // Twitter
  const originalTwitter = window.shareToTwitter;
  window.shareToTwitter = (report) =>
    safeShare("twitter", report, originalTwitter);

  // Facebook
  const originalFacebook = window.showFacebookShareModal;
  window.showFacebookShareModal = (report) =>
    safeShare("facebook", report, originalFacebook);
}

// Auto-initialize
document.addEventListener("DOMContentLoaded", initEmptyReportHandler);
