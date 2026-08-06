import jwt from "jsonwebtoken";
import User from "../models/User.js";

const JWT_SECRET = process.env.JWT_SECRET || "makeupai_jwt_secret_key_98765";

/**
 * Middleware to protect routes with JWT authentication.
 * Expects header: Authorization: Bearer <token>
 */
export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(" ")[1];

      // Verify token
      const decoded = jwt.verify(token, JWT_SECRET);

      // Get user from the token (exclude password)
      req.user = await User.findById(decoded.userId).select("-password");

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "User not found or authorized."
        });
      }

      next();
    } catch (error) {
      console.error("❌ Auth middleware error:", error.message);
      return res.status(401).json({
        success: false,
        message: "Not authorized, token verification failed."
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Not authorized, no token provided."
    });
  }
};
