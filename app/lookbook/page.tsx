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

  const occasions = ["all", "favorites", "work", "date night", "party", "wedding", "casual", "festival"]

  const toggleFavorite = (id: string) => {
    setSavedLooks((prev) => prev.map((look) => (look.id === id ? { ...look, isFavorite: !look.isFavorite } : look)))
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-primary flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-pink-200 border-t-pink-600 rounded-full animate-spin mx-auto"></div>
            <div
              className="absolute inset-0 w-20 h-20 border-4 border-transparent border-r-purple-400 rounded-full animate-spin mx-auto"
              style={{ animationDirection: "reverse", animationDuration: "1.5s" }}
            ></div>
          </div>
          <div className="space-y-3">
            <h3 className="text-2xl font-bold text-shimmer font-poppins">Loading Your Lookbook</h3>
            <p className="text-foreground/70">Preparing your saved makeup looks...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-primary">
      {/* Hero Section */}
      <div className="relative overflow-hidden py-20">
        <div className="container-premium">
          <div className="text-center mb-16 space-y-6">
            <Badge
              variant="secondary"
              className="glass-morphism border-pink-400/30 text-pink-600 dark:text-pink-400 px-6 py-3 text-lg animate-fade-in-up"
            >
              <TrendingUp className="h-5 w-5 mr-2" />
              Your Personal Collection
            </Badge>

            <h1 className="text-6xl font-bold font-poppins text-shimmer animate-fade-in-up delay-200">My Lookbook</h1>

            <p className="text-xl text-foreground/80 max-w-2xl mx-auto leading-relaxed animate-fade-in-up delay-400">
              Save, organize, and revisit your favorite makeup looks with professional styling and inspiration
            </p>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col lg:flex-row gap-6 mb-16 animate-fade-in-up delay-600">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-foreground/40 h-5 w-5" />
              <Input
                placeholder="Search your looks by name, mood, or tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 h-14 glass-morphism border-white/20 focus:border-pink-400 text-lg"
              />
            </div>

            <div className="flex items-center gap-4">
              <Filter className="h-5 w-5 text-foreground/60" />
              <div className="flex gap-2 overflow-x-auto pb-2">
                {occasions.map((occasion, index) => (
                  <Button
                    key={occasion}
                    variant={selectedFilter === occasion ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedFilter(occasion)}
                    className={`whitespace-nowrap transition-all duration-300 transform hover:scale-105 animate-fade-in-right delay-${800 + index * 100} ${
                      selectedFilter === occasion
                        ? "btn-premium shadow-lg"
                        : "glass-morphism border-white/20 hover:bg-white/10"
                    }`}
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

          {/* Stats Cards */}
          <div className="grid md:grid-cols-4 gap-6 mb-16">
            {[
              { label: "Total Looks", value: savedLooks.length, icon: "📚" },
              { label: "Favorites", value: savedLooks.filter((look) => look.isFavorite).length, icon: "❤️" },
              { label: "Occasions", value: new Set(savedLooks.map((look) => look.occasion)).size, icon: "🎭" },
              { label: "Products Used", value: new Set(savedLooks.flatMap((look) => look.products)).size, icon: "💄" },
            ].map((stat, index) => (
              <Card
                key={stat.label}
                className={`card-premium text-center animate-fade-in-up delay-${1000 + index * 100}`}
              >
                <CardContent className="p-6">
                  <div className="text-4xl mb-3">{stat.icon}</div>
                  <div className="text-3xl font-bold text-gradient font-poppins mb-2">{stat.value}</div>
                  <div className="text-sm text-muted-foreground font-medium">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Create New Look Button */}
          <div className="mb-16 animate-fade-in-up delay-1400">
            <Link href="/skin-analysis">
              <Button className="btn-premium px-8 py-4 text-lg group">
                <Plus className="mr-2 h-5 w-5 group-hover:rotate-90 transition-transform duration-300" />
                Create New Look
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Looks Grid */}
      <div className="container-premium pb-20">
        {filteredLooks.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredLooks.map((look, index) => (
              <Card key={look.id} className={`card-premium animate-fade-in-up delay-${1600 + index * 100}`}>
                <div className="relative overflow-hidden">
                  <Image
                    src={look.image || "/placeholder.svg"}
                    alt={look.name}
                    width={300}
                    height={300}
                    className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                  <div className="absolute top-3 right-3 flex gap-2">
                    <Button
                      size="icon"
                      variant="secondary"
                      className="h-9 w-9 glass-morphism hover:bg-white/20 shadow-lg transition-all duration-300 transform hover:scale-110"
                      onClick={() => toggleFavorite(look.id)}
                    >
                      <Heart
                        className={`h-4 w-4 transition-colors duration-300 ${look.isFavorite ? "fill-pink-500 text-pink-500" : "text-foreground/60"}`}
                      />
                    </Button>
                    <Button
                      size="icon"
                      variant="secondary"
                      className="h-9 w-9 glass-morphism hover:bg-white/20 shadow-lg transition-all duration-300 transform hover:scale-110"
                    >
                      <Share className="h-4 w-4 text-foreground/60" />
                    </Button>
                  </div>

                  <div className="absolute bottom-3 left-3">
                    <Badge variant="secondary" className="glass-morphism text-foreground/80 shadow-lg">
                      {look.occasion}
                    </Badge>
                  </div>
                </div>

                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-bold text-xl font-poppins group-hover:text-pink-500 transition-colors duration-300">
                        {look.name}
                      </h3>
                      <p className="text-sm text-muted-foreground flex items-center gap-2 mt-2">
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
                          className="text-xs border-pink-200 text-pink-600 bg-pink-50/50 dark:bg-pink-900/20 dark:text-pink-400 dark:border-pink-800"
                        >
                          #{tag}
                        </Badge>
                      ))}
                      {look.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{look.tags.length - 3} more
                        </Badge>
                      )}
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-foreground/80">Featured Products:</p>
                      <div className="text-sm text-muted-foreground">
                        {look.products.slice(0, 2).join(", ")}
                        {look.products.length > 2 && (
                          <span className="text-pink-500 font-medium"> +{look.products.length - 2} more</span>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2 pt-3">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 glass-morphism border-white/20 hover:bg-white/10 transition-all duration-300 bg-transparent"
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </Button>
                      <Button size="sm" className="flex-1 btn-premium">
                        Recreate
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="glass-morphism border-white/20 hover:bg-red-500/20 hover:border-red-400 hover:text-red-400 transition-all duration-300 bg-transparent"
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
              <BookOpen className="h-24 w-24 text-foreground/30 mx-auto animate-float" />
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-pink-500 rounded-full animate-ping"></div>
            </div>
            <h3 className="text-2xl font-bold text-foreground/80 font-poppins mb-4">No looks found</h3>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              {searchTerm || selectedFilter !== "all"
                ? "Try adjusting your search terms or filters to discover more looks"
                : "Start building your personal makeup collection by creating your first look!"}
            </p>
            <Link href="/skin-analysis">
              <Button className="btn-premium px-8 py-4 text-lg group">
                <Plus className="mr-2 h-5 w-5 group-hover:rotate-90 transition-transform duration-300" />
                Create Your First Look
              </Button>
            </Link>
          </div>
        )}

        {/* Load More Indicator */}
        {visibleLooks < savedLooks.length && (
          <div className="text-center mt-12 animate-fade-in-up">
            <div className="inline-flex items-center gap-2 text-muted-foreground">
              <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-100"></div>
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-200"></div>
              <span className="ml-2 text-sm">Scroll down to load more looks</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
