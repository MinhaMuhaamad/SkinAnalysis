import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true,
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  subscribeNewsletter: {
    type: Boolean,
    default: false,
  },
  skinAnalyses: [{
    skinTone: { type: String, required: true },
    undertone: { type: String, required: true },
    concerns: [{ type: String }],
    recommendations: {
      foundations: [{ type: String }],
      concealers: [{ type: String }],
      lipsticks: [{ type: String }],
      eyeshadows: [{ type: String }],
      blushes: [{ type: String }],
      skincare: [{ type: String }],
    },
    confidence: { type: Number },
    faceQuality: { type: Number },
    analysisId: { type: String },
    timestamp: { type: Date, default: Date.now }
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.User || mongoose.model("User", userSchema);