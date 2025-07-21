"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ShoppingBag, Search, Filter, Star, Heart, ExternalLink, Palette, Eye, Smile, Sparkles } from "lucide-react"
import Image from "next/image"

interface Product {
  id: string
  name: string
  brand: string
  price: string
  rating: number
  reviews: number
  image: string
  category: "foundation" | "eyeshadow" | "lipstick" | "blush" | "tools"
  description: string
  shades: string[]
  skinTypes: string[]
  affiliate: {
    amazon?: string
    sephora?: string
    ulta?: string
  }
  isFavorite: boolean
}

export default function ProductsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [priceFilter, setPriceFilter] = useState("all")

  const products: Product[] = [
    {
      id: "1",
      name: "Flawless Foundation",
      brand: "Beauty Pro",
      price: "$32.00",
      rating: 4.5,
      reviews: 1250,
      image: "/placeholder.svg?height=200&width=200",
      category: "foundation",
      description: "Full coverage, long-lasting foundation perfect for all skin types",
      shades: ["Light", "Medium", "Deep", "Dark"],
      skinTypes: ["All skin types"],
      affiliate: {
        amazon: "https://amazon.com/product1",
        sephora: "https://sephora.com/product1",
      },
      isFavorite: false,
    },
    {
      id: "2",
      name: "Rose Gold Eyeshadow Palette",
      brand: "Glamour Co",
      price: "$45.00",
      rating: 4.8,
      reviews: 890,
      image: "/placeholder.svg?height=200&width=200",
      category: "eyeshadow",
      description: "12 stunning rose gold shades for romantic eye looks",
      shades: ["Rose Gold", "Champagne", "Bronze", "Copper"],
      skinTypes: ["All skin types"],
      affiliate: {
        amazon: "https://amazon.com/product2",
        ulta: "https://ulta.com/product2",
      },
      isFavorite: true,
    },
    {
      id: "3",
      name: "Classic Red Lipstick",
      brand: "Luxe Lips",
      price: "$28.00",
      rating: 4.6,
      reviews: 2100,
      image: "/placeholder.svg?height=200&width=200",
      category: "lipstick",
      description: "Timeless red lipstick with matte finish and all-day wear",
      shades: ["Classic Red", "Deep Red", "Cherry Red"],
      skinTypes: ["All skin types"],
      affiliate: {
        sephora: "https://sephora.com/product3",
        ulta: "https://ulta.com/product3",
      },
      isFavorite: false,
    },
    {
      id: "4",
      name: "Peachy Pink Blush",
      brand: "Glow Beauty",
      price: "$22.00",
      rating: 4.4,
      reviews: 650,
      image: "/placeholder.svg?height=200&width=200",
      category: "blush",
      description: "Natural-looking blush that gives a healthy, radiant glow",
      shades: ["Peachy Pink", "Rose Flush", "Coral Glow"],
      skinTypes: ["All skin types"],
      affiliate: {
        amazon: "https://amazon.com/product4",
      },
      isFavorite: true,
    },
    {
      id: "5",
      name: "Professional Brush Set",
      brand: "Makeup Masters",
      price: "$65.00",
      rating: 4.7,
      reviews: 1800,
      image: "/placeholder.svg?height=200&width=200",
      category: "tools",
      description: "15-piece professional makeup brush set with premium synthetic bristles",
      shades: ["N/A"],
      skinTypes: ["All skin types"],
      affiliate: {
        amazon: "https://amazon.com/product5",
        sephora: "https://sephora.com/product5",
      },
      isFavorite: false,
    },
    {
      id: "6",
      name: "Smoky Eye Palette",
      brand: "Drama Queen",
      price: "$38.00",
      rating: 4.3,
      reviews: 920,
      image: "/placeholder.svg?height=200&width=200",
      category: "eyeshadow",
      description: "Perfect palette for creating dramatic smoky eye looks",
      shades: ["Charcoal", "Silver", "Black", "Gray"],
      skinTypes: ["All skin types"],
      affiliate: {
        ulta: "https://ulta.com/product6",
      },
      isFavorite: false,
    },
  ]

  const categories = [
    { value: "all", label: "All Products", icon: ShoppingBag },
    { value: "foundation", label: "Foundation", icon: Sparkles },
    { value: "eyeshadow", label: "Eyeshadow", icon: Eye },
    { value: "lipstick", label: "Lipstick", icon: Smile },
    { value: "blush", label: "Blush", icon: Heart },
    { value: "tools", label: "Tools", icon: Palette },
  ]

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.brand.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory

    let matchesPrice = true
    if (priceFilter === "under25") {
      matchesPrice = Number.parseFloat(product.price.replace("$", "")) < 25
    } else if (priceFilter === "25to50") {
      const price = Number.parseFloat(product.price.replace("$", ""))
      matchesPrice = price >= 25 && price <= 50
    } else if (priceFilter === "over50") {
      matchesPrice = Number.parseFloat(product.price.replace("$", "")) > 50
    }

    return matchesSearch && matchesCategory && matchesPrice
  })

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < Math.floor(rating)
            ? "fill-yellow-400 text-yellow-400"
            : i < rating
              ? "fill-yellow-200 text-yellow-400"
              : "text-gray-300"
        }`}
      />
    ))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent mb-4">
              Recommended Products
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Curated makeup products perfect for your style and skin tone
            </p>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col lg:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search products or brands..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex gap-2">
              <select
                value={priceFilter}
                onChange={(e) => setPriceFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="all">All Prices</option>
                <option value="under25">Under $25</option>
                <option value="25to50">$25 - $50</option>
                <option value="over50">Over $50</option>
              </select>
            </div>
          </div>

          <div className="grid lg:grid-cols-4 gap-8">
            {/* Category Sidebar */}
            <div className="lg:col-span-1">
              <Card className="border-0 shadow-lg sticky top-4">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Filter className="h-5 w-5 text-rose-600" />
                    Categories
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {categories.map((category) => {
                    const Icon = category.icon
                    return (
                      <Button
                        key={category.value}
                        variant={selectedCategory === category.value ? "default" : "ghost"}
                        className={`w-full justify-start ${
                          selectedCategory === category.value
                            ? "bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600"
                            : "hover:bg-rose-50"
                        }`}
                        onClick={() => setSelectedCategory(category.value)}
                      >
                        <Icon className="mr-2 h-4 w-4" />
                        {category.label}
                      </Button>
                    )
                  })}
                </CardContent>
              </Card>
            </div>

            {/* Products Grid */}
            <div className="lg:col-span-3">
              {filteredProducts.length > 0 ? (
                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredProducts.map((product) => (
                    <Card
                      key={product.id}
                      className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg overflow-hidden"
                    >
                      <div className="relative">
                        <Image
                          src={product.image || "/placeholder.svg"}
                          alt={product.name}
                          width={200}
                          height={200}
                          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-3 right-3">
                          <Button size="icon" variant="secondary" className="h-8 w-8 bg-white/80 hover:bg-white">
                            <Heart
                              className={`h-4 w-4 ${product.isFavorite ? "fill-rose-500 text-rose-500" : "text-gray-600"}`}
                            />
                          </Button>
                        </div>
                        {product.rating >= 4.5 && (
                          <div className="absolute top-3 left-3">
                            <Badge variant="secondary" className="bg-green-100 text-green-700">
                              Top Rated
                            </Badge>
                          </div>
                        )}
                      </div>

                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div>
                            <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100">{product.name}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{product.brand}</p>
                          </div>

                          <div className="flex items-center gap-2">
                            <div className="flex">{renderStars(product.rating)}</div>
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {product.rating} ({product.reviews} reviews)
                            </span>
                          </div>

                          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{product.description}</p>

                          <div className="flex flex-wrap gap-1">
                            {product.shades.slice(0, 3).map((shade) => (
                              <Badge key={shade} variant="outline" className="text-xs border-rose-200 text-rose-700">
                                {shade}
                              </Badge>
                            ))}
                            {product.shades.length > 3 && (
                              <Badge variant="outline" className="text-xs border-gray-200 text-gray-600">
                                +{product.shades.length - 3}
                              </Badge>
                            )}
                          </div>

                          <div className="flex items-center justify-between pt-2">
                            <span className="text-xl font-bold text-gray-900">{product.price}</span>
                          </div>

                          <div className="space-y-2">
                            <p className="text-xs font-medium text-gray-700">Available at:</p>
                            <div className="flex gap-2">
                              {product.affiliate.amazon && (
                                <Button size="sm" variant="outline" className="flex-1 bg-transparent" asChild>
                                  <a href={product.affiliate.amazon} target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="mr-1 h-3 w-3" />
                                    Amazon
                                  </a>
                                </Button>
                              )}
                              {product.affiliate.sephora && (
                                <Button size="sm" variant="outline" className="flex-1 bg-transparent" asChild>
                                  <a href={product.affiliate.sephora} target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="mr-1 h-3 w-3" />
                                    Sephora
                                  </a>
                                </Button>
                              )}
                              {product.affiliate.ulta && (
                                <Button size="sm" variant="outline" className="flex-1 bg-transparent" asChild>
                                  <a href={product.affiliate.ulta} target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="mr-1 h-3 w-3" />
                                    Ulta
                                  </a>
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <ShoppingBag className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">No products found</h3>
                  <p className="text-gray-500 mb-6">Try adjusting your search terms or filters</p>
                  <Button
                    onClick={() => {
                      setSearchTerm("")
                      setSelectedCategory("all")
                      setPriceFilter("all")
                    }}
                    variant="outline"
                  >
                    Clear Filters
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Featured Brands Section */}
          <div className="mt-16">
            <Card className="border-0 shadow-lg bg-gradient-to-r from-rose-100 to-pink-100">
              <CardHeader>
                <CardTitle className="text-center">Featured Brands</CardTitle>
                <CardDescription className="text-center">
                  Trusted by makeup artists and beauty enthusiasts worldwide
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center">
                  {["Beauty Pro", "Glamour Co", "Luxe Lips", "Glow Beauty"].map((brand) => (
                    <div key={brand} className="text-center">
                      <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-2 shadow-md">
                        <span className="text-lg font-bold text-gray-600">{brand.charAt(0)}</span>
                      </div>
                      <p className="text-sm font-medium text-gray-700">{brand}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
