// ✅ ForexAuth Backend - Render Ready Version

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import admin from "firebase-admin";
import bodyParser from "body-parser";

// ✅ Load environment variables from .env (if local)
dotenv.config();

const app = express();

// ✅ Use Render's assigned port (important)
const PORT = process.env.PORT || 10000;

// ✅ Basic security & middleware setup
app.use(helmet());
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());

// ✅ Rate limiter to prevent abuse (max 100 requests per minute per IP)
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100,
  message: "Too many requests from this IP, please try again later.",
});
app.use(limiter);

// ✅ Initialize Firebase Admin safely
try {
  const serviceAccount = JSON.parse(process.env.FIREBASE_CREDENTIALS);

  // 🔧 Fix Render’s double-escaped \n issue in private key
  if (serviceAccount.private_key) {
    serviceAccount.private_key = serviceAccount.private_key
      .replace(/\\n/gm, "\n")
      .replace(/\r/gm, "");
  }

  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log("✅ Firebase Admin initialized successfully");
  } else {
    console.log("⚠️ Firebase Admin already initialized");
  }
} catch (error) {
  console.error("❌ Firebase Admin not initialized:", error.message);
}

// ✅ Root route (check if backend is running)
app.get("/", async (req, res) => {
  try {
    // Test Firebase connectivity by getting users count (optional)
    await admin.auth().listUsers(1);
    res.send("✅ Server running and Firebase connected successfully!");
  } catch (error) {
    res.send("⚠️ Server running but Firebase not connected: " + error.message);
  }
});

// ✅ Example route: Create Firebase user
app.post("/api/create-user", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    const userRecord = await admin.auth().createUser({
      email,
      password,
    });
    res.json({ success: true, user: userRecord });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ✅ Start server (Render-compatible)
app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Server running on port ${PORT}`);
});
