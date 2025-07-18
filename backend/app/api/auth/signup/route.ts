import { type NextRequest, NextResponse } from "next/server"
import { connectDB } from "../../../config/database"
import User from "../../../models/User"
import { sendEmail, generateVerificationEmailHTML } from "../../../services/emailService"
import { generateTokens } from "../../../middleware/auth"

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const { firstName, lastName, email, password, subscribeNewsletter } = await request.json()

    // Validation
    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json({ message: "All fields are required" }, { status: 400 })
    }

    if (password.length < 8) {
      return NextResponse.json({ message: "Password must be at least 8 characters long" }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() })
    if (existingUser) {
      return NextResponse.json({ message: "User already exists with this email" }, { status: 409 })
    }

    // Create new user
    const user = new User({
      firstName,
      lastName,
      email: email.toLowerCase(),
      password,
      subscribeNewsletter: subscribeNewsletter || false,
    })

    // Generate email verification token
    const verificationToken = user.generateEmailVerificationToken()
    await user.save()

    // Send verification email
    const verificationUrl = `${process.env.FRONTEND_URL}/auth/verify-email?token=${verificationToken}`
    const emailHTML = generateVerificationEmailHTML(`${firstName} ${lastName}`, verificationUrl)

    await sendEmail({
      to: email,
      subject: "Welcome to MakeupAI - Verify Your Email",
      html: emailHTML,
      text: `Welcome to MakeupAI! Please verify your email by visiting: ${verificationUrl}`,
    })

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user._id.toString())

    // Set refresh token as httpOnly cookie
    const response = NextResponse.json(
      {
        message: "Account created successfully! Please check your email to verify your account.",
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          isEmailVerified: user.isEmailVerified,
        },
        token: accessToken,
      },
      { status: 201 },
    )

    response.cookies.set("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    })

    return response
  } catch (error) {
    console.error("Signup error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
