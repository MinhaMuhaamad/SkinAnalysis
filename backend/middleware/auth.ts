import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import User, { type IUser } from "../models/User"
import { connectDB } from "../config/database"

export interface AuthenticatedRequest extends NextRequest {
  user?: IUser
}

export async function authenticateToken(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    const token = authHeader && authHeader.split(" ")[1]

    if (!token) {
      return NextResponse.json({ message: "Access token required" }, { status: 401 })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string }

    await connectDB()
    const user = await User.findById(decoded.userId).select("-password")

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 401 })
    }

    return { user }
  } catch (error) {
    console.error("Authentication error:", error)
    return NextResponse.json({ message: "Invalid token" }, { status: 401 })
  }
}

export function generateTokens(userId: string) {
  const accessToken = jwt.sign({ userId }, process.env.JWT_SECRET!, {
    expiresIn: "15m",
  })

  const refreshToken = jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET!, {
    expiresIn: "7d",
  })

  return { accessToken, refreshToken }
}

export async function verifyRefreshToken(token: string) {
  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as { userId: string }
    return decoded
  } catch (error) {
    throw new Error("Invalid refresh token")
  }
}
