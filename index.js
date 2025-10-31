// ✅ ForexAuth Backend - Render Ready Version

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import admin from "firebase-admin";
import bodyParser from "body-parser";
import fs from "fs";

// ✅ Load environment variables from .env (for local dev)
dotenv.config();

const app = express();

// ✅ Use Render’s assigned port
const PORT = process.env.PORT || 10000;

// ✅ Middleware & security setup
app.use(helmet());
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());

// ✅ Rate limiter
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100,
  message: "Too many requests from this IP, please try again later.",
});
app.use(limiter);

// ✅ Firebase initialization using Secret File on Render
try {
  // 🔥 Path where Render stores secret files
  const serviceAccountPath = "/etc/secrets/forexauth-54d1e-firebase-adminsdk-fbsvc-c5173ff227.json";

  // ✅ Read & parse the file
  const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));

  // ✅ Initialize Firebase
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log("✅ Firebase Admin initialized successfully from secret file");
  }
} catch (error) {
  console.error("❌ Firebase Admin not initialized:", error.message);
}

// ✅ Root route
app.get("/", async (req, res) => {
  try {
    await admin.auth().listUsers(1);
    res.send("✅ Server running and Firebase connected successfully!");
  } catch (error) {
    res.send("⚠️ Server running but Firebase not connected: " + error.message);
  }
});

// ✅ Create user route
app.post("/api/create-user", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    const userRecord = await admin.auth().createUser({ email, password });
    res.json({ success: true, user: userRecord });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ✅ Start server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Server running on port ${PORT}`);
});
