"use client"

import type React from "react"

import { useAuth } from "@/frontend/hooks/useAuth"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Loader2 } from "lucide-react"

interface ProtectedRouteProps {
  children: React.ReactNode
  requireEmailVerification?: boolean
}

export function ProtectedRoute({ children, requireEmailVerification = false }: ProtectedRouteProps) {
  const { user, isLoading, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push("/auth/login")
        return
      }

      if (requireEmailVerification && user && !user.isEmailVerified) {
        router.push("/auth/verify-email")
        return
      }
    }
  }, [isLoading, isAuthenticated, user, router, requireEmailVerification])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-purple-400" />
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  if (requireEmailVerification && user && !user.isEmailVerified) {
    return null
  }

  return <>{children}</>
}
