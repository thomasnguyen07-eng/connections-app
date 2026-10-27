// manager.js - No imports needed
class AuthManager {
  constructor(auth, authFunctions) {
    this.auth = auth;
    this.authFunctions = authFunctions;
    this.user = null;
    this._initAuthListener();
  }

  _initAuthListener() {
    this.authFunctions.onAuthStateChanged(this.auth, (user) => {
      this.user = user;
      this._handleAuthChange(user);
      console.log(`Auth state changed: ${user ? user.email : "Signed out"}`);
    });
  }

  async signInWithEmail(email, password) {
    try {
      const userCredential =
        await this.authFunctions.signInWithEmailAndPassword(
          this.auth,
          email,
          password
        );
      return { success: true, user: userCredential.user };
    } catch (error) {
      return {
        success: false,
        error: this._getFriendlyError(error.code),
      };
    }
  }

  async signInWithGoogle() {
    try {
      const provider = new this.authFunctions.GoogleAuthProvider();
      const userCredential = await this.authFunctions.signInWithPopup(
        this.auth,
        provider
      );
      return { success: true, user: userCredential.user };
    } catch (error) {
      return {
        success: false,
        error: this._getFriendlyError(error.code),
      };
    }
  }

  async signOut() {
    try {
      await this.auth.signOut();
      return { success: true };
    } catch (error) {
      console.error("Sign out error:", error);
      return { success: false };
    }
  }

  _getFriendlyError(code) {
    const errors = {
      "auth/invalid-email": "Invalid email address",
      "auth/user-not-found": "No account found",
      "auth/wrong-password": "Incorrect password",
      "auth/too-many-requests": "Too many attempts. Try again later.",
      "auth/popup-closed-by-user": "Sign in cancelled",
      "auth/cancelled-popup-request": "Sign in cancelled",
    };
    return errors[code] || "Authentication failed. Please try again.";
  }
}

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  if (window.fb) {
    window.authManager = new AuthManager(
      window.fb.auth,
      window.fb.authFunctions
    );
  } else {
    console.error("Firebase not loaded yet");
  }
});
