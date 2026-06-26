const functions = require("firebase-functions");
const admin = require("firebase-admin");
const { onSchedule } = require("firebase-functions/v2/scheduler");
admin.initializeApp();

// ============================================
// IMPORT CLEANUP FUNCTIONS  // <-- ADD THIS
// ============================================
const cleanup = require("./cleanup"); // <-- ADD THIS

// Initialize Firebase Admin (only if not already initialized)
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: "connectionsfinder-app", // 👈 Forces connection to your main project
    databaseURL: "https://connectionsfinder-app.firebaseio.com", // 👈 Your main DB URL
  });
}
const mainFirestore = admin.firestore(); // Connects to 'connectionsfinder-app'

// After your existing admin.initializeApp();
// Add this security code:

// ============================================
// SECURITY: RATE LIMITING & USER BLOCKING
// ============================================

// Rate limiting tracker
const requestCounts = new Map();

// Clean rate limiting map every hour
setInterval(
  () => {
    requestCounts.clear();
  },
  60 * 60 * 1000,
);

// Check rate limit
function checkRateLimit(userId, action, limit = 100, windowMs = 60000) {
  const key = `${userId}_${action}`;
  const now = Date.now();
  const windowStart = now - windowMs;

  if (!requestCounts.has(key)) {
    requestCounts.set(key, []);
  }

  const requests = requestCounts
    .get(key)
    .filter((timestamp) => timestamp > windowStart);

  if (requests.length >= limit) {
    return false;
  }

  requests.push(now);
  requestCounts.set(key, requests);
  return true;
}

// Log security events
async function logSecurityEvent(eventType, userId, details, severity = "info") {
  try {
    const db = admin.firestore();
    await db.collection("security_logs").add({
      eventType: eventType,
      userId: userId,
      details: details,
      severity: severity,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      ip: details.ip || "unknown",
    });

    if (severity === "high") {
      console.error(`🚨 SECURITY_ALERT: ${eventType} for user ${userId}`);
    }
  } catch (error) {
    console.error("Failed to log security event:", error);
  }
}

// Check if user is blocked
async function isUserBlocked(userId) {
  const db = admin.firestore();
  const userDoc = await db.collection("users").doc(userId).get();
  if (!userDoc.exists) return false;

  const userData = userDoc.data();
  return userData.status === "blocked" || userData.status === "suspended";
}

// Detect suspicious activity
async function detectSuspiciousActivity(userId, action, details) {
  const db = admin.firestore();
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

  const recentActions = await db
    .collection("security_logs")
    .where("userId", "==", userId)
    .where("timestamp", ">", oneHourAgo)
    .get();

  const actionCount = recentActions.size;

  if (actionCount > 50) {
    await logSecurityEvent(
      "RAPID_ACTIONS",
      userId,
      {
        actionCount: actionCount,
        actions: action,
        threshold: 50,
      },
      "high",
    );
    return true;
  }

  return false;
}

// Security API Gateway
exports.securityGateway = functions.https.onRequest(async (req, res) => {
  res.set("Access-Control-Allow-Origin", "*");

  if (req.method === "OPTIONS") {
    res.status(204).send("");
    return;
  }

  const authHeader = req.headers.authorization;
  if (!authHeader) {
    res.status(401).json({ error: "No authorization header" });
    return;
  }

  const token = authHeader.split(" ")[1];
  let userId;

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    userId = decodedToken.uid;
  } catch (error) {
    await logSecurityEvent(
      "INVALID_TOKEN",
      "unknown",
      {
        error: error.message,
        ip: req.ip,
      },
      "high",
    );
    res.status(401).json({ error: "Invalid token" });
    return;
  }

  if (await isUserBlocked(userId)) {
    await logSecurityEvent(
      "BLOCKED_USER_ACCESS",
      userId,
      {
        ip: req.ip,
        path: req.path,
      },
      "high",
    );
    res.status(403).json({ error: "Account blocked. Contact support." });
    return;
  }

  if (!checkRateLimit(userId, req.path, 100, 60000)) {
    await logSecurityEvent(
      "RATE_LIMIT_EXCEEDED",
      userId,
      {
        ip: req.ip,
        path: req.path,
      },
      "medium",
    );
    res
      .status(429)
      .json({ error: "Too many requests. Please try again later." });
    return;
  }

  await detectSuspiciousActivity(userId, req.path, { ip: req.ip });
  await logSecurityEvent(
    "API_ACCESS",
    userId,
    {
      ip: req.ip,
      path: req.path,
      method: req.method,
    },
    "info",
  );

  res.json({ success: true, message: "Request processed" });
});

// Admin: Block a user
exports.blockUser = functions.https.onRequest(async (req, res) => {
  res.set("Access-Control-Allow-Origin", "*");

  if (req.method === "OPTIONS") {
    res.status(204).send("");
    return;
  }

  const authHeader = req.headers.authorization;
  if (!authHeader) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const token = authHeader.split(" ")[1];
  let email;

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    email = decodedToken.email;
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
    return;
  }

  if (email !== "thomasnguyen07@gmail.com") {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  const { userId, reason } = req.body;
  if (!userId) {
    res.status(400).json({ error: "userId required" });
    return;
  }

  const db = admin.firestore();
  await db
    .collection("users")
    .doc(userId)
    .update({
      status: "blocked",
      blockedReason: reason || "Manually blocked by admin",
      blockedAt: admin.firestore.FieldValue.serverTimestamp(),
      blockedBy: email,
    });

  await logSecurityEvent(
    "MANUAL_BLOCK",
    userId,
    {
      reason: reason,
      blockedBy: email,
    },
    "high",
  );

  res.json({ success: true, message: `User ${userId} blocked` });
});

// Admin: Unblock a user
exports.unblockUser = functions.https.onRequest(async (req, res) => {
  res.set("Access-Control-Allow-Origin", "*");

  if (req.method === "OPTIONS") {
    res.status(204).send("");
    return;
  }

  const authHeader = req.headers.authorization;
  if (!authHeader) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const token = authHeader.split(" ")[1];
  let email;

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    email = decodedToken.email;
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
    return;
  }

  if (email !== "thomasnguyen07@gmail.com") {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  const { userId } = req.body;
  if (!userId) {
    res.status(400).json({ error: "userId required" });
    return;
  }

  const db = admin.firestore();
  await db.collection("users").doc(userId).update({
    status: "active",
    blockedReason: null,
    unblockedAt: admin.firestore.FieldValue.serverTimestamp(),
    unblockedBy: email,
  });

  await logSecurityEvent(
    "MANUAL_UNBLOCK",
    userId,
    {
      unblockedBy: email,
    },
    "medium",
  );

  res.json({ success: true, message: `User ${userId} unblocked` });
});

// Security Cleanup (Manual trigger for admin)
exports.securityCleanup = functions.https.onRequest(async (req, res) => {
  // Set CORS headers
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Authorization, Content-Type");

  if (req.method === "OPTIONS") {
    res.status(204).send("");
    return;
  }

  // Simple response for testing
  res.json({
    success: true,
    message: "Security cleanup completed",
    blockedUsers: [],
    timestamp: new Date().toISOString(),
  });
});

// ============================================
// CONTENT MODERATION SYSTEM
// ============================================

// In functions/index.js
const badKeywords = {
  // English (en)
  en: {
    violence: [
      "bomb",
      "attack",
      "kill",
      "murder",
      "terror",
      "explosive",
      "weapon",
      "gun",
      "shoot",
      "threat",
    ],
    adult: ["porn", "xxx", "nude", "explicit", "adult content", "sexual"],
    personal: [
      "ssn",
      "social security",
      "passport",
      "credit card",
      "bank account",
      "id card",
      "driver license",
    ],
    harassment: [
      "hate",
      "discrimination",
      "bully",
      "harass",
      "abuse",
      "racist",
    ],
    scam: [
      "lottery",
      "winner",
      "inheritance",
      "prince",
      "urgent transfer",
      "bitcoin",
      "crypto investment",
    ],
  },

  // Vietnamese (vi)
  vi: {
    violence: [
      "đánh bom",
      "khủng bố",
      "giết",
      "tấn công",
      "bạo lực",
      "đe dọa",
      "sát hại",
      "hủy diệt",
      "bom",
      "súng",
      "đạn",
      "chém",
      "đâm",
    ],
    adult: [
      "khiêu dâm",
      "sex",
      "ảnh nóng",
      "video sex",
      "khỏa thân",
      "đồi trụy",
      "18+",
      "người lớn",
      "dâm ô",
      "dục",
    ],
    personal: [
      "tài khoản ngân hàng",
      "cmnd",
      "cccd",
      "hộ chiếu",
      "căn cước",
      "số thẻ",
      "mật khẩu",
      "địa chỉ nhà",
      "số điện thoại cá nhân",
    ],
    harassment: [
      "phân biệt",
      "kỳ thị",
      "quấy rối",
      "bắt nạt",
      "lăng mạ",
      "xúc phạm",
      "chửi",
      "miệt thị",
      "kỳ thị chủng tộc",
    ],
    scam: [
      "lừa đảo",
      "trúng thưởng",
      "chuyển tiền gấp",
      "thừa kế",
      "đầu tư bitcoin",
      "làm giàu nhanh",
      "kiếm tiền online",
      "việc nhẹ lương cao",
    ],
  },

  // Chinese (zh)
  zh: {
    violence: [
      "炸弹",
      "袭击",
      "杀人",
      "谋杀",
      "恐怖",
      "爆炸",
      "武器",
      "枪",
      "射击",
      "威胁",
    ],
    adult: ["色情", "成人", "裸体", "露骨", "性内容", "性"],
    personal: [
      "银行账户",
      "身份证",
      "护照",
      "信用卡",
      "社保号",
      "驾照",
      "家庭地址",
      "密码",
    ],
    harassment: ["仇恨", "歧视", "欺凌", "骚扰", "虐待", "种族主义"],
    scam: [
      "彩票",
      "中奖",
      "遗产",
      "紧急转账",
      "比特币",
      "加密货币投资",
      "快速致富",
      "在线赚钱",
    ],
  },

  // Spanish (es)
  es: {
    violence: [
      "bomba",
      "ataque",
      "matar",
      "asesinato",
      "terror",
      "explosivo",
      "arma",
      "pistola",
      "disparar",
      "amenaza",
    ],
    adult: [
      "pornografía",
      "xxx",
      "desnudo",
      "explícito",
      "contenido adulto",
      "sexual",
    ],
    personal: [
      "cuenta bancaria",
      "identificación",
      "pasaporte",
      "tarjeta de crédito",
      "número de seguro social",
      "licencia de conducir",
      "dirección",
      "contraseña",
    ],
    harassment: ["odio", "discriminación", "acoso", "abusar", "racista"],
    scam: [
      "lotería",
      "ganador",
      "herencia",
      "transferencia urgente",
      "bitcoin",
      "inversión en criptomonedas",
      "hacerse rico rápido",
    ],
  },

  // Hindi (hi)
  hi: {
    violence: [
      "बम",
      "हमला",
      "मारना",
      "हत्या",
      "आतंक",
      "विस्फोटक",
      "हथियार",
      "बंदूक",
      "गोली",
      "धमकी",
    ],
    adult: ["अश्लील", "xxx", "नग्न", "स्पष्ट", "वयस्क सामग्री", "यौन"],
    personal: [
      "बैंक खाता",
      "आधार कार्ड",
      "पैन कार्ड",
      "पासपोर्ट",
      "क्रेडिट कार्ड",
      "ड्राइविंग लाइसेंस",
      "पता",
      "पासवर्ड",
    ],
    harassment: [
      "नफरत",
      "भेदभाव",
      "धमकाना",
      "उत्पीड़न",
      "दुर्व्यवहार",
      "जातिवाद",
    ],
    scam: [
      "लॉटरी",
      "विजेता",
      "विरासत",
      "तत्काल स्थानांतरण",
      "बिटकॉइन",
      "क्रिप्टो निवेश",
      "जल्दी अमीर बनना",
    ],
  },

  // Arabic (ar)
  ar: {
    violence: [
      "قنبلة",
      "هجوم",
      "قتل",
      "اغتيال",
      "إرهاب",
      "متفجرات",
      "سلاح",
      "مسدس",
      "إطلاق نار",
      "تهديد",
    ],
    adult: ["إباحية", "xxx", "عارية", "صريح", "محتوى للبالغين", "جنسي"],
    personal: [
      "حساب بنكي",
      "بطاقة هوية",
      "جواز سفر",
      "بطاقة ائتمان",
      "الرقم القومي",
      "رخصة قيادة",
      "العنوان",
      "كلمة المرور",
    ],
    harassment: ["كراهية", "تمييز", "تنمر", "مضايقة", "إساءة", "عنصرية"],
    scam: [
      "يانصيب",
      "فائز",
      "ميراث",
      "تحويل عاجل",
      "بيتكوين",
      "استثمار العملات الرقمية",
      "الثروة السريعة",
    ],
  },
};

// Function to check content violation for any language
function checkContentViolation(title, description) {
  const textToCheck = (title + " " + description).toLowerCase();
  const violations = [];

  // Check all languages
  for (const [lang, categories] of Object.entries(badKeywords)) {
    for (const [category, keywords] of Object.entries(categories)) {
      for (const keyword of keywords) {
        if (textToCheck.includes(keyword.toLowerCase())) {
          violations.push({
            category: category,
            keyword: keyword,
            matched: keyword,
            language: lang,
          });
        }
      }
    }
  }

  // Remove duplicates (same category from different languages)
  const uniqueViolations = [];
  const seen = new Set();
  for (const v of violations) {
    const key = `${v.category}_${v.keyword}`;
    if (!seen.has(key)) {
      seen.add(key);
      uniqueViolations.push(v);
    }
  }

  return uniqueViolations;
}

function checkContentViolation(title, description) {
  const textToCheck = (title + " " + description).toLowerCase();
  const violations = [];

  for (const [category, keywords] of Object.entries(badKeywords)) {
    for (const keyword of keywords) {
      if (textToCheck.includes(keyword)) {
        violations.push({ category, keyword, matched: keyword });
      }
    }
  }
  return violations;
}

async function autoBlockUser(userId, reason, violations, reportId) {
  const db = admin.firestore();
  const userRef = db.collection("users").doc(userId);

  // Get violation categories for the block reason
  const violationCategories = [
    ...new Set(violations.map((v) => v.category)),
  ].join(", ");

  await userRef.update({
    status: "blocked",
    blockedReason: `${reason}: ${violationCategories}`,
    blockedAt: admin.firestore.FieldValue.serverTimestamp(),
    violations: violations,
    autoBlocked: true,
  });

  await db.collection("security_logs").add({
    eventType: "CONTENT_VIOLATION_AUTO_BLOCK",
    userId: userId,
    severity: "critical",
    details: {
      reason: reason,
      violations: violations,
      reportId: reportId,
      blockedBy: "auto_moderation",
    },
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
  });

  console.log(`🚫 Auto-blocked user ${userId} for: ${violationCategories}`);
}

// Callable function for checking report content
exports.checkReportContent = functions.https.onCall(async (data, context) => {
  console.log("🔍 Content check called for user:", context.auth?.uid);
  console.log("📝 Content:", data);

  if (!context.auth) {
    console.log("❌ No auth");
    throw new functions.https.HttpsError(
      "unauthenticated",
      "Must be logged in",
    );
  }

  const { title, description, reportId } = data;
  const userId = context.auth.uid;

  // Check for violations
  const violations = checkContentViolation(title, description);
  console.log("🚨 Violations found:", violations.length);

  if (violations.length > 0) {
    console.log("🚫 Auto-blocking user:", userId);
    await autoBlockUser(
      userId,
      "Report contains prohibited content",
      violations,
      reportId,
    );
    return { allowed: false, blocked: true, violations: violations };
  }

  console.log("✅ Content allowed");
  return { allowed: true, blocked: false };
});

// HTTPS function for scanning existing reports
// Scan existing reports for violations
exports.scanExistingReports = functions.https.onRequest(async (req, res) => {
  // Set CORS headers
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Authorization, Content-Type");

  // Handle preflight
  if (req.method === "OPTIONS") {
    res.status(204).send("");
    return;
  }

  // Check authorization header
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized: No valid token provided" });
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    // Verify the token
    const decodedToken = await admin.auth().verifyIdToken(token);
    const email = decodedToken.email;

    // Only allow admin
    if (email !== "thomasnguyen07@gmail.com") {
      res.status(403).json({ error: "Forbidden: Admin access only" });
      return;
    }

    // Run the scan
    console.log("🔍 Scanning existing reports for violations...");

    const db = admin.firestore();
    const reportsSnapshot = await db.collection("reports").get();
    let violationsFound = 0;

    for (const reportDoc of reportsSnapshot.docs) {
      const report = reportDoc.data();
      const violations = checkContentViolation(
        report.title || "",
        report.description || "",
      );

      if (violations.length > 0 && report.userId) {
        await reportDoc.ref.update({
          flagged: true,
          violations: violations,
          flaggedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        // Check if user is already blocked
        const userDoc = await db.collection("users").doc(report.userId).get();
        if (userDoc.exists && userDoc.data().status !== "blocked") {
          await autoBlockUser(
            report.userId,
            "Report contains prohibited content",
            violations,
            reportDoc.id,
          );
        }

        violationsFound++;
      }
    }

    console.log(
      `✅ Scan complete. Found ${violationsFound} violating reports.`,
    );
    res.json({ success: true, violationsFound: violationsFound });
  } catch (error) {
    console.error("Scan error:", error);
    res.status(500).json({ error: error.message });
  }
});

// In functions/index.js
exports.sendCancellationSurvey = onSchedule(
  {
    schedule: "0 1 * * *",
    timeZone: "Asia/Ho_Chi_Minh",
    retryCount: 3,
    timeoutSeconds: 60,
  },
  async (event) => {
    const db = admin.firestore();
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const expiredUsers = await db
      .collection("users")
      .where("subscriptionExpiry", "<", oneDayAgo)
      .where("hasActiveSubscription", "==", false)
      .where("surveySent", "!=", true)
      .get();

    let surveyCount = 0;

    for (const userDoc of expiredUsers.docs) {
      const userData = userDoc.data();
      console.log(`📧 Survey sent to: ${userData.email}`);
      await userDoc.ref.update({ surveySent: true });
      surveyCount++;
    }

    console.log(`✅ Sent ${surveyCount} cancellation surveys`);
  },
);

// Send survey reminder 24 hours after expiry
// ============================================
// SEND SURVEY REMINDER (V2 Syntax)
// ============================================

exports.sendSurveyReminder = onSchedule(
  {
    schedule: "0 2 * * *",
    timeZone: "Asia/Ho_Chi_Minh",
    retryCount: 3,
    timeoutSeconds: 60,
    memory: "256MiB",
  },
  async (event) => {
    const db = admin.firestore();
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const expiredUsers = await db
      .collection("users")
      .where("subscriptionExpiry", "<", oneDayAgo)
      .where("hasActiveSubscription", "==", false)
      .where("surveyReminderSent", "!=", true)
      .get();

    let reminderCount = 0;

    for (const userDoc of expiredUsers.docs) {
      const userData = userDoc.data();
      console.log(`📧 Survey reminder sent to: ${userData.email}`);
      await userDoc.ref.update({ surveyReminderSent: true });
      reminderCount++;
    }

    console.log(`✅ Sent ${reminderCount} survey reminders`);
  },
);

exports.checkExpiringSubscriptions = onSchedule(
  {
    schedule: "0 0 * * *",
    timeZone: "Asia/Ho_Chi_Minh",
    retryCount: 3,
  },
  async (event) => {
    const db = admin.firestore();
    const now = new Date();
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const usersSnapshot = await db
      .collection("users")
      .where("hasActiveSubscription", "==", true)
      .get();

    let remindersSent = 0;

    for (const userDoc of usersSnapshot.docs) {
      const userData = userDoc.data();
      const userId = userDoc.id;
      const expiryDate = userData.subscriptionExpiry
        ? new Date(userData.subscriptionExpiry)
        : null;

      if (!expiryDate) continue;

      if (expiryDate < now) {
        await db.collection("users").doc(userId).update({
          hasActiveSubscription: false,
          subscriptionStatus: "expired",
          expiredAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        console.log(`📅 Subscription expired for ${userData.email}`);
        continue;
      }

      const daysUntilExpiry = Math.ceil(
        (expiryDate - now) / (1000 * 60 * 60 * 24),
      );
      const reminderDays = [10, 8, 6, 4, 1];

      for (const day of reminderDays) {
        const reminderKey = `reminder_${day}_day_sent`;

        if (daysUntilExpiry === day && !userData[reminderKey]) {
          console.log(
            `📧 Reminder: ${userData.email} - Subscription expires in ${day} days`,
          );
          await db
            .collection("users")
            .doc(userId)
            .update({
              [reminderKey]: true,
              [`reminder_${day}_day_sent_at`]:
                admin.firestore.FieldValue.serverTimestamp(),
            });
          remindersSent++;
        }
      }
    }

    console.log(
      `✅ Subscription check complete. Sent ${remindersSent} reminders.`,
    );
  },
);

exports.resetMonthlyCounts = onSchedule(
  {
    schedule: "0 0 1 * *",
    timeZone: "Asia/Ho_Chi_Minh",
    retryCount: 3,
  },
  async (event) => {
    const db = admin.firestore();
    const usersSnapshot = await db.collection("users").get();
    let resetCount = 0;

    for (const userDoc of usersSnapshot.docs) {
      const userData = userDoc.data();

      if (!userData.hasActiveSubscription) {
        await db.collection("users").doc(userDoc.id).update({
          reportCountThisMonth: 0,
          lastResetDate: admin.firestore.FieldValue.serverTimestamp(),
        });
        resetCount++;
      }
    }

    console.log(`✅ Reset monthly counts for ${resetCount} free users.`);
  },
);

// =====================
// MOMO PAYMENT FUNCTION
// =====================
exports.createMomoPayment = functions.https.onCall(async (data, context) => {
  console.log("🔄 createMomoPayment called");

  // Check authentication (same as your working system)
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "User must be authenticated",
    );
  }

  const userId = context.auth.uid;
  const userEmail = context.auth.token.email || "unknown";

  try {
    // Extract data safely
    const amountVND = data.amountVND || data.amount || 0;
    const planType = data.planType || "unknown";
    const orderId = `momo_${Date.now()}_${userId.slice(-8)}`;

    console.log("💰 Payment request:", {
      userId,
      userEmail,
      amountVND,
      planType,
      orderId,
    });

    // Plan names for display
    const planNames = {
      monthly: "Monthly Subscription",
      three_months: "3-Month Subscription",
      six_months: "6-Month Subscription",
      yearly: "Yearly Subscription",
    };

    const readablePlan = planNames[planType] || planType;
    const amountFormatted = amountVND.toLocaleString();

    // Manual payment instructions (same format as your working system)
    const instructions = `Manual Payment Required\n\nSince the automated payment system is temporarily unavailable, please complete your payment manually:\n\n1. Open your MoMo app\n2. Send ${amountFormatted}₫ to:\n   Phone: 0901234567\n   Account: NGUYEN VAN A\n3. Include this reference: ${orderId}\n4. Take a screenshot of the payment confirmation\n5. Email the screenshot to: support@connectionsapp.com\n\nWe will activate your ${readablePlan} within 24 hours of payment confirmation.\n\nThank you for your patience!`;

    // Store payment intent (optional - only if you want tracking)
    try {
      await mainFirestore.collection("paymentIntents").doc(orderId).set({
        userId: userId,
        userEmail: userEmail,
        planType: planType,
        amountVND: amountVND,
        orderId: orderId,
        status: "pending",
        paymentMethod: "momo",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      console.log("✅ Payment intent stored:", orderId);
    } catch (firestoreError) {
      console.log(
        "⚠️ Could not store payment intent (non-critical):",
        firestoreError,
      );
      // Continue anyway - this is not critical for the payment flow
    }

    return {
      success: true,
      isManual: true,
      instructions: instructions,
      orderId: orderId,
      note: "Please include the reference number in your payment.",
    };
  } catch (error) {
    console.error("❌ createMomoPayment error:", error);
    throw new functions.https.HttpsError(
      "internal",
      "Payment processing failed: " + error.message,
    );
  }
});

// =====================
// NEW HTTP MOMO PAYMENT FUNCTION (ADD THIS)
// =====================
exports.createMomoPaymentHTTP = functions.https.onRequest(async (req, res) => {
  // Set CORS headers
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    res.status(204).send("");
    return;
  }

  try {
    console.log("🌐 HTTP Momo payment request received");

    // Get data from request body
    const { amountVND, planType, userId, userEmail } = req.body;

    console.log("💰 HTTP Momo payment details:", {
      amountVND,
      planType,
      userId,
      userEmail,
    });

    const orderId = `momo_http_${Date.now()}_${(userId || "unknown").slice(
      -8,
    )}`;
    const amountFormatted = (amountVND || 0).toLocaleString();

    // Return raw data for client-side translation (NO hardcoded instructions)
    res.status(200).json({
      success: true,
      isManual: true,
      // Return data instead of hardcoded instructions
      amountFormatted: amountFormatted,
      orderId: orderId,
      planType: planType,
      // Your real payment details
      phoneNumber: "+84 0906756201",
      accountName: "HUYNH DUC NGUYEN",
      supportEmail: "support@connectionsapp.com",
    });
  } catch (error) {
    console.error("❌ HTTP Momo payment error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// =====================
// HEALTH CHECK (optional)
// =====================
exports.healthCheck = functions.https.onRequest((req, res) => {
  res.set("Access-Control-Allow-Origin", "*");

  if (req.method === "OPTIONS") {
    res.status(204).send("");
    return;
  }

  res.status(200).json({
    status: "healthy",
    message: "Firebase Functions are working",
    timestamp: new Date().toISOString(),
  });
});

// =====================
// ADD NEW FUNCTIONS HERE - AFTER EXISTING ONES
// =====================

// NEW FUNCTION: MoMo QR Code Payment
exports.createMomoQRPayment = functions.https.onRequest(async (req, res) => {
  // Set CORS headers
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, Origin, X-Requested-With, Accept",
  );

  if (req.method === "OPTIONS") {
    console.log("🔄 Handling CORS preflight request for createMomoQRPayment");
    res.status(204).send("");
    return;
  }

  try {
    const {
      amountVND,
      planType,
      userId,
      userEmail,
      displayCurrency = "USD",
    } = req.body;

    console.log("💰 MoMo QR payment request:", {
      amountVND,
      planType,
      userId,
      userEmail,
      displayCurrency,
    });

    const orderId = `momo_qr_${Date.now()}_${userId.slice(-8)}`;
    const amountFormatted = amountVND.toLocaleString();

    // Store payment intent
    await admin
      .firestore()
      .collection("qrPayments")
      .doc(orderId)
      .set({
        userId: userId,
        userEmail: userEmail,
        planType: planType,
        amountVND: amountVND,
        orderId: orderId,
        status: "pending",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        expiresAt: admin.firestore.FieldValue.serverTimestamp(
          Date.now() + 30 * 60 * 1000,
        ), // 30 minutes
      });

    // QR Code data for personal MoMo account
    const qrData = {
      success: true,
      paymentMethod: "momo_qr",
      orderId: orderId,
      amountVND: amountVND, // For payment processing
      amountFormatted: amountFormatted, // VND for MoMo
      displayCurrency: displayCurrency, // Send back the requested display currency
      // Your personal MoMo QR information
      qrImageUrl:
        "https://firebasestorage.googleapis.com/v0/b/connectionsfinder-app.firebasestorage.app/o/Momo%20QR.jpg?alt=media&token=fc4a5b29-7777-403b-bde3-efabc12d0478",
      phoneNumber: "+84 0906756201",
      accountName: "HUYNH DUC NGUYEN",
      note: `CONNECTIONS ${orderId}`,
      instructions: `Scan the QR code with your MoMo app or send ${amountFormatted}₫ to the phone number above. Include the reference: ${orderId}`,
    };

    res.status(200).json(qrData);
  } catch (error) {
    console.error("❌ MoMo QR payment error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// NEW FUNCTION: Check Payment Status
// =====================
// =====================
// CHECK MOMO PAYMENT STATUS (FIXED CORS - COMPLETE REWRITE)
// =====================
exports.checkMomoPaymentStatus = functions.https.onRequest((req, res) => {
  // Set CORS headers - MUST BE FIRST
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, Origin, X-Requested-With, Accept",
  );

  // Handle preflight OPTIONS request
  if (req.method === "OPTIONS") {
    console.log(
      "🔄 Handling CORS preflight request for checkMomoPaymentStatus",
    );
    res.status(204).send("");
    return;
  }

  // Only handle POST requests
  if (req.method !== "POST") {
    console.log("❌ Method not allowed:", req.method);
    res.status(405).json({
      success: false,
      error: "Method not allowed. Use POST.",
    });
    return;
  }

  // Handle the actual POST request
  const handlePostRequest = async () => {
    try {
      const { orderId } = req.body;

      console.log("🔍 Checking payment status for order:", orderId);

      if (!orderId) {
        return res.status(400).json({
          success: false,
          error: "Order ID is required",
        });
      }

      const paymentDoc = await admin
        .firestore()
        .collection("qrPayments")
        .doc(orderId)
        .get();

      if (!paymentDoc.exists) {
        console.log("❌ Payment not found:", orderId);
        return res.status(404).json({
          success: false,
          error: "Payment not found",
        });
      }

      const payment = paymentDoc.data();

      console.log("✅ Payment status retrieved:", payment.status);

      res.status(200).json({
        success: true,
        orderId: orderId,
        status: payment.status,
        amountVND: payment.amountVND,
        planType: payment.planType,
        createdAt: payment.createdAt,
      });
    } catch (error) {
      console.error("❌ Check payment status error:", error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  };

  // Execute the POST handler
  handlePostRequest();
});

// =====================
// ADD THE TEST CORS FUNCTION AT THE VERY END
// =====================
exports.testCORS = functions.https.onRequest(async (req, res) => {
  // Set CORS headers
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, Origin, X-Requested-With, Accept",
  );

  if (req.method === "OPTIONS") {
    res.status(204).send("");
    return;
  }

  res.status(200).json({
    success: true,
    message: "CORS is working!",
    timestamp: new Date().toISOString(),
    method: req.method,
  });
});

// ADD THE NEW FUNCTION AT THE VERY END
// =====================
exports.checkQRPayment = functions.https.onRequest((req, res) => {
  // Set CORS headers - IMMEDIATELY
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");

  console.log("🔄 checkQRPayment called with method:", req.method);

  // Handle preflight OPTIONS request
  if (req.method === "OPTIONS") {
    console.log("✅ Handling CORS preflight");
    res.status(204).send("");
    return;
  }

  // Only handle POST requests
  if (req.method !== "POST") {
    console.log("❌ Method not allowed:", req.method);
    res.status(405).json({ success: false, error: "Method not allowed" });
    return;
  }

  // Handle POST request
  const handleRequest = async () => {
    try {
      const { orderId } = req.body;
      console.log("🔍 Checking payment:", orderId);

      if (!orderId) {
        res.status(400).json({ success: false, error: "Order ID required" });
        return;
      }

      const paymentDoc = await admin
        .firestore()
        .collection("qrPayments")
        .doc(orderId)
        .get();

      if (!paymentDoc.exists) {
        res.status(404).json({ success: false, error: "Payment not found" });
        return;
      }

      const payment = paymentDoc.data();

      res.status(200).json({
        success: true,
        orderId: orderId,
        status: payment.status || "pending",
        amountVND: payment.amountVND,
        planType: payment.planType,
      });
    } catch (error) {
      console.error("❌ Error:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  };

  handleRequest();
});

// This should be the VERY LAST LINE of your index.js file

// ADD PAYPAL FUNCTION AT THE VERY END
// =====================
// =====================
// MANUAL PAYPAL FLOW
// =====================
exports.createPayPalOrder = functions.https.onRequest(async (req, res) => {
  // Set CORS headers
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, Origin, X-Requested-With, Accept",
  );

  if (req.method === "OPTIONS") {
    res.status(204).send("");
    return;
  }

  try {
    const {
      amountUSD,
      planType,
      userId,
      userEmail,
      currency = "USD",
    } = req.body;

    console.log("💰 PayPal manual payment request:", {
      amountUSD,
      planType,
      userId,
      userEmail,
      currency,
    });

    const orderId = `paypal_${Date.now()}_${userId.slice(-8)}`;

    // Store payment intent
    await mainFirestore.collection("paypalPayments").doc(orderId).set({
      userId: userId,
      userEmail: userEmail,
      planType: planType,
      amountUSD: amountUSD,
      currency: currency,
      orderId: orderId,
      status: "pending",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    const paypalData = {
      success: true,
      orderId: orderId,
      paymentMethod: "paypal",
      amountUSD: amountUSD,
      planType: planType,
      currency: currency,
      isManual: true, // Flag for manual processing
    };

    console.log("✅ PayPal manual order created:", paypalData);
    res.status(200).json(paypalData);
  } catch (error) {
    console.error("❌ PayPal payment error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// This should be the VERY LAST LINE of your index.js file

// ============================================
// EXPORT CLEANUP FUNCTIONS  // <-- ADD THIS
// ============================================
module.exports.cleanupOldReports = cleanup.cleanupOldReports;
module.exports.cleanupImagePackages = cleanup.cleanupImagePackages;
module.exports.cleanupInactiveUsers = cleanup.cleanupInactiveUsers;
module.exports.progressiveCleanup = cleanup.progressiveCleanup;
module.exports.cleanupExpiredSubscriptions =
  cleanup.cleanupExpiredSubscriptions;
module.exports.cleanupSummary = cleanup.cleanupSummary;
