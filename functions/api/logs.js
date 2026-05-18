// functions/api/logs.js
const functions = require("firebase-functions");
const admin = require("firebase-admin");

if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

exports.logs = functions.https.onRequest(async (req, res) => {
  // Enable CORS
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "POST, OPTIONS");

  if (req.method === "OPTIONS") {
    res.status(204).send("");
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const logData = req.body;

    // Add timestamp
    logData.receivedAt = admin.firestore.FieldValue.serverTimestamp();

    // Store in Firestore with proper structure
    await db.collection("mobile_logs").add({
      ...logData,
      // Ensure we have these fields
      userId: logData.userId || "anonymous",
      userAgent: logData.userAgent || "unknown",
      timestamp: logData.timestamp || Date.now(),
    });

    console.log("📱 Mobile log received from:", logData.userId);

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("❌ Error saving log:", error);
    res.status(500).json({ error: error.message });
  }
});
