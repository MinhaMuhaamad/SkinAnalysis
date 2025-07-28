"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Sparkles, ArrowRight, Play, Star } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useTheme } from "next-themes"

const models = [
  {
    id: 1,
    name: "Natural Glow",
    image: "/placeholder.svg?height=220&width=160&text=Natural+Beauty",
    description: "Enhance your natural radiance",
    category: "Natural",
  },
  {
    id: 2,
    name: "Bold Glamour",
    image: "/placeholder.svg?height=220&width=160&text=Bold+Glamour",
    description: "Make a stunning statement",
    category: "Glamour",
  },
  {
    id: 3,
    name: "Professional",
    image: "/placeholder.svg?height=220&width=160&text=Professional",
    description: "Perfect for workplace",
    category: "Professional",
  },
  {
    id: 4,
    name: "Evening Elegance",
    image: "/placeholder.svg?height=220&width=160&text=Evening+Look",
    description: "Sophisticated evening style",
    category: "Evening",
  },
  {
    id: 5,
    name: "Creative Art",
    image: "/placeholder.svg?height=220&width=160&text=Creative+Art",
    description: "Artistic expression",
    category: "Creative",
  },
]

export default function HeroSection() {
  const [currentModelIndex, setCurrentModelIndex] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const [mounted, setMounted] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const { theme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  // Auto-advance carousel
  useEffect(() => {
    if (!isHovered) {
      intervalRef.current = setInterval(() => {
        setCurrentModelIndex((prev) => (prev + 1) % models.length)
      }, 3000) // Change every 3 seconds
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isHovered])

  const handleModelHover = (index: number) => {
    setCurrentModelIndex(index)
    setIsHovered(true)
  }

  const handleModelLeave = () => {
    setIsHovered(false)
  }

  if (!mounted) {
    return null
  }

  return (
    <section
      className={`relative h-screen flex items-center justify-center overflow-hidden ${
        theme === "dark" ? "hero-background-dark" : "hero-background-light"
      } animated-hero-bg`}
    >
      {/* Floating Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="floating-professional absolute w-2 h-2 bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 rounded-full opacity-40"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 8}s`,
              animationDuration: `${8 + Math.random() * 4}s`,
            }}
          />
        ))}
      </div>

      {/* Main Content Container */}
      <div className="hero-container relative z-10 pt-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center h-[calc(100vh-4rem)]">
          {/* Left Content */}
          <div className="space-y-6 text-center lg:text-left">
            {/* Badge */}
            <div className="flex justify-center lg:justify-start">
              <div className="badge-professional flex items-center space-x-2">
                <Sparkles className="w-4 h-4" />
                <span>AI-Powered Beauty Analysis</span>
              </div>
            </div>

            {/* Main Heading */}
            <div className="space-y-3">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight tracking-tight">
                <span className="text-gradient-primary block mb-1">Discover</span>
                <span className="text-foreground block mb-1">Your True</span>
                <span className="text-gradient-secondary block">Beauty</span>
              </h1>

              <p className="text-lg lg:text-xl text-foreground/70 leading-relaxed max-w-xl mx-auto lg:mx-0">
                AI-Powered Makeup & Skin Analysis Tailored Just for You. Experience personalized beauty recommendations
                with cutting-edge technology.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link href="/skin-analysis">
                <Button size="lg" className="cta-professional group">
                  Start My Analysis
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                </Button>
              </Link>

              <Button
                variant="outline"
                size="lg"
                className="glass-professional border-white/20 hover:bg-white/10 group bg-transparent"
              >
                <Play className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
                Watch Demo
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 pt-6">
              <div className="stats-professional">
                <div className="text-2xl lg:text-3xl font-bold text-gradient-primary mb-1">100K+</div>
                <div className="text-xs text-muted-foreground font-medium">Happy Users</div>
              </div>
              <div className="stats-professional">
                <div className="text-2xl lg:text-3xl font-bold text-gradient-primary mb-1">98%</div>
                <div className="text-xs text-muted-foreground font-medium">Accuracy Rate</div>
              </div>
              <div className="stats-professional">
                <div className="flex items-center justify-center space-x-1 mb-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <div className="text-xs text-muted-foreground font-medium">5.0 Rating</div>
              </div>
            </div>
          </div>

          {/* Right Auto-Rotating 3D Carousel */}
          <div className="carousel-container">
            <div
              className={`carousel-3d-auto ${isHovered ? "paused" : ""}`}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              {models.map((model, index) => {
                const rotation = index * 72 // 360 / 5 models
                return (
                  <div
                    key={model.id}
                    className="carousel-item-auto"
                    style={
                      {
                        "--rotation": `${rotation}deg`,
                      } as React.CSSProperties
                    }
                    onMouseEnter={() => handleModelHover(index)}
                    onMouseLeave={handleModelLeave}
                  >
                    <div className="relative group h-full">
                      <Image
                        src={model.image || "/placeholder.svg"}
                        alt={model.name}
                        width={160}
                        height={220}
                        className="transition-all duration-500 group-hover:brightness-110"
                        priority={index < 3}
                      />

                      {/* Model Info Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-500">
                        <div className="absolute bottom-4 left-4 right-4 text-white">
                          <div className="text-xs font-medium text-pink-300 mb-1">{model.category}</div>
                          <h3 className="text-sm font-bold mb-1">{model.name}</h3>
                          <p className="text-xs text-white/80">{model.description}</p>
                        </div>
                      </div>

                      {/* Hover Glow Effect */}
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-blue-500/20 opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Center Glow */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-32 h-32 bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-blue-500/10 rounded-full blur-3xl"></div>
            </div>

            {/* Floating UI Elements */}
            <div className="absolute -top-4 -right-4 glass-professional p-3 rounded-xl shadow-2xl floating-professional">
              <Sparkles className="h-5 w-5 text-pink-500" />
            </div>
            <div
              className="absolute -bottom-4 -left-4 glass-professional p-2 rounded-lg shadow-xl floating-professional"
              style={{ animationDelay: "3s" }}
            >
              <div className="w-4 h-4 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"></div>
            </div>

            {/* Model Indicator Dots */}
            <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2">
              {models.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentModelIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === currentModelIndex
                      ? "bg-gradient-to-r from-pink-500 to-purple-500 w-6"
                      : "bg-white/30 hover:bg-white/50"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20">
        <div className="glass-professional w-6 h-10 rounded-full flex justify-center border border-pink-400/30">
          <div className="w-1 h-3 bg-gradient-to-b from-pink-500 to-purple-500 rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </section>
  )
}
