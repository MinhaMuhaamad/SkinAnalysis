import { type NextRequest, NextResponse } from "next/server"
import { connectDB } from "../../config/database"
import User from "../../models/User"
import { generateTokens } from "../../middleware/auth"

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const { email, password, rememberMe } = await request.json()

    // Validation
    if (!email || !password) {
      return NextResponse.json({ message: "Email and password are required" }, { status: 400 })
    }

    // Find user and include password for comparison
    const user = await User.findOne({ email: email.toLowerCase() }).select("+password")
    if (!user) {
      return NextResponse.json({ message: "Invalid email or password" }, { status: 401 })
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password)
    if (!isPasswordValid) {
      return NextResponse.json({ message: "Invalid email or password" }, { status: 401 })
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user._id.toString())

    // Set refresh token as httpOnly cookie
    const response = NextResponse.json(
      {
        message: "Login successful",
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          isEmailVerified: user.isEmailVerified,
          profilePicture: user.profilePicture,
          skinType: user.skinType,
          skinTone: user.skinTone,
          preferences: user.preferences,
        },
        token: accessToken,
      },
      { status: 200 },
    )

    // Set refresh token cookie with appropriate expiration
    const cookieMaxAge = rememberMe ? 30 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000 // 30 days or 7 days

    response.cookies.set("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: cookieMaxAge,
    })

    return response
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
