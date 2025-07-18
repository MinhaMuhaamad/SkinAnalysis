"use client"

import type React from "react"
import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Camera, Upload, Loader2, AlertCircle, Sparkles, Eye, Droplets, Sun } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"

interface SkinAnalysisResult {
  skinType: string
  skinTone: string
  undertone: string
  concerns: string[]
  recommendations: {
    primers: string[]
    moisturizers: string[]
    foundations: string[]
  }
  confidence: number
}

export default function SkinAnalysisPage() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<SkinAnalysisResult | null>(null)
  const [analysisProgress, setAnalysisProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string)
        setAnalysisResult(null)
      }
      reader.readAsDataURL(file)
    }
  }

  const simulateAnalysis = async () => {
    if (!selectedImage) {
      toast({
        title: "No image selected",
        description: "Please upload an image first.",
        variant: "destructive",
      })
      return
    }

    setIsAnalyzing(true)
    setAnalysisProgress(0)

    const progressSteps = [
      { step: 20, message: "Detecting facial features..." },
      { step: 40, message: "Analyzing skin tone..." },
      { step: 60, message: "Identifying skin type..." },
      { step: 80, message: "Detecting skin concerns..." },
      { step: 100, message: "Generating recommendations..." },
    ]

    for (const { step } of progressSteps) {
      await new Promise((resolve) => setTimeout(resolve, 800))
      setAnalysisProgress(step)
    }

    const mockResult: SkinAnalysisResult = {
      skinType: "Combination",
      skinTone: "Medium",
      undertone: "Warm",
      concerns: ["Mild acne", "Dark circles", "Uneven skin tone"],
      recommendations: {
        primers: ["Hydrating primer for dry areas", "Mattifying primer for T-zone"],
        moisturizers: ["Lightweight gel moisturizer", "Hyaluronic acid serum"],
        foundations: ["Medium coverage liquid foundation", "Color-correcting concealer"],
      },
      confidence: 92,
    }

    setAnalysisResult(mockResult)
    setIsAnalyzing(false)

    toast({
      title: "Analysis complete!",
      description: "Your personalized skin analysis is ready.",
    })
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
            <Badge
              variant="secondary"
              className="bg-gradient-to-r from-rose-500/20 to-pink-500/20 border-rose-400/30 text-rose-200 mb-6"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Advanced AI Technology
            </Badge>
            <h1 className="text-5xl lg:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-rose-300 via-pink-200 to-purple-300 bg-clip-text text-transparent">
                AI Skin Analysis
              </span>
            </h1>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
              Upload your photo for personalized skincare and makeup recommendations powered by advanced computer vision
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
                  Take a clear, well-lit photo of your face without makeup for the most accurate analysis
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
                        <p className="text-gray-400 mb-6 text-lg">Drag and drop or click to select your image</p>
                        <Button
                          onClick={() => fileInputRef.current?.click()}
                          className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 px-8 py-3 text-lg font-semibold"
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

                <Button
                  onClick={simulateAnalysis}
                  disabled={!selectedImage || isAnalyzing}
                  className="w-full bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 py-4 text-lg font-semibold shadow-lg hover:shadow-rose-500/25 transition-all duration-300"
                  size="lg"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                      Analyzing Your Skin...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-3 h-5 w-5" />
                      Start AI Analysis
                    </>
                  )}
                </Button>

                {isAnalyzing && (
                  <div className="space-y-4 p-6 bg-gradient-to-r from-rose-500/10 to-pink-500/10 rounded-xl border border-rose-400/20">
                    <Progress value={analysisProgress} className="w-full h-3" />
                    <p className="text-center text-rose-200 font-medium">
                      {analysisProgress < 100
                        ? "Analyzing your unique skin characteristics..."
                        : "Finalizing your personalized recommendations!"}
                    </p>
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
                  Analysis Results
                </CardTitle>
                <CardDescription className="text-gray-400 text-base">
                  Your personalized skin analysis and expert recommendations
                </CardDescription>
              </CardHeader>
              <CardContent>
                {analysisResult ? (
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
                          <span className="font-semibold text-lg">Confidence Score</span>
                          <Badge
                            variant="secondary"
                            className="bg-green-500/20 text-green-300 border-green-400/30 text-lg px-4 py-2"
                          >
                            {analysisResult.confidence}%
                          </Badge>
                        </div>

                        <div className="grid grid-cols-1 gap-6">
                          {[
                            { label: "Skin Type", value: analysisResult.skinType, icon: Droplets, color: "rose" },
                            { label: "Skin Tone", value: analysisResult.skinTone, icon: Sun, color: "pink" },
                            { label: "Undertone", value: analysisResult.undertone, icon: Sparkles, color: "purple" },
                          ].map((item, index) => (
                            <div
                              key={index}
                              className="p-4 bg-gradient-to-r from-gray-700/30 to-gray-800/30 rounded-xl border border-gray-600/30"
                            >
                              <div className="flex items-center gap-3 mb-2">
                                <item.icon className={`h-5 w-5 text-${item.color}-400`} />
                                <h4 className="font-semibold text-white text-lg">{item.label}</h4>
                              </div>
                              <Badge
                                variant="outline"
                                className={`border-${item.color}-400/50 text-${item.color}-300 text-base px-3 py-1`}
                              >
                                {item.value}
                              </Badge>
                            </div>
                          ))}
                        </div>

                        <div className="p-4 bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-xl border border-orange-400/20">
                          <h4 className="font-semibold text-white text-lg mb-3 flex items-center gap-2">
                            <AlertCircle className="h-5 w-5 text-orange-400" />
                            Skin Concerns
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
                      </div>
                    </TabsContent>

                    <TabsContent value="recommendations" className="space-y-6 mt-6">
                      <div className="space-y-6">
                        {[
                          {
                            title: "Recommended Primers",
                            items: analysisResult.recommendations.primers,
                            color: "rose",
                          },
                          {
                            title: "Recommended Moisturizers",
                            items: analysisResult.recommendations.moisturizers,
                            color: "pink",
                          },
                          {
                            title: "Recommended Foundations",
                            items: analysisResult.recommendations.foundations,
                            color: "purple",
                          },
                        ].map((section, index) => (
                          <div
                            key={index}
                            className="p-4 bg-gradient-to-r from-gray-700/30 to-gray-800/30 rounded-xl border border-gray-600/30"
                          >
                            <h4 className="font-semibold text-white text-lg mb-3">{section.title}</h4>
                            <ul className="space-y-2">
                              {section.items.map((item, itemIndex) => (
                                <li key={itemIndex} className="flex items-start gap-3 text-gray-300">
                                  <span
                                    className={`w-2 h-2 bg-${section.color}-400 rounded-full mt-2 flex-shrink-0`}
                                  ></span>
                                  <span className="text-base">{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </TabsContent>
                  </Tabs>
                ) : (
                  <div className="text-center py-16 text-gray-500">
                    <div className="w-24 h-24 bg-gradient-to-br from-gray-700 to-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <Eye className="h-12 w-12 text-gray-400" />
                    </div>
                    <p className="text-xl font-medium mb-2">Ready for Analysis</p>
                    <p className="text-gray-400">Upload and analyze your photo to see personalized results here</p>
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
