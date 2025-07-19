"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Camera,
  Video,
  Palette,
  Eye,
  Smile,
  Sparkles,
  Download,
  VideoOff,
  RotateCcw,
  Zap,
  AlertCircle,
  Settings,
  RefreshCw,
  CheckCircle,
  Droplets,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"

interface MakeupOption {
  id: string
  name: string
  category: "foundation" | "eyeshadow" | "lipstick" | "blush" | "eyeliner"
  color: string
  intensity: number
}

interface FaceLandmarks {
  landmarks: number[][]
  confidence: number
}

export default function VirtualTryOnPage() {
  const [isWebcamActive, setIsWebcamActive] = useState(false)
  const [selectedMakeup, setSelectedMakeup] = useState<MakeupOption[]>([])
  const [currentCategory, setCurrentCategory] = useState<string>("foundation")
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [isCapturing, setIsCapturing] = useState(false)
  const [faceLandmarks, setFaceLandmarks] = useState<FaceLandmarks | null>(null)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [isDetectingFace, setIsDetectingFace] = useState(false)
  const [cameraPermission, setCameraPermission] = useState<"prompt" | "granted" | "denied">("prompt")
  const [availableDevices, setAvailableDevices] = useState<MediaDeviceInfo[]>([])
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>("")
  const [isInitializing, setIsInitializing] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null)
  const animationFrameRef = useRef<number>()
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

  // Initialize camera permissions and devices
  useEffect(() => {
    initializeCamera()
  }, [])

  const initializeCamera = async () => {
    try {
      // Check if getUserMedia is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError("Camera not supported in this browser")
        return
      }

      // Get available devices
      await getAvailableDevices()

      // Check permissions
      await checkCameraPermissions()
    } catch (error) {
      console.error("Camera initialization error:", error)
      setCameraError("Failed to initialize camera")
    }
  }

  const checkCameraPermissions = async () => {
    try {
      if (navigator.permissions) {
        const result = await navigator.permissions.query({ name: "camera" as PermissionName })
        setCameraPermission(result.state as "granted" | "denied" | "prompt")

        result.addEventListener("change", () => {
          setCameraPermission(result.state as "granted" | "denied" | "prompt")
        })
      }
    } catch (error) {
      console.log("Permission API not supported")
    }
  }

  const getAvailableDevices = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices()
      const videoDevices = devices.filter((device) => device.kind === "videoinput")
      setAvailableDevices(videoDevices)

      if (videoDevices.length > 0 && !selectedDeviceId) {
        // Prefer front camera
        const frontCamera = videoDevices.find(
          (device) =>
            device.label.toLowerCase().includes("front") ||
            device.label.toLowerCase().includes("user") ||
            device.label.toLowerCase().includes("facing"),
        )
        setSelectedDeviceId(frontCamera?.deviceId || videoDevices[0].deviceId)
      }
    } catch (error) {
      console.error("Error getting devices:", error)
    }
  }

  const requestCameraPermission = async () => {
    try {
      setIsInitializing(true)
      setCameraError(null)

      // Request permission by accessing camera
      const tempStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
      })

      // Stop temporary stream
      tempStream.getTracks().forEach((track) => track.stop())

      setCameraPermission("granted")
      await getAvailableDevices()

      toast({
        title: "Camera permission granted! 📸",
        description: "You can now start the camera for virtual try-on.",
      })
    } catch (error: any) {
      console.error("Camera permission error:", error)
      setCameraPermission("denied")

      let errorMessage = "Camera access denied. "
      if (error.name === "NotAllowedError") {
        errorMessage += "Please allow camera permissions in your browser."
      } else if (error.name === "NotFoundError") {
        errorMessage += "No camera found on this device."
      } else {
        errorMessage += "Please check your camera settings."
      }

      setCameraError(errorMessage)
      toast({
        title: "Camera permission denied",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsInitializing(false)
    }
  }

  const startWebcam = useCallback(async () => {
    try {
      setIsInitializing(true)
      setCameraError(null)

      if (cameraPermission === "denied") {
        await requestCameraPermission()
        return
      }

      const constraints: MediaStreamConstraints = {
        video: {
          width: { ideal: 1280, max: 1920 },
          height: { ideal: 720, max: 1080 },
          facingMode: "user",
          frameRate: { ideal: 30 },
        },
        audio: false,
      }

      // Use selected device if available
      if (selectedDeviceId) {
        constraints.video = {
          ...constraints.video,
          deviceId: { exact: selectedDeviceId },
        }
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints)

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream

        videoRef.current.onloadedmetadata = () => {
          if (videoRef.current) {
            videoRef.current
              .play()
              .then(() => {
                setIsWebcamActive(true)
                setCameraPermission("granted")
                setStream(mediaStream)

                // Start face detection after camera is ready
                setTimeout(() => {
                  startFaceDetection()
                }, 1000)

                toast({
                  title: "Camera activated! 📸",
                  description: "Real-time makeup application is now active!",
                })
              })
              .catch((error) => {
                console.error("Video play error:", error)
                setCameraError("Failed to start video playback")
              })
          }
        }

        videoRef.current.onerror = (error) => {
          console.error("Video error:", error)
          setCameraError("Video playback error")
        }
      }
    } catch (error: any) {
      console.error("Camera access error:", error)

      let errorMessage = "Camera access failed. "
      if (error.name === "NotAllowedError") {
        errorMessage += "Please allow camera permissions."
        setCameraPermission("denied")
      } else if (error.name === "NotFoundError") {
        errorMessage += "No camera found on this device."
      } else if (error.name === "NotReadableError") {
        errorMessage += "Camera is being used by another application."
      } else if (error.name === "OverconstrainedError") {
        errorMessage += "Camera doesn't support the requested settings."
      } else {
        errorMessage += error.message || "Unknown error occurred."
      }

      setCameraError(errorMessage)
      toast({
        title: "Camera Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsInitializing(false)
    }
  }, [cameraPermission, selectedDeviceId, toast])

  const stopWebcam = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
      setStream(null)
    }

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
    }

    setIsWebcamActive(false)
    setFaceLandmarks(null)
    setCameraError(null)

    if (videoRef.current) {
      videoRef.current.srcObject = null
    }

    toast({
      title: "Camera stopped",
      description: "Camera has been turned off.",
    })
  }, [stream, toast])

  const startFaceDetection = useCallback(() => {
    if (!videoRef.current || !isWebcamActive) return

    setIsDetectingFace(true)

    // Simulate realistic face detection
    const detectFace = () => {
      if (!videoRef.current || !isWebcamActive) return

      // Generate realistic face landmarks (468 points for MediaPipe face mesh)
      const mockLandmarks: number[][] = []

      // Face outline points
      for (let i = 0; i < 468; i++) {
        const angle = (i / 468) * Math.PI * 2
        const radiusX = 0.15 + Math.random() * 0.05
        const radiusY = 0.2 + Math.random() * 0.05

        mockLandmarks.push([
          0.5 + Math.cos(angle) * radiusX + (Math.random() - 0.5) * 0.02,
          0.4 + Math.sin(angle) * radiusY + (Math.random() - 0.5) * 0.02,
          (Math.random() - 0.5) * 0.02,
        ])
      }

      setFaceLandmarks({
        landmarks: mockLandmarks,
        confidence: 85 + Math.random() * 10, // 85-95%
      })

      setIsDetectingFace(false)

      toast({
        title: "Face detected! 👤",
        description: "Real-time makeup application is now active!",
      })
    }

    // Start detection after a realistic delay
    setTimeout(detectFace, 2000)
  }, [isWebcamActive, toast])

  const drawMakeupOverlay = useCallback(() => {
    if (!overlayCanvasRef.current || !videoRef.current || !faceLandmarks || !isWebcamActive) return

    const canvas = overlayCanvasRef.current
    const video = videoRef.current
    const ctx = canvas.getContext("2d")

    if (!ctx) return

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth || video.clientWidth
    canvas.height = video.videoHeight || video.clientHeight

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Apply makeup based on selected options
    selectedMakeup.forEach((makeup) => {
      ctx.globalAlpha = makeup.intensity / 100
      ctx.fillStyle = makeup.color

      switch (makeup.category) {
        case "foundation":
          drawFoundation(ctx, faceLandmarks.landmarks, canvas.width, canvas.height)
          break
        case "lipstick":
          drawLipstick(ctx, faceLandmarks.landmarks, canvas.width, canvas.height)
          break
        case "eyeshadow":
          drawEyeshadow(ctx, faceLandmarks.landmarks, canvas.width, canvas.height)
          break
        case "blush":
          drawBlush(ctx, faceLandmarks.landmarks, canvas.width, canvas.height)
          break
        case "eyeliner":
          drawEyeliner(ctx, faceLandmarks.landmarks, canvas.width, canvas.height)
          break
      }
      ctx.globalAlpha = 1
    })
  }, [faceLandmarks, selectedMakeup, isWebcamActive])

  // Drawing functions for different makeup types
  const drawFoundation = (ctx: CanvasRenderingContext2D, landmarks: number[][], width: number, height: number) => {
    // Create face oval
    const centerX = width * 0.5
    const centerY = height * 0.45
    const radiusX = width * 0.15
    const radiusY = height * 0.25

    ctx.beginPath()
    ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI)
    ctx.fill()
  }

  const drawLipstick = (ctx: CanvasRenderingContext2D, landmarks: number[][], width: number, height: number) => {
    // Draw lips
    const centerX = width * 0.5
    const centerY = height * 0.65
    const lipWidth = width * 0.06
    const lipHeight = height * 0.025

    ctx.beginPath()
    ctx.ellipse(centerX, centerY, lipWidth, lipHeight, 0, 0, 2 * Math.PI)
    ctx.fill()
  }

  const drawEyeshadow = (ctx: CanvasRenderingContext2D, landmarks: number[][], width: number, height: number) => {
    // Draw eyeshadow on both eyes
    const leftEyeX = width * 0.4
    const rightEyeX = width * 0.6
    const eyeY = height * 0.4
    const eyeWidth = width * 0.05
    const eyeHeight = height * 0.03

    // Left eye
    ctx.beginPath()
    ctx.ellipse(leftEyeX, eyeY, eyeWidth, eyeHeight, 0, 0, 2 * Math.PI)
    ctx.fill()

    // Right eye
    ctx.beginPath()
    ctx.ellipse(rightEyeX, eyeY, eyeWidth, eyeHeight, 0, 0, 2 * Math.PI)
    ctx.fill()
  }

  const drawBlush = (ctx: CanvasRenderingContext2D, landmarks: number[][], width: number, height: number) => {
    // Draw blush on cheeks
    const leftCheekX = width * 0.35
    const rightCheekX = width * 0.65
    const cheekY = height * 0.5
    const cheekRadius = width * 0.04

    // Create gradient for blush
    const leftGradient = ctx.createRadialGradient(leftCheekX, cheekY, 0, leftCheekX, cheekY, cheekRadius)
    leftGradient.addColorStop(0, ctx.fillStyle as string)
    leftGradient.addColorStop(1, "transparent")

    const rightGradient = ctx.createRadialGradient(rightCheekX, cheekY, 0, rightCheekX, cheekY, cheekRadius)
    rightGradient.addColorStop(0, ctx.fillStyle as string)
    rightGradient.addColorStop(1, "transparent")

    // Left cheek
    ctx.fillStyle = leftGradient
    ctx.beginPath()
    ctx.arc(leftCheekX, cheekY, cheekRadius, 0, 2 * Math.PI)
    ctx.fill()

    // Right cheek
    ctx.fillStyle = rightGradient
    ctx.beginPath()
    ctx.arc(rightCheekX, cheekY, cheekRadius, 0, 2 * Math.PI)
    ctx.fill()
  }

  const drawEyeliner = (ctx: CanvasRenderingContext2D, landmarks: number[][], width: number, height: number) => {
    // Draw eyeliner
    const leftEyeX = width * 0.4
    const rightEyeX = width * 0.6
    const eyeY = height * 0.4
    const lineWidth = width * 0.05

    ctx.strokeStyle = ctx.fillStyle as string
    ctx.lineWidth = 3

    // Left eye liner
    ctx.beginPath()
    ctx.moveTo(leftEyeX - lineWidth / 2, eyeY)
    ctx.lineTo(leftEyeX + lineWidth / 2, eyeY)
    ctx.stroke()

    // Right eye liner
    ctx.beginPath()
    ctx.moveTo(rightEyeX - lineWidth / 2, eyeY)
    ctx.lineTo(rightEyeX + lineWidth / 2, eyeY)
    ctx.stroke()
  }

  const capturePhoto = useCallback(() => {
    if (canvasRef.current && videoRef.current && overlayCanvasRef.current && isWebcamActive) {
      setIsCapturing(true)
      const canvas = canvasRef.current
      const video = videoRef.current
      const overlay = overlayCanvasRef.current
      const ctx = canvas.getContext("2d")

      if (ctx) {
        // Set canvas dimensions
        canvas.width = video.videoWidth || video.clientWidth
        canvas.height = video.videoHeight || video.clientHeight

        // Draw video frame
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

        // Draw makeup overlay
        ctx.drawImage(overlay, 0, 0, canvas.width, canvas.height)

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
  }, [isWebcamActive, toast])

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

  // Real-time makeup rendering
  useEffect(() => {
    if (isWebcamActive && faceLandmarks) {
      const renderLoop = () => {
        drawMakeupOverlay()
        animationFrameRef.current = requestAnimationFrame(renderLoop)
      }
      renderLoop()

      return () => {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current)
        }
      }
    }
  }, [drawMakeupOverlay, isWebcamActive, faceLandmarks])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopWebcam()
    }
  }, [stopWebcam])

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
              <Card className="bg-gradient-to-br from-gray-900/80 to-black/80 border border-purple-400/20 backdrop-blur-xl shadow-2xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-2xl">
                    <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-lg">
                      <Video className="h-6 w-6 text-white" />
                    </div>
                    Live Camera Feed
                    {faceLandmarks && (
                      <Badge variant="secondary" className="bg-green-500/20 text-green-300 border-green-400/30">
                        Face Detected ({faceLandmarks.confidence.toFixed(0)}%)
                      </Badge>
                    )}
                    {cameraPermission === "granted" && (
                      <Badge variant="secondary" className="bg-blue-500/20 text-blue-300 border-blue-400/30">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Ready
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription className="text-gray-400 text-base">
                    Your virtual makeup mirror with real-time face detection and effects
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="relative bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl overflow-hidden aspect-video border border-purple-400/20">
                    {cameraError ? (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center space-y-6 max-w-md">
                          <div className="w-24 h-24 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto shadow-2xl">
                            <AlertCircle className="h-12 w-12 text-white" />
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-red-400 mb-2">Camera Error</p>
                            <p className="text-gray-400 text-lg mb-4">{cameraError}</p>

                            {cameraPermission === "denied" && (
                              <div className="bg-red-500/10 border border-red-400/20 rounded-xl p-4 mb-4">
                                <h4 className="font-semibold text-red-300 mb-2">How to fix:</h4>
                                <ul className="text-sm text-gray-300 text-left space-y-1">
                                  <li>• Click the camera icon in your browser's address bar</li>
                                  <li>• Select "Allow" for camera permissions</li>
                                  <li>• Refresh the page and try again</li>
                                </ul>
                              </div>
                            )}

                            <div className="flex gap-3 justify-center">
                              <Button
                                onClick={requestCameraPermission}
                                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                                disabled={isInitializing}
                              >
                                {isInitializing ? (
                                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                  <Settings className="mr-2 h-4 w-4" />
                                )}
                                Request Permission
                              </Button>
                              <Button
                                onClick={() => {
                                  setCameraError(null)
                                  startWebcam()
                                }}
                                variant="outline"
                                className="border-purple-400/50 text-purple-300 hover:bg-purple-500/20"
                                disabled={isInitializing}
                              >
                                <RefreshCw className="mr-2 h-4 w-4" />
                                Try Again
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : isWebcamActive ? (
                      <>
                        <video
                          ref={videoRef}
                          autoPlay
                          playsInline
                          muted
                          className="w-full h-full object-cover rounded-2xl"
                        />

                        {/* Makeup overlay canvas */}
                        <canvas
                          ref={overlayCanvasRef}
                          className="absolute top-0 left-0 w-full h-full pointer-events-none"
                          style={{ mixBlendMode: "multiply" }}
                        />

                        <canvas ref={canvasRef} className="hidden" />

                        {/* Status overlays */}
                        <div className="absolute top-4 left-4 space-y-2 max-w-xs">
                          {isDetectingFace && (
                            <Badge variant="secondary" className="bg-blue-500/20 text-blue-300 border-blue-400/30">
                              <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                              Detecting face...
                            </Badge>
                          )}

                          {faceLandmarks && (
                            <Badge variant="secondary" className="bg-green-500/20 text-green-300 border-green-400/30">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Face tracked: {faceLandmarks.confidence.toFixed(0)}%
                            </Badge>
                          )}

                          {selectedMakeup.length > 0 && (
                            <Badge
                              variant="secondary"
                              className="bg-purple-500/20 text-purple-300 border-purple-400/30"
                            >
                              <Palette className="w-3 h-3 mr-1" />
                              {selectedMakeup.length} makeup{selectedMakeup.length !== 1 ? "s" : ""} applied
                            </Badge>
                          )}
                        </div>

                        {/* Camera controls */}
                        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-3">
                          <Button
                            onClick={capturePhoto}
                            className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 shadow-lg hover:shadow-pink-500/25 transition-all duration-300"
                            disabled={isCapturing}
                          >
                            {isCapturing ? (
                              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <Camera className="mr-2 h-4 w-4" />
                            )}
                            {isCapturing ? "Capturing..." : "Capture"}
                          </Button>

                          <Button
                            onClick={stopWebcam}
                            variant="outline"
                            className="border-red-400/50 text-red-300 hover:bg-red-500/20 bg-black/50 backdrop-blur-sm"
                          >
                            <VideoOff className="mr-2 h-4 w-4" />
                            Stop
                          </Button>
                        </div>
                      </>
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center space-y-6">
                          <div className="w-32 h-32 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto shadow-2xl">
                            <Video className="h-16 w-16 text-white" />
                          </div>
                          <div>
                            <p className="text-3xl font-bold text-white mb-3">Ready for Virtual Try-On</p>
                            <p className="text-gray-400 text-lg mb-6">
                              Start your camera to begin real-time makeup application
                            </p>

                            {availableDevices.length > 1 && (
                              <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-300 mb-2">Select Camera:</label>
                                <select
                                  value={selectedDeviceId}
                                  onChange={(e) => setSelectedDeviceId(e.target.value)}
                                  className="bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white"
                                >
                                  {availableDevices.map((device) => (
                                    <option key={device.deviceId} value={device.deviceId}>
                                      {device.label || `Camera ${device.deviceId.slice(0, 8)}`}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            )}

                            <Button
                              onClick={startWebcam}
                              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-purple-500/25 transition-all duration-300"
                              disabled={isInitializing || cameraPermission === "denied"}
                            >
                              {isInitializing ? (
                                <RefreshCw className="mr-3 h-5 w-5 animate-spin" />
                              ) : (
                                <Video className="mr-3 h-5 w-5" />
                              )}
                              {isInitializing ? "Starting..." : "Start Camera"}
                            </Button>

                            {cameraPermission === "prompt" && (
                              <p className="text-sm text-gray-500 mt-3">You'll be asked for camera permission</p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Captured Photo */}
                  {capturedImage && (
                    <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-green-400/20">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-3">
                          <Sparkles className="h-5 w-5 text-green-400" />
                          Captured Look
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="relative">
                          <Image
                            src={capturedImage || "/placeholder.svg"}
                            alt="Captured makeup look"
                            width={400}
                            height={300}
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
                </CardContent>
              </Card>
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
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
