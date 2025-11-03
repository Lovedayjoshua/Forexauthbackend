// ==========================
// ForexAuth Backend (Render)
// ==========================

import express from "express";
import admin from "firebase-admin";
import fs from "fs";
import cors from "cors";

// --- Initialize App ---
const app = express();
app.use(cors());
app.use(express.json());

// --- Firebase Admin Setup ---
// ✅ Path to your Render Secret File
const serviceAccountPath = "/etc/secrets/FIREBASE_CREDENTIALS";

// ✅ Load and parse the secret file
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));

// ✅ Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore(); // ✅ Firestore database reference
console.log("✅ Firebase Admin initialized successfully!");

// --- Root Test Route ---
app.get("/", (req, res) => {
  res.send("Server running successfully 🚀");
});

// --- Signup Route ---
app.post("/signup", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await admin.auth().createUser({
      email,
      password,
    });

    res.status(201).json({
      message: "User created successfully",
      user: {
        uid: user.uid,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// --- Login Route (placeholder for frontend) ---
app.post("/login", async (req, res) => {
  const { email } = req.body;

  try {
    // Firebase Admin can’t verify passwords directly; frontend does that
    res.status(200).json({ message: "Login route working", email });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// --- Forgot Password Route ---
app.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  try {
    const link = await admin.auth().generatePasswordResetLink(email);
    res.status(200).json({
      message: "Password reset link generated successfully",
      resetLink: link,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ==========================
// 📘 Trading Journal Routes
// ==========================

// Save trade journal entry
app.post("/api/journal", async (req, res) => {
  try {
    const { pair, entry, exit, lot, profit, timestamp } = req.body;

    if (!pair || !entry || !exit || !lot) {
      return res.status(400).json({ success: false, error: "Missing fields" });
    }

    const journalRef = db.collection("trading_journal");
    await journalRef.add({
      pair,
      entry,
      exit,
      lot,
      profit,
      timestamp: timestamp || new Date().toISOString(),
    });

    res.json({ success: true, message: "Journal saved successfully" });
  } catch (err) {
    console.error("Error saving journal:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Fetch all journal entries
app.get("/api/journal", async (req, res) => {
  try {
    const snapshot = await db
      .collection("trading_journal")
      .orderBy("timestamp", "desc")
      .get();

    const trades = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.json({ success: true, trades });
  } catch (err) {
    console.error("Error fetching journal:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// --- Start Server ---
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));

