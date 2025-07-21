"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Camera, Video, VideoOff, RefreshCw, AlertCircle, CheckCircle, Settings, Zap, Eye, Info } from "lucide-react"
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
  videoElement: boolean
  canvasElement: boolean
}

interface CameraState {
  permission: "prompt" | "granted" | "denied"
  isActive: boolean
  isLoading: boolean
  hasVideo: boolean
  error: string | null
  stream: MediaStream | null
}

export function WebcamCapture({
  onFrameCapture,
  onAnalysisResult,
  autoAnalyze = false,
  captureInterval = 3000,
}: WebcamCaptureProps) {
  const [cameraState, setCameraState] = useState<CameraState>({
    permission: "prompt",
    isActive: false,
    isLoading: false,
    hasVideo: false,
    error: null,
    stream: null,
  })

  const [availableDevices, setAvailableDevices] = useState<CameraDevice[]>([])
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisProgress, setAnalysisProgress] = useState(0)
  const [lastAnalysis, setLastAnalysis] = useState<any>(null)
  const [frameCount, setFrameCount] = useState(0)
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null)
  const [showDebug, setShowDebug] = useState(false)
  const [logs, setLogs] = useState<string[]>([])

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const captureIntervalRef = useRef<NodeJS.Timeout>()
  const frameIntervalRef = useRef<NodeJS.Timeout>()

  const { toast } = useToast()

  // Add log function
  const addLog = useCallback((message: string, type: "info" | "error" | "success" = "info") => {
    const timestamp = new Date().toLocaleTimeString()
    const logMessage = `[${timestamp}] ${message}`
    console.log(logMessage)
    setLogs((prev) => [...prev.slice(-19), logMessage]) // Keep last 20 logs
  }, [])

  // Initialize on mount
  useEffect(() => {
    initializeSystem()
    return () => {
      cleanup()
    }
  }, [])

  // Auto-analyze frames when webcam is active
  useEffect(() => {
    if (cameraState.isActive && cameraState.hasVideo && autoAnalyze && !isAnalyzing) {
      startAutoCapture()
    } else {
      stopAutoCapture()
    }

    return () => stopAutoCapture()
  }, [cameraState.isActive, cameraState.hasVideo, autoAnalyze, isAnalyzing, captureInterval])

  const initializeSystem = async () => {
    addLog("🚀 Initializing camera system...")

    try {
      // Check all system requirements
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
        videoElement: !!videoRef.current,
        canvasElement: !!canvasRef.current,
      }

      setDebugInfo(info)
      addLog(`📊 System check: Browser=${info.browserSupport}, HTTPS=${info.httpsStatus}`)

      // Validate requirements
      if (!info.browserSupport) {
        throw new Error("Camera API not supported. Please use Chrome, Firefox, Safari, or Edge.")
      }

      if (!info.httpsStatus) {
        throw new Error("HTTPS required for camera access. Please use https:// or localhost.")
      }

      // Initialize camera system
      await checkPermissions()
      await getDevices()

      addLog("✅ System initialization completed successfully")
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown initialization error"
      addLog(`❌ Initialization failed: ${errorMessage}`, "error")
      setCameraState((prev) => ({ ...prev, error: errorMessage }))
    }
  }

  const checkPermissions = async () => {
    addLog("🔍 Checking camera permissions...")

    try {
      if ("permissions" in navigator) {
        const result = await navigator.permissions.query({ name: "camera" as PermissionName })
        addLog(`📋 Permission state: ${result.state}`)

        setCameraState((prev) => ({ ...prev, permission: result.state as any }))

        result.addEventListener("change", () => {
          addLog(`📋 Permission changed to: ${result.state}`)
          setCameraState((prev) => ({ ...prev, permission: result.state as any }))
        })
      } else {
        addLog("⚠️ Permission API not supported, assuming prompt")
        setCameraState((prev) => ({ ...prev, permission: "prompt" }))
      }
    } catch (error) {
      addLog(`❌ Permission check failed: ${error}`, "error")
      setCameraState((prev) => ({ ...prev, permission: "prompt" }))
    }
  }

  const getDevices = async () => {
    addLog("📱 Enumerating camera devices...")

    try {
      const devices = await navigator.mediaDevices.enumerateDevices()
      const videoDevices = devices
        .filter((device) => device.kind === "videoinput")
        .map((device) => ({
          deviceId: device.deviceId,
          label: device.label || `Camera ${device.deviceId.slice(0, 8)}`,
        }))

      addLog(`📹 Found ${videoDevices.length} camera device(s)`)
      setAvailableDevices(videoDevices)

      if (videoDevices.length === 0) {
        throw new Error("No camera devices found on this system")
      }

      // Select default device
      if (!selectedDeviceId && videoDevices.length > 0) {
        const frontCamera = videoDevices.find((device) => device.label.toLowerCase().includes("front"))
        const defaultDevice = frontCamera || videoDevices[0]
        setSelectedDeviceId(defaultDevice.deviceId)
        addLog(`📹 Selected default device: ${defaultDevice.label}`)
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to get camera devices"
      addLog(`❌ Device enumeration failed: ${errorMessage}`, "error")
      setCameraState((prev) => ({ ...prev, error: errorMessage }))
    }
  }

  const requestPermission = async () => {
    addLog("🔐 Requesting camera permission...")

    setCameraState((prev) => ({ ...prev, isLoading: true, error: null }))

    try {
      // Request permission with minimal constraints
      const tempStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      })

      addLog("✅ Permission granted successfully")

      // Stop temporary stream
      tempStream.getTracks().forEach((track) => {
        track.stop()
        addLog(`⏹️ Stopped temporary ${track.kind} track`)
      })

      setCameraState((prev) => ({ ...prev, permission: "granted" }))

      // Refresh device list with labels
      await getDevices()

      toast({
        title: "Camera permission granted! 📸",
        description: "You can now start the camera.",
      })

      // Automatically start camera after permission is granted
      setTimeout(() => {
        startCamera()
      }, 500)
    } catch (error: any) {
      const errorMessage = getPermissionErrorMessage(error)
      addLog(`❌ Permission request failed: ${errorMessage}`, "error")

      setCameraState((prev) => ({
        ...prev,
        permission: error.name === "NotAllowedError" ? "denied" : "prompt",
        error: errorMessage,
      }))

      toast({
        title: "Camera permission denied",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setCameraState((prev) => ({ ...prev, isLoading: false }))
    }
  }

  const getPermissionErrorMessage = (error: any): string => {
    switch (error.name) {
      case "NotAllowedError":
        return "Camera access denied. Please click 'Allow' when prompted."
      case "NotFoundError":
        return "No camera found on this device."
      case "NotReadableError":
        return "Camera is being used by another application."
      case "OverconstrainedError":
        return "Camera constraints not supported."
      case "SecurityError":
        return "Camera access blocked by security policy."
      default:
        return `Camera error: ${error.message || "Unknown error"}`
    }
  }

  const startCamera = async () => {
    addLog("🎬 Starting camera...")

    setCameraState((prev) => ({ ...prev, isLoading: true, error: null, hasVideo: false }))

    try {
      if (!videoRef.current) {
        throw new Error("Video element not found")
      }

      if (!canvasRef.current) {
        throw new Error("Canvas element not found")
      }

      // Define camera constraints
      const constraints: MediaStreamConstraints = {
        video: {
          width: { ideal: 1280, max: 1920 },
          height: { ideal: 720, max: 1080 },
          facingMode: "user",
          frameRate: { ideal: 30, max: 60 },
        },
        audio: false,
      }

      // Use selected device if available
      if (selectedDeviceId) {
        constraints.video = {
          ...constraints.video,
          deviceId: { exact: selectedDeviceId },
        }
        addLog(`📹 Using device: ${selectedDeviceId}`)
      }

      addLog("🎬 Requesting camera stream...")
      const stream = await navigator.mediaDevices.getUserMedia(constraints)

      addLog(`✅ Got stream with ${stream.getVideoTracks().length} video tracks`)

      // Configure video element
      const video = videoRef.current

      // Clear any existing source
      video.srcObject = null

      // Set new stream
      video.srcObject = stream
      video.muted = true
      video.playsInline = true
      video.autoplay = true

      addLog("🎬 Configuring video element...")

      // Wait for video to be ready with better error handling
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error("Video loading timeout (15 seconds)"))
        }, 15000)

        const onLoadedMetadata = async () => {
          try {
            addLog(`📐 Video metadata loaded: ${video.videoWidth}x${video.videoHeight}`)

            clearTimeout(timeout)
            removeListeners()

            // Ensure video dimensions are valid
            if (video.videoWidth === 0 || video.videoHeight === 0) {
              throw new Error("Video has invalid dimensions")
            }

            // Start playback
            await video.play()
            addLog("▶️ Video playback started successfully")

            // Double-check video is actually playing
            setTimeout(() => {
              if (video.readyState >= 2 && video.videoWidth > 0 && video.videoHeight > 0) {
                addLog("✅ Video confirmed playing with valid dimensions")
                setCameraState((prev) => ({
                  ...prev,
                  isActive: true,
                  hasVideo: true,
                  stream,
                }))
                startFrameCounter()
                resolve()
              } else {
                addLog(
                  `❌ Video not ready: readyState=${video.readyState}, dimensions=${video.videoWidth}x${video.videoHeight}`,
                  "error",
                )
                reject(new Error("Video not ready after play"))
              }
            }, 1000)
          } catch (playError) {
            addLog(`❌ Video play error: ${playError}`, "error")
            reject(playError)
          }
        }

        const onError = (event: Event) => {
          addLog(`❌ Video error event: ${event}`, "error")
          clearTimeout(timeout)
          removeListeners()
          reject(new Error("Video element error"))
        }

        const onCanPlay = () => {
          addLog("✅ Video can play event fired")
        }

        const onLoadStart = () => {
          addLog("🎬 Video load started")
        }

        const removeListeners = () => {
          video.removeEventListener("loadedmetadata", onLoadedMetadata)
          video.removeEventListener("error", onError)
          video.removeEventListener("canplay", onCanPlay)
          video.removeEventListener("loadstart", onLoadStart)
        }

        video.addEventListener("loadedmetadata", onLoadedMetadata)
        video.addEventListener("error", onError)
        video.addEventListener("canplay", onCanPlay)
        video.addEventListener("loadstart", onLoadStart)
      })

      toast({
        title: "Camera started! 📸",
        description: "Your camera is now active and ready.",
      })

      addLog("✅ Camera started successfully", "success")
    } catch (error: any) {
      const errorMessage = getPermissionErrorMessage(error)
      addLog(`❌ Camera start failed: ${errorMessage}`, "error")

      setCameraState((prev) => ({
        ...prev,
        error: errorMessage,
        permission: error.name === "NotAllowedError" ? "denied" : prev.permission,
      }))

      toast({
        title: "Camera Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setCameraState((prev) => ({ ...prev, isLoading: false }))
    }
  }

  const stopCamera = () => {
    addLog("⏹️ Stopping camera...")

    cleanup()
    setCameraState((prev) => ({
      ...prev,
      isActive: false,
      hasVideo: false,
      stream: null,
      error: null,
    }))

    toast({
      title: "Camera stopped",
      description: "Camera has been turned off.",
    })

    addLog("✅ Camera stopped successfully", "success")
  }

  const cleanup = () => {
    addLog("🧹 Cleaning up resources...")

    if (cameraState.stream) {
      cameraState.stream.getTracks().forEach((track) => {
        track.stop()
        addLog(`⏹️ Stopped ${track.kind} track: ${track.label}`)
      })
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
    if (!videoRef.current || !canvasRef.current || !cameraState.hasVideo) {
      addLog("❌ Cannot capture frame - missing requirements")
      return null
    }

    const video = videoRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")

    if (!ctx) {
      addLog("❌ Cannot get canvas context")
      return null
    }

    // Set canvas dimensions
    canvas.width = video.videoWidth || 640
    canvas.height = video.videoHeight || 480

    // Draw frame
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

    // Convert to base64
    const imageData = canvas.toDataURL("image/jpeg", 0.8)
    addLog(`📸 Frame captured: ${canvas.width}x${canvas.height}`)

    if (onFrameCapture) {
      onFrameCapture(imageData)
    }

    return imageData
  }, [cameraState.hasVideo, onFrameCapture, addLog])

  const analyzeFrame = async (imageData: string) => {
    try {
      setIsAnalyzing(true)
      setAnalysisProgress(0)
      addLog("🔍 Starting frame analysis...")

      // Progress simulation
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
        throw new Error(`Analysis failed: ${response.status} ${response.statusText}`)
      }

      const result = await response.json()
      addLog("✅ Analysis completed successfully", "success")
      setLastAnalysis(result)

      if (onAnalysisResult) {
        onAnalysisResult(result)
      }

      toast({
        title: "Analysis complete! ✨",
        description: "Skin analysis has been processed.",
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Analysis failed"
      addLog(`❌ Analysis error: ${errorMessage}`, "error")
      toast({
        title: "Analysis failed",
        description: errorMessage,
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

    addLog(`🔄 Auto-capture started (${captureInterval}ms interval)`)
  }

  const stopAutoCapture = () => {
    if (captureIntervalRef.current) {
      clearInterval(captureIntervalRef.current)
      addLog("⏹️ Auto-capture stopped")
    }
  }

  return (
    <Card className="bg-gradient-to-br from-gray-900/80 to-black/80 border border-purple-400/20 backdrop-blur-xl shadow-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-2xl">
          <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-lg">
            <Video className="h-6 w-6 text-white" />
          </div>
          Live Camera Feed
          {cameraState.isActive && cameraState.hasVideo && (
            <Badge variant="secondary" className="bg-green-500/20 text-green-300 border-green-400/30">
              <CheckCircle className="w-4 h-4 mr-1" />
              Active ({frameCount}s)
            </Badge>
          )}
          {cameraState.permission === "granted" && !cameraState.isActive && (
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
        {/* Debug Controls */}
        <div className="flex justify-between items-center">
          <Button
            onClick={() => setShowDebug(!showDebug)}
            variant="outline"
            size="sm"
            className="border-gray-600 text-gray-400 hover:bg-gray-800"
          >
            <Info className="w-4 h-4 mr-2" />
            {showDebug ? "Hide" : "Show"} Debug
          </Button>
          <Button
            onClick={() => setLogs([])}
            variant="outline"
            size="sm"
            className="border-gray-600 text-gray-400 hover:bg-gray-800"
          >
            Clear Logs
          </Button>
        </div>

        {/* Debug Panel */}
        {showDebug && (
          <div className="space-y-4">
            {/* System Status */}
            {debugInfo && (
              <div className="bg-gray-800/50 border border-gray-600 rounded-xl p-4">
                <h4 className="font-semibold text-gray-300 mb-3">System Status</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Browser Support:</span>
                    <span className={debugInfo.browserSupport ? "text-green-400" : "text-red-400"}>
                      {debugInfo.browserSupport ? "✅" : "❌"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">HTTPS:</span>
                    <span className={debugInfo.httpsStatus ? "text-green-400" : "text-red-400"}>
                      {debugInfo.httpsStatus ? "✅" : "❌"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Permission API:</span>
                    <span className={debugInfo.permissionAPI ? "text-green-400" : "text-yellow-400"}>
                      {debugInfo.permissionAPI ? "✅" : "⚠️"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Devices Found:</span>
                    <span className="text-white">{availableDevices.length}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Live Logs */}
            <div className="bg-gray-800/50 border border-gray-600 rounded-xl p-4">
              <h4 className="font-semibold text-gray-300 mb-3">Live Logs</h4>
              <div className="bg-black/50 rounded-lg p-3 max-h-40 overflow-y-auto font-mono text-xs">
                {logs.length === 0 ? (
                  <p className="text-gray-500">No logs yet...</p>
                ) : (
                  logs.map((log, index) => (
                    <div key={index} className="text-gray-300 mb-1">
                      {log}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Main Video Container */}
        <div className="relative bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl overflow-hidden aspect-video border border-purple-400/20">
          {cameraState.error ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center space-y-6 max-w-md">
                <div className="w-24 h-24 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto shadow-2xl">
                  <AlertCircle className="h-12 w-12 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-red-400 mb-2">Camera Error</p>
                  <p className="text-gray-400 text-lg mb-4">{cameraState.error}</p>

                  <div className="bg-red-500/10 border border-red-400/20 rounded-xl p-4 mb-4">
                    <h4 className="font-semibold text-red-300 mb-2">Troubleshooting:</h4>
                    <ul className="text-sm text-gray-300 text-left space-y-1">
                      <li>• Check if camera is being used by another app</li>
                      <li>• Click the camera icon in browser address bar</li>
                      <li>• Select "Allow" for camera permissions</li>
                      <li>• Try refreshing the page</li>
                      <li>• Check browser console for detailed errors</li>
                    </ul>
                  </div>

                  <div className="flex gap-3 justify-center">
                    <Button
                      onClick={requestPermission}
                      className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                      disabled={cameraState.isLoading}
                    >
                      {cameraState.isLoading ? (
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Settings className="mr-2 h-4 w-4" />
                      )}
                      Request Permission
                    </Button>
                    <Button
                      onClick={() => {
                        setCameraState((prev) => ({ ...prev, error: null }))
                        startCamera()
                      }}
                      variant="outline"
                      className="border-purple-400/50 text-purple-300 hover:bg-purple-500/20"
                      disabled={cameraState.isLoading}
                    >
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Try Again
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ) : cameraState.isActive && cameraState.hasVideo ? (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover rounded-2xl"
                style={{
                  transform: "scaleX(-1)",
                  backgroundColor: "#000",
                }}
              />

              {/* Analysis Progress Overlay */}
              {isAnalyzing && (
                <div className="absolute top-4 left-4 right-4">
                  <div className="bg-black/50 backdrop-blur-sm rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Eye className="w-4 h-4 text-blue-400" />
                      <span className="text-sm text-white">Analyzing skin...</span>
                    </div>
                    <Progress value={analysisProgress} className="h-2" />
                  </div>
                </div>
              )}

              {/* Status Badges */}
              <div className="absolute top-4 right-4 space-y-2">
                {autoAnalyze && (
                  <Badge variant="secondary" className="bg-purple-500/20 text-purple-300 border-purple-400/30">
                    <Zap className="w-3 h-3 mr-1" />
                    Auto-analyze
                  </Badge>
                )}
                {lastAnalysis && (
                  <Badge variant="secondary" className="bg-green-500/20 text-green-300 border-green-400/30">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Analysis ready
                  </Badge>
                )}
              </div>

              {/* Controls */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-3">
                <Button
                  onClick={captureAndAnalyze}
                  className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 shadow-lg"
                  disabled={isAnalyzing}
                >
                  {isAnalyzing ? (
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Camera className="mr-2 h-4 w-4" />
                  )}
                  {isAnalyzing ? "Analyzing..." : "Analyze"}
                </Button>

                <Button
                  onClick={stopCamera}
                  variant="outline"
                  className="border-red-400/50 text-red-300 hover:bg-red-500/20 bg-black/50 backdrop-blur-sm"
                >
                  <VideoOff className="mr-2 h-4 w-4" />
                  Stop
                </Button>
              </div>
            </>
          ) : cameraState.isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center space-y-6">
                <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto shadow-2xl">
                  <RefreshCw className="h-16 w-16 text-white animate-spin" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-white mb-3">Starting Camera...</p>
                  <p className="text-gray-400 text-lg">Please wait while we access your camera</p>
                  <p className="text-sm text-gray-500 mt-2">Check debug logs for detailed progress</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center space-y-6">
                <div className="w-32 h-32 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto shadow-2xl">
                  <Video className="h-16 w-16 text-white" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-white mb-3">Ready for Virtual Try-On</p>
                  <p className="text-gray-400 text-lg mb-6">Start your camera to begin real-time makeup application</p>

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
                            {device.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <Button
                    onClick={cameraState.permission === "granted" ? startCamera : requestPermission}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-purple-500/25 transition-all duration-300"
                    disabled={cameraState.isLoading}
                  >
                    {cameraState.isLoading ? (
                      <RefreshCw className="mr-3 h-5 w-5 animate-spin" />
                    ) : (
                      <Video className="mr-3 h-5 w-5" />
                    )}
                    Start Camera
                  </Button>

                  {cameraState.permission === "prompt" && (
                    <p className="text-sm text-gray-500 mt-3">You'll be asked for camera permission</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Hidden canvas for frame capture */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Analysis Results */}
        {lastAnalysis && (
          <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-xl p-4 border border-green-400/20">
            <h4 className="font-semibold text-green-300 mb-2">Latest Analysis</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-400">Skin Tone:</span>
                <span className="text-white ml-2">{lastAnalysis.skinTone || "Unknown"}</span>
              </div>
              <div>
                <span className="text-gray-400">Confidence:</span>
                <span className="text-white ml-2">{lastAnalysis.confidence || 0}%</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
