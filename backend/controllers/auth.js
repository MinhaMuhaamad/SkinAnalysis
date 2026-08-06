import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// JWT Secret Key (fallback to default, but should be in .env)
const JWT_SECRET = process.env.JWT_SECRET || "makeupai_jwt_secret_key_98765";

/**
 * Register a new user
 * POST /api/auth/signup
 */
export const signup = async (req, res) => {
  try {
    const { name, email, password, subscribeNewsletter } = req.body;

    // Validate inputs
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide a name, email, and password."
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters long."
      });
    }

    // Connect to database is handled by the server wrapper before boot,
    // but mongoose will handle buffering if not yet connected.
    
    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "An account with this email address already exists."
      });
    }

    // Split name into firstName and lastName
    const nameParts = name.trim().split(" ");
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(" ") || firstName; // Fallback to first name if no last name

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = new User({
      firstName,
      lastName,
      email: email.toLowerCase(),
      password: hashedPassword,
      subscribeNewsletter: !!subscribeNewsletter
    });

    // Save to MongoDB
    await newUser.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: newUser._id, email: newUser.email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(201).json({
      success: true,
      message: "Account registered successfully!",
      token,
      user: {
        id: newUser._id,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email
      }
    });
  } catch (error) {
    console.error("❌ Signup controller error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during registration. Please try again later.",
      error: error.message
    });
  }
};

/**
 * Log in a user
 * POST /api/auth/login
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate inputs
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please enter your email and password."
      });
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or password."
      });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or password."
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(200).json({
      success: true,
      message: "Login successful!",
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email
      }
    });
  } catch (error) {
    console.error("❌ Login controller error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during login. Please try again later.",
      error: error.message
    });
  }
};

/**
 * Get current user profile (with skin analyses history)
 * GET /api/auth/me
 */
export const getMe = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      user: {
        id: req.user._id,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        email: req.user.email,
        skinAnalyses: req.user.skinAnalyses || []
      }
    });
  } catch (error) {
    console.error("❌ getMe controller error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error retrieving profile.",
      error: error.message
    });
  }
};

/**
 * Save skin analysis to user profile
 * POST /api/auth/save-analysis
 */
export const saveAnalysis = async (req, res) => {
  try {
    const { skinTone, undertone, concerns, recommendations, confidence, faceQuality, analysisId } = req.body;

    if (!skinTone || !undertone) {
      return res.status(400).json({
        success: false,
        message: "Missing required skin analysis parameters (skinTone and undertone)."
      });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found."
      });
    }

    const newAnalysis = {
      skinTone,
      undertone,
      concerns: concerns || [],
      recommendations: {
        foundations: recommendations?.foundations || [],
        concealers: recommendations?.concealers || [],
        lipsticks: recommendations?.lipsticks || [],
        eyeshadows: recommendations?.eyeshadows || [],
        blushes: recommendations?.blushes || [],
        skincare: recommendations?.skincare || []
      },
      confidence: confidence || 0,
      faceQuality: faceQuality || 0,
      analysisId: analysisId || Math.random().toString(36).substring(2, 10).toUpperCase(),
      timestamp: new Date()
    };

    user.skinAnalyses.push(newAnalysis);
    await user.save();

    console.log(`📝 Skin analysis saved successfully for user: ${user.email}`);

    return res.status(201).json({
      success: true,
      message: "Skin analysis saved successfully to your profile!",
      analysis: newAnalysis
    });
  } catch (error) {
    console.error("❌ saveAnalysis controller error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error saving skin analysis.",
      error: error.message
    });
  }
};

