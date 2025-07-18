"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Camera, Video, Palette, Eye, Smile, Sparkles, Download, VideoOff, RotateCcw, Zap } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"

interface MakeupOption {
  id: string
  name: string
  category: "foundation" | "eyeshadow" | "lipstick" | "blush" | "eyeliner"
  color: string
  intensity: number
}

export default function VirtualTryOnPage() {
  const [isWebcamActive, setIsWebcamActive] = useState(false)
  const [selectedMakeup, setSelectedMakeup] = useState<MakeupOption[]>([])
  const [currentCategory, setCurrentCategory] = useState<string>("foundation")
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [isCapturing, setIsCapturing] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
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

  const startWebcam = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user",
        },
        audio: false,
      })

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play()
        }
        setStream(mediaStream)
        setIsWebcamActive(true)
        toast({
          title: "Camera activated! 📸",
          description: "You can now try on makeup virtually!",
        })
      }
    } catch (error) {
      console.error("Camera access error:", error)
      toast({
        title: "Camera access denied",
        description: "Please allow camera access to use virtual try-on.",
        variant: "destructive",
      })
    }
  }, [toast])

  const stopWebcam = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
      setStream(null)
      setIsWebcamActive(false)
      if (videoRef.current) {
        videoRef.current.srcObject = null
      }
      toast({
        title: "Camera stopped",
        description: "Camera has been turned off.",
      })
    }
  }, [stream, toast])

  const capturePhoto = useCallback(() => {
    if (canvasRef.current && videoRef.current && isWebcamActive) {
      setIsCapturing(true)
      const canvas = canvasRef.current
      const video = videoRef.current
      const ctx = canvas.getContext("2d")

      if (ctx) {
        // Set canvas dimensions to match video
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight

        // Draw the current video frame
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

        // Apply makeup effects (simplified version)
        selectedMakeup.forEach((makeup) => {
          ctx.globalAlpha = makeup.intensity / 100
          ctx.fillStyle = makeup.color

          // Simple makeup application based on category
          switch (makeup.category) {
            case "foundation":
              ctx.fillRect(canvas.width * 0.2, canvas.height * 0.3, canvas.width * 0.6, canvas.height * 0.5)
              break
            case "lipstick":
              ctx.fillRect(canvas.width * 0.4, canvas.height * 0.65, canvas.width * 0.2, canvas.height * 0.08)
              break
            case "blush":
              ctx.beginPath()
              ctx.arc(canvas.width * 0.3, canvas.height * 0.5, 30, 0, 2 * Math.PI)
              ctx.fill()
              ctx.beginPath()
              ctx.arc(canvas.width * 0.7, canvas.height * 0.5, 30, 0, 2 * Math.PI)
              ctx.fill()
              break
          }
          ctx.globalAlpha = 1
        })

        // Convert to image
        const imageDataUrl = canvas.toDataURL("image/png")
        setCapturedImage(imageDataUrl)

        setTimeout(() => setIsCapturing(false), 500)

        toast({
          title: "Photo captured! ✨",
          description: "Your makeup look has been saved.",
        })
      }
    }
  }, [isWebcamActive, selectedMakeup, toast])

  const downloadPhoto = useCallback(() => {
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
  }, [capturedImage, toast])

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

  useEffect(() => {
    return () => {
      stopWebcam()
    }
  }, [stopWebcam])

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 z-0">
        <video autoPlay muted loop playsInline className="w-full h-full object-cover opacity-20">
          <source src="/placeholder-video.mp4" type="video/mp4" />
        </video>
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
              <span className="bg-gradient-to-r from-cyan-300 via-purple-300 to-pink-300 bg-clip-text text-transparent animate-gradient-x">
                Virtual Try-On
              </span>
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Experience the future of beauty with real-time makeup application using advanced AR technology
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Camera Section */}
            <div className="lg:col-span-2">
              <Card className="bg-gradient-to-br from-gray-900/80 to-black/80 border border-purple-400/20 backdrop-blur-xl shadow-2xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-2xl">
                    <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-lg">
                      <Video className="h-6 w-6 text-white" />
                    </div>
                    Live Camera Feed
                  </CardTitle>
                  <CardDescription className="text-gray-400 text-base">
                    Your virtual makeup mirror with real-time effects
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="relative bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl overflow-hidden aspect-video border border-purple-400/20">
                    {isWebcamActive ? (
                      <>
                        <video
                          ref={videoRef}
                          autoPlay
                          playsInline
                          muted
                          className="w-full h-full object-cover rounded-2xl"
                        />
                        <canvas ref={canvasRef} className="hidden" />

                        {/* Makeup overlay indicators */}
                        <div className="absolute top-4 left-4 space-y-2 max-w-xs">
                          {selectedMakeup.map((makeup) => (
                            <Badge
                              key={makeup.id}
                              variant="secondary"
                              className="bg-black/60 text-white border border-white/20 backdrop-blur-sm"
                            >
                              <div
                                className="w-3 h-3 rounded-full mr-2"
                                style={{ backgroundColor: makeup.color }}
                              ></div>
                              {makeup.name}
                            </Badge>
                          ))}
                        </div>

                        {/* Capture effect overlay */}
                        {isCapturing && <div className="absolute inset-0 bg-white/30 rounded-2xl animate-pulse"></div>}

                        {/* Face detection overlay (placeholder) */}
                        <div className="absolute inset-0 pointer-events-none">
                          <div className="absolute top-1/4 left-1/3 w-1/3 h-1/2 border-2 border-cyan-400/50 rounded-full animate-pulse"></div>
                        </div>
                      </>
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center space-y-6">
                          <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto shadow-2xl">
                            <Camera className="h-12 w-12 text-white" />
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-white mb-2">Ready to Transform?</p>
                            <p className="text-gray-400 text-lg">Click to start your camera and begin the magic</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-4">
                    {!isWebcamActive ? (
                      <Button
                        onClick={startWebcam}
                        className="bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 hover:from-purple-600 hover:via-pink-600 hover:to-rose-600 px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-purple-500/25 transition-all duration-300"
                      >
                        <Camera className="mr-3 h-5 w-5" />
                        Start Camera
                      </Button>
                    ) : (
                      <>
                        <Button
                          onClick={stopWebcam}
                          variant="outline"
                          className="border-red-400/50 text-red-300 hover:bg-red-500/20 hover:border-red-400 bg-transparent"
                        >
                          <VideoOff className="mr-2 h-4 w-4" />
                          Stop Camera
                        </Button>
                        <Button
                          onClick={capturePhoto}
                          className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
                          disabled={isCapturing}
                        >
                          <Camera className="mr-2 h-4 w-4" />
                          {isCapturing ? "Capturing..." : "Capture Photo"}
                        </Button>
                        {capturedImage && (
                          <Button
                            onClick={downloadPhoto}
                            variant="outline"
                            className="border-green-400/50 text-green-300 hover:bg-green-500/20 hover:border-green-400 bg-transparent"
                          >
                            <Download className="mr-2 h-4 w-4" />
                            Download
                          </Button>
                        )}
                        <Button
                          onClick={clearAllMakeup}
                          variant="outline"
                          className="border-orange-400/50 text-orange-300 hover:bg-orange-500/20 hover:border-orange-400 bg-transparent"
                        >
                          <RotateCcw className="mr-2 h-4 w-4" />
                          Clear All
                        </Button>
                      </>
                    )}
                  </div>

                  {/* Captured Image Preview */}
                  {capturedImage && (
                    <div className="mt-6">
                      <h3 className="text-lg font-semibold text-white mb-3">Latest Capture</h3>
                      <div className="relative w-48 h-36 rounded-xl overflow-hidden border border-purple-400/20">
                        <Image
                          src={capturedImage || "/placeholder.svg"}
                          alt="Captured makeup look"
                          fill
                          className="object-cover"
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Makeup Controls */}
            <div className="space-y-6">
              <Card className="bg-gradient-to-br from-gray-900/80 to-black/80 border border-cyan-400/20 backdrop-blur-xl shadow-2xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-2xl">
                    <div className="p-2 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl shadow-lg">
                      <Palette className="h-6 w-6 text-white" />
                    </div>
                    Makeup Studio
                  </CardTitle>
                  <CardDescription className="text-gray-400 text-base">
                    Choose and customize your perfect look
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs value={currentCategory} onValueChange={setCurrentCategory}>
                    <TabsList className="grid w-full grid-cols-3 bg-gray-800/50 border border-gray-600/30">
                      <TabsTrigger
                        value="foundation"
                        className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500 text-xs"
                      >
                        Base
                      </TabsTrigger>
                      <TabsTrigger
                        value="eyeshadow"
                        className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 text-xs"
                      >
                        Eyes
                      </TabsTrigger>
                      <TabsTrigger
                        value="lipstick"
                        className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-rose-500 data-[state=active]:to-pink-500 text-xs"
                      >
                        Lips
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="foundation" className="space-y-6 mt-6">
                      <div className="space-y-4">
                        <h4 className="font-semibold flex items-center gap-2 text-lg">
                          <Sparkles className="h-5 w-5 text-orange-400" />
                          Foundation Shades
                        </h4>
                        <div className="grid grid-cols-2 gap-3">
                          {makeupOptions.foundation.map((option) => (
                            <div
                              key={option.id}
                              className="p-3 bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl border border-gray-600/30 hover:border-orange-400/50 cursor-pointer transition-all duration-300 hover:scale-105"
                              onClick={() => applyMakeup(option, "foundation")}
                            >
                              <div className="flex items-center gap-3">
                                <div
                                  className="w-8 h-8 rounded-full border-2 border-white/20 shadow-lg"
                                  style={{ backgroundColor: option.color }}
                                />
                                <span className="text-sm font-medium text-white">{option.name}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h4 className="font-semibold text-lg text-pink-300">Blush Colors</h4>
                        <div className="grid grid-cols-2 gap-3">
                          {makeupOptions.blush.map((option) => (
                            <div
                              key={option.id}
                              className="p-3 bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl border border-gray-600/30 hover:border-pink-400/50 cursor-pointer transition-all duration-300 hover:scale-105"
                              onClick={() => applyMakeup(option, "blush")}
                            >
                              <div className="flex items-center gap-3">
                                <div
                                  className="w-8 h-8 rounded-full border-2 border-white/20 shadow-lg"
                                  style={{ backgroundColor: option.color }}
                                />
                                <span className="text-sm font-medium text-white">{option.name}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="eyeshadow" className="space-y-6 mt-6">
                      <div className="space-y-4">
                        <h4 className="font-semibold flex items-center gap-2 text-lg">
                          <Eye className="h-5 w-5 text-purple-400" />
                          Eyeshadow Palette
                        </h4>
                        <div className="grid grid-cols-2 gap-3">
                          {makeupOptions.eyeshadow.map((option) => (
                            <div
                              key={option.id}
                              className="p-3 bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl border border-gray-600/30 hover:border-purple-400/50 cursor-pointer transition-all duration-300 hover:scale-105"
                              onClick={() => applyMakeup(option, "eyeshadow")}
                            >
                              <div className="flex items-center gap-3">
                                <div
                                  className="w-8 h-8 rounded-full border-2 border-white/20 shadow-lg"
                                  style={{ backgroundColor: option.color }}
                                />
                                <span className="text-sm font-medium text-white">{option.name}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h4 className="font-semibold text-lg text-cyan-300">Eyeliner Styles</h4>
                        <div className="grid grid-cols-2 gap-3">
                          {makeupOptions.eyeliner.map((option) => (
                            <div
                              key={option.id}
                              className="p-3 bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl border border-gray-600/30 hover:border-cyan-400/50 cursor-pointer transition-all duration-300 hover:scale-105"
                              onClick={() => applyMakeup(option, "eyeliner")}
                            >
                              <div className="flex items-center gap-3">
                                <div
                                  className="w-8 h-8 rounded-full border-2 border-white/20 shadow-lg"
                                  style={{ backgroundColor: option.color }}
                                />
                                <span className="text-sm font-medium text-white">{option.name}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="lipstick" className="space-y-6 mt-6">
                      <div className="space-y-4">
                        <h4 className="font-semibold flex items-center gap-2 text-lg">
                          <Smile className="h-5 w-5 text-rose-400" />
                          Lipstick Collection
                        </h4>
                        <div className="grid grid-cols-2 gap-3">
                          {makeupOptions.lipstick.map((option) => (
                            <div
                              key={option.id}
                              className="p-3 bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl border border-gray-600/30 hover:border-rose-400/50 cursor-pointer transition-all duration-300 hover:scale-105"
                              onClick={() => applyMakeup(option, "lipstick")}
                            >
                              <div className="flex items-center gap-3">
                                <div
                                  className="w-8 h-8 rounded-full border-2 border-white/20 shadow-lg"
                                  style={{ backgroundColor: option.color }}
                                />
                                <span className="text-sm font-medium text-white">{option.name}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>

              {/* Intensity Controls */}
              {selectedMakeup.length > 0 && (
                <Card className="bg-gradient-to-br from-gray-900/80 to-black/80 border border-green-400/20 backdrop-blur-xl shadow-2xl">
                  <CardHeader>
                    <CardTitle className="text-xl flex items-center gap-2">
                      <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg">
                        <Zap className="h-5 w-5 text-white" />
                      </div>
                      Intensity Controls
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {selectedMakeup.map((makeup) => (
                      <div key={makeup.id} className="space-y-3">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-4 h-4 rounded-full border border-white/20"
                              style={{ backgroundColor: makeup.color }}
                            ></div>
                            <span className="text-sm font-medium text-white">{makeup.name}</span>
                          </div>
                          <span className="text-sm text-green-300 font-semibold">{makeup.intensity}%</span>
                        </div>
                        <Slider
                          value={[makeup.intensity]}
                          onValueChange={(value) => adjustIntensity(makeup.category, value[0])}
                          max={100}
                          step={1}
                          className="w-full"
                        />
                      </div>
                    ))}
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
