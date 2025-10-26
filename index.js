import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import admin from "firebase-admin";
import bodyParser from "body-parser";

// ✅ Load environment variables from .env
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

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

// ✅ Initialize Firebase Admin
try {
  const serviceAccount = JSON.parse(process.env.FIREBASE_CREDENTIALS);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
  console.log("✅ Firebase Admin initialized successfully");
} catch (error) {
  console.error("❌ Firebase Admin not initialized:", error.message);
}

// ✅ Root route (check if backend is running)
app.get("/", (req, res) => {
  res.send("✅ Server running and Firebase connected!");
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

// ✅ Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
