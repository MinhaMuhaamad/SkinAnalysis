"use client";

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Camera,
  Palette,
  BookOpen,
  ShoppingBag,
  Globe,
  Heart,
  Play,
  Star,
  ArrowRight,
  Sparkles,
  Eye,
  Smile,
  Zap,
  Wand2,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useState, useEffect } from "react"
export default function HomePage() {
  const images = [
    { src: "/woman-8277925_1280.jpg", alt: "Before and After Makeup 2", points: ["Eyelash", "Blush", "Contour"] },
    { src: "/facial-recognition-collage-concept (1).jpg", alt: "Before and After Makeup 1", points: ["Hair Color", "Eyeshadow", "Lipstick"] },
    { src: "/woman-8277925_1280.jpg", alt: "Before and After Makeup 2", points: ["Eyelash", "Blush", "Contour"] },
    { src: "/facial-recognition-collage-concept.jpg", alt: "Before and After Makeup 3", points: ["Eyebrow", "Highlight", "Eyecolor"] },
    { src: "/woman-6654427_1280.jpg", alt: "Before and After Makeup 3", points: ["Eyebrow", "Highlight", "Eyecolor"] },
  ]
  const [currentImage, setCurrentImage] = useState(0)
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [images.length])

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Hero Section with Image Slideshow */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden mx-4 md:mx-12">

        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/60 via-black/70 to-cyan-900/60"></div>

        {/* Floating Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-cyan-400/20 to-blue-400/20 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-br from-pink-400/20 to-rose-400/20 rounded-full blur-xl animate-pulse delay-1000"></div>
          <div className="absolute bottom-32 left-1/4 w-40 h-40 bg-gradient-to-br from-green-400/20 to-emerald-400/20 rounded-full blur-xl animate-pulse delay-2000"></div>
          <div className="absolute bottom-20 right-1/3 w-28 h-28 bg-gradient-to-br from-yellow-400/20 to-orange-400/20 rounded-full blur-xl animate-pulse delay-3000"></div>
          <div className="absolute top-1/2 left-1/2 w-36 h-36 bg-gradient-to-br from-purple-400/15 to-indigo-400/15 rounded-full blur-xl animate-pulse delay-4000"></div>
        </div>

        <div className="container mx-auto px-4 z-10 relative">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8 text-center lg:text-left">
              <div className="space-y-6">
                <Badge
                  variant="secondary"
                  className="bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-cyan-500/20 border-purple-400/30 text-purple-200 hover:bg-purple-500/30 backdrop-blur-sm text-lg px-6 py-2"
                >
                  <Zap className="w-5 h-5 mr-2" />
                  AI-Powered Beauty Revolution
                </Badge>

                <h1 className="text-6xl lg:text-8xl font-bold leading-tight">
                  <span className="bg-gradient-to-r from-cyan-300 via-purple-300 via-pink-300 to-orange-300 bg-clip-text text-transparent animate-gradient-x">
                    Transform
                  </span>
                  <br />
                  <span className="bg-gradient-to-r from-green-300 via-blue-300 via-indigo-300 to-purple-300 bg-clip-text text-transparent animate-gradient-x">
                    Your Beauty
                  </span>
                </h1>

                <p className="text-xl lg:text-2xl text-gray-300 leading-relaxed max-w-2xl">
                  Experience the future of makeup with AI-powered virtual try-ons, personalized recommendations, and
                  professional tutorials that adapt to your unique style.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-6 justify-center lg:justify-start">
                <Link href="/skin-analysis">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 hover:from-purple-600 hover:via-pink-600 hover:to-cyan-600 text-white px-12 py-4 text-lg font-semibold shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 transform hover:scale-105"
                  >
                    <Wand2 className="mr-3 h-6 w-6" />
                    Start AI Analysis
                  </Button>
                </Link>
                <Link href="/virtual-tryOn">
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-2 border-cyan-400/50 text-cyan-200 hover:bg-cyan-500/20 hover:border-cyan-400 px-12 py-4 text-lg font-semibold backdrop-blur-sm transition-all duration-300 transform hover:scale-105 bg-transparent"
                  >
                    <Play className="mr-3 h-6 w-6" />
                    Virtual Try-On
                  </Button>
                </Link>
              </div>
              <div className="flex items-center justify-center lg:justify-start gap-12 pt-8">
                <div className="text-center">
                  <div className="text-3xl font-bold bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent">
                    100K+
                  </div>
                  <div className="text-sm text-gray-400 font-medium">Beauty Enthusiasts</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold bg-gradient-to-r from-pink-300 to-rose-300 bg-clip-text text-transparent">
                    2M+
                  </div>
                  <div className="text-sm text-gray-400 font-medium">Looks Created</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold bg-gradient-to-r from-green-300 to-emerald-300 bg-clip-text text-transparent">
                    99.9%
                  </div>
                  <div className="text-sm text-gray-400 font-medium">Satisfaction Rate</div>
                </div>
              </div>
            </div>

            <div className="relative lg:block hidden">
              <div className="relative z-10">
               <div className="relative h-[500px] md:h-[600px] lg:h-[650px] w-full max-w-[400px] lg:max-w-[500px] rounded-3xl overflow-hidden border border-purple-400/20 shadow-2xl">

                  {images.map((image, index) => (
                    <div
                      key={index}
                      className={`absolute inset-0 transition-opacity duration-1000 ${
                        index === currentImage ? "opacity-100" : "opacity-0"
                      }`}
                    >
                      <Image
                        src={image.src}
                        alt={image.alt}
                        width={500}
                        height={700}
                        className="object-cover w-full h-full"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-purple-900/20 via-transparent to-cyan-900/20"></div>
                      {index === currentImage && (
                        <div className="absolute bottom-4 left-4 right-4 flex justify-center space-x-4">
                          {image.points.map((point, i) => (
                            <div
                              key={i}
                              className="bg-white/10 text-white px-2 py-1 rounded-full text-sm animate-pulse"
                              style={{ animationDelay: `${i * 0.2}s` }}
                            >
                              {point}
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                        <button className="bg-white/20 rounded-full p-2 hover:bg-white/30 transition-colors">
                          <svg width="24" height="24" fill="white" viewBox="0 0 24 24">
                            <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
                            <path d="M10 8l6 4-6 4V8z" fill="currentColor" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Floating UI Elements */}
              <div className="absolute -top-6 -right-6 bg-gradient-to-br from-cyan-500 to-blue-500 p-4 rounded-2xl shadow-2xl backdrop-blur-sm border border-cyan-400/20 animate-bounce">
                <Eye className="h-8 w-8 text-white" />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-gradient-to-br from-pink-500 to-rose-500 p-4 rounded-2xl shadow-2xl backdrop-blur-sm border border-pink-400/20 animate-bounce delay-1000">
                <Smile className="h-8 w-8 text-white" />
              </div>
              <div className="absolute top-1/2 -right-8 bg-gradient-to-br from-green-500 to-emerald-500 p-3 rounded-xl shadow-xl backdrop-blur-sm border border-green-400/20 animate-bounce delay-2000">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-purple-400/50 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-gradient-to-b from-purple-400 to-cyan-400 rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-20">
            <Badge
              variant="secondary"
              className="bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-pink-500/20 border-cyan-400/30 text-cyan-200 mb-6 text-lg px-6 py-2"
            >
              Revolutionary Features
            </Badge>
            <h2 className="text-5xl lg:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-cyan-300 via-purple-300 to-pink-300 bg-clip-text text-transparent">
                Everything You Need
              </span>
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
              Our AI-powered platform combines cutting-edge technology with beauty expertise to deliver personalized
              experiences that transform how you approach makeup.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Camera,
                title: "AI Skin Analysis",
                description:
                  "Advanced computer vision analyzes your unique skin characteristics to provide personalized recommendations.",
                gradient: "from-cyan-500 to-blue-500",
                borderColor: "border-cyan-400/20",
                delay: "0",
              },
              {
                icon: Palette,
                title: "Virtual Try-On",
                description:
                  "See how different makeup looks appear on your face in real-time using augmented reality technology.",
                gradient: "from-purple-500 to-pink-500",
                borderColor: "border-purple-400/20",
                delay: "200",
              },
              {
                icon: BookOpen,
                title: "Expert Tutorials",
                description:
                  "Step-by-step video tutorials created by professional makeup artists, tailored to your skill level.",
                gradient: "from-pink-500 to-rose-500",
                borderColor: "border-pink-400/20",
                delay: "400",
              },
              {
                icon: ShoppingBag,
                title: "Smart Shopping",
                description:
                  "Curated product recommendations with direct links to trusted retailers and exclusive discounts.",
                gradient: "from-green-500 to-emerald-500",
                borderColor: "border-green-400/20",
                delay: "600",
              },
              {
                icon: Heart,
                title: "Mood-Based Looks",
                description:
                  "Express your personality with looks that match your mood, occasion, and personal style preferences.",
                gradient: "from-orange-500 to-red-500",
                borderColor: "border-orange-400/20",
                delay: "800",
              },
              {
                icon: Globe,
                title: "Cultural Trends",
                description:
                  "Explore beauty trends from around the world and discover looks inspired by different cultures.",
                gradient: "from-indigo-500 to-purple-500",
                borderColor: "border-indigo-400/20",
                delay: "1000",
              },
            ].map((feature, index) => (
              <Card
                key={index}
                className={`group bg-gradient-to-br from-gray-900/50 to-black/50 border ${feature.borderColor} hover:border-opacity-60 backdrop-blur-sm transition-all duration-500 hover:transform hover:scale-105 hover:shadow-2xl`}
                style={{ animationDelay: `${feature.delay}ms` }}
              >
                <CardHeader className="pb-4">
                  <div
                    className={`w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}
                  >
                    <feature.icon className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-2xl font-bold text-white group-hover:text-gray-100 transition-colors">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-400 text-base leading-relaxed group-hover:text-gray-300 transition-colors">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/placeholder.svg?height=800&width=1920"
            alt="Beauty Background"
            width={1920}
            height={800}
            className="w-full h-full object-cover opacity-10"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-purple-900/90 via-black/80 to-cyan-900/90"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-cyan-300 via-purple-300 to-pink-300 bg-clip-text text-transparent">
                Loved by Beauty Enthusiasts
              </span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Sarah Johnson",
                role: "Beauty Influencer",
                content:
                  "This app completely transformed my makeup routine. The AI recommendations are incredibly accurate!",
                rating: 5,
                image: "/placeholder.svg?height=80&width=80",
                gradient: "from-cyan-500/10 to-blue-500/10",
                border: "border-cyan-400/20",
              },
              {
                name: "Maria Garcia",
                role: "Professional MUA",
                content:
                  "As a makeup artist, I recommend this to all my clients. The virtual try-on technology is revolutionary.",
                rating: 5,
                image: "/placeholder.svg?height=80&width=80",
                gradient: "from-purple-500/10 to-pink-500/10",
                border: "border-purple-400/20",
              },
              {
                name: "Emily Chen",
                role: "Beauty Blogger",
                content: "The personalized tutorials helped me master techniques I never thought I could achieve!",
                rating: 5,
                image: "/placeholder.svg?height=80&width=80",
                gradient: "from-green-500/10 to-emerald-500/10",
                border: "border-green-400/20",
              },
            ].map((testimonial, index) => (
              <Card
                key={index}
                className={`bg-gradient-to-br ${testimonial.gradient} border ${testimonial.border} backdrop-blur-sm hover:border-opacity-60 transition-all duration-300`}
              >
                <CardContent className="p-8">
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-gray-200 text-lg mb-6 leading-relaxed">"{testimonial.content}"</p>
                  <div className="flex items-center">
                    <Image
                      src={testimonial.image || "/placeholder.svg"}
                      alt={testimonial.name}
                      width={50}
                      height={50}
                      className="rounded-full mr-4"
                    />
                    <div>
                      <p className="font-semibold text-white">{testimonial.name}</p>
                      <p className="text-gray-300 text-sm">{testimonial.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 via-cyan-600 to-blue-600"></div>
        <div className="absolute inset-0 bg-black/30"></div>

        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-5xl lg:text-6xl font-bold text-white mb-8 leading-tight">
              Ready to Discover Your
              <br />
              <span className="bg-gradient-to-r from-yellow-300 via-orange-300 to-red-300 bg-clip-text text-transparent">
                Perfect Look?
              </span>
            </h2>
            <p className="text-xl text-white/90 mb-12 leading-relaxed">
              Join thousands of beauty enthusiasts who have transformed their makeup routine with our AI-powered
              platform. Start your personalized beauty journey today.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link href="/auth/signup">
                <Button
                  size="lg"
                  className="bg-white text-purple-600 hover:bg-gray-100 px-12 py-4 text-lg font-bold shadow-2xl hover:shadow-white/25 transition-all duration-300 transform hover:scale-105"
                >
                  Get Started Free
                  <ArrowRight className="ml-3 h-6 w-6" />
                </Button>
              </Link>
              <Link href="/skin-analysis">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-white text-white hover:bg-white hover:text-purple-600 px-12 py-4 text-lg font-bold backdrop-blur-sm transition-all duration-300 transform hover:scale-105 bg-transparent"
                >
                  Try AI Analysis
                  <Sparkles className="ml-3 h-6 w-6" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}