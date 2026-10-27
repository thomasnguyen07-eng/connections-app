// firebase-config-users.js - USING CLEAN DOMAIN
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";

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

window.usersAuth = {
  app: appUsers,
  auth: authUsers,
};

console.log("Users Auth with CLEAN domain");
