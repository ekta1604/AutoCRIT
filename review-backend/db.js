import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect("mongodb://mongodb:27017/codeReviews", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  }
};

export default connectDB;
