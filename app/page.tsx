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
  Award,
  Users,
  TrendingUp,
  Shield,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Enhanced Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated Background Grid */}
        <div className="animated-grid"></div>
        <div className="animated-grid-dots"></div>

        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-pink-400/20 to-purple-400/20 rounded-full blur-xl animate-float"></div>
          <div className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-full blur-xl animate-float delay-1000"></div>
          <div className="absolute bottom-32 left-1/4 w-40 h-40 bg-gradient-to-br from-green-400/20 to-emerald-400/20 rounded-full blur-xl animate-float delay-2000"></div>
          <div className="absolute bottom-20 right-1/3 w-28 h-28 bg-gradient-to-br from-yellow-400/20 to-orange-400/20 rounded-full blur-xl animate-float delay-3000"></div>
          <div className="absolute top-1/2 left-1/2 w-36 h-36 bg-gradient-to-br from-purple-400/15 to-indigo-400/15 rounded-full blur-xl animate-float delay-4000"></div>
        </div>

        <div className="container-premium z-10 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 text-center lg:text-left">
              <div className="space-y-4">
                <Badge
                  variant="secondary"
                  className="glass-morphism border-pink-400/30 text-pink-600 dark:text-pink-400 hover:bg-pink-500/20 text-base px-5 py-2 animate-fade-in-up"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  AI-Powered Beauty Revolution
                </Badge>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold font-poppins leading-tight animate-fade-in-up delay-200">
                  <span className="text-shimmer block mb-2">Transform</span>
                  <span className="text-gradient block">Your Beauty</span>
                </h1>

                <p className="text-lg lg:text-xl text-foreground/80 leading-relaxed max-w-2xl animate-fade-in-up delay-400">
                  Experience the future of makeup with AI-powered virtual try-ons, personalized recommendations, and
                  professional tutorials that adapt to your unique style.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-fade-in-up delay-600">
                <Link href="/skin-analysis">
                  <Button
                    size="lg"
                    className="btn-premium px-8 py-3 text-base font-semibold shadow-2xl hover:shadow-pink-500/25 group"
                  >
                    <Wand2 className="mr-2 h-5 w-5 group-hover:rotate-12 transition-transform duration-300" />
                    Start AI Analysis
                  </Button>
                </Link>
                <Link href="/virtual-tryOn">
                  <Button
                    variant="outline"
                    size="lg"
                    className="glass-morphism border-2 border-pink-400/50 text-pink-600 dark:text-pink-400 hover:bg-pink-500/20 hover:border-pink-400 px-8 py-3 text-base font-semibold group bg-transparent"
                  >
                    <Play className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
                    Virtual Try-On
                  </Button>
                </Link>
              </div>

              <div className="flex items-center justify-center lg:justify-start gap-8 pt-6 animate-fade-in-up delay-800">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gradient font-poppins">100K+</div>
                  <div className="text-xs text-muted-foreground font-medium">Beauty Enthusiasts</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gradient font-poppins">2M+</div>
                  <div className="text-xs text-muted-foreground font-medium">Looks Created</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gradient font-poppins">99.9%</div>
                  <div className="text-xs text-muted-foreground font-medium">Satisfaction Rate</div>
                </div>
              </div>
            </div>

            <div className="relative lg:block hidden animate-fade-in-right delay-1000">
              <div className="relative z-10">
                <div className="relative">
                  <Image
                    src="/woman-8277925_1280.jpg"
                    alt="AI Makeup Analysis"
                    width={450}
                    height={600}
                    priority // Add priority since it's a hero image
                    className="rounded-3xl shadow-2xl border border-white/20 dark:border-white/10"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-purple-900/20 via-transparent to-pink-900/20 rounded-3xl"></div>
                </div>
              </div>
               {/* Floating UI Elements */}
              <div className="absolute -top-4 -right-4 glass-morphism p-3 rounded-2xl shadow-2xl border border-pink-400/20 animate-float">
                <Eye className="h-6 w-6 text-pink-500" />
              </div>
              <div className="absolute -bottom-4 -left-4 glass-morphism p-3 rounded-2xl shadow-2xl border border-purple-400/20 animate-float delay-1000">
                <Smile className="h-6 w-6 text-purple-500" />
              </div>
              <div className="absolute top-1/2 -right-6 glass-morphism p-2 rounded-xl shadow-xl border border-green-400/20 animate-float delay-2000">
                <Sparkles className="h-5 w-5 text-green-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-float">
          <div className="w-6 h-10 border-2 border-pink-400/50 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-gradient-accent rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* Enhanced Features Section */}
      <section className="py-24 relative">
        <div className="container-premium relative z-10">
          <div className="text-center mb-16">
            <Badge
              variant="secondary"
              className="glass-morphism border-pink-400/30 text-pink-600 dark:text-pink-400 mb-6 text-base px-5 py-2 animate-fade-in-up"
            >
              Revolutionary Features
            </Badge>
            <h2 className="text-4xl lg:text-5xl font-bold font-poppins mb-6 animate-fade-in-up delay-200">
              <span className="text-shimmer">Everything You Need</span>
            </h2>
            <p className="text-lg text-foreground/80 max-w-3xl mx-auto leading-relaxed animate-fade-in-up delay-400">
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
                delay: "0",
              },
              {
                icon: Palette,
                title: "Virtual Try-On",
                description:
                  "See how different makeup looks appear on your face in real-time using augmented reality technology.",
                gradient: "from-purple-500 to-pink-500",
                delay: "200",
              },
              {
                icon: BookOpen,
                title: "Expert Tutorials",
                description:
                  "Step-by-step video tutorials created by professional makeup artists, tailored to your skill level.",
                gradient: "from-pink-500 to-rose-500",
                delay: "400",
              },
              {
                icon: ShoppingBag,
                title: "Smart Shopping",
                description:
                  "Curated product recommendations with direct links to trusted retailers and exclusive discounts.",
                gradient: "from-green-500 to-emerald-500",
                delay: "600",
              },
              {
                icon: Heart,
                title: "Mood-Based Looks",
                description:
                  "Express your personality with looks that match your mood, occasion, and personal style preferences.",
                gradient: "from-orange-500 to-red-500",
                delay: "800",
              },
              {
                icon: Globe,
                title: "Cultural Trends",
                description:
                  "Explore beauty trends from around the world and discover looks inspired by different cultures.",
                gradient: "from-indigo-500 to-purple-500",
                delay: "1000",
              },
            ].map((feature, index) => (
              <Card key={index} className={`card-premium group animate-fade-in-up delay-${feature.delay}`}>
                <CardHeader className="pb-3">
                  <div
                    className={`w-12 h-12 bg-gradient-to-br ${feature.gradient} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg animate-pulse-glow`}
                  >
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-xl font-bold font-poppins group-hover:text-pink-500 transition-colors">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-foreground/70 text-sm leading-relaxed">
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
        <div className="container-premium">
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { icon: Users, label: "Active Users", value: "500K+", color: "text-blue-500" },
              { icon: Award, label: "Awards Won", value: "25+", color: "text-yellow-500" },
              { icon: TrendingUp, label: "Success Rate", value: "98%", color: "text-green-500" },
              { icon: Shield, label: "Data Security", value: "100%", color: "text-purple-500" },
            ].map((stat, index) => (
              <Card key={index} className={`card-premium text-center animate-fade-in-up delay-${index * 100}`}>
                <CardContent className="p-6">
                  <stat.icon className={`h-10 w-10 ${stat.color} mx-auto mb-3`} />
                  <div className="text-3xl font-bold font-poppins text-gradient mb-1">{stat.value}</div>
                  <div className="text-xs text-muted-foreground font-medium">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Testimonials Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="container-premium relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold font-poppins mb-6 animate-fade-in-up">
              <span className="text-shimmer">Loved by Beauty Enthusiasts</span>
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
                image: "/placeholder.svg?height=60&width=60",
                gradient: "from-cyan-500/10 to-blue-500/10",
                border: "border-cyan-400/20",
              },
              {
                name: "Maria Garcia",
                role: "Professional MUA",
                content:
                  "As a makeup artist, I recommend this to all my clients. The virtual try-on technology is revolutionary.",
                rating: 5,
                image: "/placeholder.svg?height=60&width=60",
                gradient: "from-purple-500/10 to-pink-500/10",
                border: "border-purple-400/20",
              },
              {
                name: "Emily Chen",
                role: "Beauty Blogger",
                content: "The personalized tutorials helped me master techniques I never thought I could achieve!",
                rating: 5,
                image: "/placeholder.svg?height=60&width=60",
                gradient: "from-green-500/10 to-emerald-500/10",
                border: "border-green-400/20",
              },
            ].map((testimonial, index) => (
              <Card key={index} className={`card-premium animate-fade-in-up delay-${index * 200}`}>
                <CardContent className="p-6">
                  <div className="flex items-center mb-3">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-foreground/80 text-sm mb-4 leading-relaxed">"{testimonial.content}"</p>
                  <div className="flex items-center">
                    <Image
                      src={testimonial.image || "/placeholder.svg"}
                      alt={testimonial.name}
                      width={40}
                      height={40}
                      className="rounded-full mr-3"
                    />
                    <div>
                      <p className="font-semibold font-poppins text-sm">{testimonial.name}</p>
                      <p className="text-muted-foreground text-xs">{testimonial.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced CTA Section */}
      <section className="py-20 relative">
        <div className="absolute inset-0 bg-gradient-accent opacity-90"></div>
        <div className="absolute inset-0 bg-black/20"></div>

        <div className="container-premium text-center relative z-10">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl lg:text-5xl font-bold font-poppins text-white mb-6 leading-tight animate-fade-in-up">
              Ready to Discover Your
              <br />
              <span className="text-yellow-300">Perfect Look?</span>
            </h2>
            <p className="text-lg text-white/90 mb-8 leading-relaxed animate-fade-in-up delay-200">
              Join thousands of beauty enthusiasts who have transformed their makeup routine with our AI-powered
              platform. Start your personalized beauty journey today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up delay-400">
              <Link href="/auth/signup">
                <Button
                  size="lg"
                  className="bg-white text-purple-600 hover:bg-gray-100 px-10 py-3 text-base font-bold shadow-2xl hover:shadow-white/25 transition-all duration-300 transform hover:scale-105 group"
                >
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                </Button>
              </Link>
              <Link href="/skin-analysis">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-white text-white hover:bg-white hover:text-purple-600 px-10 py-3 text-base font-bold backdrop-blur-sm transition-all duration-300 transform hover:scale-105 bg-transparent group"
                >
                  Try AI Analysis
                  <Sparkles className="ml-2 h-5 w-5 group-hover:rotate-12 transition-transform duration-300" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
