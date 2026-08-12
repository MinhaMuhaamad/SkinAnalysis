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
              : "text-gray-300 dark:text-gray-600"
        }`}
      />
    ))
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-primary flex items-center justify-center">
        <div className="text-center space-y-8">
          <div className="relative">
            <div className="w-24 h-24 border-4 border-pink-200 dark:border-pink-800 border-t-pink-600 rounded-full animate-spin mx-auto"></div>
            <div
              className="absolute inset-0 w-24 h-24 border-4 border-transparent border-r-purple-400 rounded-full animate-spin mx-auto"
              style={{ animationDirection: "reverse", animationDuration: "1.5s" }}
            ></div>
          </div>
          <div className="space-y-4">
            <h3 className="text-3xl font-bold text-shimmer">Loading Products</h3>
            <p className="text-gray-600 dark:text-gray-400 text-lg">Curating the best makeup products for you...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-primary">
      {/* Enhanced Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-accent opacity-10 animate-gradient-shift"></div>
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-pink-500/20 rounded-full blur-3xl animate-float"></div>
          <div className="absolute top-40 right-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-float delay-300"></div>
          <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-float delay-700"></div>
        </div>

        <div className="container-premium py-20 relative z-10">
          <div className="text-center mb-16 animate-fade-in-up">
            <div className="inline-flex items-center gap-2 glass-morphism px-6 py-3 rounded-full mb-8 shadow-xl">
              <Award className="h-5 w-5 text-pink-500" />
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Curated by Professionals</span>
            </div>
            <h1 className="text-6xl md:text-7xl font-bold text-shimmer mb-8 animate-fade-in-up delay-200">
              Recommended Products
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed animate-fade-in-up delay-400">
              Curated makeup products perfect for your style and skin tone, tested by beauty experts worldwide
            </p>
          </div>

          {/* Enhanced Search and Filters */}
          <div className="flex flex-col lg:flex-row gap-6 mb-16 animate-fade-in-up delay-600">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-6 w-6" />
              <Input
                placeholder="Search products, brands, or categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-14 h-14 glass-morphism border-0 shadow-xl focus:shadow-2xl transition-all duration-300 text-gray-700 dark:text-gray-300 placeholder:text-gray-500 dark:placeholder:text-gray-400 text-lg"
              />
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-accent rounded-xl flex items-center justify-center shadow-lg">
                <Filter className="h-6 w-6 text-white" />
              </div>
              <select
                value={priceFilter}
                onChange={(e) => setPriceFilter(e.target.value)}
                className="px-6 py-4 border-0 rounded-xl glass-morphism shadow-xl text-gray-700 dark:text-gray-300 focus:shadow-2xl transition-all duration-300 text-lg"
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

      {/* Main Content */}
      <div className="container-premium pb-20">
        <div className="grid lg:grid-cols-4 gap-12">
          {/* Enhanced Category Sidebar */}
          <div className="lg:col-span-1">
            <Card className="card-premium sticky top-8">
              <CardHeader className="pb-6">
                <CardTitle className="flex items-center gap-4 text-2xl font-bold text-gray-900 dark:text-white">
                  <div className="w-10 h-10 bg-gradient-accent rounded-lg flex items-center justify-center">
                    <Filter className="h-5 w-5 text-white" />
                  </div>
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
                      className={`w-full justify-start text-left transition-all duration-300 transform hover:scale-105 animate-fade-in-right h-14 text-lg ${
                        selectedCategory === category.value
                          ? "btn-premium text-white shadow-xl"
                          : "hover:bg-pink-50 dark:hover:bg-pink-900/20 hover:text-pink-700 dark:hover:text-pink-300 text-gray-700 dark:text-gray-300"
                      }`}
                      style={{ animationDelay: `${0.8 + index * 0.1}s` }}
                      onClick={() => setSelectedCategory(category.value)}
                    >
                      <Icon className="mr-4 h-6 w-6" />
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
                    className="group card-premium overflow-hidden animate-fade-in-up"
                    style={{ animationDelay: `${1 + index * 0.1}s` }}
                  >
                    <div className="relative overflow-hidden">
                      <Image
                        src={product.image || "/placeholder.svg"}
                        alt={product.name}
                        width={200}
                        height={200}
                        className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                      <div className="absolute top-4 right-4">
                        <Button
                          size="icon"
                          className="h-12 w-12 glass-morphism hover:bg-white/20 shadow-xl transition-all duration-300 transform hover:scale-110 border-0"
                          onClick={() => toggleFavorite(product.id)}
                        >
                          <Heart
                            className={`h-5 w-5 transition-colors duration-300 ${product.isFavorite ? "fill-pink-500 text-pink-500" : "text-gray-600 dark:text-gray-400"}`}
                          />
                        </Button>
                      </div>

                      <div className="absolute top-4 left-4 flex flex-col gap-2">
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
                        <div className="absolute bottom-4 left-4">
                          <Badge className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 border-yellow-200 dark:border-yellow-700 shadow-lg">
                            <Award className="h-3 w-3 mr-1" />
                            Top Rated
                          </Badge>
                        </div>
                      )}
                    </div>

                    <CardContent className="p-8">
                      <div className="space-y-6">
                        <div>
                          <h3 className="font-bold text-xl text-gray-900 dark:text-white group-hover:text-gradient transition-colors duration-300 mb-2">
                            {product.name}
                          </h3>
                          <p className="text-gray-600 dark:text-gray-400 font-medium">{product.brand}</p>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="flex">{renderStars(product.rating)}</div>
                          <span className="text-gray-600 dark:text-gray-400 font-medium">
                            {product.rating} ({product.reviews.toLocaleString()} reviews)
                          </span>
                        </div>

                        <p className="text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed">
                          {product.description}
                        </p>

                        <div className="flex flex-wrap gap-2">
                          {product.shades.slice(0, 3).map((shade) => (
                            <Badge
                              key={shade}
                              variant="outline"
                              className="text-xs border-pink-200 dark:border-pink-800 text-pink-700 dark:text-pink-300 bg-pink-50 dark:bg-pink-900/20 hover:bg-pink-100 dark:hover:bg-pink-900/40 transition-colors duration-300"
                            >
                              {shade}
                            </Badge>
                          ))}
                          {product.shades.length > 3 && (
                            <Badge
                              variant="outline"
                              className="text-xs border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800"
                            >
                              +{product.shades.length - 3} more
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center justify-between pt-2">
                          <div className="flex items-center gap-3">
                            <span className="text-3xl font-bold text-gray-900 dark:text-white">{product.price}</span>
                            {product.originalPrice && (
                              <span className="text-xl text-gray-500 dark:text-gray-400 line-through">
                                {product.originalPrice}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="space-y-4">
                          <p className="text-sm font-bold text-gray-700 dark:text-gray-300">Available at:</p>
                          <div className="flex gap-2">
                            {product.affiliate.amazon && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="flex-1 glass-morphism hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:border-orange-300 dark:hover:border-orange-700 transition-all duration-300 border-gray-200 dark:border-gray-700 bg-transparent"
                                asChild
                              >
                                <a href={product.affiliate.amazon} target="_blank" rel="noopener noreferrer">
                                  <ExternalLink className="mr-2 h-4 w-4" />
                                  Amazon
                                </a>
                              </Button>
                            )}
                            {product.affiliate.sephora && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="flex-1 glass-morphism hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all duration-300 border-gray-200 dark:border-gray-700 bg-transparent"
                                asChild
                              >
                                <a href={product.affiliate.sephora} target="_blank" rel="noopener noreferrer">
                                  <ExternalLink className="mr-2 h-4 w-4" />
                                  Sephora
                                </a>
                              </Button>
                            )}
                            {product.affiliate.ulta && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="flex-1 glass-morphism hover:bg-pink-50 dark:hover:bg-pink-900/20 hover:border-pink-300 dark:hover:border-pink-700 transition-all duration-300 border-gray-200 dark:border-gray-700 bg-transparent"
                                asChild
                              >
                                <a href={product.affiliate.ulta} target="_blank" rel="noopener noreferrer">
                                  <ExternalLink className="mr-2 h-4 w-4" />
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
                <div className="relative mb-12">
                  <div className="w-32 h-32 bg-gradient-accent rounded-full flex items-center justify-center mx-auto animate-float shadow-2xl">
                    <ShoppingBag className="h-16 w-16 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-pink-500 rounded-full animate-ping"></div>
                </div>
                <h3 className="text-3xl font-bold text-gray-600 dark:text-gray-400 mb-6">No products found</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-12 max-w-md mx-auto text-lg">
                  Try adjusting your search terms or filters to discover amazing products
                </p>
                <Button
                  onClick={() => {
                    setSearchTerm("")
                    setSelectedCategory("all")
                    setPriceFilter("all")
                  }}
                  className="btn-premium text-white shadow-xl hover:shadow-2xl text-lg px-8 py-4"
                >
                  Clear All Filters
                </Button>
              </div>
            )}

            {/* Load More Indicator */}
            {visibleProducts < filteredProducts.length && (
              <div className="text-center mt-16 animate-fade-in-up">
                <div className="inline-flex items-center gap-3 text-gray-600 dark:text-gray-400">
                  <div className="w-3 h-3 bg-pink-400 rounded-full animate-bounce"></div>
                  <div className="w-3 h-3 bg-purple-400 rounded-full animate-bounce delay-100"></div>
                  <div className="w-3 h-3 bg-blue-400 rounded-full animate-bounce delay-200"></div>
                  <span className="ml-3 text-lg">Scroll down to discover more products</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Enhanced Featured Brands Section */}
        <div className="mt-24">
          <Card className="card-premium bg-gradient-secondary overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-accent opacity-20 rounded-full -translate-y-24 translate-x-24"></div>
            <CardHeader className="relative text-center pb-8">
              <CardTitle className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Featured Brands</CardTitle>
              <CardDescription className="text-xl text-gray-600 dark:text-gray-400">
                Trusted by makeup artists and beauty enthusiasts worldwide
              </CardDescription>
            </CardHeader>
            <CardContent className="relative">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-12 items-center">
                {["Beauty Pro", "Glamour Co", "Luxe Lips", "Glow Beauty"].map((brand, index) => (
                  <div
                    key={brand}
                    className="text-center group animate-fade-in-up"
                    style={{ animationDelay: `${2 + index * 0.1}s` }}
                  >
                    <div className="w-24 h-24 glass-morphism rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl group-hover:shadow-2xl transition-all duration-300 transform group-hover:scale-110">
                      <span className="text-3xl font-bold bg-gradient-accent bg-clip-text text-transparent">
                        {brand.charAt(0)}
                      </span>
                    </div>
                    <p className="font-bold text-gray-700 dark:text-gray-300 group-hover:text-gradient transition-colors duration-300">
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
  )
}
