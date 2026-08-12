import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Palette, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Youtube, Heart } from "lucide-react"

export function Footer() {
  return (
    <footer className="relative mt-20">
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>

      <div className="relative glass-morphism border-t border-white/10">
        <div className="container-premium py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            {/* Brand Section */}
            <div className="space-y-6 animate-fade-in-up">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-accent rounded-xl flex items-center justify-center animate-pulse-glow">
                  <Palette className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold font-poppins text-gradient">MakeupAI</h3>
                  <p className="text-xs text-muted-foreground">Beauty Revolution</p>
                </div>
              </div>
              <p className="text-foreground/70 leading-relaxed">
                Transform your beauty journey with AI-powered makeup solutions. Discover your perfect look with
                personalized recommendations and virtual try-ons.
              </p>
              <div className="flex space-x-4">
                {[Facebook, Twitter, Instagram, Youtube].map((Icon, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    size="icon"
                    className="hover:bg-pink-500/20 hover:text-pink-500 transition-all duration-300 transform hover:scale-110"
                  >
                    <Icon className="h-5 w-5" />
                  </Button>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div className="space-y-6 animate-fade-in-up delay-200">
              <h4 className="text-lg font-semibold font-poppins text-gradient">Quick Links</h4>
              <nav className="space-y-3">
                {[
                  { name: "Skin Analysis", href: "/skin-analysis" },
                  { name: "Virtual Try-On", href: "/virtual-tryOn" },
                  { name: "Lookbook", href: "/lookbook" },
                  { name: "Occasions", href: "/occasions" },
                  { name: "Products", href: "/products" },
                ].map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    className="block text-foreground/70 hover:text-pink-500 transition-colors duration-300 hover:translate-x-1 transform"
                  >
                    {link.name}
                  </Link>
                ))}
              </nav>
            </div>

            {/* Support */}
            <div className="space-y-6 animate-fade-in-up delay-400">
              <h4 className="text-lg font-semibold font-poppins text-gradient">Support</h4>
              <nav className="space-y-3">
                {[
                  { name: "Help Center", href: "/help" },
                  { name: "Contact Us", href: "/contact" },
                  { name: "Privacy Policy", href: "/privacy" },
                  { name: "Terms of Service", href: "/terms" },
                  { name: "FAQ", href: "/faq" },
                ].map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    className="block text-foreground/70 hover:text-pink-500 transition-colors duration-300 hover:translate-x-1 transform"
                  >
                    {link.name}
                  </Link>
                ))}
              </nav>
            </div>

            {/* Newsletter */}
            <div className="space-y-6 animate-fade-in-up delay-600">
              <h4 className="text-lg font-semibold font-poppins text-gradient">Stay Updated</h4>
              <p className="text-foreground/70 text-sm">
                Get the latest beauty tips, product launches, and exclusive offers.
              </p>
              <div className="space-y-3">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  className="glass-morphism border-white/20 focus:border-pink-400 transition-all duration-300"
                />
                <Button className="w-full btn-premium group">
                  <Mail className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform duration-300" />
                  Subscribe
                </Button>
              </div>

              <div className="space-y-2 text-sm text-foreground/60">
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-pink-500" />
                  <span>+1 (555) 123-4567</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-pink-500" />
                  <span>hello@makeupaai.com</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-pink-500" />
                  <span>San Francisco, CA</span>
                </div>
              </div>
            </div>
          </div>

          <Separator className="my-12 bg-white/10" />

          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-2 text-foreground/60 text-sm">
              <span>© 2024 MakeupAI. Made with</span>
              <Heart className="h-4 w-4 text-pink-500 animate-pulse" />
              <span>for beauty enthusiasts worldwide.</span>
            </div>

            <div className="flex items-center space-x-6 text-sm text-foreground/60">
              <Link href="/privacy" className="hover:text-pink-500 transition-colors duration-300">
                Privacy
              </Link>
              <Link href="/terms" className="hover:text-pink-500 transition-colors duration-300">
                Terms
              </Link>
              <Link href="/cookies" className="hover:text-pink-500 transition-colors duration-300">
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
