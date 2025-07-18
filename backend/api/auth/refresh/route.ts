import { type NextRequest, NextResponse } from "next/server"
import { connectDB } from "../../config/database"
import User from "../../models/User"
import { verifyRefreshToken, generateTokens } from "../../middleware/auth"

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const refreshToken = request.cookies.get("refreshToken")?.value

    if (!refreshToken) {
      return NextResponse.json({ message: "Refresh token not found" }, { status: 401 })
    }

    // Verify refresh token
    const decoded = await verifyRefreshToken(refreshToken)
    const user = await User.findById(decoded.userId)

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 401 })
    }

    // Generate new tokens
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user._id.toString())

    // Set new refresh token as httpOnly cookie
    const response = NextResponse.json(
      {
        message: "Token refreshed successfully",
        token: accessToken,
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
      },
      { status: 200 },
    )

    response.cookies.set("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    })

    return response
  } catch (error) {
    console.error("Token refresh error:", error)
    return NextResponse.json({ message: "Invalid refresh token" }, { status: 401 })
  }
}
