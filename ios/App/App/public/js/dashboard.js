// Remove duplicate event listeners (put this at the top)
document
  .getElementById("your-form-id")
  ?.removeEventListener("submit", handleSubmit);
window.removeEventListener("beforeunload", handleBeforeUnload);
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
} from "https://www.gstatic.com/firebasejs/10.11.1/firebase-storage.js";

// Initialize Firebase
const firebaseConfig = {
  apiKey: "AIzaSyB3Kpbz7CWUP1Vj3bUHa6Uxv6kWqi2ouH0",
  authDomain: "connectionsfinder.com",
  projectId: "connectionsfinder-app",
  storageBucket: "connectionsfinder-app.firebasestorage.app",
  messagingSenderId: "503658774852",
  appId: "1:503658774852:web:6ef3a8f506f36ca2c3d711",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

window.fb = {
  app,
  auth,
  db,
  storage,
  storageFunctions: {
    ref: (path) => ref(storage, path),
    uploadBytes: (ref, file) => uploadBytes(ref, file),
    getDownloadURL: (ref) => getDownloadURL(ref),
  },
};

// ====== ✅ SAFE ADDITION STARTS HERE ======
// This simply adds a method to the existing window.fb.storage object
window.fb.storage.uploadFile = async function (path, file) {
  console.log(
    "🛠️🛠️🛠️ DIAGNOSTIC LOG: CUSTOM uploadFile HELPER WAS EXECUTED for:",
    path
  ); // Change this line
  try {
    const storageRef = window.fb.storageFunctions.ref(path);
    const snapshot = await window.fb.storageFunctions.uploadBytes(
      storageRef,
      file
    );
    const downloadUrl = await window.fb.storageFunctions.getDownloadURL(
      snapshot.ref
    );
    console.log("✅ Helper generated correct URL:", downloadUrl);
    return downloadUrl;
  } catch (error) {
    console.error("❌ Helper uploadFile failed:", error);
    throw error;
  }
};
// ====== ✅ SAFE ADDITION ENDS HERE ======

console.log("Firebase initialized with:", {
  auth: !!auth,
  db: !!db,
  storage: !!storage,
  storageFunctions: Object.keys(window.fb.storageFunctions),
});
// Floating Dashboard Button Handler
document
  .getElementById("floating-dashboard-btn")
  ?.addEventListener("click", function (e) {
    e.preventDefault();

    // Use your existing reliable path detection
    const possiblePaths = [
      "/dashboard.html",
      "/public/dashboard.html",
      "dashboard.html",
      "../dashboard.html",
      "/index.html",
    ];

    // Find first valid path
    const validPath = possiblePaths.find((path) => {
      try {
        const xhr = new XMLHttpRequest();
        xhr.open("HEAD", path, false);
        xhr.send();
        return xhr.status === 200;
      } catch {
        return false;
      }
    });

    window.location.href = validPath || "/";
  });
// ====================
// APP LOGO FUNCTIONALITY
// ====================

// Make app logo clickable to refresh dashboard
document.addEventListener("DOMContentLoaded", function () {
  const appBranding = document.querySelector(".app-branding");

  if (appBranding) {
    appBranding.addEventListener("click", function () {
      // Refresh the dashboard page
      window.location.href = "/dashboard.html";
      // Or if you want to reload the current page:
      // window.location.reload();
    });

    // Add tooltip for better UX
    appBranding.title = "Click to refresh dashboard";

    console.log("App logo initialized - clickable to refresh dashboard");
  }
});

// Optional: Function to switch to logo-only mode in the future
function switchToLogoOnlyMode() {
  document.body.classList.add("logo-only");
  console.log("Switched to logo-only mode");
}

// Optional: Function to switch back to logo+title mode
function switchToLogoTitleMode() {
  document.body.classList.remove("logo-only");
  console.log("Switched to logo+title mode");
}
