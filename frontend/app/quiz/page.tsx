"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { ArrowRight, ArrowLeft, Sparkles, Palette } from "lucide-react"
import Link from "next/link"

interface QuizQuestion {
  id: number
  question: string
  options: { value: string; label: string; description?: string }[]
  category: "style" | "lifestyle" | "preferences" | "experience"
}

interface QuizResult {
  style: string
  description: string
  recommendations: string[]
  colors: string[]
  occasions: string[]
}

export default function QuizPage() {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [showResults, setShowResults] = useState(false)
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null)

  const questions: QuizQuestion[] = [
    {
      id: 0,
      question: "How would you describe your personal style?",
      category: "style",
      options: [
        { value: "classic", label: "Classic & Timeless", description: "Clean lines, neutral colors, elegant" },
        {
          value: "trendy",
          label: "Trendy & Fashion-Forward",
          description: "Latest trends, bold choices, experimental",
        },
        { value: "bohemian", label: "Bohemian & Free-Spirited", description: "Earthy, natural, artistic" },
        { value: "minimalist", label: "Minimalist & Simple", description: "Less is more, clean, understated" },
      ],
    },
    {
      id: 1,
      question: "What's your typical daily routine like?",
      category: "lifestyle",
      options: [
        { value: "busy", label: "Very Busy", description: "5-10 minutes for makeup max" },
        { value: "moderate", label: "Moderately Busy", description: "15-20 minutes for makeup" },
        { value: "flexible", label: "Flexible Schedule", description: "30+ minutes when desired" },
        { value: "leisurely", label: "Leisurely Pace", description: "Love taking time for self-care" },
      ],
    },
    {
      id: 2,
      question: "Which makeup look appeals to you most?",
      category: "preferences",
      options: [
        { value: "natural", label: "Natural & Fresh", description: "Enhance natural beauty" },
        { value: "glamorous", label: "Glamorous & Bold", description: "Statement eyes and lips" },
        { value: "romantic", label: "Romantic & Soft", description: "Soft pinks and roses" },
        { value: "edgy", label: "Edgy & Dramatic", description: "Dark, bold, unconventional" },
      ],
    },
    {
      id: 3,
      question: "How experienced are you with makeup?",
      category: "experience",
      options: [
        { value: "beginner", label: "Beginner", description: "Just starting out" },
        { value: "intermediate", label: "Intermediate", description: "Know the basics, want to improve" },
        { value: "advanced", label: "Advanced", description: "Confident with most techniques" },
        { value: "expert", label: "Expert", description: "Love experimenting with new looks" },
      ],
    },
    {
      id: 4,
      question: "What occasions do you most often dress up for?",
      category: "lifestyle",
      options: [
        { value: "work", label: "Work & Professional Events", description: "Office meetings, conferences" },
        { value: "social", label: "Social Gatherings", description: "Parties, dinners, dates" },
        { value: "special", label: "Special Occasions", description: "Weddings, celebrations" },
        { value: "everyday", label: "Everyday Life", description: "Daily activities, casual outings" },
      ],
    },
    {
      id: 5,
      question: "Which color palette draws you in?",
      category: "preferences",
      options: [
        { value: "warm", label: "Warm Tones", description: "Golds, oranges, warm browns" },
        { value: "cool", label: "Cool Tones", description: "Blues, purples, cool grays" },
        { value: "neutral", label: "Neutral Tones", description: "Beiges, taupes, soft browns" },
        { value: "bold", label: "Bold & Bright", description: "Vibrant colors, high contrast" },
      ],
    },
  ]

  const calculateResult = (): QuizResult => {
    const answerValues = Object.values(answers)

    // Simple algorithm to determine style based on answers
    const styleCount = {
      "Natural Beauty": 0,
      "Glamorous Diva": 0,
      "Romantic Dreamer": 0,
      "Bold Trendsetter": 0,
      "Classic Elegance": 0,
    }

    // Analyze answers to determine dominant style
    answerValues.forEach((answer) => {
      switch (answer) {
        case "natural":
        case "minimalist":
        case "everyday":
        case "neutral":
          styleCount["Natural Beauty"]++
          break
        case "glamorous":
        case "advanced":
        case "expert":
        case "bold":
          styleCount["Glamorous Diva"]++
          break
        case "romantic":
        case "bohemian":
        case "warm":
          styleCount["Romantic Dreamer"]++
          break
        case "trendy":
        case "edgy":
        case "social":
          styleCount["Bold Trendsetter"]++
          break
        case "classic":
        case "work":
        case "cool":
          styleCount["Classic Elegance"]++
          break
      }
    })

    const dominantStyle = Object.entries(styleCount).reduce((a, b) =>
      styleCount[a[0] as keyof typeof styleCount] > styleCount[b[0] as keyof typeof styleCount] ? a : b,
    )[0]

    const results = {
      "Natural Beauty": {
        description: "You love enhancing your natural features with minimal, fresh makeup that looks effortless.",
        recommendations: ["Tinted moisturizer", "Cream blush", "Mascara", "Lip tint", "Brow gel"],
        colors: ["Soft pinks", "Peachy tones", "Natural browns", "Clear glosses"],
        occasions: ["Everyday wear", "Casual outings", "Work meetings", "Brunch dates"],
      },
      "Glamorous Diva": {
        description:
          "You embrace bold, dramatic looks that make a statement and love experimenting with new techniques.",
        recommendations: [
          "Full coverage foundation",
          "Contouring kit",
          "Bold eyeshadow palette",
          "Liquid eyeliner",
          "Matte lipstick",
        ],
        colors: ["Deep reds", "Smoky grays", "Metallic golds", "Bold purples"],
        occasions: ["Night out", "Special events", "Parties", "Date nights"],
      },
      "Romantic Dreamer": {
        description: "You prefer soft, feminine looks with warm tones that create a dreamy, romantic aesthetic.",
        recommendations: ["Light foundation", "Rose gold eyeshadow", "Pink blush", "Nude lipstick", "Brown mascara"],
        colors: ["Rose gold", "Soft pinks", "Warm browns", "Coral tones"],
        occasions: ["Date nights", "Weddings", "Romantic dinners", "Garden parties"],
      },
      "Bold Trendsetter": {
        description: "You love staying ahead of trends and aren't afraid to experiment with bold, edgy looks.",
        recommendations: [
          "Color-correcting primer",
          "Bright eyeshadow palette",
          "Graphic eyeliner",
          "Bold lipstick",
          "Highlighter",
        ],
        colors: ["Electric blues", "Vibrant purples", "Neon pinks", "Metallic silvers"],
        occasions: ["Festivals", "Creative events", "Fashion shows", "Art galleries"],
      },
      "Classic Elegance": {
        description: "You appreciate timeless, sophisticated looks that are polished and professional.",
        recommendations: [
          "Medium coverage foundation",
          "Neutral eyeshadow palette",
          "Classic eyeliner",
          "Professional lipstick",
          "Setting powder",
        ],
        colors: ["Neutral browns", "Classic reds", "Soft grays", "Professional nudes"],
        occasions: ["Work events", "Business meetings", "Formal dinners", "Professional networking"],
      },
    }

    return {
      style: dominantStyle,
      ...results[dominantStyle as keyof typeof results],
    }
  }

  const handleAnswer = (value: string) => {
    setAnswers((prev) => ({ ...prev, [currentQuestion]: value }))
  }

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1)
    } else {
      const result = calculateResult()
      setQuizResult(result)
      setShowResults(true)
    }
  }

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1)
    }
  }

  const restartQuiz = () => {
    setCurrentQuestion(0)
    setAnswers({})
    setShowResults(false)
    setQuizResult(null)
  }

  const progress = ((currentQuestion + 1) / questions.length) * 100

  if (showResults && quizResult) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <Badge variant="secondary" className="bg-green-100 text-green-700 mb-4">
                Quiz Complete!
              </Badge>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent mb-4">
                Your Makeup Style: {quizResult.style}
              </h1>
              <p className="text-xl text-gray-600">{quizResult.description}</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="h-5 w-5 text-rose-600" />
                    Recommended Products
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {quizResult.recommendations.map((product, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 bg-rose-400 rounded-full mt-2 flex-shrink-0"></span>
                        <span className="text-gray-700">{product}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-pink-600" />
                    Perfect Color Palette
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {quizResult.colors.map((color, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded-full bg-gradient-to-r from-rose-300 to-pink-300"></div>
                        <span className="text-gray-700">{color}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="border-0 shadow-lg mb-8">
              <CardHeader>
                <CardTitle>Perfect Occasions for Your Style</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {quizResult.occasions.map((occasion, index) => (
                    <Badge key={index} variant="outline" className="border-rose-200 text-rose-700">
                      {occasion}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="text-center space-y-4">
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/skin-analysis">
                  <Button className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600">
                    <Sparkles className="mr-2 h-4 w-4" />
                    Create Your Look
                  </Button>
                </Link>
                <Link href="/occasions">
                  <Button variant="outline">Browse Occasion Looks</Button>
                </Link>
                <Button variant="outline" onClick={restartQuiz}>
                  Retake Quiz
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent mb-4">
              Makeup Style Quiz
            </h1>
            <p className="text-xl text-gray-600">Discover your perfect makeup style in just a few questions</p>
          </div>

          <Card className="border-0 shadow-lg mb-6">
            <CardHeader>
              <div className="flex justify-between items-center mb-4">
                <Badge variant="secondary" className="bg-rose-100 text-rose-700">
                  Question {currentQuestion + 1} of {questions.length}
                </Badge>
                <span className="text-sm text-gray-600">{Math.round(progress)}% Complete</span>
              </div>
              <Progress value={progress} className="w-full" />
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl text-gray-900">{questions[currentQuestion].question}</CardTitle>
              <CardDescription>Choose the option that best describes you</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <RadioGroup value={answers[currentQuestion] || ""} onValueChange={handleAnswer} className="space-y-4">
                {questions[currentQuestion].options.map((option) => (
                  <div
                    key={option.value}
                    className="flex items-start space-x-3 p-4 rounded-lg border hover:bg-rose-50 transition-colors"
                  >
                    <RadioGroupItem value={option.value} id={option.value} className="mt-1" />
                    <div className="flex-1">
                      <Label htmlFor={option.value} className="text-base font-medium text-gray-900 cursor-pointer">
                        {option.label}
                      </Label>
                      {option.description && <p className="text-sm text-gray-600 mt-1">{option.description}</p>}
                    </div>
                  </div>
                ))}
              </RadioGroup>

              <div className="flex justify-between pt-6">
                <Button variant="outline" onClick={prevQuestion} disabled={currentQuestion === 0}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Previous
                </Button>

                <Button
                  onClick={nextQuestion}
                  disabled={!answers[currentQuestion]}
                  className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600"
                >
                  {currentQuestion === questions.length - 1 ? "Get Results" : "Next"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
