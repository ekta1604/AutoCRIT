import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import * as dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const analysisSchema = new mongoose.Schema({
  code: String,
  pylint_output: String,
  bandit_output: String,
  createdAt: { type: Date, default: Date.now }
});

const AnalysisResult = mongoose.model("AnalysisResult", analysisSchema, "reviews");

mongoose.connect("mongodb://mongodb:27017/codeReviews")
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ MongoDB connection failed:", err));

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

app.get("/api/analysis", async (req, res) => {
  try {
    const results = await AnalysisResult.find().sort({ createdAt: -1 });
    res.status(200).json(results);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch analysis results" });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`🚀 Express MongoDB server running on http://localhost:${PORT}`);
});
