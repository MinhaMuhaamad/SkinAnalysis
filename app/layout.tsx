import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "MakeupAI - AI-Powered Beauty Analysis",
  description:
    "Discover your true beauty with AI-powered makeup and skin analysis. Get personalized recommendations and virtual try-on experiences.",
  keywords: ["makeup", "AI", "beauty", "skin analysis", "virtual try-on", "cosmetics"],
  authors: [{ name: "MakeupAI Team" }],
  creator: "MakeupAI",
  publisher: "MakeupAI",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
