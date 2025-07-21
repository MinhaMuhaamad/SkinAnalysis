"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Camera,
  Video,
  VideoOff,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Settings,
  Zap,
  Eye,
  Shield,
  Globe,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface WebcamCaptureProps {
  onFrameCapture?: (imageData: string) => void
  onAnalysisResult?: (result: any) => void
  autoAnalyze?: boolean
  captureInterval?: number
}

interface CameraDevice {
  deviceId: string
  label: string
}

interface DebugInfo {
  browserSupport: boolean
  httpsStatus: boolean
  permissionAPI: boolean
  mediaDevices: boolean
  getUserMedia: boolean
  currentURL: string
  userAgent: string
}

export function WebcamCapture({
  onFrameCapture,
  onAnalysisResult,
  autoAnalyze = false,
  captureInterval = 3000,
}: WebcamCaptureProps) {
  const [isWebcamActive, setIsWebcamActive] = useState(false)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [cameraPermission, setCameraPermission] = useState<"prompt" | "granted" | "denied">("prompt")
  const [availableDevices, setAvailableDevices] = useState<CameraDevice[]>([])
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>("")
  const [isInitializing, setIsInitializing] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisProgress, setAnalysisProgress] = useState(0)
  const [lastAnalysis, setLastAnalysis] = useState<any>(null)
  const [frameCount, setFrameCount] = useState(0)
  const [videoLoaded, setVideoLoaded] = useState(false)
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null)
  const [showDebug, setShowDebug] = useState(false)
  const [debug, setDebug] = useState<string[]>([])

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const captureIntervalRef = useRef<NodeJS.Timeout>()
  const frameIntervalRef = useRef<NodeJS.Timeout>()

  const { toast } = useToast()

  // Initialize debug info and camera on component mount
  useEffect(() => {
    initializeDebugInfo()
    initializeCamera()
    return () => {
      cleanup()
    }
  }, [])

  // Auto-analyze frames when webcam is active
  useEffect(() => {
    if (isWebcamActive && autoAnalyze && !isAnalyzing) {
      startAutoCapture()
    } else {
      stopAutoCapture()
    }

    return () => stopAutoCapture()
  }, [isWebcamActive, autoAnalyze, isAnalyzing, captureInterval])

  const initializeDebugInfo = () => {
    const info: DebugInfo = {
      browserSupport: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
      httpsStatus:
        window.location.protocol === "https:" ||
        window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1",
      permissionAPI: "permissions" in navigator,
      mediaDevices: !!navigator.mediaDevices,
      getUserMedia: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
      currentURL: window.location.href,
      userAgent: navigator.userAgent,
    }
    setDebugInfo(info)
    console.log("Debug Info:", info)
  }

  const initializeCamera = async () => {
    try {
      console.log("🎥 Initializing camera...")

      // Check browser support
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        const error = "Camera API not supported in this browser. Please use Chrome, Firefox, Safari, or Edge."
        console.error("❌", error)
        setCameraError(error)
        return
      }

      // Check HTTPS requirement
      const isHttps = window.location.protocol === "https:"
      const isLocalhost = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"

      if (!isHttps && !isLocalhost) {
        const error = "🔒 HTTPS is required for camera access. Please use a secure connection (https://) or localhost."
        console.error("❌", error)
        setCameraError(error)
        return
      }

      console.log("✅ Browser support and HTTPS check passed")

      await getAvailableDevices()
      await checkCameraPermissions()

      console.log("✅ Camera initialization completed")
    } catch (error) {
      console.error("❌ Camera initialization error:", error)
      setCameraError(`Failed to initialize camera: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  const checkCameraPermissions = async () => {
    try {
      console.log("🔍 Checking camera permissions...")

      if ("permissions" in navigator) {
        try {
          const result = await navigator.permissions.query({ name: "camera" as PermissionName })
          console.log("📋 Permission state:", result.state)
          setCameraPermission(result.state as "granted" | "denied" | "prompt")

          result.addEventListener("change", () => {
            console.log("📋 Permission state changed:", result.state)
            setCameraPermission(result.state as "granted" | "denied" | "prompt")
          })
        } catch (permError) {
          console.log("⚠️ Permission API query failed:", permError)
          setCameraPermission("prompt")
        }
      } else {
        console.log("⚠️ Permission API not supported")
        setCameraPermission("prompt")
      }
    } catch (error) {
      console.error("❌ Permission check error:", error)
      setCameraPermission("prompt")
    }
  }

  const getAvailableDevices = async () => {
    try {
      console.log("📱 Getting available devices...")

      const devices = await navigator.mediaDevices.enumerateDevices()
      console.log("📱 All devices:", devices)

      const videoDevices = devices
        .filter((device) => device.kind === "videoinput")
        .map((device) => ({
          deviceId: device.deviceId,
          label: device.label || `Camera ${device.deviceId.slice(0, 8)}`,
        }))

      console.log("📹 Video devices:", videoDevices)
      setAvailableDevices(videoDevices)

      if (videoDevices.length === 0) {
        setCameraError("No camera devices found on this device.")
        return
      }

      if (videoDevices.length > 0 && !selectedDeviceId) {
        // Prefer front-facing camera
        const frontCamera = videoDevices.find(
          (device) =>
            device.label.toLowerCase().includes("front") ||
            device.label.toLowerCase().includes("user") ||
            device.label.toLowerCase().includes("facing"),
        )
        const selectedDevice = frontCamera?.deviceId || videoDevices[0].deviceId
        console.log("📹 Selected device:", selectedDevice)
        setSelectedDeviceId(selectedDevice)
      }
    } catch (error) {
      console.error("❌ Error getting devices:", error)
      setCameraError(`Failed to get camera devices: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  const requestCameraPermission = async () => {
    try {
      setIsInitializing(true)
      setCameraError(null)

      console.log("🔐 Requesting camera permission...")

      // Simple permission request
      const tempStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      })

      console.log("✅ Permission granted, got stream:", tempStream)

      // Stop temporary stream immediately
      tempStream.getTracks().forEach((track) => {
        console.log("⏹️ Stopping temporary track:", track.kind)
        track.stop()
      })

      setCameraPermission("granted")
      await getAvailableDevices()

      toast({
        title: "Camera permission granted! 📸",
        description: "You can now start the camera.",
      })

      console.log("✅ Permission request completed successfully")
    } catch (error: any) {
      console.error("❌ Camera permission error:", error)

      let errorMessage = "Camera access denied. "

      if (error.name === "NotAllowedError") {
        errorMessage += "Please click 'Allow' when prompted for camera access."
        setCameraPermission("denied")
      } else if (error.name === "NotFoundError") {
        errorMessage += "No camera found on this device."
      } else if (error.name === "NotReadableError") {
        errorMessage += "Camera is being used by another application."
      } else if (error.name === "OverconstrainedError") {
        errorMessage += "Camera constraints not supported."
      } else if (error.name === "SecurityError") {
        errorMessage += "Camera access blocked by security policy."
      } else {
        errorMessage += `Error: ${error.message || "Unknown error"}`
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
      setVideoLoaded(false)

      console.log("🎬 Starting webcam...")

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Camera API not supported")
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

      // Get media stream
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints)

      if (!videoRef.current) {
        throw new Error("Video element not available")
      }

      // Set up video element
      videoRef.current.srcObject = mediaStream

      // Wait for video to be ready
      await new Promise<void>((resolve, reject) => {
        if (!videoRef.current) return reject("No video element")

        videoRef.current.onloadedmetadata = async () => {
          try {
            await videoRef.current?.play()
            setIsWebcamActive(true)
            setVideoLoaded(true)
            setStream(mediaStream)
            resolve()
          } catch (error) {
            reject(error)
          }
        }

        videoRef.current.onerror = (event) => reject(event)
      })

      toast({
        title: "Camera Started",
        description: "Your webcam is now active",
      })
    } catch (error: any) {
      console.error("Camera start error:", error)
      setCameraError(error.message || "Failed to start camera")
    } finally {
      setIsInitializing(false)
    }
  }, [])

  const stopWebcam = useCallback(() => {
    console.log("⏹️ Stopping webcam...")
    cleanup()
    setIsWebcamActive(false)
    setVideoLoaded(false)
    setCameraError(null)

    toast({
      title: "Camera stopped",
      description: "Webcam has been turned off.",
    })
  }, [])

  const cleanup = () => {
    console.log("🧹 Cleaning up camera resources...")

    if (stream) {
      stream.getTracks().forEach((track) => {
        console.log("⏹️ Stopping track:", track.kind, track.label)
        track.stop()
      })
      setStream(null)
    }

    if (captureIntervalRef.current) {
      clearInterval(captureIntervalRef.current)
    }

    if (frameIntervalRef.current) {
      clearInterval(frameIntervalRef.current)
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null
    }

    setFrameCount(0)
  }

  const startFrameCounter = () => {
    frameIntervalRef.current = setInterval(() => {
      setFrameCount((prev) => prev + 1)
    }, 1000)
  }

  const captureFrame = useCallback(async (): Promise<string | null> => {
    if (!videoRef.current || !canvasRef.current || !isWebcamActive || !videoLoaded) {
      console.log("❌ Cannot capture frame - missing requirements")
      return null
    }

    const video = videoRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")

    if (!ctx) {
      console.log("❌ Cannot get canvas context")
      return null
    }

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth || video.clientWidth
    canvas.height = video.videoHeight || video.clientHeight

    console.log("📸 Capturing frame:", canvas.width, "x", canvas.height)

    // Draw current video frame to canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

    // Convert to base64
    const imageData = canvas.toDataURL("image/jpeg", 0.8)
    console.log("📸 Frame captured, size:", imageData.length, "characters")

    // Call callback if provided
    if (onFrameCapture) {
      onFrameCapture(imageData)
    }

    return imageData
  }, [isWebcamActive, videoLoaded, onFrameCapture])

  const analyzeFrame = async (imageData: string) => {
    try {
      setIsAnalyzing(true)
      setAnalysisProgress(0)

      console.log("🔍 Starting analysis...")

      // Simulate progress
      const progressInterval = setInterval(() => {
        setAnalysisProgress((prev) => Math.min(prev + 10, 90))
      }, 100)

      const response = await fetch("/api/skin-analysis", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ imageData }),
      })

      clearInterval(progressInterval)
      setAnalysisProgress(100)

      if (!response.ok) {
        throw new Error(`Analysis failed with status: ${response.status}`)
      }

      const result = await response.json()
      console.log("✅ Analysis result:", result)
      setLastAnalysis(result)

      if (onAnalysisResult) {
        onAnalysisResult(result)
      }

      toast({
        title: "Analysis complete! ✨",
        description: "Skin analysis has been processed.",
      })
    } catch (error) {
      console.error("❌ Analysis error:", error)
      toast({
        title: "Analysis failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      })
    } finally {
      setIsAnalyzing(false)
      setTimeout(() => setAnalysisProgress(0), 1000)
    }
  }

  const captureAndAnalyze = async () => {
    const imageData = await captureFrame()
    if (imageData) {
      await analyzeFrame(imageData)
    }
  }

  const startAutoCapture = () => {
    if (captureIntervalRef.current) {
      clearInterval(captureIntervalRef.current)
    }

    captureIntervalRef.current = setInterval(async () => {
      if (!isAnalyzing) {
        await captureAndAnalyze()
      }
    }, captureInterval)
  }

  const stopAutoCapture = () => {
    if (captureIntervalRef.current) {
      clearInterval(captureIntervalRef.current)
    }
  }

  const logDebug = (message: string) => {
    setDebug(prev => [...prev, `${new Date().toISOString()} - ${message}`]);
    console.log(message);
  };

  return (
    <Card className="bg-gradient-to-br from-gray-900/80 to-black/80 border border-purple-400/20 backdrop-blur-xl shadow-2xl">
      <CardContent className="space-y-6">
        {/* Video Container with improved styling */}
        <div className="relative bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl overflow-hidden border border-purple-400/20">
          {cameraError ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center space-y-4">
                <AlertCircle className="h-12 w-12 text-red-400 mx-auto" />
                <div className="px-4">
                  <p className="text-lg font-semibold text-red-400 mb-2">Camera Error</p>
                  <p className="text-gray-400 text-sm mb-4">{cameraError}</p>
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
                  <div className="flex gap-2 justify-center">
                    <Button
                      onClick={() => {
                        setCameraError(null)
                        startWebcam()
                      }}
                      variant="outline"
                      className="border-red-400/50 text-red-300 hover:bg-red-500/20"
                    >
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Try Again
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ) : !isWebcamActive ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center space-y-4">
                <Button
                  onClick={startWebcam}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 px-6 py-3"
                  disabled={isInitializing}
                >
                  {isInitializing ? (
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Video className="mr-2 h-4 w-4" />
                  )}
                  {isInitializing ? "Starting..." : "Start Camera"}
                </Button>
                {cameraPermission === "prompt" && (
                  <p className="text-sm text-gray-500">You'll be asked for camera permission</p>
                )}
              </div>
            </div>
          ) : (
            <div className="relative aspect-video w-full min-h-[300px]"> {/* Added min-height */}
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="absolute inset-0 w-full h-full object-cover rounded-xl"
                style={{
                  transform: 'scaleX(-1)',
                  backgroundColor: 'rgba(0,0,0,0.2)',
                  display: isWebcamActive ? 'block' : 'none' // Ensure visibility
                }}
                onLoadedMetadata={() => logDebug("Video metadata loaded")}
                onPlay={() => logDebug("Video playback started")}
                onError={(e) => logDebug(`Video error: ${e}`)}
              />
              {/* Canvas overlay for makeup effects */}
              <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full pointer-events-none"
                style={{
                  mixBlendMode: 'multiply',
                  display: isWebcamActive ? 'block' : 'none' // Ensure visibility
                }}
              />
              {isWebcamActive && !videoLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900/50">
                  <div className="text-center space-y-2">
                    <RefreshCw className="h-8 w-8 animate-spin text-purple-400 mx-auto" />
                    <p className="text-sm text-gray-300">Initializing camera...</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Rest of your existing controls */}
      </CardContent>
    </Card>
  )
}
