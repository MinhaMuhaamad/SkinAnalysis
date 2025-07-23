"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  ShoppingBag,
  Search,
  Filter,
  Star,
  Heart,
  ExternalLink,
  Palette,
  Eye,
  Smile,
  Sparkles,
  TrendingUp,
  Award,
  Zap,
} from "lucide-react"
import Image from "next/image"

interface Product {
  id: string
  name: string
  brand: string
  price: string
  originalPrice?: string
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
  isNew?: boolean
  isBestseller?: boolean
  discount?: number
}

export default function ProductsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [priceFilter, setPriceFilter] = useState("all")
  const [isLoading, setIsLoading] = useState(true)
  const [visibleProducts, setVisibleProducts] = useState(6)
  const [products, setProducts] = useState<Product[]>([])

  useEffect(() => {
    const loadProducts = async () => {
      setIsLoading(true)
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1200))

      setProducts([
        {
          id: "1",
          name: "Flawless Foundation",
          brand: "Beauty Pro",
          price: "$32.00",
          originalPrice: "$40.00",
          rating: 4.8,
          reviews: 1250,
          image: "/placeholder.svg?height=200&width=200",
          category: "foundation",
          description: "Full coverage, long-lasting foundation perfect for all skin types with 24-hour wear",
          shades: ["Light", "Medium", "Deep", "Dark"],
          skinTypes: ["All skin types"],
          affiliate: {
            amazon: "https://amazon.com/product1",
            sephora: "https://sephora.com/product1",
          },
          isFavorite: false,
          isBestseller: true,
          discount: 20,
        },
        {
          id: "2",
          name: "Rose Gold Eyeshadow Palette",
          brand: "Glamour Co",
          price: "$45.00",
          rating: 4.9,
          reviews: 890,
          image: "/placeholder.svg?height=200&width=200",
          category: "eyeshadow",
          description: "12 stunning rose gold shades for romantic eye looks with buttery smooth texture",
          shades: ["Rose Gold", "Champagne", "Bronze", "Copper"],
          skinTypes: ["All skin types"],
          affiliate: {
            amazon: "https://amazon.com/product2",
            ulta: "https://ulta.com/product2",
          },
          isFavorite: true,
          isNew: true,
        },
        {
          id: "3",
          name: "Classic Red Lipstick",
          brand: "Luxe Lips",
          price: "$28.00",
          rating: 4.7,
          reviews: 2100,
          image: "/placeholder.svg?height=200&width=200",
          category: "lipstick",
          description: "Timeless red lipstick with matte finish and all-day wear comfort",
          shades: ["Classic Red", "Deep Red", "Cherry Red"],
          skinTypes: ["All skin types"],
          affiliate: {
            sephora: "https://sephora.com/product3",
            ulta: "https://ulta.com/product3",
          },
          isFavorite: false,
          isBestseller: true,
        },
        {
          id: "4",
          name: "Peachy Pink Blush",
          brand: "Glow Beauty",
          price: "$22.00",
          originalPrice: "$28.00",
          rating: 4.6,
          reviews: 650,
          image: "/placeholder.svg?height=200&width=200",
          category: "blush",
          description: "Natural-looking blush that gives a healthy, radiant glow with buildable coverage",
          shades: ["Peachy Pink", "Rose Flush", "Coral Glow"],
          skinTypes: ["All skin types"],
          affiliate: {
            amazon: "https://amazon.com/product4",
          },
          isFavorite: true,
          discount: 21,
        },
        {
          id: "5",
          name: "Professional Brush Set",
          brand: "Makeup Masters",
          price: "$65.00",
          rating: 4.8,
          reviews: 1800,
          image: "/placeholder.svg?height=200&width=200",
          category: "tools",
          description: "15-piece professional makeup brush set with premium synthetic bristles and elegant case",
          shades: ["N/A"],
          skinTypes: ["All skin types"],
          affiliate: {
            amazon: "https://amazon.com/product5",
            sephora: "https://sephora.com/product5",
          },
          isFavorite: false,
          isBestseller: true,
        },
        {
          id: "6",
          name: "Smoky Eye Palette",
          brand: "Drama Queen",
          price: "$38.00",
          rating: 4.5,
          reviews: 920,
          image: "/placeholder.svg?height=200&width=200",
          category: "eyeshadow",
          description: "Perfect palette for creating dramatic smoky eye looks with highly pigmented shades",
          shades: ["Charcoal", "Silver", "Black", "Gray"],
          skinTypes: ["All skin types"],
          affiliate: {
            ulta: "https://ulta.com/product6",
          },
          isFavorite: false,
          isNew: true,
        },
        {
          id: "7",
          name: "Hydrating Lip Gloss",
          brand: "Glossy Dreams",
          price: "$18.00",
          rating: 4.4,
          reviews: 540,
          image: "/placeholder.svg?height=200&width=200",
          category: "lipstick",
          description: "Ultra-hydrating lip gloss with mirror-like shine and comfortable wear",
          shades: ["Clear", "Pink Shimmer", "Coral Glow", "Berry Burst"],
          skinTypes: ["All skin types"],
          affiliate: {
            sephora: "https://sephora.com/product7",
          },
          isFavorite: false,
        },
        {
          id: "8",
          name: "Contour & Highlight Kit",
          brand: "Sculpt Pro",
          price: "$42.00",
          rating: 4.7,
          reviews: 780,
          image: "/placeholder.svg?height=200&width=200",
          category: "foundation",
          description: "Professional contour and highlight kit for sculpting and defining facial features",
          shades: ["Light", "Medium", "Deep"],
          skinTypes: ["All skin types"],
          affiliate: {
            amazon: "https://amazon.com/product8",
            ulta: "https://ulta.com/product8",
          },
          isFavorite: true,
          isBestseller: true,
        },
      ])
      setIsLoading(false)
    }

    loadProducts()
  }, [])

  // Load more on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + document.documentElement.scrollTop >= document.documentElement.offsetHeight - 1000) {
        if (visibleProducts < filteredProducts.length) {
          setVisibleProducts((prev) => Math.min(prev + 3, filteredProducts.length))
        }
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [visibleProducts])

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

  const toggleFavorite = (id: string) => {
    setProducts((prev) =>
      prev.map((product) => (product.id === id ? { ...product, isFavorite: !product.isFavorite } : product)),
    )
  }

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-rose-200 border-t-rose-600 rounded-full animate-spin mx-auto"></div>
            <div
              className="absolute inset-0 w-20 h-20 border-4 border-transparent border-r-pink-400 rounded-full animate-spin mx-auto"
              style={{ animationDirection: "reverse", animationDuration: "1.5s" }}
            ></div>
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
              Loading Products
            </h3>
            <p className="text-gray-600">Curating the best makeup products for you...</p>
          </div>
        </div>
      </div>
    )
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
                <Award className="h-4 w-4 text-rose-600" />
                <span className="text-sm font-medium text-gray-700">Curated by Professionals</span>
              </div>
              <h1
                className="text-5xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent mb-6 animate-fade-in-up"
                style={{ animationDelay: "0.2s" }}
              >
                Recommended Products
              </h1>
              <p
                className="text-xl text-gray-600 max-w-2xl mx-auto animate-fade-in-up"
                style={{ animationDelay: "0.4s" }}
              >
                Curated makeup products perfect for your style and skin tone, tested by beauty experts worldwide
              </p>
            </div>

            {/* Enhanced Search and Filters */}
            <div
              className="flex flex-col lg:flex-row gap-6 mb-12 animate-fade-in-up"
              style={{ animationDelay: "0.6s" }}
            >
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  placeholder="Search products, brands, or categories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 h-12 bg-white/80 backdrop-blur-sm border-0 shadow-lg focus:shadow-xl transition-all duration-300 text-gray-700 placeholder:text-gray-500"
                />
              </div>

              <div className="flex items-center gap-4">
                <Filter className="h-5 w-5 text-gray-600" />
                <select
                  value={priceFilter}
                  onChange={(e) => setPriceFilter(e.target.value)}
                  className="px-4 py-3 border-0 rounded-lg bg-white/80 backdrop-blur-sm shadow-lg text-gray-700 focus:shadow-xl transition-all duration-300"
                >
                  <option value="all">All Prices</option>
                  <option value="under25">Under $25</option>
                  <option value="25to50">$25 - $50</option>
                  <option value="over50">Over $50</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 pb-16">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Enhanced Category Sidebar */}
            <div className="lg:col-span-1">
              <Card className="border-0 shadow-xl sticky top-4 bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <Filter className="h-6 w-6 text-rose-600" />
                    Categories
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {categories.map((category, index) => {
                    const Icon = category.icon
                    return (
                      <Button
                        key={category.value}
                        variant={selectedCategory === category.value ? "default" : "ghost"}
                        className={`w-full justify-start text-left transition-all duration-300 transform hover:scale-105 animate-fade-in-right ${
                          selectedCategory === category.value
                            ? "bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 shadow-lg"
                            : "hover:bg-rose-50 hover:text-rose-700"
                        }`}
                        style={{ animationDelay: `${0.8 + index * 0.1}s` }}
                        onClick={() => setSelectedCategory(category.value)}
                      >
                        <Icon className="mr-3 h-5 w-5" />
                        {category.label}
                      </Button>
                    )
                  })}
                </CardContent>
              </Card>
            </div>

            {/* Enhanced Products Grid */}
            <div className="lg:col-span-3">
              {filteredProducts.length > 0 ? (
                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8">
                  {filteredProducts.slice(0, visibleProducts).map((product, index) => (
                    <Card
                      key={product.id}
                      className="group hover:shadow-2xl transition-all duration-500 border-0 shadow-lg overflow-hidden bg-white/90 backdrop-blur-sm transform hover:scale-105 animate-fade-in-up"
                      style={{ animationDelay: `${1 + index * 0.1}s` }}
                    >
                      <div className="relative overflow-hidden">
                        <Image
                          src={product.image || "/placeholder.svg"}
                          alt={product.name}
                          width={200}
                          height={200}
                          className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                        <div className="absolute top-3 right-3">
                          <Button
                            size="icon"
                            variant="secondary"
                            className="h-9 w-9 bg-white/90 backdrop-blur-sm hover:bg-white shadow-lg transition-all duration-300 transform hover:scale-110"
                            onClick={() => toggleFavorite(product.id)}
                          >
                            <Heart
                              className={`h-4 w-4 transition-colors duration-300 ${product.isFavorite ? "fill-rose-500 text-rose-500" : "text-gray-600"}`}
                            />
                          </Button>
                        </div>

                        <div className="absolute top-3 left-3 flex flex-col gap-2">
                          {product.isNew && (
                            <Badge className="bg-green-500 text-white shadow-lg">
                              <Zap className="h-3 w-3 mr-1" />
                              New
                            </Badge>
                          )}
                          {product.isBestseller && (
                            <Badge className="bg-orange-500 text-white shadow-lg">
                              <TrendingUp className="h-3 w-3 mr-1" />
                              Bestseller
                            </Badge>
                          )}
                          {product.discount && (
                            <Badge className="bg-red-500 text-white shadow-lg">-{product.discount}%</Badge>
                          )}
                        </div>

                        {product.rating >= 4.7 && (
                          <div className="absolute bottom-3 left-3">
                            <Badge
                              variant="secondary"
                              className="bg-yellow-100 text-yellow-800 border-yellow-200 shadow-lg"
                            >
                              <Award className="h-3 w-3 mr-1" />
                              Top Rated
                            </Badge>
                          </div>
                        )}
                      </div>

                      <CardContent className="p-6">
                        <div className="space-y-4">
                          <div>
                            <h3 className="font-bold text-lg text-gray-900 group-hover:text-rose-600 transition-colors duration-300">
                              {product.name}
                            </h3>
                            <p className="text-sm text-gray-600 font-medium">{product.brand}</p>
                          </div>

                          <div className="flex items-center gap-2">
                            <div className="flex">{renderStars(product.rating)}</div>
                            <span className="text-sm text-gray-600 font-medium">
                              {product.rating} ({product.reviews.toLocaleString()} reviews)
                            </span>
                          </div>

                          <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">{product.description}</p>

                          <div className="flex flex-wrap gap-2">
                            {product.shades.slice(0, 3).map((shade) => (
                              <Badge
                                key={shade}
                                variant="outline"
                                className="text-xs border-rose-200 text-rose-700 bg-rose-50 hover:bg-rose-100 transition-colors duration-300"
                              >
                                {shade}
                              </Badge>
                            ))}
                            {product.shades.length > 3 && (
                              <Badge variant="outline" className="text-xs border-gray-200 text-gray-600 bg-gray-50">
                                +{product.shades.length - 3} more
                              </Badge>
                            )}
                          </div>

                          <div className="flex items-center justify-between pt-2">
                            <div className="flex items-center gap-2">
                              <span className="text-2xl font-bold text-gray-900">{product.price}</span>
                              {product.originalPrice && (
                                <span className="text-lg text-gray-500 line-through">{product.originalPrice}</span>
                              )}
                            </div>
                          </div>

                          <div className="space-y-3">
                            <p className="text-xs font-semibold text-gray-700">Available at:</p>
                            <div className="flex gap-2">
                              {product.affiliate.amazon && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="flex-1 bg-transparent hover:bg-orange-50 hover:border-orange-300 transition-all duration-300"
                                  asChild
                                >
                                  <a href={product.affiliate.amazon} target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="mr-1 h-3 w-3" />
                                    Amazon
                                  </a>
                                </Button>
                              )}
                              {product.affiliate.sephora && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="flex-1 bg-transparent hover:bg-black hover:text-white transition-all duration-300"
                                  asChild
                                >
                                  <a href={product.affiliate.sephora} target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="mr-1 h-3 w-3" />
                                    Sephora
                                  </a>
                                </Button>
                              )}
                              {product.affiliate.ulta && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="flex-1 bg-transparent hover:bg-pink-50 hover:border-pink-300 transition-all duration-300"
                                  asChild
                                >
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
                <div className="text-center py-20 animate-fade-in-up">
                  <div className="relative mb-8">
                    <ShoppingBag className="h-24 w-24 text-gray-300 mx-auto animate-float" />
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-rose-500 rounded-full animate-ping"></div>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-600 mb-4">No products found</h3>
                  <p className="text-gray-500 mb-8 max-w-md mx-auto">
                    Try adjusting your search terms or filters to discover amazing products
                  </p>
                  <Button
                    onClick={() => {
                      setSearchTerm("")
                      setSelectedCategory("all")
                      setPriceFilter("all")
                    }}
                    className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  >
                    Clear All Filters
                  </Button>
                </div>
              )}

              {/* Load More Indicator */}
              {visibleProducts < filteredProducts.length && (
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
                    <span className="ml-2 text-sm">Scroll down to discover more products</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Enhanced Featured Brands Section */}
          <div className="mt-20">
            <Card className="border-0 shadow-xl bg-gradient-to-r from-rose-100 to-pink-100 overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-rose-200 to-pink-200 rounded-full -translate-y-20 translate-x-20 opacity-30"></div>
              <CardHeader className="relative text-center">
                <CardTitle className="text-3xl font-bold text-gray-900 mb-2">Featured Brands</CardTitle>
                <CardDescription className="text-lg text-gray-600">
                  Trusted by makeup artists and beauty enthusiasts worldwide
                </CardDescription>
              </CardHeader>
              <CardContent className="relative">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center">
                  {["Beauty Pro", "Glamour Co", "Luxe Lips", "Glow Beauty"].map((brand, index) => (
                    <div
                      key={brand}
                      className="text-center group animate-fade-in-up"
                      style={{ animationDelay: `${2 + index * 0.1}s` }}
                    >
                      <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-110">
                        <span className="text-2xl font-bold text-gray-600">{brand.charAt(0)}</span>
                      </div>
                      <p className="text-sm font-semibold text-gray-700 group-hover:text-rose-600 transition-colors duration-300">
                        {brand}
                      </p>
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
