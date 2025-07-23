"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { BookOpen, Search, Heart, Share, Calendar, Eye, Trash2, Plus, Filter, TrendingUp } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

interface SavedLook {
  id: string
  name: string
  image: string
  occasion: string
  mood: string
  products: string[]
  dateCreated: string
  isFavorite: boolean
  tags: string[]
}

export default function LookbookPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedFilter, setSelectedFilter] = useState("all")
  const [isLoading, setIsLoading] = useState(true)
  const [visibleLooks, setVisibleLooks] = useState(6)
  const [savedLooks, setSavedLooks] = useState<SavedLook[]>([])

  // Simulate loading data
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      setSavedLooks([
        {
          id: "1",
          name: "Romantic Date Night",
          image: "/placeholder.svg?height=300&width=300",
          occasion: "Date Night",
          mood: "Romantic",
          products: ["Rose Gold Eyeshadow", "Pink Nude Lipstick", "Light Foundation"],
          dateCreated: "2024-01-15",
          isFavorite: true,
          tags: ["romantic", "soft", "pink"],
        },
        {
          id: "2",
          name: "Professional Meeting",
          image: "/placeholder.svg?height=300&width=300",
          occasion: "Work",
          mood: "Confident",
          products: ["Neutral Eyeshadow", "Coral Lipstick", "Medium Coverage Foundation"],
          dateCreated: "2024-01-10",
          isFavorite: false,
          tags: ["professional", "neutral", "confident"],
        },
        {
          id: "3",
          name: "Girls Night Out",
          image: "/placeholder.svg?height=300&width=300",
          occasion: "Party",
          mood: "Bold",
          products: ["Smoky Gray Eyeshadow", "Classic Red Lipstick", "Full Coverage Foundation"],
          dateCreated: "2024-01-08",
          isFavorite: true,
          tags: ["bold", "dramatic", "party"],
        },
        {
          id: "4",
          name: "Wedding Guest",
          image: "/placeholder.svg?height=300&width=300",
          occasion: "Wedding",
          mood: "Elegant",
          products: ["Purple Glam Eyeshadow", "Berry Bold Lipstick", "Light Foundation"],
          dateCreated: "2024-01-05",
          isFavorite: false,
          tags: ["elegant", "formal", "purple"],
        },
        {
          id: "5",
          name: "Casual Day Out",
          image: "/placeholder.svg?height=300&width=300",
          occasion: "Casual",
          mood: "Fresh",
          products: ["Natural Eyeshadow", "Tinted Lip Balm", "BB Cream"],
          dateCreated: "2024-01-03",
          isFavorite: false,
          tags: ["natural", "casual", "fresh"],
        },
        {
          id: "6",
          name: "Festival Vibes",
          image: "/placeholder.svg?height=300&width=300",
          occasion: "Festival",
          mood: "Creative",
          products: ["Colorful Eyeshadow", "Glitter Lipstick", "Highlighter"],
          dateCreated: "2024-01-01",
          isFavorite: true,
          tags: ["creative", "colorful", "festival"],
        },
        {
          id: "7",
          name: "Brunch Elegance",
          image: "/placeholder.svg?height=300&width=300",
          occasion: "Casual",
          mood: "Chic",
          products: ["Warm Brown Eyeshadow", "Peach Lipstick", "Light Coverage Foundation"],
          dateCreated: "2024-01-20",
          isFavorite: false,
          tags: ["chic", "warm", "brunch"],
        },
        {
          id: "8",
          name: "Evening Gala",
          image: "/placeholder.svg?height=300&width=300",
          occasion: "Formal",
          mood: "Sophisticated",
          products: ["Gold Eyeshadow", "Deep Red Lipstick", "Full Coverage Foundation"],
          dateCreated: "2024-01-18",
          isFavorite: true,
          tags: ["sophisticated", "gold", "formal"],
        },
      ])
      setIsLoading(false)
    }

    loadData()
  }, [])

  // Load more looks on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + document.documentElement.scrollTop !== document.documentElement.offsetHeight) return
      if (visibleLooks < savedLooks.length) {
        setVisibleLooks((prev) => Math.min(prev + 3, savedLooks.length))
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [visibleLooks, savedLooks.length])

  const filteredLooks = savedLooks
    .filter((look) => {
      const matchesSearch =
        look.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        look.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))

      if (selectedFilter === "all") return matchesSearch
      if (selectedFilter === "favorites") return matchesSearch && look.isFavorite
      return matchesSearch && look.occasion.toLowerCase() === selectedFilter.toLowerCase()
    })
    .slice(0, visibleLooks)

  const occasions = ["all", "favorites", "work", "date night", "party", "wedding", "casual", "festival", "formal"]

  const toggleFavorite = (id: string) => {
    setSavedLooks((prev) => prev.map((look) => (look.id === id ? { ...look, isFavorite: !look.isFavorite } : look)))
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-rose-200 border-t-rose-600 rounded-full animate-spin mx-auto"></div>
            <div
              className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-pink-400 rounded-full animate-spin mx-auto"
              style={{ animationDirection: "reverse", animationDuration: "1.5s" }}
            ></div>
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-semibold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
              Loading Your Lookbook
            </h3>
            <p className="text-gray-600">Preparing your saved makeup looks...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50">
      {/* Hero Section with Animation */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-rose-600/10 to-pink-600/10 animate-gradient-x"></div>
        <div className="container mx-auto px-4 py-16 relative">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12 animate-fade-in-up">
              <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full mb-6 shadow-lg">
                <TrendingUp className="h-4 w-4 text-rose-600" />
                <span className="text-sm font-medium text-gray-700">Your Personal Collection</span>
              </div>
              <h1
                className="text-5xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent mb-6 animate-fade-in-up"
                style={{ animationDelay: "0.2s" }}
              >
                My Lookbook
              </h1>
              <p
                className="text-xl text-gray-600 max-w-2xl mx-auto animate-fade-in-up"
                style={{ animationDelay: "0.4s" }}
              >
                Save, organize, and revisit your favorite makeup looks with professional styling and inspiration
              </p>
            </div>

            {/* Enhanced Search and Filter Bar */}
            <div
              className="flex flex-col lg:flex-row gap-6 mb-12 animate-fade-in-up"
              style={{ animationDelay: "0.6s" }}
            >
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  placeholder="Search your looks by name, mood, or tags..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 h-12 bg-white/80 backdrop-blur-sm border-0 shadow-lg focus:shadow-xl transition-all duration-300 text-gray-700 placeholder:text-gray-500"
                />
              </div>

              <div className="flex items-center gap-3">
                <Filter className="h-5 w-5 text-gray-600" />
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                  {occasions.map((occasion, index) => (
                    <Button
                      key={occasion}
                      variant={selectedFilter === occasion ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedFilter(occasion)}
                      className={`whitespace-nowrap transition-all duration-300 transform hover:scale-105 ${
                        selectedFilter === occasion
                          ? "bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 shadow-lg"
                          : "bg-white/80 backdrop-blur-sm border-gray-200 hover:bg-white hover:shadow-md"
                      } animate-fade-in-right`}
                      style={{ animationDelay: `${0.8 + index * 0.1}s` }}
                    >
                      {occasion === "all"
                        ? "All Looks"
                        : occasion === "favorites"
                          ? "Favorites"
                          : occasion.charAt(0).toUpperCase() + occasion.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            {/* Enhanced Stats Cards */}
            <div className="grid md:grid-cols-4 gap-6 mb-12">
              {[
                { label: "Total Looks", value: savedLooks.length, color: "rose", icon: "📚" },
                {
                  label: "Favorites",
                  value: savedLooks.filter((look) => look.isFavorite).length,
                  color: "pink",
                  icon: "❤️",
                },
                {
                  label: "Occasions",
                  value: new Set(savedLooks.map((look) => look.occasion)).size,
                  color: "purple",
                  icon: "🎭",
                },
                {
                  label: "Products Used",
                  value: new Set(savedLooks.flatMap((look) => look.products)).size,
                  color: "rose",
                  icon: "💄",
                },
              ].map((stat, index) => (
                <Card
                  key={stat.label}
                  className={`border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 transform hover:scale-105 animate-fade-in-up`}
                  style={{ animationDelay: `${1 + index * 0.1}s` }}
                >
                  <CardContent className="p-6 text-center">
                    <div className="text-3xl mb-2">{stat.icon}</div>
                    <div className={`text-3xl font-bold text-${stat.color}-600 mb-1`}>{stat.value}</div>
                    <div className="text-sm text-gray-600 font-medium">{stat.label}</div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Create New Look Button */}
            <div className="mb-12 animate-fade-in-up" style={{ animationDelay: "1.4s" }}>
              <Link href="/skin-analysis">
                <Button className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 px-8 py-3 text-lg">
                  <Plus className="mr-2 h-5 w-5" />
                  Create New Look
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Looks Grid */}
      <div className="container mx-auto px-4 pb-16">
        <div className="max-w-7xl mx-auto">
          {filteredLooks.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {filteredLooks.map((look, index) => (
                <Card
                  key={look.id}
                  className="group hover:shadow-2xl transition-all duration-500 border-0 shadow-lg overflow-hidden bg-white/90 backdrop-blur-sm transform hover:scale-105 animate-fade-in-up"
                  style={{ animationDelay: `${1.6 + index * 0.1}s` }}
                >
                  <div className="relative overflow-hidden">
                    <Image
                      src={look.image || "/placeholder.svg"}
                      alt={look.name}
                      width={300}
                      height={300}
                      className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                    <div className="absolute top-3 right-3 flex gap-2">
                      <Button
                        size="icon"
                        variant="secondary"
                        className="h-9 w-9 bg-white/90 backdrop-blur-sm hover:bg-white shadow-lg transition-all duration-300 transform hover:scale-110"
                        onClick={() => toggleFavorite(look.id)}
                      >
                        <Heart
                          className={`h-4 w-4 transition-colors duration-300 ${look.isFavorite ? "fill-rose-500 text-rose-500" : "text-gray-600"}`}
                        />
                      </Button>
                      <Button
                        size="icon"
                        variant="secondary"
                        className="h-9 w-9 bg-white/90 backdrop-blur-sm hover:bg-white shadow-lg transition-all duration-300 transform hover:scale-110"
                      >
                        <Share className="h-4 w-4 text-gray-600" />
                      </Button>
                    </div>

                    <div className="absolute bottom-3 left-3">
                      <Badge variant="secondary" className="bg-white/90 backdrop-blur-sm text-gray-700 shadow-lg">
                        {look.occasion}
                      </Badge>
                    </div>
                  </div>

                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-bold text-xl text-gray-900 mb-2 group-hover:text-rose-600 transition-colors duration-300">
                          {look.name}
                        </h3>
                        <p className="text-sm text-gray-600 flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          {new Date(look.dateCreated).toLocaleDateString("en-US", {
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {look.tags.slice(0, 3).map((tag) => (
                          <Badge
                            key={tag}
                            variant="outline"
                            className="text-xs border-rose-200 text-rose-700 bg-rose-50 hover:bg-rose-100 transition-colors duration-300"
                          >
                            #{tag}
                          </Badge>
                        ))}
                        {look.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs border-gray-200 text-gray-600 bg-gray-50">
                            +{look.tags.length - 3} more
                          </Badge>
                        )}
                      </div>

                      <div className="space-y-2">
                        <p className="text-sm font-semibold text-gray-700">Featured Products:</p>
                        <div className="text-sm text-gray-600">
                          {look.products.slice(0, 2).join(", ")}
                          {look.products.length > 2 && (
                            <span className="text-rose-600 font-medium"> +{look.products.length - 2} more</span>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2 pt-3">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 bg-transparent hover:bg-rose-50 hover:border-rose-300 transition-all duration-300"
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </Button>
                        <Button
                          size="sm"
                          className="flex-1 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 transition-all duration-300"
                        >
                          Recreate
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="hover:bg-red-50 hover:border-red-300 hover:text-red-600 transition-all duration-300 bg-transparent"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 animate-fade-in-up">
              <div className="relative mb-8">
                <BookOpen className="h-24 w-24 text-gray-300 mx-auto animate-float" />
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-rose-500 rounded-full animate-ping"></div>
              </div>
              <h3 className="text-2xl font-bold text-gray-600 mb-4">No looks found</h3>
              <p className="text-gray-500 mb-8 max-w-md mx-auto">
                {searchTerm || selectedFilter !== "all"
                  ? "Try adjusting your search terms or filters to discover more looks"
                  : "Start building your personal makeup collection by creating your first look!"}
              </p>
              <Link href="/skin-analysis">
                <Button className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 px-8 py-3 text-lg">
                  <Plus className="mr-2 h-5 w-5" />
                  Create Your First Look
                </Button>
              </Link>
            </div>
          )}

          {/* Load More Indicator */}
          {visibleLooks < savedLooks.length && (
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
                <span className="ml-2 text-sm">Scroll down to load more looks</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
