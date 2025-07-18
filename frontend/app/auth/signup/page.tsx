"use client"

import { SignupForm } from "@/components/auth/signup-form"
import { useRouter } from "next/navigation"

export default function SignupPage() {
  const router = useRouter()

  const handleSignupSuccess = () => {
    router.push("/auth/login")
  }

  return <SignupForm onSuccess={handleSignupSuccess} />
}
