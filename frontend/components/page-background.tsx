"use client"

import { usePathname } from "next/navigation"

export function PageBackground() {
  const pathname = usePathname()

  // Exclude login, signup, and home page
  const excludedPaths = ["/", "/auth/login", "/auth/signup"]
  
  // Check if current path starts with /auth/ (e.g., auth fallback paths) or is excluded
  const isExcluded = excludedPaths.includes(pathname) || pathname.startsWith("/auth/")

  if (isExcluded) {
    return null
  }

  return (
    <>
      {/* Global Background Image with Overlay */}
      <div 
        className="fixed inset-0 -z-10 bg-cover bg-center pointer-events-none transition-all duration-500"
        style={{ 
          backgroundImage: `url('/images/page-bg.jpg')`,
          filter: 'brightness(0.35) contrast(1.15) blur(3px)'
        }} 
      />
      {/* Base Gradient Backdrop behind the image */}
      <div className="fixed inset-0 -z-20 bg-gradient-to-br from-gray-950 via-black to-gray-950 pointer-events-none" />
    </>
  )
}
