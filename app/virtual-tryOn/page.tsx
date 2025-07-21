"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Palette, Eye, Smile, Sparkles, Download, RotateCcw, Zap, Settings, Droplets } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { WebcamCapture } from "@/components/webcam-capture"

interface MakeupOption {
  id: string
  name: string
  category: "foundation" | "eyeshadow" | "lipstick" | "blush" | "eyeliner"
  color: string
  intensity: number
}

export default function VirtualTryOnPage() {
  const [selectedMakeup, setSelectedMakeup] = useState<MakeupOption[]>([])
  const [currentCategory, setCurrentCategory] = useState<string>("foundation")
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [analysisResult, setAnalysisResult] = useState<any>(null)

  const { toast } = useToast()

  const makeupOptions = {
    foundation: [
      { id: "f1", name: "Porcelain Glow", color: "#F5E6D3", intensity: 50 },
      { id: "f2", name: "Honey Beige", color: "#E8C5A0", intensity: 50 },
      { id: "f3", name: "Caramel Bronze", color: "#D4A574", intensity: 50 },
      { id: "f4", name: "Deep Espresso", color: "#8B4513", intensity: 50 },
    ],
    eyeshadow: [
      { id: "e1", name: "Rose Gold Shimmer", color: "#E8B4B8", intensity: 70 },
      { id: "e2", name: "Smoky Charcoal", color: "#36454F", intensity: 60 },
      { id: "e3", name: "Violet Dreams", color: "#8A2BE2", intensity: 80 },
      { id: "e4", name: "Golden Hour", color: "#FFD700", intensity: 75 },
    ],
    lipstick: [
      { id: "l1", name: "Ruby Red", color: "#DC143C", intensity: 90 },
      { id: "l2", name: "Nude Rose", color: "#F8BBD9", intensity: 60 },
      { id: "l3", name: "Berry Crush", color: "#8B008B", intensity: 85 },
      { id: "l4", name: "Coral Sunset", color: "#FF7F50", intensity: 70 },
    ],
    blush: [
      { id: "b1", name: "Peachy Keen", color: "#FFCCCB", intensity: 40 },
      { id: "b2", name: "Rose Flush", color: "#FF69B4", intensity: 50 },
      { id: "b3", name: "Coral Bloom", color: "#FF7F50", intensity: 45 },
      { id: "b4", name: "Berry Blush", color: "#DC143C", intensity: 55 },
    ],
    eyeliner: [
      { id: "el1", name: "Midnight Black", color: "#000000", intensity: 80 },
      { id: "el2", name: "Chocolate Brown", color: "#8B4513", intensity: 70 },
      { id: "el3", name: "Electric Blue", color: "#0080FF", intensity: 75 },
      { id: "el4", name: "Emerald Green", color: "#50C878", intensity: 65 },
    ],
  }

  const applyMakeup = (option: any, category: string) => {
    const newMakeup: MakeupOption = {
      id: option.id,
      name: option.name,
      category: category as any,
      color: option.color,
      intensity: option.intensity,
    }

    setSelectedMakeup((prev) => {
      const filtered = prev.filter((item) => item.category !== category)
      return [...filtered, newMakeup]
    })

    toast({
      title: "Makeup applied! 💄",
      description: `${option.name} has been applied to your look.`,
    })
  }

  const adjustIntensity = (category: string, intensity: number) => {
    setSelectedMakeup((prev) =>
      prev.map((item) => (item.category === category ? { ...item, intensity: intensity } : item)),
    )
  }

  const clearAllMakeup = () => {
    setSelectedMakeup([])
    toast({
      title: "Makeup cleared! 🧼",
      description: "All makeup has been removed.",
    })
  }

  const handleFrameCapture = (imageData: string) => {
    setCapturedImage(imageData)
  }

  const handleAnalysisResult = (result: any) => {
    setAnalysisResult(result)
  }

  const downloadPhoto = () => {
    if (capturedImage) {
      const link = document.createElement("a")
      link.download = `makeup-look-${Date.now()}.png`
      link.href = capturedImage
      link.click()

      toast({
        title: "Photo downloaded! 📱",
        description: "Your makeup look has been saved to your device.",
      })
    }
  }

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/40 via-black/60 to-rose-900/40"></div>
      </div>

      {/* Floating Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-cyan-400/20 to-blue-400/20 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-br from-pink-400/20 to-rose-400/20 rounded-full blur-xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-32 left-1/4 w-40 h-40 bg-gradient-to-br from-green-400/20 to-emerald-400/20 rounded-full blur-xl animate-pulse delay-2000"></div>
        <div className="absolute bottom-20 right-1/3 w-28 h-28 bg-gradient-to-br from-yellow-400/20 to-orange-400/20 rounded-full blur-xl animate-pulse delay-3000"></div>
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <Badge
              variant="secondary"
              className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-400/30 text-purple-200 mb-6"
            >
              <Zap className="w-4 h-4 mr-2" />
              Real-Time AR Technology
            </Badge>
            <h1 className="text-5xl lg:text-7xl font-bold mb-6">
              <span className="bg-gradient-to-r from-cyan-300 via-purple-300 to-pink-300 bg-clip-text text-transparent">
                Virtual Try-On
              </span>
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Experience real-time makeup application with advanced face detection and AR technology
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Camera Section */}
            <div className="lg:col-span-2">
              <WebcamCapture
                onFrameCapture={handleFrameCapture}
                onAnalysisResult={handleAnalysisResult}
                autoAnalyze={false}
                captureInterval={5000}
              />

              {/* Captured Photo */}
              {capturedImage && (
                <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-green-400/20 mt-6">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <Sparkles className="h-5 w-5 text-green-400" />
                      Captured Look
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="relative">
                      <img
                        src={capturedImage || "/placeholder.svg"}
                        alt="Captured makeup look"
                        className="w-full rounded-xl object-cover shadow-xl border border-green-400/20"
                      />
                      <Button
                        onClick={downloadPhoto}
                        className="absolute top-4 right-4 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 shadow-lg"
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Makeup Controls */}
            <div className="space-y-6">
              <Card className="bg-gradient-to-br from-gray-900/80 to-black/80 border border-purple-400/20 backdrop-blur-xl shadow-2xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <div className="p-2 bg-gradient-to-br from-rose-500 to-pink-500 rounded-xl shadow-lg">
                      <Palette className="h-5 w-5 text-white" />
                    </div>
                    Makeup Studio
                  </CardTitle>
                  <CardDescription className="text-gray-400">Choose and customize your makeup look</CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs value={currentCategory} onValueChange={setCurrentCategory} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 bg-gray-800/50 border border-purple-400/20 mb-6">
                      <TabsTrigger
                        value="foundation"
                        className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500"
                      >
                        <Droplets className="w-4 h-4 mr-2" />
                        Base
                      </TabsTrigger>
                      <TabsTrigger
                        value="eyeshadow"
                        className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Eyes
                      </TabsTrigger>
                    </TabsList>

                    <div className="space-y-6">
                      <TabsContent value="foundation" className="space-y-4 mt-0">
                        <div className="grid grid-cols-2 gap-3">
                          {makeupOptions.foundation.map((option) => (
                            <Button
                              key={option.id}
                              onClick={() => applyMakeup(option, "foundation")}
                              variant="outline"
                              className="h-auto p-4 border-gray-600 hover:border-purple-400 bg-gray-800/50 hover:bg-purple-500/20 transition-all duration-300"
                            >
                              <div className="flex flex-col items-center gap-2">
                                <div
                                  className="w-8 h-8 rounded-full border-2 border-white/20 shadow-lg"
                                  style={{ backgroundColor: option.color }}
                                ></div>
                                <span className="text-sm font-medium text-center">{option.name}</span>
                              </div>
                            </Button>
                          ))}
                        </div>
                      </TabsContent>

                      <TabsContent value="eyeshadow" className="space-y-4 mt-0">
                        <div className="grid grid-cols-2 gap-3">
                          {makeupOptions.eyeshadow.map((option) => (
                            <Button
                              key={option.id}
                              onClick={() => applyMakeup(option, "eyeshadow")}
                              variant="outline"
                              className="h-auto p-4 border-gray-600 hover:border-purple-400 bg-gray-800/50 hover:bg-purple-500/20 transition-all duration-300"
                            >
                              <div className="flex flex-col items-center gap-2">
                                <div
                                  className="w-8 h-8 rounded-full border-2 border-white/20 shadow-lg"
                                  style={{ backgroundColor: option.color }}
                                ></div>
                                <span className="text-sm font-medium text-center">{option.name}</span>
                              </div>
                            </Button>
                          ))}
                        </div>
                      </TabsContent>

                      {/* More makeup categories */}
                      <div className="grid grid-cols-3 gap-2">
                        {["lipstick", "blush", "eyeliner"].map((category) => (
                          <Button
                            key={category}
                            onClick={() => setCurrentCategory(category)}
                            variant="outline"
                            size="sm"
                            className={`border-gray-600 hover:border-purple-400 bg-gray-800/50 hover:bg-purple-500/20 transition-all duration-300 ${
                              currentCategory === category ? "border-purple-400 bg-purple-500/20" : ""
                            }`}
                          >
                            {category === "lipstick" && <Smile className="w-4 h-4 mr-1" />}
                            {category === "blush" && <Sparkles className="w-4 h-4 mr-1" />}
                            {category === "eyeliner" && <Eye className="w-4 h-4 mr-1" />}
                            {category.charAt(0).toUpperCase() + category.slice(1)}
                          </Button>
                        ))}
                      </div>

                      {currentCategory === "lipstick" && (
                        <div className="grid grid-cols-2 gap-3">
                          {makeupOptions.lipstick.map((option) => (
                            <Button
                              key={option.id}
                              onClick={() => applyMakeup(option, "lipstick")}
                              variant="outline"
                              className="h-auto p-4 border-gray-600 hover:border-purple-400 bg-gray-800/50 hover:bg-purple-500/20 transition-all duration-300"
                            >
                              <div className="flex flex-col items-center gap-2">
                                <div
                                  className="w-8 h-8 rounded-full border-2 border-white/20 shadow-lg"
                                  style={{ backgroundColor: option.color }}
                                ></div>
                                <span className="text-sm font-medium text-center">{option.name}</span>
                              </div>
                            </Button>
                          ))}
                        </div>
                      )}

                      {currentCategory === "blush" && (
                        <div className="grid grid-cols-2 gap-3">
                          {makeupOptions.blush.map((option) => (
                            <Button
                              key={option.id}
                              onClick={() => applyMakeup(option, "blush")}
                              variant="outline"
                              className="h-auto p-4 border-gray-600 hover:border-purple-400 bg-gray-800/50 hover:bg-purple-500/20 transition-all duration-300"
                            >
                              <div className="flex flex-col items-center gap-2">
                                <div
                                  className="w-8 h-8 rounded-full border-2 border-white/20 shadow-lg"
                                  style={{ backgroundColor: option.color }}
                                ></div>
                                <span className="text-sm font-medium text-center">{option.name}</span>
                              </div>
                            </Button>
                          ))}
                        </div>
                      )}

                      {currentCategory === "eyeliner" && (
                        <div className="grid grid-cols-2 gap-3">
                          {makeupOptions.eyeliner.map((option) => (
                            <Button
                              key={option.id}
                              onClick={() => applyMakeup(option, "eyeliner")}
                              variant="outline"
                              className="h-auto p-4 border-gray-600 hover:border-purple-400 bg-gray-800/50 hover:bg-purple-500/20 transition-all duration-300"
                            >
                              <div className="flex flex-col items-center gap-2">
                                <div
                                  className="w-8 h-8 rounded-full border-2 border-white/20 shadow-lg"
                                  style={{ backgroundColor: option.color }}
                                ></div>
                                <span className="text-sm font-medium text-center">{option.name}</span>
                              </div>
                            </Button>
                          ))}
                        </div>
                      )}

                      {/* Intensity Controls */}
                      {selectedMakeup.length > 0 && (
                        <div className="space-y-4 p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl border border-purple-400/20">
                          <h4 className="font-semibold text-white flex items-center gap-2">
                            <Settings className="w-4 h-4" />
                            Intensity Controls
                          </h4>
                          {selectedMakeup.map((makeup) => (
                            <div key={makeup.id} className="space-y-2">
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-300">{makeup.name}</span>
                                <span className="text-sm text-purple-300">{makeup.intensity}%</span>
                              </div>
                              <Slider
                                value={[makeup.intensity]}
                                onValueChange={(value) => adjustIntensity(makeup.category, value[0])}
                                max={100}
                                step={5}
                                className="w-full"
                              />
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Clear All Button */}
                      {selectedMakeup.length > 0 && (
                        <Button
                          onClick={clearAllMakeup}
                          variant="outline"
                          className="w-full border-red-400/50 text-red-300 hover:bg-red-500/20 bg-transparent"
                        >
                          <RotateCcw className="mr-2 h-4 w-4" />
                          Clear All Makeup
                        </Button>
                      )}
                    </div>
                  </Tabs>
                </CardContent>
              </Card>

              {/* Applied Makeup Summary */}
              {selectedMakeup.length > 0 && (
                <Card className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 border border-green-400/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-lg">
                      <Sparkles className="h-5 w-5 text-green-400" />
                      Current Look
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {selectedMakeup.map((makeup) => (
                        <div
                          key={makeup.id}
                          className="flex items-center justify-between p-3 bg-green-500/10 rounded-lg border border-green-400/20"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className="w-6 h-6 rounded-full border border-white/20"
                              style={{ backgroundColor: makeup.color }}
                            ></div>
                            <div>
                              <p className="font-medium text-green-200">{makeup.name}</p>
                              <p className="text-sm text-green-400 capitalize">{makeup.category}</p>
                            </div>
                          </div>
                          <Badge variant="secondary" className="bg-green-500/20 text-green-300 border-green-400/30">
                            {makeup.intensity}%
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Analysis Results */}
              {analysisResult && (
                <Card className="bg-gradient-to-br from-blue-900/30 to-cyan-900/30 border border-blue-400/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-lg">
                      <Eye className="h-5 w-5 text-blue-400" />
                      Skin Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Skin Tone:</span>
                        <span className="text-blue-200">{analysisResult.skinTone || "Unknown"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Confidence:</span>
                        <span className="text-blue-200">{analysisResult.confidence || 0}%</span>
                      </div>
                      {analysisResult.recommendations && (
                        <div>
                          <span className="text-gray-400">Recommendations:</span>
                          <ul className="text-blue-200 text-sm mt-1 space-y-1">
                            {analysisResult.recommendations.map((rec: string, index: number) => (
                              <li key={index}>• {rec}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
