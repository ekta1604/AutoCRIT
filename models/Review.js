import mongoose from "mongoose";

const FileSchema = new mongoose.Schema({
  filename: String,
  pylint: String,
  bandit: String,
});

const ReviewSchema = new mongoose.Schema({
  repo: String,
  prNumber: Number,
  user: String,
  files: [FileSchema],
  analyzedAt: { type: Date, default: Date.now },
});

const Review = mongoose.model("Review", ReviewSchema);
export default Review;
