// ============================================
// PREMIUM IAP PAGE - INDEPENDENT
// No dependencies on main app translations
// ============================================

// Independent translations for premium page
const premiumTranslations = {
  en: {
    title: "Connections",
    subtitle: "Your all-in-one community communication hub",
    expiry_notice: "📅 Subscriptions expire after selected period",
    image_limits: "📸 5 images per report limit",
    individual_title: "Individual Subscription Plans",
    individual_subtitle: "Personal plans for individual users",
    monthly: "Monthly",
    three_months: "3 Months",
    six_months: "6 Months",
    yearly: "Yearly",
    subscribe: "Subscribe",
    popular: "Popular",
    save_10: "Save 10%",
    save_20: "Save 20%",
    save_42: "Save 42%",
    feature_avatar: "Personal avatar",
    feature_images: "5 images per report",
    feature_unlimited: "Unlimited reports",
    feature_sharing: "Multi-platform sharing",
    footer_copyright: "All rights reserved",
    back_to_main: "Back to Main Page",
    processing: "Processing...",
    passcode_title: "🎫 Have a Pass Code?",
    passcode_placeholder: "Enter your pass code",
    passcode_redeem: "Redeem",
    org_title: "🏢 For Organizations, Families, Clubs, etc.",
    org_desc: "Sponsor 2 to 1000 users with your logo displayed on their app.",
    org_bulk_users: "Number of sponsored users:",
    org_bulk_period: "Subscription period:",
    org_bulk_monthly: "Monthly",
    org_bulk_3months: "3 Months (Save 10%)",
    org_bulk_6months: "6 Months (Save 20%)",
    org_bulk_yearly: "Yearly (Save 42%)",
    org_price_per_user: "Price per user:",
    org_total: "Total:",
    org_you_save: "You save:",
    org_request_quote: "Request Bulk Quote",
    org_benefit_logo: "✓ Your logo shown to all sponsored users",
    org_benefit_fixed: "✓ Sponsored users cannot change the logo",
    org_benefit_management: "✓ Centralized account management",
    org_benefit_invoice: "✓ Invoice payment (bank transfer)",
    org_benefit_all:
      "✓ Perfect for families, schools, universities, clubs, airports, businesses, organizations, etc.",
    contact_modal_title: "Contact Connections",
    contact_modal_message: "To contact us, please email:",
    contact_modal_email: "support@connectionsfinder.com",
    contact_modal_instruction: "Include your name and inquiry details.",
    contact_modal_response: "We will respond within 24-48 hours.",
    contact_modal_request: "Your Request:",
    contact_modal_copy: "Copy Email",
    contact_modal_close: "Close",
    bulk_request_text: "Bulk Subscription: {count} users ({plan})",
    subscription_alert:
      "Subscription to {plan} plan. This will be implemented with App Store/Google Play IAP.",
    price_per_user_suffix: "/month",
    org_you_save_suffix: "",
    price_suffix_monthly: "/month",
    price_suffix_3months: "/3 months",
    price_suffix_6months: "/6 months",
    price_suffix_yearly: "/year",
  },
  vi: {
    title: "Kết nối",
    subtitle: "Trung tâm giao tiếp cộng đồng đa năng của bạn",
    expiry_notice: "📅 Gói đăng ký hết hạn sau thời gian đã chọn",
    image_limits: "📸 Giới hạn 5 ảnh mỗi báo cáo",
    individual_title: "Gói Đăng Ký Cá Nhân",
    individual_subtitle: "Gói cá nhân cho người dùng",
    monthly: "Hàng tháng",
    three_months: "3 Tháng",
    six_months: "6 Tháng",
    yearly: "Hàng năm",
    subscribe: "Đăng ký",
    popular: "Phổ biến",
    save_10: "Tiết kiệm 10%",
    save_20: "Tiết kiệm 20%",
    save_42: "Tiết kiệm 42%",
    feature_avatar: "Ảnh đại diện cá nhân",
    feature_images: "5 ảnh mỗi báo cáo",
    feature_unlimited: "Báo cáo không giới hạn",
    feature_sharing: "Chia sẻ đa nền tảng",
    footer_copyright: "Đã đăng ký bản quyền",
    back_to_main: "Quay lại trang chính",
    processing: "Đang xử lý...",
    passcode_title: "🎫 Bạn có mã ưu đãi không?",
    passcode_placeholder: "Nhập mã của bạn",
    passcode_redeem: "Đổi mã",
    org_title: "🏢 Dành cho Tổ chức, Gia đình, Câu lạc bộ, v.v.",
    org_desc:
      "Tài trợ từ 2 đến 1000 khách hàng và hiển thị logo của bạn cố định trên ứng dụng của họ.",
    org_bulk_users: "Số lượng người dùng được tài trợ:",
    org_bulk_period: "Thời hạn đăng ký:",
    org_bulk_monthly: "Hàng tháng",
    org_bulk_3months: "3 Tháng (Tiết kiệm 10%)",
    org_bulk_6months: "6 Tháng (Tiết kiệm 20%)",
    org_bulk_yearly: "Hàng năm (Tiết kiệm 42%)",
    org_price_per_user: "Giá mỗi người dùng:",
    org_total: "Tổng cộng:",
    org_you_save: "Bạn tiết kiệm:",
    org_request_quote: "Yêu cầu báo giá số lượng",
    org_benefit_logo:
      "✓ Logo của bạn hiển thị cho tất cả người dùng được tài trợ",
    org_benefit_fixed: "✓ Người dùng được tài trợ không thể thay đổi logo",
    org_benefit_management: "✓ Quản lý tập trung",
    org_benefit_invoice: "✓ Thanh toán qua hóa đơn (chuyển khoản)",
    org_benefit_all:
      "✓ Phù hợp cho gia đình, trường học, trường đại học, câu lạc bộ, sân bay, doanh nghiệp, tổ chức, v.v.",
    contact_modal_title: "Liên hệ Connections",
    contact_modal_message: "Để liên hệ với chúng tôi, vui lòng gửi email:",
    contact_modal_email: "support@connectionsfinder.com",
    contact_modal_instruction:
      "Vui lòng bao gồm tên và chi tiết yêu cầu của bạn.",
    contact_modal_response: "Chúng tôi sẽ phản hồi trong vòng 24-48 giờ.",
    contact_modal_request: "Yêu cầu của bạn:",
    contact_modal_copy: "Sao chép email",
    contact_modal_close: "Đóng",
    bulk_request_text: "Đăng ký số lượng lớn: {count} người dùng ({plan})",
    subscription_alert:
      "Đăng ký gói {plan}. Tính năng này sẽ được thực hiện thông qua App Store/Google Play IAP.",
    price_per_user_suffix: "/tháng",
    org_you_save_suffix: "",
    price_suffix_monthly: "/tháng",
    price_suffix_3months: "/3 tháng",
    price_suffix_6months: "/6 tháng",
    price_suffix_yearly: "/năm",
  },
  zh: {
    title: "联系",
    subtitle: "您的全能社区通讯中心",
    expiry_notice: "📅 订阅将在选定周期后到期",
    image_limits: "📸 每份报告限5张图片",
    individual_title: "个人订阅套餐",
    individual_subtitle: "适用于个人用户的套餐",
    monthly: "月度",
    three_months: "3个月",
    six_months: "6个月",
    yearly: "年度",
    subscribe: "订阅",
    popular: "热门",
    save_10: "节省10%",
    save_20: "节省20%",
    save_42: "节省42%",
    feature_avatar: "个人头像",
    feature_images: "每份报告5张图片",
    feature_unlimited: "无限报告",
    feature_sharing: "多平台分享",
    footer_copyright: "版权所有",
    back_to_main: "返回主页",
    processing: "正在处理...",
    passcode_title: "🎫 有优惠码？",
    passcode_placeholder: "输入您的优惠码",
    passcode_redeem: "兑换",
    org_title: "🏢 适用于组织、家庭、俱乐部等",
    org_desc: "赞助2至1000名用户，您的徽标将显示在他们的应用上。",
    org_bulk_users: "赞助用户数量：",
    org_bulk_period: "订阅期限：",
    org_bulk_monthly: "每月",
    org_bulk_3months: "3个月（节省10%）",
    org_bulk_6months: "6个月（节省20%）",
    org_bulk_yearly: "每年（节省42%）",
    org_price_per_user: "每用户价格：",
    org_total: "总计：",
    org_you_save: "您节省：",
    org_request_quote: "请求批量报价",
    org_benefit_logo: "✓ 您的徽标显示给所有赞助用户",
    org_benefit_fixed: "✓ 赞助用户无法更改徽标",
    org_benefit_management: "✓ 集中账户管理",
    org_benefit_invoice: "✓ 发票付款（银行转账）",
    org_benefit_all: "✓ 非常适合家庭、学校、大学、俱乐部、机场、企业、组织等",
    contact_modal_title: "联系 Connections",
    contact_modal_message: "如需联系我们，请发送电子邮件至：",
    contact_modal_email: "support@connectionsfinder.com",
    contact_modal_instruction: "请附上您的姓名和咨询详情。",
    contact_modal_response: "我们将在24-48小时内回复。",
    contact_modal_request: "您的请求：",
    contact_modal_copy: "复制邮箱",
    contact_modal_close: "关闭",
    bulk_request_text: "批量订阅：{count} 个用户（{plan}）",
    subscription_alert:
      "订阅{plan}计划。此功能将通过App Store/Google Play IAP实现。",
    price_per_user_suffix: "/月",
    org_you_save_suffix: "",
    price_suffix_monthly: "/月",
    price_suffix_3months: "/3个月",
    price_suffix_6months: "/6个月",
    price_suffix_yearly: "/年",
  },
  es: {
    title: "Conexiones",
    subtitle: "Su centro de comunicación comunitario todo en uno",
    expiry_notice:
      "📅 Las suscripciones caducan después del período seleccionado",
    image_limits: "📸 Límite de 5 imágenes por informe",
    individual_title: "Planes de Suscripción Individual",
    individual_subtitle: "Planes personales para usuarios individuales",
    monthly: "Mensual",
    three_months: "3 Meses",
    six_months: "6 Meses",
    yearly: "Anual",
    subscribe: "Suscribirse",
    popular: "Popular",
    save_10: "Ahorra 10%",
    save_20: "Ahorra 20%",
    save_42: "Ahorra 42%",
    feature_avatar: "Avatar personal",
    feature_images: "5 imágenes por informe",
    feature_unlimited: "Informes ilimitados",
    feature_sharing: "Compartir en múltiples plataformas",
    footer_copyright: "Todos los derechos reservados",
    back_to_main: "Volver a la página principal",
    processing: "Procesando...",
    passcode_title: "🎫 ¿Tienes un código?",
    passcode_placeholder: "Ingrese su código",
    passcode_redeem: "Canjear",
    org_title: "🏢 Para Organizaciones, Familias, Clubes, etc.",
    org_desc:
      "Patrocine de 2 a 1000 usuarios con su logotipo mostrado en su aplicación.",
    org_bulk_users: "Número de usuarios patrocinados:",
    org_bulk_period: "Período de suscripción:",
    org_bulk_monthly: "Mensual",
    org_bulk_3months: "3 Meses (Ahorra 10%)",
    org_bulk_6months: "6 Meses (Ahorra 20%)",
    org_bulk_yearly: "Anual (Ahorra 42%)",
    org_price_per_user: "Precio por usuario:",
    org_total: "Total:",
    org_you_save: "Usted ahorra:",
    org_request_quote: "Solicitar cotización por volumen",
    org_benefit_logo:
      "✓ Su logotipo mostrado a todos los usuarios patrocinados",
    org_benefit_fixed:
      "✓ Los usuarios patrocinados no pueden cambiar el logotipo",
    org_benefit_management: "✓ Gestión centralizada de cuentas",
    org_benefit_invoice: "✓ Pago mediante factura (transferencia bancaria)",
    org_benefit_all:
      "✓ Perfecto para familias, escuelas, universidades, clubes, aeropuertos, empresas, organizaciones, etc.",
    contact_modal_title: "Contactar Connections",
    contact_modal_message: "Para contactarnos, por favor envíe un correo a:",
    contact_modal_email: "support@connectionsfinder.com",
    contact_modal_instruction:
      "Incluya su nombre y los detalles de su consulta.",
    contact_modal_response: "Responderemos dentro de 24-48 horas.",
    contact_modal_request: "Su solicitud:",
    contact_modal_copy: "Copiar correo",
    contact_modal_close: "Cerrar",
    bulk_request_text: "Suscripción por volumen: {count} usuarios ({plan})",
    subscription_alert:
      "Suscripción al plan {plan}. Esta función se implementará a través de App Store/Google Play IAP.",
    price_per_user_suffix: "/mes",
    org_you_save_suffix: "",
    price_suffix_monthly: "/mes",
    price_suffix_3months: "/3 meses",
    price_suffix_6months: "/6 meses",
    price_suffix_yearly: "/año",
  },
  hi: {
    title: "जुड़ाव",
    subtitle: "आपका ऑल-इन-वन सामुदायिक संचार केंद्र",
    expiry_notice: "📅 चयनित अवधि के बाद सदस्यता समाप्त हो जाती है",
    image_limits: "📸 प्रति रिपोर्ट 5 छवियों की सीमा",
    individual_title: "व्यक्तिगत सदस्यता योजनाएं",
    individual_subtitle: "व्यक्तिगत उपयोगकर्ताओं के लिए योजनाएं",
    monthly: "मासिक",
    three_months: "3 महीने",
    six_months: "6 महीने",
    yearly: "वार्षिक",
    subscribe: "सदस्यता लें",
    popular: "लोकप्रिय",
    save_10: "10% बचाएं",
    save_20: "20% बचाएं",
    save_42: "42% बचाएं",
    feature_avatar: "व्यक्तिगत अवतार",
    feature_images: "प्रति रिपोर्ट 5 छवियां",
    feature_unlimited: "असीमित रिपोर्ट",
    feature_sharing: "मल्टी-प्लेटफॉर्म शेयरिंग",
    footer_copyright: "सभी अधिकार सुरक्षित",
    back_to_main: "मुख्य पृष्ठ पर वापस जाएं",
    processing: "प्रक्रिया...",
    passcode_title: "🎫 कोड है?",
    passcode_placeholder: "अपना कोड दर्ज करें",
    passcode_redeem: "कोड का उपयोग करें",
    org_title: "🏢 संगठनों, परिवारों, क्लबों आदि के लिए",
    org_desc:
      "2 से 1000 उपयोगकर्ताओं को प्रायोजित करें, आपका लोगो उनके ऐप पर दिखाया जाएगा।",
    org_bulk_users: "प्रायोजित उपयोगकर्ताओं की संख्या:",
    org_bulk_period: "सदस्यता अवधि:",
    org_bulk_monthly: "मासिक",
    org_bulk_3months: "3 महीने (10% बचाएं)",
    org_bulk_6months: "6 महीने (20% बचाएं)",
    org_bulk_yearly: "वार्षिक (42% बचाएं)",
    org_price_per_user: "प्रति उपयोगकर्ता मूल्य:",
    org_total: "कुल:",
    org_you_save: "आप बचाते हैं:",
    org_request_quote: "थोक मूल्य के लिए संपर्क करें",
    org_benefit_logo: "✓ आपका लोगो सभी प्रायोजित उपयोगकर्ताओं को दिखाया गया",
    org_benefit_fixed: "✓ प्रायोजित उपयोगकर्ता लोगो नहीं बदल सकते",
    org_benefit_management: "✓ केंद्रीकृत खाता प्रबंधन",
    org_benefit_invoice: "✓ चालान भुगतान (बैंक हस्तांतरण)",
    org_benefit_all:
      "✓ परिवारों, स्कूलों, विश्वविद्यालयों, क्लबों, हवाई अड्डों, व्यवसायों, संगठनों आदि के लिए एकदम सही",
    contact_modal_title: "संपर्क करें Connections",
    contact_modal_message: "हमसे संपर्क करने के लिए, कृपया ईमेल करें:",
    contact_modal_email: "support@connectionsfinder.com",
    contact_modal_instruction: "कृपया अपना नाम और पूछताछ का विवरण शामिल करें।",
    contact_modal_response: "हम 24-48 घंटों के भीतर जवाब देंगे।",
    contact_modal_request: "आपका अनुरोध:",
    contact_modal_copy: "ईमेल कॉपी करें",
    contact_modal_close: "बंद करें",
    bulk_request_text: "थोक सदस्यता: {count} उपयोगकर्ता ({plan})",
    subscription_alert:
      "{plan} योजना की सदस्यता लें। यह सुविधा App Store/Google Play IAP के माध्यम से लागू की जाएगी।",
    price_per_user_suffix: "/महीना",
    org_you_save_suffix: "",
    price_suffix_monthly: "/महीना",
    price_suffix_3months: "/3 महीने",
    price_suffix_6months: "/6 महीने",
    price_suffix_yearly: "/साल",
  },
  ar: {
    title: "تواصل",
    subtitle: "مركز الاتصال المجتمعي الشامل الخاص بك",
    expiry_notice: "📅 تنتهي الاشتراكات بعد الفترة المحددة",
    image_limits: "📸 حد 5 صور لكل تقرير",
    individual_title: "خطط الاشتراك الفردي",
    individual_subtitle: "خطط شخصية للمستخدمين الأفراد",
    monthly: "شهري",
    three_months: "3 أشهر",
    six_months: "6 أشهر",
    yearly: "سنوي",
    subscribe: "اشتراك",
    popular: "شائع",
    save_10: "وفر 10%",
    save_20: "وفر 20%",
    save_42: "وفر 42%",
    feature_avatar: "الصورة الرمزية الشخصية",
    feature_images: "5 صور لكل تقرير",
    feature_unlimited: "تقارير غير محدودة",
    feature_sharing: "مشاركة عبر منصات متعددة",
    footer_copyright: "جميع الحقوق محفوظة",
    back_to_main: "العودة إلى الصفحة الرئيسية",
    processing: "جاري المعالجة...",
    passcode_title: "🎫 هل لديك رمز؟",
    passcode_placeholder: "أدخل الرمز الخاص بك",
    passcode_redeem: "استبدال",
    org_title: "🏢 للمنظمات والعائلات والنوادي وغيرها",
    org_desc: "قم برعاية من 2 إلى 1000 مستخدم مع عرض شعارك على تطبيقهم.",
    org_bulk_users: "عدد المستخدمين المدعومين:",
    org_bulk_period: "فترة الاشتراك:",
    org_bulk_monthly: "شهري",
    org_bulk_3months: "3 أشهر (وفر 10%)",
    org_bulk_6months: "6 أشهر (وفر 20%)",
    org_bulk_yearly: "سنوي (وفر 42%)",
    org_price_per_user: "السعر لكل مستخدم:",
    org_total: "المجموع:",
    org_you_save: "يمكنك توفير:",
    org_request_quote: "طلب عرض أسعار بالجملة",
    org_benefit_logo: "✓ يظهر شعارك لجميع المستخدمين المدعومين",
    org_benefit_fixed: "✓ المستخدمون المدعومون لا يمكنهم تغيير الشعار",
    org_benefit_management: "✓ إدارة مركزية للحسابات",
    org_benefit_invoice: "✓ الدفع عبر الفاتورة (تحويل بنكي)",
    org_benefit_all:
      "✓ مثالي للعائلات والمدارس والجامعات والنوادي والمطارات والشركات والمنظمات وغيرها",
    contact_modal_title: "اتصل بـ Connections",
    contact_modal_message: "للاتصال بنا، يرجى إرسال بريد إلكتروني إلى:",
    contact_modal_email: "support@connectionsfinder.com",
    contact_modal_instruction: "يرجى تضمين اسمك وتفاصيل استفسارك.",
    contact_modal_response: "سوف نرد خلال 24-48 ساعة.",
    contact_modal_request: "طلبك:",
    contact_modal_copy: "نسخ البريد الإلكتروني",
    contact_modal_close: "إغلاق",
    bulk_request_text: "اشتراك بالجملة: {count} مستخدم ({plan})",
    subscription_alert:
      "الاشتراك في خطة {plan}. سيتم تنفيذ هذه الميزة من خلال App Store/Google Play IAP.",
    price_per_user_suffix: "/شهر",
    org_you_save_suffix: "",
    price_suffix_monthly: "/شهر",
    price_suffix_3months: "/3 أشهر",
    price_suffix_6months: "/6 أشهر",
    price_suffix_yearly: "/سنة",
  },
};

let currentLang = "en";
let currentT = premiumTranslations.en;

// ============================================
// REVENUECAT INTEGRATION - ADD THIS SECTION
// ============================================

let revenueCatInitialized = false;

async function initRevenueCat() {
  if (revenueCatInitialized) return;

  try {
    // Check if running on Android device via Capacitor
    if (window.Capacitor && window.Capacitor.getPlatform() === "android") {
      const { Purchases } = await import("@revenuecat/purchases-capacitor");

      const userId = window.fb?.auth?.currentUser?.uid || null;

      await Purchases.configure({
        apiKey: "test_YwBBHjmFYqgnFPHUysizdkwFKbL",
        appUserID: userId,
      });

      revenueCatInitialized = true;
      console.log("✅ RevenueCat configured with sandbox key");

      await loadOfferings();
    } else {
      console.log("Not on Android, RevenueCat not initialized");
    }
  } catch (error) {
    console.error("Failed to configure RevenueCat:", error);
  }
}

async function loadOfferings() {
  try {
    const { Purchases } = await import("@revenuecat/purchases-capacitor");
    const offerings = await Purchases.getOfferings();

    if (offerings.current) {
      console.log("✅ Offerings loaded:", offerings.current.availablePackages);
      window.revenueCatOfferings = offerings.current.availablePackages;

      // Update prices on the page
      updatePricesFromOfferings(window.revenueCatOfferings);
    }
  } catch (error) {
    console.error("Failed to load offerings:", error);
  }
}

function updatePricesFromOfferings(packages) {
  const priceMap = {
    monthly_subscription: ".plan:first-child .plan-price",
    three_months_subscription: ".plan:nth-child(2) .plan-price",
    six_months_subscription: ".plan:nth-child(3) .plan-price",
    yearly_subscription: ".plan:nth-child(4) .plan-price",
  };

  for (const pkg of packages) {
    const productId = pkg.productIdentifier || pkg.identifier;
    const selector = priceMap[productId];
    if (selector && pkg.product && pkg.product.priceString) {
      const priceElement = document.querySelector(selector);
      if (priceElement && priceElement.textContent === "-") {
        priceElement.textContent = pkg.product.priceString;
      }
    }
  }
}

async function purchaseWithRevenueCat(productId) {
  if (!revenueCatInitialized) {
    alert(
      currentT.subscription_alert?.replace("{plan}", productId) ||
        "Payment system not ready. Please try again.",
    );
    return false;
  }

  if (!window.revenueCatOfferings) {
    alert("Products not loaded. Please try again.");
    return false;
  }

  try {
    const packageToPurchase = window.revenueCatOfferings.find(
      (pkg) =>
        pkg.productIdentifier === productId || pkg.identifier === productId,
    );

    if (!packageToPurchase) {
      alert("Product not found. Please try again.");
      return false;
    }

    const { Purchases } = await import("@revenuecat/purchases-capacitor");
    const { customerInfo } = await Purchases.purchasePackage({
      aPackage: packageToPurchase,
    });

    if (customerInfo.entitlements.active.premium) {
      console.log("✅ Purchase successful!");
      await savePremiumStatusToFirebase(true);
      alert(
        currentT.subscription_alert?.replace("{plan}", productId) ||
          "Subscription successful!",
      );
      window.location.href = "/dashboard.html";
      return true;
    }

    return false;
  } catch (error) {
    console.error("Purchase failed:", error);
    if (!error.userCancelled) {
      alert("Purchase failed. Please try again.");
    }
    return false;
  }
}

async function savePremiumStatusToFirebase(isPremium) {
  const user = window.fb?.auth?.currentUser;
  if (!user) return;

  try {
    await window.fb.firestore.collection("users").doc(user.uid).set(
      {
        isPremium: isPremium,
        updatedAt: new Date().toISOString(),
      },
      { merge: true },
    );

    localStorage.setItem("isPremium", isPremium ? "true" : "false");
  } catch (error) {
    console.error("Failed to save premium status:", error);
  }
}

// Initialize page
// Initialize page - read from main page storage
document.addEventListener("DOMContentLoaded", () => {
  // Read from same storage keys as main page
  const savedLang =
    localStorage.getItem("userLanguage") ||
    localStorage.getItem("appLanguage") ||
    "en";
  setLanguage(savedLang);

  console.log("✅ Premium page initialized with language:", savedLang);

  // Language buttons
  document.querySelectorAll(".lang-btn").forEach((btn) => {
    btn.addEventListener("click", () => setLanguage(btn.dataset.lang));
  });

  // Back button
  document.getElementById("backToMainBtn")?.addEventListener("click", () => {
    window.location.href = "/dashboard.html";
  });

  // Contact sales
  document.getElementById("contactSalesBtn")?.addEventListener("click", () => {
    alert("📧 support@connectionsfinder.com\n📞 +84 0906756201");
  });

  // Subscribe buttons
  // Subscribe buttons - WITH REVENUECAT
  document.querySelectorAll(".subscribe-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const plan = btn.dataset.plan;

      const planMapping = {
        monthly: "monthly_subscription",
        three_months: "three_months_subscription",
        six_months: "six_months_subscription",
        yearly: "yearly_subscription",
      };

      const productId = planMapping[plan];
      if (!productId) {
        alert("Invalid plan selected");
        return;
      }

      // Show loading state
      const originalText = btn.textContent;
      btn.textContent = currentT.processing || "Processing...";
      btn.disabled = true;

      await purchaseWithRevenueCat(productId);

      // Reset button (only if purchase didn't redirect)
      btn.textContent = originalText;
      btn.disabled = false;
    });
  });
  // Initialize RevenueCat after Firebase auth is ready
  const checkAuth = setInterval(() => {
    if (window.fb?.auth?.currentUser) {
      clearInterval(checkAuth);
      initRevenueCat();
    }
  }, 500);
});

function setLanguage(lang) {
  if (!premiumTranslations[lang]) lang = "en";
  currentLang = lang;
  currentT = premiumTranslations[lang];

  // Save to BOTH storage keys (sync with main page)
  localStorage.setItem("userLanguage", lang);
  localStorage.setItem("appLanguage", lang);
  localStorage.setItem("premiumLanguage", lang);

  // Update all elements (your existing code)
  const elements = {
    pageTitle: currentT.title,
    pageSubtitle: currentT.subtitle,
    betaBanner: currentT.beta_banner,
    expiryNotice: currentT.expiry_notice,
    imageLimits: currentT.image_limits,
    individualTitle: currentT.individual_title,
    individualSubtitle: currentT.individual_subtitle,
    orgTitle: currentT.org_title,
    orgDesc: currentT.org_desc,
    footerCopyright: currentT.footer_copyright,
  };

  for (const [id, text] of Object.entries(elements)) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  }

  // Plan names
  const planNames = document.querySelectorAll(".plan-name");
  if (planNames[0]) planNames[0].textContent = currentT.monthly;
  if (planNames[1]) planNames[1].textContent = currentT.three_months;
  if (planNames[2]) planNames[2].textContent = currentT.six_months;
  if (planNames[3]) planNames[3].textContent = currentT.yearly;

  // Subscribe buttons
  document
    .querySelectorAll(".subscribe-btn")
    .forEach((btn) => (btn.textContent = currentT.subscribe));

  // Features
  document
    .querySelectorAll('[data-feature="avatar"]')
    .forEach((el) => (el.textContent = currentT.feature_avatar));
  document
    .querySelectorAll('[data-feature="images"]')
    .forEach((el) => (el.textContent = currentT.feature_images));
  document
    .querySelectorAll('[data-feature="unlimited"]')
    .forEach((el) => (el.textContent = currentT.feature_unlimited));
  document
    .querySelectorAll('[data-feature="sharing"]')
    .forEach((el) => (el.textContent = currentT.feature_sharing));

  // Savings badges
  const s3 = document.getElementById("savings3months");
  const s6 = document.getElementById("savings6months");
  const sy = document.getElementById("savingsyearly");
  const pb = document.getElementById("popularBadge");
  if (s3) s3.textContent = currentT.save_10;
  if (s6) s6.textContent = currentT.save_20;
  if (sy) sy.textContent = currentT.save_42;
  if (pb) pb.textContent = currentT.popular;

  // Back button
  const backBtn = document.getElementById("backToMainBtn");
  if (backBtn) backBtn.innerHTML = "← " + currentT.back_to_main;

  // Contact sales button
  const contactBtn = document.getElementById("contactSalesBtn");
  if (contactBtn) contactBtn.innerHTML = currentT.contact_sales;

  // Pass code section
  const passTitle = document.getElementById("passCodeTitle");
  const passInput = document.getElementById("passCodeInput");
  const passBtn = document.getElementById("redeemPassBtn");
  if (passTitle) passTitle.textContent = currentT.passcode_title;
  if (passInput) passInput.placeholder = currentT.passcode_placeholder;
  if (passBtn) passBtn.textContent = currentT.passcode_redeem;

  // Bulk calculator labels
  // Also try by class or position if the above fails
  const allLabels = document.querySelectorAll(".bulk-calculator label");
  if (allLabels.length >= 2) {
    if (allLabels[0]) allLabels[0].textContent = currentT.org_bulk_users;
    if (allLabels[1]) allLabels[1].textContent = currentT.org_bulk_period;
  }
  // Update the plan select options
  const planSelect = document.getElementById("bulkPlanSelect");
  if (planSelect) {
    const options = planSelect.options;
    if (options[0]) options[0].text = currentT.org_bulk_monthly;
    if (options[1]) options[1].text = currentT.org_bulk_3months;
    if (options[2]) options[2].text = currentT.org_bulk_6months;
    if (options[3]) options[3].text = currentT.org_bulk_yearly;
  }

  // Update price labels
  const pricePerUserLabel = document.getElementById("pricePerUserLabel");
  const totalLabel = document.getElementById("totalLabel");
  const youSaveLabel = document.getElementById("youSaveLabel");
  if (pricePerUserLabel)
    pricePerUserLabel.textContent = currentT.org_price_per_user;
  if (totalLabel) totalLabel.textContent = currentT.org_total;
  if (youSaveLabel) youSaveLabel.textContent = currentT.org_you_save;

  // ADD THE NEW CODE HERE ↓↓↓
  const priceSuffix = document.getElementById("pricePerUserSuffix");
  if (priceSuffix)
    priceSuffix.textContent = currentT.price_per_user_suffix || "/month";

  const youSaveSuffix = document.getElementById("youSaveSuffix");
  if (youSaveSuffix)
    youSaveSuffix.textContent = currentT.org_you_save_suffix || "";
  // ADD THE NEW CODE HERE ↑↑↑

  // Update button text
  const bulkBtn = document.getElementById("bulkContactBtn");
  if (bulkBtn) bulkBtn.textContent = currentT.org_request_quote;

  // Update list items
  const listItems = document.querySelectorAll(".organization-section ul li");
  if (listItems.length >= 5) {
    if (listItems[0]) listItems[0].innerHTML = currentT.org_benefit_logo;
    if (listItems[1]) listItems[1].innerHTML = currentT.org_benefit_fixed;
    if (listItems[2]) listItems[2].innerHTML = currentT.org_benefit_management;
    if (listItems[3]) listItems[3].innerHTML = currentT.org_benefit_invoice;
    if (listItems[4]) listItems[4].innerHTML = currentT.org_benefit_all;
  }

  // Update footer support label
  const supportLabel = document.querySelector(
    "footer p:last-child span:first-child",
  );
  if (supportLabel) {
    const supportLabels = {
      en: "📧 Support:",
      vi: "📧 Hỗ trợ:",
      zh: "📧 支持：",
      es: "📧 Soporte:",
      hi: "📧 सहायता:",
      ar: "📧 الدعم:",
    };
    supportLabel.textContent = supportLabels[lang] || supportLabels.en;
  }

  // Active button style
  document.querySelectorAll(".lang-btn").forEach((btn) => {
    if (btn.dataset.lang === lang) btn.classList.add("active");
    else btn.classList.remove("active");
  });

  localStorage.setItem("premiumLanguage", lang);
  console.log("✅ Premium page language set to:", lang);
}

// Initialize bulk contact button with delay
setTimeout(function () {
  const bulkBtn = document.getElementById("bulkContactBtn");
  if (bulkBtn) {
    // Remove any existing listeners by cloning
    const newBtn = bulkBtn.cloneNode(true);
    bulkBtn.parentNode.replaceChild(newBtn, bulkBtn);

    newBtn.addEventListener("click", function (e) {
      e.preventDefault();
      const userCount = document.getElementById("bulkUserCount")?.value || 10;
      const planSelect = document.getElementById("bulkPlanSelect");
      const planText =
        planSelect?.options[planSelect.selectedIndex]?.text || "Monthly";
      window.location.href = `mailto:support@connectionsfinder.com?subject=Bulk Subscription Request: ${userCount} users (${planText})&body=Please send me a quote for ${userCount} sponsored users with ${planText} subscription.`;
    });
    console.log("✅ Bulk contact button initialized");
  } else {
    console.log("⚠️ Bulk contact button not found");
  }
}, 1000);

// Loading overlay functions
window.showPremiumLoading = function (message) {
  const overlay = document.getElementById("loadingOverlay");
  const text = document.getElementById("loadingText");
  if (text) text.textContent = message || currentT.processing;
  if (overlay) overlay.classList.add("active");
};

window.hidePremiumLoading = function () {
  const overlay = document.getElementById("loadingOverlay");
  if (overlay) overlay.classList.remove("active");
};
