"use client"

import { useState } from "react"
import { WebcamCapture } from "@/components/webcam-capture"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { Palette, Sparkles, Eye, Smile, Heart } from "lucide-react"

interface MakeupSettings {
  foundation: {
    opacity: number
    shade: string
  }
  blush: {
    opacity: number
    color: string
  }
  eyeshadow: {
    opacity: number
    color: string
  }
  lipstick: {
    opacity: number
    color: string
  }
}

export default function VirtualTryOnPage() {
  const [analysisResult, setAnalysisResult] = useState<any>(null)
  const [makeupSettings, setMakeupSettings] = useState<MakeupSettings>({
    foundation: { opacity: 50, shade: "#D4A574" },
    blush: { opacity: 30, color: "#E6A0A0" },
    eyeshadow: { opacity: 40, color: "#8B7355" },
    lipstick: { opacity: 60, color: "#C67B7B" },
  })

  const handleAnalysisResult = (result: any) => {
    setAnalysisResult(result)

    // Update makeup settings based on analysis
    if (result.data?.colorMatches) {
      setMakeupSettings((prev) => ({
        ...prev,
        foundation: { ...prev.foundation, shade: result.data.colorMatches.foundation },
        blush: { ...prev.blush, color: result.data.colorMatches.blush },
        lipstick: { ...prev.lipstick, color: result.data.colorMatches.lipstick },
      }))
    }
  }

  const updateMakeupSetting = (category: keyof MakeupSettings, property: string, value: any) => {
    setMakeupSettings((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [property]: value,
      },
    }))
  }

  const presetLooks = [
    { name: "Natural", icon: Heart, colors: { foundation: 40, blush: 20, eyeshadow: 15, lipstick: 30 } },
    { name: "Glamorous", icon: Sparkles, colors: { foundation: 70, blush: 50, eyeshadow: 60, lipstick: 80 } },
    { name: "Professional", icon: Eye, colors: { foundation: 60, blush: 35, eyeshadow: 40, lipstick: 45 } },
    { name: "Evening", icon: Smile, colors: { foundation: 65, blush: 45, eyeshadow: 70, lipstick: 75 } },
  ]

  const applyPreset = (preset: any) => {
    setMakeupSettings((prev) => ({
      foundation: { ...prev.foundation, opacity: preset.colors.foundation },
      blush: { ...prev.blush, opacity: preset.colors.blush },
      eyeshadow: { ...prev.eyeshadow, opacity: preset.colors.eyeshadow },
      lipstick: { ...prev.lipstick, opacity: preset.colors.lipstick },
    }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-rose-900 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
            Virtual Try-On Studio
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Experience real-time makeup application with AI-powered skin analysis and personalized recommendations
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Camera Feed - Takes up 2 columns on large screens */}
          <div className="lg:col-span-2">
            <WebcamCapture onAnalysisResult={handleAnalysisResult} autoAnalyze={false} captureInterval={5000} />
          </div>

          {/* Controls Panel */}
          <div className="space-y-6">
            {/* Analysis Results */}
            {analysisResult && (
              <Card className="bg-gradient-to-br from-green-900/50 to-emerald-900/50 border border-green-400/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-300">
                    <Sparkles className="w-5 h-5" />
                    Skin Analysis
                  </CardTitle>
                  <CardDescription className="text-green-200">AI-powered analysis complete</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Skin Tone:</span>
                      <Badge variant="secondary" className="ml-2 bg-green-500/20 text-green-300">
                        {analysisResult.data?.skinTone || "Unknown"}
                      </Badge>
                    </div>
                    <div>
                      <span className="text-gray-400">Skin Type:</span>
                      <Badge variant="secondary" className="ml-2 bg-blue-500/20 text-blue-300">
                        {analysisResult.data?.skinType || "Unknown"}
                      </Badge>
                    </div>
                  </div>

                  {analysisResult.data?.recommendations && (
                    <div>
                      <h4 className="font-semibold text-green-300 mb-2">Recommendations:</h4>
                      <ul className="text-xs text-gray-300 space-y-1">
                        {analysisResult.data.recommendations.map((rec: string, index: number) => (
                          <li key={index}>• {rec}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Preset Looks */}
            <Card className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 border border-purple-400/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-purple-300">
                  <Palette className="w-5 h-5" />
                  Preset Looks
                </CardTitle>
                <CardDescription className="text-purple-200">Quick makeup styles</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {presetLooks.map((preset) => (
                    <Button
                      key={preset.name}
                      onClick={() => applyPreset(preset)}
                      variant="outline"
                      className="h-auto p-3 flex flex-col items-center gap-2 border-purple-400/30 hover:bg-purple-500/20"
                    >
                      <preset.icon className="w-5 h-5 text-purple-300" />
                      <span className="text-xs text-purple-200">{preset.name}</span>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Makeup Controls */}
            <Card className="bg-gradient-to-br from-pink-900/50 to-rose-900/50 border border-pink-400/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-pink-300">
                  <Sparkles className="w-5 h-5" />
                  Makeup Controls
                </CardTitle>
                <CardDescription className="text-pink-200">Adjust intensity and colors</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="foundation" className="w-full">
                  <TabsList className="grid w-full grid-cols-4 bg-gray-800/50">
                    <TabsTrigger value="foundation" className="text-xs">
                      Foundation
                    </TabsTrigger>
                    <TabsTrigger value="blush" className="text-xs">
                      Blush
                    </TabsTrigger>
                    <TabsTrigger value="eyeshadow" className="text-xs">
                      Eyes
                    </TabsTrigger>
                    <TabsTrigger value="lipstick" className="text-xs">
                      Lips
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="foundation" className="space-y-4">
                    <div>
                      <label className="text-sm text-gray-300 mb-2 block">Opacity</label>
                      <Slider
                        value={[makeupSettings.foundation.opacity]}
                        onValueChange={(value) => updateMakeupSetting("foundation", "opacity", value[0])}
                        max={100}
                        step={1}
                        className="w-full"
                      />
                      <span className="text-xs text-gray-400">{makeupSettings.foundation.opacity}%</span>
                    </div>
                    <div>
                      <label className="text-sm text-gray-300 mb-2 block">Shade</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={makeupSettings.foundation.shade}
                          onChange={(e) => updateMakeupSetting("foundation", "shade", e.target.value)}
                          className="w-8 h-8 rounded border border-gray-600"
                        />
                        <span className="text-xs text-gray-400">{makeupSettings.foundation.shade}</span>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="blush" className="space-y-4">
                    <div>
                      <label className="text-sm text-gray-300 mb-2 block">Opacity</label>
                      <Slider
                        value={[makeupSettings.blush.opacity]}
                        onValueChange={(value) => updateMakeupSetting("blush", "opacity", value[0])}
                        max={100}
                        step={1}
                        className="w-full"
                      />
                      <span className="text-xs text-gray-400">{makeupSettings.blush.opacity}%</span>
                    </div>
                    <div>
                      <label className="text-sm text-gray-300 mb-2 block">Color</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={makeupSettings.blush.color}
                          onChange={(e) => updateMakeupSetting("blush", "color", e.target.value)}
                          className="w-8 h-8 rounded border border-gray-600"
                        />
                        <span className="text-xs text-gray-400">{makeupSettings.blush.color}</span>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="eyeshadow" className="space-y-4">
                    <div>
                      <label className="text-sm text-gray-300 mb-2 block">Opacity</label>
                      <Slider
                        value={[makeupSettings.eyeshadow.opacity]}
                        onValueChange={(value) => updateMakeupSetting("eyeshadow", "opacity", value[0])}
                        max={100}
                        step={1}
                        className="w-full"
                      />
                      <span className="text-xs text-gray-400">{makeupSettings.eyeshadow.opacity}%</span>
                    </div>
                    <div>
                      <label className="text-sm text-gray-300 mb-2 block">Color</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={makeupSettings.eyeshadow.color}
                          onChange={(e) => updateMakeupSetting("eyeshadow", "color", e.target.value)}
                          className="w-8 h-8 rounded border border-gray-600"
                        />
                        <span className="text-xs text-gray-400">{makeupSettings.eyeshadow.color}</span>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="lipstick" className="space-y-4">
                    <div>
                      <label className="text-sm text-gray-300 mb-2 block">Opacity</label>
                      <Slider
                        value={[makeupSettings.lipstick.opacity]}
                        onValueChange={(value) => updateMakeupSetting("lipstick", "opacity", value[0])}
                        max={100}
                        step={1}
                        className="w-full"
                      />
                      <span className="text-xs text-gray-400">{makeupSettings.lipstick.opacity}%</span>
                    </div>
                    <div>
                      <label className="text-sm text-gray-300 mb-2 block">Color</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={makeupSettings.lipstick.color}
                          onChange={(e) => updateMakeupSetting("lipstick", "color", e.target.value)}
                          className="w-8 h-8 rounded border border-gray-600"
                        />
                        <span className="text-xs text-gray-400">{makeupSettings.lipstick.color}</span>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
