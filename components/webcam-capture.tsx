"use client"
import { useState, useRef, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Camera, Video, VideoOff, RefreshCw, AlertCircle, CheckCircle, Settings, Zap, Eye } from "lucide-react"
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

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const captureIntervalRef = useRef<NodeJS.Timeout>()
  const frameIntervalRef = useRef<NodeJS.Timeout>()

  const { toast } = useToast()

  // Check HTTPS requirement
  const isHttps = typeof window !== "undefined" && window.location.protocol === "https:"
  const isLocalhost =
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")

  // Initialize camera on component mount
  useEffect(() => {
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

  const initializeCamera = async () => {
    try {
      // Check browser support
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError("Camera not supported in this browser")
        return
      }

      // Check HTTPS requirement (except localhost)
      if (!isHttps && !isLocalhost) {
        setCameraError("HTTPS is required for camera access. Please use a secure connection.")
        return
      }

      await getAvailableDevices()
      await checkCameraPermissions()
    } catch (error) {
      console.error("Camera initialization error:", error)
      setCameraError("Failed to initialize camera")
    }
  }

  const checkCameraPermissions = async () => {
    try {
      if ("permissions" in navigator) {
        const result = await navigator.permissions.query({ name: "camera" as PermissionName })
        setCameraPermission(result.state as "granted" | "denied" | "prompt")

        result.addEventListener("change", () => {
          setCameraPermission(result.state as "granted" | "denied" | "prompt")
        })
      }
    } catch (error) {
      console.log("Permission API not supported")
      setCameraPermission("prompt")
    }
  }

  const getAvailableDevices = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices()
      const videoDevices = devices
        .filter((device) => device.kind === "videoinput")
        .map((device) => ({
          deviceId: device.deviceId,
          label: device.label || `Camera ${device.deviceId.slice(0, 8)}`,
        }))

      setAvailableDevices(videoDevices)

      if (videoDevices.length > 0 && !selectedDeviceId) {
        // Prefer front-facing camera
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
        description: "You can now start the camera.",
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

      console.log("Requesting camera access...")
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints)

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream

        await new Promise<void>((resolve, reject) => {
          if (!videoRef.current) {
            reject(new Error("Video element not available"))
            return
          }

          videoRef.current.onloadedmetadata = () => {
            if (videoRef.current) {
              videoRef.current
                .play()
                .then(() => {
                  console.log("Video playback started successfully")
                  setIsWebcamActive(true)
                  setCameraPermission("granted")
                  setStream(mediaStream)

                  // Start frame counter
                  startFrameCounter()

                  toast({
                    title: "Camera activated! 📸",
                    description: "Webcam is now streaming.",
                  })

                  resolve()
                })
                .catch(reject)
            }
          }

          videoRef.current.onerror = reject
          setTimeout(() => reject(new Error("Video loading timeout")), 10000)
        })
      }
    } catch (error: any) {
      console.error("Camera access error:", error)

      let errorMessage = "Camera access failed. "
      if (error.name === "NotAllowedError") {
        errorMessage += "Please allow camera permissions."
        setCameraPermission("denied")
      } else if (error.name === "NotFoundError") {
        errorMessage += "No camera found."
      } else if (error.name === "NotReadableError") {
        errorMessage += "Camera is being used by another application."
      } else if (error.name === "OverconstrainedError") {
        errorMessage += "Camera settings not supported."
      } else {
        errorMessage += error.message || "Unknown error."
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
  }, [selectedDeviceId, toast])

  const stopWebcam = useCallback(() => {
    cleanup()
    setIsWebcamActive(false)
    setCameraError(null)

    toast({
      title: "Camera stopped",
      description: "Webcam has been turned off.",
    })
  }, [])

  const cleanup = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
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
    if (!videoRef.current || !canvasRef.current || !isWebcamActive) {
      return null
    }

    const video = videoRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")

    if (!ctx) return null

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth || video.clientWidth
    canvas.height = video.videoHeight || video.clientHeight

    // Draw current video frame to canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

    // Convert to base64
    const imageData = canvas.toDataURL("image/jpeg", 0.8)

    // Call callback if provided
    if (onFrameCapture) {
      onFrameCapture(imageData)
    }

    return imageData
  }, [isWebcamActive, onFrameCapture])

  const analyzeFrame = async (imageData: string) => {
    try {
      setIsAnalyzing(true)
      setAnalysisProgress(0)

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
        throw new Error(`Analysis failed: ${response.status}`)
      }

      const result = await response.json()
      setLastAnalysis(result)

      if (onAnalysisResult) {
        onAnalysisResult(result)
      }

      toast({
        title: "Analysis complete! ✨",
        description: "Skin analysis has been processed.",
      })
    } catch (error) {
      console.error("Analysis error:", error)
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

  return (
    <Card className="bg-gradient-to-br from-gray-900/80 to-black/80 border border-purple-400/20 backdrop-blur-xl shadow-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-2xl">
          <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-lg">
            <Video className="h-6 w-6 text-white" />
          </div>
          Live Camera Feed
          {isWebcamActive && (
            <Badge variant="secondary" className="bg-green-500/20 text-green-300 border-green-400/30">
              <CheckCircle className="w-4 h-4 mr-1" />
              Active ({frameCount} frames)
            </Badge>
          )}
          {cameraPermission === "granted" && !isWebcamActive && (
            <Badge variant="secondary" className="bg-blue-500/20 text-blue-300 border-blue-400/30">
              <CheckCircle className="w-4 h-4 mr-1" />
              Ready
            </Badge>
          )}
        </CardTitle>
        <CardDescription className="text-gray-400 text-base">
          Real-time webcam capture with automatic skin analysis
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* HTTPS Warning */}
        {!isHttps && !isLocalhost && (
          <div className="bg-red-500/10 border border-red-400/20 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-400" />
              <div>
                <h4 className="font-semibold text-red-300">HTTPS Required</h4>
                <p className="text-sm text-red-200">Camera access requires a secure connection (HTTPS).</p>
              </div>
            </div>
          </div>
        )}

        {/* Video Container */}
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
              <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover rounded-2xl" />

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
                  <p className="text-3xl font-bold text-white mb-3">Ready for Analysis</p>
                  <p className="text-gray-400 text-lg mb-6">Start your camera to begin real-time skin analysis</p>

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
