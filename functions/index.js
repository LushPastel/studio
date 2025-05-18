
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const express = require("express");
const cors = require("cors");

admin.initializeApp();
const db = admin.firestore();

const app = express();
app.use(cors({ origin: true }));

// Get leaderboard
app.get("/leaderboard", async (req, res) => {
  try {
    const snapshot = await db.collection("users")
      .orderBy("coins", "desc")
      .limit(15)
      .get();

    const leaderboard = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.status(200).json({ success: true, leaderboard });
  } catch (error)
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update coins for a user
app.post("/updateCoins", async (req, res) => {
  const { userId, coins } = req.body;

  if (!userId || typeof coins !== "number") {
    return res.status(400).json({ success: false, error: "Invalid request" });
  }

  try {
    // Ensure the user document exists before attempting to update, or use .set with merge option
    const userRef = db.collection("users").doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      // If you want to create the user if they don't exist with these coins:
      // await userRef.set({ coins }, { merge: true });
      // Or if you expect the user to always exist:
      return res.status(404).json({ success: false, error: "User not found" });
    }

    await userRef.update({ coins });
    res.status(200).json({ success: true, message: "Coins updated" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/*
// Optional: Authentication middleware (add to relevant routes)
const verifyToken = async (req, res, next) => {
  const token = req.headers.authorization?.split("Bearer ")[1];
  if (!token) return res.status(401).send("Unauthorized");

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken; // Attach user info to request
    next();
  } catch (error) {
    res.status(403).send("Invalid token");
  }
};

// Example usage with authentication:
// app.post("/updateCoins", verifyToken, async (req, res) => { ... });
*/

exports.api = functions.https.onRequest(app);
