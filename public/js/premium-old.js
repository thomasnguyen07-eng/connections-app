// premium.js - TOP OF THE FILE
// premium.js - WAIT FOR FIREBASE
console.log("📦 premium.js loading...");

// ====== ADD THESE 2 LINES ======
let firebaseWaitAttempts = 0;
const MAX_WAIT_ATTEMPTS = 50; // Stop after 5 seconds (50 * 100ms)
// ===============================

function waitForFirebase() {
  // ====== ADD THESE 2 LINES ======
  firebaseWaitAttempts++;
  if (firebaseWaitAttempts > MAX_WAIT_ATTEMPTS) {
    console.error("❌ Firebase wait timeout after 5 seconds");
    console.log("⚠️ Continuing without Firebase...");
    return; // Stop waiting
  }
  // ===============================

  if (!window.firebaseReady) {
    console.log("⏳ premium.js: Waiting for firebase-loader.js...");
    setTimeout(waitForFirebase, 100);
    return;
  }

  console.log("✅ premium.js: Firebase ready, initializing...");

  // Now get Firestore
  let db = null;

  if (window.firebase?.firestore) {
    db = window.firebase.firestore();
    console.log("✅ Using window.firebase.firestore()");
  } else if (window.fb?.firestore?.collection) {
    db = window.fb.firestore;
    console.log("✅ Using window.fb.firestore");
  } else if (window.fb?.firestore?.getFirestore && window.fb?.app) {
    const { getFirestore } = window.fb.firestore;
    db = getFirestore(window.fb.app);
    console.log("✅ Using getFirestore()");
  }

  if (!db) {
    console.error("❌ Still no Firestore after wait");
    return;
  }

  // Store globally for other functions
  window.premiumDb = db;

  // === YOUR EXISTING PREMIUM CODE HERE ===
  // All your existing premium.js code goes here, using 'db' or 'window.premiumDb'
  console.log("🎯 Premium page ready with Firestore");
}

// Start waiting
waitForFirebase();
// === YOUR EXISTING PREMIUM.JS CODE CONTINUES BELOW ===
// Replace any usage of 'db' with 'window.premiumFirestore' or the result of getFirestoreInstance()
// Add this function and call it:
function checkUserUID() {
  const user = window.fb?.auth?.currentUser;
  if (user) {
    console.log("🔑 Your User UID:", user.uid);
    console.log("📧 Your Email:", user.email);

    // Store in a global variable for easy access
    window.myUID = user.uid;
    window.myEmail = user.email;

    // Also show in alert (optional)
    // alert(`Your UID: ${user.uid}\nEmail: ${user.email}`);
  } else {
    console.log("⚠️ No user logged in");
  }
}

// Call it when page loads
setTimeout(() => {
  checkUserUID();
}, 3000);

// Also call when auth state changes
if (window.fb?.auth) {
  window.fb.auth.onAuthStateChanged((user) => {
    if (user) {
      console.log("🔑 Auth changed - UID:", user.uid);
      window.myUID = user.uid;
      // ✅ ADD THIS: Restore premium status from Firestore
      this.restorePremiumFromFirestore(user);
    }
  });
}
// Add this function somewhere in premium.js (not inside another function)
// For example, add it after your translations but before your class definition

function generateQRCodeForMomo(phoneNumber, amount, orderId, containerElement) {
  // Change from Google Charts to QuickChart
  const qrContent = `momo://payment?phone=${phoneNumber}&amount=${amount}&content=CONNECTIONS-${orderId}`;
  // With logo (your logo needs to be publicly accessible)
  const qrUrl = `https://quickchart.io/qr?size=250&text=${encodeURIComponent(qrContent)}&logo=${encodeURIComponent("https://connectionsfinder.com/images/logo-new.png")}`;

  // Create and display the image
  const img = document.createElement("img");
  img.src = qrUrl;
  img.alt = "MoMo QR Code";
  img.style.width = "100%";
  img.style.height = "100%";
  img.style.objectFit = "contain";
  img.style.borderRadius = "8px";

  // Clear container and add new QR
  containerElement.innerHTML = "";
  containerElement.appendChild(img);

  console.log("✅ QR code generated for:", { phoneNumber, amount, orderId });
}

// ============================================
// TRANSLATIONS OBJECT (at the top of file)
// ============================================
const surveyTranslations = {
  en: {
    title: "We're sorry to see you go",
    subtitle: "Please tell us why you're cancelling to help us improve:",
    options: {
      no_need: "📤 I no longer need this service",
      unsatisfied: "😞 The service was unsatisfactory",
      too_expensive: "💰 It's too expensive",
      other: "📝 Other reason (please specify)",
    },
    feedback_label: "Please tell us more:",
    feedback_placeholder: "Your feedback helps us improve...",
    skip_button: "Skip",
    submit_button: "Submit",
    thank_you: "Thank you for your feedback!",
    select_reason: "Please select a reason",
  },
  vi: {
    title: "Chúng tôi rất tiếc khi thấy bạn rời đi",
    subtitle:
      "Vui lòng cho chúng tôi biết lý do bạn hủy để chúng tôi có thể cải thiện:",
    options: {
      no_need: "📤 Tôi không còn cần dịch vụ này nữa",
      unsatisfied: "😞 Chất lượng dịch vụ chưa đáp ứng được kỳ vọng",
      too_expensive: "💰 Giá cả quá cao",
      other: "📝 Lý do khác (vui lòng ghi rõ)",
    },
    feedback_label: "Vui lòng chia sẻ thêm ý kiến:",
    feedback_placeholder: "Ý kiến của bạn giúp chúng tôi cải thiện...",
    skip_button: "Bỏ qua",
    submit_button: "Gửi",
    thank_you: "Cảm ơn bạn đã đóng góp ý kiến!",
    select_reason: "Vui lòng chọn lý do",
  },
  zh: {
    title: "很遗憾看到您离开",
    subtitle: "请告诉我们您取消订阅的原因，以帮助我们改进：",
    options: {
      no_need: "📤 我不再需要此服务",
      unsatisfied: "😞 服务质量不令人满意",
      too_expensive: "💰 价格太贵",
      other: "📝 其他原因（请说明）",
    },
    feedback_label: "请告诉我们更多信息：",
    feedback_placeholder: "您的反馈帮助我们改进...",
    skip_button: "跳过",
    submit_button: "提交",
    thank_you: "感谢您的反馈！",
    select_reason: "请选择一个原因",
  },
  es: {
    title: "Lamentamos verlo ir",
    subtitle: "Por favor, indíquenos por qué cancela para ayudarnos a mejorar:",
    options: {
      no_need: "📤 Ya no necesito este servicio",
      unsatisfied: "😞 El servicio no fue satisfactorio",
      too_expensive: "💰 Es demasiado caro",
      other: "📝 Otra razón (por favor especifique)",
    },
    feedback_label: "Por favor, cuéntenos más:",
    feedback_placeholder: "Sus comentarios nos ayudan a mejorar...",
    skip_button: "Omitir",
    submit_button: "Enviar",
    thank_you: "¡Gracias por su comentario!",
    select_reason: "Por favor seleccione una razón",
  },
  hi: {
    title: "आपको जाते देखकर हमें दुख हुआ",
    subtitle:
      "कृपया हमें बताएं कि आप क्यों रद्द कर रहे हैं ताकि हम सुधार कर सकें:",
    options: {
      no_need: "📤 मुझे अब इस सेवा की आवश्यकता नहीं है",
      unsatisfied: "😞 सेवा असंतोषजनक थी",
      too_expensive: "💰 यह बहुत महंगा है",
      other: "📝 अन्य कारण (कृपया निर्दिष्ट करें)",
    },
    feedback_label: "कृपया और बताएं:",
    feedback_placeholder: "आपकी प्रतिक्रिया हमें सुधारने में मदद करती है...",
    skip_button: "छोड़ें",
    submit_button: "जमा करें",
    thank_you: "आपकी प्रतिक्रिया के लिए धन्यवाद!",
    select_reason: "कृपया एक कारण चुनें",
  },
  ar: {
    title: "نحن آسفون لرؤيتك ترحل",
    subtitle: "يرجى إخبارنا لماذا تقوم بالإلغاء لمساعدتنا على التحسين:",
    options: {
      no_need: "📤 لم أعد بحاجة إلى هذه الخدمة",
      unsatisfied: "😞 الخدمة كانت غير مرضية",
      too_expensive: "💰 السعر مرتفع جداً",
      other: "📝 سبب آخر (يرجى التحديد)",
    },
    feedback_label: "يرجى إخبارنا بالمزيد:",
    feedback_placeholder: "ملاحظاتك تساعدنا على التحسين...",
    skip_button: "تخطي",
    submit_button: "إرسال",
    thank_you: "شكراً لملاحظاتك!",
    select_reason: "يرجى اختيار سبب",
  },
};

// Function to get survey text based on language
function getSurveyText(lang, key, subKey = null) {
  const language = surveyTranslations[lang] || surveyTranslations.en;
  if (subKey) {
    return (
      language[key]?.[subKey] || surveyTranslations.en[key]?.[subKey] || ""
    );
  }
  return language[key] || surveyTranslations.en[key] || "";
}

// COMPLETELY ISOLATED Premium Manager - No interference with main app
// premium.js - UPDATED WITH SPONSORSHIP SYSTEM
class PremiumManager {
  constructor() {
    this.currentLang = "en";
    this.translations = {};
    this.isInitialized = false;
    this.paypalBulkPopupShown = false;

    // ADD THIS LINE:
    this.isPayPalProcessing = false;
    this.isMomoProcessing = false;
    this.isBankProcessing = false;

    // Enhanced pricing with all currencies
    this.PLAN_PRICES = {
      monthly: 4.99,
      three_months: 13.47, // ~10% off
      six_months: 23.95, // ~20% off
      yearly: 34.71, // ~42% off
    };

    this.BULK_DISCOUNTS = {
      under_10: { min: 1, max: 9, discount: 0.05 },
      over_10: { min: 10, max: 999, discount: 0.15 },
    };

    this.initializePremiumPage();
    this.setupBulkSubscription();

    // ADD EMBEDDED TRANSLATIONS FOR EMAIL SYSTEM
    this.emailTranslations = {
      en: {
        emailSuccessTitle: "Passcodes Sent!",
        emailSuccessMessage: "Your passcodes have been sent to:",
        emailNote: "Please check your inbox (and spam folder).",
        emailFailTitle: "Email Delivery Failed",
        emailFailMessage: "Could not send email. Showing passcodes below:",
        emailFailNote: "Please save these passcodes manually.",
        close: "Close",
        copyAll: "Copy All Passcodes",
        saveInstructions:
          "Save these passcodes to share with your sponsored users.",
        passcode: "Passcode",
        expires: "Expires",
        bulkSuccessTitle: "Bulk Subscription Successful!",
        bulkSuccessMessage: "Your organization subscription is now active.",
        passcodeInstructions:
          "Share these passcodes with your sponsored users:",
        orderId: "Order ID",
        plan: "Plan",
        totalAmount: "Total Amount",
        // Add these new ones:
        userCount: "Passcodes Generated",
        downloadButton: "Download Passcodes File",
        instructionsTitle: "Instructions:",
        step1: "Click the button above to download the passcodes file",
        step2: "Open the downloaded file (.txt)",
        step3: "Copy the passcodes and send to your sponsored users",
        step4: "Each passcode can be used only once",
        copied: "Passcodes copied to clipboard!",
        orderSummary: "Order Summary:",
        // In English (en) section:
        planTypes: {
          monthly: "Monthly",
          threeMonths: "3 Months",
          sixMonths: "6 Months",
          yearly: "Yearly",
          bulk10: "Bulk (10 users)",
          bulk50: "Bulk (50 users)",
        },
      },
      vi: {
        emailSuccessTitle: "Đã Gửi Mã Mời!",
        emailSuccessMessage: "Mã mời của bạn đã được gửi đến:",
        emailNote: "Vui lòng kiểm tra hộp thư đến (và thư rác).",
        emailFailTitle: "Gửi Email Thất Bại",
        emailFailMessage: "Không thể gửi email. Hiển thị mã mời bên dưới:",
        emailFailNote: "Vui lòng lưu các mã mời này thủ công.",
        close: "Đóng",
        copyAll: "Sao Chép Tất Cả Mã Mời",
        saveInstructions:
          "Lưu các mã mời này để chia sẻ với người dùng được tài trợ.",
        passcode: "Mã Mời",
        expires: "Hết hạn",
        bulkSuccessTitle: "Đăng Ký Cụm Thành Công!",
        bulkSuccessMessage: "Gói đăng ký tổ chức của bạn đã được kích hoạt.",
        passcodeInstructions:
          "Chia sẻ các mã mời này với người dùng được tài trợ:",
        orderId: "Mã đơn hàng",
        plan: "Gói",
        totalAmount: "Tổng số tiền",
        // Add these new ones:
        userCount: "Mã đã tạo",
        downloadButton: "Tải xuống Tệp Mã Mời",
        instructionsTitle: "Hướng dẫn:",
        step1: "Nhấp vào nút trên để tải xuống tệp mã mời",
        step2: "Mở tệp đã tải xuống (.txt)",
        step3: "Sao chép mã mời và gửi cho người dùng được tài trợ",
        step4: "Mỗi mã mời chỉ có thể sử dụng một lần",
        copied: "Đã sao chép mã mời vào bảng nhớ tạm!",
        orderSummary: "Tóm tắt đơn hàng:",
        // In Vietnamese (vi) section:
        planTypes: {
          monthly: "Hàng tháng",
          threeMonths: "3 Tháng",
          sixMonths: "6 Tháng",
          yearly: "Hàng năm",
          bulk10: "Cụm (10 người dùng)",
          bulk50: "Cụm (50 người dùng)",
        },
      },
      zh: {
        emailSuccessTitle: "邀请码已发送！",
        emailSuccessMessage: "您的邀请码已发送至：",
        emailNote: "请检查您的收件箱（和垃圾邮件文件夹）。",
        emailFailTitle: "邮件发送失败",
        emailFailMessage: "无法发送邮件。显示以下邀请码：",
        emailFailNote: "请手动保存这些邀请码。",
        close: "关闭",
        copyAll: "复制所有邀请码",
        saveInstructions: "保存这些邀请码以与您的赞助用户分享。",
        passcode: "邀请码",
        expires: "到期",
        bulkSuccessTitle: "批量订阅成功！",
        bulkSuccessMessage: "您的组织订阅现已激活。",
        passcodeInstructions: "与您的赞助用户分享这些邀请码：",
        orderId: "订单号",
        plan: "套餐",
        totalAmount: "总金额",
        // Add these new ones:
        userCount: "已生成邀请码",
        downloadButton: "下载邀请码文件",
        instructionsTitle: "使用说明：",
        step1: "点击上方按钮下载邀请码文件",
        step2: "打开下载的文件 (.txt)",
        step3: "复制邀请码并发送给您的赞助用户",
        step4: "每个邀请码只能使用一次",
        copied: "邀请码已复制到剪贴板！",
        orderSummary: "订单摘要：",
        // In Chinese (zh) section:
        planTypes: {
          monthly: "月付",
          threeMonths: "3个月",
          sixMonths: "6个月",
          yearly: "年付",
          bulk10: "批量 (10用户)",
          bulk50: "批量 (50用户)",
        },
      },
      es: {
        emailSuccessTitle: "¡Códigos Enviados!",
        emailSuccessMessage: "Sus códigos de acceso han sido enviados a:",
        emailNote:
          "Por favor, revise su bandeja de entrada (y carpeta de spam).",
        emailFailTitle: "Entrega de Correo Fallida",
        emailFailMessage:
          "No se pudo enviar el correo. Mostrando códigos a continuación:",
        emailFailNote: "Por favor, guarde estos códigos manualmente.",
        close: "Cerrar",
        copyAll: "Copiar Todos los Códigos",
        saveInstructions:
          "Guarde estos códigos para compartir con sus usuarios patrocinados.",
        passcode: "Código de Acceso",
        expires: "Expira",
        bulkSuccessTitle: "¡Suscripción Masiva Exitosa!",
        bulkSuccessMessage: "Su suscripción de organización ahora está activa.",
        passcodeInstructions:
          "Comparta estos códigos con sus usuarios patrocinados:",
        orderId: "ID del Pedido",
        plan: "Plan",
        totalAmount: "Monto Total",
        // Add these new ones:
        userCount: "Códigos Generados",
        downloadButton: "Descargar Archivo de Códigos",
        instructionsTitle: "Instrucciones:",
        step1:
          "Haga clic en el botón de arriba para descargar el archivo de códigos",
        step2: "Abra el archivo descargado (.txt)",
        step3: "Copie los códigos y envíelos a sus usuarios patrocinados",
        step4: "Cada código solo puede usarse una vez",
        copied: "¡Códigos copiados al portapapeles!",
        orderSummary: "Resumen del Pedido:",
        // In Spanish (es) section:
        planTypes: {
          monthly: "Mensual",
          threeMonths: "3 Meses",
          sixMonths: "6 Meses",
          yearly: "Anual",
          bulk10: "Masivo (10 usuarios)",
          bulk50: "Masivo (50 usuarios)",
        },
      },
      ar: {
        emailSuccessTitle: "تم إرسال رموز الدخول!",
        emailSuccessMessage: "تم إرسال رموز الدخول الخاصة بك إلى:",
        emailNote: "يرجى التحقق من صندوق الوارد (ومجلد البريد العشوائي).",
        emailFailTitle: "فشل تسليم البريد الإلكتروني",
        emailFailMessage:
          "تعذر إرسال البريد الإلكتروني. عرض رموز الدخول أدناه:",
        emailFailNote: "يرجى حفظ هذه الرموز يدويًا.",
        close: "إغلاق",
        copyAll: "نسخ جميع رموز الدخول",
        saveInstructions:
          "احفظ هذه الرموز لمشاركتها مع المستخدمين الممولين لديك.",
        passcode: "رمز الدخول",
        expires: "ينتهي",
        bulkSuccessTitle: "نجاح الاشتراك الجماعي!",
        bulkSuccessMessage: "اشتراك مؤسستك نشط الآن.",
        passcodeInstructions: "شارك هذه الرموز مع المستخدمين الممولين لديك:",
        orderId: "رقم الطلب",
        plan: "الخطة",
        totalAmount: "المبلغ الإجمالي",
        // Add these new ones:
        userCount: "الرموز المنشأة",
        downloadButton: "تحميل ملف رموز المرور",
        instructionsTitle: "التعليمات:",
        step1: "انقر على الزر أعلاه لتحميل ملف رموز المرور",
        step2: "افتح الملف الذي تم تنزيله (.txt)",
        step3: "انسخ رموز المرور وأرسلها إلى المستخدمين الذين ترعاهم",
        step4: "يمكن استخدام كل رمز مرور مرة واحدة فقط",
        copied: "تم نسخ رموز المرور إلى الحافظة!",
        orderSummary: "ملخص الطلب:",
        // In Arabic (ar) section:
        planTypes: {
          monthly: "شهري",
          threeMonths: "3 أشهر",
          sixMonths: "6 أشهر",
          yearly: "سنوي",
          bulk10: "جماعي (10 مستخدمين)",
          bulk50: "جماعي (50 مستخدمين)",
        },
      },
      hi: {
        emailSuccessTitle: "पासकोड भेज दिए गए!",
        emailSuccessMessage: "आपके पासकोड इसे भेजे गए हैं:",
        emailNote: "कृपया अपना इनबॉक्स (और स्पैम फोल्डर) जांचें।",
        emailFailTitle: "ईमेल वितरण विफल",
        emailFailMessage:
          "ईमेल नहीं भेजा जा सका। नीचे पासकोड दिखाए जा रहे हैं:",
        emailFailNote: "कृपया इन पासकोड को मैन्युअली सहेजें।",
        close: "बंद करें",
        copyAll: "सभी पासकोड कॉपी करें",
        saveInstructions:
          "अपने प्रायोजित उपयोगकर्ताओं के साथ साझा करने के लिए इन पासकोड को सहेजें।",
        passcode: "पासकोड",
        expires: "समाप्ति",
        bulkSuccessTitle: "बल्क सदस्यता सफल!",
        bulkSuccessMessage: "आपकी संगठन सदस्यता अब सक्रिय है।",
        passcodeInstructions:
          "अपने प्रायोजित उपयोगकर्ताओं के साथ इन पासकोड को साझा करें:",
        orderId: "ऑर्डर आईडी",
        plan: "योजना",
        totalAmount: "कुल राशि",
        // Add these new ones:
        userCount: "पासकोड जनरेट किए गए",
        downloadButton: "पासकोड फ़ाइल डाउनलोड करें",
        instructionsTitle: "निर्देश:",
        step1: "पासकोड फ़ाइल डाउनलोड करने के लिए ऊपर दिए गए बटन पर क्लिक करें",
        step2: "डाउनलोड की गई फ़ाइल खोलें (.txt)",
        step3: "पासकोड कॉपी करें और अपने प्रायोजित उपयोगकर्ताओं को भेजें",
        step4: "प्रत्येक पासकोड केवल एक बार उपयोग किया जा सकता है",
        copied: "पासकोड क्लिपबोर्ड पर कॉपी किए गए!",
        orderSummary: "आदेश सारांश:",
        // In Hindi (hi) section:
        planTypes: {
          monthly: "मासिक",
          threeMonths: "3 महीने",
          sixMonths: "6 महीने",
          yearly: "वार्षिक",
          bulk10: "थोक (10 उपयोगकर्ता)",
          bulk50: "थोक (50 उपयोगकर्ता)",
        },
      },
    };
    // Add owner email
    this.ownerEmail = "thomasnguyen07@gmail.com";
  }

  // ✅ PUT IT HERE - After constructor, before other methods
  loadPayPalScript(selectedPlan, containerId) {
    console.log("🔄 Loading PayPal script for plan:", selectedPlan);

    // 🔥 CRITICAL: Don't load if no plan
    if (!selectedPlan || !selectedPlan.price) {
      console.log("⏳ No plan selected yet - skipping PayPal load");
      return;
    }

    const isSandbox = true; // Set to false for production
    const clientId =
      "AbarPi6zH1lCRkMNOJJ-OHo_CjUxYVIVzwxRPl9UQx0h1ayR9I-axgHr7irudk7DZMRvzVZ8euSV3nbf";

    // Remove any existing PayPal script
    const existingScript = document.querySelector('script[src*="paypal"]');
    if (existingScript) {
      existingScript.remove();
    }

    const script = document.createElement("script");
    script.src = `https://${isSandbox ? "www.sandbox" : "www"}.paypal.com/sdk/js?client-id=${clientId}&currency=USD&intent=capture`;
    script.async = true;

    script.onload = () => {
      console.log("✅ PayPal SDK loaded successfully!");
      this.renderPayPalButton(selectedPlan, containerId);
    };

    script.onerror = (error) => {
      console.error("❌ Failed to load PayPal SDK:", error);
      const fallback = document.getElementById("paypal-manual-fallback");
      if (fallback) fallback.style.display = "block";
    };

    document.head.appendChild(script);
  }

  getPaypalTranslation(key, lang) {
    // Hard-coded translations
    const translations = {
      // Success messages
      successTitle: {
        en: "✅ Payment Successful!",
        vi: "✅ Thanh toán thành công!",
        zh: "✅ 支付成功！",
        es: "✅ ¡Pago exitoso!",
        hi: "✅ भुगतान सफल!",
        ar: "✅ تم الدفع بنجاح!",
      },
      successMessage: {
        en: "Your payment has been processed successfully. Your passcodes will be generated momentarily.",
        vi: "Thanh toán của bạn đã được xử lý thành công. Mã truy cập của bạn sẽ được tạo ngay.",
        zh: "您的支付已成功处理。您的密码即将生成。",
        es: "Su pago ha sido procesado exitosamente. Sus códigos se generarán en breve.",
        hi: "आपका भुगतान सफलतापूर्वक संसाधित हो गया है। आपके पासकोड तुरंत उत्पन्न हो जाएंगे।",
        ar: "تمت معالجة دفعتك بنجاح. سيتم إنشاء رموز المرور الخاصة بك على الفور.",
      },

      // Error messages
      errorTitle: {
        en: "❌ Payment Failed",
        vi: "❌ Thanh toán thất bại",
        zh: "❌ 支付失败",
        es: "❌ Pago fallido",
        hi: "❌ भुगतान विफल",
        ar: "❌ فشل الدفع",
      },
      errorMessage: {
        en: "There was an issue processing your payment. Please try again or use another method.",
        vi: "Đã xảy ra sự cố khi xử lý thanh toán của bạn. Vui lòng thử lại hoặc sử dụng phương thức khác.",
        zh: "处理您的支付时出现问题。请重试或使用其他方式。",
        es: "Hubo un problema al procesar su pago. Por favor intente nuevamente o use otro método.",
        hi: "आपके भुगतान को संसाधित करने में समस्या हुई। कृपया पुनः प्रयास करें या कोई अन्य तरीका उपयोग करें।",
        ar: "حدثت مشكلة في معالجة دفعتك. يرجى المحاولة مرة أخرى أو استخدام طريقة أخرى.",
      },

      // Modal titles
      payWithPaypal: {
        en: "Pay with PayPal",
        vi: "Thanh toán qua PayPal",
        zh: "使用PayPal支付",
        es: "Pagar con PayPal",
        hi: "PayPal से भुगतान करें",
        ar: "الدفع عبر PayPal",
      },

      // Buttons
      useManualInstead: {
        en: "Use Manual Payment Instead",
        vi: "Sử dụng thanh toán thủ công",
        zh: "改用人工支付",
        es: "Usar pago manual en su lugar",
        hi: "इसके बजाय मैन्युअल भुगतान का उपयोग करें",
        ar: "استخدم الدفع اليدوي بدلاً من ذلك",
      },
      cancel: {
        en: "Cancel",
        vi: "Hủy",
        zh: "取消",
        es: "Cancelar",
        hi: "रद्द करें",
        ar: "إلغاء",
      },

      // Having trouble
      havingTrouble: {
        en: "Having trouble with PayPal?",
        vi: "Gặp sự cố với PayPal?",
        zh: "使用PayPal时遇到问题？",
        es: "¿Tiene problemas con PayPal?",
        hi: "PayPal में समस्या हो रही है?",
        ar: "هل تواجه مشكلة مع PayPal؟",
      },
    };

    // ✅ FIX: Access the translation correctly
    if (translations[key] && translations[key][lang]) {
      return translations[key][lang];
    }
    getPaypalTranslation;

    // Fallback to English
    return translations[key]?.en || key;
  }

  showNotification(title, message) {
    // Create notification div
    const notification = document.createElement("div");
    notification.id = "paypal-notification";
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #4CAF50;
        color: white;
        padding: 15px 20px;
        border-radius: 5px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        z-index: 10002;
        font-family: Arial, sans-serif;
        opacity: 0;
        transform: translateX(100%);
        transition: all 0.3s ease;
    `;

    notification.innerHTML = `<strong>${title}</strong><br><small>${message}</small>`;
    document.body.appendChild(notification);

    // Animate in
    setTimeout(() => {
      notification.style.opacity = "1";
      notification.style.transform = "translateX(0)";
    }, 10);

    // Remove after 3 seconds
    setTimeout(() => {
      notification.style.opacity = "0";
      notification.style.transform = "translateX(100%)";
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }

  renderPayPalButton(selectedPlan, containerId) {
    console.log("🔄 Rendering PayPal button for plan:", selectedPlan);

    // 🔥 SAFETY: Don't proceed if no plan
    if (!selectedPlan || !selectedPlan.price) {
      console.error("❌ No valid plan in renderPayPalButton");
      return;
    }

    const lang = localStorage.getItem("userLanguage") || "en";

    if (typeof paypal === "undefined") {
      console.error("❌ PayPal not available");
      const fallback = document.getElementById("paypal-manual-fallback");
      if (fallback) fallback.style.display = "block";
      return;
    }

    const container = document.getElementById(containerId);
    if (!container) {
      console.error("❌ Button container not found:", containerId);
      return;
    }

    // Clear container
    container.innerHTML = "";

    const amount = selectedPlan.price.toString();

    try {
      paypal
        .Buttons({
          createOrder: (data, actions) => {
            console.log("📝 Creating PayPal order for $", amount);
            return actions.order.create({
              purchase_units: [
                {
                  amount: {
                    value: amount,
                  },
                },
              ],
            });
          },

          onApprove: (data, actions) => {
            console.log("✅ Payment approved!", data);
            return actions.order.capture().then(async (details) => {
              console.log("💰 Payment captured:", details);

              // Store plan data with payment method
              const planData = {
                type: selectedPlan.type,
                price: selectedPlan.price || selectedPlan.amountUSD,
                amountUSD: selectedPlan.price || selectedPlan.amountUSD,
                isBulk: selectedPlan.isBulk || false,
                userCount: selectedPlan.userCount || 1,
                currency: selectedPlan.currency || "USD",
              };

              localStorage.setItem(
                `selectedPlan_paypal`,
                JSON.stringify(planData),
              );
              localStorage.setItem("paymentMethod", "paypal");
              localStorage.setItem(`paymentConfirmed_paypal`, "true");
              localStorage.setItem(`paymentVerified_paypal`, "true");
              localStorage.setItem(`paymentId_paypal`, details.id);

              // 🔥 CRITICAL: Set premium for individual users
              if (!planData.isBulk) {
                try {
                  const user = window.fb.auth.currentUser;
                  console.log(
                    "🔧 Setting up premium individual user:",
                    user.email,
                  );

                  // Set localStorage (works even if Firestore fails)
                  const expiryDate = new Date();
                  expiryDate.setDate(expiryDate.getDate() + 30);
                  localStorage.setItem(`premium_${user.uid}`, "true");
                  localStorage.setItem(
                    `premium_expiry_${user.uid}`,
                    expiryDate.toISOString(),
                  );
                  console.log("✅ localStorage set for premium user");

                  // Try Firestore but don't wait for it
                  // In your onApprove function, modify the Firestore check:

                  // Instead of returning when Firestore is unavailable, TRY to initialize it
                  if (
                    !window.fb ||
                    !window.fb.firestore ||
                    !window.fb.firestore.db
                  ) {
                    console.log(
                      "⚠️ Firestore not available - attempting to initialize...",
                    );

                    // Try to get Firestore from window.firebase
                    if (window.firebase && window.firebase.firestore) {
                      try {
                        const db = window.firebase.firestore();
                        const userRef = db.collection("users").doc(user.uid);
                        await userRef.set(
                          {
                            hasActiveSubscription: true,
                            maxImagesPerReport: 5,
                            userType: "premium",
                            subscriptionType: selectedPlan.type,
                            subscriptionExpiry: expiryDate.toISOString(),
                            isPremium: true,
                            premium: true,
                            lastUpdated: new Date().toISOString(),
                          },
                          { merge: true },
                        );
                        console.log("✅ Firestore updated via window.firebase");
                      } catch (fbError) {
                        console.log(
                          "⚠️ Still cannot update Firestore:",
                          fbError,
                        );
                      }
                    }
                  }

                  // ALWAYS set localStorage as backup
                  localStorage.setItem(`premium_${user.uid}`, "true");
                } catch (error) {
                  console.log(
                    "⚠️ Premium setup continued with localStorage only",
                  );
                }
              }

              // ✅ CLOSE MODAL FIRST
              const modal = document.getElementById("paypal-modal");
              if (modal) {
                modal.remove();
                console.log("✅ PayPal modal closed");
              }

              // Close any PayPal overlays
              document
                .querySelectorAll('[class*="paypal"][class*="overlay"]')
                .forEach((el) => el.remove());

              // Show success message
              const lang = localStorage.getItem("userLanguage") || "en";
              alert(
                `${this.getPaypalTranslation("successTitle", lang)}\n\n${this.getPaypalTranslation("successMessage", lang)}`,
              );

              // Show passcodes or success
              this.showPasscodesAfterPayment("paypal");
            });
          },

          onError: (err) => {
            console.error("❌ PayPal error:", err);

            const errorTitle = this.getPaypalTranslation("errorTitle", lang);
            const errorMessage = this.getPaypalTranslation(
              "errorMessage",
              lang,
            );
            alert(`${errorTitle}\n\n${errorMessage}`);

            const fallback = document.getElementById("paypal-manual-fallback");
            if (fallback) fallback.style.display = "block";
          },

          onCancel: (data) => {
            console.log("❌ Payment cancelled by user");
            const fallback = document.getElementById("paypal-manual-fallback");
            if (fallback) fallback.style.display = "block";
          },
        })
        .render(`#${containerId}`);

      console.log("✅ PayPal button rendered successfully");
    } catch (error) {
      console.error("❌ Error rendering PayPal button:", error);
      const fallback = document.getElementById("paypal-manual-fallback");
      if (fallback) fallback.style.display = "block";
    }
  }

  initializePremiumPage() {
    if (this.isInitialized) return;

    try {
      const savedLang = localStorage.getItem("premiumLanguage") || "en";
      this.currentLang = savedLang;

      this.loadEmbeddedTranslations();
      this.setupLanguageButtons();
      this.setupBackButton();
      this.setupPaymentButtons();
      this.setupSubscriptionButtons();
      this.setupBulkCalculator();

      // Check if user has a pending subscription from previous visit
      this.checkPendingSubscription();

      // Update all pricing displays
      this.updateIndividualPricingDisplay();
      this.updatePricingDisplay();
      this.updateBulkCalculator();

      this.isInitialized = true;
      console.log("✅ Premium Manager initialized - COMPLETELY ISOLATED");
    } catch (error) {
      console.error("❌ Premium Manager initialization error:", error);
    }
  }

  async restorePremiumFromFirestore(user) {
    try {
      console.log(
        "🔄 Restoring premium status from Firestore for:",
        user.email,
      );

      // Get Firestore instance
      const db = window.fb.firestore.db;

      // Get user document
      const userDoc = await db.collection("users").doc(user.uid).get();

      if (userDoc.exists) {
        const userData = userDoc.data();

        // Check if user has active subscription
        if (userData.hasActiveSubscription === true) {
          // Restore to localStorage
          localStorage.setItem(`premium_${user.uid}`, "true");

          if (userData.subscriptionExpiry) {
            localStorage.setItem(
              `premium_expiry_${user.uid}`,
              userData.subscriptionExpiry,
            );
          }

          console.log("✅ Premium status restored from Firestore");
        } else {
          console.log("ℹ️ No active subscription found in Firestore");
        }
      }
    } catch (error) {
      console.error("❌ Error restoring premium from Firestore:", error);
    }
  }

  showModal(options) {
    console.log("🔄 Creating modal:", options.title);

    // Remove existing modal if present
    const existingModal = document.getElementById(options.id || "customModal");
    if (existingModal) existingModal.remove();

    const modal = document.createElement("div");
    modal.id = options.id || "customModal";
    modal.style.cssText = `
    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
    background: rgba(0,0,0,0.5); display: flex; align-items: center;
    justify-content: center; z-index: 99999;
  `;

    const content = document.createElement("div");
    content.style.cssText = `
    background: white; padding: 25px; border-radius: 10px;
    max-width: 500px; width: 90%; max-height: 80vh; overflow-y: auto;
    box-shadow: 0 5px 15px rgba(0,0,0,0.3);
  `;

    if (options.title) {
      const title = document.createElement("h3");
      title.textContent = options.title;
      title.style.margin = "0 0 15px 0";
      content.appendChild(title);
    }

    const body = document.createElement("div");
    body.innerHTML = options.content || "";
    content.appendChild(body);

    modal.appendChild(content);
    document.body.appendChild(modal);

    // Close on background click
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        modal.remove();
      }
    });

    // Close button if specified
    if (options.closeButton !== false) {
      const closeBtn = document.createElement("button");
      closeBtn.textContent = options.closeText || "Close";
      closeBtn.style.cssText = `
  margin-top: 20px; padding: 10px 20px; 
  background: ${options.closeButtonColor || "#666"}; color: white; border: none; 
  border-radius: 5px; cursor: pointer; float: right;
`;
      closeBtn.onclick = () => {
        // Remove modal
        modal.remove();

        // If there's a cleanup function specified, call it
        if (
          options.onCloseCleanup &&
          typeof options.onCloseCleanup === "function"
        ) {
          options.onCloseCleanup();
        }
      };
      content.appendChild(closeBtn);
    }

    console.log("✅ Modal created");
    return modal;
  }

  // ADD SPONSORSHIP METHODS HERE:
  setupBulkSubscription() {
    const bulkSubscribeBtn = document.getElementById("bulkSubscribeBtn");
    if (bulkSubscribeBtn) {
      bulkSubscribeBtn.addEventListener("click", () => {
        this.handleBulkSubscription();
      });
      console.log("✅ Bulk subscription button initialized");
    }
  }

  // Add this function to your class
  resetPaymentFlags() {
    window.paymentVerified = false;
    localStorage.removeItem("paymentVerified");
    localStorage.removeItem("paymentMethod");
    localStorage.removeItem("paymentTime");
    localStorage.removeItem("paymentId");
    localStorage.removeItem("currentPaymentId");
    console.log("🔄 Payment flags reset");
  }

  async handleBulkSubscription() {
    try {
      // 🔥 CRITICAL: Check if user is app owner FIRST
      const currentUser = window.fb?.auth?.currentUser;
      if (currentUser && this.isAppOwner(currentUser.email)) {
        console.log(
          "👑 App owner detected - granting complimentary bulk access",
        );
        await this.grantComplimentaryBulkAccess(currentUser);
        return; // Skip payment process
      }

      // RESET PAYPAL SPECIFIC FLAG
      this.paypalBulkPopupShown = false;

      // 🔧 ADD THIS: Reset payment verification flags
      this.resetPaymentFlags();

      console.log("🏢 Starting bulk subscription process...");

      const userCount =
        parseInt(document.getElementById("userCount").value) || 1;
      const planType = document.getElementById("bulkPlanType").value;

      if (!userCount || userCount < 1) {
        alert(
          this.translations.please_select_plan ||
            "Please enter a valid number of users",
        );
        return;
      }

      // Calculate bulk price
      const totalAmount = this.calculateBulkPrice(userCount, planType);

      const user = window.fb?.auth?.currentUser; // This is DIFFERENT from currentUser above
      if (!user) {
        this.moveToLoginFirst("bulk");
        return;
      }

      // 🔧 FIX: DO NOT generate passcodes here
      // const passcodes = this.generatePasscodes(userCount); // REMOVE THIS

      // STORE BULK PLAN SELECTION WITHOUT PASSCODES
      const selectedPlan = {
        type: `bulk_${planType}_${userCount}users`,
        amountUSD: totalAmount,
        userCount: userCount,
        planType: planType,
        isBulk: true,
        isOrganization: true,
        // 🔧 FIX: NO passcodes property here
      };

      localStorage.setItem("selectedPlan", JSON.stringify(selectedPlan));

      console.log(
        "🏢 Bulk subscription data (NO PASSCODES YET):",
        selectedPlan,
      );

      // 🔧 FIX: REMOVE this line - NO passcodes shown before payment
      // this.displayPasscodesToUser(selectedPlan.passcodes, selectedPlan);

      // 🔧 FIX: Show payment options IMMEDIATELY (no delay needed)
      try {
        this.showPaymentOptions(selectedPlan);
      } catch (modalError) {
        console.error("❌ Modal error:", modalError);
        this.handleBulkPayment(selectedPlan);
      }
    } catch (error) {
      console.error("❌ Bulk subscription error:", error);
      alert(
        this.translations.payment_failed ||
          "Bulk subscription setup failed. Please try again.",
      );
    }
  }

  // Add these helper methods
  isAppOwner(email) {
    // List of owner emails (add yours here)
    const ownerEmails = [
      "thomasnguyen07@gmail.com",
      // Add other owner emails
    ];
    return ownerEmails.includes(email.toLowerCase());
  }

  async grantComplimentaryBulkAccess(user) {
    try {
      const userCount =
        parseInt(document.getElementById("userCount").value) || 1;
      const planType = document.getElementById("bulkPlanType").value;
      const lang = this.currentLang;
      const t = this.translations;

      console.log(
        `👑 Granting complimentary bulk access for ${userCount} users`,
      );

      // Generate passcodes immediately (no payment needed)
      const passcodes = this.generatePasscodes(userCount);

      // Setup organization
      await this.setupOrganization(user.uid, passcodes, {
        type: `bulk_${planType}_${userCount}users`,
        amountUSD: 0,
        userCount: userCount,
        planType: planType,
        isBulk: true,
        isOrganization: true,
        isComplimentary: true,
        paymentMethod: "complimentary",
      });

      // Mark user as complimentary owner
      localStorage.setItem(`complimentary_${user.uid}`, "true");

      // Update user document in Firestore
      await this.updateUserAsComplimentaryOwner(user.uid);

      // Show success message with translations
      const successMessage =
        t.ownerAccessMessage?.replace("{count}", userCount) ||
        `As the app owner, you have received complimentary access to sponsor ${userCount} users.`;

      this.showModal({
        title: t.ownerAccessTitle || "Owner Access Granted",
        content: `
        <div style="text-align: center; padding: 20px;">
          <div style="font-size: 60px; color: #4CAF50; margin-bottom: 15px;">👑</div>
          <h3 style="color: #4CAF50; margin-bottom: 15px;">${t.ownerAccessTitle || "Owner Access Granted"}</h3>
          <p style="font-size: 16px; margin-bottom: 20px;">${successMessage}</p>
          <p style="font-size: 14px; color: #666; margin-bottom: 25px;">
            ${t.freePasscodes || "Free passcodes have been generated and saved."}
          </p>
          <button onclick="this.parentElement.parentElement.parentElement.remove()" 
                  style="padding: 10px 25px; background: #4CAF50; color: white; 
                         border: none; border-radius: 5px; cursor: pointer;">
            ${t.close || "Close"}
          </button>
        </div>
      `,
        id: "ownerAccessModal",
        closeButton: false,
      });
    } catch (error) {
      console.error("❌ Error granting complimentary access:", error);
      const t =
        this.allTranslations[this.currentLang] || this.allTranslations.en;
      alert(
        t.complimentaryAccess ||
          "Complimentary bulk access granted! You can now sponsor users.",
      );
    }
  }

  async updateUserAsComplimentaryOwner(userId) {
    try {
      const db = window.fb.firestore;
      await db.collection("users").doc(userId).set(
        {
          isAppOwner: true,
          hasComplimentaryAccess: true,
          lastUpdated: new Date().toISOString(),
        },
        { merge: true },
      );
      console.log("✅ User marked as complimentary owner");
    } catch (error) {
      console.error("❌ Error updating user:", error);
    }
  }

  // Add this method to check payments
  async checkOwnerPayments() {
    try {
      const user = window.fb?.auth?.currentUser;
      if (!user || !this.isAppOwner(user.email)) return;

      const db = window.fb.firestore;

      // Check all payment collections
      const collections = [
        "paypalPayments",
        "momoPayments",
        "bankPayments",
        "premium_payments",
      ];

      console.log("💰 Checking owner payments...");

      for (const collectionName of collections) {
        try {
          const snapshot = await db
            .collection(collectionName)
            .where("userId", "==", user.uid)
            .get();

          if (!snapshot.empty) {
            console.log(
              `⚠️ Found ${snapshot.size} payments in ${collectionName}:`,
            );
            snapshot.forEach((doc) => {
              const data = doc.data();
              console.log(
                `   - ${data.paymentId}: $${data.amountUSD} - ${data.status} - ${data.createdAt}`,
              );

              // Check if any are "completed" (charged)
              if (data.status === "completed") {
                console.warn(
                  `   🚨 CHARGE DETECTED: $${data.amountUSD} on ${data.createdAt}`,
                );
                // You might want to auto-refund or flag for review
              }
            });
          }
        } catch (err) {
          console.log(`   ℹ️ No access to ${collectionName}: ${err.message}`);
        }
      }
    } catch (error) {
      console.error("❌ Error checking payments:", error);
    }
  }

  // Call this periodically or on admin dashboard load
  // this.checkOwnerPayments();

  // ===== ADD THIS METHOD =====
  generatePasscodes(count) {
    console.log(`🔑 Generating ${count} passcodes for bulk subscription`);

    const passcodes = [];
    const now = new Date();

    for (let i = 0; i < count; i++) {
      // Create unique passcode: CONN-TIMESTAMP-RANDOM-NUMBER
      const timestamp = Date.now().toString(36).toUpperCase();
      const random = Math.random().toString(36).substr(2, 4).toUpperCase();
      const number = i.toString().padStart(3, "0");

      const passcode = `CONN-${timestamp}-${random}-${number}`;

      passcodes.push({
        code: passcode,
        createdAt: now.toISOString(),
        expiresAt: new Date(
          now.getTime() + 90 * 24 * 60 * 60 * 1000,
        ).toISOString(), // 90 days
        isUsed: false,
        planType: "bulk",
      });
    }

    console.log(`✅ Generated ${passcodes.length} passcodes`);
    return passcodes;
  }
  // ===== END OF ADDED METHOD =====

  // NEW METHOD: Generate unique passcodes
  async generateAndStorePasscodes(quantity, organizationId, planData) {
    const passcodes = [];
    const batch = []; // For batch writes if you generate many

    for (let i = 0; i < quantity; i++) {
      const part1 = Math.random().toString(36).substr(2, 4).toUpperCase();
      const part2 = Math.random().toString(36).substr(2, 4).toUpperCase();
      const code = `SPON-${part1}-${part2}`;

      // Create passcode document for Firestore
      const passcodeDoc = {
        code: code,
        organizationId: organizationId, // ID of the organization that purchased
        planType: planData.type,
        createdAt: new Date().toISOString(),
        isUsed: false,
        usedByUserId: null,
        usedAt: null,
        expiresAt: new Date(
          Date.now() + 365 * 24 * 60 * 60 * 1000,
        ).toISOString(), // 1 year expiry
      };

      passcodes.push(code);
      // Add to Firestore
      try {
        await addDoc(collection(db, "passcodes"), passcodeDoc);
        console.log(`✅ Passcode saved: ${code}`);
      } catch (error) {
        console.error("❌ Error saving passcode:", error);
      }
    }

    console.log(`🔑 Generated and stored ${passcodes.length} passcodes`);
    return passcodes;
  }

  // UPDATED METHOD: Handle bulk payment success
  async handleBulkPaymentSuccess(selectedPlan, paymentMethod) {
    // ADD THIS CHECK: Prevent multiple executions but allow different payment methods
    const processKey = `bulk_processed_${selectedPlan.type}_${paymentMethod}`;

    if (this[processKey]) {
      console.log(
        `⚠️ Bulk payment already processed for ${paymentMethod}, skipping...`,
      );
      return;
    }

    this[processKey] = true; // Mark this payment method as processed

    try {
      console.log(
        `🏢 ${paymentMethod.toUpperCase()} bulk payment success, setting up organization...`,
      );

      const user = window.fb?.auth?.currentUser;
      if (!user) {
        console.error("❌ No user found for organization setup");
        return;
      }

      // 🔧 FIX: Check if passcodes exist, if not, generate them
      if (!selectedPlan.passcodes) {
        console.log(
          `🔄 No passcodes found for ${paymentMethod}, generating now...`,
        );
        selectedPlan.passcodes = this.generatePasscodes(selectedPlan.userCount);

        // Update localStorage with payment method specific key
        localStorage.setItem(
          `selectedPlan_${paymentMethod}`,
          JSON.stringify(selectedPlan),
        );
      }

      // Setup organization with passcodes
      await this.setupOrganization(
        user.uid,
        selectedPlan.passcodes,
        selectedPlan,
        paymentMethod, // Pass payment method
      );

      console.log(
        `✅ ${paymentMethod.toUpperCase()} organization setup completed with passcodes`,
      );

      // Clear the flag after successful completion
      delete this[processKey];
    } catch (error) {
      console.error(
        `❌ ${paymentMethod.toUpperCase()} bulk payment success handling error:`,
        error,
      );
      // Clear flag on error too
      delete this[processKey];
    }
  }

  // Add this new function to show passcodes AFTER successful payment
  async showPasscodesAfterPayment(paymentMethod) {
    console.log("🎯 Showing content after payment for:", paymentMethod);

    // Get plan from localStorage with payment method
    const planStr = localStorage.getItem(`selectedPlan_${paymentMethod}`);
    if (!planStr) {
      console.error(`❌ No selected plan found for ${paymentMethod}`);
      return;
    }

    const selectedPlan = JSON.parse(planStr);
    console.log("📦 Retrieved plan:", selectedPlan);

    // Check payment status
    const isManuallyConfirmed =
      localStorage.getItem(`paymentConfirmed_${paymentMethod}`) === "true";
    const paymentVerified =
      localStorage.getItem(`paymentVerified_${paymentMethod}`) === "true";
    const paymentId = localStorage.getItem(`paymentId_${paymentMethod}`);

    if (!isManuallyConfirmed || !paymentVerified || !paymentId) {
      console.log(`⏳ ${paymentMethod} requires payment confirmation first`);
      this.showPaymentInstructions(paymentMethod);
      return;
    }

    // Find this line (around line where you have const isBulkPayment = selectedPlan.isBulk || false;)
    // Replace it with:

    // 🔥 IMPROVED BULK DETECTION
    const isBulkPayment =
      selectedPlan.isBulk === true ||
      selectedPlan.isOrganization === true ||
      (selectedPlan.type && selectedPlan.type.includes("bulk")) ||
      (selectedPlan.userCount && selectedPlan.userCount > 1) ||
      (selectedPlan.planType && selectedPlan.planType.includes("bulk")) ||
      false;

    console.log("🔍 Payment type check:", {
      paymentMethod: paymentMethod,
      isBulk: isBulkPayment,
      planType: selectedPlan.type || selectedPlan.planType,
      userCount: selectedPlan.userCount,
      isBulk: selectedPlan.isBulk,
      isOrganization: selectedPlan.isOrganization,
    });

    console.log("🔍 Payment type check:", {
      paymentMethod: paymentMethod,
      isBulk: isBulkPayment,
      planType: selectedPlan.type,
    });

    if (isBulkPayment) {
      // Handle bulk payment - generate and show passcodes
      console.log(`📦 Bulk payment - generating passcodes`);
      const userCount = selectedPlan.userCount || 1;

      // Generate passcodes
      const passcodes = this.generatePasscodes(userCount);
      console.log(`✅ Generated ${passcodes.length} passcodes:`, passcodes);

      // 🔍 Detailed Firebase diagnostic
      console.log("🔍 DETAILED FIREBASE DIAGNOSTIC:");
      console.log("window.fb:", window.fb);
      console.log("window.fb?.firestore:", window.fb?.firestore);
      console.log(
        "window.fb?.firestore?.constructor?.name:",
        window.fb?.firestore?.constructor?.name,
      );
      console.log("window.fb?.app:", window.fb?.app);
      console.log("window.firebase:", window.firebase);

      // 🔥 Find this section in showPasscodesAfterPayment (around line 1193)
      try {
        const user = window.fb?.auth?.currentUser;
        if (!user) throw new Error("No user logged in");

        console.log("📁 Using compat Firestore syntax...");

        // ✅ FIX: Use the compat version that's already loaded
        let db;

        // Method 1: If window.fb.firestore is the compat instance
        if (window.fb && window.fb.firestore) {
          db = window.fb.firestore;
          console.log("📁 Using window.fb.firestore as compat instance");
        }
        // Method 2: If window.firebase.firestore exists (compat)
        else if (window.firebase && window.firebase.firestore) {
          db = window.firebase.firestore();
          console.log("📁 Using window.firebase.firestore() compat");
        }

        if (!db) {
          throw new Error("Could not find Firestore instance");
        }

        console.log("✅ Firestore instance obtained:", db);

        // ✅ Use compat syntax: db.collection().add()
        const passcodesCollection = db.collection("passcodes");
        console.log("📁 Collection reference created");

        // Store each passcode using compat syntax
        const passcodePromises = passcodes.map(async (passcode) => {
          const passcodeData = {
            code: passcode.code,
            createdAt: passcode.createdAt || new Date().toISOString(),
            expiresAt:
              passcode.expiresAt ||
              new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
            isUsed: false,
            planType: "bulk",
            sponsorId: user.uid,
            sponsorEmail: user.email,
            paymentId: paymentId,
            paymentMethod: paymentMethod,
            userId: null,
          };

          // Use compat .add() method
          const docRef = await passcodesCollection.add(passcodeData);
          console.log(
            `✅ Passcode ${passcode.code} stored with ID: ${docRef.id}`,
          );
          return docRef;
        });

        await Promise.all(passcodePromises);
        console.log(
          `✅ Successfully stored ${passcodes.length} passcodes in Firestore`,
        );

        // Also store in localStorage as backup
        localStorage.setItem(
          `bulk_passcodes_${paymentMethod}`,
          JSON.stringify(passcodes),
        );
      } catch (error) {
        console.error("❌ Failed to store passcodes in Firestore:", error);
        console.error("Error details:", error.message);

        // Store in localStorage as fallback
        localStorage.setItem(
          `bulk_passcodes_${paymentMethod}`,
          JSON.stringify(passcodes),
        );
        console.log(
          "⚠️ Stored passcodes in localStorage only (Firestore failed)",
        );
      }

      // Prepare plan data for displayPasscodesToUser
      const planData = {
        orderId: paymentId,
        planType: selectedPlan.type,
        amountUSD: selectedPlan.price || selectedPlan.amountUSD,
        totalAmount: selectedPlan.price || selectedPlan.amountUSD,
        userCount: userCount,
        paymentId: paymentId,
        passcodes: passcodes,
      };

      // Call your display function
      await this.displayPasscodesToUser(passcodes, planData);
    } else {
      // Individual payment - show success message
      console.log("👤 Individual payment - showing success message");
      this.showIndividualSuccessMessage();
    }
  }

  // Add this method for payment instructions
  showPaymentInstructions(paymentMethod) {
    console.log("💰 Showing payment instructions for:", paymentMethod);

    // Get translations - NO AMOUNT PARAMETER
    const t = this.getPaymentInstructions(paymentMethod);
    const lang =
      this.currentLang || localStorage.getItem("userLanguage") || "en";

    let instructions = "";

    if (paymentMethod === "paypal") {
      instructions = `
      <div style="text-align: center; padding: 20px;">
        <h3 style="color: #0070ba; margin-bottom: 20px;">${t.paypalTitle[lang]}</h3>
        <ol style="text-align: left; margin: 20px auto; max-width: 500px;">
          <li>${t.paypalStep1[lang]}</li>
          <li>${t.paypalStep2[lang]}</li>
          <li>${t.paypalStep3[lang]}</li>
          <li>${t.paypalStep4[lang]}</li>
        </ol>
        <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #ffc107;">
          <p style="margin: 0; color: #856404;">⚠️ <strong>${t.important[lang]}:</strong> ${t.warning[lang]}</p>
        </div>
        <p style="margin-top: 20px; font-size: 14px; color: #666;">
          ✅ ${t.afterPayment[lang]}
        </p>
      </div>
    `;
    } else if (paymentMethod === "bank_transfer") {
      instructions = `
      <div style="text-align: center; padding: 20px;">
        <h3 style="color: #0070ba; margin-bottom: 20px;">${t.bankTitle[lang]}</h3>
        <ol style="text-align: left; margin: 20px auto; max-width: 500px;">
          <li>${t.bankStep1[lang]}</li>
          <li>${t.bankStep2[lang]}</li>
          <li>${t.bankStep3[lang]}</li>
          <li>${t.bankStep4[lang]}</li>
        </ol>
        <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #ffc107;">
          <p style="margin: 0; color: #856404;">⚠️ <strong>${t.important[lang]}:</strong> ${t.warning[lang]}</p>
        </div>
        <p style="margin-top: 20px; font-size: 14px; color: #666;">
          ✅ ${t.afterPayment[lang]}
        </p>
      </div>
    `;
    } else if (paymentMethod === "momo") {
      instructions = `
      <div style="text-align: center; padding: 20px;">
        <h3 style="color: #ae2070; margin-bottom: 20px;">${t.momoTitle[lang]}</h3>
        <ol style="text-align: left; margin: 20px auto; max-width: 500px;">
          <li>${t.momoStep1[lang]}</li>
          <li>${t.momoStep2[lang]}</li>
          <li>${t.momoStep3[lang]}</li>
        </ol>
        <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #ffc107;">
          <p style="margin: 0; color: #856404;">⚠️ <strong>${t.important[lang]}:</strong> ${t.warning[lang]}</p>
        </div>
        <p style="margin-top: 20px; font-size: 14px; color: #666;">
          ✅ ${t.afterPayment[lang]}
        </p>
      </div>
    `;
    }

    this.showModal({
      title: t.paymentRequired[lang],
      content: instructions,
      id: "paymentInstructionsModal",
      closeText: t.close[lang],
      width: "600px",
    });
  }

  // ============================================
  // PAYMENT INSTRUCTIONS TRANSLATIONS
  // ============================================
  getPaymentInstructions(paymentMethod) {
    const lang =
      this.currentLang || localStorage.getItem("userLanguage") || "en";

    // Hard-coded translations for all languages
    const translations = {
      // PayPal Instructions
      paypalTitle: {
        en: "PayPal Payment Instructions",
        vi: "Hướng dẫn thanh toán PayPal",
        zh: "PayPal支付说明",
        es: "Instrucciones de pago PayPal",
        hi: "PayPal भुगतान निर्देश",
        ar: "تعليمات الدفع عبر PayPal",
      },
      paypalStep1: {
        en: "Complete the PayPal payment using the button/link above",
        vi: "Hoàn tất thanh toán PayPal bằng nút/liên kết ở trên",
        zh: "使用上面的按钮/链接完成PayPal支付",
        es: "Complete el pago de PayPal usando el botón/enlace de arriba",
        hi: "ऊपर दिए गए बटन/लिंक का उपयोग करके PayPal भुगतान पूरा करें",
        ar: "أكمل الدفع عبر PayPal باستخدام الزر/الرابط أعلاه",
      },
      paypalStep2: {
        en: "Wait for payment confirmation from PayPal",
        vi: "Chờ xác nhận thanh toán từ PayPal",
        zh: "等待PayPal的支付确认",
        es: "Espere la confirmación de pago de PayPal",
        hi: "PayPal से भुगतान पुष्टि की प्रतीक्षा करें",
        ar: "انتظر تأكيد الدفع من PayPal",
      },
      paypalStep3: {
        en: "Return to this page and click 'Confirm Payment'",
        vi: "Quay lại trang này và nhấp 'Xác nhận thanh toán'",
        zh: "返回此页面并点击“确认支付”",
        es: "Vuelva a esta página y haga clic en 'Confirmar pago'",
        hi: "इस पृष्ठ पर वापस आएं और 'भुगतान की पुष्टि करें' पर क्लिक करें",
        ar: "عد إلى هذه الصفحة وانقر على 'تأكيد الدفع'",
      },
      paypalStep4: {
        en: "After confirmation, your passcodes will be generated",
        vi: "Sau khi xác nhận, mã truy cập của bạn sẽ được tạo",
        zh: "确认后，您的密码将被生成",
        es: "Después de la confirmación, se generarán sus códigos de acceso",
        hi: "पुष्टि के बाद, आपके पासकोड उत्पन्न हो जाएंगे",
        ar: "بعد التأكيد، سيتم إنشاء رموز المرور الخاصة بك",
      },

      // Bank Transfer Instructions
      bankTitle: {
        en: "Bank Transfer Instructions",
        vi: "Hướng dẫn chuyển khoản ngân hàng",
        zh: "银行转账说明",
        es: "Instrucciones de transferencia bancaria",
        hi: "बैंक ट्रांसफर निर्देश",
        ar: "تعليمات التحويل البنكي",
      },
      bankStep1: {
        en: "Complete the bank transfer using the details above",
        vi: "Hoàn tất chuyển khoản ngân hàng bằng thông tin ở trên",
        zh: "使用上面的详细信息完成银行转账",
        es: "Complete la transferencia bancaria usando los detalles anteriores",
        hi: "ऊपर दिए गए विवरण का उपयोग करके बैंक ट्रांसफर पूरा करें",
        ar: "أكمل التحويل البنكي باستخدام التفاصيل أعلاه",
      },
      bankStep2: {
        en: "Take a screenshot of the transfer confirmation",
        vi: "Chụp ảnh màn hình xác nhận chuyển khoản",
        zh: "拍摄转账确认的屏幕截图",
        es: "Tome una captura de pantalla de la confirmación de la transferencia",
        hi: "ट्रांसफर पुष्टि का स्क्रीनशॉट लें",
        ar: "التقط لقطة شاشة لتأكيد التحويل",
      },
      bankStep3: {
        en: "Return to this page and click 'Confirm Payment'",
        vi: "Quay lại trang này và nhấp 'Xác nhận thanh toán'",
        zh: "返回此页面并点击“确认支付”",
        es: "Vuelva a esta página y haga clic en 'Confirmar pago'",
        hi: "इस पृष्ठ पर वापस आएं और 'भुगतान की पुष्टि करें' पर क्लिक करें",
        ar: "عد إلى هذه الصفحة وانقر على 'تأكيد الدفع'",
      },
      bankStep4: {
        en: "After verification, your passcodes will be generated",
        vi: "Sau khi xác minh, mã truy cập của bạn sẽ được tạo",
        zh: "验证后，您的密码将被生成",
        es: "Después de la verificación, se generarán sus códigos de acceso",
        hi: "सत्यापन के बाद, आपके पासकोड उत्पन्न हो जाएंगे",
        ar: "بعد التحقق، سيتم إنشاء رموز المرور الخاصة بك",
      },

      // MoMo Instructions - SIMPLIFIED
      momoTitle: {
        en: "MoMo Payment Instructions",
        vi: "Hướng dẫn thanh toán MoMo",
        zh: "MoMo支付说明",
        es: "Instrucciones de pago MoMo",
        hi: "MoMo भुगतान निर्देश",
        ar: "تعليمات الدفع عبر MoMo",
      },
      momoStep1: {
        en: "Open your MoMo app and complete the payment using the QR code or phone number provided",
        vi: "Mở ứng dụng MoMo và hoàn tất thanh toán bằng mã QR hoặc số điện thoại được cung cấp",
        zh: "打开MoMo应用，使用提供的二维码或电话号码完成支付",
        es: "Abra la aplicación MoMo y complete el pago usando el código QR o número de teléfono proporcionado",
        hi: "MoMo ऐप खोलें और दिए गए क्यूआर कोड या फोन नंबर का उपयोग करके भुगतान पूरा करें",
        ar: "افتح تطبيق MoMo وأكمل الدفع باستخدام رمز الاستجابة السريعة أو رقم الهاتف المقدم",
      },
      momoStep2: {
        en: "Return to this page and click 'Confirm Payment' after completing the payment",
        vi: "Quay lại trang này và nhấp 'Xác nhận thanh toán' sau khi hoàn tất thanh toán",
        zh: "完成支付后返回此页面并点击“确认支付”",
        es: "Vuelva a esta página y haga clic en 'Confirmar pago' después de completar el pago",
        hi: "भुगतान पूरा करने के बाद इस पृष्ठ पर वापस आएं और 'भुगतान की पुष्टि करें' पर क्लिक करें",
        ar: "عد إلى هذه الصفحة وانقر على 'تأكيد الدفع' بعد إتمام الدفع",
      },
      momoStep3: {
        en: "After confirmation, your passcodes will be generated",
        vi: "Sau khi xác nhận, mã truy cập của bạn sẽ được tạo",
        zh: "确认后，您的密码将被生成",
        es: "Después de la confirmación, se generarán sus códigos de acceso",
        hi: "पुष्टि के बाद, आपके पासकोड उत्पन्न हो जाएंगे",
        ar: "بعد التأكيد، سيتم إنشاء رموز المرور الخاصة بك",
      },

      // Common elements
      important: {
        en: "Important",
        vi: "Quan trọng",
        zh: "重要",
        es: "Importante",
        hi: "महत्वपूर्ण",
        ar: "مهم",
      },
      warning: {
        en: "⚠️ Passcodes will NOT be generated until payment is confirmed.",
        vi: "⚠️ Mã truy cập sẽ KHÔNG được tạo cho đến khi thanh toán được xác nhận.",
        zh: "⚠️ 在付款确认之前不会生成密码。",
        es: "⚠️ NO se generarán códigos hasta que se confirme el pago.",
        hi: "⚠️ भुगतान की पुष्टि होने तक पासकोड उत्पन्न नहीं होंगे।",
        ar: "⚠️ لن يتم إنشاء رموز المرور حتى يتم تأكيد الدفع.",
      },
      afterPayment: {
        en: "✅ After completing payment, click 'Confirm Payment' again to receive your passcodes.",
        vi: "✅ Sau khi hoàn tất thanh toán, nhấp 'Xác nhận thanh toán' lần nữa để nhận mã truy cập.",
        zh: "✅ 完成支付后，再次点击“确认支付”以接收您的密码。",
        es: "✅ Después de completar el pago, haga clic nuevamente en 'Confirmar pago' para recibir sus códigos.",
        hi: "✅ भुगतान पूरा करने के बाद, अपने पासकोड प्राप्त करने के लिए फिर से 'भुगतान की पुष्टि करें' पर क्लिक करें।",
        ar: "✅ بعد إتمام الدفع، انقر على 'تأكيد الدفع' مرة أخرى لاستلام رموز المرور الخاصة بك.",
      },
      paymentRequired: {
        en: "Payment Required",
        vi: "Yêu cầu thanh toán",
        zh: "需要付款",
        es: "Pago requerido",
        hi: "भुगतान आवश्यक",
        ar: "الدفع مطلوب",
      },
      close: {
        en: "Close",
        vi: "Đóng",
        zh: "关闭",
        es: "Cerrar",
        hi: "बंद करें",
        ar: "إغلاق",
      },
    };

    return translations;
  }

  showFallbackInstructions(paymentMethod) {
    console.log("📢 Showing fallback instructions for:", paymentMethod);

    const instructions = {
      paypal: `
            <div style="text-align: center; padding: 20px;">
                <h3 style="color: #0070ba;">PayPal Payment Instructions</h3>
                <ol style="text-align: left; margin: 20px auto; max-width: 500px;">
                    <li>Complete the PayPal payment using the button/link above</li>
                    <li>Wait for payment confirmation from PayPal</li>
                    <li>Return to this page and click 'Confirm Payment'</li>
                    <li>After confirmation, your passcodes will be generated</li>
                </ol>
                <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    ⚠️ <strong>Important:</strong> Passcodes will NOT be generated until payment is confirmed.
                </div>
                <p style="margin-top: 20px;">✅ After completing payment, click "Confirm Payment" again to receive your passcodes.</p>
            </div>
        `,
      bank_transfer: `
            <div style="text-align: center; padding: 20px;">
                <h3 style="color: #0070ba;">Bank Transfer Instructions</h3>
                <ol style="text-align: left; margin: 20px auto; max-width: 500px;">
                    <li>Complete the bank transfer using the details above</li>
                    <li>Take a screenshot of the transfer confirmation</li>
                    <li>Return to this page and click 'Confirm Payment'</li>
                    <li>After verification, your passcodes will be generated</li>
                </ol>
                <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    ⚠️ <strong>Important:</strong> Passcodes will NOT be generated until payment is confirmed.
                </div>
                <p style="margin-top: 20px;">✅ After completing transfer, click "Confirm Payment" again to receive your passcodes.</p>
            </div>
        `,
      momo: `
            <div style="text-align: center; padding: 20px;">
                <h3 style="color: #ae2070;">MoMo Payment Instructions</h3>
                <ol style="text-align: left; margin: 20px auto; max-width: 500px;">
                    <li>Open your MoMo app and complete the payment using the provided QR code or phone number</li>
                    <li>Return to this page and click 'Confirm Payment' after completing the payment</li>
                    <li>After confirmation, your passcodes will be generated</li>
                </ol>
                <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    ⚠️ <strong>Important:</strong> Passcodes will NOT be generated until payment is confirmed.
                </div>
                <p style="margin-top: 20px;">✅ After completing payment, click "Confirm Payment" again to receive your passcodes.</p>
            </div>
        `,
    };

    this.showModal({
      title: "Payment Required",
      content: instructions[paymentMethod] || instructions.bank_transfer,
      id: "paymentInstructionsModal",
      closeText: "Close",
    });
  }

  showIndividualSuccessMessage() {
    console.log("👤 Showing individual payment success message");

    // Get translations based on current language
    const title =
      this.getTranslation("individual_success_title") ||
      "✅ Subscription Activated!";
    const message =
      this.getTranslation("individual_success_message") ||
      "Your individual subscription has been activated successfully. You can now use all premium features.";
    const buttonText =
      this.getTranslation("continue_to_dashboard") || "Continue to Dashboard";

    const modalContent = `
    <div style="text-align: center; padding: 30px;">
        <div style="font-size: 48px; color: #4CAF50; margin-bottom: 20px;">✅</div>
        <h3 style="color: #333; margin-bottom: 15px;">${title}</h3>
        <p style="color: #666; font-size: 16px; line-height: 1.5; margin-bottom: 30px;">
            ${message}
        </p>
        <button onclick="window.premiumManager.redirectToDashboard()" 
                style="padding: 12px 30px; background: #4CAF50; 
                       color: white; border: none; border-radius: 5px; 
                       font-size: 16px; font-weight: bold; cursor: pointer;">
            ${buttonText}
        </button>
    </div>
  `;

    this.showPaymentModal(title, modalContent);
  }

  // Add this helper function
  redirectToDashboard() {
    window.location.href = "/dashboard.html";
  }

  getTranslation(key) {
    const translations = {
      individual_success_title: {
        en: "✅ Subscription Activated!",
        vi: "✅ Đã Kích Hoạt Gói Đăng Ký!",
        zh: "✅ 订阅已激活！",
        es: "✅ ¡Suscripción Activada!",
        hi: "✅ सदस्यता सक्रिय!",
        ar: "✅ تم تفعيل الاشتراك!",
      },
      individual_success_message: {
        en: "Your individual subscription has been activated successfully. You can now use all premium features.",
        vi: "Gói đăng ký cá nhân của bạn đã được kích hoạt thành công. Bây giờ bạn có thể sử dụng tất cả tính năng cao cấp.",
        zh: "您的个人订阅已成功激活。您现在可以使用所有高级功能。",
        es: "Tu suscripción individual ha sido activada exitosamente. Ahora puedes usar todas las funciones premium.",
        hi: "आपकी व्यक्तिगत सदस्यता सफलतापूर्वक सक्रिय हो गई है। अब आप सभी प्रीमियम सुविधाओं का उपयोग कर सकते हैं।",
        ar: "تم تفعيل اشتراكك الفردي بنجاح. يمكنك الآن استخدام جميع الميزات المميزة.",
      },
      continue_to_dashboard: {
        en: "Continue to Dashboard",
        vi: "Tiếp tục đến Bảng điều khiển",
        zh: "继续到仪表板",
        es: "Continuar al Panel",
        hi: "डैशबोर्ड पर जारी रखें",
        ar: "المتابعة إلى لوحة التحكم",
      },
    };

    if (translations[key] && translations[key][this.currentLang]) {
      return translations[key][this.currentLang];
    }

    // Fallback to English
    return translations[key] ? translations[key].en : key;
  }

  // NEW METHOD: Setup organization in Firestore
  async setupOrganization(orgId, passcodes, planData) {
    try {
      console.log(
        `🏢 Setting up organization ${orgId} with ${passcodes.length} passcodes`,
      );

      // 🔥 CRITICAL FIX: Save passcodes to Firestore
      await this.savePasscodesToFirestore(orgId, passcodes, planData);

      // Also store in localStorage for quick access
      const orgData = {
        organizationId: orgId,
        passcodes: passcodes,
        planData: planData,
        createdAt: new Date().toISOString(),
        totalPasscodes: passcodes.length,
        availablePasscodes: passcodes.length,
      };

      localStorage.setItem(`organization_${orgId}`, JSON.stringify(orgData));
      localStorage.setItem(`org_passcodes_${orgId}`, JSON.stringify(passcodes));

      console.log(`✅ Organization data stored locally for: ${orgId}`);
      console.log(`🔑 Passcodes saved to Firestore and localStorage`);

      // Show success message with passcodes
      this.displayPasscodesToUser(passcodes, planData);
    } catch (error) {
      console.error("❌ Organization setup error:", error);
      // Even if storage fails, still show passcodes to user
      this.displayPasscodesToUser(passcodes, planData);
    }
  }

  async savePasscodesToFirestore(sponsorId, passcodesArray, planData) {
    try {
      console.log(
        `💾 Saving ${passcodesArray.length} passcodes to Firestore for sponsor: ${sponsorId}`,
      );

      // Check if Firebase is available
      if (!window.fb || !window.fb.firestore) {
        throw new Error("Firebase Firestore not available");
      }

      const db = window.fb.firestore;
      const batch = db.batch();
      const now = new Date();

      // Calculate expiry date (90 days from now)
      const expiresAt = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);

      // Prepare passcodes for Firestore
      passcodesArray.forEach((passcodeObj, index) => {
        const passcodeDoc = {
          code: passcodeObj.code,
          createdAt: firebase.firestore.Timestamp.fromDate(now),
          expiresAt: firebase.firestore.Timestamp.fromDate(expiresAt),
          isUsed: false,
          planType: planData.planType || "bulk",
          sponsorId: sponsorId,
          sponsorEmail: window.fb.auth?.currentUser?.email || "",
          usedBy: null,
          usedAt: null,
          orderId: planData.orderId || `bulk_${Date.now()}`,
          userCount: passcodesArray.length,
        };

        // Create a document reference with a custom ID (the passcode itself)
        const docRef = db.collection("passcodes").doc(passcodeObj.code);
        batch.set(docRef, passcodeDoc);

        console.log(`📝 Prepared passcode: ${passcodeObj.code}`);
      });

      // Commit the batch
      await batch.commit();
      console.log(
        `🎉 Successfully saved ${passcodesArray.length} passcodes to Firestore`,
      );

      return true;
    } catch (error) {
      console.error("❌ Error saving passcodes to Firestore:", error);

      // Try alternative method if batch fails
      if (error.code === "failed-precondition") {
        console.log("⚠️ Batch write failed, trying individual writes...");
        return await this.savePasscodesIndividually(
          sponsorId,
          passcodesArray,
          planData,
        );
      }

      throw error;
    }
  }

  // Helper method for individual writes (if batch fails)
  async savePasscodesIndividually(sponsorId, passcodesArray, planData) {
    try {
      console.log(
        `🔄 Saving ${passcodesArray.length} passcodes individually...`,
      );

      if (!window.fb || !window.fb.firestore) {
        throw new Error("Firebase Firestore not available");
      }

      const db = window.fb.firestore;
      const now = new Date();
      const expiresAt = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);

      let successCount = 0;

      for (const passcodeObj of passcodesArray) {
        try {
          const passcodeDoc = {
            code: passcodeObj.code,
            createdAt: firebase.firestore.Timestamp.fromDate(now),
            expiresAt: firebase.firestore.Timestamp.fromDate(expiresAt),
            isUsed: false,
            planType: planData.planType || "bulk",
            sponsorId: sponsorId,
            sponsorEmail: window.fb.auth?.currentUser?.email || "",
            usedBy: null,
            usedAt: null,
            orderId: planData.orderId || `bulk_${Date.now()}`,
            userCount: passcodesArray.length,
          };

          await db
            .collection("passcodes")
            .doc(passcodeObj.code)
            .set(passcodeDoc);
          successCount++;
          console.log(`✅ Saved passcode: ${passcodeObj.code}`);

          // Small delay to avoid rate limiting
          await new Promise((resolve) => setTimeout(resolve, 50));
        } catch (docError) {
          console.error(
            `❌ Failed to save passcode ${passcodeObj.code}:`,
            docError,
          );
        }
      }

      console.log(
        `🎉 Successfully saved ${successCount}/${passcodesArray.length} passcodes to Firestore`,
      );
      return successCount > 0;
    } catch (error) {
      console.error("❌ Individual save failed:", error);
      return false;
    }
  }

  // NEW METHOD: Calculate expiry date based on plan type
  calculateExpiryDate(planType) {
    const now = new Date();
    switch (planType) {
      case "monthly":
        return new Date(now.setMonth(now.getMonth() + 1));
      case "three_months":
        return new Date(now.setMonth(now.getMonth() + 3));
      case "six_months":
        return new Date(now.setMonth(now.getMonth() + 6));
      case "yearly":
        return new Date(now.setFullYear(now.getFullYear() + 1));
      default:
        return new Date(now.setFullYear(now.getFullYear() + 1)); // Default to yearly
    }
  }

  // UPDATED METHOD: Send passcodes via email instead of popup
  async displayPasscodesToUser(passcodes, planData) {
    console.log("📧 displayPasscodesToUser called - Using EMAIL system");

    const lang = this.currentLang;

    try {
      const user = window.fb?.auth?.currentUser;
      if (!user || !user.email) throw new Error("No user email");

      console.log("📤 Sending to:", user.email);

      const emailResult = await this.sendPasscodesByEmail(passcodes, {
        orderId: planData.orderId || planData.paymentId || `bulk_${Date.now()}`,
        planType: planData.planType || planData.type,
        totalAmount: planData.amountUSD || planData.totalAmount,
        userCount: passcodes.length,
        language: lang,
      });

      if (emailResult.success) {
        console.log("✅ Passcodes process successful");

        const t = this.emailTranslations[lang] || this.emailTranslations.en;

        // Create download link
        const downloadLink = emailResult.data.downloadUrl;
        const fileName = emailResult.data.fileName;

        // Helper function to close modal and clean up URL
        const closeModalAndCleanup = () => {
          const modal = document.getElementById("passcodesModal");
          if (modal) {
            modal.remove();
          }

          // Clean up the URL object
          if (downloadLink) {
            try {
              if (
                window.URL &&
                typeof window.URL.revokeObjectURL === "function"
              ) {
                window.URL.revokeObjectURL(downloadLink);
              }
            } catch (e) {
              console.log("URL cleanup on close:", e);
            }
          }
        };

        const modalContent = `
<div style="text-align: center; padding: 25px;">
  <div style="font-size: 60px; color: #4CAF50; margin-bottom: 20px;">📥</div>
  <h3 style="color: #4CAF50; margin-bottom: 15px;">${t.bulkSuccessTitle || "Bulk Subscription Successful!"}</h3>
  <p style="font-size: 16px; margin-bottom: 20px;">${t.bulkSuccessMessage || "Your organization subscription is now active."}</p>
  
  <div style="background: #e8f5e9; padding: 20px; border-radius: 10px; margin: 20px 0; text-align: left;">
    <h4 style="margin-top: 0; color: #2e7d32;">📋 ${t.orderSummary || "Order Summary"}:</h4>
    <p><strong>${t.orderId || "Order ID"}:</strong> ${emailResult.data?.orderDetails?.orderId || planData.orderId || planData.paymentId || `BULK_${Date.now().toString().slice(-8)}`}</p>
    <p><strong>${t.plan || "Plan"}:</strong> ${(t.planTypes && t.planTypes[planData.planType]) || planData.planType}</p>
    <p><strong>${t.totalAmount || "Total Amount"}:</strong> $${planData.amountUSD || planData.totalAmount}</p>
    <p><strong>${t.userCount || "Passcodes Generated"}:</strong> ${passcodes.length}</p>
  </div>
  
  <div style="margin: 30px 0;">
    <a href="${downloadLink}" 
       download="${fileName}"
       onclick="setTimeout(() => { 
         try { 
           if(window.URL && typeof window.URL.revokeObjectURL === 'function') {
             window.URL.revokeObjectURL('${downloadLink}');
           }
         } catch(e) {
           console.log('URL cleanup:', e);
         }
       }, 10000)"
       style="display: inline-block; padding: 18px 35px; background: #2196F3; color: white; 
              text-decoration: none; border-radius: 10px; font-size: 18px; font-weight: bold;
              box-shadow: 0 4px 8px rgba(33, 150, 243, 0.3); transition: all 0.3s;"
       onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 12px rgba(33, 150, 243, 0.4)';"
       onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 8px rgba(33, 150, 243, 0.3)';">
      ⬇️ ${t.downloadButton || "Download Passcodes File"}
    </a>
  </div>

  // In your modal content, add this near the instructions:
<div style="background: #e3f2fd; padding: 10px; border-radius: 5px; margin: 10px 0;">
    <p style="margin: 0; color: #0d47a1;">✅ Passcodes have been securely stored and are ready for your sponsored users to sign up.</p>
</div>
  
  <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: left; border: 1px solid #ffc107;">
    <h4 style="margin-top: 0; color: #856404;">📝 ${t.instructionsTitle || "Instructions"}:</h4>
    <ol style="margin: 10px 0; padding-left: 20px;">
      <li>${t.step1 || "Click the button above to download the passcodes file"}</li>
      <li>${t.step2 || "Open the downloaded file (.txt)"}</li>
      <li>${t.step3 || "Copy the passcodes and send to your sponsored users"}</li>
      <li>${t.step4 || "Each passcode can be used only once"}</li>
    </ol>
  </div>
  
  <div style="margin-top: 25px;">
    <button onclick="navigator.clipboard.writeText(\`${emailResult.data.fileContent.replace(/`/g, "\\`")}\`); alert('${t.copied || "Passcodes copied to clipboard!"}')"
            style="margin-right: 10px; padding: 10px 20px; background: #FF9800; color: white; 
                   border: none; border-radius: 5px; cursor: pointer;">
      📋 ${t.copyAll || "Copy to Clipboard"}
    </button>
  </div>
</div>
`;

        this.showModal({
          title: t.bulkSuccessTitle || "Passcodes Ready",
          content: modalContent,
          id: "passcodesModal",
          closeText: t.close || "Close",
          closeButton: true,
          closeButtonColor: "#666", // Gray background to match your design
        });
      }
    } catch (error) {
      console.error("❌ Passcode delivery failed:", error);

      // SIMPLE FALLBACK ALERT (only 2 translations needed)
      const oldTranslations = {
        en: {
          success: "Bulk subscription successful!",
          passcodes: "Your sponsorship passcodes",
        },
        vi: {
          success: "Đăng ký gói số lượng lớn thành công!",
          passcodes: "Mã mời tài trợ của bạn",
        },
        zh: { success: "批量订阅成功！", passcodes: "您的赞助邀请码" },
        es: {
          success: "¡Suscripción masiva exitosa!",
          passcodes: "Sus códigos de patrocinio",
        },
        ar: {
          success: "نجاح الاشتراك الجماعي!",
          passcodes: "رموز الرعاية الخاصة بك",
        },
        hi: { success: "बल्क सदस्यता सफल!", passcodes: "आपके प्रायोजन कोड" },
      };

      const t = oldTranslations[lang] || oldTranslations.en;
      const passcodesList = passcodes.map((p) => `• ${p.code}`).join("\n");
      alert(`⚠️ ${t.success}\n\n${t.passcodes}:\n${passcodesList}`);
    }
  }

  // NEW METHOD: Show bulk success message
  showBulkSuccessMessage(planData) {
    // This will be called after payment processing
    console.log("🎉 Bulk subscription completed successfully");

    // You can add UI updates here if needed
    const successElement = document.getElementById("bulkSuccessMessage");
    if (successElement) {
      successElement.style.display = "block";
      successElement.innerHTML = `
        <h3>✅ Bulk Subscription Successful!</h3>
        <p>You have purchased ${planData.userCount} sponsored accounts.</p>
        <p>Passcodes have been generated and are available in your organization dashboard.</p>
        <p><strong>Next steps:</strong></p>
        <ol>
          <li>Distribute passcodes to users you want to sponsor</li>
          <li>Sponsored users will sign up using these codes</li>
          <li>Your logo will automatically appear on their accounts</li>
        </ol>
      `;
    }
  }

  checkPendingSubscription() {
    setTimeout(() => {
      const pendingSubscription = localStorage.getItem("subscriptionIntent");
      const user = window.fb?.auth?.currentUser;

      if (pendingSubscription && user) {
        console.log(
          "✅ User returned authenticated with pending subscription:",
          pendingSubscription,
        );
        const shouldAutoSelect = confirm(
          `Welcome back! Would you like to proceed with your ${pendingSubscription} subscription?`,
        );

        if (shouldAutoSelect) {
          this.handleSubscriptionSelection(pendingSubscription);
        }

        localStorage.removeItem("subscriptionIntent");
      }
    }, 2000);
  }

  waitForFirebase() {
    return new Promise((resolve) => {
      let attempts = 0;
      const checkFirebase = () => {
        attempts++;
        if (window.fb && window.fb.auth) {
          console.log("✅ Firebase ready after", attempts, "attempts");
          resolve();
        } else if (attempts < 10) {
          console.log("⏳ Waiting for Firebase...", attempts);
          setTimeout(checkFirebase, 500);
        } else {
          console.error("❌ Firebase not ready after 10 attempts");
          resolve();
        }
      };
      checkFirebase();
    });
  }

  setupLanguageButtons() {
    const langButtons = document.querySelectorAll(".lang-btn");
    langButtons.forEach((btn) => {
      const newBtn = btn.cloneNode(true);
      btn.parentNode.replaceChild(newBtn, btn);

      newBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();

        const selectedLang = newBtn.getAttribute("data-lang");
        console.log("Switching premium page to:", selectedLang);

        localStorage.setItem("premiumLanguage", selectedLang);
        this.currentLang = selectedLang;

        this.loadEmbeddedTranslations();
        this.updateActiveLanguageButton();
        this.updatePricingDisplay();
      });
    });

    this.updateActiveLanguageButton();
  }

  updateActiveLanguageButton() {
    document.querySelectorAll(".lang-btn").forEach((btn) => {
      const btnLang = btn.getAttribute("data-lang");
      if (btnLang === this.currentLang) {
        btn.classList.add("active");
      } else {
        btn.classList.remove("active");
      }
    });
  }

  loadEmbeddedTranslations() {
    console.log(
      "Loading embedded translations for premium page:",
      this.currentLang,
    );

    const allTranslations = {
      en: {
        title: "Connections",
        subtitle: "Your all-in-one community communication hub",
        beta_banner: "🚀 Beta Version - Special Launch Pricing!",
        expiry_notice: "📅 Subscriptions expire after selected period",
        image_limits: "📸 5 images per report limit",
        individual_plans: "Individual Plans",
        individual_subtitle: "Personal plans for individual users",
        monthly: "Monthly",
        three_months: "3 Months",
        six_months: "6 Months",
        yearly: "Yearly",
        save_10: "Save 10%",
        save_20: "Save 20%",
        save_42: "Save 42%",
        subscribe: "Subscribe",
        popular: "Popular",
        feature1: "Personal avatar",
        feature2: "5 images per report",
        feature3: "Unlimited reports",
        feature4: "Multi-platform sharing",
        momo: "MoMo",
        bank_transfer: "Bank Transfer",
        bulk_plans: "Bulk Plans",
        bulk_subtitle:
          "Sponsor users and display your logo. Your logo is fixed; sponsored users cannot change it. Perfect for airports, schools, businesses, and organizations.",
        user_count: "Users:",
        plan_type: "Plan Type:",
        calculate: "Calculate",
        price_per_user: "Price per user:",
        total_price: "Total:",
        you_save: "You save:",
        per_month: "per month",
        all_rights: "All rights reserved",
        beta_footer: "Beta Version - Prices may change",
        please_select_plan: "Please select a subscription plan first",
        please_sign_in: "Please sign in to proceed with payment",
        payment_failed: "Payment initialization failed. Please try again.",
        save_5: "Save 5%",
        save_12: "Save 12%",
        save_15: "Save 15%",
        save_40: "Save 40%",
        plan_type_monthly: "Monthly",
        plan_type_three_months: "3 Months",
        plan_type_six_months: "6 Months",
        plan_type_yearly: "Yearly",
        user: "user",
        users: "users",
        month: "month",
        months: "months",
        year: "year",
        select_payment_method: "Select Payment Method",
        complete_payment: "Complete Your Payment",
        payment_instructions: "Payment Instructions:",
        note: "Note:",
        copy_instructions: "Copy Instructions",
        processing_payment: "Processing Payment...",
        test_mode: "TEST MODE",
        moving_to_login: "Moving to login...",
        subscription_activated: "Subscription Activated",
        subscription_failed: "Subscription Failed",
        try_again: "Try Again",
        contact_support: "Contact Support",
        features: "Features",
        benefits: "Benefits",
        included: "Included",
        not_included: "Not Included",
        current_plan: "Current Plan",
        upgrade_now: "Upgrade Now",
        renew_subscription: "Renew Subscription",
        cancel_subscription: "Cancel Subscription",
        subscription_details: "Subscription Details",
        valid_until: "Valid Until",
        days_remaining: "days remaining",
        expired: "Expired",
        active: "Active",
        pending: "Pending",
        cancelled: "Cancelled",
        manual_payment_required: "Manual Payment Required",
        payment_note_reference:
          "Please include the reference number in your payment",
        close: "Close",
        copied: "Payment instructions copied to clipboard!",
        cancel: "Cancel",
        copy_failed: "Please copy the instructions manually.",
        error: "Error",
        manual: "Manual",
        momo_payment: "MoMo payment",
        amount: "Amount",
        phone: "Phone",
        account: "Account",
        reference: "Reference",
        check_status: "Check Payment Status",
        payment_status_checking: "Checking payment status...",
        payment_status_pending:
          "Payment still pending. Please complete the transfer.",
        payment_status_completed: "Payment Completed!",
        payment_activated: "Your subscription has been activated. Thank you!",
        scan_qr_instructions:
          "1. Open MoMo app\n2. Scan QR code or transfer to the phone number above\n3. Include the reference in the transfer content\n4. Click 'Check Status' after transferring",
        paypal_payment_beta: "PayPal Payment - Beta",
        beta_version: "Beta Version",
        manual_payment: "Manual Payment",
        include_reference: "Include this EXACT reference",
        take_screenshot: "Take a screenshot",
        activate_within_24h: "We'll activate within 24 hours",
        order_id: "Order ID",
        thank_you_beta: "Thank you for supporting during our beta phase!",
        paypal_email: "Email",
        plan: "Plan",
        subscribe_bulk: "Subscribe Bulk Plan",
        bulk_note:
          "After payment, you'll receive sponsor codes to distribute to your users.",
        choose_payment: "Choose Payment Method",
        bank_transfer: "Bank Transfer",
        paypal: "PayPal",
        momo: "MoMo",
        plan: "Plan",
        users: "Users",
        amount: "Amount",
        copy_instructions: "Copy Instructions",
        close: "Close",
        bulk_payment: "Organization Bulk Payment",
        bulk_monthly_plan: "Monthly Bulk Plan",
        bulk_three_months_plan: "3-Month Bulk Plan",
        bulk_six_months_plan: "6-Month Bulk Plan",
        bulk_yearly_plan: "Yearly Bulk Plan",
        organization_bulk_plan: "Organization Bulk Plan",
        enter_order_info: "Enter the order information below when prompted",
        order_info_for_both: "ORDER INFORMATION",
        complimentaryAccess:
          "Complimentary bulk access granted! You can now sponsor users.",
        ownerAccessTitle: "Owner Access Granted",
        ownerAccessMessage:
          "As the app owner, you have received complimentary access to sponsor {count} users.",
        freePasscodes: "Free Passcodes Generated",
      },
      vi: {
        title: "Kết Nối",
        subtitle: "Trung tâm giao tiếp cộng đồng toàn diện của bạn",
        beta_banner: "🚀 Phiên bản Beta - Ưu đãi đặc biệt!",
        expiry_notice: "📅 Gói đăng ký hết hạn sau thời gian đã chọn",
        image_limits: "📸 Giới hạn 5 hình ảnh mỗi báo cáo",
        individual_plans: "Gói Cá Nhân",
        individual_subtitle: "Gói cá nhân cho người dùng riêng lẻ",
        monthly: "Hàng Tháng",
        three_months: "3 Tháng",
        six_months: "6 Tháng",
        yearly: "Hàng Năm",
        save_10: "Tiết kiệm 10%",
        save_20: "Tiết kiệm 20%",
        save_42: "Tiết kiệm 42%",
        subscribe: "Đăng ký",
        popular: "Phổ biến",
        feature1: "Ảnh đại diện cá nhân",
        feature2: "5 ảnh mỗi báo cáo",
        feature3: "Báo cáo không giới hạn",
        feature4: "Chia sẻ đa nền tảng",
        momo: "MoMo",
        bank_transfer: "Chuyển khoản Ngân hàng",
        bulk_plans: "Gói Tập Thể",
        bulk_subtitle:
          "Tài trợ người dùng và hiển thị logo của bạn. Logo của bạn cố định; khách hàng được tài trợ không thể thay đổi logo của bạn. Lý tưởng cho sân bay, trường học, doanh nghiệp và tổ chức.",
        user_count: "Số người dùng:",
        plan_type: "Loại gói:",
        calculate: "Tính toán",
        price_per_user: "Giá mỗi người dùng:",
        total_price: "Tổng cộng:",
        you_save: "Bạn tiết kiệm:",
        per_month: "mỗi tháng",
        all_rights: "Đã đăng ký bản quyền",
        beta_footer: "Phiên bản Beta - Giá có thể thay đổi",
        please_select_plan: "Vui lòng chọn gói đăng ký trước",
        please_sign_in: "Vui lòng đăng nhập để tiếp tục thanh toán",
        payment_failed: "Khởi tạo thanh toán thất bại. Vui lòng thử lại.",
        save_5: "Tiết kiệm 5%",
        save_12: "Tiết kiệm 12%",
        save_15: "Tiết kiệm 15%",
        save_40: "Tiết kiệm 40%",
        plan_type_monthly: "Hàng Tháng",
        plan_type_three_months: "3 Tháng",
        plan_type_six_months: "6 Tháng",
        plan_type_yearly: "Hàng Năm",
        user: "người dùng",
        users: "người dùng",
        month: "tháng",
        months: "tháng",
        year: "năm",
        select_payment_method: "Chọn Phương Thức Thanh Toán",
        complete_payment: "Hoàn Tất Thanh Toán",
        payment_instructions: "Hướng dẫn Thanh toán:",
        note: "Lưu ý:",
        copy_instructions: "Sao chép Hướng dẫn",
        processing_payment: "Đang xử lý Thanh toán...",
        test_mode: "CHẾ ĐỘ THỬ NGHIỆM",
        moving_to_login: "Đang chuyển đến trang đăng nhập...",
        subscription_activated: "Đã Kích hoạt Đăng ký",
        subscription_failed: "Đăng ký Thất bại",
        try_again: "Thử lại",
        contact_support: "Liên hệ Hỗ trợ",
        features: "Tính năng",
        benefits: "Lợi ích",
        included: "Bao gồm",
        not_included: "Không bao gồm",
        current_plan: "Gói Hiện tại",
        upgrade_now: "Nâng cấp Ngay",
        renew_subscription: "Gia hạn Đăng ký",
        cancel_subscription: "Hủy Đăng ký",
        subscription_details: "Chi tiết Đăng ký",
        valid_until: "Có hiệu lực đến",
        days_remaining: "ngày còn lại",
        expired: "Đã hết hạn",
        active: "Đang hoạt động",
        pending: "Đang chờ xử lý",
        cancelled: "Đã hủy",
        manual_payment_required: "Yêu cầu Thanh toán Thủ công",
        payment_note_reference:
          "Vui lòng bao gồm số tham chiếu trong thanh toán của bạn",
        close: "Đóng",
        copied: "Đã sao chép hướng dẫn thanh toán vào clipboard!",
        cancel: "Hủy",
        copy_failed: "Vui lòng sao chép hướng dẫn thủ công.",
        error: "Lỗi",
        manual: "Thủ công",
        momo_payment: "Thanh toán MoMo",
        amount: "Số tiền",
        phone: "Số điện thoại",
        account: "Tài khoản",
        reference: "Mã tham chiếu",
        check_status: "Kiểm tra trạng thái",
        payment_status_checking: "Đang kiểm tra trạng thái thanh toán...",
        payment_status_pending:
          "Thanh toán vẫn đang chờ xử lý. Vui lòng hoàn tất chuyển khoản.",
        payment_status_completed: "Thanh toán Đã Hoàn tất!",
        payment_activated: "Gói đăng ký của bạn đã được kích hoạt. Cảm ơn bạn!",
        scan_qr_instructions:
          "1. Mở ứng dụng MoMo\n2. Quét mã QR hoặc chuyển khoản đến số điện thoại trên\n3. Bao gồm mã tham chiếu trong nội dung chuyển khoản\n4. Nhấn 'Kiểm tra trạng thái' sau khi chuyển khoản",
        paypal_payment_beta: "Thanh toán PayPal - Beta",
        beta_version: "Phiên bản Beta",
        manual_payment: "Thanh toán thủ công",
        include_reference: "Bao gồm mã tham chiếu CHÍNH XÁC này",
        take_screenshot: "Chụp ảnh màn hình",
        activate_within_24h: "Chúng tôi sẽ kích hoạt trong vòng 24 giờ",
        order_id: "Mã đơn hàng",
        thank_you_beta: "Cảm ơn bạn đã hỗ trợ trong giai đoạn beta!",
        paypal_email: "Email",
        plan: "Gói",
        subscribe_bulk: "Đăng ký Gói Số Lượng Lớn",
        bulk_note:
          "Sau khi thanh toán, bạn sẽ nhận được mã tài trợ để phân phối cho người dùng của mình.",
        choose_payment: "Chọn Phương Thức Thanh Toán",
        bank_transfer: "Chuyển khoản Ngân hàng",
        paypal: "PayPal",
        momo: "MoMo",
        plan: "Gói",
        users: "Người dùng",
        amount: "Số tiền",
        copy_instructions: "Sao chép Hướng dẫn",
        close: "Đóng",
        bulk_payment: "Thanh toán Số Lượng Lớn Tổ chức",
        bulk_monthly_plan: "Gói Số Lượng Lớn Hàng Tháng",
        bulk_three_months_plan: "Gói Số Lượng Lớn 3 Tháng",
        bulk_six_months_plan: "Gói Số Lượng Lớn 6 Tháng",
        bulk_yearly_plan: "Gói Số Lượng Lớn Hàng Năm",
        organization_bulk_plan: "Gói Tổ Chức Số Lượng Lớn",
        enter_order_info: "Nhập thông tin đơn hàng bên dưới khi được yêu cầu",
        order_info_for_both: "THÔNG TIN ĐƠN HÀNG",
        complimentaryAccess:
          "Đã cấp quyền truy cập số lượng lớn miễn phí! Bây giờ bạn có thể tài trợ người dùng.",
        ownerAccessTitle: "Đã Cấp Quyền Truy Cập Chủ Sở Hữu",
        ownerAccessMessage:
          "Là chủ sở hữu ứng dụng, bạn đã nhận được quyền truy cập miễn phí để tài trợ {count} người dùng.",
        freePasscodes: "Đã Tạo Mã Mời Miễn Phí",
      },
      zh: {
        title: "连接",
        subtitle: "您的全方位社区通信中心",
        beta_banner: "🚀 测试版 - 特别推出价格!",
        expiry_notice: "📅 订阅在选定期间后到期",
        image_limits: "📸 每个报告5张图片限制",
        individual_plans: "个人计划",
        individual_subtitle: "个人用户的个人计划",
        monthly: "月度",
        three_months: "3个月",
        six_months: "6个月",
        yearly: "年度",
        save_10: "节省10%",
        save_20: "节省20%",
        save_42: "节省42%",
        subscribe: "订阅",
        popular: "热门",
        feature1: "个人头像",
        feature2: "每个报告5张图片",
        feature3: "无限报告",
        feature4: "多平台分享",
        momo: "MoMo",
        bank_transfer: "银行转账",
        bulk_plans: "批量计划",
        bulk_subtitle:
          "赞助用户并展示您的标志。您的标志是固定的；被赞助的用户不能更改。非常适合机场、学校、企业和组织。",
        user_count: "用户数量:",
        plan_type: "计划类型:",
        calculate: "计算",
        price_per_user: "每个用户价格:",
        total_price: "总计:",
        you_save: "您节省:",
        per_month: "每月",
        all_rights: "保留所有权利",
        beta_footer: "测试版 - 价格可能变化",
        please_select_plan: "请先选择订阅计划",
        please_sign_in: "请登录以继续支付",
        payment_failed: "支付初始化失败。请重试。",
        save_5: "节省5%",
        save_12: "节省12%",
        save_15: "节省15%",
        save_40: "节省40%",
        plan_type_monthly: "月度",
        plan_type_three_months: "3个月",
        plan_type_six_months: "6个月",
        plan_type_yearly: "年度",
        user: "用户",
        users: "用户",
        month: "月",
        months: "月",
        year: "年",
        select_payment_method: "选择支付方式",
        complete_payment: "完成支付",
        payment_instructions: "支付说明:",
        note: "注意:",
        copy_instructions: "复制说明",
        processing_payment: "处理支付中...",
        test_mode: "测试模式",
        moving_to_login: "正在转到登录页面...",
        subscription_activated: "订阅已激活",
        subscription_failed: "订阅失败",
        try_again: "重试",
        contact_support: "联系支持",
        features: "功能",
        benefits: "好处",
        included: "包含",
        not_included: "不包含",
        current_plan: "当前计划",
        upgrade_now: "立即升级",
        renew_subscription: "续订订阅",
        cancel_subscription: "取消订阅",
        subscription_details: "订阅详情",
        valid_until: "有效期至",
        days_remaining: "剩余天数",
        expired: "已过期",
        active: "活跃",
        pending: "待处理",
        cancelled: "已取消",
        manual_payment_required: "需要手动支付",
        payment_note_reference: "请在支付中包含参考号码",
        close: "关闭",
        copied: "支付说明已复制到剪贴板！",
        cancel: "取消",
        copy_failed: "请手动复制说明。",
        error: "错误",
        manual: "手动",
        momo_payment: "MoMo支付",
        amount: "金额",
        phone: "电话",
        account: "账户",
        reference: "参考号",
        check_status: "检查支付状态",
        payment_status_checking: "正在检查支付状态...",
        payment_status_pending: "支付仍在处理中。请完成转账。",
        payment_status_completed: "支付已完成！",
        payment_activated: "您的订阅已激活。谢谢！",
        scan_qr_instructions:
          "1. 打开MoMo应用\n2. 扫描QR码或转账到上方电话号码\n3. 在转账内容中包含参考号\n4. 转账后点击'检查状态'",
        paypal_payment_beta: "PayPal支付 - 测试版",
        beta_version: "测试版",
        manual_payment: "手动支付",
        include_reference: "包含此确切参考号",
        take_screenshot: "截取截图",
        activate_within_24h: "我们将在24小时内激活",
        order_id: "订单ID",
        thank_you_beta: "感谢您在测试阶段支持我们！",
        paypal_email: "邮箱",
        plan: "套餐",
        subscribe_bulk: "订阅批量计划",
        bulk_note: "付款后，您将收到赞助代码分发给您的用户。",
        choose_payment: "选择付款方式",
        bank_transfer: "银行转账",
        paypal: "PayPal",
        momo: "MoMo",
        plan: "套餐",
        users: "用户",
        amount: "金额",
        copy_instructions: "复制说明",
        close: "关闭",
        bulk_payment: "组织批量付款",
        bulk_monthly_plan: "月度批量计划",
        bulk_three_months_plan: "3个月批量计划",
        bulk_six_months_plan: "6个月批量计划",
        bulk_yearly_plan: "年度批量计划",
        organization_bulk_plan: "组织批量计划",
        enter_order_info: "根据提示输入下方订单信息",
        order_info_for_both: "订单信息",
        complimentaryAccess: "已授予免费批量访问权限！您现在可以赞助用户了。",
        ownerAccessTitle: "所有者访问权限已授予",
        ownerAccessMessage:
          "作为应用所有者，您已获得免费访问权限，可以赞助 {count} 个用户。",
        freePasscodes: "免费邀请码已生成",
      },
      es: {
        title: "Conexiones",
        subtitle: "Su centro de comunicación comunitario todo en uno",
        beta_banner: "🚀 Versión Beta - ¡Precios de lanzamiento especiales!",
        expiry_notice:
          "📅 Las suscripciones expiran después del período seleccionado",
        image_limits: "📸 Límite de 5 imágenes por informe",
        individual_plans: "Planes Individuales",
        individual_subtitle: "Planes personales para usuarios individuales",
        monthly: "Mensual",
        three_months: "3 Meses",
        six_months: "6 Meses",
        yearly: "Anual",
        save_10: "Ahorra 10%",
        save_20: "Ahorra 20%",
        save_42: "Ahorra 42%",
        subscribe: "Suscribirse",
        popular: "Popular",
        feature1: "Avatar personal",
        feature2: "5 imágenes por informe",
        feature3: "Informes ilimitados",
        feature4: "Compartir multiplataforma",
        momo: "MoMo",
        bank_transfer: "Transferencia Bancaria",
        bulk_plans: "Planes Masivos",
        bulk_subtitle:
          "Patrocine usuarios y muestre su logotipo. Su logotipo es fijo; los usuarios patrocinados no pueden cambiarlo. Ideal para aeropuertos, escuelas, empresas y organizaciones.",
        user_count: "Usuarios:",
        plan_type: "Tipo de plan:",
        calculate: "Calcular",
        price_per_user: "Precio por usuario:",
        total_price: "Total:",
        you_save: "Ahorras:",
        per_month: "por mes",
        all_rights: "Todos los derechos reservados",
        beta_footer: "Versión Beta - Los precios pueden cambiar",
        please_select_plan:
          "Por favor seleccione un plan de suscripción primero",
        please_sign_in: "Por favor inicie sesión para proceder con el pago",
        payment_failed:
          "Inicialización del pago fallida. Por favor intente nuevamente.",
        save_5: "Ahorra 5%",
        save_12: "Ahorra 12%",
        save_15: "Ahorra 15%",
        save_40: "Ahorra 40%",
        plan_type_monthly: "Mensual",
        plan_type_three_months: "3 Meses",
        plan_type_six_months: "6 Meses",
        plan_type_yearly: "Anual",
        user: "usuario",
        users: "usuarios",
        month: "mes",
        months: "meses",
        year: "año",
        select_payment_method: "Seleccionar Método de Pago",
        complete_payment: "Completar Pago",
        payment_instructions: "Instrucciones de Pago:",
        note: "Nota:",
        copy_instructions: "Copiar Instrucciones",
        processing_payment: "Procesando Pago...",
        test_mode: "MODO DE PRUEBA",
        moving_to_login: "Moviendo al inicio de sesión...",
        subscription_activated: "Suscripción Activada",
        subscription_failed: "Suscripción Fallida",
        try_again: "Intentar de Nuevo",
        contact_support: "Contactar Soporte",
        features: "Características",
        benefits: "Beneficios",
        included: "Incluido",
        not_included: "No Incluido",
        current_plan: "Plan Actual",
        upgrade_now: "Actualizar Ahora",
        renew_subscription: "Renovar Suscripción",
        cancel_subscription: "Cancelar Suscripción",
        subscription_details: "Detalles de Suscripción",
        valid_until: "Válido hasta",
        days_remaining: "días restantes",
        expired: "Expirado",
        active: "Activo",
        pending: "Pendiente",
        cancelled: "Cancelado",
        manual_payment_required: "Pago Manual Requerido",
        payment_note_reference:
          "Por favor incluya el número de referencia en su pago",
        close: "Cerrar",
        copied: "¡Instrucciones de pago copiadas al portapapeles!",
        cancel: "Cancelar",
        copy_failed: "Por favor copie las instrucciones manualmente.",
        error: "Error",
        manual: "Manual",
        momo_payment: "Pago MoMo",
        amount: "Cantidad",
        phone: "Teléfono",
        account: "Cuenta",
        reference: "Referencia",
        check_status: "Verificar Estado del Pago",
        payment_status_checking: "Verificando estado del pago...",
        payment_status_pending:
          "Pago aún pendiente. Por favor complete la transferencia.",
        payment_status_completed: "¡Pago Completado!",
        payment_activated: "Su suscripción ha sido activada. ¡Gracias!",
        scan_qr_instructions:
          "1. Abra la aplicación MoMo\n2. Escanee el código QR o transfiera al número de teléfono anterior\n3. Incluya la referencia en el contenido de la transferencia\n4. Haga clic en 'Verificar estado' después de la transferencia",
        paypal_payment_beta: "Pago PayPal - Beta",
        beta_version: "Versión Beta",
        manual_payment: "Pago Manual",
        include_reference: "Incluye esta referencia EXACTA",
        take_screenshot: "Toma una captura de pantalla",
        activate_within_24h: "Activaremos dentro de 24 horas",
        order_id: "ID de Pedido",
        thank_you_beta: "¡Gracias por apoyarnos durante nuestra fase beta!",
        paypal_email: "Correo electrónico",
        plan: "Plan",
        subscribe_bulk: "Suscribirse al Plan Masivo",
        bulk_note:
          "Después del pago, recibirás códigos de patrocinador para distribuir a tus usuarios.",
        choose_payment: "Elegir Método de Pago",
        bank_transfer: "Transferencia Bancaria",
        paypal: "PayPal",
        momo: "MoMo",
        plan: "Plan",
        users: "Usuarios",
        amount: "Cantidad",
        copy_instructions: "Copiar Instrucciones",
        close: "Cerrar",
        bulk_payment: "Pago Masivo de Organización",
        bulk_monthly_plan: "Plan Masivo Mensual",
        bulk_three_months_plan: "Plan Masivo de 3 Meses",
        bulk_six_months_plan: "Plan Masivo de 6 Meses",
        bulk_yearly_plan: "Plan Masivo Anual",
        organization_bulk_plan: "Plan Masivo de Organización",
        enter_order_info:
          "Ingrese la información del pedido a continuación cuando se le solicite",
        order_info_for_both: "INFORMACIÓN DEL PEDIDO",
        complimentaryAccess:
          "¡Acceso masivo gratuito concedido! Ahora puede patrocinar usuarios.",
        ownerAccessTitle: "Acceso de Propietario Concedido",
        ownerAccessMessage:
          "Como propietario de la aplicación, ha recibido acceso gratuito para patrocinar {count} usuarios.",
        freePasscodes: "Códigos de Invitación Gratuitos Generados",
      },
      hi: {
        title: "कनेक्शन्स",
        subtitle: "आपका ऑल-इन-वन कम्युनिटी कम्युनिकेशन हब",
        beta_banner: "🚀 बीटा संस्करण - विशेष लॉन्च मूल्य!",
        expiry_notice: "📅 चयनित अवधि के बाद सदस्यता समाप्त हो जाती है",
        image_limits: "📸 प्रति रिपोर्ट 5 छवियों की सीमा",
        individual_plans: "व्यक्तिगत योजनाएँ",
        individual_subtitle: "व्यक्तिगत उपयोगकर्ताओं के लिए व्यक्तिगत योजनाएँ",
        monthly: "मासिक",
        three_months: "3 महीने",
        six_months: "6 महीने",
        yearly: "वार्षिक",
        save_10: "10% बचत",
        save_20: "20% बचत",
        save_42: "42% बचत",
        subscribe: "सदस्यता लें",
        popular: "लोकप्रिय",
        feature1: "व्यक्तिगत अवतार",
        feature2: "प्रति रिपोर्ट 5 छवियाँ",
        feature3: "असीमित रिपोर्ट",
        feature4: "बहु-प्लेटफ़ॉर्म साझाकरण",
        momo: "MoMo",
        bank_transfer: "बैंक ट्रांसफर",
        bulk_plans: "थोक योजनाएँ",
        bulk_subtitle:
          "उपयोगकर्ताओं को प्रायोजित करें और अपना लोगो प्रदर्शित करें। आपका लोगो निश्चित है; प्रायोजित उपयोगकर्ता इसे नहीं बदल सकते। हवाई अड्डों, स्कूलों, व्यवसायों और संगठनों के लिए आदर्श।",
        user_count: "उपयोगकर्ता:",
        plan_type: "योजना प्रकार:",
        calculate: "गणना करें",
        price_per_user: "प्रति उपयोगकर्ता मूल्य:",
        total_price: "कुल:",
        you_save: "आप बचाते हैं:",
        per_month: "प्रति माह",
        all_rights: "सर्वाधिकार सुरक्षित",
        beta_footer: "बीटा संस्करण - कीमतें बदल सकती हैं",
        please_select_plan: "कृपया पहले एक सदस्यता योजना चुनें",
        please_sign_in: "कृपया भुगतान के लिए साइन इन करें",
        payment_failed: "भुगतान प्रारंभ करने में विफल। कृपया पुनः प्रयास करें।",
        save_5: "5% बचत",
        save_12: "12% बचत",
        save_15: "15% बचत",
        save_40: "40% बचत",
        plan_type_monthly: "मासिक",
        plan_type_three_months: "3 महीने",
        plan_type_six_months: "6 महीने",
        plan_type_yearly: "वार्षिक",
        user: "उपयोगकर्ता",
        users: "उपयोगकर्ता",
        month: "महीना",
        months: "महीने",
        year: "साल",
        select_payment_method: "भुगतान विधि चुनें",
        complete_payment: "भुगतान पूरा करें",
        payment_instructions: "भुगतान निर्देश:",
        note: "नोट:",
        copy_instructions: "निर्देश कॉपी करें",
        processing_payment: "भुगतान प्रसंस्करण...",
        test_mode: "टेस्ट मोड",
        moving_to_login: "लॉगिन पर जा रहा है...",
        subscription_activated: "सदस्यता सक्रिय",
        subscription_failed: "सदस्यता विफल",
        try_again: "पुनः प्रयास करें",
        contact_support: "समर्थन से संपर्क करें",
        features: "सुविधाएँ",
        benefits: "लाभ",
        included: "शामिल",
        not_included: "शामिल नहीं",
        current_plan: "वर्तमान योजना",
        upgrade_now: "अभी अपग्रेड करें",
        renew_subscription: "सदस्यता नवीनीकृत करें",
        cancel_subscription: "सदस्यता रद्द करें",
        subscription_details: "सदस्यता विवरण",
        valid_until: "मान्य直至",
        days_remaining: "दिन शेष",
        expired: "समाप्त",
        active: "सक्रिय",
        pending: "लंबित",
        cancelled: "रद्द",
        manual_payment_required: "मैनुअल भुगतान आवश्यक",
        payment_note_reference:
          "कृपया अपने भुगतान में संदर्भ संख्या शामिल करें",
        close: "बंद करें",
        copied: "भुगतान निर्देश क्लिपबोर्ड पर कॉपी किए गए!",
        cancel: "रद्द करें",
        copy_failed: "कृपया निर्देश मैन्युअल रूप से कॉपी करें।",
        error: "त्रुटि",
        manual: "मैन्युअल",
        momo_payment: "MoMo भुगतान",
        amount: "राशि",
        phone: "फोन",
        account: "खाता",
        reference: "संदर्भ",
        check_status: "भुगतान स्थिति जांचें",
        payment_status_checking: "भुगतान स्थिति जांच रहा है...",
        payment_status_pending:
          "भुगतान अभी भी लंबित है। कृपया स्थानांतरण पूरा करें।",
        payment_status_completed: "भुगतान पूरा हो गया!",
        payment_activated: "आपकी सदस्यता सक्रिय कर दी गई है। धन्यवाद!",
        scan_qr_instructions:
          "1. MoMo ऐप खोलें\n2. QR कोड स्कैन करें या ऊपर दिए गए फोन नंबर पर ट्रांसफर करें\n3. ट्रांसफर सामग्री में संदर्भ संख्या शामिल करें\n4. ट्रांसफर के बाद 'स्थिति जांचें' पर क्लिक करें",
        paypal_payment_beta: "PayPal भुगतान - बीटा",
        beta_version: "बीटा संस्करण",
        manual_payment: "मैन्युअल भुगतान",
        include_reference: "इस सटीक संदर्भ को शामिल करें",
        take_screenshot: "स्क्रीनशॉट लें",
        activate_within_24h: "हम 24 घंटों के भीतर सक्रिय कर देंगे",
        order_id: "आदेश आईडी",
        thank_you_beta: "बीटा चरण के दौरान समर्थन के लिए धन्यवाद!",
        paypal_email: "ईमेल",
        plan: "योजना",
        subscribe_bulk: "बल्क प्लान सब्सक्राइब करें",
        bulk_note:
          "भुगतान के बाद, आपको अपने उपयोगकर्ताओं को वितरित करने के लिए प्रायोजक कोड प्राप्त होंगे।",
        choose_payment: "भुगतान विधि चुनें",
        bank_transfer: "बैंक ट्रांसफर",
        paypal: "PayPal",
        momo: "MoMo",
        plan: "योजना",
        users: "उपयोगकर्ता",
        amount: "राशि",
        copy_instructions: "निर्देश कॉपी करें",
        close: "बंद करें",
        bulk_payment: "संगठन बल्क भुगतान",
        bulk_monthly_plan: "मासिक बल्क प्लान",
        bulk_three_months_plan: "3-महीने का बल्क प्लान",
        bulk_six_months_plan: "6-महीने का बल्क प्लान",
        bulk_yearly_plan: "वार्षिक बल्क प्लान",
        organization_bulk_plan: "संगठन बल्क प्लान",
        enter_order_info:
          "जब संकेत दिया जाए तो नीचे दी गई ऑर्डर जानकारी दर्ज करें",
        order_info_for_both: "आदेश जानकारी",
        complimentaryAccess:
          "मुफ्त बल्क एक्सेस प्रदान किया गया! अब आप उपयोगकर्ताओं को प्रायोजित कर सकते हैं।",
        ownerAccessTitle: "मालिक का एक्सेस प्रदान किया गया",
        ownerAccessMessage:
          "ऐप के मालिक के रूप में, आपको {count} उपयोगकर्ताओं को प्रायोजित करने के लिए मुफ्त एक्सेस प्राप्त हुआ है।",
        freePasscodes: "मुफ्त आमंत्रण कोड जेनरेट किए गए",
      },
      ar: {
        title: "اتصالات",
        subtitle: "مركز التواصل المجتمعي الشامل الخاص بك",
        beta_banner: "🚀 نسخة تجريبية - أسعار إطلاق خاصة!",
        expiry_notice: "📅 تنتهي الاشتراكات بعد الفترة المحددة",
        image_limits: "📸 حد 5 صور لكل تقرير",
        individual_plans: "خطط فردية",
        individual_subtitle: "خطط شخصية للمستخدمين الأفراد",
        monthly: "شهري",
        three_months: "3 أشهر",
        six_months: "6 أشهر",
        yearly: "سنوي",
        save_10: "وفر 10%",
        save_20: "وفر 20%",
        save_42: "وفر 42%",
        subscribe: "اشترك",
        popular: "شائع",
        feature1: "صورة رمزية شخصية",
        feature2: "5 صور لكل تقرير",
        feature3: "تقارير غير محدودة",
        feature4: "مشاركة متعددة المنصات",
        momo: "MoMo",
        bank_transfer: "تحويل بنكي",
        bulk_plans: "خطط بالجملة",
        bulk_subtitle:
          "قم برعاية المستخدمين وعرض شعارك. شعارك ثابت؛ لا يمكن للمستخدمين المدعومين تغييره. مثالي للمطارات والمدارس والشركات والمنظمات.",
        user_count: "المستخدمون:",
        plan_type: "نوع الخطة:",
        calculate: "احسب",
        price_per_user: "السعر لكل مستخدم:",
        total_price: "المجموع:",
        you_save: "وفرت:",
        per_month: "شهريًا",
        all_rights: "جميع الحقوق محفوظة",
        beta_footer: "نسخة تجريبية - الأسعار قد تتغير",
        please_select_plan: "يرجى اختيار خطة اشتراك أولاً",
        please_sign_in: "يرجى تسجيل الدخول للمتابعة للدفع",
        payment_failed: "فشل تهيئة الدفع. يرجى المحاولة مرة أخرى.",
        save_5: "وفر 5%",
        save_12: "وفر 12%",
        save_15: "وفر 15%",
        save_40: "وفر 40%",
        plan_type_monthly: "شهري",
        plan_type_three_months: "3 أشهر",
        plan_type_six_months: "6 أشهر",
        plan_type_yearly: "سنوي",
        user: "مستخدم",
        users: "مستخدمين",
        month: "شهر",
        months: "أشهر",
        year: "سنة",
        select_payment_method: "اختر طريقة الدفع",
        complete_payment: "أكمل الدفع",
        payment_instructions: "تعليمات الدفع:",
        note: "ملاحظة:",
        copy_instructions: "نسخ التعليمات",
        processing_payment: "جاري معالجة الدفع...",
        test_mode: "وضع الاختبار",
        moving_to_login: "الانتقال إلى تسجيل الدخول...",
        subscription_activated: "تم تفعيل الاشتراك",
        subscription_failed: "فشل الاشتراك",
        try_again: "حاول مرة أخرى",
        contact_support: "اتصل بالدعم",
        features: "الميزات",
        benefits: "المزايا",
        included: "مشمول",
        not_included: "غير مشمول",
        current_plan: "الخطة الحالية",
        upgrade_now: "ترقية الآن",
        renew_subscription: "تجديد الاشتراك",
        cancel_subscription: "إلغاء الاشتراك",
        subscription_details: "تفاصيل الاشتراك",
        valid_until: "صالح حتى",
        days_remaining: "أيام متبقية",
        expired: "منتهي",
        active: "نشط",
        pending: "قيد الانتظار",
        cancelled: "ملغى",
        manual_payment_required: "الدفع اليدوي مطلوب",
        payment_note_reference: "يرجى تضمين رقم المرجع في دفعتك",
        close: "إغلاق",
        copied: "تم نسخ تعليمات الدفع إلى الحافظة!",
        cancel: "إلغاء",
        copy_failed: "يرجى نسخ التعليمات يدويًا.",
        error: "خطأ",
        manual: "يدوي",
        momo_payment: "دفع MoMo",
        amount: "المبلغ",
        phone: "الهاتف",
        account: "الحساب",
        reference: "المرجع",
        check_status: "التحقق من حالة الدفع",
        payment_status_checking: "جاري التحقق من حالة الدفع...",
        payment_status_pending:
          "الدفع لا يزال قيد الانتظار. يرجى إكمال التحويل.",
        payment_status_completed: "تم إكمال الدفع!",
        payment_activated: "تم تفعيل اشتراكك. شكرًا لك!",
        scan_qr_instructions:
          "1. افتح تطبيق MoMo\n2. امسح رمز QR ضوئيًا أو انقل إلى رقم الهاتف أعلاه\n3. قم بتضمين المرجع في محتوى التحويل\n4. انقر فوق 'التحقق من الحالة' بعد التحويل",
        paypal_payment_beta: "دفع PayPal - تجريبي",
        beta_version: "الإصدار التجريبي",
        manual_payment: "الدفع اليدوي",
        include_reference: "قم بتضمين هذا المرجع الدقيق",
        take_screenshot: "التقط لقطة شاشة",
        activate_within_24h: "سنقوم بالتنشيط في غضون 24 ساعة",
        order_id: "معرف الطلب",
        thank_you_beta: "شكرًا لدعمك خلال مرحلتنا التجريبية!",
        paypal_email: "البريد الإلكتروني",
        plan: "الخطة",
        subscribe_bulk: "اشترك في الخطة المجمعة",
        bulk_note: "بعد الدفع، ستحصل على رموز الرعاية لتوزيعها على مستخدميك.",
        choose_payment: "اختر طريقة الدفع",
        bank_transfer: "تحويل بنكي",
        paypal: "PayPal",
        momo: "MoMo",
        plan: "الخطة",
        users: "المستخدمين",
        amount: "المبلغ",
        copy_instructions: "نسخ التعليمات",
        close: "إغلاق",
        bulk_payment: "الدفع المجمع للمؤسسة",
        bulk_monthly_plan: "الخطة المجمعة الشهرية",
        bulk_three_months_plan: "الخطة المجمعة لـ3 أشهر",
        bulk_six_months_plan: "الخطة المجمعة لـ6 أشهر",
        bulk_yearly_plan: "الخطة المجمعة السنوية",
        organization_bulk_plan: "الخطة المجمعة للمؤسسة",
        enter_order_info: "أدخل معلومات الطلب أدناه عند المطالبة",
        order_info_for_both: "معلومات الطلب",
        complimentaryAccess:
          "تم منح الوصول المجمّع المجاني! يمكنك الآن رعاية المستخدمين.",
        ownerAccessTitle: "تم منح وصول المالك",
        ownerAccessMessage:
          "كمالك للتطبيق، تلقيت وصولًا مجانيًا لرعاية {count} مستخدم.",
        freePasscodes: "تم إنشاء رموز دعوة مجانية",
      },
    };

    this.translations =
      allTranslations[this.currentLang] || allTranslations["en"];
    this.applyTranslations();
    this.updateBulkCalculatorDropdown();
    this.updateIndividualPricingDisplay();
    this.updateBulkCalculator();
  }

  applyTranslations() {
    document.querySelectorAll("[data-i18n]").forEach((element) => {
      const key = element.getAttribute("data-i18n");
      if (this.translations[key]) {
        element.textContent = this.translations[key];
      }
    });
    this.updateBulkCalculatorLabels();
  }

  updateBulkCalculatorLabels() {
    const planTypeSelect = document.getElementById("bulkPlanType");
    if (planTypeSelect) {
      const options = planTypeSelect.querySelectorAll("option");
      if (options.length >= 4) {
        options[0].textContent = this.translations.monthly;
        options[1].textContent = this.translations.three_months;
        options[2].textContent = this.translations.six_months;
        options[3].textContent = this.translations.yearly;
      }
    }
  }

  setupBackButton() {
    const backBtn = document.getElementById("backToMainBtn");
    if (backBtn) {
      backBtn.addEventListener("click", () => {
        window.location.href = "./dashboard.html";
      });
    }
  }

  setupSubscriptionButtons() {
    document.querySelectorAll(".subscribe-btn[data-plan]").forEach((btn) => {
      const newBtn = btn.cloneNode(true);
      btn.parentNode.replaceChild(newBtn, btn);

      newBtn.addEventListener("click", (e) => {
        e.preventDefault();
        const planType = newBtn.getAttribute("data-plan");
        this.handleSubscriptionSelection(planType);
      });
    });
  }

  setupPaymentButtons() {
    const paymentMethods = {
      "momo-payment": () => this.handleMoMoPayment(),
      "paypal-payment": () => this.handlePayPalPayment(),
      "bank-transfer": () => this.handleBankTransfer(),
    };

    Object.keys(paymentMethods).forEach((id) => {
      const btn = document.getElementById(id);
      if (btn) {
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);
        newBtn.addEventListener("click", paymentMethods[id]);
      }
    });
  }

  // ===== INDIVIDUAL PRICING DISPLAY =====
  updateIndividualPricingDisplay() {
    const currencyInfo = this.getCurrencyForLanguage();

    const plans = [
      {
        element: document.querySelectorAll(".plan-price")[0],
        periodElement: document.querySelectorAll(".plan-period")[0],
        type: "monthly",
      },
      {
        element: document.querySelectorAll(".plan-price")[1],
        periodElement: document.querySelectorAll(".plan-period")[1],
        type: "three_months",
      },
      {
        element: document.querySelectorAll(".plan-price")[2],
        periodElement: document.querySelectorAll(".plan-period")[2],
        type: "six_months",
      },
      {
        element: document.querySelectorAll(".plan-price")[3],
        periodElement: document.querySelectorAll(".plan-period")[3],
        type: "yearly",
      },
    ];

    plans.forEach((plan) => {
      if (plan.element) {
        const converted = this.convertPrice(
          this.PLAN_PRICES[plan.type],
          currencyInfo.code,
        );
        plan.element.textContent = `${
          converted.symbol
        }${converted.amount.toLocaleString()}`;

        if (plan.periodElement) {
          if (plan.type === "yearly") {
            plan.periodElement.textContent = `/${this.translations.year}`;
          } else if (plan.type === "three_months") {
            plan.periodElement.textContent = `/3 ${this.translations.months}`;
          } else if (plan.type === "six_months") {
            plan.periodElement.textContent = `/6 ${this.translations.months}`;
          } else {
            plan.periodElement.textContent = `/${this.translations.month}`;
          }
        }
      }
    });
  }

  // ===== BULK CALCULATOR METHODS =====
  updateBulkCalculatorDropdown() {
    const planTypeSelect = document.getElementById("bulkPlanType");
    if (!planTypeSelect) return;

    planTypeSelect.innerHTML = "";

    const planOptions = [
      { value: "monthly", label: this.translations.monthly },
      { value: "three_months", label: this.translations.three_months },
      { value: "six_months", label: this.translations.six_months },
      { value: "yearly", label: this.translations.yearly },
    ];

    planOptions.forEach((plan) => {
      const option = document.createElement("option");
      option.value = plan.value;

      const basePriceUSD = this.PLAN_PRICES[plan.value];
      const currencyInfo = this.getCurrencyForLanguage();
      const converted = this.convertPrice(basePriceUSD, currencyInfo.code);

      option.textContent = `${plan.label} - ${
        converted.symbol
      }${converted.amount.toLocaleString()}/${
        this.translations.user
      }/${this.getPeriodText(plan.value)}`;
      option.setAttribute("data-price", converted.amount);
      planTypeSelect.appendChild(option);
    });
  }

  getPeriodText(planType) {
    switch (planType) {
      case "monthly":
        return this.translations.month;
      case "three_months":
        return this.translations.month;
      case "six_months":
        return this.translations.month;
      case "yearly":
        return this.translations.year;
      default:
        return this.translations.month;
    }
  }

  setupBulkCalculator() {
    console.log("🔄 Setting up bulk calculator...");

    // Check if we're actually on the premium page
    const isPremiumPage =
      window.location.pathname.includes("premium.html") ||
      document.querySelector(".organization-section") !== null;

    if (!isPremiumPage) {
      console.log("ℹ️ Not on premium page, skipping bulk calculator setup");
      return;
    }

    // Wait for DOM to be fully ready
    setTimeout(() => {
      const userCountInput = document.getElementById("userCount");
      const planTypeSelect = document.getElementById("bulkPlanType");
      const calculateBtn = document.getElementById("calculateBulkPrice");

      if (userCountInput && planTypeSelect && calculateBtn) {
        console.log("✅ Found bulk calculator elements on premium page");

        // Initialize dropdown
        this.updateBulkCalculatorDropdown();

        // Setup event listeners
        calculateBtn.addEventListener("click", () => this.calculateOrgPrice());
        userCountInput.addEventListener("input", () =>
          this.calculateOrgPrice(),
        );
        planTypeSelect.addEventListener("change", () =>
          this.calculateOrgPrice(),
        );

        // Calculate initial price
        this.calculateOrgPrice();

        console.log("✅ Bulk calculator setup complete");
      } else {
        console.warn("⚠️ Bulk calculator elements not found on premium page");
      }
    }, 500);
  }

  setupBulkCalculatorWithElements(
    userCountInput,
    planTypeSelect,
    calculateBtn,
  ) {
    this.updateBulkCalculatorDropdown();

    // Remove any existing event listeners and reattach
    const newCalculateBtn = calculateBtn.cloneNode(true);
    calculateBtn.parentNode.replaceChild(newCalculateBtn, calculateBtn);

    newCalculateBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      console.log("🔄 Calculate button clicked");
      this.calculateOrgPrice();
    });

    userCountInput.addEventListener("input", (e) => {
      e.preventDefault();
      e.stopPropagation();
      console.log("🔄 User count changed:", userCountInput.value);
      this.calculateOrgPrice();
    });

    planTypeSelect.addEventListener("change", (e) => {
      e.preventDefault();
      e.stopPropagation();
      console.log("🔄 Plan type changed:", planTypeSelect.value);
      this.calculateOrgPrice();
    });

    // Calculate initial price
    setTimeout(() => {
      console.log("🔄 Calculating initial bulk price");
      this.calculateOrgPrice();
    }, 500);

    console.log("✅ Bulk calculator setup complete");
  }

  calculateOrgPrice() {
    try {
      const userCount =
        parseInt(document.getElementById("userCount")?.value) || 1;
      const planTypeSelect = document.getElementById("bulkPlanType");
      const selectedOption =
        planTypeSelect?.options[planTypeSelect.selectedIndex];
      const planType = selectedOption?.value || "monthly";

      if (userCount < 1) return;

      const basePriceUSD = this.PLAN_PRICES[planType];
      const currencyInfo = this.getCurrencyForLanguage();
      const basePriceLocal = this.convertPrice(
        basePriceUSD,
        currencyInfo.code,
      ).amount;

      let discountRate = 0;
      let discountText = "";

      if (userCount >= 10) {
        discountRate = this.BULK_DISCOUNTS.over_10.discount;
        discountText = this.translations.save_15;
      } else if (userCount >= 3) {
        discountRate = this.BULK_DISCOUNTS.under_10.discount;
        discountText =
          userCount >= 5 ? this.translations.save_12 : this.translations.save_5;
      }

      const pricePerUser = Math.round(basePriceLocal * (1 - discountRate));
      const totalPrice = pricePerUser * userCount;
      const totalSavings = Math.round(
        basePriceLocal * userCount * discountRate,
      );

      this.updateBulkResults(
        pricePerUser,
        totalPrice,
        totalSavings,
        userCount,
        discountRate,
        discountText,
      );
    } catch (error) {
      console.error("Bulk calculation error:", error);
    }
  }

  updateBulkResults(
    pricePerUser,
    totalPrice,
    totalSavings,
    userCount,
    discountRate,
    discountText,
  ) {
    const currencySymbol = this.getCurrencyForLanguage().symbol;

    const pricePerUserElement = document.getElementById("pricePerUser");
    if (pricePerUserElement) {
      pricePerUserElement.textContent = `${
        this.translations.price_per_user
      } ${currencySymbol}${pricePerUser.toLocaleString()}/${
        this.translations.user
      }/${this.translations.month}`;
    }

    const totalPriceElement = document.getElementById("totalPrice");
    if (totalPriceElement) {
      totalPriceElement.textContent = `${
        this.translations.total_price
      } ${currencySymbol}${totalPrice.toLocaleString()}`;
    }

    const savingsElement = document.getElementById("youSave");
    if (savingsElement) {
      if (discountRate > 0) {
        savingsElement.textContent = `${
          this.translations.you_save
        } ${currencySymbol}${totalSavings.toLocaleString()} (${discountText})`;
        savingsElement.style.display = "block";
      } else {
        savingsElement.style.display = "none";
      }
    }
  }

  updateBulkCalculator() {
    this.calculateOrgPrice();
  }

  // ===== SUBSCRIPTION HANDLING =====
  async handleSubscriptionSelection(planType) {
    try {
      console.log("🔄 Handling subscription selection:", planType);

      await this.waitForFirebase();

      const user = window.fb?.auth?.currentUser;
      console.log("🔍 Current user:", user);

      if (!user) {
        console.log("🔐 No user found, storing intent");
        localStorage.setItem("subscriptionIntent", planType);

        const message =
          this.translations.please_sign_in ||
          "Please sign in to your account first, then return to this page to complete your subscription.";
        alert(message);

        const shouldContinue = confirm(
          "Would you like to go to the main app to sign in?",
        );
        if (shouldContinue) {
          window.location.href = "./dashboard.html";
        }
        return;
      }

      // User is authenticated, proceed
      const amountUSD = this.PLAN_PRICES[planType];
      const currencyInfo = this.getCurrencyForLanguage();
      const converted = this.convertPrice(amountUSD, currencyInfo.code);

      const selectedPlan = {
        type: planType,
        amountUSD: amountUSD,
        amountLocal: converted.amount,
        currency: converted.currency,
        symbol: converted.symbol,
        userId: user.uid,
        userEmail: user.email,
      };

      console.log("💾 Storing selected plan:", selectedPlan);
      localStorage.setItem("selectedPlan", JSON.stringify(selectedPlan));
      localStorage.removeItem("subscriptionIntent");

      this.showPaymentMethodModal(planType, converted);
    } catch (error) {
      console.error("❌ Subscription selection error:", error);
      alert(
        this.translations.payment_failed ||
          "Failed to select plan. Please try again.",
      );
    }
  }

  showPaymentMethodModal(planType, priceInfo) {
    const planNames = {
      monthly: this.translations.monthly,
      three_months: this.translations.three_months,
      six_months: this.translations.six_months,
      yearly: this.translations.yearly,
    };

    // Get display currency for current language
    const displayCurrency = this.getCurrencyForLanguage();
    const displayPrice = this.convertPrice(
      this.PLAN_PRICES[planType],
      displayCurrency.code,
    );

    const modal = document.createElement("div");
    modal.style.cssText = `
    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
    background: rgba(0,0,0,0.8); z-index: 10000; display: flex;
    justify-content: center; align-items: center; font-family: Arial, sans-serif;
  `;

    modal.innerHTML = `
    <div style="background: white; padding: 30px; border-radius: 15px; max-width: 90%; width: 400px; text-align: center;">
      <h2 style="color: #b1216a; margin-bottom: 10px;">${
        this.translations.subscribe
      }</h2>
      <p style="font-size: 18px; margin-bottom: 20px; color: #333;">
        ${planNames[planType]} - ${displayPrice.symbol}${displayPrice.amount} ${
          displayPrice.currency
        }
      </p>
      
      <div style="display: flex; flex-direction: column; gap: 10px; margin: 20px 0;">
        <!-- 🔧 CHANGED: Only ONE MoMo button -->
        <button id="select-momo" style="
          background: #b1216a; color: white; border: none; padding: 15px;
          border-radius: 8px; font-size: 16px; cursor: pointer; font-weight: bold;
        ">${this.translations.momo || "MoMo"}</button>
        
        <button id="select-paypal" style="
          background: #0070ba; color: white; border: none; padding: 15px;
          border-radius: 8px; font-size: 16px; cursor: pointer; font-weight: bold;
        ">PayPal</button>
        
        <button id="select-bank" style="
          background: #28a745; color: white; border: none; padding: 15px;
          border-radius: 8px; font-size: 16px; cursor: pointer; font-weight: bold;
        ">${this.translations.bank_transfer}</button>
      </div>
      
      <button id="cancel-payment" style="
        background: #6c757d; color: white; border: none; padding: 10px 20px;
        border-radius: 6px; font-size: 14px; cursor: pointer; margin-top: 10px;
      ">${this.translations.cancel || "Cancel"}</button>
    </div>
  `;

    document.body.appendChild(modal);

    // 🔧 REMOVED: QR button event listener

    document.getElementById("select-momo").addEventListener("click", () => {
      document.body.removeChild(modal);
      this.handleMoMoPayment();
    });

    // In your existing modal, update the PayPal click handler:
    document.getElementById("select-paypal").addEventListener("click", () => {
      document.body.removeChild(modal);

      // ✅ Store plan in localStorage
      const selectedPlan = {
        type: planType,
        price: this.PLAN_PRICES[planType],
        currency: displayCurrency.code,
        isBulk: false,
      };
      localStorage.setItem("selectedPlan", JSON.stringify(selectedPlan));
      localStorage.setItem("paymentMethod", "paypal");

      // ✅ Call updated handler
      this.handlePayPalPayment();
    });

    document.getElementById("select-bank").addEventListener("click", () => {
      document.body.removeChild(modal);
      this.handleBankTransfer();
    });

    document.getElementById("cancel-payment").addEventListener("click", () => {
      document.body.removeChild(modal);
    });
  }

  // ===== ADD THE NEW METHOD HERE =====
  showTranslatedPaymentModal(paymentData) {
    console.log("🔄 Showing translated payment modal");

    const modal = document.createElement("div");
    modal.style.cssText = `
    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
    background: rgba(0,0,0,0.8); z-index: 10000; display: flex;
    justify-content: center; align-items: center; font-family: Arial, sans-serif;
  `;

    modal.innerHTML = `
    <div style="
      background: white; padding: 25px; border-radius: 15px;
      max-width: 90%; width: 500px; max-height: 80vh;
      overflow-y: auto; text-align: center; box-shadow: 0 10px 30px rgba(0,0,0,0.3);
    ">
      <h2 style="color: #b1216a; margin-bottom: 15px;">${
        this.translations.complete_payment || "Complete Your Payment"
      }</h2>
      
      <div style="text-align: left; background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 15px 0;">
        <h3 style="color: #333; margin-bottom: 15px;">${
          this.translations.payment_instructions || "Payment Instructions:"
        }</h3>
        <p style="white-space: pre-line; line-height: 1.6; color: #555;">${
          paymentData.instructions
        }</p>
      </div>

      <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #ffc107;">
        <p style="margin: 0; color: #856404;"><strong>${
          this.translations.note || "Note:"
        }</strong> ${paymentData.note}</p>
      </div>

      <div style="display: flex; gap: 10px; justify-content: center; margin-top: 20px; flex-wrap: wrap;">
        <button id="copy-instructions" style="
          background: #28a745; color: white; border: none; padding: 12px 25px;
          border-radius: 25px; font-size: 16px; cursor: pointer; font-weight: bold;
        ">${this.translations.copy_instructions || "Copy Instructions"}</button>
        
        <button id="close-modal" style="
          background: #6c757d; color: white; border: none; padding: 12px 25px;
          border-radius: 25px; font-size: 16px; cursor: pointer; font-weight: bold;
        ">${this.translations.close || "Close"}</button>
      </div>
    </div>
  `;

    document.body.appendChild(modal);

    document
      .getElementById("copy-instructions")
      .addEventListener("click", () => {
        const textToCopy = paymentData.instructions + "\n\n" + paymentData.note;
        navigator.clipboard
          .writeText(textToCopy)
          .then(() =>
            alert(
              this.translations.copied ||
                "Payment instructions copied to clipboard!",
            ),
          )
          .catch(() =>
            alert(
              this.translations.copy_failed ||
                "Please copy the instructions manually.",
            ),
          );
      });

    document.getElementById("close-modal").addEventListener("click", () => {
      document.body.removeChild(modal);
    });
  }

  // ===== PAYMENT METHODS =====
  // NEW: Direct HTTP payment method
  // UPDATED: Direct HTTP payment method with proper translations
  // UPDATED: Direct HTTP payment method with proper translations
  async useHttpMomoPaymentDirect(planType, amountVND, user) {
    try {
      console.log("🔄 Using direct HTTP MoMo payment");

      const response = await fetch(
        "https://us-central1-connectionsfinder-app.cloudfunctions.net/createMomoPaymentHTTP",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            amountVND: amountVND,
            planType: planType,
            userId: user.uid,
            userEmail: user.email,
            timestamp: new Date().toISOString(),
          }),
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        console.log("✅ HTTP MoMo payment successful:", result);

        // ADD THIS: Handle bulk subscription passcodes
        const selectedPlan = JSON.parse(
          localStorage.getItem("selectedPlan") || "{}",
        );
        if (selectedPlan.isBulk && window.premiumManager) {
          window.premiumManager.handleBulkPaymentSuccess(selectedPlan);
        }

        // Create translated payment data with real details
        const translatedPaymentData = this.createTranslatedPaymentData(
          result,
          planType,
        );

        // Show translated payment modal
        this.showTranslatedPaymentModal(translatedPaymentData);
      } else {
        throw new Error(result.error || "HTTP payment failed");
      }
    } catch (error) {
      console.error("HTTP MoMo payment error:", error);
      throw new Error("Payment failed: " + error.message);
    }
  }

  // NEW: Create translated payment data with real details
  createTranslatedPaymentData(result, planType) {
    const planNames = {
      monthly: this.translations.monthly,
      three_months: this.translations.three_months,
      six_months: this.translations.six_months,
      yearly: this.translations.yearly,
    };

    const readablePlan = planNames[planType] || planType;

    let instructions;

    switch (this.currentLang) {
      case "vi":
        instructions = `Yêu cầu Thanh toán Thủ công\n\nVui lòng hoàn tất thanh toán theo cách thủ công:\n\n1. Mở ứng dụng MoMo của bạn\n2. Gửi ${result.amountFormatted}₫ đến:\n  📱Số điện thoại: ${result.phoneNumber}\n  👤 Tài khoản: ${result.accountName}\n3. Bao gồm mã tham chiếu: ${result.orderId}\n4. Chụp ảnh màn hình xác nhận thanh toán\n5. Gửi email ảnh chụp màn hình đến: ${result.supportEmail}\n\nChúng tôi sẽ kích hoạt gói ${readablePlan} của bạn trong vòng 24 giờ sau khi xác nhận thanh toán.\n\nCảm ơn sự kiên nhẫn của bạn!`;
        break;
      case "zh":
        instructions = `需要手动支付\n\n请手动完成支付：\n\n1. 打开您的MoMo应用\n2. 发送 ${result.amountFormatted}₫ 至：\n  📱电话：${result.phoneNumber}\n  👤 账户：${result.accountName}\n3. 包含此参考号：${result.orderId}\n4. 截取支付确认截图\n5. 将截图发送至：${result.supportEmail}\n\n我们将在支付确认后24小时内激活您的${readablePlan}订阅。\n\n感谢您的耐心！`;
        break;
      case "es":
        instructions = `Pago Manual Requerido\n\nPor favor complete su pago manualmente:\n\n1. Abra su aplicación MoMo\n2. Envíe ${result.amountFormatted}₫ a:\n  📱Teléfono: ${result.phoneNumber}\n  👤 Cuenta: ${result.accountName}\n3. Incluya esta referencia: ${result.orderId}\n4. Tome una captura de pantalla de la confirmación de pago\n5. Envíe la captura de pantalla por correo a: ${result.supportEmail}\n\nActivaremos su suscripción ${readablePlan} dentro de las 24 horas posteriores a la confirmación del pago.\n\n¡Gracias por su paciencia!`;
        break;
      case "hi":
        instructions = `मैनुअल भुगतान आवश्यक\n\nकृपया अपना भुगतान मैन्युअल रूप से पूरा करें:\n\n1. अपना MoMo ऐप खोलें\n2. ${result.amountFormatted}₫ भेजें:\n  📱फोन: ${result.phoneNumber}\n  👤 खाता: ${result.accountName}\n3. इस संदर्भ को शामिल करें: ${result.orderId}\n4. भुगतान पुष्टि का स्क्रीनशॉट लें\n5. स्क्रीनशॉट ईमेल करें: ${result.supportEmail}\n\nहम भुगतान पुष्टि के 24 घंटों के भीतर आपकी ${readablePlan} सदस्यता सक्रिय कर देंगे।\n\nआपके धैर्य के लिए धन्यवाद!`;
        break;
      case "ar":
        instructions = `الدفع اليدوي مطلوب\n\nيرجى إكمال دفعتك يدويًا:\n\n1. افتح تطبيق MoMo الخاص بك\n2. أرسل ${result.amountFormatted}₫ إلى:\n  📱الهاتف: ${result.phoneNumber}\n  👤 الحساب: ${result.accountName}\n3. قم بتضمين هذا المرجع: ${result.orderId}\n4. التقط لقطة شاشة لتأكيد الدفع\n5. أرسل لقطة الشاشة بالبريد الإلكتروني إلى: ${result.supportEmail}\n\nسنقوم بتنشيط اشتراكك ${readablePlan} في غضون 24 ساعة من تأكيد الدفع.\n\nشكرا لك على صبرك!`;
        break;
      default: // English
        instructions = `Manual Payment Required\n\nPlease complete your payment manually:\n\n1. Open your MoMo app\n2. Send ${result.amountFormatted}₫ to:\n  📱Phone: ${result.phoneNumber}\n  👤 Account: ${result.accountName}\n3. Include this reference: ${result.orderId}\n4. Take a screenshot of the payment confirmation\n5. Email the screenshot to: ${result.supportEmail}\n\nWe will activate your ${readablePlan} subscription within 24 hours of payment confirmation.\n\nThank you for your patience!`;
    }

    // ADD THIS: For manual payments, we'll generate passcodes immediately
    // since the user has "paid" by committing to manual transfer
    const selectedPlan = JSON.parse(
      localStorage.getItem("selectedPlan") || "{}",
    );

    return {
      success: true,
      isManual: true,
      instructions: instructions,
      orderId: result.orderId,
      note:
        this.translations.payment_note_reference ||
        "Please include the reference number in your payment.",
    };
  }

  // Add this new method for dynamic loading
  async loadMomoPaymentDynamic(planType, amountVND) {
    return new Promise((resolve, reject) => {
      console.log("📦 Dynamically loading momo-payment.js...");

      const script = document.createElement("script");
      script.src = "./js/momo-payment.js";
      script.onload = () => {
        console.log("✅ momo-payment.js dynamically loaded");
        // Wait a bit for initialization
        setTimeout(() => {
          if (
            window.selectPlanWithMomo &&
            typeof window.selectPlanWithMomo === "function"
          ) {
            console.log("✅ Now calling selectPlanWithMomo after dynamic load");
            window
              .selectPlanWithMomo(planType, amountVND)
              .then(resolve)
              .catch(reject);
          } else {
            reject(
              new Error("MoMo payment still not available after dynamic load"),
            );
          }
        }, 1000);
      };
      script.onerror = () => {
        console.error("❌ Failed to load momo-payment.js dynamically");
        reject(new Error("Could not load payment system"));
      };

      document.head.appendChild(script);
    });
  }

  moveToLoginFirst(planType) {
    localStorage.setItem("pendingSubscription", planType);
    localStorage.setItem("subscriptionIntent", planType);

    const message =
      this.translations.please_sign_in ||
      "Please sign in to proceed with payment. Moving to login...";
    alert(message);

    setTimeout(() => {
      console.log("🔄 Moving to main app for authentication");
      window.location.href = "./dashboard.html";
    }, 1000);
  }

  handlePayPalPayment() {
    console.log("🔄 Handling PayPal payment...");

    // Get selected plan from localStorage
    const selectedPlanStr = localStorage.getItem("selectedPlan");
    if (!selectedPlanStr) {
      console.error("❌ No selected plan found");
      return;
    }

    const selectedPlan = JSON.parse(selectedPlanStr);
    console.log("📦 Processing PayPal payment for:", selectedPlan);

    // 🔥 FIX: Store plan with payment method immediately
    const planData = {
      type: selectedPlan.type,
      price: selectedPlan.price || selectedPlan.amountUSD,
      isBulk: selectedPlan.isBulk || false,
      userCount: selectedPlan.userCount || 1,
      currency: selectedPlan.currency || "USD",
    };
    localStorage.setItem(`selectedPlan_paypal`, JSON.stringify(planData));

    // Show PayPal modal
    this.showPayPalModal(selectedPlan);
  }

  showPayPalModal(selectedPlan) {
    console.log("🔄 Showing PayPal modal for plan:", selectedPlan);

    // 🔥 FIX: Handle both price and amountUSD
    if (!selectedPlan) {
      console.error("❌ No plan data");
      return;
    }

    // Normalize plan data (handle both price and amountUSD)
    if (!selectedPlan.price && selectedPlan.amountUSD) {
      selectedPlan.price = selectedPlan.amountUSD;
    }

    if (!selectedPlan.price) {
      console.error("❌ Invalid plan data - no price:", selectedPlan);
      // Try to recover from localStorage
      const storedPlan = localStorage.getItem("selectedPlan");
      if (storedPlan) {
        selectedPlan = JSON.parse(storedPlan);
        // Normalize again
        if (!selectedPlan.price && selectedPlan.amountUSD) {
          selectedPlan.price = selectedPlan.amountUSD;
        }
        console.log("✅ Recovered plan from localStorage:", selectedPlan);
      } else {
        alert("Error: Plan information missing. Please try again.");
        return;
      }
    }

    const lang = localStorage.getItem("userLanguage") || "en";

    // Get translations
    const payWithPaypal = this.getPaypalTranslation("payWithPaypal", lang);
    const havingTrouble = this.getPaypalTranslation("havingTrouble", lang);
    const useManualInstead = this.getPaypalTranslation(
      "useManualInstead",
      lang,
    );
    const cancel = this.getPaypalTranslation("cancel", lang);

    const modal = document.createElement("div");
    modal.id = "paypal-modal";
    modal.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0,0,0,0.8); z-index: 10001; display: flex;
        justify-content: center; align-items: center; font-family: Arial, sans-serif;
    `;

    const amount = selectedPlan.price || "0.00";
    const planType = selectedPlan.type || "";

    modal.innerHTML = `
        <div style="background: white; padding: 30px; border-radius: 15px; max-width: 90%; width: 450px; text-align: center;">
            <h3 style="color: #0070ba; margin-bottom: 10px;">${payWithPaypal}</h3>
            <p style="font-size: 18px; margin-bottom: 20px; color: #333;">
                ${planType} - $${amount}
            </p>
            
            <!-- PayPal Button Container -->
            <div id="paypal-button-container-modal" style="margin: 20px 0; min-height: 150px;"></div>
            
            <!-- Manual payment note -->
            <div id="paypal-manual-fallback" style="display: none; margin: 15px 0; padding: 15px; background: #f8f9fa; border-radius: 8px;">
                <p style="color: #666; margin-bottom: 10px;">${havingTrouble}</p>
                <button id="use-manual-paypal" style="
                    background: #6c757d; color: white; border: none; padding: 10px 20px;
                    border-radius: 6px; cursor: pointer; width: 100%;
                ">${useManualInstead}</button>
            </div>
            
            <button id="close-paypal-modal" style="
                background: #6c757d; color: white; border: none; padding: 10px 20px;
                border-radius: 6px; cursor: pointer; width: 100%; margin-top: 10px;
            ">${cancel}</button>
        </div>
    `;

    document.body.appendChild(modal);

    // ✅ Only load PayPal script now, with valid plan
    this.loadPayPalScript(selectedPlan, "paypal-button-container-modal");

    // Manual fallback handler
    document
      .getElementById("use-manual-paypal")
      ?.addEventListener("click", () => {
        document.body.removeChild(modal);
        this.handleBankTransfer();
      });

    // Close modal handler
    document
      .getElementById("close-paypal-modal")
      .addEventListener("click", () => {
        document.body.removeChild(modal);
      });
  }

  // Helper method for PayPal payment
  showPayPalInstructions(paypalData) {
    this.hidePaymentLoading();

    // 🔧 FIX: Reset processing flag when showing instructions
    setTimeout(() => {
      if (this.isPayPalProcessing) {
        this.isPayPalProcessing = false;
        this.paypalStartTime = 0;
        console.log("🔄 PayPal processing flag reset (instructions displayed)");
      }
    }, 500);

    const yourPayPalEmail = "thomasnguyen07@yahoo.com";
    const displayCurrency = "USD";

    // 🔧 SAFETY CHECK: Ensure required properties exist
    if (!paypalData.amountUSD && !paypalData.amount) {
      // Try to get from localStorage as fallback
      try {
        const storedPlan = JSON.parse(localStorage.getItem("selectedPlan"));
        if (storedPlan) {
          paypalData.amountUSD = paypalData.amountUSD || storedPlan.amountUSD;
          paypalData.planType = paypalData.planType || storedPlan.type;
          paypalData.isBulk = paypalData.isBulk || storedPlan.isBulk;
          paypalData.userCount = paypalData.userCount || storedPlan.userCount;
        }
      } catch (e) {
        console.warn("Could not load plan from localStorage:", e);
      }
    }

    // Ensure userCount exists for display
    const userCount = paypalData.userCount || (paypalData.isBulk ? 1 : null);

    let instructions;

    switch (this.currentLang) {
      case "vi":
        instructions = `
<div style="max-height: 300px; overflow-y: auto; padding-right: 10px;">
    <strong>THANH TOÁN PAYPAL</strong>

    <div style="margin: 15px 0; padding: 15px; background: #f8f9fa; border-radius: 10px;">
        <strong>💳 THÔNG TIN PAYPAL</strong><br>
        <strong>Email PayPal:</strong> ${yourPayPalEmail}<br>
        <strong>Số tiền:</strong> ${paypalData.amountUSD} ${displayCurrency}<br>
        <strong>Gói:</strong> ${this.getTranslatedPlanName(
          paypalData.planType,
        )}<br>
        ${
          paypalData.isBulk
            ? `<strong>Số người dùng:</strong> ${paypalData.userCount || 1}<br>`
            : ""
        }
        <strong>Mã đơn hàng:</strong> ${paypalData.orderId}
    </div>

    <div style="margin: 15px 0; padding: 15px; background: #f8f9fa; border-radius: 10px;">
        <strong>📋 HƯỚNG DẪN THANH TOÁN</strong><br>
        <strong>1.</strong> Truy cập PayPal.com hoặc mở ứng dụng PayPal<br>
        <strong>2.</strong> Gửi <strong>${
          paypalData.amountUSD
        } ${displayCurrency}</strong> đến email trên<br>
        <strong>3.</strong> <strong style="color: #e74c3c;">QUAN TRỌNG:</strong> Ghi nội dung:<br>
        &nbsp;&nbsp;&nbsp;<code>"CONNECTIONS ${paypalData.orderId}"</code><br>
        <strong>4.</strong> Chụp ảnh màn hình xác nhận thanh toán
    </div>

    <div style="margin: 15px 0; padding: 15px; background: #e8f5e8; border-radius: 10px;">
        <strong>✅ SAU KHI THANH TOÁN</strong><br>
        • Giữ ảnh chụp xác nhận<br>
        • Chúng tôi sẽ kích hoạt trong vòng 24 giờ
    </div>

    <div style="text-align: center; margin-top: 20px; font-style: italic;">
        Cảm ơn bạn đã hỗ trợ trong giai đoạn beta!
    </div>
    <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
    <p style="color: #666; margin-bottom: 15px;">
        Sau khi đã chuyển khoản, vui lòng nhấn:
    </p>
    <button onclick="window.premiumManager.confirmManualPayment('${paypalData.paymentId || ""}')"
            style="padding: 12px 30px; background: #4CAF50; color: white; 
                   border: none; border-radius: 5px; font-size: 16px; 
                   font-weight: bold; cursor: pointer;">
        ✅  Tôi đã chuyển khoản
    </button>
</div>
</div>`;
        break;

      case "zh":
        instructions = `
<div style="max-height: 300px; overflow-y: auto; padding-right: 10px;">
    <strong>PAYPAL 支付</strong>

    <div style="margin: 15px 0; padding: 15px; background: #f8f9fa; border-radius: 10px;">
        <strong>💳 PAYPAL 信息</strong><br>
        <strong>PayPal 邮箱:</strong> ${yourPayPalEmail}<br>
        <strong>金额:</strong> ${paypalData.amountUSD} ${displayCurrency}<br>
        <strong>套餐:</strong> ${this.getTranslatedPlanName(
          paypalData.planType,
        )}<br>
        ${
          paypalData.isBulk
            ? `<strong>用户数量:</strong> ${paypalData.userCount || 1}<br>`
            : ""
        }
        <strong>订单ID:</strong> ${paypalData.orderId}
    </div>

    <div style="margin: 15px 0; padding: 15px; background: #f8f9fa; border-radius: 10px;">
        <strong>📋 支付说明</strong><br>
        <strong>1.</strong> 访问 PayPal.com 或打开 PayPal 应用<br>
        <strong>2.</strong> 发送 <strong>${
          paypalData.amountUSD
        } ${displayCurrency}</strong> 到上方邮箱<br>
        <strong>3.</strong> <strong style="color: #e74c3c;">重要：</strong> 包含备注：<br>
        &nbsp;&nbsp;&nbsp;<code>"CONNECTIONS ${paypalData.orderId}"</code><br>
        <strong>4.</strong> 截取支付确认截图
    </div>

    <div style="margin: 15px 0; padding: 15px; background: #e8f5e8; border-radius: 10px;">
        <strong>✅ 支付后</strong><br>
        • 保留确认截图<br>
        • 我们将在24小时内激活
    </div>

    <div style="text-align: center; margin-top: 20px; font-style: italic;">
        感谢您在测试阶段支持我们！
    </div>
    <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
    <p style="color: #666; margin-bottom: 15px;">
        完成转账后，请点击：
    </p>
    <button onclick="window.premiumManager.confirmManualPayment('${paypalData.paymentId || ""}')"
            style="padding: 12px 30px; background: #4CAF50; color: white; 
                   border: none; border-radius: 5px; font-size: 16px; 
                   font-weight: bold; cursor: pointer;">
        ✅  我已转账
    </button>
</div>
</div>`;
        break;

      case "es":
        instructions = `
<div style="max-height: 300px; overflow-y: auto; padding-right: 10px;">
    <strong>PAGO PAYPAL</strong>

    <div style="margin: 15px 0; padding: 15px; background: #f8f9fa; border-radius: 10px;">
        <strong>💳 INFORMACIÓN PAYPAL</strong><br>
        <strong>Email de PayPal:</strong> ${yourPayPalEmail}<br>
        <strong>Cantidad:</strong> ${
          paypalData.amountUSD
        } ${displayCurrency}<br>
        <strong>Plan:</strong> ${this.getTranslatedPlanName(
          paypalData.planType,
        )}<br>
        ${
          paypalData.isBulk
            ? `<strong>Usuarios:</strong> ${paypalData.userCount || 1}<br>`
            : ""
        }
        <strong>ID del Pedido:</strong> ${paypalData.orderId}
    </div>

    <div style="margin: 15px 0; padding: 15px; background: #f8f9fa; border-radius: 10px;">
        <strong>📋 INSTRUCCIONES DE PAGO</strong><br>
        <strong>1.</strong> Vaya a PayPal.com o abra la aplicación PayPal<br>
        <strong>2.</strong> Envíe <strong>${
          paypalData.amountUSD
        } ${displayCurrency}</strong> al email anterior<br>
        <strong>3.</strong> <strong style="color: #e74c3c;">IMPORTANTE:</strong> Incluya nota:<br>
        &nbsp;&nbsp;&nbsp;<code>"CONNECTIONS ${paypalData.orderId}"</code><br>
        <strong>4.</strong> Tome captura de pantalla de la confirmación de pago
    </div>

    <div style="margin: 15px 0; padding: 15px; background: #e8f5e8; border-radius: 10px;">
        <strong>✅ DESPUÉS DEL PAGO</strong><br>
        • Guarde captura de confirmación<br>
        • Activaremos dentro de 24 horas
    </div>

    <div style="text-align: center; margin-top: 20px; font-style: italic;">
        ¡Gracias por apoyarnos durante nuestra fase beta!
    </div>
    <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
    <p style="color: #666; margin-bottom: 15px;">
        Después de realizar la transferencia, haga clic:
    </p>
    <button onclick="window.premiumManager.confirmManualPayment('${paypalData.paymentId || ""}')"
            style="padding: 12px 30px; background: #4CAF50; color: white; 
                   border: none; border-radius: 5px; font-size: 16px; 
                   font-weight: bold; cursor: pointer;">
        ✅ He realizado la transferencia
    </button>
</div>
</div>`;
        break;

      case "hi":
        instructions = `
<div style="max-height: 300px; overflow-y: auto; padding-right: 10px;">
    <strong>PAYPAL भुगतान</strong>

    <div style="margin: 15px 0; padding: 15px; background: #f8f9fa; border-radius: 10px;">
        <strong>💳 PAYPAL जानकारी</strong><br>
        <strong>PayPal ईमेल:</strong> ${yourPayPalEmail}<br>
        <strong>राशि:</strong> ${paypalData.amountUSD} ${displayCurrency}<br>
        <strong>योजना:</strong> ${this.getTranslatedPlanName(
          paypalData.planType,
        )}<br>
        ${
          paypalData.isBulk
            ? `<strong>उपयोगकर्ता:</strong> ${paypalData.userCount || 1}<br>`
            : ""
        }
        <strong>ऑर्डर आईडी:</strong> ${paypalData.orderId}
    </div>

    <div style="margin: 15px 0; padding: 15px; background: #f8f9fa; border-radius: 10px;">
        <strong>📋 भुगतान निर्देश</strong><br>
        <strong>1.</strong> PayPal.com पर जाएं या PayPal ऐप खोलें<br>
        <strong>2.</strong> <strong>${
          paypalData.amountUSD
        } ${displayCurrency}</strong> ऊपर दिए गए ईमेल पर भेजें<br>
        <strong>3.</strong> <strong style="color: #e74c3c;">महत्वपूर्ण:</strong> नोट शामिल करें:<br>
        &nbsp;&nbsp;&nbsp;<code>"CONNECTIONS ${paypalData.orderId}"</code><br>
        <strong>4.</strong> भुगतान पुष्टि की स्क्रीनशॉट लें
    </div>

    <div style="margin: 15px 0; padding: 15px; background: #e8f5e8; border-radius: 10px;">
        <strong>✅ भुगतान के बाद</strong><br>
        • पुष्टि स्क्रीनशॉट रखें<br>
        • हम 24 घंटों के भीतर सक्रिय कर देंगे
    </div>

    <div style="text-align: center; margin-top: 20px; font-style: italic;">
        बीटा चरण के दौरान समर्थन के लिए धन्यवाद!
    </div>
    <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
    <p style="color: #666; margin-bottom: 15px;">
        ट्रांसफर करने के बाद, कृपया क्लिक करें:
    </p>
    <button onclick="window.premiumManager.confirmManualPayment('${paypalData.paymentId || ""}')"
            style="padding: 12px 30px; background: #4CAF50; color: white; 
                   border: none; border-radius: 5px; font-size: 16px; 
                   font-weight: bold; cursor: pointer;">
        ✅ मैंने ट्रांसफर कर दिया है
    </button>
</div>
</div>`;
        break;

      case "ar":
        instructions = `
<div style="max-height: 300px; overflow-y: auto; padding-right: 10px;">
    <strong>الدفع عبر PAYPAL</strong>

    <div style="margin: 15px 0; padding: 15px; background: #f8f9fa; border-radius: 10px;">
        <strong>💳 معلومات PAYPAL</strong><br>
        <strong>بريد PayPal:</strong> ${yourPayPalEmail}<br>
        <strong>المبلغ:</strong> ${paypalData.amountUSD} ${displayCurrency}<br>
        <strong>الخطة:</strong> ${this.getTranslatedPlanName(
          paypalData.planType,
        )}<br>
        ${
          paypalData.isBulk
            ? `<strong>المستخدمين:</strong> ${paypalData.userCount || 1}<br>`
            : ""
        }
        <strong>معرف الطلب:</strong> ${paypalData.orderId}
    </div>

    <div style="margin: 15px 0; padding: 15px; background: #f8f9fa; border-radius: 10px;">
        <strong>📋 تعليمات الدفع</strong><br>
        <strong>1.</strong> انتقل إلى PayPal.com أو افتح تطبيق PayPal<br>
        <strong>2.</strong> أرسل <strong>${
          paypalData.amountUSD
        } ${displayCurrency}</strong> إلى البريد أعلاه<br>
        <strong>3.</strong> <strong style="color: #e74c3c;">مهم:</strong> قم بتضمين ملاحظة:<br>
        &nbsp;&nbsp;&nbsp;<code>"CONNECTIONS ${paypalData.orderId}"</code><br>
        <strong>4.</strong> التقط لقطة شاشة لتأكيد الدفع
    </div>

    <div style="margin: 15px 0; padding: 15px; background: #e8f5e8; border-radius: 10px;">
        <strong>✅ بعد الدفع</strong><br>
        • احتفظ بلقطة الشاشة للتأكيد<br>
        • سنقوم بالتنشيط في غضون 24 ساعة
    </div>

    <div style="text-align: center; margin-top: 20px; font-style: italic;">
        شكرًا لدعمك خلال مرحلتنا التجريبية!
    </div>
    <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
    <p style="color: #666; margin-bottom: 15px;">
        بعد إتمام التحويل، الرجاء النقر:
    </p>
    <button onclick="window.premiumManager.confirmManualPayment('${paypalData.paymentId || ""}')"
            style="padding: 12px 30px; background: #4CAF50; color: white; 
                   border: none; border-radius: 5px; font-size: 16px; 
                   font-weight: bold; cursor: pointer;">
        ✅ لقد قمت بالتحويل
    </button>
</div>
    </div>`;
        break;

      default: // English
        instructions = `
<div style="max-height: 300px; overflow-y: auto; padding-right: 10px;">
    <strong>PAYPAL PAYMENT</strong>

    <div style="margin: 15px 0; padding: 15px; background: #f8f9fa; border-radius: 10px;">
        <strong>💳 PAYPAL INFORMATION</strong><br>
        <strong>PayPal Email:</strong> ${yourPayPalEmail}<br>
        <strong>Amount:</strong> ${paypalData.amountUSD} ${displayCurrency}<br>
        <strong>Plan:</strong> ${this.getTranslatedPlanName(
          paypalData.planType,
        )}<br>
        ${
          paypalData.isBulk
            ? `<strong>Users:</strong> ${paypalData.userCount || 1}<br>`
            : ""
        }
        <strong>Order ID:</strong> ${paypalData.orderId}
    </div>

    <div style="margin: 15px 0; padding: 15px; background: #f8f9fa; border-radius: 10px;">
        <strong>📋 PAYMENT INSTRUCTIONS</strong><br>
        <strong>1.</strong> Go to PayPal.com or open PayPal app<br>
        <strong>2.</strong> Send <strong>${
          paypalData.amountUSD
        } ${displayCurrency}</strong> to the email above<br>
        <strong>3.</strong> <strong style="color: #e74c3c;">IMPORTANT:</strong> Include note:<br>
        &nbsp;&nbsp;&nbsp;<code>"CONNECTIONS ${paypalData.orderId}"</code><br>
        <strong>4.</strong> Take screenshot of payment confirmation
    </div>

    <div style="margin: 15px 0; padding: 15px; background: #e8f5e8; border-radius: 10px;">
        <strong>✅ AFTER PAYMENT</strong><br>
        • Keep confirmation screenshot<br>
        • We'll activate within 24 hours
    </div>

    <div style="text-align: center; margin-top: 20px; font-style: italic;">
        Thank you for supporting during our beta phase!
    </div>
    
<div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
    <p style="color: #666; margin-bottom: 15px;">
        After completing your transfer, please click:
    </p>
    <button onclick="window.premiumManager.confirmManualPayment('${paypalData.paymentId || ""}')"
            style="padding: 12px 30px; background: #4CAF50; color: white; 
                   border: none; border-radius: 5px; font-size: 16px; 
                   font-weight: bold; cursor: pointer;">
        ✅ I Have Made the Transfer
    </button>
</div>
</div>`;
    }

    this.showPaymentModal(
      this.translations.paypal_payment_beta || "PayPal Payment - Beta",
      instructions,
    );
  }

  // Helper method to show loading
  showPaymentLoading() {
    let overlay = document.getElementById("payment-loading");
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.id = "payment-loading";
      overlay.style.cssText = `
      position: fixed; top: 0; left: 0; width: 100%; height: 100%;
      background: rgba(0,0,0,0.7); display: flex; justify-content: center;
      align-items: center; z-index: 9999; flex-direction: column; color: white;
    `;

      const spinner = document.createElement("div");
      spinner.style.cssText = `
      width: 50px; height: 50px; border: 5px solid #f3f3f3;
      border-top: 5px solid #0070ba; border-radius: 50%;
      animation: spin 1s linear infinite; margin-bottom: 20px;
    `;

      const text = document.createElement("div");
      text.textContent = "Processing PayPal Payment...";
      text.style.fontSize = "16px";

      overlay.appendChild(spinner);
      overlay.appendChild(text);
      document.body.appendChild(overlay);

      const style = document.createElement("style");
      style.textContent = `@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`;
      document.head.appendChild(style);
    }
    overlay.style.display = "flex";
  }

  // Helper method to hide loading
  hidePaymentLoading() {
    const overlay = document.getElementById("payment-loading");
    if (overlay) {
      overlay.style.display = "none";
    }
  }

  async handleBankTransfer() {
    if (this.isBankProcessing) {
      console.log(
        "⚠️ Bank Transfer already processing, skipping duplicate call",
      );
      return;
    }
    this.isBankProcessing = true;

    try {
      const selectedPlan = JSON.parse(localStorage.getItem("selectedPlan"));
      if (!selectedPlan) {
        alert(
          this.translations.please_select_plan ||
            "Please select a subscription plan first",
        );
        return;
      }

      console.log("🏦 Processing bank transfer for plan:", selectedPlan);

      // 🔧 FIX: Handle BOTH individual and bulk plans
      let displaySymbol = selectedPlan.symbol || "$";
      let displayAmount =
        selectedPlan.amountLocal ||
        selectedPlan.amountUSD ||
        selectedPlan.price ||
        "0.00";
      let displayCurrency = selectedPlan.currency || "USD";

      // For bulk plans, calculate local currency display
      if (selectedPlan.isBulk) {
        try {
          // Use your currency conversion functions if available
          if (this.getCurrencyForLanguage && this.convertPrice) {
            const currencyInfo = this.getCurrencyForLanguage();
            const converted = this.convertPrice(
              selectedPlan.amountUSD || selectedPlan.price || 0,
              currencyInfo.code,
            );
            displaySymbol = converted.symbol;
            displayAmount = converted.amount;
            displayCurrency = converted.currency;
          } else {
            // Fallback for bulk: just show USD
            displaySymbol = "$";
            displayAmount = (
              selectedPlan.amountUSD ||
              selectedPlan.price ||
              0
            ).toFixed(2);
            displayCurrency = "USD";
          }
        } catch (error) {
          console.warn("Currency conversion failed, using USD:", error);
          displaySymbol = "$";
          displayAmount = (
            selectedPlan.amountUSD ||
            selectedPlan.price ||
            0
          ).toFixed(2);
          displayCurrency = "USD";
        }
      }

      const user = window.fb?.auth?.currentUser;
      const orderId = `bank_${Date.now()}_${user.uid?.slice(-8) || "unknown"}`;

      // Track bank transfer payment
      const paymentId = await this.trackPayment({
        planType: selectedPlan.type,
        amountUSD: selectedPlan.amountUSD || selectedPlan.price || 0,
        currency: selectedPlan.currency || "USD",
        paymentMethod: "bank_transfer",
        orderId: orderId,
        isOrganization: selectedPlan.isBulk || false,
        userCount: selectedPlan.userCount || 1,
      });

      localStorage.setItem("currentPaymentId", paymentId);

      let instructions;

      switch (this.currentLang) {
        case "vi":
          instructions = `
<div style="max-height: 300px; overflow-y: auto; padding-right: 10px;">
    <strong>${selectedPlan.isBulk ? "THANH TOÁN CHUYỂN KHOẢN CHO TỔ CHỨC" : "THANH TOÁN CHUYỂN KHOẢN NGÂN HÀNG"}</strong>

    <div style="margin: 15px 0; padding: 15px; background: #f8f9fa; border-radius: 10px;">
        <strong>🏦 THÔNG TIN NGÂN HÀNG</strong><br>
        <strong>Ngân hàng:</strong> Vietcombank<br>
        <strong>Số tài khoản:</strong> 1041095817<br>
        <strong>Chủ tài khoản:</strong> HUYNH DUC NGUYEN
    </div>

    <div style="margin: 15px 0; padding: 15px; background: #f8f9fa; border-radius: 10px;">
        <strong>💰 THÔNG TIN CHUYỂN KHOẢN</strong><br>
        <strong>Số tiền:</strong> ${displaySymbol}${displayAmount} ${displayCurrency}<br>
        ${selectedPlan.amountUSD ? `<strong>Số tiền (USD):</strong> $${(selectedPlan.amountUSD || 0).toFixed(2)} USD<br>` : ""}
        <strong>Gói:</strong> ${this.getTranslatedPlanName(selectedPlan.type)}<br>
        ${selectedPlan.isBulk ? `<strong>Số người dùng:</strong> ${selectedPlan.userCount}<br>` : ""}
        <strong>Mã đơn hàng:</strong> ${orderId}
    </div>

    <div style="margin: 15px 0; padding: 15px; background: #e8f4fd; border-radius: 10px;">
        <strong>📋 HƯỚNG DẪN</strong><br>
        <strong>1.</strong> Thực hiện chuyển khoản với số tiền chính xác<br>
        <strong>2.</strong> <strong style="color: #e74c3c;">QUAN TRỌNG:</strong> Ghi nội dung chuyển khoản:<br>
        &nbsp;&nbsp;&nbsp;<code>"CONNECTIONS ${orderId}"</code><br>
        <strong>3.</strong> Giữ lại biên lai chuyển khoản
    </div>

    <div style="margin: 15px 0; padding: 15px; background: #e8f5e8; border-radius: 10px;">
        <strong>✅ SAU KHI CHUYỂN KHOẢN</strong><br>
        • Chụp ảnh biên lai xác nhận<br>
        • Chúng tôi sẽ kích hoạt trong vòng 24 giờ
    </div>
    <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
    <p style="color: #666; margin-bottom: 15px;">
        Sau khi đã chuyển khoản, vui lòng nhấn:
    </p>
    <button onclick="window.premiumManager.confirmManualPayment('${paymentId}')"
            style="padding: 12px 30px; background: #4CAF50; color: white; 
                   border: none; border-radius: 5px; font-size: 16px; 
                   font-weight: bold; cursor: pointer;">
        ✅ Tôi đã chuyển khoản
    </button>
</div>
</div>`;
          break;

        case "zh":
          instructions = `
<div style="max-height: 300px; overflow-y: auto; padding-right: 10px;">
    <strong>${selectedPlan.isBulk ? "组织银行转账支付" : "银行转账支付"}</strong>

    <div style="margin: 15px 0; padding: 15px; background: #f8f9fa; border-radius: 10px;">
        <strong>🏦 银行信息</strong><br>
        <strong>银行:</strong> Vietcombank<br>
        <strong>账号:</strong> 1041095817<br>
        <strong>账户持有人:</strong> HUYNH DUC NGUYEN
    </div>

    <div style="margin: 15px 0; padding: 15px; background: #f8f9fa; border-radius: 10px;">
        <strong>💰 转账信息</strong><br>
        <strong>金额:</strong> ${displaySymbol}${displayAmount} ${displayCurrency}<br>
        ${selectedPlan.amountUSD ? `<strong>金额 (USD):</strong> $${(selectedPlan.amountUSD || 0).toFixed(2)} USD<br>` : ""}
        <strong>套餐:</strong> ${this.getTranslatedPlanName(selectedPlan.type)}<br>
        ${selectedPlan.isBulk ? `<strong>用户数量:</strong> ${selectedPlan.userCount}<br>` : ""}
        <strong>订单ID:</strong> ${orderId}
    </div>

    <div style="margin: 15px 0; padding: 15px; background: #e8f4fd; border-radius: 10px;">
        <strong>📋 说明</strong><br>
        <strong>1.</strong> 转账准确金额<br>
        <strong>2.</strong> <strong style="color: #e74c3c;">重要：</strong> 包含转账备注：<br>
        &nbsp;&nbsp;&nbsp;<code>"CONNECTIONS ${orderId}"</code><br>
        <strong>3.</strong> 保留转账收据
    </div>

    <div style="margin: 15px 0; padding: 15px; background: #e8f5e8; border-radius: 10px;">
        <strong>✅ 转账后</strong><br>
        • 截取确认截图<br>
        • 我们将在24小时内激活
    </div>
    <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
    <p style="color: #666; margin-bottom: 15px;">
        完成转账后，请点击:
    </p>
    <button onclick="window.premiumManager.confirmManualPayment('${paymentId}')"
            style="padding: 12px 30px; background: #4CAF50; color: white; 
                   border: none; border-radius: 5px; font-size: 16px; 
                   font-weight: bold; cursor: pointer;">
        ✅  我已转账
    </button>
</div>
</div>`;
          break;

        case "es":
          instructions = `
<div style="max-height: 300px; overflow-y: auto; padding-right: 10px;">
    <strong>${selectedPlan.isBulk ? "PAGO POR TRANSFERENCIA PARA ORGANIZACIÓN" : "PAGO POR TRANSFERENCIA BANCARIA"}</strong>

    <div style="margin: 15px 0; padding: 15px; background: #f8f9fa; border-radius: 10px;">
        <strong>🏦 INFORMACIÓN BANCARIA</strong><br>
        <strong>Banco:</strong> Vietcombank<br>
        <strong>Número de Cuenta:</strong> 1041095817<br>
        <strong>Titular de la Cuenta:</strong> HUYNH DUC NGUYEN
    </div>

    <div style="margin: 15px 0; padding: 15px; background: #f8f9fa; border-radius: 10px;">
        <strong>💰 INFORMACIÓN DE TRANSFERENCIA</strong><br>
        <strong>Cantidad:</strong> ${displaySymbol}${displayAmount} ${displayCurrency}<br>
        ${selectedPlan.amountUSD ? `<strong>Cantidad (USD):</strong> $${(selectedPlan.amountUSD || 0).toFixed(2)} USD<br>` : ""}
        <strong>Plan:</strong> ${this.getTranslatedPlanName(selectedPlan.type)}<br>
        ${selectedPlan.isBulk ? `<strong>Usuarios:</strong> ${selectedPlan.userCount}<br>` : ""}
        <strong>ID del Pedido:</strong> ${orderId}
    </div>

    <div style="margin: 15px 0; padding: 15px; background: #e8f4fd; border-radius: 10px;">
        <strong>📋 INSTRUCCIONES</strong><br>
        <strong>1.</strong> Transfiera el monto exacto<br>
        <strong>2.</strong> <strong style="color: #e74c3c;">IMPORTANTE:</strong> Incluya nota de transferencia:<br>
        &nbsp;&nbsp;&nbsp;<code>"CONNECTIONS ${orderId}"</code><br>
        <strong>3.</strong> Guarde el recibo de transferencia
    </div>

    <div style="margin: 15px 0; padding: 15px; background: #e8f5e8; border-radius: 10px;">
        <strong>✅ DESPUÉS DE LA TRANSFERENCIA</strong><br>
        • Tome captura de pantalla de confirmación<br>
        • Activaremos dentro de 24 horas
    </div>
    <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
    <p style="color: #666; margin-bottom: 15px;">
        Después de realizar la transferencia, haga clic:
    </p>
    <button onclick="window.premiumManager.confirmManualPayment('${paymentId}')"
            style="padding: 12px 30px; background: #4CAF50; color: white; 
                   border: none; border-radius: 5px; font-size: 16px; 
                   font-weight: bold; cursor: pointer;">
        ✅ He realizado la transferencia
    </button>
</div>
</div>`;
          break;

        case "hi":
          instructions = `
<div style="max-height: 300px; overflow-y: auto; padding-right: 10px;">
    <strong>${selectedPlan.isBulk ? "संगठन के लिए बैंक ट्रांसफर भुगतान" : "बैंक ट्रांसफर भुगतान"}</strong>

    <div style="margin: 15px 0; padding: 15px; background: #f8f9fa; border-radius: 10px;">
        <strong>🏦 बैंक जानकारी</strong><br>
        <strong>बैंक:</strong> Vietcombank<br>
        <strong>खाता संख्या:</strong> 1041095817<br>
        <strong>खाता धारक:</strong> HUYNH DUC NGUYEN
    </div>

    <div style="margin: 15px 0; padding: 15px; background: #f8f9fa; border-radius: 10px;">
        <strong>💰 ट्रांसफर जानकारी</strong><br>
        <strong>राशि:</strong> ${displaySymbol}${displayAmount} ${displayCurrency}<br>
        ${selectedPlan.amountUSD ? `<strong>राशि (USD):</strong> $${(selectedPlan.amountUSD || 0).toFixed(2)} USD<br>` : ""}
        <strong>योजना:</strong> ${this.getTranslatedPlanName(selectedPlan.type)}<br>
        ${selectedPlan.isBulk ? `<strong>उपयोगकर्ता:</strong> ${selectedPlan.userCount}<br>` : ""}
        <strong>ऑर्डर आईडी:</strong> ${orderId}
    </div>

    <div style="margin: 15px 0; padding: 15px; background: #e8f4fd; border-radius: 10px;">
        <strong>📋 निर्देश</strong><br>
        <strong>1.</strong> सटीक राशि ट्रांसफर करें<br>
        <strong>2.</strong> <strong style="color: #e74c3c;">महत्वपूर्ण:</strong> ट्रांसफर नोट शामिल करें:<br>
        &nbsp;&nbsp;&nbsp;<code>"CONNECTIONS ${orderId}"</code><br>
        <strong>3.</strong> ट्रांसफर रसीद रखें
    </div>

    <div style="margin: 15px 0; padding: 15px; background: #e8f5e8; border-radius: 10px;">
        <strong>✅ ट्रांसफर के बाद</strong><br>
        • पुष्टि की स्क्रीनशॉट लें<br>
        • हम 24 घंटों के भीतर सक्रिय करेंगे
    </div>
    <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
    <p style="color: #666; margin-bottom: 15px;">
        ट्रांसफर करने के बाद, कृपया क्लिक करें:
    </p>
    <button onclick="window.premiumManager.confirmManualPayment('${paymentId}')"
            style="padding: 12px 30px; background: #4CAF50; color: white; 
                   border: none; border-radius: 5px; font-size: 16px; 
                   font-weight: bold; cursor: pointer;">
        ✅ मैंने ट्रांसफर कर दिया है
    </button>
</div>
</div>`;
          break;

        case "ar":
          instructions = `
<div style="max-height: 300px; overflow-y: auto; padding-right: 10px;">
    <strong>${selectedPlan.isBulk ? "الدفع بالتحويل البنكي للمؤسسة" : "الدفع بالتحويل البنكي"}</strong>

    <div style="margin: 15px 0; padding: 15px; background: #f8f9fa; border-radius: 10px;">
        <strong>🏦 معلومات البنك</strong><br>
        <strong>البنك:</strong> Vietcombank<br>
        <strong>رقم الحساب:</strong> 1041095817<br>
        <strong>صاحب الحساب:</strong> HUYNH DUC NGUYEN
    </div>

    <div style="margin: 15px 0; padding: 15px; background: #f8f9fa; border-radius: 10px;">
        <strong>💰 معلومات التحويل</strong><br>
        <strong>المبلغ:</strong> ${displaySymbol}${displayAmount} ${displayCurrency}<br>
        ${selectedPlan.amountUSD ? `<strong>المبلغ (USD):</strong> $${(selectedPlan.amountUSD || 0).toFixed(2)} USD<br>` : ""}
        <strong>الخطة:</strong> ${this.getTranslatedPlanName(selectedPlan.type)}<br>
        ${selectedPlan.isBulk ? `<strong>المستخدمين:</strong> ${selectedPlan.userCount}<br>` : ""}
        <strong>معرف الطلب:</strong> ${orderId}
    </div>

    <div style="margin: 15px 0; padding: 15px; background: #e8f4fd; border-radius: 10px;">
        <strong>📋 التعليمات</strong><br>
        <strong>1.</strong> قم بتحويل المبلغ بالضبط<br>
        <strong>2.</strong> <strong style="color: #e74c3c;">مهم:</strong> قم بتضمين ملاحظة التحويل:<br>
        &nbsp;&nbsp;&nbsp;<code>"CONNECTIONS ${orderId}"</code><br>
        <strong>3.</strong> احتفظ بإيصال التحويل
    </div>

    <div style="margin: 15px 0; padding: 15px; background: #e8f5e8; border-radius: 10px;">
        <strong>✅ بعد التحويل</strong><br>
        • التقط لقطة شاشة للتأكيد<br>
        • سنقوم بالتفعيل خلال 24 ساعة
    </div>
    <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
    <p style="color: #666; margin-bottom: 15px;">
        بعد إتمام التحويل، الرجاء النقر:
    </p>
    <button onclick="window.premiumManager.confirmManualPayment('${paymentId}')"
            style="padding: 12px 30px; background: #4CAF50; color: white; 
                   border: none; border-radius: 5px; font-size: 16px; 
                   font-weight: bold; cursor: pointer;">
        ✅  لقد قمت بالتحويل
    </button>
</div>
</div>`;
          break;

        default: // English
          instructions = `
<div style="max-height: 300px; overflow-y: auto; padding-right: 10px;">
    <strong>${selectedPlan.isBulk ? "ORGANIZATION BANK TRANSFER PAYMENT" : "BANK TRANSFER PAYMENT"}</strong>

    <div style="margin: 15px 0; padding: 15px; background: #f8f9fa; border-radius: 10px;">
        <strong>🏦 BANK INFORMATION</strong><br>
        <strong>Bank:</strong> Vietcombank<br>
        <strong>Account Number:</strong> 1041095817<br>
        <strong>Account Holder:</strong> HUYNH DUC NGUYEN
    </div>

    <div style="margin: 15px 0; padding: 15px; background: #f8f9fa; border-radius: 10px;">
        <strong>💰 TRANSFER INFORMATION</strong><br>
        <strong>Amount:</strong> ${displaySymbol}${displayAmount} ${displayCurrency}<br>
        ${selectedPlan.amountUSD ? `<strong>Amount (USD):</strong> $${(selectedPlan.amountUSD || 0).toFixed(2)} USD<br>` : ""}
        <strong>Plan:</strong> ${this.getTranslatedPlanName(selectedPlan.type)}<br>
        ${selectedPlan.isBulk ? `<strong>Users:</strong> ${selectedPlan.userCount}<br>` : ""}
        <strong>Order ID:</strong> ${orderId}
    </div>

    <div style="margin: 15px 0; padding: 15px; background: #e8f4fd; border-radius: 10px;">
        <strong>📋 INSTRUCTIONS</strong><br>
        <strong>1.</strong> Transfer the exact amount<br>
        <strong>2.</strong> <strong style="color: #e74c3c;">IMPORTANT:</strong> Include transfer note:<br>
        &nbsp;&nbsp;&nbsp;<code>"CONNECTIONS ${orderId}"</code><br>
        <strong>3.</strong> Keep the transfer receipt
    </div>

    <div style="margin: 15px 0; padding: 15px; background: #e8f5e8; border-radius: 10px;">
        <strong>✅ AFTER TRANSFER</strong><br>
        • Take screenshot of confirmation<br>
        • We'll activate within 24 hours
    </div>
    
<div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
    <p style="color: #666; margin-bottom: 15px;">
        After completing your transfer, please click:
    </p>
    <button onclick="window.premiumManager.confirmManualPayment('${paymentId}')"
            style="padding: 12px 30px; background: #4CAF50; color: white; 
                   border: none; border-radius: 5px; font-size: 16px; 
                   font-weight: bold; cursor: pointer;">
        ✅ I Have Made the Transfer
    </button>
</div>
</div>`;
      }

      const modalTitle = selectedPlan.isBulk
        ? this.translations.bulk_payment || "Organization Payment"
        : this.translations.bank_transfer || "Bank Transfer";

      this.showPaymentModal(modalTitle, instructions);
    } catch (error) {
      console.error("❌ Bank transfer error:", error);
      alert(
        this.translations.payment_failed ||
          "Bank transfer failed: " + error.message,
      );
    } finally {
      this.isBankProcessing = false;
    }
  }

  getTranslatedPlanName(planType) {
    console.log("🔍 Translating plan:", planType);

    const planNames = {
      // Individual plans
      monthly: this.translations.monthly || "Monthly",
      three_months: this.translations.three_months || "3 Months",
      six_months: this.translations.six_months || "6 Months",
      yearly: this.translations.yearly || "Yearly",

      // Bulk plans
      bulk_monthly_10users:
        this.translations.bulk_monthly_plan || "Monthly Bulk Plan",
      bulk_three_months_10users:
        this.translations.bulk_three_months_plan || "3-Month Bulk Plan",
      bulk_six_months_10users:
        this.translations.bulk_six_months_plan || "6-Month Bulk Plan",
      bulk_yearly_10users:
        this.translations.bulk_yearly_plan || "Yearly Bulk Plan",
    };

    const translated = planNames[planType] || planType;
    console.log("✅ Plan translated to:", translated);
    return translated;
  }

  // ===== QR CODE PAYMENT METHOD =====
  async handleMomoQRPayment() {
    try {
      console.log("🔄 Starting MoMo QR payment process...");

      const selectedPlanStr = localStorage.getItem("selectedPlan");
      if (!selectedPlanStr) {
        alert(
          this.translations.please_select_plan ||
            "Please select a subscription plan first",
        );
        return;
      }

      const selectedPlan = JSON.parse(selectedPlanStr);
      const user = window.fb?.auth?.currentUser;

      if (!user) {
        this.moveToLoginFirst(selectedPlan.type);
        return;
      }

      // Convert to VND for MoMo (payment processing)
      const amountVND = this.convertPrice(selectedPlan.amountUSD, "VND").amount;

      // Get display currency for the current language
      const displayCurrencyInfo = this.getCurrencyForLanguage();
      const displayAmount = this.convertPrice(
        selectedPlan.amountUSD,
        displayCurrencyInfo.code,
      );

      console.log("🚀 Initiating MoMo QR payment:", {
        plan: selectedPlan.type,
        amountVND: amountVND,
        displayCurrency: displayCurrencyInfo.code,
        displayAmount: displayAmount.amount,
        userId: user.uid,
        isBulk: selectedPlan.isBulk || false,
      });

      // Call QR payment function with display currency
      const response = await fetch(
        "https://us-central1-connectionsfinder-app.cloudfunctions.net/createMomoQRPayment",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            amountVND: amountVND,
            planType: selectedPlan.type,
            userId: user.uid,
            userEmail: user.email,
            displayCurrency: displayCurrencyInfo.code, // Send display currency
            isBulk: selectedPlan.isBulk || false, // Add this
          }),
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        console.log("✅ QR payment initiated:", result);

        // Track the payment
        const paymentId = await this.trackPayment({
          planType: selectedPlan.type,
          amountUSD: selectedPlan.amountUSD,
          currency: "VND",
          paymentMethod: "momo_qr",
          orderId: result.orderId,
          isOrganization: selectedPlan.isBulk || false,
          userCount: selectedPlan.userCount || 1,
        });

        localStorage.setItem("currentPaymentId", paymentId);

        // Pass display amount to the modal
        this.showQRPaymentModal(result, displayAmount);

        // 🔧 AUTO-COMPLETE INDIVIDUAL MOMO QR PAYMENTS
        if (!selectedPlan.isBulk) {
          console.log(
            "👤 Individual MoMo QR payment - setting up auto-completion",
          );

          // Wait 5 seconds, then auto-complete
          setTimeout(() => {
            this.autoCompleteIndividualMoMoPayment(paymentId, selectedPlan);
          }, 5000);
        }
      } else {
        throw new Error(result.error || "QR payment failed");
      }
    } catch (error) {
      console.error("❌ MoMo QR payment error:", error);
      alert(
        this.translations.payment_failed ||
          "Payment initialization failed: " + error.message,
      );
    }
  }

  // ===== SHOW QR PAYMENT MODAL =====
  // Update method signature to accept displayAmount
  showQRPaymentModal(qrData, displayAmount) {
    const modal = document.createElement("div");
    modal.style.cssText = `
    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
    background: rgba(0,0,0,0.8); z-index: 10000; display: flex;
    justify-content: center; align-items: center; font-family: Arial, sans-serif;
  `;

    // Debug: Check the actual QR URL (FIXED to use amountVND)
    const debugQrUrl = `https://quickchart.io/qr?size=250&text=${encodeURIComponent(
      `momo://payment?phone=${qrData.phoneNumber}&amount=${qrData.amountVND}&content=CONNECTIONS-${qrData.orderId}`,
    )}`;

    console.log("QR URL being used:", debugQrUrl);
    console.log("QR amount used:", qrData.amountVND || qrData.amount || 0);

    // Test if the image loads
    const testImg = new Image();
    testImg.onload = function () {
      console.log(
        "✅ QR Image loads successfully. Actual dimensions:",
        this.naturalWidth,
        "x",
        this.naturalHeight,
      );
    };
    testImg.onerror = function () {
      console.log("❌ QR Image failed to load");
    };
    testImg.src = debugQrUrl;

    modal.innerHTML = `
    <div style="
      background: white; padding: 25px; border-radius: 15px;
      max-width: 90%; width: 500px; max-height: 80vh;
      overflow-y: auto; text-align: center; box-shadow: 0 10px 30px rgba(0,0,0,0.3);
    ">
      <h2 style="color: #b1216a; margin-bottom: 15px;">${
        this.translations.complete_payment || "Complete Your Payment"
      }</h2>
      
      <div style="margin: 20px 0;">
  <div style="
    width: 250px;
    height: 250px;
    margin: 0 auto;
    border: 2px solid #eee;
    border-radius: 10px;
    overflow: hidden;
    background: white;
  ">
    <img src="./images/momo-qr-code.jpg" 
     alt="MoMo QR Code" 
     style="
       width: 250px;
       height: 250px;
       border: 2px solid #eee;
       border-radius: 10px;
       display: block;
       margin: 0 auto;
       object-fit: cover;
     "
     onerror="
       console.log('Static QR failed, using fallback');
       this.onerror = null;
       this.src = 'https://quickchart.io/qr?size=250&text=' + 
                  encodeURIComponent('momo://payment?phone=+84906756201&amount=${qrData.amountVND}&content=CONNECTIONS-${qrData.orderId}');
     "
>
  </div>
</div>

      <!-- REST OF YOUR MODAL CONTENT (keep as is) -->
      <div style="text-align: left; background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 15px 0;">
        <h3 style="color: #333; margin-bottom: 15px;">${
          this.translations.payment_instructions || "Payment Instructions:"
        }</h3>
        
        <p style="margin: 10px 0;"><strong>${
          this.translations.amount || "Amount:"
        }</strong> ${displayAmount.symbol}${displayAmount.amount} ${
          displayAmount.currency
        }</p>
        <p style="margin: 10px 0; font-size: 14px; color: #666;">
  <strong>${this.translations.amount_vnd || "Amount (VND):"}</strong> ${qrData.amountFormatted || (qrData.amountVND ? qrData.amountVND.toLocaleString() + "₫" : "N/A")}
</p>
        <p style="margin: 10px 0;"><strong>${this.getPlanTypeTranslation()}:</strong> ${this.getCurrentPlanTypeDisplay()}</p>
        <p style="margin: 10px 0; font-size: 14px; color: #666;">(${
          this.translations.momo_payment || "MoMo payment"
        }: ${qrData.amountFormatted}₫)</p>
        <p style="margin: 10px 0;"><strong>${
          this.translations.phone || "Phone:"
        }</strong> ${qrData.phoneNumber}</p>
        <p style="margin: 10px 0;"><strong>${
          this.translations.account || "Account:"
        }</strong> ${qrData.accountName}</p>
        <p style="margin: 10px 0;"><strong>${
          this.translations.reference || "Reference:"
        }</strong> ${qrData.orderId}</p>
        
        <p style="margin: 15px 0 0 0; white-space: pre-line; color: #555;">
          ${
            this.translations.scan_qr_instructions ||
            this.getTranslatedQRInstructions()
          }
        </p>
      </div>

      <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #ffc107;">
        <p style="margin: 0; color: #856404;">
          <strong>${this.translations.note || "Note:"}</strong> 
          ${
            this.translations.payment_note_reference ||
            "Please include the reference number in your payment."
          }
        </p>
      </div>

      <div style="display: flex; gap: 10px; justify-content: center; margin-top: 20px; flex-wrap: wrap;">
        <button id="check-payment-status" style="
          background: #b1216a; color: white; border: none; padding: 12px 25px;
          border-radius: 25px; font-size: 16px; cursor: pointer; font-weight: bold;
        ">✅ ${
          this.translations.check_status || "Check Payment Status"
        }</button>
        
        <button id="close-qr-modal" style="
          background: #6c757d; color: white; border: none; padding: 12px 25px;
          border-radius: 25px; font-size: 16px; cursor: pointer; font-weight: bold;
        ">${this.translations.close || "Close"}</button>
      </div>

      <div id="payment-status" style="margin-top: 15px; display: none;">
        <!-- Payment status will be shown here -->
      </div>
    </div>
  `;

    document.body.appendChild(modal);

    // Add loading indicator handling
    const qrImage = modal.querySelector('img[alt="MoMo QR Code"]');
    const loadingIndicator = modal.querySelector("#qr-loading");

    if (qrImage && loadingIndicator) {
      qrImage.addEventListener("load", function () {
        loadingIndicator.style.display = "none";
      });
    }

    // Add the event listeners
    document
      .getElementById("check-payment-status")
      .addEventListener("click", () => {
        this.checkQRPaymentStatus(qrData.orderId, modal);
      });

    document.getElementById("close-qr-modal").addEventListener("click", () => {
      document.body.removeChild(modal);
    });

    const intervalId = setInterval(() => {
      this.checkQRPaymentStatus(qrData.orderId, modal, intervalId);
    }, 10000);

    modal.setAttribute("data-interval-id", intervalId);
  }

  getPlanTypeTranslation() {
    const translations = {
      en: "Plan Type",
      vi: "Loại gói",
      zh: "套餐类型",
      es: "Tipo de plan",
      hi: "योजना प्रकार",
      ar: "نوع الخطة",
    };
    return translations[this.currentLang] || "Plan Type";
  }

  getCurrentPlanTypeDisplay() {
    const selectedPlan = JSON.parse(
      localStorage.getItem("selectedPlan") || "{}",
    );
    const planType = selectedPlan.planType || "monthly";
    const lang = this.currentLang;

    const planNames = {
      en: {
        monthly: "Monthly Individual Plan",
        three_months: "3 Months Individual Plan",
        six_months: "6 Months Individual Plan",
        yearly: "Yearly Individual Plan",
      },
      vi: {
        monthly: "Gói Cá Nhân Hàng Tháng",
        three_months: "Gói Cá Nhân 3 Tháng",
        six_months: "Gói Cá Nhân 6 Tháng",
        yearly: "Gói Cá Nhân Hàng Năm",
      },
      zh: {
        monthly: "月度个人套餐",
        three_months: "3个月个人套餐",
        six_months: "6个月个人套餐",
        yearly: "年度个人套餐",
      },
      es: {
        monthly: "Plan Individual Mensual",
        three_months: "Plan Individual de 3 Meses",
        six_months: "Plan Individual de 6 Meses",
        yearly: "Plan Individual Anual",
      },
      hi: {
        monthly: "मासिक व्यक्तिगत योजना",
        three_months: "3 महीने की व्यक्तिगत योजना",
        six_months: "6 महीने की व्यक्तिगत योजना",
        yearly: "वार्षिक व्यक्तिगत योजना",
      },
      ar: {
        monthly: "الخطة الفردية الشهرية",
        three_months: "الخطة الفردية لـ 3 أشهر",
        six_months: "الخطة الفردية لـ 6 أشهر",
        yearly: "الخطة الفردية السنوية",
      },
    };

    const plans = planNames[lang] || planNames.en;
    return plans[planType] || plans.monthly;
  }

  // ===== GET TRANSLATED QR INSTRUCTIONS =====
  getTranslatedQRInstructions() {
    // Use the translation key if available, otherwise fallback to switch statement
    return (
      this.translations.scan_qr_instructions ||
      this.getTranslatedQRInstructionsFallback()
    );
  }

  getTranslatedQRInstructionsFallback() {
    switch (this.currentLang) {
      case "vi":
        return "1. Mở ứng dụng MoMo\n2. Quét mã QR hoặc chuyển khoản đến số điện thoại trên\n3. Bao gồm mã tham chiếu trong nội dung chuyển khoản\n4. Nhấn 'Kiểm tra trạng thái' sau khi chuyển khoản";
      case "zh":
        return "1. 打开MoMo应用\n2. 扫描QR码或转账到上方电话号码\n3. 在转账内容中包含参考号\n4. 转账后点击'检查状态'";
      case "es":
        return "1. Abra la aplicación MoMo\n2. Escanee el código QR o transfiera al número de teléfono anterior\n3. Incluya la referencia en el contenido de la transferencia\n4. Haga clic en 'Verificar estado' después de la transferencia";
      case "hi":
        return "1. MoMo ऐप खोलें\n2. QR कोड स्कैन करें या ऊपर दिए गए फोन नंबर पर ट्रांसफर करें\n3. ट्रांसफर सामग्री में संदर्भ संख्या शामिल करें\n4. ट्रांसफर के बाद 'स्थिति जांचें' पर क्लिक करें";
      case "ar":
        return "1. افتح تطبيق MoMo\n2. امسح رمز QR ضوئيًا أو انقل إلى رقم الهاتف أعلاه\n3. قم بتضمين المرجع في محتوى التحويل\n4. انقر فوق 'التحقق من الحالة' بعد التحويل";
      default: // English
        return "1. Open MoMo app\n2. Scan QR code or transfer to the phone number above\n3. Include the reference in the transfer content\n4. Click 'Check Status' after transferring";
    }
  }

  // ===== CHECK QR PAYMENT STATUS =====
  async checkQRPaymentStatus(orderId, modal, intervalId = null) {
    try {
      const statusElement = modal.querySelector("#payment-status");
      statusElement.style.display = "block";
      statusElement.innerHTML = `<p>🔄 ${
        this.translations.payment_status_checking ||
        "Checking payment status..."
      }</p>`;

      const response = await fetch(
        "https://us-central1-connectionsfinder-app.cloudfunctions.net/checkQRPayment",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ orderId }),
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        if (result.status === "completed") {
          statusElement.innerHTML = `
          <div style="background: #d4edda; color: #155724; padding: 15px; border-radius: 8px; border-left: 4px solid #28a745;">
            <h4 style="margin: 0 0 10px 0;">✅ ${
              this.translations.payment_status_completed || "Payment Completed!"
            }</h4>
            <p style="margin: 0;">${
              this.translations.payment_activated ||
              "Your subscription has been activated. Thank you!"
            }</p>
          </div>
        `;

          // ADD THIS: Handle bulk subscription passcodes
          const selectedPlan = JSON.parse(
            localStorage.getItem("selectedPlan") || "{}",
          );
          if (selectedPlan.isBulk && window.premiumManager) {
            window.premiumManager.handleBulkPaymentSuccess(selectedPlan);
          }

          if (intervalId) clearInterval(intervalId);
          setTimeout(() => {
            if (document.body.contains(modal)) {
              document.body.removeChild(modal);
            }
          }, 3000);
        } else {
          statusElement.innerHTML = `
          <div style="background: #fff3cd; color: #856404; padding: 15px; border-radius: 8px; border-left: 4px solid #ffc107;">
            <p style="margin: 0;">⏳ ${
              this.translations.payment_status_pending ||
              "Payment still pending. Please complete the transfer."
            }</p>
          </div>
        `;
        }
      } else {
        statusElement.innerHTML = `
        <div style="background: #f8d7da; color: #721c24; padding: 15px; border-radius: 8px; border-left: 4px solid #dc3545;">
          <p style="margin: 0;">❌ ${this.translations.error || "Error:"} ${
            result.error
          }</p>
        </div>
      `;
      }
    } catch (error) {
      console.error("❌ Check payment status error:", error);
      const statusElement = modal.querySelector("#payment-status");
      statusElement.innerHTML = `
      <div style="background: #f8d7da; color: #721c24; padding: 15px; border-radius: 8px; border-left: 4px solid #dc3545;">
        <p style="margin: 0;">❌ ${this.translations.error || "Error:"} ${
          error.message
        }</p>
      </div>
    `;
    }
  }

  // ===== CURRENCY AND PRICING METHODS =====
  getCurrencyForLanguage() {
    const rates = this.getCurrencyRates();
    let currency;

    switch (this.currentLang) {
      case "vi":
        currency = "VND";
        break;
      case "zh":
        currency = "CNY";
        break;
      case "hi":
        currency = "INR";
        break;
      case "ar":
        currency = "AED";
        break;
      case "es":
        currency = "EUR";
        break;
      default:
        currency = "USD";
    }

    return {
      code: currency,
      symbol: rates[currency]?.symbol || "$",
      rate: rates[currency]?.rate || 1,
    };
  }

  getCurrencyRates() {
    return {
      USD: { symbol: "$", rate: 1, name: "USD" },
      VND: { symbol: "₫", rate: 25000, name: "VND" },
      EUR: { symbol: "€", rate: 0.92, name: "EUR" },
      GBP: { symbol: "£", rate: 0.79, name: "GBP" },
      CNY: { symbol: "¥", rate: 7.18, name: "CNY" },
      INR: { symbol: "₹", rate: 83, name: "INR" },
      AED: { symbol: "د.إ", rate: 3.67, name: "AED" },
    };
  }

  convertPrice(amountUSD, targetCurrency) {
    const rates = this.getCurrencyRates();
    const rate = rates[targetCurrency]?.rate || 1;
    const symbol = rates[targetCurrency]?.symbol || "$";

    let amount;
    if (targetCurrency === "VND") {
      amount = Math.round((amountUSD * rate) / 1000) * 1000;
    } else {
      amount = Math.round(amountUSD * rate * 100) / 100;
    }

    return {
      amount: amount,
      symbol: symbol,
      currency: targetCurrency,
    };
  }

  updatePricingDisplay() {
    this.updateBulkCalculator();
  }

  showPaymentModal(title, content) {
    const modal = document.createElement("div");
    modal.style.cssText = `
    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
    background: rgba(0,0,0,0.8); z-index: 10000; 
    display: flex; justify-content: center; 
    align-items: flex-start; /* Align to top */
    font-family: Arial, sans-serif;
    padding: 20px 0; /* Padding for small screens */
    overflow-y: auto; /* Allow scrolling the entire modal */
  `;

    // Calculate dynamic height based on screen size
    const screenHeight = window.innerHeight;
    const modalHeight = Math.min(600, screenHeight - 100); // Max 600px or screen height - 100px

    modal.innerHTML = `
    <div style="
      background: white; border-radius: 15px;
      width: 500px; max-width: 95%; 
      height: ${modalHeight}px; /* DYNAMIC HEIGHT */
      box-shadow: 0 10px 30px rgba(0,0,0,0.3);
      display: flex; flex-direction: column;
      margin: auto; /* Center vertically */
    ">
      <!-- Header -->
      <div style="flex-shrink: 0; padding: 15px 20px; border-bottom: 1px solid #eee;">
        <h2 style="color: #b1216a; margin: 0; font-size: 1.3em;">${title}</h2>
      </div>
      
      <!-- Scrollable Content -->
      <div style="flex: 1; overflow-y: auto; padding: 15px 20px;">
        ${content}
      </div>

      <!-- Buttons - ALWAYS VISIBLE -->
      <div style="
        flex-shrink: 0; padding: 15px 20px; 
        border-top: 3px solid #28a745; background: white;
        border-bottom-left-radius: 15px; border-bottom-right-radius: 15px;
      ">
        <button id="copy-payment-instructions" style="
          background: #28a745; color: white; border: none; padding: 12px 15px;
          border-radius: 8px; font-size: 14px; cursor: pointer; font-weight: bold;
          margin-right: 8px; width: 48%; min-height: 44px;
        ">📋 Copy</button>
        
        <button id="close-payment-modal" style="
          background: #dc3545; color: white; border: none; padding: 12px 15px;
          border-radius: 8px; font-size: 14px; cursor: pointer; font-weight: bold;
          width: 48%; min-height: 44px;
        ">❌ Close</button>
      </div>
    </div>
  `;

    document.body.appendChild(modal);

    document
      .getElementById("copy-payment-instructions")
      .addEventListener("click", () => {
        navigator.clipboard
          .writeText(instructions)
          .then(() =>
            alert(
              this.translations.copied || "Instructions copied to clipboard!",
            ),
          )
          .catch(() =>
            alert(
              this.translations.copy_failed ||
                "Please copy the instructions manually.",
            ),
          );
      });

    document
      .getElementById("close-payment-modal")
      .addEventListener("click", () => {
        document.body.removeChild(modal);
      });

    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        document.body.removeChild(modal);
      }
    });

    // AUTO-SCROLL TO BOTTOM TO SEE BUTTONS
    setTimeout(() => {
      modal.scrollTop = modal.scrollHeight;
    }, 100);

    // Add this at the end of showPaymentModal
    setTimeout(() => {
      const modalRect = modal.getBoundingClientRect();
      const buttonsRect = document
        .getElementById("copy-payment-instructions")
        .getBoundingClientRect();
      console.log("Modal position:", modalRect);
      console.log("Buttons position:", buttonsRect);
      console.log("Window height:", window.innerHeight);
    }, 200);
  }

  closePaymentModal() {
    const modal = document.getElementById("paymentModal");
    if (modal) modal.style.display = "none";
  }

  copyPaymentInstructions() {
    const modalBody = document.getElementById("modalBody");
    if (modalBody) {
      navigator.clipboard
        .writeText(modalBody.textContent)
        .then(() => alert("Copied to clipboard!"))
        .catch((err) => console.error("Copy failed:", err));
    }
  }

  // ADD THESE NEW METHODS RIGHT AFTER YOUR EXISTING ONES:

  async trackPayment(paymentData) {
    try {
      const user = window.fb?.auth?.currentUser;
      if (!user) {
        console.error("No user logged in for payment tracking");
        return;
      }

      const paymentRecord = {
        userId: user.uid,
        userEmail: user.email,
        planType: paymentData.planType,
        amountUSD: paymentData.amountUSD,
        currency: paymentData.currency,
        paymentMethod: paymentData.paymentMethod,
        status: "pending", // Start as PENDING
        orderId: paymentData.orderId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const docRef = await window.fb.firestore
        .collection("premium_payments")
        .add(paymentRecord);
      console.log("✅ Payment tracked (PENDING):", docRef.id);

      // 🔧 REMOVE auto-completion for everyone
      // console.log("🔄 Auto-activating subscription for testing...");
      // await this.updatePaymentStatus(docRef.id, "completed");

      // 🔧 Set verification flag (payment is tracked but not completed)
      window.paymentVerified = true;
      localStorage.setItem("paymentVerified", "true");
      localStorage.setItem("paymentMethod", paymentData.paymentMethod);
      localStorage.setItem("paymentTime", new Date().toISOString());
      localStorage.setItem("paymentId", docRef.id);

      console.log(
        "🔄 Payment tracked but NOT completed (waiting for confirmation)",
      );

      return docRef.id;
    } catch (error) {
      console.error("❌ Payment tracking failed:", error);
      // Reset flag on error
      window.paymentVerified = false;
      localStorage.removeItem("paymentVerified");
    }
  }

  // Add this function for manual payment confirmation
  // Add this function to your premiumManager class
  async confirmManualPayment(paymentId) {
    try {
      console.log("✅ Manual payment confirmation triggered for:", paymentId);

      // Close current modal
      this.hidePaymentModal();

      // Get payment method from localStorage
      const paymentMethod = localStorage.getItem("paymentMethod") || "manual";

      // 🔥 SAFE: Get plan without overwriting existing method-specific plans
      const selectedPlanStr = localStorage.getItem("selectedPlan");
      if (selectedPlanStr) {
        if (!localStorage.getItem(`selectedPlan_${paymentMethod}`)) {
          localStorage.setItem(
            `selectedPlan_${paymentMethod}`,
            selectedPlanStr,
          );
          console.log(`✅ Stored plan for ${paymentMethod}`);
        }
      }

      // 🔥 FIX: Check payment verification for ALL payments
      const paymentVerified =
        localStorage.getItem(`paymentVerified_${paymentMethod}`) === "true";

      if (!paymentVerified) {
        console.log(
          `⏳ ${paymentMethod} payment not verified - showing instructions`,
        );
        this.showPaymentInstructions(paymentMethod);
        return false;
      }

      // Set confirmation flag
      localStorage.setItem(`paymentConfirmed_${paymentMethod}`, "true");

      // Update payment status to completed
      const success = await this.updatePaymentStatus(paymentId, "completed");

      if (success) {
        // Get the selected plan (try generic first, then method-specific)
        let planStr =
          localStorage.getItem("selectedPlan") ||
          localStorage.getItem(`selectedPlan_${paymentMethod}`);
        let isBulkPayment = false;
        let selectedPlan = null;

        if (planStr) {
          selectedPlan = JSON.parse(planStr);

          // 🔥 IMPROVED BULK DETECTION
          isBulkPayment =
            selectedPlan.isBulk === true ||
            selectedPlan.isOrganization === true ||
            (selectedPlan.userCount && selectedPlan.userCount > 1) ||
            (selectedPlan.type &&
              (selectedPlan.type.includes("bulk") ||
                selectedPlan.type.includes("Bulk") ||
                selectedPlan.type.includes("organization"))) ||
            (selectedPlan.planType && selectedPlan.planType.includes("bulk")) ||
            false;

          console.log("🔍 Payment type in confirmation:", {
            isBulk: isBulkPayment,
            planType: selectedPlan.type || selectedPlan.planType,
            paymentMethod: paymentMethod,
            userCount: selectedPlan.userCount,
            rawPlan: selectedPlan,
          });
        }

        // Wait a moment
        setTimeout(() => {
          if (isBulkPayment) {
            console.log("📦 Bulk payment - showing passcodes");
            this.showPasscodesAfterPayment(paymentMethod);
          } else {
            console.log("👤 Individual payment - showing success message");
            this.showIndividualSuccessMessage();
          }
        }, 500);

        return true;
      } else {
        alert("Payment confirmation failed. Please try again.");
        localStorage.removeItem(`paymentConfirmed_${paymentMethod}`);
        return false;
      }
    } catch (error) {
      console.error("❌ Manual payment confirmation failed:", error);
      alert("Error confirming payment: " + error.message);
      return false;
    }
  }

  async updatePaymentStatus(paymentDocId, status, additionalData = {}) {
    try {
      console.log(`🔄 Updating payment status: ${paymentDocId} -> ${status}`);

      const paymentsRef = window.fb.firestore.collection("premium_payments");
      const paymentDoc = paymentsRef.doc(paymentDocId);

      // First, get the document to check ownership
      const docSnapshot = await paymentDoc.get();

      if (!docSnapshot.exists) {
        console.error("❌ Payment document not found:", paymentDocId);
        return false;
      }

      // Check if user owns this payment (security check)
      const paymentData = docSnapshot.data();
      const currentUser = window.fb?.auth?.currentUser;

      if (currentUser && paymentData.userId !== currentUser.uid) {
        console.error("❌ User not authorized to update this payment");
        return false;
      }

      // Update the document
      await paymentDoc.update({
        status: status,
        updatedAt: new Date(),
        ...additionalData,
      });

      console.log("✅ Payment status updated:", paymentDocId, status);

      // Auto-activate subscription if payment completed
      if (status === "completed") {
        await this.activateSubscription(paymentData);
      }

      return true;
    } catch (error) {
      console.error("❌ Payment status update failed:", error);
      return false;
    }
  }

  async activateSubscription(paymentData) {
    try {
      const user = window.fb?.auth?.currentUser;
      if (!user) {
        console.error("No user logged in for subscription activation");
        return null;
      }

      // Calculate expiry date
      const expiryDate = new Date();
      const planDurations = {
        monthly: 30,
        three_months: 90,
        six_months: 180,
        yearly: 365,
        bulk_monthly: 30,
      };

      const durationDays = planDurations[paymentData.planType] || 30;
      expiryDate.setDate(expiryDate.getDate() + durationDays);

      // 1. Create subscription document
      const subscriptionData = {
        userId: user.uid,
        userEmail: user.email,
        planType: paymentData.planType,
        paymentId: paymentData.orderId || paymentData.paymentDocId,
        status: "active",
        activatedAt: new Date().toISOString(),
        expiresAt: expiryDate.toISOString(),
        features: {
          avatarUpload: true,
          imageUpload: true,
          maxImagesPerReport: 5,
          unlimitedReports: true,
        },
        isBulk: paymentData.isBulk || paymentData.isOrganization || false,
        userCount: paymentData.userCount || 1,
        createdAt: new Date().toISOString(),
      };

      console.log("📝 Creating subscription:", subscriptionData);

      // Create subscription (if premium_subscriptions collection exists)
      let subRef = null;
      try {
        subRef = await window.fb.firestore
          .collection("premium_subscriptions")
          .add(subscriptionData);
        console.log("✅ Subscription created:", subRef.id);
      } catch (subscriptionError) {
        console.warn(
          "⚠️ Could not create premium_subscriptions document:",
          subscriptionError,
        );
        // Continue anyway - we'll still update user document
      }

      // 2. Update/Create user document
      const userUpdateData = {
        hasActiveSubscription: true,
        subscriptionExpiry: expiryDate.toISOString(),
        subscriptionType: paymentData.planType,
        maxImagesPerReport: 5,
        lastUpdated: new Date().toISOString(),
        userType:
          paymentData.isBulk || paymentData.isOrganization
            ? "organization"
            : "individual",
        isOrganization:
          paymentData.isBulk || paymentData.isOrganization || false,
        // ✅ ADD THESE CRITICAL PREMIUM FIELDS
        isPremium: true,
        premium: true,
        status: "active",
      };

      // Add subscription ID if created
      if (subRef) {
        userUpdateData.subscriptionId = subRef.id;
      }

      // Add bulk-specific fields
      if (paymentData.isBulk || paymentData.isOrganization) {
        userUpdateData.sponsoredUserCount = paymentData.userCount || 1;
        userUpdateData.organizationId = user.uid;
      }

      console.log("📝 Setting user document:", user.uid, userUpdateData);

      // USE .set() WITH { merge: true } - This creates or updates the document
      await window.fb.firestore
        .collection("users")
        .doc(user.uid)
        .set(userUpdateData, { merge: true });

      console.log("✅ User document updated/created");

      // 3. Update localStorage for main page
      localStorage.setItem(`premium_${user.uid}`, "true");
      localStorage.setItem(
        `premium_expiry_${user.uid}`,
        expiryDate.toISOString(),
      );
      localStorage.setItem(`premium_plan_${user.uid}`, paymentData.planType);

      // 🔧 REMOVED: Passcode generation from here
      // Passcodes will be generated separately after payment confirmation
      console.log("✅ Subscription activated (NO PASSCODES GENERATED HERE)");

      return subRef ? subRef.id : "local-activation";
    } catch (error) {
      console.error("❌ Subscription activation failed:", error);
      console.error("Error code:", error.code);
      console.error("Error message:", error.message);
      throw error;
    }
  }

  async checkSubscriptionStatus() {
    try {
      const user = window.fb?.auth?.currentUser;
      if (!user) return null;
      const userDoc = await window.fb.firestore
        .collection("users")
        .doc(user.uid)
        .get();
      return userDoc.exists ? userDoc.data() : null;
    } catch (error) {
      console.error("❌ Subscription check failed:", error);
      return null;
    }
  }

  async checkAndUpdateExpiredSubscriptions() {
    try {
      const user = window.fb?.auth?.currentUser;
      if (!user) return;

      const userData = await this.checkSubscriptionStatus();
      if (userData && userData.subscriptionExpiry) {
        const expiryDate = userData.subscriptionExpiry.toDate();
        const now = new Date();

        if (now > expiryDate) {
          // Subscription expired - downgrade user
          await window.fb.firestore.collection("users").doc(user.uid).set(
            {
              hasActiveSubscription: false,
              subscriptionType: "expired",
              maxImagesPerReport: 0,
              lastUpdated: new Date(),
            },
            { merge: true },
          );

          console.log("⚠️ Subscription expired - user downgraded");
        }
      }
    } catch (error) {
      console.error("❌ Expiry check failed:", error);
    }
  }

  // ▼▼▼ ADD THESE NEW METHODS RIGHT BEFORE THE CLOSING BRACE ▼▼▼

  // ▼▼▼ ADD THESE MISSING FUNCTIONS RIGHT HERE ▼▼▼

  showPaymentOptions(selectedPlan) {
    // 🔧 Optional: Reset flags here too for safety
    this.resetPaymentFlags();
    // RESET PROCESSING FLAGS - ADD THIS
    this.isPayPalProcessing = false;
    this.isMomoProcessing = false;
    this.isBankProcessing = false;
    console.log("💳 Showing payment options for:", selectedPlan);

    const paymentMethods = [
      {
        id: "bank_transfer",
        name: this.translations.bank_transfer || "Bank Transfer",
        icon: "🏦",
      },
      {
        id: "paypal",
        name: this.translations.paypal || "PayPal",
        icon: "💳",
      },
      {
        id: "momo",
        name: this.translations.momo || "MoMo",
        icon: "📱",
      },
    ];

    // Translate plan type dynamically
    // Translate plan type dynamically with user count
    const getTranslatedPlan = (planType, userCount) => {
      const planMap = {
        bulk_monthly:
          this.translations.bulk_monthly_plan || "Monthly Bulk Plan",
        bulk_three_months:
          this.translations.bulk_three_months_plan || "3-Month Bulk Plan",
        bulk_six_months:
          this.translations.bulk_six_months_plan || "6-Month Bulk Plan",
        bulk_yearly: this.translations.bulk_yearly_plan || "Yearly Bulk Plan",
      };

      const basePlan = planType.replace(/_\d+users$/, "");
      const translated = planMap[basePlan] || planType;
      return `${translated} (${userCount} ${
        this.translations.users || "users"
      })`;
    };

    const translatedPlan = selectedPlan.isBulk
      ? getTranslatedPlan(selectedPlan.type, selectedPlan.userCount)
      : this.getTranslatedPlanName(selectedPlan.type);

    const orgPlanText =
      this.translations.organization_bulk_plan || "Organization Bulk Plan";

    const paymentHTML = `
        <div class="payment-options">
            <h3>${
              this.translations.choose_payment || "Choose Payment Method"
            }</h3>
            <div class="plan-summary">
                <p><strong>${
                  this.translations.plan || "Plan"
                }:</strong> ${translatedPlan}</p>
                <p><strong>${this.translations.users || "Users"}:</strong> ${
                  selectedPlan.userCount
                }</p>
                <p><strong>${this.translations.amount || "Amount"}:</strong> $${
                  selectedPlan.amountUSD
                } USD</p>
                ${selectedPlan.isBulk ? `<p><em>${orgPlanText}</em></p>` : ""}
            </div>
            <div class="payment-methods">
                ${paymentMethods
                  .map(
                    (method) => `
                    <button class="payment-method-btn" data-method="${method.id}">
                        <span class="payment-icon">${method.icon}</span>
                        <span class="payment-name">${method.name}</span>
                    </button>
                `,
                  )
                  .join("")}
            </div>
        </div>
    `;

    this.showPaymentModal(
      this.translations.choose_payment || "Choose Payment Method",
      paymentHTML,
    );

    // Add event listeners to the buttons
    setTimeout(() => {
      paymentMethods.forEach((method) => {
        const btn = document.querySelector(`[data-method="${method.id}"]`);
        if (btn) {
          // REMOVE EXISTING LISTENERS FIRST
          const newBtn = btn.cloneNode(true);
          btn.parentNode.replaceChild(newBtn, btn);

          // ADD NEW LISTENER
          newBtn.addEventListener("click", () => {
            console.log(`🎯 ${method.id} button clicked`);
            this.handlePaymentMethod(method.id, selectedPlan);
          });
        }
      });
    }, 100);
  }

  handlePaymentMethod(methodId, selectedPlan) {
    console.log(
      `🔄 Handling payment method: ${methodId} for plan:`,
      selectedPlan,
    );

    // 🔥 SAFETY: Block owner payments FIRST
    const user = window.fb?.auth?.currentUser;
    if (user && this.isAppOwner(user.email)) {
      console.error("🚨 BLOCKED: Owner attempted payment!");

      // Show friendly message
      const t = this.translations;
      alert(
        t.ownerAccessMessage ||
          "You are the app owner. Please use complimentary access from the bulk subscription page.",
      );

      // Optionally redirect to bulk page
      // window.location.href = "#bulkSubscriptionSection";

      return; // STOP payment processing
    }

    // Store the plan in localStorage so handleBankTransfer can use it
    if (selectedPlan) {
      localStorage.setItem("selectedPlan", JSON.stringify(selectedPlan));
    }

    // Store the plan in localStorage so handleBankTransfer can use it
    if (selectedPlan) {
      localStorage.setItem("selectedPlan", JSON.stringify(selectedPlan));
    }

    switch (methodId) {
      case "paypal":
        this.handlePayPalPayment();
        break;
      case "momo":
        this.handleMoMoPayment();
        break;
      case "bank_transfer":
        this.handleBankTransfer(); // It reads from localStorage
        break;
      default:
        console.error("Unknown payment method:", methodId);
    }
  }

  hidePaymentModal() {
    const modal = document.getElementById("paymentModal");
    if (modal) {
      modal.style.display = "none";
    }
  }

  // ▲▲▲ END OF ADDED FUNCTIONS ▲▲▲

  async handleBulkPayment(selectedPlan) {
    try {
      console.log("💰 Handling bulk payment with plan:", selectedPlan);

      const user = window.fb?.auth?.currentUser;
      const orderId = `bulk_${Date.now()}_${user.uid.slice(-8)}`;

      // ⚠️ FIX HERE: Use amountUSD instead of price
      // Calculate VND price for display
      const usdAmount = selectedPlan.amountUSD || 0;
      const vndAmount = Math.round(usdAmount * 23000);

      // Create a complete plan object for display
      const displayPlan = {
        type: selectedPlan.type,
        price: usdAmount, // Now set price equal to amountUSD
        amountUSD: usdAmount,
        vndPrice: vndAmount,
        currency: selectedPlan.currency || "USD",
        userCount: selectedPlan.userCount || 1,
        planType: selectedPlan.planType || "monthly",
        isBulk: true,
        isOrganization: selectedPlan.isOrganization || true,
      };

      console.log("📊 Display plan for bank transfer:", displayPlan);

      // Track bulk payment
      const paymentId = await this.trackPayment({
        planType: displayPlan.type,
        amountUSD: displayPlan.amountUSD,
        currency: displayPlan.currency,
        paymentMethod: "bank_transfer",
        orderId: orderId,
        isOrganization: true,
        userCount: displayPlan.userCount,
      });

      localStorage.setItem("currentPaymentId", paymentId);

      // Show organization payment instructions with the fixed plan object
      this.showBulkPaymentInstructions(displayPlan, orderId);
    } catch (error) {
      console.error("❌ Bulk payment error:", error);
      this.hidePaymentLoading();
      alert("Payment setup failed. Please try again.");
    }
  }

  // ▼▼▼ ADD THESE MISSING FUNCTIONS RIGHT HERE ▼▼▼

  calculateBulkPrice(userCount, planType = "monthly") {
    console.log(
      "🧮 Calculating bulk price for:",
      userCount,
      "users, plan:",
      planType,
    );

    const basePrices = {
      monthly: 4.99,
      three_months: 13.47,
      six_months: 25.47,
      yearly: 49.99,
    };

    const basePrice = basePrices[planType] || basePrices.monthly;
    const baseTotal = basePrice * userCount;

    // Apply discounts
    let discount = 0;
    if (userCount >= 10 && userCount < 50) {
      discount = 0.15; // 15%
    } else if (userCount >= 50) {
      discount = 0.25; // 25%
    } else if (userCount >= 5) {
      discount = 0.1; // 10%
    } else if (userCount >= 3) {
      discount = 0.05; // 5%
    }

    const discountedTotal = baseTotal * (1 - discount);
    const finalPrice = Math.round(discountedTotal * 100) / 100;

    console.log("🧮 Bulk price calculation:", {
      basePrice,
      userCount,
      baseTotal,
      discount: `${discount * 100}%`,
      finalPrice,
    });

    return finalPrice;
  }

  showBulkPaymentInstructions(selectedPlan, orderId) {
    console.log("🔍 DEBUG: Function called with:", {
      selectedPlan,
      orderId,
      amountUSD: selectedPlan?.amountUSD,
      price: selectedPlan?.price,
    });
    console.log("💰 Bank Transfer - Firebase Independent Version");

    // Get amount - don't depend on Firebase
    const amountUSD = selectedPlan.amountUSD || selectedPlan.price || 0;

    // Simple currency conversion without Firebase
    const getDisplayCurrency = () => {
      const lang = this.currentLang || "en";
      const currencies = {
        vi: { symbol: "₫", rate: 23000, code: "VND" },
        zh: { symbol: "¥", rate: 7.2, code: "CNY" },
        es: { symbol: "€", rate: 0.92, code: "EUR" },
        hi: { symbol: "₹", rate: 83, code: "INR" },
        ar: { symbol: "د.إ", rate: 3.67, code: "AED" },
        en: { symbol: "$", rate: 1, code: "USD" },
      };
      return currencies[lang] || currencies["en"];
    };

    const currency = getDisplayCurrency();
    const localAmount = amountUSD * currency.rate;

    // Format amounts
    const formatAmount = (amt) => {
      if (currency.code === "VND") {
        return Math.round(amt).toLocaleString();
      }
      return amt.toFixed(2);
    };

    // Create display amounts
    const displayAmount = {
      symbol: currency.symbol,
      amount: formatAmount(localAmount),
      currency: currency.code,
    };

    // VND for reference
    const vndAmount = Math.round(amountUSD * 23000).toLocaleString();

    // Get plan name (safe method)
    let planName = selectedPlan.type;
    try {
      if (
        this.getTranslatedPlanName &&
        typeof this.getTranslatedPlanName === "function"
      ) {
        planName = this.getTranslatedPlanName(selectedPlan.type);
      }
    } catch (e) {
      console.warn("Plan translation failed, using default:", e);
    }

    // SIMPLE ENGLISH VERSION FOR NOW - We'll add translations after it works
    const instructions = `
<div style="max-height: 300px; overflow-y: auto; padding-right: 10px;">
    <strong>ORGANIZATION BANK TRANSFER PAYMENT</strong>

    <div style="margin: 15px 0; padding: 15px; background: #f8f9fa; border-radius: 10px;">
        <strong>🏦 BANK INFORMATION</strong><br>
        <strong>Bank:</strong> Vietcombank<br>
        <strong>Account Number:</strong> 1041095817<br>
        <strong>Account Holder:</strong> HUYNH DUC NGUYEN
    </div>

    <div style="margin: 15px 0; padding: 15px; background: #f8f9fa; border-radius: 10px;">
        <strong>💰 TRANSFER INFORMATION</strong><br>
        <strong>Amount (Local):</strong> ${displayAmount.symbol}${displayAmount.amount} ${displayAmount.currency}<br>
        <strong>Amount (USD):</strong> $${amountUSD.toFixed(2)} USD<br>
        <strong>Amount (VND):</strong> ₫${vndAmount} VND<br>
        <strong>Plan:</strong> ${planName}<br>
        <strong>Users:</strong> ${selectedPlan.userCount}<br>
        <strong>Order ID:</strong> ${orderId}
    </div>

    <div style="margin: 15px 0; padding: 15px; background: #e8f4fd; border-radius: 10px;">
        <strong>📋 INSTRUCTIONS</strong><br>
        <strong>1.</strong> Transfer the exact amount<br>
        <strong>2.</strong> <strong style="color: #e74c3c;">IMPORTANT:</strong> Include transfer note:<br>
        &nbsp;&nbsp;&nbsp;<code>"CONNECTIONS ${orderId}"</code><br>
        <strong>3.</strong> Keep the transfer receipt
    </div>

    <div style="margin: 15px 0; padding: 15px; background: #e8f5e8; border-radius: 10px;">
        <strong>✅ AFTER TRANSFER</strong><br>
        • Take screenshot of confirmation<br>
        • We'll activate organization account and provide sponsor codes within 24 hours
    </div>
</div>`;

    this.showPaymentModal("Bank Transfer Payment", instructions);
  }

  // ▼▼▼ ADD THESE MODAL FUNCTIONS ▼▼▼

  showPaymentModal(title, content) {
    console.log("🔄 Showing payment modal with title:", title);

    // Create or get modal element
    let modal = document.getElementById("paymentModal");

    if (!modal) {
      console.log("📦 Creating new payment modal");
      modal = document.createElement("div");
      modal.id = "paymentModal";
      modal.className = "modal";
      document.body.appendChild(modal);
    }

    // ALWAYS recreate the modal content to ensure elements exist
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2 id="paymentModalTitle">${title}</h2>
                <span class="close-modal">&times;</span>
            </div>
            <div class="modal-body" id="paymentModalBody">
                ${content}
            </div>
            <div class="modal-footer">
                <button id="copyInstructionsBtn" class="btn-secondary">${
                  this.translations.copy_instructions || "Copy Instructions"
                }</button>
                <button id="closeModalBtn" class="btn-primary">${
                  this.translations.close || "Close"
                }</button>
            </div>
        </div>
    `;

    // Show modal
    modal.style.display = "block";
    console.log("✅ Modal created and displayed");

    // Add event listeners after a short delay to ensure DOM is ready
    setTimeout(() => {
      this.setupModalEvents();
    }, 50);
  }

  setupModalEvents() {
    const modal = document.getElementById("paymentModal");
    const closeBtn = document.querySelector(".close-modal");
    const closeModalBtn = document.getElementById("closeModalBtn");
    const copyBtn = document.getElementById("copyInstructionsBtn");
    const paymentBtns = document.querySelectorAll(".payment-method-btn");

    // Close modal when clicking X
    if (closeBtn) {
      closeBtn.onclick = () => this.hidePaymentModal();
    }

    // Close modal when clicking Close button
    if (closeModalBtn) {
      closeModalBtn.onclick = () => this.hidePaymentModal();
    }

    // Copy instructions when clicking Copy button
    if (copyBtn) {
      copyBtn.onclick = () => this.copyInstructions();
    }

    // Handle payment method buttons
    paymentBtns.forEach((btn) => {
      btn.onclick = () => {
        const methodId = btn.getAttribute("data-method");
        const selectedPlan = JSON.parse(
          localStorage.getItem("selectedPlan") || "{}",
        );
        this.handlePaymentMethod(methodId, selectedPlan);
      };
    });

    // Close modal when clicking outside
    if (modal) {
      modal.onclick = (event) => {
        if (event.target === modal) {
          this.hidePaymentModal();
        }
      };
    }

    console.log("✅ Modal events setup complete");
  }

  hidePaymentModal() {
    const modal = document.getElementById("paymentModal");
    if (modal) {
      modal.style.display = "none";
      // Clean up event listeners to prevent duplicates
      this.cleanupModalEvents();
    }
  }

  cleanupModalEvents() {
    const modal = document.getElementById("paymentModal");
    if (modal) {
      modal.onclick = null;
    }
  }

  copyInstructions() {
    const modalBody = document.getElementById("paymentModalBody");
    if (modalBody) {
      const textToCopy = modalBody.innerText || modalBody.textContent;

      navigator.clipboard
        .writeText(textToCopy)
        .then(() => {
          const copyBtn = document.getElementById("copyInstructionsBtn");
          const originalText = copyBtn.textContent;

          // Translated "Copied" messages
          const copiedTranslations = {
            vi: "Đã sao chép!",
            zh: "已复制!",
            es: "¡Copiado!",
            hi: "कॉपी किया गया!",
            ar: "تم النسخ!",
            en: "Copied!",
          };

          copyBtn.textContent =
            copiedTranslations[this.currentLang] || copiedTranslations.en;
          copyBtn.style.background = "#28a745";

          setTimeout(() => {
            copyBtn.textContent = originalText;
            copyBtn.style.background = "";
          }, 2000);

          console.log("✅ Instructions copied to clipboard");
        })
        .catch((err) => {
          console.error("❌ Failed to copy: ", err);
          alert(
            "Failed to copy instructions. Please select and copy manually.",
          );
        });
    }
  }

  // ▲▲▲ END OF MODAL FUNCTIONS ▲▲▲
  async handleMoMoPayment() {
    if (this.isMomoProcessing) {
      console.log("⚠️ MoMo already processing, skipping duplicate call");
      return;
    }
    this.isMomoProcessing = true;
    try {
      console.log("🔄 Starting MoMo payment process...");

      const selectedPlanStr = localStorage.getItem("selectedPlan");
      if (!selectedPlanStr) {
        alert(
          this.translations.please_select_plan ||
            "Please select a subscription plan first",
        );
        return;
      }

      const selectedPlan = JSON.parse(selectedPlanStr);
      const user = window.fb?.auth?.currentUser;

      if (!user) {
        this.moveToLoginFirst(selectedPlan.type);
        return;
      }

      console.log("🚀 Initiating MoMo payment:", {
        plan: selectedPlan.type,
        amountUSD: selectedPlan.amountUSD,
        isBulk: selectedPlan.isBulk || false,
        userCount: selectedPlan.userCount || 1,
        userId: user.uid,
      });

      // Show loading
      this.showPaymentLoading();

      // Generate order ID
      const orderId = `momo_${Date.now()}_${user.uid.slice(-8)}`;

      // Track the payment
      const paymentId = await this.trackPayment({
        planType: selectedPlan.type,
        amountUSD: selectedPlan.amountUSD,
        currency: "VND",
        paymentMethod: "momo",
        orderId: orderId,
        isOrganization: selectedPlan.isBulk || false,
        userCount: selectedPlan.userCount || 1,
      });

      localStorage.setItem("currentPaymentId", paymentId);

      // Create momoData object
      const momoData = {
        orderId: orderId,
        amountUSD: selectedPlan.amountUSD,
        planType: selectedPlan.type,
        currency: "VND",
        isBulk: selectedPlan.isBulk || false,
        userCount:
          selectedPlan.userCount || selectedPlan.selectedUserCount || 1,
        paymentId: paymentId,
      };

      // Show MoMo payment instructions
      this.displayMoMoPayment(momoData);
    } catch (error) {
      console.error("❌ MoMo payment error:", error);
      this.hidePaymentLoading();
      alert(
        this.translations.payment_failed ||
          "MoMo payment initialization failed: " + error.message,
      );
    } finally {
      this.isMomoProcessing = false;
    }
  }

  async autoCompleteIndividualMoMoPayment(paymentId, selectedPlan) {
    try {
      console.log("👤 Auto-completing individual MoMo payment:", paymentId);

      // Update payment status to completed
      const success = await this.updatePaymentStatus(paymentId, "completed");

      if (success) {
        console.log("✅ Individual MoMo payment auto-completed");

        // Close the payment instructions modal
        this.hidePaymentModal();

        // Show success message
        setTimeout(() => {
          this.showIndividualSuccessMessage();
        }, 1000);

        return true;
      } else {
        console.error("❌ Failed to auto-complete MoMo payment");
        return false;
      }
    } catch (error) {
      console.error("❌ Error auto-completing MoMo payment:", error);
      return false;
    }
  }

  displayMoMoPayment(momoData) {
    this.hidePaymentLoading();

    const momoPhoneNumber = "+84906756201";
    const momoName = "HUYNH DUC NGUYEN";

    // Get actual user count
    const userCount = momoData.userCount || (momoData.isBulk ? 10 : 1);
    const amountVND = this.convertToVND(momoData.amountUSD);

    const qrImage = `
        <img src="./images/momo-qr-code.jpg" alt="MoMo QR Code" 
             style="width: 200px; height: 200px; display: block; margin: 10px auto; 
                    border: 2px solid #007bff; border-radius: 10px; object-fit: cover;">
    `;

    // COMMON TEMPLATE FOR ALL LANGUAGES
    // Each language just provides text strings, layout stays the same

    const templates = {
      en: {
        title: "MOMO PAYMENT OPTIONS",
        option1: "OPTION 1: SCAN QR CODE",
        step1: "Open MoMo app",
        step2: 'Select "Scan QR Code"',
        step3: "Scan the QR code above",
        step4:
          this.translations.enter_order_info ||
          "Enter the order information below",
        option2: "OPTION 2: MANUAL TRANSFER",
        step5: "Open MoMo app",
        step6: 'Select "Transfer Money"',
        step7: "Transfer",
        step8: "to",
        phone: "Phone",
        name: "Name",
        important: "IMPORTANT",
        include_ref: "Include reference",
        order_info: "ORDER INFORMATION",
        order_id: "Order ID",
        plan: "Plan",
        users: "Users",
        amount: "Amount",
        after_payment: "AFTER PAYMENT",
        take_screenshot: "Take screenshot of confirmation",
        activate: "We'll activate within 24 hours",
        thanks: "Thank you for supporting during our beta phase!",
      },
      vi: {
        title: "LỰA CHỌN THANH TOÁN MOMO",
        option1: "CÁCH 1: QUÉT MÃ QR",
        step1: "Mở ứng dụng MoMo",
        step2: 'Chọn "Quét mã"',
        step3: "Quét mã QR bên trên",
        step4:
          this.translations.enter_order_info ||
          "Nhập thông tin đơn hàng bên dưới",
        option2: "CÁCH 2: CHUYỂN KHOẢN THỦ CÔNG",
        step5: "Mở ứng dụng MoMo",
        step6: 'Chọn "Chuyển tiền"',
        step7: "Chuyển",
        step8: "đến",
        phone: "Số điện thoại",
        name: "Tên",
        important: "QUAN TRỌNG",
        include_ref: "Ghi nội dung",
        order_info: "THÔNG TIN ĐƠN HÀNG",
        order_id: "Mã đơn hàng",
        plan: "Gói",
        users: "Số người dùng",
        amount: "Số tiền",
        after_payment: "SAU KHI THANH TOÁN",
        take_screenshot: "Chụp ảnh màn hình xác nhận",
        activate: "Chúng tôi sẽ kích hoạt trong vòng 24 giờ",
        thanks: "Cảm ơn bạn đã hỗ trợ trong giai đoạn beta!",
      },
      zh: {
        title: "MOMO 支付选项",
        option1: "选项1：扫描二维码",
        step1: "打开MoMo应用",
        step2: '选择"扫描二维码"',
        step3: "扫描上方二维码",
        step4: this.translations.enter_order_info || "输入下方订单信息",
        option2: "选项2：手动转账",
        step5: "打开MoMo应用",
        step6: '选择"转账"',
        step7: "转账",
        step8: "至",
        phone: "手机号",
        name: "姓名",
        important: "重要",
        include_ref: "包含参考号",
        order_info: "订单信息",
        order_id: "订单号",
        plan: "套餐",
        users: "用户数",
        amount: "金额",
        after_payment: "付款后",
        take_screenshot: "截屏确认页面",
        activate: "我们将在24小时内激活",
        thanks: "感谢您在测试阶段的支持！",
      },
      es: {
        title: "OPCIONES DE PAGO MOMO",
        option1: "OPCIÓN 1: ESCANEAR CÓDIGO QR",
        step1: "Abra la aplicación MoMo",
        step2: 'Seleccione "Escanear código QR"',
        step3: "Escanee el código QR de arriba",
        step4:
          this.translations.enter_order_info ||
          "Ingrese la información del pedido a continuación",
        option2: "OPCIÓN 2: TRANSFERENCIA MANUAL",
        step5: "Abra la aplicación MoMo",
        step6: 'Seleccione "Transferir dinero"',
        step7: "Transfiera",
        step8: "a",
        phone: "Teléfono",
        name: "Nombre",
        important: "IMPORTANTE",
        include_ref: "Incluya referencia",
        order_info: "INFORMACIÓN DEL PEDIDO",
        order_id: "ID del Pedido",
        plan: "Plan",
        users: "Usuarios",
        amount: "Monto",
        after_payment: "DESPUÉS DEL PAGO",
        take_screenshot: "Tome captura de pantalla de confirmación",
        activate: "Activaremos en 24 horas",
        thanks: "¡Gracias por apoyarnos durante nuestra fase beta!",
      },
      hi: {
        title: "MoMo भुगतान विकल्प",
        option1: "विकल्प 1: QR कोड स्कैन करें",
        step1: "MoMo ऐप खोलें",
        step2: '"QR कोड स्कैन करें" चुनें',
        step3: "ऊपर दिए गए QR कोड को स्कैन करें",
        step4:
          this.translations.enter_order_info || "नीचे आदेश जानकारी दर्ज करें",
        option2: "विकल्प 2: मैनुअल ट्रांसफर",
        step5: "MoMo ऐप खोलें",
        step6: '"पैसा ट्रांसफर करें" चुनें',
        step7: "ट्रांसफर",
        step8: "को",
        phone: "फोन",
        name: "नाम",
        important: "महत्वपूर्ण",
        include_ref: "संदर्भ शामिल करें",
        order_info: "आदेश जानकारी",
        order_id: "आदेश आईडी",
        plan: "योजना",
        users: "उपयोगकर्ता",
        amount: "राशि",
        after_payment: "भुगतान के बाद",
        take_screenshot: "पुष्टि का स्क्रीनशॉट लें",
        activate: "हम 24 घंटों में सक्रिय करेंगे",
        thanks: "बीटा चरण के दौरान समर्थन के लिए धन्यवाद!",
      },
      ar: {
        title: "خيارات الدفع عبر MoMo",
        option1: "الخيار 1: مسح رمز الاستجابة السريعة",
        step1: "افتح تطبيق MoMo",
        step2: 'اختر "مسح رمز الاستجابة السريعة"',
        step3: "امسح رمز الاستجابة السريعة أعلاه",
        step4: this.translations.enter_order_info || "أدخل معلومات الطلب أدناه",
        option2: "الخيار 2: التحويل اليدوي",
        step5: "افتح تطبيق MoMo",
        step6: 'اختر "تحويل الأموال"',
        step7: "انقل",
        step8: "إلى",
        phone: "الهاتف",
        name: "الاسم",
        important: "مهم",
        include_ref: "أدرج المرجع",
        order_info: "معلومات الطلب",
        order_id: "معرف الطلب",
        plan: "الخطة",
        users: "المستخدمون",
        amount: "المبلغ",
        after_payment: "بعد الدفع",
        take_screenshot: "التقط لقطة شاشة للتأكيد",
        activate: "سنقوم بالتفعيل خلال 24 ساعة",
        thanks: "شكرًا لدعمك خلال مرحلة التجربة!",
      },
    };

    const t = templates[this.currentLang] || templates.en;

    const instructions = `
<div style="max-height: 400px; overflow-y: auto; padding-right: 10px;">
    <strong>${t.title}</strong>

    <!-- QR PAYMENT SECTION -->
    <div style="margin: 15px 0; padding: 15px; background: #f8f9fa; border-radius: 10px;">
        <strong>🔸 ${t.option1}</strong><br>
        ${qrImage}
        <strong>1.</strong> ${t.step1}<br>
        <strong>2.</strong> ${t.step2}<br>
        <strong>3.</strong> ${t.step3}<br>
        <strong>4.</strong> ${t.step4}
    </div>

    <!-- ORDER INFO - RIGHT BELOW QR (FOR BOTH METHODS) -->
    <div style="margin: 15px 0; padding: 15px; background: #e8f4fd; border-radius: 10px;">
        <strong>📋 ${t.order_info}</strong><br>
        <strong>${t.order_id}:</strong> ${momoData.orderId}<br>
        <strong>${t.plan}:</strong> ${this.getTranslatedPlanName(momoData.planType)}<br>
        ${momoData.isBulk ? `<strong>${t.users}:</strong> ${userCount}<br>` : ""}
        <strong>${t.amount}:</strong> ${amountVND} VND
    </div>

    <!-- MANUAL TRANSFER SECTION -->
    <div style="margin: 15px 0; padding: 15px; background: #f8f9fa; border-radius: 10px;">
        <strong>🔸 ${t.option2}</strong><br>
        <strong>1.</strong> ${t.step5}<br>
        <strong>2.</strong> ${t.step6}<br>
        <strong>3.</strong> ${t.step7} <strong>${amountVND} VND</strong> ${t.step8}:<br>
        &nbsp;&nbsp;&nbsp;<strong>📱 ${t.phone}:</strong> ${momoPhoneNumber}<br>
        &nbsp;&nbsp;&nbsp;<strong>👤 ${t.name}:</strong> ${momoName}<br>
        <strong>4.</strong> <strong style="color: #e74c3c;">${t.important}:</strong> ${t.include_ref}:<br>
        &nbsp;&nbsp;&nbsp;<code>"${momoData.orderId}"</code>
    </div>

    <div style="margin: 15px 0; padding: 15px; background: #e8f5e8; border-radius: 10px;">
        <strong>✅ ${t.after_payment}</strong><br>
        • ${t.take_screenshot}<br>
        • ${t.activate}
    </div>

    <div style="text-align: center; margin-top: 20px; font-style: italic;">
        ${t.thanks}
    </div>
    
<div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
    <p style="color: #666; margin-bottom: 15px;">
        ${
          this.currentLang === "vi"
            ? "Sau khi đã chuyển khoản, vui lòng nhấn:"
            : this.currentLang === "zh"
              ? "完成转账后，请点击："
              : this.currentLang === "es"
                ? "Después de realizar la transferencia, haga clic:"
                : this.currentLang === "hi"
                  ? "ट्रांसफर करने के बाद, कृपया क्लिक करें:"
                  : this.currentLang === "ar"
                    ? "بعد إتمام التحويل، الرجاء النقر:"
                    : "After completing your transfer, please click:"
        }
    </p>
    <button onclick="window.premiumManager.confirmManualPayment('${momoData.paymentId || ""}')"
            style="padding: 12px 30px; background: #4CAF50; color: white; 
                   border: none; border-radius: 5px; font-size: 16px; 
                   font-weight: bold; cursor: pointer;">
        ${
          this.currentLang === "vi"
            ? "✅ Tôi đã chuyển khoản"
            : this.currentLang === "zh"
              ? "✅ 我已转账"
              : this.currentLang === "es"
                ? "✅ He realizado la transferencia"
                : this.currentLang === "hi"
                  ? "✅ मैंने ट्रांसफर कर दिया है"
                  : this.currentLang === "ar"
                    ? "✅ لقد قمت بالتحويل"
                    : "✅ I Have Made the Transfer"
        }
    </button>
</div>
</div>`;

    this.showPaymentModal(
      this.translations.momo_payment_options || "MoMo Payment Options",
      instructions,
    );
  }

  convertToVND(amountUSD) {
    // Simple conversion - you might want to use live rates
    const exchangeRate = 25000; // 1 USD = 25,000 VND
    return Math.round(amountUSD * exchangeRate).toLocaleString();
  }

  // Add these methods to PremiumManager class

  showEmailSuccessMessage(email, passcodeCount, orderDetails) {
    const t =
      this.emailTranslations[this.currentLang] || this.emailTranslations.en;

    this.showModal({
      title: t.emailSuccessTitle,
      content: `
      <div style="text-align: center; padding: 25px;">
        <div style="font-size: 60px; color: #4CAF50; margin-bottom: 20px;">✓</div>
        <h3 style="color: #4CAF50; margin-bottom: 15px;">${t.emailSuccessTitle}</h3>
        <p style="font-size: 16px; margin-bottom: 10px;">${t.emailSuccessMessage}</p>
        <p style="font-weight: bold; font-size: 18px; color: #333; margin: 15px 0; padding: 10px; background: #f0f9ff; border-radius: 5px;">
          ${email}
        </p>
        <p style="margin: 15px 0;">
          <strong>${passcodeCount}</strong> ${this.currentLang === "vi" ? "mã mời" : "passcodes"} ${this.currentLang === "vi" ? "đã được gửi" : "have been sent"}
        </p>
        ${
          orderDetails
            ? `
          <div style="background: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0; text-align: left;">
            <p style="margin: 5px 0;"><strong>${this.currentLang === "vi" ? "Mã đơn hàng" : "Order ID"}:</strong> ${orderDetails.orderId}</p>
            <p style="margin: 5px 0;"><strong>${this.currentLang === "vi" ? "Gói" : "Plan"}:</strong> ${orderDetails.planType}</p>
            <p style="margin: 5px 0;"><strong>${this.currentLang === "vi" ? "Tổng số tiền" : "Total Amount"}:</strong> $${orderDetails.totalAmount || orderDetails.amountUSD}</p>
          </div>
        `
            : ""
        }
        <p style="color: #666; font-size: 14px; margin-top: 20px;">
          <small>${t.emailNote}</small>
        </p>
        <button onclick="document.getElementById('emailSuccessModal').remove()" 
                style="margin-top: 25px; padding: 12px 35px; background: #4CAF50; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 16px;">
          ${t.close}
        </button>
      </div>
    `,
      id: "emailSuccessModal",
    });
  }

  showPasscodesPopup(passcodes, message = null, isError = false) {
    const t =
      this.emailTranslations[this.currentLang] || this.emailTranslations.en;

    const title = isError ? t.emailFailTitle : t.passcodeInstructions;
    const defaultMessage = isError ? t.emailFailMessage : t.saveInstructions;

    const passcodeList = passcodes
      .map(
        (p, i) => `
    <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; margin: 8px 0; background: ${i % 2 === 0 ? "#f9f9f9" : "#fff"}; border: 1px solid #eee; border-radius: 5px;">
      <div>
        <strong style="font-family: monospace; font-size: 16px;">${p.code}</strong>
        <div style="font-size: 12px; color: #666; margin-top: 3px;">
          ${p.planType || "bulk"} • ${t.expires}: ${new Date(
            p.expiresAt,
          ).toLocaleDateString(
            this.currentLang === "vi"
              ? "vi-VN"
              : this.currentLang === "zh"
                ? "zh-CN"
                : this.currentLang === "ar"
                  ? "ar-SA"
                  : this.currentLang === "hi"
                    ? "hi-IN"
                    : this.currentLang === "es"
                      ? "es-ES"
                      : "en-US",
          )}
        </div>
      </div>
      <button onclick="navigator.clipboard.writeText('${p.code}')" 
              style="padding: 6px 12px; background: #2196F3; color: white; border: none; border-radius: 3px; cursor: pointer; font-size: 12px;">
        ${this.currentLang === "vi" ? "Sao chép" : "Copy"}
      </button>
    </div>
  `,
      )
      .join("");

    const copyAllButton =
      passcodes.length > 1
        ? `
    <button onclick="navigator.clipboard.writeText('${passcodes.map((p) => p.code).join("\\n")}')"
            style="margin-bottom: 20px; padding: 10px 20px; background: #2196F3; color: white; border: none; border-radius: 5px; cursor: pointer; width: 100%;">
      📋 ${t.copyAll}
    </button>
  `
        : "";

    this.showModal({
      title: title,
      content: `
      <div style="max-width: 600px; max-height: 70vh; overflow-y: auto;">
        ${message ? `<p style="color: ${isError ? "#d32f2f" : "#666"}; margin-bottom: 20px;">${message}</p>` : `<p>${defaultMessage}</p>`}
        
        ${copyAllButton}
        
        <div style="margin: 20px 0;">
          ${passcodeList}
        </div>
        
        ${isError ? `<p style="color: #d32f2f; font-size: 14px; margin-top: 20px;"><small>${t.emailFailNote}</small></p>` : ""}
        
        <button onclick="this.parentElement.parentElement.parentElement.remove()" 
                style="margin-top: 20px; padding: 12px 30px; background: ${isError ? "#d32f2f" : "#4CAF50"}; color: white; border: none; border-radius: 5px; cursor: pointer; float: right;">
          ${t.close}
        </button>
        <div style="clear: both;"></div>
      </div>
    `,
      id: "passcodesModal",
    });
  }

  // Update the sendPasscodesByEmail to include language
  async sendPasscodesByEmail(passcodes, orderDetails) {
    try {
      const user = window.fb?.auth?.currentUser;
      if (!user || !user.email) {
        throw new Error("User not authenticated or no email");
      }

      console.log("📧 Creating passcodes file for:", user.email);

      const lang = this.currentLang;
      const translations =
        this.emailTranslations[lang] || this.emailTranslations.en;

      // Create file content
      const fileName = `passcodes_${orderDetails.orderId || Date.now()}.txt`;

      const fileContent = `
==========================================
CONNECTIONS APP - BULK PASSCODES
==========================================
Order ID: ${orderDetails.orderId || "N/A"}
Plan: ${orderDetails.planType}
Number of Users: ${passcodes.length}
Total Amount: $${orderDetails.totalAmount || orderDetails.amountUSD}
Purchase Date: ${new Date().toLocaleDateString()}

${translations.passcodeInstructions || "Share these passcodes with your sponsored users:"}

${passcodes
  .map(
    (p, i) =>
      `${i + 1}. ${p.code} | ${orderDetails.planType} | ${translations.expires || "Expires"}: ${new Date(p.expiresAt).toLocaleDateString()}`,
  )
  .join("\n")}

${translations.saveInstructions || "Save these passcodes to share with your sponsored users."}

${translations.passcodesNote || "Note: Each passcode can be used only once."}

==========================================
${translations.regards || "Best regards"},
${translations.team || "The Connections Team"}
==========================================
`;

      // Create downloadable file
      const blob = new Blob([fileContent], { type: "text/plain" });
      const url = URL.createObjectURL(blob);

      // Return data for file download
      return {
        success: true,
        data: {
          message: "Download passcodes file",
          downloadUrl: url,
          fileName: fileName,
          fileContent: fileContent,
          passcodes: passcodes,
          orderDetails: orderDetails,
        },
        email: user.email,
        method: "download",
      };
    } catch (error) {
      console.error("❌ Passcodes creation failed:", error);
      return {
        success: false,
        error: error.message,
        code: "CREATION_FAILED",
      };
    }
  }

  // Add financial report methods at the end of the class
  async getFinancialReport() {
    try {
      const db = window.fb.firestore;
      const user = window.fb?.auth?.currentUser;

      // Security check - only owner can access
      if (!user || user.email !== this.ownerEmail) {
        console.error("❌ Unauthorized access to financial report");
        alert("Access denied. Owner only.");
        return null;
      }

      const report = {
        totalRevenue: 0,
        totalUsers: 0,
        paymentsByMethod: {},
        recentPayments: [],
        issues: [],
        generatedAt: new Date().toISOString(),
      };

      // Check all payment collections
      const collections = [
        "paypalPayments",
        "momoPayments",
        "bankPayments",
        "premium_payments",
      ];

      for (const collection of collections) {
        try {
          const snapshot = await db
            .collection(collection)
            .where("status", "==", "completed")
            .get();

          report.paymentsByMethod[collection] = snapshot.size;

          snapshot.forEach((doc) => {
            const data = doc.data();
            const amount = parseFloat(data.amountUSD) || 0;
            report.totalRevenue += amount;

            // Check for suspicious patterns
            if (amount <= 0) {
              report.issues.push(
                `Zero/negative payment in ${collection}: ${doc.id}`,
              );
            }

            if (amount > 1000) {
              report.issues.push(
                `Large payment detected ($${amount}) in ${collection}: ${doc.id}`,
              );
            }

            report.recentPayments.push({
              id: doc.id,
              method: collection
                .replace("Payments", "")
                .replace("_payments", ""),
              amount: amount,
              date: data.createdAt || data.timestamp,
              userId: data.userId,
              email: data.userEmail || "N/A",
              plan: data.planType || "N/A",
            });
          });
        } catch (err) {
          console.warn(`Could not access ${collection}:`, err.message);
        }
      }

      // Count total users
      const usersSnapshot = await db.collection("users").get();
      report.totalUsers = usersSnapshot.size;

      // Sort recent payments (newest first)
      report.recentPayments.sort((a, b) => new Date(b.date) - new Date(a.date));

      // Get top 20 recent payments
      report.recentPayments = report.recentPayments.slice(0, 20);

      console.log("💰 Financial Report:", report);
      return report;
    } catch (error) {
      console.error("❌ Error generating financial report:", error);
      return null;
    }
  }

  showFinancialDashboard() {
    const user = window.fb?.auth?.currentUser;

    // Security check
    if (!user || user.email !== this.ownerEmail) {
      alert("This feature is only available to the app owner.");
      return;
    }

    this.getFinancialReport().then((report) => {
      if (report) {
        this.showFinancialModal(report);
      }
    });
  }

  showFinancialModal(report) {
    const modalContent = `
      <div style="padding: 20px; max-width: 800px; max-height: 80vh; overflow-y: auto;">
        <h2 style="color: #4CAF50; margin-top: 0;">💰 Financial Dashboard</h2>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px;">
          <div style="background: #e8f5e9; padding: 15px; border-radius: 8px;">
            <h3 style="margin-top: 0; color: #2e7d32;">Total Revenue</h3>
            <p style="font-size: 24px; font-weight: bold; color: #2e7d32;">$${report.totalRevenue.toFixed(2)}</p>
          </div>
          <div style="background: #e3f2fd; padding: 15px; border-radius: 8px;">
            <h3 style="margin-top: 0; color: #1565c0;">Total Users</h3>
            <p style="font-size: 24px; font-weight: bold; color: #1565c0;">${report.totalUsers}</p>
          </div>
        </div>
        
        <h3>Payments by Method</h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px; margin-bottom: 20px;">
          ${Object.entries(report.paymentsByMethod)
            .map(
              ([method, count]) => `
            <div style="background: #f5f5f5; padding: 10px; border-radius: 5px; text-align: center;">
              <div style="font-weight: bold;">${method.replace("Payments", "").replace("_payments", "")}</div>
              <div style="font-size: 18px;">${count}</div>
            </div>
          `,
            )
            .join("")}
        </div>
        
        <h3>Recent Payments (Last 20)</h3>
        <div style="overflow-x: auto;">
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background: #f5f5f5;">
                <th style="padding: 10px; border: 1px solid #ddd; text-align: left;">Date</th>
                <th style="padding: 10px; border: 1px solid #ddd; text-align: left;">Method</th>
                <th style="padding: 10px; border: 1px solid #ddd; text-align: left;">Amount</th>
                <th style="padding: 10px; border: 1px solid #ddd; text-align: left;">Plan</th>
                <th style="padding: 10px; border: 1px solid #ddd; text-align: left;">Email</th>
              </tr>
            </thead>
            <tbody>
              ${report.recentPayments
                .map(
                  (payment) => `
                <tr>
                  <td style="padding: 10px; border: 1px solid #ddd;">${new Date(payment.date).toLocaleDateString()}</td>
                  <td style="padding: 10px; border: 1px solid #ddd;">${payment.method}</td>
                  <td style="padding: 10px; border: 1px solid #ddd;">$${payment.amount.toFixed(2)}</td>
                  <td style="padding: 10px; border: 1px solid #ddd;">${payment.plan}</td>
                  <td style="padding: 10px; border: 1px solid #ddd;">${payment.email}</td>
                </tr>
              `,
                )
                .join("")}
            </tbody>
          </table>
        </div>
        
        ${
          report.issues.length > 0
            ? `
          <h3 style="color: #f44336;">⚠️ Issues Detected (${report.issues.length})</h3>
          <div style="background: #ffebee; padding: 15px; border-radius: 8px; border: 1px solid #f44336;">
            ${report.issues.map((issue) => `<p style="margin: 5px 0;">• ${issue}</p>`).join("")}
          </div>
        `
            : ""
        }
        
        <div style="margin-top: 20px; text-align: center;">
          <button onclick="window.print()" style="padding: 10px 20px; background: #2196F3; color: white; border: none; border-radius: 5px; cursor: pointer; margin-right: 10px;">
            🖨️ Print Report
          </button>
          <button onclick="this.parentElement.parentElement.parentElement.remove()" style="padding: 10px 20px; background: #666; color: white; border: none; border-radius: 5px; cursor: pointer;">
            Close
          </button>
        </div>
        
        <p style="font-size: 12px; color: #999; margin-top: 20px; text-align: center;">
          Generated: ${new Date(report.generatedAt).toLocaleString()}
        </p>
      </div>
    `;

    this.showModal({
      title: "Financial Dashboard - Owner Only",
      content: modalContent,
      id: "financialDashboardModal",
      width: "850px",
    });
  }

  // ============================================
  // CANCELLATION SURVEY - Show to expired users
  // ============================================

  async checkAndShowSurvey() {
    // Safety check for Firebase
    if (!window.fb || !window.fb.auth || !window.fb.auth.currentUser) {
      console.log("Firebase not ready yet, waiting...");
      setTimeout(() => this.checkAndShowSurvey(), 500);
      return;
    }

    const user = window.fb.auth.currentUser;
    if (!user) return;

    try {
      // ✅ CORRECT syntax for YOUR app
      const userDoc = await window.fb.firestore
        .collection("users")
        .doc(user.uid)
        .get();
      const userData = userDoc.data();

      const expiryDate = userData.subscriptionExpiry
        ? new Date(userData.subscriptionExpiry)
        : null;
      const now = new Date();
      const surveyShown = userData.surveyShown || false;

      if (
        expiryDate &&
        expiryDate < now &&
        !surveyShown &&
        !userData.hasActiveSubscription
      ) {
        this.showCancellationSurvey();

        // ✅ CORRECT syntax for update
        await window.fb.firestore.collection("users").doc(user.uid).update({
          surveyShown: true,
        });
      }
    } catch (error) {
      console.error("Error checking survey:", error);
    }
  }

  showCancellationSurvey() {
    const lang = localStorage.getItem("userLanguage") || "en";
    const t = surveyTranslations[lang] || surveyTranslations.en;

    const modal = document.createElement("div");
    modal.style.cssText = `
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
        `;

    modal.innerHTML = `
            <div style="background: white; padding: 25px; border-radius: 12px; max-width: 400px; width: 90%;">
                <h2 style="color: #333; margin-bottom: 15px;">${t.title}</h2>
                <p style="color: #666; margin-bottom: 20px;">${t.subtitle}</p>
                
                <div style="display: flex; flex-direction: column; gap: 12px; margin-bottom: 20px;">
                    <button class="survey-option" data-reason="no_need" style="padding: 12px; background: #f0f0f0; border: none; border-radius: 8px; cursor: pointer; text-align: left;">
                        ${t.options.no_need}
                    </button>
                    <button class="survey-option" data-reason="unsatisfied" style="padding: 12px; background: #f0f0f0; border: none; border-radius: 8px; cursor: pointer; text-align: left;">
                        ${t.options.unsatisfied}
                    </button>
                    <button class="survey-option" data-reason="too_expensive" style="padding: 12px; background: #f0f0f0; border: none; border-radius: 8px; cursor: pointer; text-align: left;">
                        ${t.options.too_expensive}
                    </button>
                    <button class="survey-option" data-reason="other" style="padding: 12px; background: #f0f0f0; border: none; border-radius: 8px; cursor: pointer; text-align: left;">
                        ${t.options.other}
                    </button>
                </div>
                
                <div id="feedback-container" style="display: none; margin-bottom: 20px;">
                    <label style="display: block; margin-bottom: 8px; font-weight: bold;">${t.feedback_label}</label>
                    <textarea id="feedback-text" rows="3" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;" placeholder="${t.feedback_placeholder}"></textarea>
                </div>
                
                <div style="display: flex; gap: 10px; justify-content: flex-end;">
                    <button id="survey-skip" style="padding: 10px 20px; background: #6c757d; color: white; border: none; border-radius: 6px; cursor: pointer;">${t.skip_button}</button>
                    <button id="survey-submit" style="padding: 10px 20px; background: #4267B2; color: white; border: none; border-radius: 6px; cursor: pointer;">${t.submit_button}</button>
                </div>
            </div>
        `;

    document.body.appendChild(modal);

    let selectedReason = null;

    modal.querySelectorAll(".survey-option").forEach((btn) => {
      btn.addEventListener("click", () => {
        selectedReason = btn.dataset.reason;
        modal.querySelectorAll(".survey-option").forEach((b) => {
          b.style.background = "#f0f0f0";
        });
        btn.style.background = "#e0e7ff";

        const feedbackContainer = modal.querySelector("#feedback-container");
        if (selectedReason === "unsatisfied" || selectedReason === "other") {
          feedbackContainer.style.display = "block";
        } else {
          feedbackContainer.style.display = "none";
        }
      });
    });

    modal
      .querySelector("#survey-submit")
      .addEventListener("click", async () => {
        if (!selectedReason) {
          alert(t.select_reason);
          return;
        }

        const feedback = modal.querySelector("#feedback-text")?.value || "";

        try {
          await window.fb.firestore.collection("cancellation_surveys").add({
            userId: window.fb.auth.currentUser.uid,
            email: window.fb.auth.currentUser.email,
            reason: selectedReason,
            feedback: feedback,
            timestamp: new Date(),
          });
          alert(t.thank_you);
          modal.remove();
        } catch (error) {
          console.error("Error saving survey:", error);
          alert(t.thank_you);
          modal.remove();
        }
      });

    modal.querySelector("#survey-skip").addEventListener("click", () => {
      modal.remove();
    });
  }

  // ▲▲▲ END OF ADDED FUNCTIONS ▲▲▲
} // <-- THIS IS THE MISSING CLOSING BRACE FOR THE CLASS

// ============================================
// CREATE INSTANCE AND INITIALIZE
// ============================================
const premiumManager = new PremiumManager();

// Call this when premium page loads
// ✅ CORRECT - calling the method on the premiumManager instance
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    // premiumManager.checkAndShowSurvey();  // 🔴 DISABLED FOR LAUNCH
    console.log("Survey check disabled for launch");
  });
} else {
  // premiumManager.checkAndShowSurvey();  // 🔴 DISABLED FOR LAUNCH
  console.log("Survey check disabled for launch");
}

// ===== GLOBAL FUNCTIONS =====
window.selectPlan = function (planType) {
  window.premiumManager?.handleSubscriptionSelection(planType);
};

window.handlePayPalPayment = function () {
  window.premiumManager?.handlePayPalPayment();
};

window.handleMoMoPayment = function () {
  window.premiumManager?.handleMoMoPayment();
};

window.handleBankTransfer = function () {
  window.premiumManager?.handleBankTransfer();
};

window.calculateOrgPrice = function () {
  window.premiumManager?.calculateOrgPrice();
};

window.closeModal = function () {
  window.premiumManager?.closePaymentModal();
};

window.copyPaymentInstructions = function () {
  window.premiumManager?.copyPaymentInstructions();
};

// ===== INITIALIZATION =====
document.addEventListener("DOMContentLoaded", async () => {
  window.premiumManager = new PremiumManager();

  // Check for expired subscriptions when page loads
  await window.premiumManager.checkAndUpdateExpiredSubscriptions();
});

// Close modal when clicking outside
document.addEventListener("DOMContentLoaded", () => {
  document
    .querySelector(".close")
    ?.addEventListener("click", window.closeModal);
  window.addEventListener("click", (event) => {
    const modal = document.getElementById("paymentModal");
    if (event.target === modal) window.closeModal();
  });
});

// Safe global access to premium manager
window.getPremiumManager = function () {
  if (window.premiumManager) {
    return window.premiumManager;
  } else {
    console.warn("⚠️ Premium manager not available, using fallback");
    return {
      checkUserPremium: async (userId) => {
        console.log("🔄 Using fallback premium check");
        return false;
      },
      createPremiumUserDocument: async (userId, planType) => {
        console.log("🔄 Using fallback document creation");
        return true;
      },
    };
  }
};
// At the very bottom of premium.js, after the class ends

// Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  console.log("📄 DOM ready, initializing PremiumManager...");

  // Make sure PremiumManager is available globally
  if (window.premiumManager) {
    window.premiumManager.loadPayPalScript();
  } else {
    console.log("⏳ Waiting for PremiumManager to be initialized...");
    // Try again after a short delay
    setTimeout(() => {
      if (window.premiumManager) {
        window.premiumManager.loadPayPalScript();
      }
    }, 500);
  }
});
// Create global instance
window.premiumManager = new PremiumManager();

// Load PayPal script when ready
document.addEventListener("DOMContentLoaded", () => {
  if (window.premiumManager) {
    window.premiumManager.loadPayPalScript();
  }
});
