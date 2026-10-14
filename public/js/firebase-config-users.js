// firebase-config-users.js - USING CLEAN DOMAIN
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";
import {
  initializeAppCheck,
  ReCaptchaEnterpriseProvider,
} from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app-check.js";

// Use clean domain but same project credentials
const firebaseConfigUsers = {
  apiKey: "AIzaSyB3Kpbz7CWUP1Vj3bUHa6Uxv6kWqi2ouH0",
  authDomain: "connectionsfinder.com",
  projectId: "connectionsfinder-app",
  storageBucket: "connectionsfinder-app.firebasestorage.app",
  messagingSenderId: "503658774852",
  appId: "1:503658774852:web:6ef3a8f506f36ca2c3d711",
};

const appUsers = initializeApp(firebaseConfigUsers, "UsersApp");

const authUsers = getAuth(appUsers);

// Firebase App Check - FAIL-SAFE (non-blocking)
// CORRECT KEY from Google Cloud Console - do not edit
setTimeout(() => {
  try {
    initializeAppCheck(appUsers, {
      provider: new ReCaptchaEnterpriseProvider(
        "6LdU4t0tAAAAAFvkRlbrhGGlOCJ9LlSnY0h0hva9"
      ),
      isTokenAutoRefreshEnabled: true,
    });
    console.log("App Check initialized (firebase-config-users.js)");
  } catch (e) {
    console.warn("App Check failed (non-fatal):", e.message);
  }
}, 3000);

window.usersAuth = {
  app: appUsers,
  auth: authUsers,
};

console.log("Users Auth with CLEAN domain");