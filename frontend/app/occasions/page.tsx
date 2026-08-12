"use client"

import React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Heart, Briefcase, PartyPopper, Coffee, Sparkles, Crown, Flower, TrendingUp, Clock, Star } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

interface OccasionLook {
  id: string
  name: string
  description: string
  image: string
  difficulty: "Easy" | "Medium" | "Advanced"
  timeRequired: string
  products: string[]
  steps: string[]
  tags: string[]
  rating: number
  popularity: number
}

export default function OccasionsPage() {
  const [selectedOccasion, setSelectedOccasion] = useState("work")
  const [isLoading, setIsLoading] = useState(true)
  const [visibleLooks, setVisibleLooks] = useState(4)

  const occasionLooks = {
    work: [
      {
        id: "w1",
        name: "Professional Power Look",
        description: "Confident and polished for important meetings and presentations",
        image: "/placeholder.svg?height=300&width=300",
        difficulty: "Easy" as const,
        timeRequired: "15 mins",
        products: ["Neutral eyeshadow", "Coral lipstick", "Light foundation"],
        steps: ["Apply foundation", "Add neutral eyeshadow", "Define brows", "Apply coral lipstick"],
        tags: ["professional", "confident", "polished"],
        rating: 4.8,
        popularity: 95,
      },
      {
        id: "w2",
        name: "Everyday Office Glow",
        description: "Fresh and natural for daily work routine with subtle enhancement",
        image: "/placeholder.svg?height=300&width=300",
        difficulty: "Easy" as const,
        timeRequired: "10 mins",
        products: ["BB cream", "Tinted lip balm", "Mascara"],
        steps: ["Apply BB cream", "Add light mascara", "Use tinted lip balm"],
        tags: ["natural", "fresh", "quick"],
        rating: 4.6,
        popularity: 88,
      },
      {
        id: "w3",
        name: "Executive Elegance",
        description: "Sophisticated look for leadership roles and board meetings",
        image: "/placeholder.svg?height=300&width=300",
        difficulty: "Medium" as const,
        timeRequired: "20 mins",
        products: ["Matte foundation", "Brown eyeliner", "Nude lipstick"],
        steps: ["Perfect base", "Define eyes", "Contour subtly", "Finish with nude lips"],
        tags: ["executive", "sophisticated", "leadership"],
        rating: 4.9,
        popularity: 92,
      },
    ],
    date: [
      {
        id: "d1",
        name: "Romantic Dinner Date",
        description: "Soft and romantic for intimate evenings and special moments",
        image: "/placeholder.svg?height=300&width=300",
        difficulty: "Medium" as const,
        timeRequired: "25 mins",
        products: ["Rose gold eyeshadow", "Pink nude lipstick", "Highlighter"],
        steps: ["Create soft eye look", "Add subtle highlighter", "Apply pink nude lips"],
        tags: ["romantic", "soft", "elegant"],
        rating: 4.7,
        popularity: 90,
      },
      {
        id: "d2",
        name: "First Date Fresh",
        description: "Natural beauty that enhances your features without being overwhelming",
        image: "/placeholder.svg?height=300&width=300",
        difficulty: "Easy" as const,
        timeRequired: "20 mins",
        products: ["Light foundation", "Brown mascara", "Peach blush"],
        steps: ["Even skin tone", "Define eyes naturally", "Add healthy flush"],
        tags: ["natural", "fresh", "approachable"],
        rating: 4.5,
        popularity: 85,
      },
    ],
    party: [
      {
        id: "p1",
        name: "Girls Night Glam",
        description: "Bold and dramatic for nights out with friends and celebrations",
        image: "/placeholder.svg?height=300&width=300",
        difficulty: "Advanced" as const,
        timeRequired: "45 mins",
        products: ["Smoky eyeshadow", "Red lipstick", "Contouring kit"],
        steps: ["Create smoky eyes", "Contour face", "Apply bold red lips"],
        tags: ["bold", "dramatic", "glamorous"],
        rating: 4.9,
        popularity: 96,
      },
      {
        id: "p2",
        name: "Club Night Sparkle",
        description: "Glittery and fun for dancing the night away with confidence",
        image: "/placeholder.svg?height=300&width=300",
        difficulty: "Medium" as const,
        timeRequired: "30 mins",
        products: ["Glitter eyeshadow", "Glossy lipstick", "Highlighter"],
        steps: ["Apply glitter eyeshadow", "Add intense highlighter", "Use glossy lips"],
        tags: ["sparkly", "fun", "party"],
        rating: 4.6,
        popularity: 87,
      },
    ],
    wedding: [
      {
        id: "we1",
        name: "Wedding Guest Elegance",
        description: "Sophisticated look for wedding celebrations and formal ceremonies",
        image: "/placeholder.svg?height=300&width=300",
        difficulty: "Medium" as const,
        timeRequired: "35 mins",
        products: ["Purple eyeshadow", "Berry lipstick", "Setting spray"],
        steps: ["Create elegant eye look", "Apply berry lips", "Set with spray"],
        tags: ["elegant", "sophisticated", "formal"],
        rating: 4.8,
        popularity: 91,
      },
      {
        id: "we2",
        name: "Bridal Party Glow",
        description: "Perfect for bridesmaids and special wedding party occasions",
        image: "/placeholder.svg?height=300&width=300",
        difficulty: "Advanced" as const,
        timeRequired: "50 mins",
        products: ["Champagne eyeshadow", "Rose lipstick", "Airbrush foundation"],
        steps: ["Perfect base", "Champagne eyes", "Rose lips", "Final touches"],
        tags: ["bridal", "glowing", "special"],
        rating: 4.9,
        popularity: 94,
      },
    ],
    casual: [
      {
        id: "c1",
        name: "Weekend Brunch",
        description: "Effortless and chic for casual outings and relaxed gatherings",
        image: "/placeholder.svg?height=300&width=300",
        difficulty: "Easy" as const,
        timeRequired: "12 mins",
        products: ["Tinted moisturizer", "Cream blush", "Lip tint"],
        steps: ["Apply tinted moisturizer", "Blend cream blush", "Add lip tint"],
        tags: ["effortless", "chic", "casual"],
        rating: 4.4,
        popularity: 82,
      },
      {
        id: "c2",
        name: "Shopping Day Comfort",
        description: "Comfortable and pretty for day activities and errands",
        image: "/placeholder.svg?height=300&width=300",
        difficulty: "Easy" as const,
        timeRequired: "8 mins",
        products: ["Concealer", "Brow gel", "Lip balm"],
        steps: ["Spot conceal", "Groom brows", "Moisturize lips"],
        tags: ["comfortable", "minimal", "practical"],
        rating: 4.3,
        popularity: 79,
      },
    ],
    festival: [
      {
        id: "f1",
        name: "Music Festival Vibes",
        description: "Creative and colorful for festival fun and artistic expression",
        image: "/placeholder.svg?height=300&width=300",
        difficulty: "Advanced" as const,
        timeRequired: "40 mins",
        products: ["Colorful eyeshadow palette", "Glitter", "Face gems"],
        steps: ["Create colorful eyes", "Add glitter accents", "Apply face gems"],
        tags: ["creative", "colorful", "artistic"],
        rating: 4.7,
        popularity: 89,
      },
      {
        id: "f2",
        name: "Boho Festival Goddess",
        description: "Earthy and mystical for outdoor festivals and bohemian vibes",
        image: "/placeholder.svg?height=300&width=300",
        difficulty: "Medium" as const,
        timeRequired: "30 mins",
        products: ["Earth tone eyeshadow", "Bronze highlighter", "Nude lipstick"],
        steps: ["Earth tone eyes", "Bronze glow", "Nude lips"],
        tags: ["boho", "earthy", "mystical"],
        rating: 4.5,
        popularity: 84,
      },
    ],
  }

  const occasionIcons = {
    work: Briefcase,
    date: Heart,
    party: PartyPopper,
    wedding: Crown,
    casual: Coffee,
    festival: Flower,
  }

  const occasionTitles = {
    work: "Work & Professional",
    date: "Date Night",
    party: "Party & Night Out",
    wedding: "Wedding & Formal",
    casual: "Casual & Everyday",
    festival: "Festival & Creative",
  }

  const currentLooks = occasionLooks[selectedOccasion as keyof typeof occasionLooks] || []

  useEffect(() => {
    setIsLoading(true)
    const timer = setTimeout(() => {
      setIsLoading(false)
      setVisibleLooks(4)
    }, 800)
    return () => clearTimeout(timer)
  }, [selectedOccasion])

  // Load more on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + document.documentElement.scrollTop >= document.documentElement.offsetHeight - 1000) {
        if (visibleLooks < currentLooks.length) {
          setVisibleLooks((prev) => Math.min(prev + 2, currentLooks.length))
        }
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [visibleLooks, currentLooks.length])

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy":
        return "text-green-700 bg-green-100 border-green-200 dark:text-green-300 dark:bg-green-900/30 dark:border-green-700"
      case "Medium":
        return "text-yellow-700 bg-yellow-100 border-yellow-200 dark:text-yellow-300 dark:bg-yellow-900/30 dark:border-yellow-700"
      case "Advanced":
        return "text-red-700 bg-red-100 border-red-200 dark:text-red-300 dark:bg-red-900/30 dark:border-red-700"
      default:
        return "text-gray-700 bg-gray-100 border-gray-200 dark:text-gray-300 dark:bg-gray-800 dark:border-gray-600"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-primary">
      {/* Enhanced Hero Section with Different Animated Grid */}
      <div className="relative overflow-hidden">
        {/* Different Animated Grid Pattern */}
        <div className="absolute inset-0">
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `
                radial-gradient(circle at 25% 25%, rgba(236, 72, 153, 0.3) 0%, transparent 50%),
                radial-gradient(circle at 75% 75%, rgba(139, 92, 246, 0.3) 0%, transparent 50%),
                linear-gradient(45deg, transparent 40%, rgba(59, 130, 246, 0.1) 50%, transparent 60%)
              `,
              backgroundSize: "60px 60px, 80px 80px, 40px 40px",
              animation: "grid-move 25s linear infinite, grid-fade 5s ease-in-out infinite",
            }}
          ></div>
        </div>

        {/* Floating Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-pink-500/20 rounded-full blur-3xl animate-float"></div>
          <div className="absolute top-40 right-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-float delay-300"></div>
          <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-float delay-700"></div>
        </div>

        <div className="container-premium py-16 relative z-10">
          <div className="text-center mb-12 animate-fade-in-up">
            <div className="inline-flex items-center gap-2 glass-morphism px-5 py-2 rounded-full mb-6 shadow-xl">
              <TrendingUp className="h-4 w-4 text-pink-500" />
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Trending Makeup Looks</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-shimmer mb-6 animate-fade-in-up delay-200">
              Occasion-Based Looks
            </h1>
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed animate-fade-in-up delay-400">
              Perfect makeup looks for every moment and celebration, curated by professional makeup artists worldwide
            </p>
          </div>

          {/* Enhanced Occasion Selector */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
            {Object.entries(occasionTitles).map(([key, title], index) => {
              const Icon = occasionIcons[key as keyof typeof occasionIcons]
              return (
                <Card
                  key={key}
                  className={`cursor-pointer transition-all duration-500 transform hover:scale-105 animate-fade-in-up card-premium ${
                    selectedOccasion === key ? "ring-2 ring-pink-500 shadow-2xl animate-pulse-glow" : "hover:shadow-xl"
                  }`}
                  style={{ animationDelay: `${0.6 + index * 0.1}s` }}
                  onClick={() => setSelectedOccasion(key)}
                >
                  <CardContent className="p-6 text-center">
                    <div className="relative mb-3">
                      <div
                        className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center transition-all duration-300 ${
                          selectedOccasion === key
                            ? "bg-gradient-accent text-white shadow-lg"
                            : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                        }`}
                      >
                        <Icon className="h-6 w-6" />
                      </div>
                      {selectedOccasion === key && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-pink-500 rounded-full animate-ping"></div>
                      )}
                    </div>
                    <p
                      className={`text-sm font-bold transition-colors duration-300 ${
                        selectedOccasion === key
                          ? "text-pink-600 dark:text-pink-400"
                          : "text-gray-700 dark:text-gray-300"
                      }`}
                    >
                      {title}
                    </p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="container-premium pb-16">
        {/* Current Occasion Header */}
        <div className="mb-12 animate-fade-in-up">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-gradient-accent rounded-2xl flex items-center justify-center shadow-xl">
              {React.createElement(occasionIcons[selectedOccasion as keyof typeof occasionIcons], {
                className: "h-8 w-8 text-white",
              })}
            </div>
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-1">
                {occasionTitles[selectedOccasion as keyof typeof occasionTitles]}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-base">
                Discover {currentLooks.length} professional makeup looks for your{" "}
                {occasionTitles[selectedOccasion as keyof typeof occasionTitles].toLowerCase()} occasions
              </p>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <Card key={index} className="card-premium overflow-hidden animate-pulse">
                <div className="h-56 loading-skeleton"></div>
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <div className="h-5 loading-skeleton rounded"></div>
                    <div className="h-4 loading-skeleton rounded w-3/4"></div>
                    <div className="flex gap-2">
                      <div className="h-5 loading-skeleton rounded w-16"></div>
                      <div className="h-5 loading-skeleton rounded w-20"></div>
                    </div>
                    <div className="h-10 loading-skeleton rounded"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          /* Enhanced Looks Grid */
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentLooks.slice(0, visibleLooks).map((look, index) => (
              <Card
                key={look.id}
                className="group card-premium overflow-hidden animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="relative overflow-hidden">
                  <Image
                    src={look.image || "/placeholder.svg"}
                    alt={look.name}
                    width={300}
                    height={300}
                    className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                  <div className="absolute top-3 left-3 flex gap-2">
                    <Badge className={`${getDifficultyColor(look.difficulty)} border shadow-lg text-xs`}>
                      {look.difficulty}
                    </Badge>
                    <Badge className="glass-morphism text-gray-700 dark:text-gray-300 shadow-lg text-xs">
                      <Clock className="h-3 w-3 mr-1" />
                      {look.timeRequired}
                    </Badge>
                  </div>

                  <div className="absolute top-3 right-3">
                    <div className="flex items-center gap-1 glass-morphism px-2 py-1 rounded-full shadow-lg">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{look.rating}</span>
                    </div>
                  </div>

                  <div className="absolute bottom-3 left-3">
                    <div className="flex items-center gap-1 bg-gradient-accent text-white px-3 py-1 rounded-full shadow-lg">
                      <TrendingUp className="h-3 w-3" />
                      <span className="text-xs font-medium">{look.popularity}% Popular</span>
                    </div>
                  </div>
                </div>

                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-gradient transition-colors duration-300">
                        {look.name}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{look.description}</p>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {look.tags.map((tag) => (
                        <Badge
                          key={tag}
                          variant="outline"
                          className="text-xs border-pink-200 dark:border-pink-800 text-pink-700 dark:text-pink-300 bg-pink-50 dark:bg-pink-900/20 hover:bg-pink-100 dark:hover:bg-pink-900/40 transition-colors duration-300"
                        >
                          #{tag}
                        </Badge>
                      ))}
                    </div>

                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white mb-2 text-sm">Key Products:</h4>
                      <ul className="text-gray-600 dark:text-gray-400 text-xs space-y-1">
                        {look.products.slice(0, 3).map((product, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 bg-gradient-accent rounded-full mt-1.5 flex-shrink-0"></span>
                            {product}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="flex gap-3 pt-2">
                      <Link href={`/tutorials/${look.id}`} className="flex-1">
                        <Button className="w-full btn-premium text-white shadow-xl hover:shadow-2xl text-sm">
                          <Sparkles className="mr-2 h-4 w-4" />
                          Try This Look
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="icon"
                        className="glass-morphism hover:bg-pink-50 dark:hover:bg-pink-900/20 border-pink-200 dark:border-pink-800 transition-all duration-300 bg-transparent"
                      >
                        <Heart className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Load More Indicator */}
        {!isLoading && visibleLooks < currentLooks.length && (
          <div className="text-center mt-12 animate-fade-in-up">
            <div className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-100"></div>
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-200"></div>
              <span className="ml-2 text-sm">Scroll down to discover more looks</span>
            </div>
          </div>
        )}

        {/* Enhanced Quick Tips Section */}
        <div className="mt-16">
          <Card className="card-premium bg-gradient-secondary overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-accent opacity-20 rounded-full -translate-y-16 translate-x-16"></div>
            <CardHeader className="relative pb-6">
              <CardTitle className="flex items-center gap-3 text-2xl font-bold text-gray-900 dark:text-white">
                <div className="w-10 h-10 bg-gradient-accent rounded-xl flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                Pro Tips for {occasionTitles[selectedOccasion as keyof typeof occasionTitles]}
              </CardTitle>
            </CardHeader>
            <CardContent className="relative">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h4 className="font-bold text-gray-900 dark:text-white text-lg mb-3 flex items-center gap-2">
                    <div className="w-6 h-6 bg-gradient-accent rounded-lg flex items-center justify-center">
                      <Clock className="h-3 w-3 text-white" />
                    </div>
                    Timing Tips:
                  </h4>
                  <ul className="text-gray-700 dark:text-gray-300 text-sm space-y-3">
                    <li className="flex items-start gap-3">
                      <span className="w-1.5 h-1.5 bg-gradient-accent rounded-full mt-2 flex-shrink-0"></span>
                      Start with skincare 30 minutes before makeup application
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="w-1.5 h-1.5 bg-gradient-accent rounded-full mt-2 flex-shrink-0"></span>
                      Allow extra time for blending and perfecting details
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="w-1.5 h-1.5 bg-gradient-accent rounded-full mt-2 flex-shrink-0"></span>
                      Set aside time for touch-ups throughout the event
                    </li>
                  </ul>
                </div>
                <div className="space-y-4">
                  <h4 className="font-bold text-gray-900 dark:text-white text-lg mb-3 flex items-center gap-2">
                    <div className="w-6 h-6 bg-gradient-accent rounded-lg flex items-center justify-center">
                      <Sparkles className="h-3 w-3 text-white" />
                    </div>
                    Product Tips:
                  </h4>
                  <ul className="text-gray-700 dark:text-gray-300 text-sm space-y-3">
                    <li className="flex items-start gap-3">
                      <span className="w-1.5 h-1.5 bg-gradient-accent rounded-full mt-2 flex-shrink-0"></span>
                      Use primer for longer-lasting makeup results
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="w-1.5 h-1.5 bg-gradient-accent rounded-full mt-2 flex-shrink-0"></span>
                      Invest in quality brushes for better application
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="w-1.5 h-1.5 bg-gradient-accent rounded-full mt-2 flex-shrink-0"></span>
                      Keep blotting papers for quick touch-ups on the go
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
