"use strict";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";
import {
  getFirestore,
  collection,
  addDoc,
} from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
} from "https://www.gstatic.com/firebasejs/10.11.1/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyB3Kpbz7CWUP1Vj3bUHa6Uxv6kWqi2ouH0",
  authDomain: "connectionsfinder.com",
  projectId: "connectionsfinder-app",
  storageBucket: "connectionsfinder-app.firebasestorage.app",
  messagingSenderId: "503658774852",
  appId: "1:503658774852:web:6ef3a8f506f36ca2c3d711",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Storage upload helper with secure token handling
const uploadFile = async (path, file) => {
  try {
    const storageRef = ref(storage, path);

    // 1. First try normal upload
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);

    // Store for sharing
    window.lastReport = window.lastReport || {};
    window.lastReport.imageUrl = downloadURL;
    return downloadURL;
  } catch (error) {
    console.error("Upload error:", error);

    // 2. Fallback for auth errors
    if (error.code === "auth/requests-blocked") {
      console.warn("Firebase auth blocked - using anonymous upload");
      try {
        // Sign out and retry anonymously
        await signOut(auth);
        const storageRef = ref(storage, path);
        await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(storageRef);
        window.lastReport = window.lastReport || {};
        window.lastReport.imageUrl = downloadURL;
        return downloadURL;
      } catch (fallbackError) {
        console.error("Fallback upload failed:", fallbackError);
        throw new Error("Image upload unavailable");
      }
    }

    throw error;
  }
};

// Initialize window.fb with PROPER Firestore methods
window.fb = {
  auth: auth,
  firestore: {
    db: db,
    collection: (path) => collection(db, path), // Correct: Returns CollectionReference
    addDoc: (colRef, data) => addDoc(colRef, data), // Correct: Uses native addDoc
  },
  storage: {
    uploadFile: uploadFile,
    getDownloadURL: (path) => getDownloadURL(ref(storage, path)),
  },
};

// Verification
console.log("Firebase Services Verification:", {
  auth: !!auth,
  firestore: !!db,
  storage: !!storage,
});

window.firebaseReady = Promise.resolve();
console.log("Firebase initialized successfully");

// === ADD SIGN-UP FUNCTIONALITY ===
window.fb.signUp = async function (email, password, displayName) {
  try {
    const userCredential = await this.auth.createUserWithEmailAndPassword(
      email,
      password
    );

    // Update user profile
    await userCredential.user.updateProfile({
      displayName: displayName,
    });

    console.log("User created:", userCredential.user.uid);
    return userCredential.user;
  } catch (error) {
    console.error("Sign-up error:", error);
    throw error;
  }
};

// Also add a helper function for easy access
window.signUpUser = function () {
  const email = prompt("Enter email:");
  const password = prompt("Enter password:");
  const name = prompt("Enter your name:");

  if (email && password && name) {
    window.fb
      .signUp(email, password, name)
      .then(() => alert("Account created successfully!"))
      .catch((error) => alert("Sign-up failed: " + error.message));
  }
};

// ADD THIS FUNCTION for sponsored sign-up
window.fb.signUpWithSponsor = async function (
  email,
  password,
  displayName,
  sponsorCode
) {
  try {
    // First, create the user
    const user = await this.signUp(email, password, displayName);

    // Validate sponsor code
    const codeValid = await this.validateSponsorCode(sponsorCode);
    if (!codeValid.valid) {
      throw new Error("Invalid or used sponsor code");
    }

    // Mark user as sponsored and apply organization logo
    await this.applySponsorship(user.uid, codeValid.organizationId);

    console.log("Sponsored user created:", user.uid);
    return user;
  } catch (error) {
    console.error("Sponsored sign-up error:", error);
    throw error;
  }
};

// ADD THESE HELPER METHODS:
window.fb.validateSponsorCode = async function (code) {
  try {
    const codesRef = window.fb.firestore.collection("sponsorCodes");
    const query = await codesRef
      .where("code", "==", code)
      .where("isUsed", "==", false)
      .get();

    if (query.empty) {
      return { valid: false, reason: "Invalid or used code" };
    }

    const codeDoc = query.docs[0];
    return {
      valid: true,
      organizationId: codeDoc.data().organizationId,
      codeId: codeDoc.id,
    };
  } catch (error) {
    console.error("Code validation error:", error);
    return { valid: false, reason: "Validation error" };
  }
};

window.fb.applySponsorship = async function (userId, organizationId) {
  try {
    // Mark user as sponsored - FIXED Firestore syntax
    await window.fb.firestore.collection("users").doc(userId).set(
      {
        sponsoredBy: organizationId,
        isSponsored: true,
        sponsoredAt: new Date(),
      },
      { merge: true }
    );

    // Mark sponsor code as used
    // You'll need to implement this after we see the exact Firestore structure

    console.log(
      `✅ User ${userId} sponsored by organization ${organizationId}`
    );
  } catch (error) {
    console.error("Sponsorship application error:", error);
  }
};

// Signal that Firebase is ready
console.log("✅ firebase-loader.js: Firebase fully loaded");
window.firebaseReady = true; // This is the signal
