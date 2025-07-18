import { type NextRequest, NextResponse } from "next/server"
import { connectDB } from "../../config/database"
import User from "../../models/User"
import { sendEmail, generatePasswordResetEmailHTML } from "../../services/emailService"

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ message: "Email is required" }, { status: 400 })
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() })
    if (!user) {
      // Don't reveal if user exists or not for security
      return NextResponse.json(
        { message: "If an account with that email exists, we've sent a password reset link." },
        { status: 200 },
      )
    }

    // Generate reset token
    const resetToken = user.generatePasswordResetToken()
    await user.save()

    // Send reset email
    const resetUrl = `${process.env.FRONTEND_URL}/auth/reset-password?token=${resetToken}`
    const emailHTML = generatePasswordResetEmailHTML(`${user.firstName} ${user.lastName}`, resetUrl)

    await sendEmail({
      to: email,
      subject: "Reset Your MakeupAI Password",
      html: emailHTML,
      text: `Reset your password by visiting: ${resetUrl}`,
    })

    return NextResponse.json(
      { message: "If an account with that email exists, we've sent a password reset link." },
      { status: 200 },
    )
  } catch (error) {
    console.error("Forgot password error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
