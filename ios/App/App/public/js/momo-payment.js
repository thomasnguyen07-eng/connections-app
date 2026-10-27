// Enhanced momo-payment.js with better error handling
console.log("🎯 momo-payment.js loaded successfully!");

class MomoPayment {
  constructor() {
    this.isProcessing = false;
    console.log("✅ MoMo Payment initialized");
  }

  async initiatePayment(amount, orderInfo, orderId, userId, planType) {
    if (this.isProcessing) {
      alert("Payment is already being processed. Please wait.");
      return;
    }

    this.isProcessing = true;

    try {
      this.showLoading();

      // Check if Firebase Functions is available
      if (!window.fb || !window.fb.functions) {
        throw new Error(
          "Firebase Functions not available. Please refresh the page or try again later."
        );
      }

      const user = window.fb.auth?.currentUser;
      if (!user) {
        throw new Error("User not authenticated. Please sign in first.");
      }

      console.log("Initiating MoMo payment with user:", user.uid);

      // Use Firebase Callable Function
      const createPayment =
        window.fb.functions.httpsCallable("createMomoPayment");
      const result = await createPayment({
        amount: amount,
        orderInfo: orderInfo,
        orderId: orderId,
        planType: planType,
        userId: user.uid,
      });

      if (result.data.success) {
        if (result.data.isTest || result.data.isManual) {
          this.handleManualPayment(result.data);
        } else {
          window.location.href = result.data.payUrl;
        }
      } else {
        throw new Error(result.data.message || "Payment failed");
      }
    } catch (error) {
      console.error("Momo payment error:", error);
      alert("Payment initialization failed: " + error.message);
    } finally {
      this.isProcessing = false;
      this.hideLoading();
    }
  }

  handleManualPayment(paymentData) {
    if (paymentData.instructions) {
      this.showManualPaymentModal(paymentData);
    } else {
      alert(
        "TEST MODE: " +
          (paymentData.message || "Payment initiated in test mode")
      );
      if (paymentData.payUrl) {
        window.location.href = paymentData.payUrl;
      }
    }
  }

  showManualPaymentModal(paymentData) {
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
        <h2 style="color: #b1216a; margin-bottom: 15px;">💳 Complete Your Payment</h2>
        
        <div style="text-align: left; background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 15px 0;">
          <h3 style="color: #333; margin-bottom: 15px;">📱 Payment Instructions:</h3>
          <p style="white-space: pre-line; line-height: 1.6; color: #555;">${paymentData.instructions}</p>
        </div>

        <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #ffc107;">
          <p style="margin: 0; color: #856404;"><strong>Note:</strong> ${paymentData.note}</p>
        </div>

        <div style="display: flex; gap: 10px; justify-content: center; margin-top: 20px; flex-wrap: wrap;">
          <button id="copy-instructions" style="
            background: #28a745; color: white; border: none; padding: 12px 25px;
            border-radius: 25px; font-size: 16px; cursor: pointer; font-weight: bold;
          ">📋 Copy Instructions</button>
          
          <button id="close-modal" style="
            background: #6c757d; color: white; border: none; padding: 12px 25px;
            border-radius: 25px; font-size: 16px; cursor: pointer; font-weight: bold;
          ">Close</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    document
      .getElementById("copy-instructions")
      .addEventListener("click", function () {
        const textToCopy = paymentData.instructions + "\n\n" + paymentData.note;
        navigator.clipboard
          .writeText(textToCopy)
          .then(() => alert("Payment instructions copied to clipboard!"))
          .catch(() => alert("Please copy the instructions manually."));
      });

    document
      .getElementById("close-modal")
      .addEventListener("click", function () {
        document.body.removeChild(modal);
      });
  }

  // Show loading indicator
  showLoading() {
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
        border-top: 5px solid #b1216a; border-radius: 50%;
        animation: spin 1s linear infinite; margin-bottom: 20px;
      `;

      const text = document.createElement("div");
      text.textContent = "Processing Payment...";
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

  // Hide loading indicator
  hideLoading() {
    const overlay = document.getElementById("payment-loading");
    if (overlay) {
      overlay.style.display = "none";
    }
  }
}

// Manual MoMo Payment Fallback
// Manual MoMo Payment Fallback - WITH TRANSLATIONS AND MODAL
async function manualMomoPayment(planType, amountVND, user) {
  console.log("🔄 Using manual MoMo payment fallback");

  try {
    const planNames = {
      monthly: "Monthly Subscription",
      three_months: "3-Month Subscription",
      six_months: "6-Month Subscription",
      yearly: "Yearly Subscription",
    };

    const readablePlan = planNames[planType] || planType;
    const amountFormatted = amountVND.toLocaleString();
    const orderId = `manual_${Date.now()}_${user.uid.slice(-8)}`;

    // Show instructions for manual payment
    const instructions = `Manual Payment Required\n\nPlease complete your payment manually:\n\n1. Open your MoMo app\n2. Send ${amountFormatted}₫ to:\n   Phone: 0901234567\n   Account: NGUYEN VAN A\n3. Include this reference: ${orderId}\n4. Take a screenshot of the payment confirmation\n5. Email the screenshot to: support@connectionsapp.com\n\nWe will activate your ${readablePlan} within 24 hours of payment confirmation.\n\nThank you for your patience!`;

    // Create payment data object
    const paymentData = {
      success: true,
      isManual: true,
      instructions: instructions,
      orderId: orderId,
      note: "Please include the reference number in your payment.",
    };

    // Try to use translated modal from premium.js first
    if (
      window.premiumManager &&
      typeof window.premiumManager.showTranslatedPaymentModal === "function"
    ) {
      console.log("✅ Using premium manager translated modal");
      window.premiumManager.showTranslatedPaymentModal(paymentData);
    } else {
      console.log("🔄 Using built-in manual payment modal");
      // Create modal with instructions
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
          <h2 style="color: #b1216a; margin-bottom: 15px;">💳 Manual Payment Required</h2>
          
          <div style="text-align: left; background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 15px 0;">
            <h3 style="color: #333; margin-bottom: 15px;">Payment Instructions:</h3>
            <p style="white-space: pre-line; line-height: 1.6; color: #555;">${paymentData.instructions}</p>
          </div>

          <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #ffc107;">
            <p style="margin: 0; color: #856404;"><strong>Note:</strong> ${paymentData.note}</p>
          </div>

          <div style="display: flex; gap: 10px; justify-content: center; margin-top: 20px; flex-wrap: wrap;">
            <button id="copy-manual-instructions" style="
              background: #28a745; color: white; border: none; padding: 12px 25px;
              border-radius: 25px; font-size: 16px; cursor: pointer; font-weight: bold;
            ">📋 Copy Instructions</button>
            
            <button id="close-manual-modal" style="
              background: #6c757d; color: white; border: none; padding: 12px 25px;
              border-radius: 25px; font-size: 16px; cursor: pointer; font-weight: bold;
            ">Close</button>
          </div>
        </div>
      `;

      document.body.appendChild(modal);

      document
        .getElementById("copy-manual-instructions")
        .addEventListener("click", function () {
          const textToCopy =
            paymentData.instructions + "\n\n" + paymentData.note;
          navigator.clipboard
            .writeText(textToCopy)
            .then(() => alert("Payment instructions copied to clipboard!"))
            .catch(() => alert("Please copy the instructions manually."));
        });

      document
        .getElementById("close-manual-modal")
        .addEventListener("click", function () {
          document.body.removeChild(modal);
        });
    }
  } catch (error) {
    console.error("Manual MoMo payment error:", error);
    throw new Error("Manual payment setup failed: " + error.message);
  }
}

// Enhanced function to handle plan selection with Momo
// SIMPLIFIED Momo payment - Use HTTP function as primary
async function selectPlanWithMomo(planType, amountVND) {
  console.log("selectPlanWithMomo called with:", { planType, amountVND });

  try {
    // Check if Firebase is available
    if (!window.fb) {
      console.error("Firebase not available");
      throw new Error("Payment system not ready. Please refresh the page.");
    }

    const user = window.fb.auth?.currentUser;
    console.log("Current user in momo function:", user);

    if (!user) {
      alert("Please sign in to upgrade. Moving to login...");
      localStorage.setItem("pendingSubscription", planType);
      localStorage.setItem("subscriptionIntent", planType);
      window.location.href = "dashboard.html";
      return;
    }

    window.momoPayment.showLoading();

    console.log("Initiating Momo payment with user:", {
      planType,
      amountVND,
      userId: user.uid,
      userEmail: user.email,
    });

    // USE HTTP FUNCTION AS PRIMARY (more reliable)
    await useHttpMomoPayment(planType, amountVND, user);
  } catch (error) {
    console.error("MoMo payment error:", error);

    if (
      error.message.includes("unauthenticated") ||
      error.message.includes("not signed in")
    ) {
      alert("Please sign in to proceed with payment. Moving to login...");
      localStorage.setItem("pendingSubscription", planType);
      localStorage.setItem("subscriptionIntent", planType);
      window.location.href = "dashboard.html";
    } else {
      alert("Payment initialization failed: " + error.message);
    }
  } finally {
    window.momoPayment.hideLoading();
  }
}

// HTTP Function - PRIMARY METHOD
// UPDATED HTTP Function - WITH CLIENT-SIDE TRANSLATION
async function useHttpMomoPayment(planType, amountVND, user) {
  console.log("🔄 Using HTTP Momo payment (Primary Method)");

  try {
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
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    if (result.success) {
      console.log("✅ HTTP Momo payment successful:", result);

      // Use client-side translation for the payment data
      const translatedPaymentData = translatePaymentData(
        result,
        planType,
        amountVND
      );

      // Use the translated modal from premium.js
      if (
        window.premiumManager &&
        window.premiumManager.showTranslatedPaymentModal
      ) {
        window.premiumManager.showTranslatedPaymentModal(translatedPaymentData);
      } else {
        window.momoPayment.showManualPaymentModal(translatedPaymentData);
      }
    } else {
      throw new Error(result.error || "HTTP payment failed");
    }
  } catch (error) {
    console.error("HTTP Momo payment error:", error);

    // Final fallback to basic manual payment
    console.log("🔄 Using basic manual payment fallback");
    await manualMomoPayment(planType, amountVND, user);
  }
}

// UPDATED: Complete client-side translation function
function translatePaymentData(result, planType, amountVND) {
  // Get current translations from premium manager
  const translations = window.premiumManager?.translations || {};
  const currentLang = window.premiumManager?.currentLang || "en";

  const planNames = {
    monthly: translations.monthly || "Monthly",
    three_months: translations.three_months || "3 Months",
    six_months: translations.six_months || "6 Months",
    yearly: translations.yearly || "Yearly",
  };

  const readablePlan = planNames[planType] || planType;
  const amountFormatted = amountVND.toLocaleString();

  // YOUR REAL PAYMENT DETAILS - UPDATE THESE:
  const yourPhoneNumber = "+84 0906756201"; // Your real MoMo number
  const yourFullName = "HUYNH DUC NGUYEN"; // Your real name as it appears in MoMo
  const yourEmail = "support@connectionsapp.com"; // Your support email

  let instructions;
  let note =
    translations.payment_note_reference ||
    "Please include the reference number in your payment";

  switch (currentLang) {
    case "vi":
      instructions = `Yêu cầu Thanh toán Thủ công\n\nVui lòng hoàn tất thanh toán theo cách thủ công:\n\n1. Mở ứng dụng MoMo của bạn\n2. Gửi ${amountFormatted}₫ đến:\n   Số điện thoại: ${yourPhoneNumber}\n   Tài khoản: ${yourFullName}\n3. Bao gồm mã tham chiếu: ${result.orderId}\n4. Chụp ảnh màn hình xác nhận thanh toán\n5. Gửi email ảnh chụp màn hình đến: ${yourEmail}\n\nChúng tôi sẽ kích hoạt gói ${readablePlan} của bạn trong vòng 24 giờ sau khi xác nhận thanh toán.\n\nCảm ơn sự kiên nhẫn của bạn!`;
      break;
    case "zh":
      instructions = `需要手动支付\n\n请手动完成支付：\n\n1. 打开您的MoMo应用\n2. 发送 ${amountFormatted}₫ 至：\n   电话：${yourPhoneNumber}\n   账户：${yourFullName}\n3. 包含此参考号：${result.orderId}\n4. 截取支付确认截图\n5. 将截图发送至：${yourEmail}\n\n我们将在支付确认后24小时内激活您的${readablePlan}订阅。\n\n感谢您的耐心！`;
      break;
    case "es":
      instructions = `Pago Manual Requerido\n\nPor favor complete su pago manualmente:\n\n1. Abra su aplicación MoMo\n2. Envíe ${amountFormatted}₫ a:\n   Teléfono: ${yourPhoneNumber}\n   Cuenta: ${yourFullName}\n3. Incluya esta referencia: ${result.orderId}\n4. Tome una captura de pantalla de la confirmación de pago\n5. Envíe la captura de pantalla por correo a: ${yourEmail}\n\nActivaremos su suscripción ${readablePlan} dentro de las 24 horas posteriores a la confirmación del pago.\n\n¡Gracias por su paciencia!`;
      break;
    case "hi":
      instructions = `मैनुअल भुगतान आवश्यक\n\nकृपया अपना भुगतान मैन्युअल रूप से पूरा करें:\n\n1. अपना MoMo ऐप खोलें\n2. ${amountFormatted}₫ भेजें:\n   फोन: ${yourPhoneNumber}\n   खाता: ${yourFullName}\n3. इस संदर्भ को शामिल करें: ${result.orderId}\n4. भुगतान पुष्टि का स्क्रीनशॉट लें\n5. स्क्रीनशॉट ईमेल करें: ${yourEmail}\n\nहम भुगतान पुष्टि के 24 घंटों के भीतर आपकी ${readablePlan} सदस्यता सक्रिय कर देंगे।\n\nआपके धैर्य के लिए धन्यवाद!`;
      break;
    case "ar":
      instructions = `الدفع اليدوي مطلوب\n\nيرجى إكمال دفعتك يدويًا:\n\n1. افتح تطبيق MoMo الخاص بك\n2. أرسل ${amountFormatted}₫ إلى:\n   الهاتف: ${yourPhoneNumber}\n   الحساب: ${yourFullName}\n3. قم بتضمين هذا المرجع: ${result.orderId}\n4. التقط لقطة شاشة لتأكيد الدفع\n5. أرسل لقطة الشاشة بالبريد الإلكتروني إلى: ${yourEmail}\n\nسنقوم بتنشيط اشتراكك ${readablePlan} في غضون 24 ساعة من تأكيد الدفع.\n\nشكرا لك على صبرك!`;
      break;
    default: // English
      instructions = `Manual Payment Required\n\nPlease complete your payment manually:\n\n1. Open your MoMo app\n2. Send ${amountFormatted}₫ to:\n   Phone: ${yourPhoneNumber}\n   Account: ${yourFullName}\n3. Include this reference: ${result.orderId}\n4. Take a screenshot of the payment confirmation\n5. Email the screenshot to: ${yourEmail}\n\nWe will activate your ${readablePlan} subscription within 24 hours of payment confirmation.\n\nThank you for your patience!`;
  }

  return {
    success: true,
    isManual: true,
    instructions: instructions,
    orderId: result.orderId,
    note: note,
  };
}

// Initialize Momo payment instance
window.momoPayment = new MomoPayment();
window.selectPlanWithMomo = selectPlanWithMomo;

console.log("✅ momo-payment.js initialization complete");
