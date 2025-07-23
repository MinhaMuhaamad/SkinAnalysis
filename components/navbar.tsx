"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, Palette, User, Moon, Sun, Sparkles, Zap } from "lucide-react"
import { useTheme } from "next-themes"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { setTheme, theme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  const navigation = [
    { name: "Skin Analysis", href: "/skin-analysis" },
    { name: "Virtual Try-On", href: "/virtual-tryOn" },
    { name: "Lookbook", href: "/lookbook" },
    { name: "Occasions", href: "/occasions" },
    { name: "Products", href: "/products" },
  ]

  return (
    <nav className="sticky top-0 z-50 w-full glass-morphism border-b border-white/10 dark:border-white/5">
      <div className="container-premium">
        <div className="flex h-20 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-accent rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-pink-500/25 transition-all duration-300 animate-pulse-glow">
                  <Palette className="h-7 w-7 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full flex items-center justify-center animate-float">
                  <Sparkles className="h-3 w-3 text-white" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-3xl font-bold font-poppins text-shimmer">MakeupAI</span>
                <span className="text-xs text-muted-foreground font-medium">Beauty Revolution</span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navigation.map((item, index) => (
              <Link
                key={item.name}
                href={item.href}
                className={`px-4 py-2 text-sm font-medium text-foreground/80 hover:text-foreground transition-all duration-300 relative group rounded-lg hover:bg-white/10 dark:hover:bg-white/5 animate-fade-in-down delay-${index * 100}`}
              >
                {item.name}
                <span className="absolute -bottom-1 left-1/2 w-0 h-0.5 bg-gradient-accent group-hover:w-full group-hover:left-0 transition-all duration-300"></span>
              </Link>
            ))}
          </div>

          <div className="flex items-center space-x-3">
            {mounted && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                className="relative overflow-hidden group hover:bg-white/10 dark:hover:bg-white/5 transition-all duration-300 animate-fade-in-down delay-500"
              >
                <Sun className="h-5 w-5 rotate-0 scale-100 transition-all duration-500 dark:-rotate-90 dark:scale-0 text-orange-500" />
                <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all duration-500 dark:rotate-0 dark:scale-100 text-blue-400" />
                <span className="sr-only">Toggle theme</span>
                <div className="absolute inset-0 bg-gradient-accent opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
              </Button>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative overflow-hidden group hover:bg-white/10 dark:hover:bg-white/5 transition-all duration-300 animate-fade-in-down delay-600"
                >
                  <User className="h-5 w-5" />
                  <div className="absolute inset-0 bg-gradient-accent opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="glass-morphism border-white/20 dark:border-white/10 animate-scale-in"
              >
                <DropdownMenuItem asChild>
                  <Link href="/auth/login" className="cursor-pointer">
                    Login
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/auth/signup" className="cursor-pointer">
                    Sign Up
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="cursor-pointer">
                    Profile
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile menu */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative overflow-hidden group hover:bg-white/10 dark:hover:bg-white/5 transition-all duration-300 animate-fade-in-down delay-700"
                >
                  <Menu className="h-5 w-5" />
                  <div className="absolute inset-0 bg-gradient-accent opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                </Button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="w-[300px] sm:w-[400px] glass-morphism border-white/20 dark:border-white/10"
              >
                <div className="flex flex-col space-y-6 mt-8">
                  <div className="flex items-center space-x-3 pb-6 border-b border-white/20 dark:border-white/10">
                    <div className="w-10 h-10 bg-gradient-accent rounded-xl flex items-center justify-center">
                      <Zap className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-gradient">MakeupAI</p>
                      <p className="text-xs text-muted-foreground">Beauty Revolution</p>
                    </div>
                  </div>

                  {navigation.map((item, index) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`text-lg font-medium hover:text-pink-500 transition-colors duration-300 animate-fade-in-right delay-${(index + 1) * 100}`}
                      onClick={() => setIsOpen(false)}
                    >
                      {item.name}
                    </Link>
                  ))}

                  <div className="pt-6 border-t border-white/20 dark:border-white/10 space-y-4">
                    <Link
                      href="/auth/login"
                      className="block text-lg font-medium hover:text-pink-500 transition-colors duration-300 animate-fade-in-right delay-700"
                      onClick={() => setIsOpen(false)}
                    >
                      Login
                    </Link>
                    <Link
                      href="/auth/signup"
                      className="block text-lg font-medium hover:text-pink-500 transition-colors duration-300 animate-fade-in-right delay-800"
                      onClick={() => setIsOpen(false)}
                    >
                      Sign Up
                    </Link>
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
