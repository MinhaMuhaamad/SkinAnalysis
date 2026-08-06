"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Progress } from "@/components/ui/progress"
import {
  Palette,
  Sparkles,
  Eye,
  Smile,
  Heart,
  Video,
  VideoOff,
  RefreshCw,
  Camera,
  Download,
  RotateCcw,
  Sliders,
  Brush,
  Droplets,
  AlertCircle,
  CheckCircle,
  HelpCircle,
  EyeOff,
  User
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface MakeupSettings {
  lipstick: { enabled: boolean; color: string; intensity: number }
  eyeshadow: { enabled: boolean; color: string; intensity: number }
  blush: { enabled: boolean; color: string; intensity: number }
  foundation: { enabled: boolean; color: string; intensity: number }
  eyeliner: { enabled: boolean; color: string; intensity: number; thickness: number }
  eyebrow: { enabled: boolean; color: string; intensity: number }
}

interface CameraDevice {
  deviceId: string
  label: string
}

export default function VirtualTryOnPage() {
  const { toast } = useToast()
  
  // Camera & Stream State
  const [isActive, setIsActive] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [devices, setDevices] = useState<CameraDevice[]>([])
  const [selectedDeviceId, setSelectedDeviceId] = useState("")
  const [permissionState, setPermissionState] = useState<"prompt" | "granted" | "denied">("prompt")
  const [stream, setStream] = useState<MediaStream | null>(null)
  
  // Processing & Rendering State
  const [isProcessing, setIsProcessing] = useState(false)
  const [processedImage, setProcessedImage] = useState<string | null>(null)
  const [viewOriginal, setViewOriginal] = useState(false)
  const [autoApply, setAutoApply] = useState(false)
  
  // Profile & Recommended Colors State
  const [hasRecommendedColors, setHasRecommendedColors] = useState(false)
  const [recommendedColors, setRecommendedColors] = useState<{
    foundation?: string
    blush?: string
    lipstick?: string
    eyeshadow?: string
  } | null>(null)

  // Makeup Settings State
  const [makeupSettings, setMakeupSettings] = useState<MakeupSettings>({
    lipstick: { enabled: false, color: "#DC143C", intensity: 80 },
    eyeshadow: { enabled: false, color: "#8B7355", intensity: 60 },
    blush: { enabled: false, color: "#FFB6C1", intensity: 40 },
    foundation: { enabled: false, color: "#E8C5A0", intensity: 30 },
    eyeliner: { enabled: false, color: "#000000", intensity: 90, thickness: 2 },
    eyebrow: { enabled: false, color: "#8B4513", intensity: 50 },
  })

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const autoApplyIntervalRef = useRef<NodeJS.Timeout>()
  const lastProcessTimeRef = useRef<number>(0)

  // Makeup Color Palettes
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
    ],
    eyeshadow: [
      { name: "Neutral Brown", color: "#8B7355" },
      { name: "Chocolate", color: "#7B3F00" },
      { name: "Gold Shimmer", color: "#FFD700" },
      { name: "Bronze", color: "#CD7F32" },
      { name: "Silver", color: "#C0C0C0" },
      { name: "Smoky Gray", color: "#2F2F2F" },
    ],
    blush: [
      { name: "Natural Pink", color: "#FFB6C1" },
      { name: "Coral Warm", color: "#FF7F50" },
      { name: "Peach Soft", color: "#FFCCCB" },
      { name: "Rose Classic", color: "#FF69B4" },
    ],
    foundation: [
      { name: "Porcelain", color: "#F5E6D3" },
      { name: "Ivory", color: "#FFFFF0" },
      { name: "Light Beige", color: "#F5F5DC" },
      { name: "Medium Beige", color: "#E8C5A0" },
      { name: "Medium Tan", color: "#D4A574" },
      { name: "Deep Bronze", color: "#8B4513" },
    ],
    eyeliner: [
      { name: "Classic Black", color: "#000000" },
      { name: "Soft Brown", color: "#8B4513" },
      { name: "Navy Blue", color: "#000080" },
      { name: "Emerald Green", color: "#50C878" },
    ],
    eyebrow: [
      { name: "Light Brown", color: "#A0522D" },
      { name: "Medium Brown", color: "#8B4513" },
      { name: "Dark Brown", color: "#654321" },
      { name: "Soft Black", color: "#2F2F2F" },
    ],
  }

  const presetLooks = [
    {
      name: "Natural",
      icon: Heart,
      settings: {
        foundation: { enabled: true, color: "#F5F5DC", intensity: 25 },
        blush: { enabled: true, color: "#FFB6C1", intensity: 20 },
        lipstick: { enabled: true, color: "#F8BBD9", intensity: 30 },
        eyebrow: { enabled: true, color: "#8B4513", intensity: 30 },
        eyeshadow: { enabled: false },
        eyeliner: { enabled: false },
      },
    },
    {
      name: "Glamorous",
      icon: Sparkles,
      settings: {
        foundation: { enabled: true, color: "#E8C5A0", intensity: 45 },
        eyeshadow: { enabled: true, color: "#2F2F2F", intensity: 75 },
        eyeliner: { enabled: true, color: "#000000", intensity: 90, thickness: 3 },
        blush: { enabled: true, color: "#FF69B4", intensity: 45 },
        lipstick: { enabled: true, color: "#DC143C", intensity: 85 },
        eyebrow: { enabled: true, color: "#2F2F2F", intensity: 60 },
      },
    },
    {
      name: "Professional",
      icon: Eye,
      settings: {
        foundation: { enabled: true, color: "#E8C5A0", intensity: 35 },
        eyeshadow: { enabled: true, color: "#8B7355", intensity: 40 },
        blush: { enabled: true, color: "#FFCCCB", intensity: 30 },
        lipstick: { enabled: true, color: "#FF7F50", intensity: 50 },
        eyebrow: { enabled: true, color: "#8B4513", intensity: 40 },
        eyeliner: { enabled: false },
      },
    },
    {
      name: "Evening",
      icon: Smile,
      settings: {
        foundation: { enabled: true, color: "#E8C5A0", intensity: 45 },
        eyeshadow: { enabled: true, color: "#663399", intensity: 80 },
        eyeliner: { enabled: true, color: "#000000", intensity: 95, thickness: 2 },
        blush: { enabled: true, color: "#FF69B4", intensity: 45 },
        lipstick: { enabled: true, color: "#8B008B", intensity: 90 },
        eyebrow: { enabled: true, color: "#2F2F2F", intensity: 50 },
      },
    },
  ]

  // Check camera permissions and load devices
  const checkPermissions = useCallback(async () => {
    try {
      const devicesList = await navigator.mediaDevices.enumerateDevices()
      const cameras = devicesList
        .filter((d) => d.kind === "videoinput")
        .map((d) => ({ deviceId: d.deviceId, label: d.label || `Camera ${d.deviceId.slice(0, 8)}` }))
      
      setDevices(cameras)
      if (cameras.length > 0 && !selectedDeviceId) {
        setSelectedDeviceId(cameras[0].deviceId)
      }
    } catch (err) {
      console.error("Error checking camera devices:", err)
    }
  }, [selectedDeviceId])

  // Get user's skin recommendations if logged in
  useEffect(() => {
    const fetchRecommendations = async () => {
      const token = localStorage.getItem("authToken")
      if (!token) return

      try {
        const response = await fetch("/api/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        if (response.ok) {
          const data = await response.json()
          if (data.success && data.user && data.user.skinAnalyses?.length > 0) {
            // Find latest analysis
            const latest = data.user.skinAnalyses[data.user.skinAnalyses.length - 1]
            
            // Map recommendations to color shades
            const lipstickRec = latest.recommendations.lipsticks?.[0]
            const eyeshadowRec = latest.recommendations.eyeshadows?.[0]
            
            // Extract hex code or fallback
            const mapColor = (text: string) => {
              if (!text) return undefined
              if (text.toLowerCase().includes("coral")) return "#FF7F50"
              if (text.toLowerCase().includes("rose")) return "#FF69B4"
              if (text.toLowerCase().includes("berry")) return "#8B008B"
              if (text.toLowerCase().includes("red")) return "#DC143C"
              if (text.toLowerCase().includes("mauve")) return "#9370DB"
              if (text.toLowerCase().includes("nude")) return "#F8BBD9"
              if (text.toLowerCase().includes("bronze")) return "#CD7F32"
              if (text.toLowerCase().includes("gold")) return "#FFD700"
              if (text.toLowerCase().includes("taupe")) return "#8B7355"
              return undefined
            }

            const mapFoundation = (tone: string) => {
              if (!tone) return undefined
              if (tone.toLowerCase().includes("fair")) return "#F5E6D3"
              if (tone.toLowerCase().includes("light")) return "#F5F5DC"
              if (tone.toLowerCase().includes("medium")) return "#E8C5A0"
              if (tone.toLowerCase().includes("deep")) return "#8B4513"
              return undefined
            }

            setRecommendedColors({
              lipstick: mapColor(lipstickRec),
              eyeshadow: mapColor(eyeshadowRec),
              foundation: mapFoundation(latest.skinTone),
              blush: latest.undertone === "Warm" ? "#FF7F50" : "#FFB6C1",
            })
            setHasRecommendedColors(true)
          }
        }
      } catch (err) {
        console.error("Error fetching recommended shades:", err)
      }
    }

    fetchRecommendations()
    checkPermissions()
  }, [checkPermissions])

  // Start Camera
  const startCamera = async () => {
    setIsLoading(true)
    try {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
      }

      const constraints: MediaStreamConstraints = {
        video: selectedDeviceId ? { deviceId: { exact: selectedDeviceId } } : { facingMode: "user" },
        audio: false,
      }

      const newStream = await navigator.mediaDevices.getUserMedia(constraints)
      setStream(newStream)
      if (videoRef.current) {
        videoRef.current.srcObject = newStream
      }
      setIsActive(true)
      setPermissionState("granted")
    } catch (err: any) {
      console.error("Camera start failed:", err)
      setPermissionState("denied")
      toast({
        title: "Camera Permission Required",
        description: "Please allow camera permissions in your browser to use the Virtual Try-On.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Stop Camera
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
    }
    setStream(null)
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    setIsActive(false)
    setProcessedImage(null)
  }

  // Preset Look Loader
  const applyPreset = (preset: any) => {
    setMakeupSettings((prev) => {
      const nextSettings = { ...prev }
      Object.keys(prev).forEach((key) => {
        const k = key as keyof MakeupSettings
        if (preset.settings[k]) {
          nextSettings[k] = {
            ...nextSettings[k],
            enabled: preset.settings[k].enabled,
            color: preset.settings[k].color || nextSettings[k].color,
            intensity: preset.settings[k].intensity || nextSettings[k].intensity,
          }
          if (k === "eyeliner" && preset.settings.eyeliner.thickness) {
            ;(nextSettings.eyeliner as any).thickness = preset.settings.eyeliner.thickness
          }
        } else {
          nextSettings[k].enabled = false
        }
      })
      return nextSettings
    })
    
    toast({
      title: `${preset.name} Look Applied! 💄`,
      description: "Makeup controls have been loaded with preset parameters.",
    })
  }

  // Apply User's Recommended shades
  const applyAIRecommendations = () => {
    if (!recommendedColors) return

    setMakeupSettings((prev) => ({
      ...prev,
      foundation: {
        enabled: !!recommendedColors.foundation,
        color: recommendedColors.foundation || prev.foundation.color,
        intensity: 30,
      },
      blush: {
        enabled: !!recommendedColors.blush,
        color: recommendedColors.blush || prev.blush.color,
        intensity: 40,
      },
      lipstick: {
        enabled: !!recommendedColors.lipstick,
        color: recommendedColors.lipstick || prev.lipstick.color,
        intensity: 75,
      },
      eyeshadow: {
        enabled: !!recommendedColors.eyeshadow,
        color: recommendedColors.eyeshadow || prev.eyeshadow.color,
        intensity: 55,
      },
    }))

    toast({
      title: "AI Recommended Shades Applied! ✨",
      description: "Makeup selections have been updated to suit your analyzed skin tone.",
    })
  }

  // Capture current canvas frame
  const captureFrame = (): string | null => {
    if (!videoRef.current || !canvasRef.current || !isActive) return null

    const video = videoRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")

    if (!ctx || video.videoWidth === 0 || video.videoHeight === 0) return null

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    // Draw frame (horizontally flipped for mirroring)
    ctx.translate(canvas.width, 0)
    ctx.scale(-1, 1)
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    ctx.setTransform(1, 0, 0, 1, 0, 0) // reset transform

    return canvas.toDataURL("image/jpeg", 0.9)
  }

  // Apply Makeup Backend Connection
  const applyMakeup = async () => {
    if (!isActive || isProcessing) return

    const imageData = captureFrame()
    if (!imageData) {
      toast({
        title: "Webcam Capture Failed",
        description: "Could not capture image from webcam. Please make sure the camera is running.",
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
        throw new Error(`HTTP Error ${response.status}`)
      }

      const result = await response.json()

      if (result.success) {
        setProcessedImage(result.processed_image)
        setViewOriginal(false)
      } else {
        throw new Error(result.error || "Failed to process makeup overlay")
      }
    } catch (err: any) {
      console.error("Makeup engine failed:", err)
      toast({
        title: "Makeup Application Failed",
        description: err.message || "An error occurred in the AI processing engine.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  // Auto Apply loop logic
  useEffect(() => {
    if (autoApply && isActive) {
      autoApplyIntervalRef.current = setInterval(() => {
        const now = Date.now()
        // Throttle apply requests to once every 2 seconds
        if (now - lastProcessTimeRef.current >= 2000 && !isProcessing) {
          lastProcessTimeRef.current = now
          applyMakeup()
        }
      }, 1000)
    } else {
      if (autoApplyIntervalRef.current) {
        clearInterval(autoApplyIntervalRef.current)
      }
    }

    return () => {
      if (autoApplyIntervalRef.current) {
        clearInterval(autoApplyIntervalRef.current)
      }
    }
  }, [autoApply, isActive, makeupSettings, isProcessing])

  // Update Settings
  const updateMakeupSetting = (category: keyof MakeupSettings, property: string, value: any) => {
    setMakeupSettings((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [property]: value,
      },
    }))
  }

  // Toggle categories
  const toggleCategory = (category: keyof MakeupSettings) => {
    setMakeupSettings((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        enabled: !prev[category].enabled,
      },
    }))
  }

  // Reset Look
  const resetAllMakeup = () => {
    setMakeupSettings({
      lipstick: { enabled: false, color: "#DC143C", intensity: 80 },
      eyeshadow: { enabled: false, color: "#8B7355", intensity: 60 },
      blush: { enabled: false, color: "#FFB6C1", intensity: 40 },
      foundation: { enabled: false, color: "#E8C5A0", intensity: 30 },
      eyeliner: { enabled: false, color: "#000000", intensity: 90, thickness: 2 },
      eyebrow: { enabled: false, color: "#8B4513", intensity: 50 },
    })
    setProcessedImage(null)
    toast({
      title: "Makeup Cleared 🧼",
      description: "All makeup overlay settings have been reset.",
    })
  }

  // Download Image
  const downloadLook = () => {
    if (!processedImage) return
    const link = document.createElement("a")
    link.download = `makeupai-look-${Date.now()}.jpg`
    link.href = processedImage
    link.click()
    toast({
      title: "Image Downloaded! 📱",
      description: "Your Virtual Try-On photo has been saved to your device.",
    })
  }

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (autoApplyIntervalRef.current) {
        clearInterval(autoApplyIntervalRef.current)
      }
    }
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white relative z-0">
      {/* Background Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-[-1]">
        <div className="absolute top-24 left-1/4 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-24 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="container mx-auto px-6 py-12">
        <div className="max-w-7xl mx-auto space-y-8">
          
          {/* Header */}
          <div className="text-center space-y-4">
            <Badge variant="outline" className="border-pink-500/30 text-pink-300 bg-pink-500/5 px-3 py-1 text-sm font-semibold">
              <Sparkles className="w-4 h-4 mr-2 text-pink-400 inline" />
              Real-Time Virtual Mirror
            </Badge>
            <h1 className="text-5xl font-black tracking-tight bg-gradient-to-r from-pink-400 via-rose-300 to-purple-400 bg-clip-text text-transparent">
              Virtual Try-On Studio
            </h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Real-time professional makeup try-on powered by Python MediaPipe FaceMesh algorithms.
            </p>
          </div>

          {/* AI Suggestions Callout */}
          {hasRecommendedColors && (
            <div className="p-4 bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-rose-500/10 rounded-2xl border border-pink-500/20 max-w-3xl mx-auto flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-pink-500 to-purple-500 rounded-xl text-white">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-white">Custom Shades Loaded!</h4>
                  <p className="text-xs text-gray-400">Recommended colors match your latest AI skin analysis.</p>
                </div>
              </div>
              <Button 
                onClick={applyAIRecommendations}
                className="bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold hover:opacity-95 transition-all text-xs"
              >
                Apply AI Recommended Shades
              </Button>
            </div>
          )}

          {/* Grid Workspace */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            
            {/* Left: Camera / Mirror Display */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 border border-white/10 backdrop-blur-xl shadow-2xl overflow-hidden rounded-2xl">
                <CardHeader className="border-b border-white/5 bg-black/20">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <CardTitle className="text-xl flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-pink-500 animate-ping"></div>
                      {processedImage && !viewOriginal ? "Virtual Preview Active" : "Live Camera Stream"}
                    </CardTitle>
                    {isActive && (
                      <div className="flex items-center gap-2">
                        {processedImage && (
                          <Button
                            onMouseDown={() => setViewOriginal(true)}
                            onMouseUp={() => setViewOriginal(false)}
                            onTouchStart={() => setViewOriginal(true)}
                            onTouchEnd={() => setViewOriginal(false)}
                            variant="outline"
                            size="sm"
                            className="border-white/20 text-xs hover:bg-white/10"
                            title="Hold to see original face"
                          >
                            <EyeOff className="w-3.5 h-3.5 mr-1" />
                            Hold for Before
                          </Button>
                        )}
                        <select
                          value={selectedDeviceId}
                          onChange={(e) => {
                            setSelectedDeviceId(e.target.value)
                            if (isActive) setTimeout(startCamera, 100)
                          }}
                          className="bg-gray-800 border border-white/10 rounded-lg px-2 py-1 text-xs text-white"
                        >
                          {devices.map((d) => (
                            <option key={d.deviceId} value={d.deviceId}>
                              {d.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent className="p-0 relative aspect-video bg-black flex items-center justify-center">
                  
                  {/* Camera Video Stream */}
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className={`w-full h-full object-cover ${
                      isActive && (!processedImage || viewOriginal) ? "block" : "hidden"
                    }`}
                    style={{ transform: "scaleX(-1)" }}
                  />

                  {/* Processed Makeup Output */}
                  {processedImage && !viewOriginal && (
                    <img
                      src={processedImage || "/placeholder.svg"}
                      alt="Makeup Try-On"
                      className="w-full h-full object-cover"
                    />
                  )}

                  {/* Inactive Overlay */}
                  {!isActive && !isLoading && (
                    <div className="text-center p-8 space-y-6">
                      <div className="w-24 h-24 bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded-full flex items-center justify-center mx-auto shadow-inner border border-white/10">
                        <Video className="w-12 h-12 text-pink-400" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-2xl font-bold">Start Try-On Mirror</h3>
                        <p className="text-gray-400 text-sm max-w-sm">
                          Permissions will be requested. All face processing is secure and runs locally.
                        </p>
                      </div>
                      <Button
                        onClick={startCamera}
                        className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 font-bold px-8 py-5 rounded-xl shadow-lg shadow-pink-500/20"
                      >
                        Start Camera
                      </Button>
                    </div>
                  )}

                  {/* Loading camera state */}
                  {isLoading && (
                    <div className="space-y-4 text-center">
                      <RefreshCw className="w-12 h-12 text-pink-400 animate-spin mx-auto" />
                      <p className="text-gray-400">Loading webcam source...</p>
                    </div>
                  )}

                  {/* Processing Makeup Overlay overlay */}
                  {isProcessing && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center space-y-4">
                      <RefreshCw className="w-10 h-10 text-pink-500 animate-spin" />
                      <p className="text-pink-300 font-medium tracking-wide">Applying AI Makeup Layer...</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Mirror Actions */}
              {isActive && (
                <div className="flex gap-4 flex-wrap">
                  <Button
                    onClick={applyMakeup}
                    disabled={isProcessing}
                    className="flex-1 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 font-bold py-6 rounded-xl shadow-lg"
                  >
                    <Brush className="w-5 h-5 mr-2" />
                    Apply Makeup Look
                  </Button>
                  
                  {processedImage && (
                    <Button
                      onClick={downloadLook}
                      variant="outline"
                      className="border-white/10 hover:bg-white/10 font-bold py-6 px-6 rounded-xl"
                    >
                      <Download className="w-5 h-5" />
                    </Button>
                  )}

                  <Button
                    onClick={stopCamera}
                    variant="outline"
                    className="border-red-500/30 text-red-400 hover:bg-red-500/10 font-bold py-6 px-6 rounded-xl"
                  >
                    <VideoOff className="w-5 h-5" />
                  </Button>
                </div>
              )}
            </div>

            {/* Right: Controls & Adjustments */}
            <div className="space-y-6">
              
              {/* Presets Card */}
              <Card className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 border border-white/10 backdrop-blur-xl shadow-2xl">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Palette className="w-5 h-5 text-purple-400" />
                    Preset Looks
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-3">
                  {presetLooks.map((look) => (
                    <Button
                      key={look.name}
                      onClick={() => applyPreset(look)}
                      variant="outline"
                      className="border-white/5 hover:border-pink-500/30 hover:bg-pink-500/5 h-auto py-3 px-4 flex flex-col items-center gap-2 rounded-xl group transition-all duration-300"
                    >
                      <look.icon className="w-5 h-5 text-purple-300 group-hover:scale-110 transition-transform" />
                      <span className="text-xs font-semibold text-gray-300">{look.name}</span>
                    </Button>
                  ))}
                </CardContent>
              </Card>

              {/* Sliders Control Card */}
              <Card className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 border border-white/10 backdrop-blur-xl shadow-2xl">
                <CardHeader className="flex justify-between items-start flex-wrap gap-2 border-b border-white/5">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Sliders className="w-5 h-5 text-pink-400" />
                      Makeup Controls
                    </CardTitle>
                    <CardDescription className="text-gray-400">Eneble features and adjust intensity</CardDescription>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400">Auto Apply:</span>
                      <Switch checked={autoApply} onCheckedChange={setAutoApply} disabled={!isActive} />
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-6">
                  <Tabs defaultValue="lipstick" className="w-full">
                    <TabsList className="grid grid-cols-3 gap-2 bg-black/35 p-1 rounded-xl mb-6">
                      <TabsTrigger value="lipstick" className="text-xs rounded-lg">Lips</TabsTrigger>
                      <TabsTrigger value="eyeshadow" className="text-xs rounded-lg">Eyes</TabsTrigger>
                      <TabsTrigger value="blush" className="text-xs rounded-lg">Blush</TabsTrigger>
                      <TabsTrigger value="foundation" className="text-xs rounded-lg">Base</TabsTrigger>
                      <TabsTrigger value="eyeliner" className="text-xs rounded-lg">Liner</TabsTrigger>
                      <TabsTrigger value="eyebrow" className="text-xs rounded-lg">Brows</TabsTrigger>
                    </TabsList>

                    {/* Loop tab contents */}
                    {Object.keys(makeupSettings).map((categoryKey) => {
                      const cat = categoryKey as keyof MakeupSettings
                      const settings = makeupSettings[cat]
                      return (
                        <TabsContent key={cat} value={cat} className="space-y-5">
                          <div className="flex items-center justify-between">
                            <h4 className="font-bold text-white capitalize text-sm">{cat} Accent</h4>
                            <Switch
                              checked={settings.enabled}
                              onCheckedChange={() => toggleCategory(cat)}
                            />
                          </div>

                          {settings.enabled ? (
                            <>
                              {/* Color Picker */}
                              <div className="space-y-2">
                                <label className="text-xs text-gray-400">Color Palette</label>
                                <div className="grid grid-cols-6 gap-2">
                                  {makeupColors[cat as keyof typeof makeupColors]?.map((item) => (
                                    <button
                                      key={item.color}
                                      onClick={() => updateMakeupSetting(cat, "color", item.color)}
                                      className={`w-7 h-7 rounded-full border-2 transition-all ${
                                        settings.color === item.color
                                          ? "border-white scale-110 shadow-lg"
                                          : "border-transparent hover:border-gray-500"
                                      }`}
                                      style={{ backgroundColor: item.color }}
                                      title={item.name}
                                    />
                                  ))}
                                </div>
                                
                                <div className="flex items-center gap-3 pt-2">
                                  <input
                                    type="color"
                                    value={settings.color}
                                    onChange={(e) => updateMakeupSetting(cat, "color", e.target.value)}
                                    className="w-8 h-8 rounded-lg cursor-pointer border border-white/20 bg-transparent"
                                  />
                                  <span className="text-xs text-gray-400 font-mono">{settings.color}</span>
                                </div>
                              </div>

                              {/* Intensity Slider */}
                              <div className="space-y-2">
                                <div className="flex justify-between text-xs">
                                  <span className="text-gray-400">Opacity / Intensity</span>
                                  <span className="text-pink-300 font-semibold">{settings.intensity}%</span>
                                </div>
                                <Slider
                                  value={[settings.intensity]}
                                  onValueChange={(val) => updateMakeupSetting(cat, "intensity", val[0])}
                                  max={100}
                                  step={5}
                                  className="py-2"
                                />
                              </div>

                              {/* Extra Eyeliner properties */}
                              {cat === "eyeliner" && (
                                <div className="space-y-2 pt-2">
                                  <div className="flex justify-between text-xs">
                                    <span className="text-gray-400">Stroke Thickness</span>
                                    <span className="text-pink-300 font-semibold">{(settings as any).thickness}px</span>
                                  </div>
                                  <Slider
                                    value={[(settings as any).thickness]}
                                    onValueChange={(val) => updateMakeupSetting("eyeliner", "thickness", val[0])}
                                    min={1}
                                    max={5}
                                    step={1}
                                    className="py-2"
                                  />
                                </div>
                              )}
                            </>
                          ) : (
                            <div className="text-center py-6 text-gray-500 border border-dashed border-white/5 rounded-xl">
                              <HelpCircle className="w-8 h-8 mx-auto mb-2 text-gray-600" />
                              <p className="text-xs">Category currently disabled.</p>
                              <p className="text-[10px] text-gray-500 mt-1">Switch toggle above to enable {cat} makeup.</p>
                            </div>
                          )}
                        </TabsContent>
                      )
                    })}
                  </Tabs>

                  {/* Clear & Save look controls */}
                  <div className="mt-8 pt-6 border-t border-white/5 flex gap-4">
                    <Button
                      onClick={resetAllMakeup}
                      variant="outline"
                      className="flex-1 border-white/10 hover:bg-white/10 text-xs font-semibold py-5 rounded-xl bg-transparent"
                    >
                      <RotateCcw className="w-3.5 h-3.5 mr-2" />
                      Clear Look
                    </Button>
                    {isActive && (
                      <Button
                        onClick={applyMakeup}
                        disabled={isProcessing}
                        className="flex-1 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-xs font-semibold py-5 rounded-xl"
                      >
                        Apply Setup
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

            </div>
          </div>

        </div>
      </div>
      
      {/* Hidden canvas for capturing video stream frames */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}
