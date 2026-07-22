"use client"

import { useState, useEffect, createContext, useContext, type ReactNode } from "react"
import { useToast } from "@/hooks/use-toast"

interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  isEmailVerified: boolean
  profilePicture?: string
  skinType?: string
  skinTone?: string
  preferences: {
    favoriteColors: string[]
    makeupStyle: string
    experienceLevel: string
  }
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string, rememberMe?: boolean) => Promise<boolean>
  signup: (userData: SignupData) => Promise<boolean>
  logout: () => Promise<void>
  refreshToken: () => Promise<boolean>
  updateUser: (userData: Partial<User>) => void
}

interface SignupData {
  firstName: string
  lastName: string
  email: string
  password: string
  subscribeNewsletter?: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  const isAuthenticated = !!user

  // Check for existing session on mount
  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem("authToken")
      if (!token) {
        setIsLoading(false)
        return
      }

      const response = await fetch("/api/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
      } else {
        // Token might be expired, try to refresh
        await refreshToken()
      }
    } catch (error) {
      console.error("Auth check failed:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (email: string, password: string, rememberMe = false): Promise<boolean> => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, rememberMe }),
      })

      const data = await response.json()

      if (response.ok) {
        localStorage.setItem("authToken", data.token)
        setUser(data.user)
        toast({
          title: "Welcome back! ✨",
          description: "You have successfully logged in.",
        })
        return true
      } else {
        toast({
          title: "Login failed",
          description: data.message || "Invalid credentials. Please try again.",
          variant: "destructive",
        })
        return false
      }
    } catch (error) {
      toast({
        title: "Connection error",
        description: "Unable to connect to server. Please try again.",
        variant: "destructive",
      })
      return false
    }
  }

  const signup = async (userData: SignupData): Promise<boolean> => {
    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      })

      const data = await response.json()

      if (response.ok) {
        localStorage.setItem("authToken", data.token)
        setUser(data.user)
        toast({
          title: "Account created! 🎉",
          description: "Welcome to MakeupAI! Please check your email to verify your account.",
        })
        return true
      } else {
        toast({
          title: "Signup failed",
          description: data.message || "Unable to create account. Please try again.",
          variant: "destructive",
        })
        return false
      }
    } catch (error) {
      toast({
        title: "Connection error",
        description: "Unable to connect to server. Please try again.",
        variant: "destructive",
      })
      return false
    }
  }

  const logout = async (): Promise<void> => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      })
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      localStorage.removeItem("authToken")
      setUser(null)
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      })
    }
  }

  const refreshToken = async (): Promise<boolean> => {
    try {
      const response = await fetch("/api/auth/refresh", {
        method: "POST",
      })

      if (response.ok) {
        const data = await response.json()
        localStorage.setItem("authToken", data.token)
        setUser(data.user)
        return true
      } else {
        localStorage.removeItem("authToken")
        setUser(null)
        return false
      }
    } catch (error) {
      console.error("Token refresh failed:", error)
      localStorage.removeItem("authToken")
      setUser(null)
      return false
    }
  }

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...userData })
    }
  }

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    signup,
    logout,
    refreshToken,
    updateUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
