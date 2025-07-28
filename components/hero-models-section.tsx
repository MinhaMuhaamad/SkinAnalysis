"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sparkles, Wand2, Play, ArrowRight } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

const models = [
  {
    id: 1,
    name: "Natural Beauty",
    image: "/placeholder.svg?height=400&width=300&text=Natural+Beauty+Model",
    hoverImage: "/placeholder.svg?height=500&width=400&text=Natural+Makeup+Look",
    position: "left-[5%] top-[20%]",
    delay: 0,
    description: "Enhance your natural glow",
  },
  {
    id: 2,
    name: "Bold Glamour",
    image: "/placeholder.svg?height=450&width=320&text=Bold+Glamour+Model",
    hoverImage: "/placeholder.svg?height=500&width=400&text=Bold+Makeup+Look",
    position: "left-[20%] top-[35%]",
    delay: 200,
    description: "Make a statement",
  },
  {
    id: 3,
    name: "Professional",
    image: "/placeholder.svg?height=420&width=310&text=Professional+Model",
    hoverImage: "/placeholder.svg?height=500&width=400&text=Professional+Look",
    position: "left-[50%] top-[15%] -translate-x-1/2",
    delay: 400,
    description: "Perfect for work",
  },
  {
    id: 4,
    name: "Evening Elegance",
    image: "/placeholder.svg?height=440&width=315&text=Evening+Model",
    hoverImage: "/placeholder.svg?height=500&width=400&text=Evening+Look",
    position: "right-[20%] top-[30%]",
    delay: 600,
    description: "Sophisticated elegance",
  },
  {
    id: 5,
    name: "Artistic Expression",
    image: "/placeholder.svg?height=430&width=305&text=Artistic+Model",
    hoverImage: "/placeholder.svg?height=500&width=400&text=Artistic+Look",
    position: "right-[5%] top-[45%]",
    delay: 800,
    description: "Creative and colorful",
  },
]

export default function HeroModelsSection() {
  const [hoveredModel, setHoveredModel] = useState<number | null>(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [activeImages, setActiveImages] = useState<number[]>([])
  const heroRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (heroRef.current) {
        const rect = heroRef.current.getBoundingClientRect()
        setMousePosition({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        })
      }
    }

    const heroElement = heroRef.current
    if (heroElement) {
      heroElement.addEventListener("mousemove", handleMouseMove)
      return () => heroElement.removeEventListener("mousemove", handleMouseMove)
    }
  }, [])

  useEffect(() => {
    if (hoveredModel !== null) {
      const timer = setTimeout(() => {
        setActiveImages((prev) => [...prev, hoveredModel])
      }, 100)
      return () => clearTimeout(timer)
    } else {
      setActiveImages([])
    }
  }, [hoveredModel])

  const handleModelHover = (modelId: number) => {
    setHoveredModel(modelId)
  }

  const handleModelLeave = () => {
    setHoveredModel(null)
  }

  return (
    <section
      ref={heroRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-hero"
    >
      {/* Animated Background Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="particle animate-particle-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 8}s`,
              animationDuration: `${8 + Math.random() * 4}s`,
            }}
          />
        ))}
      </div>

      {/* Floating Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-pink-400/20 to-purple-400/20 rounded-full blur-xl animate-model-float"></div>
        <div
          className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-full blur-xl animate-model-float"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute bottom-32 left-1/4 w-40 h-40 bg-gradient-to-br from-green-400/20 to-emerald-400/20 rounded-full blur-xl animate-model-float"
          style={{ animationDelay: "2s" }}
        ></div>
        <div
          className="absolute bottom-20 right-1/3 w-28 h-28 bg-gradient-to-br from-yellow-400/20 to-orange-400/20 rounded-full blur-xl animate-model-float"
          style={{ animationDelay: "3s" }}
        ></div>
      </div>

      {/* Main Content Container */}
      <div className="container-hero relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center min-h-screen">
          {/* Left Content */}
          <div className="space-y-8 text-center lg:text-left z-20">
            <div className="space-y-6">
              <Badge
                variant="secondary"
                className="glass-morphism border-pink-400/30 text-pink-600 dark:text-pink-400 hover:bg-pink-500/20 text-lg px-8 py-3 animate-glow-pulse"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                AI-Powered Beauty Revolution
              </Badge>

              <h1 className="text-6xl sm:text-7xl lg:text-8xl xl:text-9xl font-bold leading-tight">
                <span className="text-gradient-animated block mb-4">Transform</span>
                <span className="text-glow block">Your Beauty</span>
              </h1>

              <p className="text-xl lg:text-2xl text-foreground/80 leading-relaxed max-w-2xl">
                Experience the future of makeup with AI-powered virtual try-ons, personalized recommendations, and
                professional tutorials that adapt to your unique style.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-6 justify-center lg:justify-start">
              <Link href="/skin-analysis">
                <Button
                  size="lg"
                  className="glass-morphism px-12 py-4 text-lg font-semibold shadow-2xl hover:shadow-pink-500/25 group animate-glow-pulse bg-gradient-to-r from-pink-500 to-purple-500 text-white border-0"
                >
                  <Wand2 className="mr-3 h-6 w-6 group-hover:rotate-12 transition-transform duration-300" />
                  Start AI Analysis
                </Button>
              </Link>
              <Link href="/virtual-tryOn">
                <Button
                  variant="outline"
                  size="lg"
                  className="glass-morphism border-2 border-pink-400/50 text-pink-600 dark:text-pink-400 hover:bg-pink-500/20 hover:border-pink-400 px-12 py-4 text-lg font-semibold group bg-transparent"
                >
                  <Play className="mr-3 h-6 w-6 group-hover:scale-110 transition-transform duration-300" />
                  Virtual Try-On
                </Button>
              </Link>
            </div>

            <div className="flex items-center justify-center lg:justify-start gap-12 pt-8">
              <div className="text-center">
                <div className="text-4xl font-bold text-gradient-animated">100K+</div>
                <div className="text-sm text-muted-foreground font-medium">Beauty Enthusiasts</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-gradient-animated">2M+</div>
                <div className="text-sm text-muted-foreground font-medium">Looks Created</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-gradient-animated">99.9%</div>
                <div className="text-sm text-muted-foreground font-medium">Satisfaction Rate</div>
              </div>
            </div>
          </div>

          {/* Right Models Container */}
          <div className="relative h-[80vh] lg:h-screen model-container">
            {/* Models */}
            {models.map((model, index) => (
              <div
                key={model.id}
                className={`absolute model-item cursor-pointer ${model.position}`}
                style={{ animationDelay: `${model.delay}ms` }}
                onMouseEnter={() => handleModelHover(model.id)}
                onMouseLeave={handleModelLeave}
              >
                <div className="relative group">
                  <div className="glass-morphism rounded-3xl p-2 shadow-2xl hover:shadow-pink-500/25 transition-all duration-500">
                    <Image
                      src={model.image || "/placeholder.svg"}
                      alt={model.name}
                      width={300}
                      height={400}
                      className="rounded-2xl object-cover transition-all duration-500 group-hover:scale-105"
                      priority={index < 3}
                    />

                    {/* Model Info Overlay */}
                    <div className="absolute bottom-4 left-4 right-4 glass-morphism rounded-xl p-3 opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <h3 className="text-white font-bold text-sm">{model.name}</h3>
                      <p className="text-white/80 text-xs">{model.description}</p>
                    </div>

                    {/* Glow Effect */}
                    <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-pink-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-all duration-500 animate-glow-pulse"></div>
                  </div>
                </div>
              </div>
            ))}

            {/* 3D Hover Images */}
            {models.map((model) => (
              <div
                key={`hover-${model.id}`}
                className={`image-reveal absolute pointer-events-none z-30 ${
                  activeImages.includes(model.id) ? "active" : ""
                }`}
                style={{
                  left: `${mousePosition.x - 200}px`,
                  top: `${mousePosition.y - 250}px`,
                  display: hoveredModel === model.id ? "block" : "none",
                }}
              >
                <div className="glass-morphism rounded-2xl p-3 shadow-2xl animate-glow-pulse">
                  <Image
                    src={model.hoverImage || "/placeholder.svg"}
                    alt={`${model.name} Makeup Look`}
                    width={400}
                    height={500}
                    className="rounded-xl object-cover"
                  />
                  <div className="absolute bottom-4 left-4 right-4 glass-morphism rounded-lg p-2">
                    <p className="text-white font-semibold text-sm">{model.name} Look</p>
                    <Button
                      size="sm"
                      className="mt-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white border-0 text-xs px-3 py-1"
                    >
                      Try This Look
                      <ArrowRight className="ml-1 h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}

            {/* Floating UI Elements */}
            <div className="absolute top-10 right-10 glass-morphism p-4 rounded-2xl shadow-2xl border border-pink-400/20 animate-model-float">
              <Sparkles className="h-8 w-8 text-pink-500" />
            </div>
            <div
              className="absolute bottom-20 left-10 glass-morphism p-3 rounded-xl shadow-xl border border-purple-400/20 animate-model-float"
              style={{ animationDelay: "2s" }}
            >
              <Wand2 className="h-6 w-6 text-purple-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-model-float z-20">
        <div className="w-8 h-12 glass-morphism rounded-full flex justify-center border border-pink-400/30">
          <div className="w-2 h-4 bg-gradient-to-b from-pink-500 to-purple-500 rounded-full mt-3 animate-pulse"></div>
        </div>
      </div>
    </section>
  )
}
