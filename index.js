import express from "express";
import admin from "firebase-admin";
import fs from "fs";

const app = express();

// ✅ Path to your Render Secret File
const serviceAccountPath = "/etc/secrets/FIREBASE_CREDENTIALS";

// ✅ Load and parse the service account JSON
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));

// ✅ Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

console.log("✅ Firebase Admin initialized successfully!");

// --- Example route for testing ---
app.get("/", (req, res) => {
  res.send("Server running successfully 🚀");
});

// --- Start the server ---
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
