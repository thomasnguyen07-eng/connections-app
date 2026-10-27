// SIMPLIFIED Firebase Premium Loader - WORKING VERSION
console.log("🚀 Loading Firebase for premium page...");

document.addEventListener("DOMContentLoaded", function () {
  initializeFirebase();
});

function initializeFirebase() {
  try {
    // Load Firebase scripts
    loadFirebaseScripts();
  } catch (error) {
    console.error("❌ Firebase init error:", error);
  }
}

function loadFirebaseScripts() {
  const scripts = [
    "https://www.gstatic.com/firebasejs/9.6.10/firebase-app-compat.js",
    "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth-compat.js",
    "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore-compat.js",
    "https://www.gstatic.com/firebasejs/9.6.10/firebase-functions-compat.js",
  ];

  let loadedCount = 0;

  scripts.forEach((src) => {
    // Check if script is already loaded
    if (document.querySelector(`script[src="${src}"]`)) {
      loadedCount++;
      console.log(`✅ Already loaded: ${src}`);
      if (loadedCount === scripts.length) {
        console.log("🎉 All Firebase scripts already loaded");
        initializeFirebaseApp();
      }
      return;
    }

    const script = document.createElement("script");
    script.src = src;
    script.onload = () => {
      loadedCount++;
      console.log(`✅ Loaded: ${src}`);

      if (loadedCount === scripts.length) {
        console.log("🎉 All Firebase scripts loaded");
        initializeFirebaseApp();
      }
    };
    script.onerror = (error) => {
      console.error(`❌ Failed to load: ${src}`, error);
      // Continue anyway, some services might still work
      loadedCount++;
      if (loadedCount === scripts.length) {
        console.log("🔄 Continuing with available Firebase services");
        initializeFirebaseApp();
      }
    };
    document.head.appendChild(script);
  });
}

function initializeFirebaseApp() {
  try {
    const firebaseConfig = {
      apiKey: "AIzaSyB3Kpbz7CWUP1Vj3bUHa6Uxv6kWqi2ouH0",
      authDomain: "connectionsfinder.com",
      projectId: "connectionsfinder-app",
      storageBucket: "connectionsfinder-app.firebasestorage.app",
      messagingSenderId: "503658774852",
      appId: "1:503658774852:web:6ef3a8f506f36ca2c3d711",
    };

    console.log("🔧 Initializing Firebase...");

    // Initialize Firebase
    let app;
    if (!firebase.apps.length) {
      app = firebase.initializeApp(firebaseConfig);
      console.log("✅ Firebase app initialized");
    } else {
      app = firebase.app();
      console.log("✅ Using existing Firebase app");
    }

    // Initialize services with error handling
    window.fb = {
      auth: firebase.auth(app),
      firestore: firebase.firestore(app),
    };

    // Try to initialize functions, but don't fail if it's not available
    try {
      if (firebase.functions) {
        window.fb.functions = firebase.functions(app);
        console.log("✅ Firebase Functions initialized");
      } else {
        console.warn("⚠️ Firebase Functions not available");
        window.fb.functions = null;
      }
    } catch (functionsError) {
      console.warn(
        "⚠️ Could not initialize Firebase Functions:",
        functionsError,
      );
      window.fb.functions = null;
    }

    console.log("✅ Firebase services initialized:", {
      auth: !!window.fb.auth,
      firestore: !!window.fb.firestore,
      functions: !!window.fb.functions,
    });

    // Safe auth state listener
    if (window.fb.auth) {
      window.fb.auth.onAuthStateChanged((user) => {
        console.log("🔐 Auth state:", user ? user.email : "No user");
      });
    }

    console.log("🎉 Firebase premium loader initialization complete");
    window.firebaseReady = true; // ADD THIS LINE
  } catch (error) {
    console.error("❌ Firebase initialization error:", error);
    // Still create window.fb with basic services
    window.fb = window.fb || {
      auth: null,
      firestore: null,
      functions: null,
    };
  }
}

// Add this after initializing window.fb in firebase-premium-loader.js
// SAFE: Wait for Firebase to be fully initialized before setting up auth listener
setTimeout(() => {
  if (window.fb && window.fb.auth) {
    window.fb.auth.onAuthStateChanged((user) => {
      console.log(
        "🎯 Premium Page - Auth State Changed:",
        user ? `Logged in as ${user.email}` : "No user",
      );

      // Check for pending subscriptions after login
      if (user) {
        const pendingSubscription = localStorage.getItem("pendingSubscription");
        if (pendingSubscription) {
          console.log(
            "🔄 Processing pending subscription:",
            pendingSubscription,
          );
          // You could auto-show the subscription modal here
        }
      }
    });

    // Force auth state check
    setTimeout(() => {
      const currentUser = window.fb.auth.currentUser;
      console.log(
        "🔍 Initial auth state check:",
        currentUser ? currentUser.email : "No user",
      );
    }, 1000);
  } else {
    console.log("⏳ Firebase auth not ready yet, will retry...");
    // Optional: retry once more after delay
    setTimeout(() => {
      if (window.fb && window.fb.auth) {
        window.fb.auth.onAuthStateChanged((user) => {
          console.log(
            "🎯 Premium Page - Auth State Changed (retry):",
            user ? `Logged in as ${user.email}` : "No user",
          );
        });
      }
    }, 3000);
  }
}, 2000); // Wait longer for Firebase to initialize
