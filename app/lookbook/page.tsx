"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { BookOpen, Search, Heart, Share, Calendar, Eye, Trash2, Plus } from "lucide-react"
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
  const [savedLooks] = useState<SavedLook[]>([
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

  const filteredLooks = savedLooks.filter((look) => {
    const matchesSearch =
      look.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      look.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))

    if (selectedFilter === "all") return matchesSearch
    if (selectedFilter === "favorites") return matchesSearch && look.isFavorite
    return matchesSearch && look.occasion.toLowerCase() === selectedFilter.toLowerCase()
  })

  const occasions = ["all", "favorites", "work", "date night", "party", "wedding", "casual", "festival"]

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent mb-4">
              My Lookbook
            </h1>
            <p className="text-xl text-gray-600">Save, organize, and revisit your favorite makeup looks</p>
          </div>

          {/* Search and Filter Bar */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search your looks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex gap-2 overflow-x-auto pb-2">
              {occasions.map((occasion) => (
                <Button
                  key={occasion}
                  variant={selectedFilter === occasion ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedFilter(occasion)}
                  className={`whitespace-nowrap ${
                    selectedFilter === occasion
                      ? "bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600"
                      : ""
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

          {/* Stats Cards */}
          <div className="grid md:grid-cols-4 gap-4 mb-8">
            <Card className="border-0 shadow-md">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-rose-600">{savedLooks.length}</div>
                <div className="text-sm text-gray-600">Total Looks</div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-md">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-pink-600">
                  {savedLooks.filter((look) => look.isFavorite).length}
                </div>
                <div className="text-sm text-gray-600">Favorites</div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-md">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {new Set(savedLooks.map((look) => look.occasion)).size}
                </div>
                <div className="text-sm text-gray-600">Occasions</div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-md">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-rose-600">
                  {new Set(savedLooks.flatMap((look) => look.products)).size}
                </div>
                <div className="text-sm text-gray-600">Products Used</div>
              </CardContent>
            </Card>
          </div>

          {/* Create New Look Button */}
          <div className="mb-8">
            <Link href="/skin-analysis">
              <Button className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600">
                <Plus className="mr-2 h-4 w-4" />
                Create New Look
              </Button>
            </Link>
          </div>

          {/* Looks Grid */}
          {filteredLooks.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredLooks.map((look) => (
                <Card
                  key={look.id}
                  className="group hover:shadow-lg transition-all duration-300 border-0 shadow-md overflow-hidden"
                >
                  <div className="relative">
                    <Image
                      src={look.image || "/placeholder.svg"}
                      alt={look.name}
                      width={300}
                      height={300}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 right-2 flex gap-2">
                      <Button size="icon" variant="secondary" className="h-8 w-8 bg-white/80 hover:bg-white">
                        <Heart
                          className={`h-4 w-4 ${look.isFavorite ? "fill-rose-500 text-rose-500" : "text-gray-600"}`}
                        />
                      </Button>
                      <Button size="icon" variant="secondary" className="h-8 w-8 bg-white/80 hover:bg-white">
                        <Share className="h-4 w-4 text-gray-600" />
                      </Button>
                    </div>
                    <div className="absolute bottom-2 left-2">
                      <Badge variant="secondary" className="bg-white/80 text-gray-700">
                        {look.occasion}
                      </Badge>
                    </div>
                  </div>

                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div>
                        <h3 className="font-semibold text-lg text-gray-900 mb-1">{look.name}</h3>
                        <p className="text-sm text-gray-600 flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(look.dateCreated).toLocaleDateString()}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-1">
                        {look.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs border-rose-200 text-rose-700">
                            {tag}
                          </Badge>
                        ))}
                        {look.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs border-gray-200 text-gray-600">
                            +{look.tags.length - 3}
                          </Badge>
                        )}
                      </div>

                      <div className="space-y-2">
                        <p className="text-xs font-medium text-gray-700">Products Used:</p>
                        <div className="text-xs text-gray-600">
                          {look.products.slice(0, 2).join(", ")}
                          {look.products.length > 2 && ` +${look.products.length - 2} more`}
                        </div>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                          <Eye className="mr-1 h-3 w-3" />
                          View
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                          Recreate
                        </Button>
                        <Button size="sm" variant="outline">
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No looks found</h3>
              <p className="text-gray-500 mb-6">
                {searchTerm || selectedFilter !== "all"
                  ? "Try adjusting your search or filters"
                  : "Start creating your first makeup look!"}
              </p>
              <Link href="/skin-analysis">
                <Button className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Look
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
