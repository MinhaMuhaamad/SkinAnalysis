"use client"

import React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Heart, Briefcase, PartyPopper, Coffee, Sparkles, Crown, Flower } from "lucide-react"
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
}

export default function OccasionsPage() {
  const [selectedOccasion, setSelectedOccasion] = useState("work")

  const occasionLooks = {
    work: [
      {
        id: "w1",
        name: "Professional Power Look",
        description: "Confident and polished for important meetings",
        image: "/placeholder.svg?height=300&width=300",
        difficulty: "Easy" as const,
        timeRequired: "15 mins",
        products: ["Neutral eyeshadow", "Coral lipstick", "Light foundation"],
        steps: ["Apply foundation", "Add neutral eyeshadow", "Define brows", "Apply coral lipstick"],
        tags: ["professional", "confident", "polished"],
      },
      {
        id: "w2",
        name: "Everyday Office Glow",
        description: "Fresh and natural for daily work routine",
        image: "/placeholder.svg?height=300&width=300",
        difficulty: "Easy" as const,
        timeRequired: "10 mins",
        products: ["BB cream", "Tinted lip balm", "Mascara"],
        steps: ["Apply BB cream", "Add light mascara", "Use tinted lip balm"],
        tags: ["natural", "fresh", "quick"],
      },
    ],
    date: [
      {
        id: "d1",
        name: "Romantic Dinner Date",
        description: "Soft and romantic for intimate evenings",
        image: "/placeholder.svg?height=300&width=300",
        difficulty: "Medium" as const,
        timeRequired: "25 mins",
        products: ["Rose gold eyeshadow", "Pink nude lipstick", "Highlighter"],
        steps: ["Create soft eye look", "Add subtle highlighter", "Apply pink nude lips"],
        tags: ["romantic", "soft", "elegant"],
      },
      {
        id: "d2",
        name: "First Date Fresh",
        description: "Natural beauty that enhances your features",
        image: "/placeholder.svg?height=300&width=300",
        difficulty: "Easy" as const,
        timeRequired: "20 mins",
        products: ["Light foundation", "Brown mascara", "Peach blush"],
        steps: ["Even skin tone", "Define eyes naturally", "Add healthy flush"],
        tags: ["natural", "fresh", "approachable"],
      },
    ],
    party: [
      {
        id: "p1",
        name: "Girls Night Glam",
        description: "Bold and dramatic for nights out",
        image: "/placeholder.svg?height=300&width=300",
        difficulty: "Advanced" as const,
        timeRequired: "45 mins",
        products: ["Smoky eyeshadow", "Red lipstick", "Contouring kit"],
        steps: ["Create smoky eyes", "Contour face", "Apply bold red lips"],
        tags: ["bold", "dramatic", "glamorous"],
      },
      {
        id: "p2",
        name: "Club Night Sparkle",
        description: "Glittery and fun for dancing the night away",
        image: "/placeholder.svg?height=300&width=300",
        difficulty: "Medium" as const,
        timeRequired: "30 mins",
        products: ["Glitter eyeshadow", "Glossy lipstick", "Highlighter"],
        steps: ["Apply glitter eyeshadow", "Add intense highlighter", "Use glossy lips"],
        tags: ["sparkly", "fun", "party"],
      },
    ],
    wedding: [
      {
        id: "we1",
        name: "Wedding Guest Elegance",
        description: "Sophisticated look for wedding celebrations",
        image: "/placeholder.svg?height=300&width=300",
        difficulty: "Medium" as const,
        timeRequired: "35 mins",
        products: ["Purple eyeshadow", "Berry lipstick", "Setting spray"],
        steps: ["Create elegant eye look", "Apply berry lips", "Set with spray"],
        tags: ["elegant", "sophisticated", "formal"],
      },
      {
        id: "we2",
        name: "Bridal Party Glow",
        description: "Perfect for bridesmaids and special occasions",
        image: "/placeholder.svg?height=300&width=300",
        difficulty: "Advanced" as const,
        timeRequired: "50 mins",
        products: ["Champagne eyeshadow", "Rose lipstick", "Airbrush foundation"],
        steps: ["Perfect base", "Champagne eyes", "Rose lips", "Final touches"],
        tags: ["bridal", "glowing", "special"],
      },
    ],
    casual: [
      {
        id: "c1",
        name: "Weekend Brunch",
        description: "Effortless and chic for casual outings",
        image: "/placeholder.svg?height=300&width=300",
        difficulty: "Easy" as const,
        timeRequired: "12 mins",
        products: ["Tinted moisturizer", "Cream blush", "Lip tint"],
        steps: ["Apply tinted moisturizer", "Blend cream blush", "Add lip tint"],
        tags: ["effortless", "chic", "casual"],
      },
      {
        id: "c2",
        name: "Shopping Day Comfort",
        description: "Comfortable and pretty for day activities",
        image: "/placeholder.svg?height=300&width=300",
        difficulty: "Easy" as const,
        timeRequired: "8 mins",
        products: ["Concealer", "Brow gel", "Lip balm"],
        steps: ["Spot conceal", "Groom brows", "Moisturize lips"],
        tags: ["comfortable", "minimal", "practical"],
      },
    ],
    festival: [
      {
        id: "f1",
        name: "Music Festival Vibes",
        description: "Creative and colorful for festival fun",
        image: "/placeholder.svg?height=300&width=300",
        difficulty: "Advanced" as const,
        timeRequired: "40 mins",
        products: ["Colorful eyeshadow palette", "Glitter", "Face gems"],
        steps: ["Create colorful eyes", "Add glitter accents", "Apply face gems"],
        tags: ["creative", "colorful", "artistic"],
      },
      {
        id: "f2",
        name: "Boho Festival Goddess",
        description: "Earthy and mystical for outdoor festivals",
        image: "/placeholder.svg?height=300&width=300",
        difficulty: "Medium" as const,
        timeRequired: "30 mins",
        products: ["Earth tone eyeshadow", "Bronze highlighter", "Nude lipstick"],
        steps: ["Earth tone eyes", "Bronze glow", "Nude lips"],
        tags: ["boho", "earthy", "mystical"],
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent mb-4">
              Occasion-Based Looks
            </h1>
            <p className="text-xl text-gray-600">Perfect makeup looks for every moment and celebration</p>
          </div>

          {/* Occasion Selector */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            {Object.entries(occasionTitles).map(([key, title]) => {
              const Icon = occasionIcons[key as keyof typeof occasionIcons]
              return (
                <Card
                  key={key}
                  className={`cursor-pointer transition-all duration-300 border-0 shadow-md hover:shadow-lg ${
                    selectedOccasion === key
                      ? "ring-2 ring-rose-500 bg-gradient-to-br from-rose-50 to-pink-50"
                      : "hover:bg-gray-50"
                  }`}
                  onClick={() => setSelectedOccasion(key)}
                >
                  <CardContent className="p-4 text-center">
                    <Icon
                      className={`h-8 w-8 mx-auto mb-2 ${selectedOccasion === key ? "text-rose-600" : "text-gray-600"}`}
                    />
                    <p
                      className={`text-sm font-medium ${selectedOccasion === key ? "text-rose-700" : "text-gray-700"}`}
                    >
                      {title}
                    </p>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Current Occasion Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              {React.createElement(occasionIcons[selectedOccasion as keyof typeof occasionIcons], {
                className: "h-8 w-8 text-rose-600",
              })}
              <h2 className="text-3xl font-bold text-gray-900">
                {occasionTitles[selectedOccasion as keyof typeof occasionTitles]}
              </h2>
            </div>
            <p className="text-gray-600 text-lg">
              Discover the perfect makeup looks for your{" "}
              {occasionTitles[selectedOccasion as keyof typeof occasionTitles].toLowerCase()} occasions
            </p>
          </div>

          {/* Looks Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {currentLooks.map((look) => (
              <Card
                key={look.id}
                className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg overflow-hidden"
              >
                <div className="relative">
                  <Image
                    src={look.image || "/placeholder.svg"}
                    alt={look.name}
                    width={300}
                    height={300}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3">
                    <Badge
                      variant="secondary"
                      className={`bg-white/90 ${
                        look.difficulty === "Easy"
                          ? "text-green-700"
                          : look.difficulty === "Medium"
                            ? "text-yellow-700"
                            : "text-red-700"
                      }`}
                    >
                      {look.difficulty}
                    </Badge>
                  </div>
                  <div className="absolute top-3 right-3">
                    <Badge variant="secondary" className="bg-white/90 text-gray-700">
                      {look.timeRequired}
                    </Badge>
                  </div>
                </div>

                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{look.name}</h3>
                      <p className="text-gray-600">{look.description}</p>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {look.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs border-rose-200 text-rose-700">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Key Products:</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {look.products.slice(0, 3).map((product, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 bg-rose-400 rounded-full mt-2 flex-shrink-0"></span>
                            {product}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="flex gap-3 pt-2">
                      <Link href={`/tutorials/${look.id}`} className="flex-1">
                        <Button className="w-full bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600">
                          <Sparkles className="mr-2 h-4 w-4" />
                          Try This Look
                        </Button>
                      </Link>
                      <Button variant="outline" size="icon">
                        <Heart className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Quick Tips Section */}
          <div className="mt-12">
            <Card className="border-0 shadow-lg bg-gradient-to-r from-rose-100 to-pink-100">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-rose-600" />
                  Pro Tips for {occasionTitles[selectedOccasion as keyof typeof occasionTitles]}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Timing Tips:</h4>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>• Start with skincare 30 minutes before makeup</li>
                      <li>• Allow extra time for blending and perfecting</li>
                      <li>• Set aside time for touch-ups if needed</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Product Tips:</h4>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>• Use primer for longer-lasting makeup</li>
                      <li>• Invest in quality brushes for better application</li>
                      <li>• Keep blotting papers for quick touch-ups</li>
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
