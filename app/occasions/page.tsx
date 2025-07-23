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
        return "text-green-700 bg-green-100 border-green-200"
      case "Medium":
        return "text-yellow-700 bg-yellow-100 border-yellow-200"
      case "Advanced":
        return "text-red-700 bg-red-100 border-red-200"
      default:
        return "text-gray-700 bg-gray-100 border-gray-200"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50">
      {/* Enhanced Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-rose-600/10 to-pink-600/10 animate-gradient-x"></div>
        <div className="container mx-auto px-4 py-16 relative">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12 animate-fade-in-up">
              <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full mb-6 shadow-lg">
                <TrendingUp className="h-4 w-4 text-rose-600" />
                <span className="text-sm font-medium text-gray-700">Trending Makeup Looks</span>
              </div>
              <h1
                className="text-5xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent mb-6 animate-fade-in-up"
                style={{ animationDelay: "0.2s" }}
              >
                Occasion-Based Looks
              </h1>
              <p
                className="text-xl text-gray-600 max-w-2xl mx-auto animate-fade-in-up"
                style={{ animationDelay: "0.4s" }}
              >
                Perfect makeup looks for every moment and celebration, curated by professional makeup artists
              </p>
            </div>

            {/* Enhanced Occasion Selector */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
              {Object.entries(occasionTitles).map(([key, title], index) => {
                const Icon = occasionIcons[key as keyof typeof occasionIcons]
                return (
                  <Card
                    key={key}
                    className={`cursor-pointer transition-all duration-500 border-0 shadow-lg hover:shadow-xl transform hover:scale-105 animate-fade-in-up ${
                      selectedOccasion === key
                        ? "ring-2 ring-rose-500 bg-gradient-to-br from-rose-50 to-pink-50 shadow-rose-200"
                        : "hover:bg-gray-50 bg-white/80 backdrop-blur-sm"
                    }`}
                    style={{ animationDelay: `${0.6 + index * 0.1}s` }}
                    onClick={() => setSelectedOccasion(key)}
                  >
                    <CardContent className="p-6 text-center">
                      <div className="relative mb-3">
                        <Icon
                          className={`h-10 w-10 mx-auto transition-all duration-300 ${
                            selectedOccasion === key ? "text-rose-600 scale-110" : "text-gray-600"
                          }`}
                        />
                        {selectedOccasion === key && (
                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-rose-500 rounded-full animate-ping"></div>
                        )}
                      </div>
                      <p
                        className={`text-sm font-semibold transition-colors duration-300 ${
                          selectedOccasion === key ? "text-rose-700" : "text-gray-700"
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
      </div>

      {/* Content Section */}
      <div className="container mx-auto px-4 pb-16">
        <div className="max-w-7xl mx-auto">
          {/* Current Occasion Header */}
          <div className="mb-12 animate-fade-in-up">
            <div className="flex items-center gap-4 mb-6">
              {React.createElement(occasionIcons[selectedOccasion as keyof typeof occasionIcons], {
                className: "h-10 w-10 text-rose-600",
              })}
              <div>
                <h2 className="text-4xl font-bold text-gray-900">
                  {occasionTitles[selectedOccasion as keyof typeof occasionTitles]}
                </h2>
                <p className="text-gray-600 text-lg mt-2">
                  Discover {currentLooks.length} professional makeup looks for your{" "}
                  {occasionTitles[selectedOccasion as keyof typeof occasionTitles].toLowerCase()} occasions
                </p>
              </div>
            </div>
          </div>

          {/* Loading State */}
          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, index) => (
                <Card key={index} className="border-0 shadow-lg overflow-hidden animate-pulse">
                  <div className="h-56 bg-gray-200"></div>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="h-6 bg-gray-200 rounded"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="flex gap-2">
                        <div className="h-6 bg-gray-200 rounded w-16"></div>
                        <div className="h-6 bg-gray-200 rounded w-20"></div>
                      </div>
                      <div className="h-10 bg-gray-200 rounded"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            /* Enhanced Looks Grid */
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {currentLooks.slice(0, visibleLooks).map((look, index) => (
                <Card
                  key={look.id}
                  className="group hover:shadow-2xl transition-all duration-500 border-0 shadow-lg overflow-hidden bg-white/90 backdrop-blur-sm transform hover:scale-105 animate-fade-in-up"
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
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                    <div className="absolute top-4 left-4 flex gap-2">
                      <Badge className={`${getDifficultyColor(look.difficulty)} border`}>{look.difficulty}</Badge>
                      <Badge variant="secondary" className="bg-white/90 backdrop-blur-sm text-gray-700 shadow-lg">
                        <Clock className="h-3 w-3 mr-1" />
                        {look.timeRequired}
                      </Badge>
                    </div>

                    <div className="absolute top-4 right-4">
                      <div className="flex items-center gap-1 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full shadow-lg">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-xs font-medium text-gray-700">{look.rating}</span>
                      </div>
                    </div>

                    <div className="absolute bottom-4 left-4">
                      <div className="flex items-center gap-1 bg-rose-500/90 backdrop-blur-sm text-white px-3 py-1 rounded-full shadow-lg">
                        <TrendingUp className="h-3 w-3" />
                        <span className="text-xs font-medium">{look.popularity}% Popular</span>
                      </div>
                    </div>
                  </div>

                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-rose-600 transition-colors duration-300">
                          {look.name}
                        </h3>
                        <p className="text-gray-600 text-sm leading-relaxed">{look.description}</p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {look.tags.map((tag) => (
                          <Badge
                            key={tag}
                            variant="outline"
                            className="text-xs border-rose-200 text-rose-700 bg-rose-50 hover:bg-rose-100 transition-colors duration-300"
                          >
                            #{tag}
                          </Badge>
                        ))}
                      </div>

                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2 text-sm">Key Products:</h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {look.products.slice(0, 3).map((product, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span className="w-1.5 h-1.5 bg-rose-400 rounded-full mt-2 flex-shrink-0"></span>
                              {product}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="flex gap-3 pt-2">
                        <Link href={`/tutorials/${look.id}`} className="flex-1">
                          <Button className="w-full bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                            <Sparkles className="mr-2 h-4 w-4" />
                            Try This Look
                          </Button>
                        </Link>
                        <Button
                          variant="outline"
                          size="icon"
                          className="hover:bg-rose-50 hover:border-rose-300 transition-all duration-300 bg-transparent"
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
              <div className="inline-flex items-center gap-2 text-gray-600">
                <div className="w-2 h-2 bg-rose-400 rounded-full animate-bounce"></div>
                <div
                  className="w-2 h-2 bg-pink-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.1s" }}
                ></div>
                <div
                  className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                ></div>
                <span className="ml-2 text-sm">Scroll down to discover more looks</span>
              </div>
            </div>
          )}

          {/* Enhanced Quick Tips Section */}
          <div className="mt-16">
            <Card className="border-0 shadow-xl bg-gradient-to-r from-rose-100 to-pink-100 overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-rose-200 to-pink-200 rounded-full -translate-y-16 translate-x-16 opacity-50"></div>
              <CardHeader className="relative">
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <Sparkles className="h-6 w-6 text-rose-600" />
                  Pro Tips for {occasionTitles[selectedOccasion as keyof typeof occasionTitles]}
                </CardTitle>
              </CardHeader>
              <CardContent className="relative">
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <Clock className="h-5 w-5 text-rose-600" />
                      Timing Tips:
                    </h4>
                    <ul className="text-sm text-gray-700 space-y-2">
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 bg-rose-400 rounded-full mt-2 flex-shrink-0"></span>
                        Start with skincare 30 minutes before makeup application
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 bg-rose-400 rounded-full mt-2 flex-shrink-0"></span>
                        Allow extra time for blending and perfecting details
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 bg-rose-400 rounded-full mt-2 flex-shrink-0"></span>
                        Set aside time for touch-ups throughout the event
                      </li>
                    </ul>
                  </div>
                  <div className="space-y-4">
                    <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-rose-600" />
                      Product Tips:
                    </h4>
                    <ul className="text-sm text-gray-700 space-y-2">
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 bg-rose-400 rounded-full mt-2 flex-shrink-0"></span>
                        Use primer for longer-lasting makeup results
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 bg-rose-400 rounded-full mt-2 flex-shrink-0"></span>
                        Invest in quality brushes for better application
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 bg-rose-400 rounded-full mt-2 flex-shrink-0"></span>
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
    </div>
  )
}
