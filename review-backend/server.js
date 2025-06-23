import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import * as dotenv from "dotenv";
import jwt from "jsonwebtoken";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || "your_default_secret";

// MongoDB Schema
const analysisSchema = new mongoose.Schema({
  code: String,
  pylint_output: String,
  bandit_output: String,
  createdAt: { type: Date, default: Date.now }
});

const AnalysisResult = mongoose.model("AnalysisResult", analysisSchema, "reviews");

// MongoDB Atlas Connection (from .env or Render environment)
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ MongoDB connection failed:", err));

// JWT Middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.sendStatus(401); // Unauthorized

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403); // Forbidden
    req.user = user;
    next();
  });
}

function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.sendStatus(403); // Forbidden
    }
    next();
  };
}

// Demo login route (for generating JWT token)
app.post("/api/login", (req, res) => {
  const { username, role } = req.body;
  if (!username || !["admin", "viewer"].includes(role)) {
    return res.status(400).json({ error: "Username and valid role required (admin/viewer)" });
  }

  const token = jwt.sign({ username, role }, JWT_SECRET, { expiresIn: "1h" });
  res.json({ token, role });
});

// Public route to save analysis results (no auth)
app.post("/api/analysis", async (req, res) => {
  try {
    const result = new AnalysisResult(req.body);
    await result.save();
    res.status(201).json({ message: "Saved to MongoDB" });
  } catch (err) {
    console.error("❌ Failed to save", err);
    res.status(500).json({ error: "Failed to save analysis result" });
  }
});

// Protected route to fetch analysis results (admin only)
app.get("/api/secure-analysis", authenticateToken, authorizeRoles("admin"), async (req, res) => {
  try {
    const results = await AnalysisResult.find().sort({ createdAt: -1 });
    res.status(200).json(results);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch secure analysis results" });
  }
});

// Public route to fetch results (used in dashboard)
app.get("/api/analysis", async (req, res) => {
  try {
    const results = await AnalysisResult.find().sort({ createdAt: -1 });
    res.status(200).json(results);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch analysis results" });
  }
});

// Run server on environment port (for Render) or 3001 locally
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Express MongoDB server running on http://localhost:${PORT}`);
});
