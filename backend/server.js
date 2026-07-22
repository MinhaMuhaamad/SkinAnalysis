import dotenv from "dotenv";
// Load dotenv configuration immediately at entry point
dotenv.config();

import express from "express";
import cors from "cors";
import connectDB from "./config/database.js";
import mongoose from "mongoose";
import authRoutes from "./routes/auth.js";

// Assert critical environment variables
if (!process.env.MONGODB_URI) {
  console.error("❌ Critical Config Error: MONGODB_URI is not defined in your environment variables (.env)");
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 5000;

// Standard Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);

// API Health check endpoint
app.get("/health", (req, res) => {
  const dbStatus = mongoose.connection.readyState;
  const statusMapping = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting"
  };

  res.status(200).json({
    success: true,
    service: "Skin Analysis Express Backend",
    database: statusMapping[dbStatus] || "unknown",
    timestamp: new Date().toISOString()
  });
});

// Verification Endpoint: Confirm database write operations
app.post("/api/verify-connection", async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        message: "Database connection is currently unavailable. Please verify Docker is running."
      });
    }

    // Dynamic test schema & model
    const testSchema = new mongoose.Schema({
      message: { type: String, required: true },
      timestamp: { type: Date, default: Date.now }
    });

    const TestModel = mongoose.models.TestVerification || mongoose.model("TestVerification", testSchema);

    // Save a verification document
    const newTest = new TestModel({
      message: "Connection verification success! Document successfully written from Node.js Express backend."
    });
    
    await newTest.save();

    console.log("📝 Successfully inserted verification document into the database.");

    return res.status(201).json({
      success: true,
      message: "Database write operation verified successfully!",
      insertedDocument: newTest
    });
  } catch (error) {
    console.error("❌ Write verification failed:", error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Graceful startup function: Database connection first, then Express boot
const bootstrap = async () => {
  try {
    console.log("🔌 Initializing connection to MongoDB...");
    
    // Connect to database (will terminate process internally if it fails)
    await connectDB();

    // Start listening
    app.listen(PORT, () => {
      console.log(`🚀 Express server is active on http://localhost:${PORT}`);
      console.log(`🩺 Health check status URL: http://localhost:${PORT}/health`);
      console.log(`🧪 Test connection endpoint: POST http://localhost:${PORT}/api/verify-connection`);
    });
  } catch (error) {
    console.error("❌ Critical server boot error:", error.message);
    process.exit(1);
  }
};

bootstrap();
