"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Camera,
  Upload,
  Loader2,
  Sparkles,
  Eye,
  Palette,
  XCircle,
  CheckCircle,
  RefreshCw,
  Wifi,
  WifiOff,
  Brain,
  Target,
  Shield,
  Activity,
  Sun,
  Droplets,
  Heart,
  AlertCircle,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"

interface SkinAnalysisResult {
  success?: boolean
  skinTone: string
  undertone: string
  concerns: string[]
  recommendations: {
    foundations: string[]
    concealers: string[]
    lipsticks: string[]
    eyeshadows: string[]
    blushes: string[]
    skincare?: string[]
    techniques?: string[]
  }
  confidence: number
  faceQuality?: number
  method?: string
  timestamp?: number
  analysisId?: string
  processingTime?: number
  imageSize?: number
  complexity?: number
}

interface AnalysisError {
  error: string
  details: string
  message?: string
  code?: string
}

interface ApiStatus {
  status: string
  message: string
  version: string
  endpoints: {
    analyze: string
    health: string
  }
}

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"

export default function SkinAnalysisPage() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<SkinAnalysisResult | null>(null)
  const [analysisError, setAnalysisError] = useState<AnalysisError | null>(null)
  const [analysisProgress, setAnalysisProgress] = useState(0)
  const [apiStatus, setApiStatus] = useState<"checking" | "online" | "offline" | "error">("checking")
  const [apiInfo, setApiInfo] = useState<ApiStatus | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  // Check API status
  const checkApiStatus = async () => {
    try {
      setApiStatus("checking")
      console.log(`Checking API status at ${BACKEND_URL}...`)

      const response = await fetch(`${BACKEND_URL}/health`, {
        method: "GET",
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
        },
      })

      if (response.ok) {
        const data: ApiStatus = await response.json()
        setApiStatus("online")
        setApiInfo(data)
        console.log("API Status:", data)

        toast({
          title: "Python Backend Online! ✅",
          description: `FastAPI server is running at ${BACKEND_URL}`,
        })
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
    } catch (error: any) {
      console.error("API Status Check Failed:", error)
      setApiStatus("offline")
      toast({
        title: "Python Backend Offline",
        description: `Unable to connect to ${BACKEND_URL}. Make sure the FastAPI server is running.`,
        variant: "destructive",
      })
    }
  }

  useEffect(() => {
    checkApiStatus()
  }, [])

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select an image smaller than 10MB.",
          variant: "destructive",
        })
        return
      }

      if (!file.type.startsWith("image/")) {
        toast({
          title: "Invalid file type",
          description: "Please select a valid image file (JPG, PNG, etc.).",
          variant: "destructive",
        })
        return
      }

      // Store the file for upload
      setSelectedFile(file)

      // Create preview URL
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setSelectedImage(result)
        setAnalysisResult(null)
        setAnalysisError(null)

        // Auto-analyze after image upload if API is online
        if (apiStatus === "online") {
          setTimeout(() => {
            analyzeImage(file)
          }, 1000)
        }
      }
      reader.onerror = () => {
        toast({
          title: "File read error",
          description: "Failed to read the selected image file.",
          variant: "destructive",
        })
      }
      reader.readAsDataURL(file)
    }
  }

  const analyzeImage = async (fileToAnalyze?: File) => {
    const file = fileToAnalyze || selectedFile

    if (!file) {
      toast({
        title: "No image selected",
        description: "Please upload an image first.",
        variant: "destructive",
      })
      return
    }

    if (apiStatus !== "online") {
      toast({
        title: "Backend Server Unavailable",
        description: "Please wait for the Python backend to come online.",
        variant: "destructive",
      })
      return
    }

    setIsAnalyzing(true)
    setAnalysisProgress(0)
    setAnalysisError(null)

    const progressSteps = [
      { step: 15, message: "Uploading image to Python backend..." },
      { step: 35, message: "Processing image data..." },
      { step: 55, message: "Analyzing skin characteristics..." },
      { step: 75, message: "Detecting skin concerns..." },
      { step: 90, message: "Generating recommendations..." },
      { step: 100, message: "Finalizing results..." },
    ]

    let currentStep = 0
    const progressInterval = setInterval(() => {
      if (currentStep < progressSteps.length) {
        setAnalysisProgress(progressSteps[currentStep].step)
        currentStep++
      }
    }, 600)

    try {
      console.log("Starting skin analysis with Python backend...")

      // Create FormData for file upload
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch(`${BACKEND_URL}/analyze`, {
        method: "POST",
        body: formData,
        // Don't set Content-Type header - let browser set it with boundary
      })

      clearInterval(progressInterval)
      setAnalysisProgress(100)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: "Unknown error" }))
        throw new Error(errorData.detail || `HTTP ${response.status}`)
      }

      const result = await response.json()

      if (result.error || !result.success) {
        setAnalysisError({
          error: result.error || "Analysis Failed",
          details: result.details || result.message || "Unknown error occurred",
        })
        setIsAnalyzing(false)
        toast({
          title: "Analysis Failed",
          description: result.details || result.message || "Unable to analyze image",
          variant: "destructive",
        })
        return
      }

      setTimeout(() => {
        setAnalysisResult(result)
        setIsAnalyzing(false)

        toast({
          title: "Python Analysis Complete! ✨",
          description: `Analysis completed with ${result.confidence}% confidence using FastAPI backend`,
        })
      }, 600)
    } catch (error: any) {
      clearInterval(progressInterval)
      console.error("Analysis request error:", error)

      setAnalysisError({
        error: "Network Error",
        details: "Failed to connect to Python backend server",
        message: error.message,
      })

      setIsAnalyzing(false)
      toast({
        title: "Connection Error",
        description: `Unable to reach Python backend at ${BACKEND_URL}`,
        variant: "destructive",
      })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-rose-400/10 to-pink-400/10 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-br from-purple-400/10 to-rose-400/10 rounded-full blur-xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-32 left-1/4 w-40 h-40 bg-gradient-to-br from-pink-400/10 to-purple-400/10 rounded-full blur-xl animate-pulse delay-2000"></div>
      </div>

      <div className="container mx-auto px-4 py-12 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-4 mb-6 flex-wrap">
              <Badge
                variant="secondary"
                className="bg-gradient-to-r from-rose-500/20 to-pink-500/20 border-rose-400/30 text-rose-200"
              >
                <Brain className="w-4 h-4 mr-2" />
                Python FastAPI Backend
              </Badge>

              <Badge
                variant="secondary"
                className={`${
                  apiStatus === "online"
                    ? "bg-green-500/20 text-green-300 border-green-400/30"
                    : apiStatus === "offline"
                      ? "bg-red-500/20 text-red-300 border-red-400/30"
                      : "bg-yellow-500/20 text-yellow-300 border-yellow-400/30"
                }`}
              >
                {apiStatus === "online" ? (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    <Wifi className="w-3 h-3 mr-1" />
                    Backend Online
                  </>
                ) : apiStatus === "offline" ? (
                  <>
                    <XCircle className="w-4 h-4 mr-2" />
                    <WifiOff className="w-3 h-3 mr-1" />
                    Backend Offline
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Checking...
                  </>
                )}
              </Badge>

              <Badge variant="secondary" className="bg-purple-500/20 text-purple-300 border-purple-400/30">
                <Target className="w-4 h-4 mr-2" />
                File Upload Analysis
              </Badge>
            </div>

            <h1 className="text-5xl lg:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-rose-300 via-pink-200 to-purple-300 bg-clip-text text-transparent">
                Python AI Skin Analysis
              </span>
            </h1>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
              Professional-grade skin analysis using Python FastAPI backend with advanced image processing
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Image Upload Section */}
            <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-rose-400/20 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <div className="p-2 bg-gradient-to-br from-rose-500 to-pink-500 rounded-lg">
                    <Camera className="h-6 w-6 text-white" />
                  </div>
                  Upload Your Photo
                </CardTitle>
                <CardDescription className="text-gray-400 text-base">
                  Upload a clear, well-lit photo of your face for Python backend analysis (max 10MB)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="border-2 border-dashed border-rose-400/30 rounded-2xl p-12 text-center hover:border-rose-400/50 transition-colors bg-gradient-to-br from-rose-500/5 to-pink-500/5">
                  {selectedImage ? (
                    <div className="space-y-6">
                      <div className="relative">
                        <Image
                          src={selectedImage || "/placeholder.svg"}
                          alt="Selected photo"
                          width={300}
                          height={300}
                          className="mx-auto rounded-2xl object-cover shadow-2xl border border-rose-400/20"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-rose-900/20 to-transparent rounded-2xl"></div>
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        className="border-rose-400/50 text-rose-200 hover:bg-rose-500/20 hover:border-rose-400"
                        disabled={isAnalyzing}
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        Change Photo
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="w-20 h-20 bg-gradient-to-br from-rose-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                        <Camera className="h-10 w-10 text-white" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-white mb-3">Upload a photo</p>
                        <p className="text-gray-400 mb-6 text-lg">Select your image for Python backend analysis</p>
                        <Button
                          onClick={() => fileInputRef.current?.click()}
                          className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 px-8 py-3 text-lg font-semibold"
                          disabled={apiStatus !== "online"}
                        >
                          <Upload className="mr-2 h-5 w-5" />
                          Choose File
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />

                {selectedImage && !isAnalyzing && !analysisResult && !analysisError && (
                  <Button
                    onClick={() => analyzeImage()}
                    className="w-full bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 py-4 text-lg font-semibold shadow-lg hover:shadow-rose-500/25 transition-all duration-300"
                    size="lg"
                    disabled={apiStatus !== "online"}
                  >
                    <Sparkles className="mr-3 h-5 w-5" />
                    Analyze with Python Backend
                  </Button>
                )}

                {/* Backend Status */}
                {apiStatus === "offline" && (
                  <div className="p-4 bg-red-500/10 border border-red-400/20 rounded-xl">
                    <div className="flex items-center gap-3 mb-2">
                      <XCircle className="h-5 w-5 text-red-400" />
                      <span className="font-semibold text-red-300">Python Backend Offline</span>
                    </div>
                    <p className="text-sm text-gray-300 mb-3">The FastAPI server at {BACKEND_URL} is not responding.</p>
                    <div className="text-xs text-gray-400 mb-3 font-mono bg-gray-800/50 p-2 rounded">
                      Run: python backend/run.py
                    </div>
                    <Button
                      onClick={checkApiStatus}
                      variant="outline"
                      size="sm"
                      className="border-red-400/50 text-red-300 hover:bg-red-500/20 bg-transparent"
                    >
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Check Again
                    </Button>
                  </div>
                )}

                {isAnalyzing && (
                  <div className="space-y-4 p-6 bg-gradient-to-r from-rose-500/10 to-pink-500/10 rounded-xl border border-rose-400/20">
                    <div className="flex items-center justify-center gap-3 mb-4">
                      <Loader2 className="h-6 w-6 animate-spin text-rose-400" />
                      <span className="text-lg font-semibold text-rose-200">Running Python Analysis...</span>
                    </div>
                    <Progress value={analysisProgress} className="w-full h-3" />
                    <p className="text-center text-rose-200 font-medium">
                      Python backend is processing your image with advanced algorithms...
                    </p>
                  </div>
                )}

                {/* Backend Info */}
                {apiInfo && apiStatus === "online" && (
                  <div className="grid grid-cols-1 gap-3">
                    <div className="flex items-center gap-3 p-3 bg-green-500/10 border border-green-400/20 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-green-400" />
                      <span className="text-sm text-green-300 font-medium">
                        FastAPI {apiInfo.version} - Python Backend Ready
                      </span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-blue-500/10 border border-blue-400/20 rounded-lg">
                      <Activity className="h-5 w-5 text-blue-400" />
                      <span className="text-sm text-blue-300 font-medium">File upload processing enabled</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-purple-500/10 border border-purple-400/20 rounded-lg">
                      <Brain className="h-5 w-5 text-purple-400" />
                      <span className="text-sm text-purple-300 font-medium">Advanced image analysis algorithms</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Results Section */}
            <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-rose-400/20 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <div className="p-2 bg-gradient-to-br from-purple-500 to-rose-500 rounded-lg">
                    <Eye className="h-6 w-6 text-white" />
                  </div>
                  Python Analysis Results
                </CardTitle>
                <CardDescription className="text-gray-400 text-base">
                  Your personalized skin analysis from the Python backend
                </CardDescription>
              </CardHeader>
              <CardContent>
                {analysisError ? (
                  <div className="text-center py-16">
                    <div className="w-24 h-24 bg-gradient-to-br from-red-700 to-red-800 rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <XCircle className="h-12 w-12 text-red-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-red-400 mb-4">{analysisError.error}</h3>
                    <p className="text-gray-400 mb-6 max-w-md mx-auto">{analysisError.details}</p>

                    <div className="flex gap-3 justify-center">
                      <Button
                        onClick={() => analyzeImage()}
                        variant="outline"
                        className="border-red-400/50 text-red-300 hover:bg-red-500/20 bg-transparent"
                        disabled={!selectedFile || apiStatus !== "online"}
                      >
                        Try Again
                      </Button>
                      <Button
                        onClick={checkApiStatus}
                        variant="outline"
                        className="border-blue-400/50 text-blue-300 hover:bg-blue-500/20 bg-transparent"
                      >
                        Check Backend
                      </Button>
                    </div>
                  </div>
                ) : analysisResult ? (
                  <div className="space-y-6">
                    <Tabs defaultValue="analysis" className="w-full">
                      <TabsList className="grid w-full grid-cols-2 bg-gray-800/50 border border-rose-400/20">
                        <TabsTrigger
                          value="analysis"
                          className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-rose-500 data-[state=active]:to-pink-500"
                        >
                          Analysis
                        </TabsTrigger>
                        <TabsTrigger
                          value="recommendations"
                          className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-rose-500 data-[state=active]:to-pink-500"
                        >
                          Recommendations
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent value="analysis" className="space-y-6 mt-6">
                        <div className="space-y-6">
                          <div className="flex justify-between items-center p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-xl border border-green-400/20">
                            <span className="font-semibold text-lg">Python AI Confidence</span>
                            <Badge
                              variant="secondary"
                              className="bg-green-500/20 text-green-300 border-green-400/30 text-lg px-4 py-2"
                            >
                              {analysisResult.confidence}%
                            </Badge>
                          </div>

                          <div className="grid grid-cols-1 gap-6">
                            {[
                              { label: "Skin Tone", value: analysisResult.skinTone, icon: Sun },
                              { label: "Undertone", value: analysisResult.undertone, icon: Sparkles },
                            ].map((item, index) => (
                              <div
                                key={index}
                                className="p-4 bg-gradient-to-r from-gray-700/30 to-gray-800/30 rounded-xl border border-gray-600/30"
                              >
                                <div className="flex items-center gap-3 mb-2">
                                  <item.icon className="h-5 w-5 text-rose-400" />
                                  <h4 className="font-semibold text-white text-lg">{item.label}</h4>
                                </div>
                                <Badge
                                  variant="outline"
                                  className="border-rose-400/50 text-rose-300 text-base px-3 py-1"
                                >
                                  {item.value}
                                </Badge>
                              </div>
                            ))}
                          </div>

                          <div className="p-4 bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-xl border border-orange-400/20">
                            <h4 className="font-semibold text-white text-lg mb-3 flex items-center gap-2">
                              <AlertCircle className="h-5 w-5 text-orange-400" />
                              Detected Characteristics
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {analysisResult.concerns.map((concern, index) => (
                                <Badge
                                  key={index}
                                  variant="secondary"
                                  className="bg-orange-500/20 text-orange-300 border-orange-400/30"
                                >
                                  {concern}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          <div className="p-3 bg-blue-500/10 border border-blue-400/20 rounded-lg">
                            <p className="text-sm text-blue-300">
                              Analysis ID: <span className="font-mono">{analysisResult.analysisId}</span>
                              {analysisResult.imageSize && (
                                <span className="ml-2 text-gray-400">
                                  • Size: {(analysisResult.imageSize / 1024).toFixed(1)}KB
                                </span>
                              )}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">Method: {analysisResult.method}</p>
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="recommendations" className="space-y-6 mt-6">
                        <div className="space-y-6">
                          {[
                            {
                              title: "Foundation Recommendations",
                              items: analysisResult.recommendations.foundations,
                              icon: Droplets,
                            },
                            {
                              title: "Concealer Recommendations",
                              items: analysisResult.recommendations.concealers,
                              icon: Eye,
                            },
                            {
                              title: "Lipstick Recommendations",
                              items: analysisResult.recommendations.lipsticks,
                              icon: Heart,
                            },
                            {
                              title: "Eyeshadow Recommendations",
                              items: analysisResult.recommendations.eyeshadows,
                              icon: Sparkles,
                            },
                            {
                              title: "Blush Recommendations",
                              items: analysisResult.recommendations.blushes,
                              icon: Palette,
                            },
                            ...(analysisResult.recommendations.skincare
                              ? [
                                  {
                                    title: "Skincare Recommendations",
                                    items: analysisResult.recommendations.skincare,
                                    icon: Shield,
                                  },
                                ]
                              : []),
                          ].map((section, index) => (
                            <div
                              key={index}
                              className="p-4 bg-gradient-to-r from-gray-700/30 to-gray-800/30 rounded-xl border border-gray-600/30"
                            >
                              <h4 className="font-semibold text-white text-lg mb-3 flex items-center gap-2">
                                <section.icon className="h-5 w-5 text-rose-400" />
                                {section.title}
                              </h4>
                              <ul className="space-y-2">
                                {section.items.map((item, itemIndex) => (
                                  <li key={itemIndex} className="flex items-start gap-3 text-gray-300">
                                    <span className="w-2 h-2 bg-rose-400 rounded-full mt-2 flex-shrink-0"></span>
                                    <span className="text-base">{item}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      </TabsContent>
                    </Tabs>
                  </div>
                ) : (
                  <div className="text-center py-16 text-gray-500">
                    <div className="w-24 h-24 bg-gradient-to-br from-gray-700 to-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <Eye className="h-12 w-12 text-gray-400" />
                    </div>
                    <p className="text-xl font-medium mb-2">Ready for Python Analysis</p>
                    <p className="text-gray-400">Upload your photo to see results from the FastAPI backend</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
