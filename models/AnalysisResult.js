import mongoose from "mongoose";

const analysisResultSchema = new mongoose.Schema({
  repo: String,
  prNumber: Number,
  filename: String,
  pylint: String,
  bandit: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const AnalysisResult = mongoose.model("AnalysisResult", analysisResultSchema);

export default AnalysisResult;
