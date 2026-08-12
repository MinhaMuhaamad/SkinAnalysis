"use client"

import type React from "react"

import { useState, useRef, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Palette, Eye, Smile, Sparkles, Download, RotateCcw, RefreshCw, Heart, Brush, Droplets } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface MakeupSettings {
  lipstick: {
    enabled: boolean
    color: string
    intensity: number
  }
  eyeshadow: {
    enabled: boolean
    color: string
    intensity: number
  }
  blush: {
    enabled: boolean
    color: string
    intensity: number
  }
  foundation: {
    enabled: boolean
    color: string
    intensity: number
  }
  eyeliner: {
    enabled: boolean
    color: string
    intensity: number
    thickness: number
  }
  eyebrow: {
    enabled: boolean
    color: string
    intensity: number
  }
}

interface RealtimeMakeupStudioProps {
  videoRef: React.RefObject<HTMLVideoElement>
  canvasRef: React.RefObject<HTMLCanvasElement>
  isActive: boolean
}

export function RealtimeMakeupStudio({ videoRef, canvasRef, isActive }: RealtimeMakeupStudioProps) {
  const [makeupSettings, setMakeupSettings] = useState<MakeupSettings>({
    lipstick: { enabled: false, color: "#DC143C", intensity: 80 },
    eyeshadow: { enabled: false, color: "#8B7355", intensity: 60 },
    blush: { enabled: false, color: "#FFB6C1", intensity: 40 },
    foundation: { enabled: false, color: "#E8C5A0", intensity: 30 },
    eyeliner: { enabled: false, color: "#000000", intensity: 90, thickness: 2 },
    eyebrow: { enabled: false, color: "#8B4513", intensity: 50 },
  })

  const [isProcessing, setIsProcessing] = useState(false)
  const [processedImage, setProcessedImage] = useState<string | null>(null)
  const [autoApply, setAutoApply] = useState(false)
  const [lastProcessTime, setLastProcessTime] = useState(0)

  const { toast } = useToast()
  const processingIntervalRef = useRef<NodeJS.Timeout>()

  // Makeup color palettes
  const makeupColors = {
    lipstick: [
      { name: "Classic Red", color: "#DC143C" },
      { name: "Cherry Red", color: "#B22222" },
      { name: "Wine Red", color: "#722F37" },
      { name: "Rose Pink", color: "#FF69B4" },
      { name: "Coral Pink", color: "#FF7F50" },
      { name: "Nude Pink", color: "#F8BBD9" },
      { name: "Deep Berry", color: "#8B008B" },
      { name: "Plum Berry", color: "#DDA0DD" },
      { name: "Coral Orange", color: "#FF6347" },
      { name: "Nude Brown", color: "#D2691E" },
      { name: "Purple Mauve", color: "#9370DB" },
      { name: "Matte Red", color: "#8B0000" },
    ],
    eyeshadow: [
      { name: "Neutral Brown", color: "#8B7355" },
      { name: "Chocolate", color: "#7B3F00" },
      { name: "Gold Shimmer", color: "#FFD700" },
      { name: "Bronze", color: "#CD7F32" },
      { name: "Silver", color: "#C0C0C0" },
      { name: "Purple Smoky", color: "#663399" },
      { name: "Navy Blue", color: "#000080" },
      { name: "Emerald", color: "#50C878" },
      { name: "Rose Pink", color: "#FF69B4" },
      { name: "Black Smoky", color: "#2F2F2F" },
      { name: "Copper", color: "#B87333" },
      { name: "Champagne", color: "#F7E7CE" },
    ],
    blush: [
      { name: "Natural Pink", color: "#FFB6C1" },
      { name: "Coral Warm", color: "#FF7F50" },
      { name: "Peach Soft", color: "#FFCCCB" },
      { name: "Rose Classic", color: "#FF69B4" },
      { name: "Berry Bold", color: "#DC143C" },
      { name: "Apricot Glow", color: "#FBCEB1" },
      { name: "Mauve Subtle", color: "#E0B0FF" },
      { name: "Bronze Sun", color: "#CD7F32" },
    ],
    foundation: [
      { name: "Porcelain", color: "#F5E6D3" },
      { name: "Ivory", color: "#FFFFF0" },
      { name: "Light Beige", color: "#F5F5DC" },
      { name: "Medium Beige", color: "#E8C5A0" },
      { name: "Light Tan", color: "#D2B48C" },
      { name: "Medium Tan", color: "#D4A574" },
      { name: "Light Bronze", color: "#CD853F" },
      { name: "Deep Bronze", color: "#8B4513" },
      { name: "Espresso", color: "#6F4E37" },
      { name: "Ebony", color: "#555D50" },
    ],
    eyeliner: [
      { name: "Classic Black", color: "#000000" },
      { name: "Soft Brown", color: "#8B4513" },
      { name: "Electric Blue", color: "#0080FF" },
      { name: "Emerald Green", color: "#50C878" },
      { name: "Purple Plum", color: "#8B008B" },
      { name: "Gold Metallic", color: "#FFD700" },
      { name: "Silver Metallic", color: "#C0C0C0" },
      { name: "Deep Navy", color: "#000080" },
    ],
    eyebrow: [
      { name: "Light Brown", color: "#A0522D" },
      { name: "Medium Brown", color: "#8B4513" },
      { name: "Dark Brown", color: "#654321" },
      { name: "Soft Black", color: "#2F2F2F" },
      { name: "Auburn", color: "#A52A2A" },
      { name: "Blonde", color: "#D2B48C" },
      { name: "Ash Gray", color: "#708090" },
    ],
  }

  // Auto-apply makeup when settings change
  useEffect(() => {
    if (autoApply && isActive) {
      const now = Date.now()
      if (now - lastProcessTime > 1000) {
        // Throttle to 1 second
        applyMakeup()
        setLastProcessTime(now)
      }
    }
  }, [makeupSettings, autoApply, isActive])

  const captureFrame = useCallback((): string | null => {
    if (!videoRef.current || !canvasRef.current) return null

    const video = videoRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")

    if (!ctx || video.videoWidth === 0 || video.videoHeight === 0) return null

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

    return canvas.toDataURL("image/jpeg", 0.8)
  }, [videoRef, canvasRef])

  const applyMakeup = async () => {
    if (!isActive || isProcessing) return

    const imageData = captureFrame()
    if (!imageData) {
      toast({
        title: "Capture failed",
        description: "Could not capture video frame",
        variant: "destructive",
      })
      return
    }

    setIsProcessing(true)

    try {
      const response = await fetch("/api/realtime-makeup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imageData,
          makeupSettings,
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()

      if (result.success) {
        setProcessedImage(result.processed_image)
        toast({
          title: "Makeup applied! ✨",
          description: `Applied: ${result.makeup_applied?.join(", ") || "None"}`,
        })
      } else {
        throw new Error(result.error || "Makeup application failed")
      }
    } catch (error) {
      console.error("Makeup application error:", error)
      toast({
        title: "Makeup application failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
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

  const toggleMakeup = (category: keyof MakeupSettings) => {
    setMakeupSettings((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        enabled: !prev[category].enabled,
      },
    }))
  }

  const clearAllMakeup = () => {
    setMakeupSettings((prev) => {
      const cleared = { ...prev }
      Object.keys(cleared).forEach((key) => {
        cleared[key as keyof MakeupSettings].enabled = false
      })
      return cleared
    })
    setProcessedImage(null)
    toast({
      title: "Makeup cleared! 🧼",
      description: "All makeup has been removed",
    })
  }

  const downloadImage = () => {
    if (processedImage) {
      const link = document.createElement("a")
      link.download = `makeup-look-${Date.now()}.jpg`
      link.href = processedImage
      link.click()
      toast({
        title: "Image downloaded! 📱",
        description: "Your makeup look has been saved",
      })
    }
  }

  const presetLooks = [
    {
      name: "Natural",
      icon: Heart,
      settings: {
        foundation: { enabled: true, intensity: 25 },
        blush: { enabled: true, intensity: 20 },
        lipstick: { enabled: true, intensity: 30, color: "#F8BBD9" },
        eyebrow: { enabled: true, intensity: 30 },
      },
    },
    {
      name: "Glamorous",
      icon: Sparkles,
      settings: {
        foundation: { enabled: true, intensity: 40 },
        eyeshadow: { enabled: true, intensity: 70, color: "#663399" },
        eyeliner: { enabled: true, intensity: 90 },
        blush: { enabled: true, intensity: 50 },
        lipstick: { enabled: true, intensity: 85, color: "#DC143C" },
      },
    },
    {
      name: "Professional",
      icon: Eye,
      settings: {
        foundation: { enabled: true, intensity: 35 },
        eyeshadow: { enabled: true, intensity: 45, color: "#8B7355" },
        blush: { enabled: true, intensity: 30 },
        lipstick: { enabled: true, intensity: 50, color: "#D2691E" },
        eyebrow: { enabled: true, intensity: 40 },
      },
    },
    {
      name: "Evening",
      icon: Smile,
      settings: {
        foundation: { enabled: true, intensity: 45 },
        eyeshadow: { enabled: true, intensity: 80, color: "#2F2F2F" },
        eyeliner: { enabled: true, intensity: 95, thickness: 3 },
        blush: { enabled: true, intensity: 45 },
        lipstick: { enabled: true, intensity: 90, color: "#8B008B" },
      },
    },
  ]

  const applyPreset = (preset: any) => {
    setMakeupSettings((prev) => {
      const newSettings = { ...prev }
      Object.keys(preset.settings).forEach((key) => {
        if (key in newSettings) {
          newSettings[key as keyof MakeupSettings] = {
            ...newSettings[key as keyof MakeupSettings],
            ...preset.settings[key],
          }
        }
      })
      return newSettings
    })
    toast({
      title: `${preset.name} look applied! 💄`,
      description: "Preset makeup settings have been applied",
    })
  }

  return (
    <div className="space-y-6">
      {/* Processed Image Display */}
      {processedImage && (
        <Card className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 border border-green-400/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Sparkles className="h-5 w-5 text-green-400" />
              Makeup Applied
              <Button
                onClick={downloadImage}
                size="sm"
                className="ml-auto bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
              >
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <img
              src={processedImage || "/placeholder.svg"}
              alt="Makeup applied"
              className="w-full rounded-xl object-cover shadow-xl border border-green-400/20"
            />
          </CardContent>
        </Card>
      )}

      {/* Controls */}
      <Card className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 border border-purple-400/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Palette className="h-5 w-5 text-purple-300" />
            Professional Makeup Studio
            <div className="ml-auto flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Switch checked={autoApply} onCheckedChange={setAutoApply} disabled={!isActive} />
                <span className="text-sm text-purple-200">Auto Apply</span>
              </div>
              <Button
                onClick={applyMakeup}
                disabled={!isActive || isProcessing}
                className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600"
              >
                {isProcessing ? (
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Brush className="mr-2 h-4 w-4" />
                )}
                {isProcessing ? "Applying..." : "Apply Makeup"}
              </Button>
            </div>
          </CardTitle>
          <CardDescription className="text-purple-200">
            Professional-grade makeup application with real-time preview
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Preset Looks */}
          <div>
            <h4 className="font-semibold text-purple-300 mb-3">Preset Looks</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
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
          </div>

          {/* Makeup Controls */}
          <Tabs defaultValue="lipstick" className="w-full">
            <TabsList className="grid w-full grid-cols-3 md:grid-cols-6 bg-gray-800/50">
              <TabsTrigger value="lipstick" className="text-xs">
                <Smile className="w-4 h-4 mr-1" />
                Lips
              </TabsTrigger>
              <TabsTrigger value="eyeshadow" className="text-xs">
                <Eye className="w-4 h-4 mr-1" />
                Eyes
              </TabsTrigger>
              <TabsTrigger value="blush" className="text-xs">
                <Heart className="w-4 h-4 mr-1" />
                Blush
              </TabsTrigger>
              <TabsTrigger value="foundation" className="text-xs">
                <Droplets className="w-4 h-4 mr-1" />
                Base
              </TabsTrigger>
              <TabsTrigger value="eyeliner" className="text-xs">
                <Brush className="w-4 h-4 mr-1" />
                Liner
              </TabsTrigger>
              <TabsTrigger value="eyebrow" className="text-xs">
                <Eye className="w-4 h-4 mr-1" />
                Brows
              </TabsTrigger>
            </TabsList>

            {Object.keys(makeupSettings).map((category) => (
              <TabsContent key={category} value={category} className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-white capitalize">{category}</h4>
                  <Switch
                    checked={makeupSettings[category as keyof MakeupSettings].enabled}
                    onCheckedChange={() => toggleMakeup(category as keyof MakeupSettings)}
                  />
                </div>

                {makeupSettings[category as keyof MakeupSettings].enabled && (
                  <>
                    {/* Color Selection */}
                    <div>
                      <label className="text-sm text-gray-300 mb-2 block">Color</label>
                      <div className="grid grid-cols-4 md:grid-cols-6 gap-2 mb-3">
                        {makeupColors[category as keyof typeof makeupColors]?.map((colorOption) => (
                          <button
                            key={colorOption.name}
                            onClick={() =>
                              updateMakeupSetting(category as keyof MakeupSettings, "color", colorOption.color)
                            }
                            className={`w-8 h-8 rounded-full border-2 transition-all ${
                              makeupSettings[category as keyof MakeupSettings].color === colorOption.color
                                ? "border-white scale-110"
                                : "border-gray-600 hover:border-gray-400"
                            }`}
                            style={{ backgroundColor: colorOption.color }}
                            title={colorOption.name}
                          />
                        ))}
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={makeupSettings[category as keyof MakeupSettings].color}
                          onChange={(e) =>
                            updateMakeupSetting(category as keyof MakeupSettings, "color", e.target.value)
                          }
                          className="w-8 h-8 rounded border border-gray-600"
                        />
                        <span className="text-xs text-gray-400">
                          {makeupSettings[category as keyof MakeupSettings].color}
                        </span>
                      </div>
                    </div>

                    {/* Intensity */}
                    <div>
                      <label className="text-sm text-gray-300 mb-2 block">
                        Intensity ({makeupSettings[category as keyof MakeupSettings].intensity}%)
                      </label>
                      <Slider
                        value={[makeupSettings[category as keyof MakeupSettings].intensity]}
                        onValueChange={(value) =>
                          updateMakeupSetting(category as keyof MakeupSettings, "intensity", value[0])
                        }
                        max={100}
                        step={5}
                        className="w-full"
                      />
                    </div>

                    {/* Eyeliner thickness */}
                    {category === "eyeliner" && (
                      <div>
                        <label className="text-sm text-gray-300 mb-2 block">
                          Thickness ({(makeupSettings.eyeliner as any).thickness}px)
                        </label>
                        <Slider
                          value={[(makeupSettings.eyeliner as any).thickness]}
                          onValueChange={(value) => updateMakeupSetting("eyeliner", "thickness", value[0])}
                          min={1}
                          max={5}
                          step={1}
                          className="w-full"
                        />
                      </div>
                    )}
                  </>
                )}
              </TabsContent>
            ))}
          </Tabs>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={clearAllMakeup}
              variant="outline"
              className="flex-1 border-red-400/50 text-red-300 hover:bg-red-500/20 bg-transparent"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Clear All
            </Button>
            <Button
              onClick={applyMakeup}
              disabled={!isActive || isProcessing}
              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              {isProcessing ? (
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="mr-2 h-4 w-4" />
              )}
              {isProcessing ? "Processing..." : "Apply Look"}
            </Button>
          </div>

          {/* Active Makeup Summary */}
          {Object.values(makeupSettings).some((setting) => setting.enabled) && (
            <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-xl p-4 border border-green-400/20">
              <h4 className="font-semibold text-green-300 mb-2">Active Makeup</h4>
              <div className="flex flex-wrap gap-2">
                {Object.entries(makeupSettings)
                  .filter(([_, setting]) => setting.enabled)
                  .map(([category, setting]) => (
                    <Badge
                      key={category}
                      variant="secondary"
                      className="bg-green-500/20 text-green-300 border-green-400/30"
                    >
                      <div
                        className="w-3 h-3 rounded-full mr-2 border border-white/20"
                        style={{ backgroundColor: setting.color }}
                      />
                      {category} ({setting.intensity}%)
                    </Badge>
                  ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
