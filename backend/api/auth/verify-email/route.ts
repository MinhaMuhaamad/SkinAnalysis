import { type NextRequest, NextResponse } from "next/server"
import { connectDB } from "../../config/database"
import User from "../../models/User"

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const { token } = await request.json()

    if (!token) {
      return NextResponse.json({ message: "Verification token is required" }, { status: 400 })
    }

    // Find user with verification token
    const user = await User.findOne({ emailVerificationToken: token })
    if (!user) {
      return NextResponse.json({ message: "Invalid or expired verification token" }, { status: 400 })
    }

    // Update user verification status
    user.isEmailVerified = true
    user.emailVerificationToken = undefined
    await user.save()

    return NextResponse.json(
      {
        message: "Email verified successfully! You can now access all features.",
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          isEmailVerified: user.isEmailVerified,
        },
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Email verification error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
