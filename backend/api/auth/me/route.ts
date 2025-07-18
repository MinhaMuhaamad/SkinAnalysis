import { type NextRequest, NextResponse } from "next/server"
import { authenticateToken } from "../../middleware/auth"

export async function GET(request: NextRequest) {
  try {
    const authResult = await authenticateToken(request)

    if (authResult instanceof NextResponse) {
      return authResult
    }

    const { user } = authResult

    return NextResponse.json(
      {
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
  } catch (error) {
    console.error("Get user error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
