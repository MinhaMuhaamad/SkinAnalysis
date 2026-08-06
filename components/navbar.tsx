"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, Moon, Sun, Sparkles, User as UserIcon } from "lucide-react"
import { useTheme } from "next-themes"

export function Navbar() {
  const [mounted, setMounted] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const { theme, setTheme } = useTheme()
  const [user, setUser] = useState<{ firstName: string; lastName: string } | null>(null)

  useEffect(() => {
    setMounted(true)
    const fetchUser = async () => {
      const token = localStorage.getItem("authToken")
      if (!token) return

      try {
        const response = await fetch("/api/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
        if (response.ok) {
          const data = await response.json()
          if (data.success && data.user) {
            setUser(data.user)
          }
        } else {
          localStorage.removeItem("authToken")
        }
      } catch (err) {
        console.error("Error fetching user profile:", err)
      }
    }
    fetchUser()
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("authToken")
    setUser(null)
    window.location.reload()
  }

  if (!mounted) {
    return null
  }

  const navItems = [
    { name: "Skin Analysis", href: "/skin-analysis" },
    { name: "Virtual Try-On", href: "/virtual-tryOn" },
    { name: "Lookbook", href: "/lookbook" },
    { name: "Products", href: "/products" },
    { name: "Occasions", href: "/occasions" },
  ]

  return (
    <nav className="navbar-transparent">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-purple-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
              MakeupAI
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-foreground/80 hover:text-foreground transition-colors duration-300 font-medium hover:scale-105 transform"
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="glass-professional border-0 hover:bg-white/10"
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-foreground/80 flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
                  <UserIcon className="h-4 w-4 text-pink-400" />
                  Hi, {user.firstName}
                </span>
                <Button 
                  onClick={handleLogout} 
                  variant="ghost" 
                  className="glass-professional border-0 hover:bg-red-500/10 hover:text-red-400"
                >
                  Logout
                </Button>
              </div>
            ) : (
              <>
                <Link href="/auth/login">
                  <Button variant="ghost" className="glass-professional border-0 hover:bg-white/10">
                    Login
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button className="cta-professional px-6 py-2 text-sm">Sign Up</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu */}
          <div className="md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="glass-professional border-0">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="glass-professional border-l border-white/20">
                <div className="flex flex-col space-y-6 mt-8">
                  {navItems.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className="text-foreground/80 hover:text-foreground transition-colors duration-300 font-medium text-lg"
                    >
                      {item.name}
                    </Link>
                  ))}
                  <div className="flex items-center space-x-4 pt-6 border-t border-white/20">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                      className="glass-professional border-0"
                    >
                      {theme === "dark" ? <Sun className="h-4 w-4 mr-2" /> : <Moon className="h-4 w-4 mr-2" />}
                      {theme === "dark" ? "Light" : "Dark"}
                    </Button>
                  </div>
                  <div className="flex flex-col space-y-3">
                    {user ? (
                      <>
                        <div className="text-base font-semibold text-foreground/90 flex items-center gap-2 px-3 py-2 border-b border-white/10 mb-2">
                          <UserIcon className="h-5 w-5 text-pink-400" />
                          Hi, {user.firstName} {user.lastName}
                        </div>
                        <Button 
                          onClick={() => { setIsOpen(false); handleLogout(); }} 
                          variant="ghost" 
                          className="w-full glass-professional border-0 hover:bg-red-500/10 hover:text-red-400"
                        >
                          Logout
                        </Button>
                      </>
                    ) : (
                      <>
                        <Link href="/auth/login" onClick={() => setIsOpen(false)}>
                          <Button variant="ghost" className="w-full glass-professional border-0">
                            Login
                          </Button>
                        </Link>
                        <Link href="/auth/signup" onClick={() => setIsOpen(false)}>
                          <Button className="w-full cta-professional">Sign Up</Button>
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  )
}
