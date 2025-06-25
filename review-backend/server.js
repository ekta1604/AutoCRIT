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

// ✅ Schema with code_hash as unique index
const analysisSchema = new mongoose.Schema({
  code: String,
  pylint_output: String,
  bandit_output: String,
  gpt_suggestion: String,
  code_hash: { type: String, unique: true, index: true },
  createdAt: { type: Date, default: Date.now }
});

const AnalysisResult = mongoose.model("AnalysisResult", analysisSchema, "reviews");

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ MongoDB connection failed:", err));

// JWT middleware (for future use)
function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.sendStatus(403);
    }
    next();
  };
}

app.post("/api/login", (req, res) => {
  const { username, role } = req.body;
  if (!username || !["admin", "viewer"].includes(role)) {
    return res.status(400).json({ error: "Username and valid role required" });
  }

  const token = jwt.sign({ username, role }, JWT_SECRET, { expiresIn: "1h" });
  res.json({ token, role });
});

// ✅ Save analysis
app.post("/api/analysis", async (req, res) => {
  try {
    const result = new AnalysisResult(req.body);
    await result.save();
    res.status(201).json({ message: "Saved to MongoDB" });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: "Duplicate code_hash" });
    }
    console.error("❌ Save failed:", err);
    res.status(500).json({ error: "Failed to save analysis result" });
  }
});

// ✅ Check for existing code_hash
app.post("/api/analysis/check", async (req, res) => {
  try {
    const { code_hash } = req.body;
    const result = await AnalysisResult.findOne({ code_hash });
    res.json({ exists: !!result, result });
  } catch (err) {
    console.error("❌ Error checking duplicate:", err);
    res.status(500).json({ error: "Internal error" });
  }
});

// Public and secure fetch endpoints
app.get("/api/analysis", async (req, res) => {
  try {
    const results = await AnalysisResult.find().sort({ createdAt: -1 });
    res.status(200).json(results);
  } catch (err) {
    res.status(500).json({ error: "Fetch failed" });
  }
});

app.get("/api/secure-analysis", authenticateToken, authorizeRoles("admin"), async (req, res) => {
  try {
    const results = await AnalysisResult.find().sort({ createdAt: -1 });
    res.status(200).json(results);
  } catch (err) {
    res.status(500).json({ error: "Secure fetch failed" });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Express MongoDB server running on http://localhost:${PORT}`);
});
