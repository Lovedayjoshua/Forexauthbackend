import express from "express";
import admin from "firebase-admin";
import fs from "fs";

const app = express();

// ✅ Path to the secret file Render created
const serviceAccountPath = "/etc/secrets/FIREBASE_SERVICE_ACCOUNT";

// ✅ Read and parse the secret file as JSON
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));

// ✅ Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

console.log("✅ Firebase Admin initialized successfully!");

// --- Basic server test route ---
app.get("/", (req, res) => {
  res.send("Server running successfully 🚀");
});

// --- Start server ---
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
