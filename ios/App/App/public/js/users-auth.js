// ========== SIMPLE UI FIX ==========
// ========== SIMPLE UI FIX ==========
function fixButtonVisibility() {
  console.log("🔧 Fixing button visibility...");

  // ✅ Check localStorage for user (REST API auth)
  const localUser = localStorage.getItem('user');
  const isSignedIn = localStorage.getItem('isSignedIn') === 'true' && !!localUser;
  
  const authButtons = document.getElementById("usersAuthButtons");
  const userControls = document.getElementById("userControls");

  console.log("User:", isSignedIn ? "Signed in" : "Signed out");
  console.log("localUser exists:", !!localUser);
  console.log("isSignedIn flag:", localStorage.getItem('isSignedIn'));

  if (isSignedIn) {
    console.log("✅ Showing logout/subscribe, hiding sign-in/sign-up");
    if (authButtons) authButtons.style.display = "none";
    if (userControls) userControls.style.display = "flex";
  } else {
    console.log("✅ Showing sign-in/sign-up, hiding logout/subscribe");
    if (authButtons) authButtons.style.display = "flex";
    if (userControls) userControls.style.display = "none";
  }
}

// ========== CALL IT MULTIPLE TIMES ==========
// Call on page load
setTimeout(fixButtonVisibility, 1000);
setTimeout(fixButtonVisibility, 2000);

// ========== UNIFIED TRANSLATION HELPER ==========
// This works with both main app and auth translations

// 👁️ Show/hide password toggle
function togglePasswordVisibility(inputId, btnEl) {
  try {
    const input = document.getElementById(inputId);
    if (!input) return;
    const isHidden = input.type === "password";
    input.type = isHidden ? "text" : "password";
    if (btnEl) btnEl.textContent = isHidden ? "🙈" : "👁";
  } catch (e) {
    console.warn("togglePasswordVisibility error:", e);
  }
}
window.togglePasswordVisibility = togglePasswordVisibility;

function getAuthTranslation(key, defaultText = "") {
  // Get current language (use main app's storage key)
  const currentLang = localStorage.getItem("appLanguage") || "en";

  // Try auth translations first (your embedded translations)
  if (authTranslations && authTranslations[currentLang]) {
    if (authTranslations[currentLang][key]) {
      return authTranslations[currentLang][key];
    }
  }

  // Fallback to English auth translations
  if (authTranslations && authTranslations.en && authTranslations.en[key]) {
    return authTranslations.en[key];
  }

  // Last resort: return default text or key
  return defaultText || key;
}

console.log("🚨 SIMPLE users-auth.js loading");

// ========== 1. GLOBAL SIGN-UP FUNCTION ==========
window.createUserAccount = async function (email, password, displayName) {
  console.log("🌍 Creating account for:", email.substring(0, 10) + "...");

  try {
    // 🔧 REST-based sign-up — Firebase Auth SDK hangs on iOS WebView.
    const API_KEY = "AIzaSyB3Kpbz7CWUP1Vj3bUHa6Uxv6kWqi2ouH0";

    // Step 1: Create the account via REST
    console.log("📦 Step 1: Sign-up via REST...");
    const signupResp = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, returnSecureToken: true }),
      }
    );

    const signupData = await signupResp.json();
    if (!signupResp.ok) {
      const errMsg = signupData?.error?.message || `HTTP ${signupResp.status}`;
      console.error("❌ Sign-up REST error:", errMsg);
      throw new Error(errMsg);
    }

    const uid = signupData.localId;
    const idToken = signupData.idToken;
    const refreshToken = signupData.refreshToken;
    console.log("✅ User created, UID:", uid.substring(0, 8) + "...");

    // Step 2: Update the display name via REST
    console.log("🔄 Step 2: Setting displayName...");
    if (displayName) {
      try {
        await fetch(
          `https://identitytoolkit.googleapis.com/v1/accounts:update?key=${API_KEY}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ idToken, displayName, returnSecureToken: false }),
          }
        );
        console.log("✅ DisplayName set");
      } catch (e) {
        console.warn("DisplayName update failed (non-fatal):", e);
      }
    }

    // Step 3: Save the user to localStorage so other parts of the app find it
    const userData = {
      uid,
      email,
      displayName: displayName || email.split("@")[0],
      idToken,
      refreshToken,
      signedIn: true,
    };
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("isSignedIn", "true");
    console.log("💾 Saved user to localStorage");

    // Step 4: Create user profile (optional; skip if it hangs)
    if (typeof window.createUserProfile === "function") {
      try {
        await Promise.race([
          window.createUserProfile(uid, {
            email: email,
            name: displayName,
            displayName: displayName,
            accountType: "individual",
          }),
          new Promise((_, r) => setTimeout(() => r(new Error("profile timeout")), 4000)),
        ]);
        console.log("✅ User profile created");
      } catch (e) {
        console.warn("Profile creation skipped/timeout:", e.message);
      }
    }

    console.log("🎉 ACCOUNT CREATED SUCCESSFULLY!");

    // Return a compatible-shaped user object
    return {
      uid,
      email,
      displayName: displayName || email.split("@")[0],
    };
  } catch (error) {
    console.error("❌ ERROR in createUserAccount:");
    console.error("❌ Message:", error.message);
    throw error;
  }
};

console.log("✅ Global function ready:", typeof window.createUserAccount);

// ========== AUTH TRANSLATIONS ==========
const authTranslations = {
  en: {
    // Sign-up (existing)
    signupTitle: "Create Account",
    emailLabel: "Email",
    passwordLabel: "Password",
    nameLabel: "Full Name",
    createAccountBtn: "Create Account",
    cancelBtn: "Cancel",
    success: "Account created! Welcome {name}",
    emailExists: "Email already registered",
    weakPassword: "Password must be at least 6 characters",
    invalidEmail: "Invalid email address",
    allFieldsRequired: "All fields are required",
    creatingAccount: "Creating...",
    signoutSuccess: "Signed out successfully!",
    languageChanging: "Changing language...",
    passcodeLabel: "Sponsorship Passcode (Optional)",
    passcodeHelp: "Leave blank for an individual account",
    alreadyHaveAccount: "Already have an account? Sign In",
    invalidPasscode: "Invalid or already used passcode",

    // Sign-in (NEW)
    signinTitle: "Sign In",
    signinBtn: "Sign In",
    forgotPassword: "Forgot Password?",
    noAccount: "Don't have an account?",
    signupLink: "Sign Up",
    invalidCredentials: "Invalid email or password",
    signingIn: "Signing in...",
    signinSuccess: "Signed in successfully!",
  },
  vi: {
    signupTitle: "Tạo Tài Khoản",
    emailLabel: "Email",
    passwordLabel: "Mật khẩu",
    nameLabel: "Họ và Tên",
    createAccountBtn: "Tạo Tài Khoản",
    cancelBtn: "Hủy",
    success: "Đã tạo tài khoản! Chào mừng {name}",
    emailExists: "Email đã được đăng ký",
    weakPassword: "Mật khẩu phải có ít nhất 6 ký tự",
    invalidEmail: "Địa chỉ email không hợp lệ",
    allFieldsRequired: "Vui lòng điền đầy đủ thông tin",
    creatingAccount: "Đang tạo...",
    signoutSuccess: "Đã đăng xuất thành công!",
    languageChanging: "Đang thay đổi ngôn ngữ...",
    passcodeLabel: "Mã bảo trợ (Tùy chọn)",
    passcodeHelp: "Để trống nếu là tài khoản cá nhân",
    alreadyHaveAccount: "Đã có tài khoản? Đăng nhập",
    invalidPasscode: "Mã không hợp lệ hoặc đã được sử dụng",

    signinTitle: "Đăng Nhập",
    signinBtn: "Đăng Nhập",
    forgotPassword: "Quên mật khẩu?",
    noAccount: "Chưa có tài khoản?",
    signupLink: "Đăng Ký",
    invalidCredentials: "Email hoặc mật khẩu không đúng",
    signingIn: "Đang đăng nhập...",
    signinSuccess: "Đăng nhập thành công!",
  },
  zh: {
    signupTitle: "创建账户",
    emailLabel: "电子邮件",
    passwordLabel: "密码",
    nameLabel: "全名",
    createAccountBtn: "创建账户",
    cancelBtn: "取消",
    success: "账户已创建！欢迎 {name}",
    emailExists: "电子邮件已注册",
    weakPassword: "密码必须至少6个字符",
    invalidEmail: "电子邮件地址无效",
    allFieldsRequired: "所有字段均为必填项",
    creatingAccount: "正在创建...",
    signoutSuccess: "退出登录成功！",
    languageChanging: "正在更改语言...",
    passcodeLabel: "赞助代码（可选）",
    passcodeHelp: "个人账户请留空",
    alreadyHaveAccount: "已有账户？登录",
    invalidPasscode: "代码无效或已被使用",

    signinTitle: "登录",
    signinBtn: "登录",
    forgotPassword: "忘记密码？",
    noAccount: "没有账户？",
    signupLink: "注册",
    invalidCredentials: "电子邮件或密码无效",
    signingIn: "正在登录...",
    signinSuccess: "登录成功！",
  },
  es: {
    signupTitle: "Crear Cuenta",
    emailLabel: "Correo Electrónico",
    passwordLabel: "Contraseña",
    nameLabel: "Nombre Completo",
    createAccountBtn: "Crear Cuenta",
    cancelBtn: "Cancelar",
    success: "¡Cuenta creada! Bienvenido/a {name}",
    emailExists: "Correo electrónico ya registrado",
    weakPassword: "La contraseña debe tener al menos 6 caracteres",
    invalidEmail: "Dirección de correo electrónico no válida",
    allFieldsRequired: "Todos los campos son obligatorios",
    creatingAccount: "Creando...",
    signoutSuccess: "¡Sesión cerrada correctamente!",
    languageChanging: "Cambiando idioma...",
    passcodeLabel: "Código de patrocinio (Opcional)",
    passcodeHelp: "Dejar en blanco para una cuenta individual",
    alreadyHaveAccount: "¿Ya tienes una cuenta? Inicia sesión",
    invalidPasscode: "Código inválido o ya utilizado",

    signinTitle: "Iniciar Sesión",
    signinBtn: "Iniciar Sesión",
    forgotPassword: "¿Olvidó su contraseña?",
    noAccount: "¿No tiene una cuenta?",
    signupLink: "Registrarse",
    invalidCredentials: "Correo electrónico o contraseña inválidos",
    signingIn: "Iniciando sesión...",
    signinSuccess: "¡Sesión iniciada con éxito!",
  },
  hi: {
    signupTitle: "खाता बनाएं",
    emailLabel: "ईमेल",
    passwordLabel: "पासवर्ड",
    nameLabel: "पूरा नाम",
    createAccountBtn: "खाता बनाएं",
    cancelBtn: "रद्द करें",
    success: "खाता बन गया! स्वागत है {name}",
    emailExists: "ईमेल पहले से पंजीकृत है",
    weakPassword: "पासवर्ड कम से कम 6 अक्षरों का होना चाहिए",
    invalidEmail: "अमान्य ईमेल पता",
    allFieldsRequired: "सभी फ़ील्ड आवश्यक हैं",
    creatingAccount: "बना रहा है...",
    signoutSuccess: "सफलतापूर्वक साइन आउट!",
    languageChanging: "भाषा बदल रहा है...",
    passcodeLabel: "प्रायोजन कोड (वैकल्पिक)",
    passcodeHelp: "व्यक्तिगत खाते के लिए खाली छोड़ दें",
    alreadyHaveAccount: "पहले से खाता है? साइन इन करें",
    invalidPasscode: "अमान्य या पहले से उपयोग किया गया कोड",

    signinTitle: "साइन इन करें",
    signinBtn: "साइन इन करें",
    forgotPassword: "पासवर्ड भूल गए?",
    noAccount: "खाता नहीं है?",
    signupLink: "साइन अप करें",
    invalidCredentials: "अमान्य ईमेल या पासवर्ड",
    signingIn: "साइन इन हो रहा है...",
    signinSuccess: "सफलतापूर्वक साइन इन किया!",
  },
  ar: {
    signupTitle: "إنشاء حساب",
    emailLabel: "البريد الإلكتروني",
    passwordLabel: "كلمة المرور",
    nameLabel: "الاسم الكامل",
    createAccountBtn: "إنشاء حساب",
    cancelBtn: "إلغاء",
    success: "تم إنشاء الحساب! مرحبًا {name}",
    emailExists: "البريد الإلكتروني مسجل بالفعل",
    weakPassword: "يجب أن تكون كلمة المرور 6 أحرف على الأقل",
    invalidEmail: "عنوان بريد إلكتروني غير صالح",
    allFieldsRequired: "جميع الحقول مطلوبة",
    creatingAccount: "جاري الإنشاء...",
    signoutSuccess: "تم تسجيل الخروج بنجاح!",
    languageChanging: "جاري تغيير اللغة...",
    passcodeLabel: "كود الرعاية (اختياري)",
    passcodeHelp: "اتركه فارغًا لحساب فردي",
    alreadyHaveAccount: "هل لديك حساب بالفعل؟ تسجيل الدخول",
    invalidPasscode: "كود غير صالح أو مستخدم بالفعل",

    signinTitle: "تسجيل الدخول",
    signinBtn: "تسجيل الدخول",
    forgotPassword: "نسيت كلمة المرور؟",
    noAccount: "ليس لديك حساب؟",
    signupLink: "إنشاء حساب",
    invalidCredentials: "بريد إلكتروني أو كلمة مرور غير صالحة",
    signingIn: "جارٍ تسجيل الدخول...",
    signinSuccess: "تم تسجيل الدخول بنجاح!",
  },
};

// Get current language from existing system
function getCurrentLanguage() {
  return localStorage.getItem("preferredLanguage") || "en";
}

function translateAuth(key, replacements = {}) {
  const lang = getCurrentLanguage();
  let text = authTranslations[lang]?.[key] || authTranslations.en[key] || key;

  // Replace placeholders like {name}
  Object.keys(replacements).forEach((k) => {
    text = text.replace(`{${k}}`, replacements[k]);
  });

  return text;
}

async function handleSignupSubmit() {
  console.log("🔄 Handling sign-up form submission");

  // Get form values
  const email = document.getElementById("authEmail").value.trim();
  const password = document.getElementById("authPassword").value;
  const name = document.getElementById("authName").value.trim();
  const passcode = document.getElementById("authPasscode")?.value.trim() || "";

  // Basic validation
  if (!email || !password || !name) {
    alert(getAuthTranslation("allFieldsRequired", "Please fill in all fields"));
    return;
  }

  // Disable button and show loading
  const submitBtn = document.getElementById("authSubmit");
  const originalText = submitBtn.textContent;
  submitBtn.disabled = true;
  submitBtn.innerHTML =
    '<span style="display:inline-block; width:16px; height:16px; border:2px solid rgba(255,255,255,0.3); border-radius:50%; border-top-color:white; animation:spin 1s linear infinite; margin-right:8px;"></span> Creating...';

  try {
    let accountType = "individual";
    let sponsorId = null;
    let passcodeId = null;
    let planType = "free";
    let subscriptionExpiry = null;

    // STEP 1: Validate passcode if provided
    if (passcode) {
      console.log("🔍 Validating passcode:", passcode);
      const passcodeValidation = await validatePasscode(passcode);

      if (passcodeValidation && passcodeValidation.isValid) {
        accountType = "sponsored";
        sponsorId = passcodeValidation.sponsorId;
        passcodeId = passcodeValidation.passcodeId;
        planType = passcodeValidation.planType || "premium";

        // Get expiry date
        if (passcodeValidation.expiresAt) {
          subscriptionExpiry = passcodeValidation.expiresAt.toDate
            ? passcodeValidation.expiresAt.toDate().toISOString()
            : new Date(passcodeValidation.expiresAt).toISOString();
        }

        console.log("✅ Valid passcode, creating sponsored account");
      } else {
        alert(
          passcodeValidation?.message ||
            getAuthTranslation("invalidPasscode", "Invalid passcode"),
        );
        resetButton(submitBtn, originalText);
        return;
      }
    }

    // STEP 2: Create user account
    console.log("📝 Creating account for:", email);
    const result = await window.createUserAccount(email, password, name);

    // Before calling createUserProfile
    console.log("🔐 Current auth state:", window.fb?.auth?.currentUser?.uid);
    console.log(
      "🔐 usersAuth state:",
      window.usersAuth?.auth?.currentUser?.uid,
    );

    // STEP 3: Create user profile (with timeout — Firestore SDK hangs on iOS)
    try {
      await Promise.race([
        createUserProfile(result.uid, {
          email: email,
          name: name,
          accountType: accountType,
          sponsorId: sponsorId,
          passcodeId: passcodeId,
          planType: planType,
          subscriptionType: planType === "free" ? "free" : "premium",
          subscriptionExpiry: subscriptionExpiry,
          createdAt: new Date().toISOString(),
          hasActiveSubscription: planType !== "free",
          maxImagesPerReport: 5,
          isPremium: planType !== "free",
          premium: planType !== "free",
          userType: accountType,
        }),
        new Promise((_, r) =>
          setTimeout(() => r(new Error("profile timeout (3s)")), 3000)
        ),
      ]);
      console.log("✅ Profile written to Firestore");
    } catch (profileErr) {
      console.warn("⚠️ Profile write skipped/timed out:", profileErr.message);
    }

    // STEP 4: Mark passcode as used if sponsored (non-critical - don't break signup)
    if (passcodeId && accountType === "sponsored") {
      try {
        const marked = await markPasscodeAsUsed(
          passcodeId,
          result.uid,
          sponsorId,
        );
        if (!marked) {
          console.warn(
            "⚠️ Passcode not marked as used, but signup completed successfully",
          );
          // You might want to log this for admin review
        }
      } catch (passcodeError) {
        console.warn("⚠️ Could not mark passcode as used:", passcodeError);
        // Non-critical error - user is still created
      }
    }

    // SUCCESS!
    alert(
      getAuthTranslation(
        "success",
        "Account created successfully! Welcome {name}",
      ).replace("{name}", name),
    );

    // Close form and redirect
    closeAuthForm();
    setTimeout(() => {
      window.location.href = "/dashboard.html";
    }, 1000);
  } catch (error) {
    console.error("❌ Sign-up error:", error);

    // Handle errors
    let errorMessage = getAuthTranslation(
      "signupFailed",
      "Sign-up failed. Please try again.",
    );

    if (error && error.code) {
      if (error.code === "auth/email-already-in-use") {
        errorMessage = getAuthTranslation(
          "emailExists",
          "Email already registered",
        );
      } else if (error.code === "auth/weak-password") {
        errorMessage = getAuthTranslation(
          "weakPassword",
          "Password too weak (min 6 chars)",
        );
      } else if (error.message) {
        errorMessage = error.message;
      }
    }

    alert(errorMessage);
    resetButton(submitBtn, originalText);
  }
}

// Helper function to reset button
function resetButton(button, originalText) {
  button.disabled = false;
  button.textContent = originalText;
}

function setupLogout() {
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.onclick = async function () {
      try {
        // ✅ ADD THIS - Save current language before sign out
        const currentLang =
          localStorage.getItem("userLanguage") ||
          localStorage.getItem("appLanguage") ||
          "en";
        localStorage.setItem("preSignoutLanguage", currentLang);
        console.log("📝 Saved language before sign out:", currentLang);

        // 🧹 Clear cached email recipient so next session starts fresh
        try {
          localStorage.removeItem("lastEmailRecipient");
          console.log("🧹 Cleared lastEmailRecipient on sign-out");
        } catch (e) {}

        await window.fb.auth.signOut();
        alert(getAuthTranslation("signoutSuccess", "Signed out successfully"));
        updateUIAfterAuth();
        setTimeout(() => location.reload(), 500);
      } catch (error) {
        console.error("Logout error:", error);
      }
    };
    console.log("✅ Logout button setup");
  }
}

function showSignupForm() {
  console.log("📝 Showing sign-up form");

  // ✅ Remove any existing form to prevent duplicates
  const existing = document.getElementById("authFormContainer");
  if (existing) {
    console.log("🗑️ Removed existing form");
    existing.remove();
  }

  const formHTML = `
    <div id="authFormOverlay" style="position:fixed; top:0; left:0; right:0; bottom:0; background:rgba(0,0,0,0.5); z-index:10000; display:flex; align-items:center; justify-content:center;">
      <div style="background:white; padding:25px; border-radius:10px; width:350px; max-width:90vw;">
        <h3 style="margin-top:0;">${getAuthTranslation("signupTitle")}</h3>
        
        <div style="margin-bottom:15px;">
          <div style="margin-bottom:5px;">${getAuthTranslation(
            "emailLabel",
          )}</div>
          <input type="email" id="authEmail" placeholder="your@email.com"
                 autocapitalize="none" autocorrect="off" spellcheck="false"
                 inputmode="email" autocomplete="email"
                 style="width:100%; padding:10px; border:1px solid #ddd; border-radius:4px;">
        </div>
        
        <div style="margin-bottom:15px;">
          <div style="margin-bottom:5px;">${getAuthTranslation(
            "passwordLabel",
          )}</div>
          <div style="position:relative;">
            <input type="password" id="authPassword" placeholder="••••••••" 
                   style="width:100%; padding:10px 44px 10px 10px; border:1px solid #ddd; border-radius:4px; box-sizing:border-box;">
            <button type="button" onclick="togglePasswordVisibility('authPassword', this)" 
                    style="position:absolute; right:8px; top:50%; transform:translateY(-50%); background:none; border:none; font-size:18px; cursor:pointer; padding:0; color:#666;">👁</button>
          </div>
        </div>
        
        <div style="margin-bottom:20px;">
          <div style="margin-bottom:5px;">${getAuthTranslation(
            "nameLabel",
          )}</div>
          <input type="text" id="authName" placeholder="John Doe" 
                 style="width:100%; padding:10px; border:1px solid #ddd; border-radius:4px;">
        </div>
        
        <div style="display:flex; gap:10px;">
          <button id="authSubmit" style="flex:1; padding:12px; background:#007bff; color:white; border:none; border-radius:4px; cursor:pointer;">
            ${getAuthTranslation("createAccountBtn")}
          </button>
          <button onclick="closeAuthForm()" style="flex:1; padding:12px; background:#6c757d; color:white; border:none; border-radius:4px; cursor:pointer;">
            ${getAuthTranslation("cancelBtn")}
          </button>
        </div>
        
        <div style="margin-top:15px; text-align:center; font-size:14px;">
          <a href="#" onclick="showSigninForm(); closeAuthForm(); return false;" style="color:#007bff;">
            ${getAuthTranslation("alreadyHaveAccount")}
          </a>
        </div>
      </div>
    </div>
  `;

  const formContainer = document.createElement("div");
  formContainer.innerHTML = formHTML;
  formContainer.id = "authFormContainer";
  document.body.appendChild(formContainer);


  const submitBtn = document.getElementById("authSubmit");
  if (submitBtn) {
    submitBtn.addEventListener("click", handleSignupSubmit);
  }
}

// ============================================
// SIGN IN HANDLER
// ============================================
// ============================================
// SIGN IN HANDLER (TOP LEVEL)
// ============================================
async function handleSigninSubmit(e) {
    if (e) e.preventDefault();
    
    // Get the form container
    const container = document.getElementById("authFormContainer");
    if (!container) {
        console.error("❌ Form container not found");
        return;
    }
    
    const emailInput = container.querySelector("#signinEmail");
    const passwordInput = container.querySelector("#signinPassword");
    
    const email = emailInput ? emailInput.value.trim() : "";
    const password = passwordInput ? passwordInput.value.trim() : "";
    
    if (!email || !password) {
        alert("Please enter email and password");
        return;
    }
    
    const submitBtn = document.getElementById("signinSubmit");
    submitBtn.disabled = true;
    submitBtn.textContent = getAuthTranslation("signingIn", "Signing in...");
    
    try {
        console.log("📧 Attempting sign in for:", email);
        
        // ✅ Use Firebase REST API directly
        const apiKey = "AIzaSyB3Kpbz7CWUP1Vj3bUHa6Uxv6kWqi2ouH0";
        const url = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`;
        
        console.log("📡 Calling Firebase REST API...");
        
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email: email,
                password: password,
                returnSecureToken: true
            })
        });
        
        const data = await response.json();
        
        if (data.error) {
            throw new Error(data.error.message || "Authentication failed");
        }
        
        console.log("✅ Sign-in successful!");
        console.log("🔍 User:", data.email);

        // 🔧 Mark that we JUST signed in, so dashboard can restore the correct language once
        try { localStorage.setItem("justSignedIn", "true"); } catch (e) {}

        // 🧹 Clear cached email recipient so the first share of this session starts clean
        try {
          localStorage.removeItem("lastEmailRecipient");
          console.log("🧹 Cleared lastEmailRecipient on sign-in");
        } catch (e) {}
        
        // Save user data
        const userData = {
            uid: data.localId,
            email: data.email,
            displayName: data.displayName || email.split("@")[0],
            idToken: data.idToken,
            refreshToken: data.refreshToken,
            signedIn: true
        };
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('isSignedIn', 'true');
        
        // ✅ Force UI update
        if (typeof updateUIAfterSignIn === 'function') {
            updateUIAfterSignIn(userData);
        }

        // Repair any missing fields in the Firestore user doc
        try {
            await repairUserProfile(userData.uid, userData.idToken, userData.email, userData.displayName);
        } catch (repairErr) {
            console.warn("Repair call failed (non-critical):", repairErr.message);
        }
        
        const currentLang = localStorage.getItem("appLanguage") ||
        localStorage.getItem("userLanguage") || "en";
        console.log("🌐 Language:", currentLang);
        
        alert(getAuthTranslation("signinSuccess", "Signed in successfully!"));
        closeAuthForm();
        window.location.href = window.location.href;
        
    } catch (error) {
        console.error("❌ Sign-in error:", error);
        console.error("❌ Error message:", error.message);
        
        // Show a user-friendly error message
        const _errCode = (error.message || "").toUpperCase();
        const _lang = (localStorage.getItem("appLanguage") ||
                       localStorage.getItem("userLanguage") ||
                       "en").toLowerCase().slice(0, 2);

        // Error messages in all 6 supported languages
        const _messages = {
            invalidCredentials: {
                en: "Invalid email or password. Please check and try again.",
                vi: "Email hoặc mật khẩu không đúng. Vui lòng kiểm tra và thử lại.",
                zh: "邮箱或密码错误。请检查后重试。",
                es: "Correo o contraseña incorrectos. Verifique e intente nuevamente.",
                hi: "ईमेल या पासवर्ड गलत है। कृपया जाँच कर पुनः प्रयास करें।",
                ar: "البريد الإلكتروني أو كلمة المرور غير صحيحة. يرجى التحقق والمحاولة مرة أخرى."
            },
            invalidEmail: {
                en: "Please enter a valid email address.",
                vi: "Vui lòng nhập địa chỉ email hợp lệ.",
                zh: "请输入有效的电子邮箱地址。",
                es: "Por favor ingrese un correo electrónico válido.",
                hi: "कृपया एक मान्य ईमेल पता दर्ज करें।",
                ar: "يرجى إدخال عنوان بريد إلكتروني صالح."
            },
            userDisabled: {
                en: "This account has been disabled. Please contact support.",
                vi: "Tài khoản này đã bị vô hiệu hóa. Vui lòng liên hệ hỗ trợ.",
                zh: "此账户已被禁用。请联系支持。",
                es: "Esta cuenta ha sido deshabilitada. Contacte a soporte.",
                hi: "यह खाता अक्षम कर दिया गया है। कृपया सहायता से संपर्क करें।",
                ar: "تم تعطيل هذا الحساب. يرجى الاتصال بالدعم."
            },
            tooManyAttempts: {
                en: "Too many failed attempts. Please try again in a few minutes.",
                vi: "Quá nhiều lần thử thất bại. Vui lòng thử lại sau vài phút.",
                zh: "失败次数过多。请在几分钟后重试。",
                es: "Demasiados intentos fallidos. Intente nuevamente en unos minutos.",
                hi: "बहुत अधिक असफल प्रयास। कृपया कुछ मिनटों में पुनः प्रयास करें।",
                ar: "محاولات فاشلة كثيرة. يرجى المحاولة مرة أخرى بعد بضع دقائق."
            },
            network: {
                en: "Network error. Please check your internet connection.",
                vi: "Lỗi mạng. Vui lòng kiểm tra kết nối internet.",
                zh: "网络错误。请检查您的互联网连接。",
                es: "Error de red. Verifique su conexión a internet.",
                hi: "नेटवर्क त्रुटि। कृपया अपना इंटरनेट कनेक्शन जांचें।",
                ar: "خطأ في الشبكة. يرجى التحقق من اتصالك بالإنترنت."
            },
            generic: {
                en: "Sign-in failed. Please try again.",
                vi: "Đăng nhập thất bại. Vui lòng thử lại.",
                zh: "登录失败。请重试。",
                es: "Error al iniciar sesión. Intente nuevamente.",
                hi: "साइन-इन विफल। कृपया पुनः प्रयास करें।",
                ar: "فشل تسجيل الدخول. يرجى المحاولة مرة أخرى."
            }
        };

        const _pick = (key) => {
            const variants = _messages[key] || _messages.generic;
            return variants[_lang] || variants.en;
        };

        let errorMessage;
        // Firebase's current code (2024+) — same for both wrong email AND wrong password
        if (_errCode.includes("INVALID_LOGIN_CREDENTIALS") ||
            _errCode.includes("EMAIL_NOT_FOUND") ||
            _errCode.includes("INVALID_PASSWORD") ||
            _errCode.includes("WRONG_PASSWORD") ||
            _errCode.includes("INVALID_PASSWORD")) {
            errorMessage = _pick("invalidCredentials");
        } else if (_errCode.includes("INVALID_EMAIL")) {
            errorMessage = _pick("invalidEmail");
        } else if (_errCode.includes("USER_DISABLED")) {
            errorMessage = _pick("userDisabled");
        } else if (_errCode.includes("TOO_MANY_ATTEMPTS")) {
            errorMessage = _pick("tooManyAttempts");
        } else if (_errCode.includes("NETWORK")) {
            errorMessage = _pick("network");
        } else {
            errorMessage = _pick("generic");
        }

        console.log("📢 Showing error:", errorMessage);
        alert(errorMessage);
        submitBtn.disabled = false;
        submitBtn.textContent = getAuthTranslation("signIn", "Sign In");
    }
}

// ============================================
// SHOW SIGN-IN FORM (TOP LEVEL - OUTSIDE)
// ============================================
function showSigninForm() {
    console.log("🔐 Showing sign-in form");
    
    // ✅ Remove any existing form first
    const existingForm = document.getElementById("authFormContainer");
    if (existingForm) {
        existingForm.remove();
        console.log("🗑️ Removed existing form");
    }
    
    const existingOverlay = document.getElementById("authFormOverlay");
    if (existingOverlay) {
        existingOverlay.remove();
        console.log("🗑️ Removed existing overlay");
    }
    
    console.log("🟢 Form created at:", Date.now());
    
    const formHTML = `
    <div id="authFormOverlay" style="position:fixed; top:0; left:0; right:0; bottom:0; background:rgba(0,0,0,0.5); z-index:10000; display:flex; align-items:center; justify-content:center;">
      <div style="background:white; padding:25px; border-radius:10px; width:350px; max-width:90vw;">
        <h3 style="margin-top:0;">${getAuthTranslation("signinTitle", "Sign In")}</h3>
        
        <div style="margin-bottom:15px;">
          <div style="margin-bottom:5px;">${getAuthTranslation("emailLabel", "Email Address")}</div>
          <input type="email" id="signinEmail" placeholder="your@email.com"
                 autocapitalize="none" autocorrect="off" spellcheck="false"
                 inputmode="email" autocomplete="email"
                 style="width:100%; padding:10px; border:1px solid #ddd; border-radius:4px;">
        </div>
        
        <div style="margin-bottom:20px;">
          <div style="margin-bottom:5px;">${getAuthTranslation("passwordLabel", "Password")}</div>
          <div style="position:relative;">
            <input type="password" id="signinPassword" placeholder="••••••••" 
                   style="width:100%; padding:10px 44px 10px 10px; border:1px solid #ddd; border-radius:4px; box-sizing:border-box;">
            <button type="button" onclick="togglePasswordVisibility('signinPassword', this)" 
                    style="position:absolute; right:8px; top:50%; transform:translateY(-50%); background:none; border:none; font-size:18px; cursor:pointer; padding:0; color:#666;">👁</button>
          </div>
        </div>
        
        <div style="display:flex; gap:10px;">
          <button id="signinSubmit" type="button" style="flex:1; padding:12px; background:#28a745; color:white; border:none; border-radius:4px; cursor:pointer;">
            ${getAuthTranslation("signinBtn", "Sign In")}
          </button>
          <button onclick="closeAuthForm()" style="flex:1; padding:12px; background:#6c757d; color:white; border:none; border-radius:4px; cursor:pointer;">
            ${getAuthTranslation("cancelBtn", "Cancel")}
          </button>
        </div>
        
        <div style="margin-top:15px; text-align:center; font-size:14px;">
          <a href="#" onclick="showSignupForm(); closeAuthForm(); return false;" style="color:#007bff;">
            ${getAuthTranslation("noAccount", "Don't have an account?")} 
            ${getAuthTranslation("signupLink", "Sign Up")}
          </a>
        </div>
      </div>
    </div>
  `;
    
    const formContainer = document.createElement("div");
    formContainer.innerHTML = formHTML;
    formContainer.id = "authFormContainer";
    document.body.appendChild(formContainer);
    
    // DEBUG logs
    console.log("🔍 signinSubmit button exists?", !!document.getElementById("signinSubmit"));
    console.log("🔍 handleSigninSubmit is function?", typeof window.handleSigninSubmit === 'function');
    
    // ✅ ATTACH DIRECT CLICK HANDLER
    const submitBtn = document.getElementById("signinSubmit");
    if (submitBtn) {
        submitBtn.onclick = null;
        submitBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log("🔄 Direct click handler triggered");
            window.handleSigninSubmit(e);
        });
        console.log("✅ Direct click handler attached");
    }
    
    console.log("✅ Sign In form created with onclick handler");
}

// ============================================
// CLOSE AUTH FORM (TOP LEVEL - OUTSIDE)
// ============================================

function closeAuthForm() {
    const container = document.getElementById("authFormContainer");
    if (container) container.remove();
    const overlay = document.getElementById("authFormOverlay");
    if (overlay && overlay.parentElement) overlay.parentElement.remove();
}

    // ========== 2. SIMPLE BUTTON SETUP ==========
    function setupSignUpButton() {
        // ============================================
        // SET UP SIGN-UP BUTTON (idempotent — clones to drop old listeners)
        // ============================================
        const signUpBtn = document.getElementById("usersSignUpBtn");
        if (signUpBtn) {
            const fresh = signUpBtn.cloneNode(true);
            signUpBtn.parentNode.replaceChild(fresh, signUpBtn);
            fresh.addEventListener('click', function(e) {
                e.preventDefault();
                console.log("📝 Sign Up button clicked via addEventListener");
                showSignupForm();
            });
            console.log("✅ Sign Up button setup complete");
        } else {
            console.warn("⚠️ usersSignUpBtn not found");
        }
        
        // ============================================
        // SET UP SIGN-IN BUTTON (idempotent)
        // ============================================
        const signInBtn = document.getElementById("usersSignInBtn");
        if (signInBtn) {
            const fresh = signInBtn.cloneNode(true);
            signInBtn.parentNode.replaceChild(fresh, signInBtn);
            fresh.addEventListener('click', function(e) {
                e.preventDefault();
                console.log("🖱️ Sign In button clicked via addEventListener");
                showSigninForm();
            });
            console.log("✅ Sign In button setup complete");
        } else {
            console.warn("⚠️ usersSignInBtn not found");
        }
    }
    
    // ========== 3. INITIALIZE ==========
    setTimeout(setupSignUpButton, 2000);
    console.log("🚀 Simple users-auth.js loaded");
    
    // ========== SIMPLE UI UPDATE ==========
    // ========== FIXED UI UPDATE FUNCTION ==========
    // ========== SIMPLE UI UPDATE ==========
function updateUIAfterAuth() {
  console.log("🔄 SIMPLE UI Update called");

  // ✅ Check localStorage for user (REST API auth)
  const localUser = localStorage.getItem('user');
  const isSignedIn = localStorage.getItem('isSignedIn') === 'true' && !!localUser;
  
  console.log("User status:", isSignedIn ? "SIGNED IN" : "SIGNED OUT");
  console.log("isSignedIn flag:", localStorage.getItem('isSignedIn'));

  if (isSignedIn) {
    const authButtons = document.getElementById("usersAuthButtons");
    const userControls = document.getElementById("userControls");

    if (authButtons) authButtons.style.display = "none";
    if (userControls) userControls.style.display = "flex";
    document.body.classList.add("user-signed-in");
    document.body.classList.remove("user-signed-out");
  } else {
    const authButtons = document.getElementById("usersAuthButtons");
    const userControls = document.getElementById("userControls");

    if (authButtons) authButtons.style.display = "flex";
    if (userControls) userControls.style.display = "none";
    document.body.classList.add("user-signed-out");
    document.body.classList.remove("user-signed-in");
  }
}

    // ========== SYNC LANGUAGE SWITCHERS ==========
    function syncLanguageSwitchers() {
        const guestSwitcher = document.getElementById("usersLanguageSwitcher");
        const userSwitcher = document.getElementById("language-switcher");
        const currentLang = localStorage.getItem("appLanguage") || "en";
        
        if (guestSwitcher) guestSwitcher.value = currentLang;
        if (userSwitcher) userSwitcher.value = currentLang;
        
        console.log("✅ Synced language switchers to:", currentLang);
    }
    
    // Also call once on page load
    setTimeout(updateUIAfterAuth, 3000);
    
    // ========== SIMPLE LOGOUT ==========
    function setupLogout() {
        const logoutBtn = document.getElementById("logoutBtn");
        if (logoutBtn) {
            logoutBtn.onclick = async function () {
                // 🔒 CONFIRMATION DIALOG
                const lang =
                localStorage.getItem("userLanguage") ||
                localStorage.getItem("appLanguage") ||
                "en";
                const confirmMessages = {
                    en: "Are you sure you want to log out? Please be sure to save your report before logging out.",
                    vi: "Bạn có chắc chắn muốn đăng xuất? Vui lòng lưu báo cáo của bạn trước khi đăng xuất.",
                    zh: "您确定要退出吗？请确保在退出前保存您的报告。",
                    es: "¿Estás seguro de que quieres cerrar sesión? Asegúrate de guardar tu informe antes de cerrar sesión.",
                    hi: "क्या आप वाकई लॉगआउट करना चाहते हैं? कृपया लॉगआउट करने से पहले अपनी रिपोर्ट सहेज लें।",
                    ar: "هل أنت متأكد من أنك تريد تسجيل الخروج؟ يرجى التأكد من حفظ تقريرك قبل تسجيل الخروج.",
                };
                const confirmMessage = confirmMessages[lang] || confirmMessages.en;
                
                if (!confirm(confirmMessage)) {
                    console.log("❌ Logout cancelled by user");
                    return;
                }
                
                try {
                    // ✅ Clear saved form data on logout
                    localStorage.removeItem("reportFormData");
                    console.log("🗑️ Form data cleared on logout");
                    
                    const currentLang =
                        localStorage.getItem("userLanguage") ||
                        localStorage.getItem("appLanguage") ||
                        "en";
                    localStorage.setItem("preSignoutLanguage", currentLang);
                    console.log("📝 Saved language before sign out:", currentLang);
                    
                    // ✅ Clear localStorage instead of Firebase signOut
                    localStorage.removeItem('user');
                    localStorage.removeItem('isSignedIn');
                    localStorage.removeItem('avatarUrl');
                    console.log("🗑️ User data cleared from localStorage");
                    
                    // Force UI update
                    if (typeof updateUIAfterAuth === 'function') {
                        updateUIAfterAuth();
                    }
                    if (typeof fixButtonVisibility === 'function') {
                        fixButtonVisibility();
                    }
                    
                    alert(getAuthTranslation("signoutSuccess", "Signed out successfully"));
                    setTimeout(() => location.reload(), 500);
                    
                } catch (error) {
                    console.error("Logout error:", error);
                }
            };
            console.log("✅ Logout button setup");
        }
    }
    
    setTimeout(setupLogout, 3500);
    
    // ========== INITIALIZATION ==========
    function waitForFirebase(callback) {
        // Safety check: Ensure callback is a function
        if (callback && typeof callback !== "function") {
            console.error("❌ waitForFirebase: callback is not a function:", callback);
            return;
        }
        
        if (window.fb && window.fb.auth) {
            console.log("✅ Firebase ready");
            if (callback && typeof callback === "function") {
                callback(); // Safe call
            }
        } else {
            console.log("⏳ Waiting for Firebase...");
            setTimeout(() => waitForFirebase(callback), 500);
        }
    }
    
    // ========== UPDATED INITIALIZATION ==========
    // ========== SINGLE AUTH LISTENER (SEPARATE FUNCTION) ==========
    function setupAuthListener() {
        if (window.fb && window.fb.auth) {
            console.log("🎯 Setting up SINGLE auth listener");
            
            window.fb.auth.onAuthStateChanged((user) => {
                console.log("🔐 Auth state changed - User:", user ? user.email : "None");
                
                fixButtonVisibility();
                setTimeout(fixButtonVisibility, 200);
                setTimeout(fixButtonVisibility, 500);
                
                if (user) {
                    document.body.classList.add("user-signed-in");
                    document.body.classList.remove("user-signed-out");
                } else {
                    document.body.classList.add("user-signed-out");
                    document.body.classList.remove("user-signed-in");
                }
            });
            
            return true;
        }
        return false;
    }
    
    // ========== MAIN INITIALIZATION ==========
    function initializeAllAuth() {
        console.log("🔧 Initializing auth system...");
        
        // Setup the SINGLE auth listener
        if (!setupAuthListener()) {
            console.warn("⚠️ Firebase not ready, retrying...");
            setTimeout(initializeAllAuth, 1000);
            return;
        }
        
        // Setup buttons
        setupSignUpButton();
        setupLogout();
        
        // Initial UI update
        fixButtonVisibility();
        
        console.log("✅ Auth system initialized");
    }
    
    // ========== ULTRA-RELIABLE START ==========
    let retryCount = 0;
    function startAuthSystem() {
        if (window.fb && window.fb.auth) {
            console.log("✅ Firebase is ready, starting auth system");
            initializeAllAuth();
            
            // EXTRA: Force update after everything loads
            setTimeout(updateUIAfterAuth, 2000);
            setTimeout(updateUIAfterAuth, 5000);
        } else if (retryCount < 10) {
            retryCount++;
            console.log(`⏳ Waiting for Firebase... (attempt ${retryCount})`);
            setTimeout(startAuthSystem, 500);
        } else {
            console.error("❌ Firebase never loaded, but continuing anyway");
            // Still try to setup buttons
            setupSignUpButton();
            setupLogout();
        }
    }
    
    // Start immediately
    startAuthSystem();
    
    // Also run on page load
    window.addEventListener("DOMContentLoaded", function () {
        console.log("📄 DOM loaded, checking auth");
        setTimeout(updateUIAfterAuth, 1000);
    });
    
    // And run on window load
    window.addEventListener("load", function () {
        console.log("🚀 Window fully loaded, checking auth");
        setTimeout(updateUIAfterAuth, 1500);
        
        // ========== IMMEDIATE DEBUG ==========
        console.log("🔍 DEBUG START ==========");
        
        // Check Firebase auth state
        console.log("Firebase user exists?", !!window.fb?.auth?.currentUser);
        console.log("User email:", window.fb?.auth?.currentUser?.email);
        
        // Check UI elements
        console.log(
                    "Auth buttons element:",
                    document.getElementById("usersAuthButtons"),
                    );
        console.log(
                    "User controls element:",
                    document.getElementById("userControls"),
                    );
        
        // Check display styles
        const authButtons = document.getElementById("usersAuthButtons");
        const userControls = document.getElementById("userControls");
        if (authButtons)
            console.log("Auth buttons display:", authButtons.style.display);
        if (userControls)
            console.log("User controls display:", userControls.style.display);
        
        // Force manual update (try this in browser console too)
        console.log("🔍 DEBUG END ==========");
        
        // Temporary force fix - uncomment if needed
        // if (window.fb?.auth?.currentUser) {
        //   const authButtons = document.getElementById("usersAuthButtons");
        //   const userControls = document.getElementById("userControls");
        //   if (authButtons) authButtons.style.display = "none";
        //   if (userControls) userControls.style.display = "flex";
        // }
    });
    // ========== START EVERYTHING ==========
    
    // ========== SIMPLE LANGUAGE SWITCHER ==========
    // ========== HYBRID LANGUAGE SYSTEM ==========
    // ============================================
    // DELETED: Conflicting language system
    // Now using unified system from reports.js
    // ============================================
    /*
     setTimeout(function () {
     console.log("🌐 Setting up hybrid language system...");
     
     // Get both switchers
     const guestSwitcher = document.getElementById("usersLanguageSwitcher");
     const userSwitcher = document.getElementById("language-switcher");
     const currentLang = localStorage.getItem("appLanguage") || "en";
     
     // Set initial values
     if (guestSwitcher) guestSwitcher.value = currentLang;
     if (userSwitcher) userSwitcher.value = currentLang;
     
     // Function to handle language change - DIFFERENT FOR GUESTS VS USERS
     function handleLanguageChange(newLang) {
     console.log("🔄 Changing language to:", newLang);
     localStorage.setItem("userLanguage", newLang);
     localStorage.setItem("appLanguage", newLang);
     
     // Call setLanguage to update all UI
     if (typeof setLanguage === "function") {
     setLanguage(newLang);
     }
     
     // Show confirmation
     const messages = {
     en: "Language changed to English",
     vi: "Đã chuyển sang Tiếng Việt",
     zh: "已切换到中文",
     es: "Cambiado a Español",
     hi: "हिन्दी में बदला गया",
     ar: "تم التغيير إلى العربية",
     };
     alert(messages[newLang] || "Language changed");
     
     // Optional: reload to ensure everything is fresh
     // window.location.reload();
     }
     
     // Setup event listeners - CHECK IF USER IS SIGNED IN
     if (guestSwitcher) {
     guestSwitcher.onchange = function () {
     handleLanguageChange(this.value);
     };
     }
     
     if (userSwitcher) {
     userSwitcher.onchange = function () {
     handleLanguageChange(this.value);
     };
     }
     
     console.log("✅ Hybrid language system ready");
     }, 2000);
     */
    // Helper 1: Validate a passcode
    // users-auth.js - USE THE FIRESTORE FROM window.usersAuth
    // users-auth.js - NO IMPORT STATEMENTS AT THE TOP
    
    async function validatePasscode(code) {
        try {
            console.log(`🔍 Validating passcode: ${code}`);

            let passcodeToValidate = code.trim();
            if (code.includes("|")) {
                passcodeToValidate = code.split("|")[0].trim();
            }
            console.log(`🔍 Extracted passcode: ${passcodeToValidate}`);

            // 🔧 REST-based lookup — Firestore SDK hangs on iOS WKWebView
            const projectId = "connectionsfinder-app";
            const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/pass_codes/${encodeURIComponent(passcodeToValidate)}`;

            const resp = await fetch(url);
            if (!resp.ok) {
                console.log("❌ Passcode not found (REST status:", resp.status, ")");
                return {
                    isValid: false,
                    message: "Passcode not found. Please check and try again.",
                };
            }

            const doc = await resp.json();
            if (!doc || !doc.fields) {
                return {
                    isValid: false,
                    message: "Passcode not found. Please check and try again.",
                };
            }

            // Parse Firestore REST fields
            const fields = doc.fields;
            const isUsed = fields.used?.booleanValue === true ||
                          fields.isUsed?.booleanValue === true;

            if (isUsed) {
                return {
                    isValid: false,
                    message: "This passcode has already been used.",
                };
            }

            // Check expiry
            const expiresAtRaw =
                fields.expiresAt?.timestampValue || fields.expiresAt?.stringValue;
            if (expiresAtRaw) {
                const expiryDate = new Date(expiresAtRaw);
                if (expiryDate < new Date()) {
                    return {
                        isValid: false,
                        message: "This passcode has expired.",
                    };
                }
            }

            // Extract sponsor info
            const sponsorId = fields.createdBy?.stringValue || null;
            const planType = fields.plan?.stringValue || "bulk";
            const isBulk = fields.isBulk?.booleanValue === true;
            const orgEmail = fields.organizationEmail?.stringValue || "";

            console.log("✅ Passcode valid");
            return {
                isValid: true,
                passcodeId: passcodeToValidate,
                sponsorId: sponsorId,
                planType: planType,
                isBulk: isBulk,
                organizationEmail: orgEmail,
                expiresAt: expiresAtRaw,
            };
        } catch (error) {
            console.error("❌ Passcode validation error:", error);
            return {
                isValid: false,
                message:
                    "Unable to validate passcode. Please try again or contact support.",
            };
        }
    }
    
    // Helper function to validate passcode data
    function validatePasscodeData(passcodeData, passcodeId) {
        console.log("✅ Passcode found:", passcodeData);
        
        // Check if already used
        if (passcodeData.isUsed === true) {
            return {
                isValid: false,
                message: "This passcode has already been used.",
            };
        }
        
        // Check expiry
        const expiryDate = passcodeData.expiresAt?.toDate
        ? passcodeData.expiresAt.toDate()
        : new Date(passcodeData.expiresAt);
        
        const now = new Date();
        
        if (expiryDate < now) {
            return {
                isValid: false,
                message: "This passcode has expired.",
            };
        }
        
        // All checks passed
        return {
            isValid: true,
            passcodeId: passcodeId,
            sponsorId: passcodeData.sponsorId,
            planType: passcodeData.planType || "bulk",
            expiresAt: passcodeData.expiresAt,
        };
    }
    
    async function testPasscodeSave() {
        // Create a test passcode
        const testPasscodes = [
                               {
                                   code: "TEST-CONN-12345",
                                   createdAt: new Date().toISOString(),
                                   expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
                                   isUsed: false,
                                   planType: "bulk",
                               },
                               ];
        
        const user = window.fb?.auth?.currentUser;
        if (!user) {
            console.error("❌ No user logged in");
            return;
        }
        
        try {
            // Call the new save method
            await window.premiumManager.savePasscodesToFirestore(
                                                                 user.uid,
                                                                 testPasscodes,
                                                                 { planType: "bulk", orderId: "TEST_ORDER" },
                                                                 );
            
            console.log("✅ Test passcode saved to Firestore");
            
            // Try to validate it
            const result = await validatePasscode("TEST-CONN-12345");
            console.log("🔍 Validation result:", result);
        } catch (error) {
            console.error("❌ Test failed:", error);
        }
    }
    
    // Run in console: testPasscodeSave()
    // Other functions in users-auth.js (NO imports)
    
    // Helper 2: Create user profile in Firestore
    async function createUserProfile(userId, userData) {
        console.log("🔄 Creating user profile for:", userId);
        
        try {
            // Import Firebase
            const { initializeApp, getApps } =
            await import("https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js");
            const { getFirestore, doc, setDoc } =
            await import("https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js");
            
            // 🔥 FIX: Get or create Firebase app
            let firebaseApp;
            
            // Check existing apps
            const apps = getApps();
            
            // Try to find the main app first
            if (apps.length > 0) {
                // Use the first (default) app
                firebaseApp = apps[0];
                console.log("✅ Using existing Firebase app:", firebaseApp.name);
            }
            // If no app exists, initialize one
            else {
                const firebaseConfig = {
                    apiKey: "AIzaSyB3Kpbz7CWUP1Vj3bUHa6Uxv6kWqi2ouH0",
                    authDomain: "connectionsfinder.com",
                    projectId: "connectionsfinder-app",
                    storageBucket: "connectionsfinder-app.firebasestorage.app",
                    messagingSenderId: "503658774852",
                    appId: "1:503658774852:web:6ef3a8f506f36ca2c3d711",
                };
                
                firebaseApp = initializeApp(firebaseConfig);
                console.log("✅ Created new Firebase app for profile");
            }
            
            const db = getFirestore(firebaseApp);
            
            // Base sanitized data
            const sanitizedData = {
                email: userData.email || "",
                name: userData.name || "",
                displayName: userData.displayName || userData.name || "",
                accountType: userData.accountType || "individual",
                createdAt: new Date().toISOString(),
                lastActive: new Date().toISOString(),
                status: "active",
                // Only include if they exist
                ...(userData.sponsorId && { sponsorId: userData.sponsorId }),
                ...(userData.passcodeId && { passcodeId: userData.passcodeId }),
                ...(userData.planType && { planType: userData.planType }),
                ...(userData.subscriptionExpiry && {
                    subscriptionExpiry: userData.subscriptionExpiry,
                }),
            };
            
            // 🔥 ADD PREMIUM FIELDS FOR SPONSORED USERS
            if (userData.accountType === "sponsored") {
                sanitizedData.accountType = "sponsored";
                sanitizedData.hasActiveSubscription = true;
                sanitizedData.maxImagesPerReport = 5;
                sanitizedData.userType = "sponsored";
                sanitizedData.subscriptionType = userData.planType || "bulk_sponsored";
                sanitizedData.isPremium = true;
                sanitizedData.premium = true;
                sanitizedData.lastUpdated = new Date().toISOString();
                
                // Calculate expiry if not provided
                if (!sanitizedData.subscriptionExpiry) {
                    const expiryDate = new Date();
                    expiryDate.setDate(expiryDate.getDate() + 90); // 90 days default
                    sanitizedData.subscriptionExpiry = expiryDate.toISOString();
                }
            }
            
            // 🔥 ADD PREMIUM FIELDS FOR INDIVIDUAL PREMIUM USERS
            else if (userData.planType && userData.planType !== "free") {
                sanitizedData.hasActiveSubscription = true;
                sanitizedData.maxImagesPerReport = 5;
                sanitizedData.userType = "premium";
                sanitizedData.subscriptionType = userData.planType;
                sanitizedData.isPremium = true;
                sanitizedData.premium = true;
                sanitizedData.lastUpdated = new Date().toISOString();
            }
            
            console.log("📝 Saving user profile to Firestore:", sanitizedData);
            
            await setDoc(doc(db, "users", userId), sanitizedData);
            console.log("✅ User profile created successfully");
            
            // 🔥 SET LOCALSTORAGE FOR IMMEDIATE PREMIUM ACCESS
            if (sanitizedData.hasActiveSubscription) {
                localStorage.setItem(`premium_${userId}`, "true");
                if (sanitizedData.subscriptionExpiry) {
                    localStorage.setItem(
                                         `premium_expiry_${userId}`,
                                         sanitizedData.subscriptionExpiry,
                                         );
                }
                console.log("✅ Premium localStorage set for user:", userId);
            }
            
            return true;
        } catch (error) {
            console.error("❌ Error creating user profile:", error);
            throw error;
        }
    }
    
    // Helper function to ensure user profile exists in Firestore
    // In users-auth.js - Replace your ensureUserProfile function with this:
    
    window.ensureUserProfile = async function (userId, email, displayName) {
        console.log("🔍 Ensuring user profile exists for:", userId);
        
        try {
            // ✅ Use the same pattern as createUserProfile
            // Get the existing Firebase app
            const { getFirestore, doc, getDoc } =
            await import("https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js");
            
            // Get the existing app (not creating a new one)
            const { getApps } =
            await import("https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js");
            const apps = getApps();
            const firebaseApp = apps[0]; // Use the existing app
            
            const db = getFirestore(firebaseApp);
            const userDocRef = doc(db, "users", userId);
            const userDoc = await getDoc(userDocRef);
            
            if (userDoc.exists) {
                console.log("✅ User profile already exists");
                return true;
            }
            
            console.log("📝 User profile missing, creating now...");
            return await window.createUserProfile(userId, {
                email: email,
                name: displayName,
                accountType: "individual",
            });
        } catch (error) {
            console.error("❌ Error ensuring user profile:", error);
            return false;
        }
    };
    
    // Helper 3: Mark passcode as used
    async function markPasscodeAsUsed(passcodeId, userId, sponsorId = null) {
        try {
            console.log(
                        `🔐 Marking passcode as used: ${passcodeId} by user: ${userId}`,
                        );
            
            // Import Firebase
            const { initializeApp, getApps } =
            await import("https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js");
            const { getFirestore, doc, updateDoc, collection, query, where, getDocs } =
            await import("https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js");
            
            // Get or create Firebase app (same as createUserProfile)
            let firebaseApp;
            const apps = getApps();
            
            if (apps.length > 0) {
                firebaseApp = apps[0];
                console.log(
                            "✅ Using existing Firebase app for marking passcode:",
                            firebaseApp.name,
                            );
            } else {
                const firebaseConfig = {
                    apiKey: "AIzaSyB3Kpbz7CWUP1Vj3bUHa6Uxv6kWqi2ouH0",
                    authDomain: "connectionsfinder.com",
                    projectId: "connectionsfinder-app",
                    storageBucket: "connectionsfinder-app.firebasestorage.app",
                    messagingSenderId: "503658774852",
                    appId: "1:503658774852:web:6ef3a8f506f36ca2c3d711",
                };
                
                firebaseApp = initializeApp(firebaseConfig, "PasscodeMarker");
                console.log("✅ Created new Firebase app for marking passcode");
            }
            
            const db = getFirestore(firebaseApp);
            
            // Try to update by document ID first
            try {
                const updateData = {
                    isUsed: true,
                    usedBy: userId,
                    usedAt: new Date().toISOString(),
                };
                
                // Add sponsorId if provided
                if (sponsorId) {
                    updateData.sponsorId = sponsorId;
                }
                
                await updateDoc(doc(db, "pass_codes", passcodeId), updateData);
                console.log(`✅ Passcode ${passcodeId} marked as used by ${userId}`);
                return true;
            } catch (idError) {
                // If document not found by ID, try to find by code
                if (idError.code === "not-found") {
                    console.log(
                                `⚠️ Passcode not found by ID "${passcodeId}", searching by code...`,
                                );
                    
                    // Search for passcode by code field
                    const q = query(
                                    collection(db, "pass_codes"),
                                    where("code", "==", passcodeId),
                                    );
                    
                    const querySnapshot = await getDocs(q);
                    
                    if (querySnapshot.empty) {
                        console.error(`❌ Passcode not found by code either: ${passcodeId}`);
                        return false;
                    }
                    
                    // Update the first matching passcode
                    const passcodeDoc = querySnapshot.docs[0];
                    await updateDoc(doc(db, "pass_codes", passcodeDoc.id), {
                        isUsed: true,
                        usedBy: userId,
                        usedAt: new Date().toISOString(),
                        sponsorId: sponsorId || passcodeDoc.data().sponsorId,
                    });
                    
                    console.log(
                                `✅ Passcode ${passcodeId} marked as used by ${userId} (found by code)`,
                                );
                    return true;
                }
                
                // Re-throw other errors
                throw idError;
            }
        } catch (error) {
            console.error("❌ Failed to mark passcode as used:", error);
            
            // Log more details
            console.error("Error details:", {
                code: error.code,
                message: error.message,
                passcodeId: passcodeId,
                userId: userId,
            });
            
            return false;
        }
    }
    // Add this temporary debug function
    async function debugPasscode(passcodeId) {
        try {
            const { initializeApp, getApps } =
            await import("https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js");
            const { getFirestore, doc, getDoc, collection, query, where, getDocs } =
            await import("https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js");
            
            let firebaseApp;
            const apps = getApps();
            if (apps.length > 0) {
                firebaseApp = apps[0];
            } else {
                const firebaseConfig = {
                    apiKey: "AIzaSyB3Kpbz7CWUP1Vj3bUHa6Uxv6kWqi2ouH0",
                    authDomain: "connectionsfinder.com",
                    projectId: "connectionsfinder-app",
                    storageBucket: "connectionsfinder-app.firebasestorage.app",
                    messagingSenderId: "503658774852",
                    appId: "1:503658774852:web:6ef3a8f506f36ca2c3d711",
                };
                firebaseApp = initializeApp(firebaseConfig, "Debugger");
            }
            
            const db = getFirestore(firebaseApp);
            
            console.log(`🔍 Debugging passcode: ${passcodeId}`);
            
            // Try by document ID
            const byId = await getDoc(doc(db, "pass_codes", passcodeId));
            console.log("📊 By document ID:", byId.exists() ? "FOUND" : "NOT FOUND");
            
            // Try by code field
            const q = query(
                            collection(db, "pass_codes"),
                            where("code", "==", passcodeId),
                            );
            const byCode = await getDocs(q);
            console.log(`📊 By code field: ${byCode.size} documents found`);
            
            if (byCode.size > 0) {
                byCode.forEach((doc) => {
                    console.log(`📝 Document ${doc.id}:`, doc.data());
                });
            }
        } catch (error) {
            console.error("❌ Debug error:", error);
        }
    }
    
    // Call this in browser console with your passcode
    // debugPasscode("CONN-MLCC8P8N-NLSO-005");
    // ============================================
    // BLOCKED_USER_CHECK - Add to users-auth.js or security.js
    // ============================================
    
    async function checkIfUserBlocked() {
        const user = window.fb.auth.currentUser;
        if (!user) return false;
        
        try {
            const userDoc = await window.fb.firestore.getDoc(
                                                             window.fb.firestore.doc(window.fb.db, "users", user.uid),
                                                             );
            
            if (userDoc.exists) {
                const userData = userDoc.data();
                if (userData.status === "blocked" || userData.status === "suspended") {
                    console.log("🚨 USER_BLOCKED_DETECTED");
                    alert(
                          "Your account has been blocked. Please contact support for assistance.",
                          );
                    await window.fb.auth.signOut();
                    window.location.href = "/dashboard";
                    return true;
                }
            }
        } catch (error) {
            console.error("BLOCKED_USER_CHECK_ERROR:", error);
        }
        return false;
    }
    
    // Make it globally available
    window.checkUserBlocked = checkIfUserBlocked;
    
    // Call it when user signs in
    if (window.fb && window.fb.auth) {
        window.fb.auth.onAuthStateChanged(async (user) => {
            if (user) {
                await checkIfUserBlocked();
            }
        });
    }
    window.handleSigninSubmit = handleSigninSubmit;
    
    // ============================================
    // EXPOSE FUNCTIONS GLOBALLY
    // ============================================
    
    window.showSigninForm = showSigninForm;
    window.showSignupForm = showSignupForm;
    window.closeAuthForm = closeAuthForm;
    
    console.log("✅ Sign-in functions exposed globally");
    
// Make handleSigninSubmit globally available
window.handleSigninSubmit = handleSigninSubmit;
console.log("✅ handleSigninSubmit exposed globally");

// ============================================
// FIREBASE AUTH EMULATION FOR REST API
// ============================================

if (typeof window.fb === 'undefined') {
    window.fb = {};
}
if (typeof window.fb.auth === 'undefined') {
    window.fb.auth = {
        currentUser: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null,
        onAuthStateChanged: function(callback) {
            const user = localStorage.getItem('user');
            callback(user ? JSON.parse(user) : null);
            // Keep listening for changes
            const interval = setInterval(() => {
                const currentUser = localStorage.getItem('user');
                callback(currentUser ? JSON.parse(currentUser) : null);
            }, 2000);
            return function() { clearInterval(interval); };
        },
        signOut: function() {
            return Promise.resolve();
        },
        signInWithEmailAndPassword: function() {
            return Promise.reject(new Error("Use REST API for sign-in"));
        }
    };
    console.log("✅ Firebase auth emulated for REST API");
}



// ══════════════════════════════════════════════════════════════
// REPAIR USER PROFILE — self-healing for incomplete Firestore docs
// Called on every login. Fills in missing standard fields.
// Defined at TOP LEVEL so window.repairUserProfile is always set.
// ══════════════════════════════════════════════════════════════
async function repairUserProfile(userId, idToken, email, displayName) {
    if (!userId || !idToken) return;
    try {
        const projectId = "connectionsfinder-app";
        const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/users/${userId}`;

        const resp = await fetch(url, {
            headers: { "Authorization": "Bearer " + idToken }
        });
        if (!resp.ok) {
            console.warn("repairUserProfile: fetch failed", resp.status);
            return;
        }

        const doc = await resp.json();
        const fields = doc.fields || {};

        const now = new Date().toISOString();
        const patch = {};
        if (!fields.email)       patch.email       = { stringValue: email };
        if (!fields.name)        patch.name        = { stringValue: displayName || email.split("@")[0] };
        if (!fields.displayName) patch.displayName = { stringValue: displayName || email.split("@")[0] };
        if (!fields.createdAt)   patch.createdAt   = { stringValue: now };
        if (!fields.lastActive)  patch.lastActive  = { stringValue: now };
        if (!fields.status)      patch.status      = { stringValue: "active" };
        if (!fields.accountType) patch.accountType = { stringValue: "individual" };

        if (Object.keys(patch).length === 0) {
            console.log("✅ User profile complete - no repair needed");
            return;
        }

        const mask = Object.keys(patch).map(k => `updateMask.fieldPaths=${k}`).join("&");
        const patchUrl = `${url}?${mask}`;

        const patchResp = await fetch(patchUrl, {
            method: "PATCH",
            headers: {
                "Authorization": "Bearer " + idToken,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ fields: patch })
        });

        if (patchResp.ok) {
            console.log("🔧 Repaired user profile - added:", Object.keys(patch).join(", "));
        } else {
            console.warn("repairUserProfile: patch failed", patchResp.status);
        }
    } catch (err) {
        console.warn("repairUserProfile error (non-critical):", err.message);
    }
}

// Expose globally — defined at TOP LEVEL so it runs on every page load
window.repairUserProfile = repairUserProfile;
console.log("✅ repairUserProfile exposed globally");

