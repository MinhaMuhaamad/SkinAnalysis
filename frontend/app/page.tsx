import { Navbar } from "@/components/navbar"
import HeroSection from "@/components/hero-section"
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
  Star,
  ArrowRight,
  Sparkles,
  Award,
  Users,
  TrendingUp,
  Shield,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <HeroSection />

      {/* Enhanced Features Section */}
      <section className="py-24 relative">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <Badge
              variant="secondary"
              className="glass-professional border-pink-400/30 text-pink-600 dark:text-pink-400 mb-6 text-base px-6 py-2"
            >
              Revolutionary Features
            </Badge>
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              <span className="text-gradient-primary">Everything You Need</span>
            </h2>
            <p className="text-lg text-foreground/80 max-w-3xl mx-auto leading-relaxed">
              Our AI-powered platform combines cutting-edge technology with beauty expertise to deliver personalized
              experiences that transform how you approach makeup.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Camera,
                title: "AI Skin Analysis",
                description:
                  "Advanced computer vision analyzes your unique skin characteristics to provide personalized recommendations.",
                gradient: "from-cyan-500 to-blue-500",
              },
              {
                icon: Palette,
                title: "Virtual Try-On",
                description:
                  "See how different makeup looks appear on your face in real-time using augmented reality technology.",
                gradient: "from-purple-500 to-pink-500",
              },
              {
                icon: BookOpen,
                title: "Expert Tutorials",
                description:
                  "Step-by-step video tutorials created by professional makeup artists, tailored to your skill level.",
                gradient: "from-pink-500 to-rose-500",
              },
              {
                icon: ShoppingBag,
                title: "Smart Shopping",
                description:
                  "Curated product recommendations with direct links to trusted retailers and exclusive discounts.",
                gradient: "from-green-500 to-emerald-500",
              },
              {
                icon: Heart,
                title: "Mood-Based Looks",
                description:
                  "Express your personality with looks that match your mood, occasion, and personal style preferences.",
                gradient: "from-orange-500 to-red-500",
              },
              {
                icon: Globe,
                title: "Cultural Trends",
                description:
                  "Explore beauty trends from around the world and discover looks inspired by different cultures.",
                gradient: "from-indigo-500 to-purple-500",
              },
            ].map((feature, index) => (
              <Card key={index} className="glass-professional group hover:scale-105 transition-all duration-300">
                <CardHeader className="pb-3">
                  <div
                    className={`w-12 h-12 bg-gradient-to-br ${feature.gradient} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}
                  >
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-xl font-bold group-hover:text-pink-500 transition-colors">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-foreground/70 leading-relaxed text-sm">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Stats Section */}
      <section className="py-16 relative">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { icon: Users, label: "Active Users", value: "500K+", color: "text-blue-500" },
              { icon: Award, label: "Awards Won", value: "25+", color: "text-yellow-500" },
              { icon: TrendingUp, label: "Success Rate", value: "98%", color: "text-green-500" },
              { icon: Shield, label: "Data Security", value: "100%", color: "text-purple-500" },
            ].map((stat, index) => (
              <Card key={index} className="glass-professional text-center hover:scale-105 transition-all duration-300">
                <CardContent className="p-6">
                  <stat.icon className={`h-10 w-10 ${stat.color} mx-auto mb-3`} />
                  <div className="text-3xl font-bold text-gradient-primary mb-1">{stat.value}</div>
                  <div className="text-muted-foreground font-medium text-sm">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Testimonials Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6">
              <span className="text-gradient-primary">Loved by Beauty Enthusiasts</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: "Sarah Johnson",
                role: "Beauty Influencer",
                content:
                  "This app completely transformed my makeup routine. The AI recommendations are incredibly accurate!",
                rating: 5,
                image: "/placeholder.svg?height=60&width=60&text=SJ",
              },
              {
                name: "Maria Garcia",
                role: "Professional MUA",
                content:
                  "As a makeup artist, I recommend this to all my clients. The virtual try-on technology is revolutionary.",
                rating: 5,
                image: "/placeholder.svg?height=60&width=60&text=MG",
              },
              {
                name: "Emily Chen",
                role: "Beauty Blogger",
                content: "The personalized tutorials helped me master techniques I never thought I could achieve!",
                rating: 5,
                image: "/placeholder.svg?height=60&width=60&text=EC",
              },
            ].map((testimonial, index) => (
              <Card key={index} className="glass-professional hover:scale-105 transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center mb-3">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-foreground/80 mb-4 leading-relaxed">"{testimonial.content}"</p>
                  <div className="flex items-center">
                    <Image
                      src={testimonial.image || "/placeholder.svg"}
                      alt={testimonial.name}
                      width={40}
                      height={40}
                      className="rounded-full mr-3"
                    />
                    <div>
                      <p className="font-semibold">{testimonial.name}</p>
                      <p className="text-muted-foreground text-sm">{testimonial.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 opacity-90"></div>
        <div className="absolute inset-0 bg-black/20"></div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
              Ready to Discover Your
              <br />
              <span className="text-yellow-300">Perfect Look?</span>
            </h2>
            <p className="text-lg text-white/90 mb-8 leading-relaxed">
              Join thousands of beauty enthusiasts who have transformed their makeup routine with our AI-powered
              platform. Start your personalized beauty journey today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/signup">
                <Button
                  size="lg"
                  className="bg-white text-purple-600 hover:bg-gray-100 px-10 py-3 text-lg font-bold shadow-2xl hover:shadow-white/25 transition-all duration-300 transform hover:scale-105 group"
                >
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                </Button>
              </Link>
              <Link href="/skin-analysis">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-white text-white hover:bg-white hover:text-purple-600 px-10 py-3 text-lg font-bold backdrop-blur-sm transition-all duration-300 transform hover:scale-105 bg-transparent group"
                >
                  Try AI Analysis
                  <Sparkles className="ml-2 h-5 w-5 group-hover:rotate-12 transition-transform duration-300" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
