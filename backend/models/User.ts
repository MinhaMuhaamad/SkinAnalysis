import mongoose, { type Document, Schema } from "mongoose"
import bcrypt from "bcryptjs"
import crypto from "crypto"

export interface IUser extends Document {
  firstName: string
  lastName: string
  email: string
  password: string
  isEmailVerified: boolean
  emailVerificationToken?: string
  emailVerificationExpires?: Date
  passwordResetToken?: string
  passwordResetExpires?: Date
  profilePicture?: string
  skinType?: string
  skinTone?: string
  preferences: {
    favoriteColors: string[]
    makeupStyle: string
    experienceLevel: string
  }
  subscribeNewsletter: boolean
  createdAt: Date
  updatedAt: Date
  comparePassword(candidatePassword: string): Promise<boolean>
  generateEmailVerificationToken(): string
  generatePasswordResetToken(): string
}

const userSchema = new Schema<IUser>(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Please enter a valid email"],
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: String,
    emailVerificationExpires: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    profilePicture: {
      type: String,
      default: "",
    },
    skinType: {
      type: String,
      enum: ["oily", "dry", "combination", "sensitive", "normal"],
      default: "normal",
    },
    skinTone: {
      type: String,
      enum: ["fair", "light", "medium", "tan", "deep"],
      default: "medium",
    },
    preferences: {
      favoriteColors: {
        type: [String],
        default: [],
      },
      makeupStyle: {
        type: String,
        enum: ["natural", "glamorous", "bold", "vintage", "minimalist"],
        default: "natural",
      },
      experienceLevel: {
        type: String,
        enum: ["beginner", "intermediate", "advanced"],
        default: "beginner",
      },
    },
    subscribeNewsletter: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
)

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next()

  try {
    const salt = await bcrypt.genSalt(12)
    this.password = await bcrypt.hash(this.password, salt)
    next()
  } catch (error: any) {
    next(error)
  }
})

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password)
}

// Generate email verification token
userSchema.methods.generateEmailVerificationToken = function (): string {
  const token = crypto.randomBytes(32).toString("hex")
  this.emailVerificationToken = crypto.createHash("sha256").update(token).digest("hex")
  this.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
  return token
}

// Generate password reset token
userSchema.methods.generatePasswordResetToken = function (): string {
  const token = crypto.randomBytes(32).toString("hex")
  this.passwordResetToken = crypto.createHash("sha256").update(token).digest("hex")
  this.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
  return token
}

export default mongoose.models.User || mongoose.model<IUser>("User", userSchema)
