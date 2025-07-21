"use client"

import { useState } from "react"
import { WebcamCapture } from "@/components/webcam-capture"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Zap, Eye, Palette, Sparkles, Clock, Camera, Brain } from "lucide-react"

interface AnalysisResult {
  success: boolean
  skinTone: string
  undertone: string
  concerns: string[]
  recommendations: {
    foundations: string[]
    concealers: string[]
    lipsticks: string[]
    eyeshadows: string[]
    blushes: string[]
    skincare: string[]
  }
  confidence: number
  analysis_details: {
    average_color: number[]
    brightness: number
    skin_coverage: number
    pixel_count: number
  }
  timestamp: string
}

export default function RealTimeAnalysisPage() {
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [analysisHistory, setAnalysisHistory] = useState<AnalysisResult[]>([])
  const [autoAnalyze, setAutoAnalyze] = useState(false)
  const [capturedFrames, setCapturedFrames] = useState<string[]>([])

  const handleFrameCapture = (imageData: string) => {
    setCapturedFrames((prev) => [...prev.slice(-4), imageData]) // Keep last 5 frames
  }

  const handleAnalysisResult = (result: AnalysisResult) => {
    setAnalysisResult(result)
    setAnalysisHistory((prev) => [result, ...prev.slice(0, 9)]) // Keep last 10 results
  }

  const toggleAutoAnalyze = () => {
    setAutoAnalyze(!autoAnalyze)
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
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <Badge
              variant="secondary"
              className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-400/30 text-purple-200 mb-6"
            >
              <Brain className="w-4 h-4 mr-2" />
              Real-Time AI Analysis
            </Badge>
            <h1 className="text-5xl lg:text-7xl font-bold mb-6">
              <span className="bg-gradient-to-r from-cyan-300 via-purple-300 to-pink-300 bg-clip-text text-transparent">
                Live Skin Analysis
              </span>
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Real-time webcam capture with instant AI-powered skin analysis and personalized recommendations
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Webcam Section */}
            <div className="lg:col-span-2">
              <WebcamCapture
                onFrameCapture={handleFrameCapture}
                onAnalysisResult={handleAnalysisResult}
                autoAnalyze={autoAnalyze}
                captureInterval={5000}
              />

              {/* Auto-analyze Control */}
              <div className="mt-6">
                <Card className="bg-gradient-to-br from-gray-900/80 to-black/80 border border-purple-400/20">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Zap className="h-5 w-5 text-purple-400" />
                        <div>
                          <h4 className="font-semibold text-white">Auto-Analysis</h4>
                          <p className="text-sm text-gray-400">Automatically analyze frames every 5 seconds</p>
                        </div>
                      </div>
                      <Button
                        onClick={toggleAutoAnalyze}
                        variant={autoAnalyze ? "default" : "outline"}
                        className={
                          autoAnalyze
                            ? "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                            : "border-purple-400/50 text-purple-300 hover:bg-purple-500/20"
                        }
                      >
                        {autoAnalyze ? "Disable" : "Enable"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Analysis Results */}
            <div className="space-y-6">
              {analysisResult ? (
                <Card className="bg-gradient-to-br from-gray-900/80 to-black/80 border border-green-400/20 backdrop-blur-xl shadow-2xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-xl">
                      <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl shadow-lg">
                        <Eye className="h-5 w-5 text-white" />
                      </div>
                      Analysis Results
                      <Badge variant="secondary" className="bg-green-500/20 text-green-300 border-green-400/30">
                        {analysisResult.confidence}% confidence
                      </Badge>
                    </CardTitle>
                    <CardDescription className="text-gray-400">Latest skin analysis from your webcam</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="overview" className="w-full">
                      <TabsList className="grid w-full grid-cols-2 bg-gray-800/50 border border-purple-400/20 mb-6">
                        <TabsTrigger
                          value="overview"
                          className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Overview
                        </TabsTrigger>
                        <TabsTrigger
                          value="recommendations"
                          className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500"
                        >
                          <Palette className="w-4 h-4 mr-2" />
                          Products
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent value="overview" className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg p-3 border border-purple-400/20">
                            <p className="text-sm text-gray-400">Skin Tone</p>
                            <p className="font-semibold text-white">{analysisResult.skinTone}</p>
                          </div>
                          <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-lg p-3 border border-blue-400/20">
                            <p className="text-sm text-gray-400">Undertone</p>
                            <p className="font-semibold text-white">{analysisResult.undertone}</p>
                          </div>
                        </div>

                        {analysisResult.concerns.length > 0 && (
                          <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-lg p-4 border border-orange-400/20">
                            <h4 className="font-semibold text-orange-300 mb-2">Areas of Focus</h4>
                            <ul className="space-y-1">
                              {analysisResult.concerns.map((concern, index) => (
                                <li key={index} className="text-sm text-gray-300 flex items-center gap-2">
                                  <div className="w-1.5 h-1.5 bg-orange-400 rounded-full"></div>
                                  {concern}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        <div className="bg-gradient-to-r from-gray-500/10 to-gray-600/10 rounded-lg p-4 border border-gray-400/20">
                          <h4 className="font-semibold text-gray-300 mb-2">Analysis Details</h4>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <span className="text-gray-400">Brightness:</span>
                              <span className="text-white ml-2">
                                {Math.round(analysisResult.analysis_details.brightness)}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-400">Coverage:</span>
                              <span className="text-white ml-2">{analysisResult.analysis_details.skin_coverage}%</span>
                            </div>
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="recommendations" className="space-y-4">
                        <div className="space-y-4">
                          <div className="bg-gradient-to-r from-rose-500/10 to-pink-500/10 rounded-lg p-4 border border-rose-400/20">
                            <h4 className="font-semibold text-rose-300 mb-2 flex items-center gap-2">
                              <Sparkles className="w-4 h-4" />
                              Foundation
                            </h4>
                            <ul className="space-y-1">
                              {analysisResult.recommendations.foundations.slice(0, 2).map((item, index) => (
                                <li key={index} className="text-sm text-gray-300">
                                  • {item}
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div className="bg-gradient-to-r from-purple-500/10 to-violet-500/10 rounded-lg p-4 border border-purple-400/20">
                            <h4 className="font-semibold text-purple-300 mb-2 flex items-center gap-2">
                              <Palette className="w-4 h-4" />
                              Lipstick
                            </h4>
                            <ul className="space-y-1">
                              {analysisResult.recommendations.lipsticks.slice(0, 2).map((item, index) => (
                                <li key={index} className="text-sm text-gray-300">
                                  • {item}
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-lg p-4 border border-green-400/20">
                            <h4 className="font-semibold text-green-300 mb-2 flex items-center gap-2">
                              <Sparkles className="w-4 h-4" />
                              Skincare
                            </h4>
                            <ul className="space-y-1">
                              {analysisResult.recommendations.skincare.slice(0, 2).map((item, index) => (
                                <li key={index} className="text-sm text-gray-300">
                                  • {item}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              ) : (
                <Card className="bg-gradient-to-br from-gray-900/80 to-black/80 border border-gray-400/20">
                  <CardContent className="p-8 text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-gray-600 to-gray-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Camera className="h-8 w-8 text-gray-300" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-300 mb-2">No Analysis Yet</h3>
                    <p className="text-gray-500">Start your camera and capture a frame to begin analysis</p>
                  </CardContent>
                </Card>
              )}

              {/* Analysis History */}
              {analysisHistory.length > 0 && (
                <Card className="bg-gradient-to-br from-gray-900/80 to-black/80 border border-blue-400/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-lg">
                      <Clock className="h-5 w-5 text-blue-400" />
                      Analysis History
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {analysisHistory.slice(0, 5).map((result, index) => (
                        <div
                          key={index}
                          className="bg-blue-500/10 rounded-lg p-3 border border-blue-400/20 cursor-pointer hover:bg-blue-500/20 transition-colors"
                          onClick={() => setAnalysisResult(result)}
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-medium text-blue-200">{result.skinTone}</p>
                              <p className="text-sm text-blue-400">{result.undertone} undertone</p>
                            </div>
                            <Badge variant="secondary" className="bg-blue-500/20 text-blue-300 border-blue-400/30">
                              {result.confidence}%
                            </Badge>
                          </div>
                        </div>
                      ))}
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
