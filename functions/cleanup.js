const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

// In your cleanup.js, add this function
exports.progressiveCleanup = functions.pubsub
  .schedule("every 3 hours")
  .onRun(async (context) => {
    const db = admin.firestore();
    const now = new Date();
    const batch = db.batch();
    let count = 0;

    // Only clean up 50 items at a time
    const expiredPackages = await db
      .collection("image_packages")
      .where("createdAt", "<", new Date(now - 30 * 24 * 60 * 60 * 1000))
      .limit(50)
      .get();

    expiredPackages.forEach((doc) => {
      batch.delete(doc.ref);
      count++;
    });

    if (count > 0) {
      await batch.commit();
      console.log(`✅ Progressive cleanup: removed ${count} items`);
    }
  });

// Run every day at 2 AM
exports.cleanupExpiredData = functions.pubsub
  .schedule("0 2 * * *")
  .timeZone("Asia/Ho_Chi_Minh")
  .onRun(async (context) => {
    const db = admin.firestore();
    const now = new Date();
    const batch = db.batch();
    let operationCount = 0;

    console.log("🧹 Starting automatic cleanup...");

    // 1. Clean up expired image packages (30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const expiredPackages = await db
      .collection("image_packages")
      .where("createdAt", "<", thirtyDaysAgo)
      .limit(500) // Process in batches
      .get();

    expiredPackages.forEach((doc) => {
      batch.delete(doc.ref);
      operationCount++;
    });

    // 2. Update expired subscriptions
    const expiredUsers = await db
      .collection("users")
      .where("subscriptionExpiry", "<", now)
      .where("status", "==", "active")
      .limit(500)
      .get();

    expiredUsers.forEach((doc) => {
      batch.update(doc.ref, {
        status: "expired",
        hasActiveSubscription: false,
        isPremium: false,
        premium: false,
      });
      operationCount++;
    });

    // 3. Clean up old used passcodes (90 days)
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const oldPasscodes = await db
      .collection("passcodes")
      .where("createdAt", "<", ninetyDaysAgo)
      .where("isUsed", "==", true)
      .limit(500)
      .get();

    oldPasscodes.forEach((doc) => {
      batch.delete(doc.ref);
      operationCount++;
    });

    // Commit batch
    if (operationCount > 0) {
      await batch.commit();
      console.log(`✅ Cleaned up ${operationCount} items`);
    } else {
      console.log("✨ Nothing to clean up today");
    }

    return null;
  });
