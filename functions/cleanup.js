// ============================================
// CLEANUP FUNCTIONS - V2 SYNTAX
// ============================================

const functions = require("firebase-functions");
const admin = require("firebase-admin");
const { onSchedule } = require("firebase-functions/v2/scheduler");

admin.initializeApp();

// ============================================
// 1. DELETE OLD REPORTS (180 DAYS) + IMAGES
// ============================================
exports.cleanupOldReports = onSchedule(
  {
    schedule: "0 3 * * *",
    timeZone: "Asia/Ho_Chi_Minh",
    retryCount: 3,
    timeoutSeconds: 300,
    memory: "256MiB",
  },
  async (event) => {
    const db = admin.firestore();
    const bucket = admin.storage().bucket();
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setDate(sixMonthsAgo.getDate() - 180);

    console.log(`🧹 Starting cleanup of reports older than 180 days...`);

    const snapshot = await db
      .collection("reports")
      .where("createdAt", "<", sixMonthsAgo)
      .limit(500)
      .get();

    if (snapshot.empty) {
      console.log("📭 No old reports to delete");
      return null;
    }

    const batch = db.batch();
    let reportCount = 0;
    let imageCount = 0;
    let storageDeleteErrors = 0;

    for (const doc of snapshot.docs) {
      const data = doc.data();
      const imageUrls = data.imageUrls || [];

      // Delete images from Firebase Storage
      for (const imageUrl of imageUrls) {
        try {
          const path = decodeURIComponent(
            imageUrl.split("/o/")[1].split("?")[0],
          );
          await bucket.file(path).delete();
          imageCount++;
        } catch (e) {
          storageDeleteErrors++;
          console.log(`⚠️ Could not delete image: ${e.message}`);
        }
      }

      batch.delete(doc.ref);
      reportCount++;
    }

    await batch.commit();
    console.log(
      `🗑️ Deleted ${reportCount} reports and ${imageCount} images older than 6 months`,
    );
    if (storageDeleteErrors > 0) {
      console.log(
        `⚠️ ${storageDeleteErrors} images could not be deleted (may already be gone)`,
      );
    }
    return null;
  },
);

// ============================================
// 2. DELETE OLD IMAGE PACKAGES (30 DAYS)
// ============================================
exports.cleanupImagePackages = onSchedule(
  {
    schedule: "0 3 * * *",
    timeZone: "Asia/Ho_Chi_Minh",
    retryCount: 3,
    timeoutSeconds: 300,
    memory: "256MiB",
  },
  async (event) => {
    const db = admin.firestore();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    console.log(`🧹 Starting cleanup of old image packages...`);

    const snapshot = await db
      .collection("image_packages")
      .where("createdAt", "<", thirtyDaysAgo)
      .limit(500)
      .get();

    if (snapshot.empty) {
      console.log("📭 No old image packages to delete");
      return null;
    }

    const batch = db.batch();
    let count = 0;
    snapshot.forEach((doc) => {
      batch.delete(doc.ref);
      count++;
    });

    await batch.commit();
    console.log(`🗑️ Deleted ${count} old image packages`);
    return null;
  },
);

// ============================================
// 3. DELETE INACTIVE USERS (12 MONTHS)
// ============================================
exports.cleanupInactiveUsers = onSchedule(
  {
    schedule: "0 4 * * *",
    timeZone: "Asia/Ho_Chi_Minh",
    retryCount: 3,
    timeoutSeconds: 300,
    memory: "256MiB",
  },
  async (event) => {
    const db = admin.firestore();
    const bucket = admin.storage().bucket();
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    console.log(`🧹 Starting cleanup of inactive users...`);

    const snapshot = await db
      .collection("users")
      .where("lastLoginAt", "<", twelveMonthsAgo)
      .limit(100)
      .get();

    if (snapshot.empty) {
      console.log("📭 No inactive users to delete");
      return null;
    }

    const batch = db.batch();
    let userCount = 0;
    let reportCount = 0;
    let imageCount = 0;
    let storageDeleteErrors = 0;

    for (const doc of snapshot.docs) {
      const userId = doc.id;

      // Get all reports by this user
      const reports = await db
        .collection("reports")
        .where("userId", "==", userId)
        .get();

      // Delete images from Storage for each report
      reports.forEach((report) => {
        const data = report.data();
        const imageUrls = data.imageUrls || [];

        for (const imageUrl of imageUrls) {
          try {
            const path = decodeURIComponent(
              imageUrl.split("/o/")[1].split("?")[0],
            );
            bucket
              .file(path)
              .delete()
              .catch(() => {});
            imageCount++;
          } catch (e) {
            storageDeleteErrors++;
          }
        }

        batch.delete(report.ref);
        reportCount++;
      });

      // Delete user avatar from Storage (if exists)
      const userData = doc.data();
      if (userData.avatarUrl) {
        try {
          const avatarPath = decodeURIComponent(
            userData.avatarUrl.split("/o/")[1].split("?")[0],
          );
          await bucket.file(avatarPath).delete();
        } catch (e) {
          console.log(`⚠️ Could not delete avatar for user ${userId}`);
        }
      }

      // Delete user account
      batch.delete(doc.ref);
      userCount++;
    }

    await batch.commit();
    console.log(
      `🗑️ Deleted ${userCount} inactive users, ${reportCount} reports, ${imageCount} images`,
    );
    if (storageDeleteErrors > 0) {
      console.log(`⚠️ ${storageDeleteErrors} images could not be deleted`);
    }
    return null;
  },
);

// ============================================
// 4. PROGRESSIVE CLEANUP (EVERY 3 HOURS)
// ============================================
exports.progressiveCleanup = onSchedule(
  {
    schedule: "every 3 hours",
    retryCount: 3,
    timeoutSeconds: 300,
    memory: "256MiB",
  },
  async (event) => {
    const db = admin.firestore();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const batch = db.batch();
    let count = 0;

    const expiredPackages = await db
      .collection("image_packages")
      .where("createdAt", "<", thirtyDaysAgo)
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
    return null;
  },
);

// ============================================
// 5. UPDATE EXPIRED SUBSCRIPTIONS (DAILY)
// ============================================
exports.cleanupExpiredSubscriptions = onSchedule(
  {
    schedule: "0 2 * * *",
    timeZone: "Asia/Ho_Chi_Minh",
    retryCount: 3,
    timeoutSeconds: 300,
    memory: "256MiB",
  },
  async (event) => {
    const db = admin.firestore();
    const now = new Date();
    const batch = db.batch();
    let count = 0;

    console.log(`🧹 Starting cleanup of expired subscriptions...`);

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
        subscriptionExpiry: null,
      });
      count++;
    });

    if (count > 0) {
      await batch.commit();
      console.log(`✅ Updated ${count} expired subscriptions`);
    } else {
      console.log("📭 No expired subscriptions to update");
    }
    return null;
  },
);

// ============================================
// 6. DAILY CLEANUP SUMMARY (OPTIONAL)
// ============================================
exports.cleanupSummary = onSchedule(
  {
    schedule: "0 5 * * *",
    timeZone: "Asia/Ho_Chi_Minh",
    retryCount: 3,
    timeoutSeconds: 60,
    memory: "256MiB",
  },
  async (event) => {
    const db = admin.firestore();

    // Count total reports
    const reportsSnapshot = await db.collection("reports").count().get();
    const totalReports = reportsSnapshot.data().count || 0;

    // Count total users
    const usersSnapshot = await db.collection("users").count().get();
    const totalUsers = usersSnapshot.data().count || 0;

    console.log(`📊 Daily Summary:`);
    console.log(`   👤 Total Users: ${totalUsers}`);
    console.log(`   📄 Total Reports: ${totalReports}`);
    console.log(`   ✅ All cleanup functions are running normally`);

    return null;
  },
);
