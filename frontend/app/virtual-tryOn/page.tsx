"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import Link from "next/link"
import { renderMakeup } from "@/lib/makeupRenderer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
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
  const [showPermissionModal, setShowPermissionModal] = useState(false)
  const [stream, setStream] = useState<MediaStream | null>(null)
  
  // Processing & Rendering State
  const [isProcessing, setIsProcessing] = useState(false)
  const [processedImage, setProcessedImage] = useState<string | null>(null)
  const [viewOriginal, setViewOriginal] = useState(false)
  const [autoApply, setAutoApply] = useState(false)
  const [savedLooks, setSavedLooks] = useState<any[]>([])
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  // Client-Side ML Pipeline & Error States
  const [modelLoaded, setModelLoaded] = useState(false)
  const [statusText, setStatusText] = useState("Inactive")
  const [noFaceDetected, setNoFaceDetected] = useState(false)
  const [unsupportedBrowser, setUnsupportedBrowser] = useState(false)
  const [permissionDenied, setPermissionDenied] = useState(false)
  
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

  // Client-side ML Pipeline refs
  const faceLandmarkerRef = useRef<any>(null)
  const makeupSettingsRef = useRef<MakeupSettings>(makeupSettings)
  const viewOriginalRef = useRef<boolean>(viewOriginal)
  const noFaceDetectedRef = useRef<boolean>(false)
  const currentLandmarksRef = useRef<any | null>(null)
  const landmarkHistoryRef = useRef<any[][]>([])
  const processingResRef = useRef({ width: 640, height: 480 })
  const frameTimesRef = useRef<number[]>([])
  const lastDetectedTimestampRef = useRef<number>(-1)

  // Console Logging Flags (Ensure each stage logs exactly once)
  const logFlagsRef = useRef({
    webrtcSupported: false,
    cameraReady: false,
    modelLoaded: false,
    firstFrame: false,
    firstFace: false,
    firstOverlay: false,
  })

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
    const token = localStorage.getItem("authToken")
    setIsLoggedIn(!!token)

    const fetchRecommendations = async () => {
      if (!token) return

      try {
        const response = await fetch("/api/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        if (response.ok) {
          const data = await response.json()
          if (data.success && data.user) {
            // Load saved looks
            if (data.user.savedLooks) {
              const sortedLooks = [...data.user.savedLooks].sort(
                (a: any, b: any) => new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime()
              )
              setSavedLooks(sortedLooks)
            }

            // Set recommended shades
            if (data.user.skinAnalyses?.length > 0) {
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
        }
      } catch (err) {
        console.error("Error fetching recommended shades:", err)
      }
    }

    fetchRecommendations()
    checkPermissions()

    // Query browser Permissions API if supported
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: "camera" as any })
        .then((result) => {
          setPermissionState(result.state as any)
          result.onchange = () => {
            setPermissionState(result.state as any)
          }
        })
        .catch((err) => {
          console.error("Error querying camera permission:", err)
        })
    }
  }, [checkPermissions])

  // MediaPipe Face Landmarker model loader (client-side dynamic import)
  useEffect(() => {
    let active = true;

    const loadMediaPipe = async () => {
      if (faceLandmarkerRef.current) return;

      try {
        if (!logFlagsRef.current.modelLoaded) {
          console.log("ℹ️ [VIRTUAL TRY-ON] MediaPipe Face Landmarker model loading started.");
        }
        setStatusText("Loading face model...");
        const { FilesetResolver, FaceLandmarker } = await import("@mediapipe/tasks-vision");
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.8/wasm"
        );
        const landmarker = await FaceLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
            delegate: "GPU",
          },
          runningMode: "VIDEO",
          numFaces: 1,
        });

        if (active) {
          faceLandmarkerRef.current = landmarker;
          setModelLoaded(true);
          setStatusText("Live");
          if (!logFlagsRef.current.modelLoaded) {
            console.log("ℹ️ [VIRTUAL TRY-ON] MediaPipe Face Landmarker model loaded successfully.");
            logFlagsRef.current.modelLoaded = true;
          }
        }
      } catch (err) {
        console.error("❌ [VIRTUAL TRY-ON] Failed to load MediaPipe Face Landmarker:", err);
        if (active) {
          toast({
            title: "Model Load Failure",
            description: "Failed to initialize face mesh model. Real-time overlays may not render.",
            variant: "destructive",
          });
        }
      }
    };

    // Verify browser has WebRTC media devices support
    if (typeof window !== "undefined" && navigator.mediaDevices) {
      if (!logFlagsRef.current.webrtcSupported) {
        console.log("ℹ️ [VIRTUAL TRY-ON] Browser WebRTC support verified.");
        logFlagsRef.current.webrtcSupported = true;
      }
      loadMediaPipe();
    } else {
      setUnsupportedBrowser(true);
    }

    return () => {
      active = false;
    };
  }, [toast]);

  // Start Camera
  const startCamera = async (deviceId?: string) => {
    setIsLoading(true);
    setPermissionDenied(false);
    setStatusText("Starting camera...");
    if (!logFlagsRef.current.cameraReady) {
      console.log("ℹ️ [VIRTUAL TRY-ON] Camera permission requested.");
    }

    try {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }

      const activeDeviceId = deviceId !== undefined ? deviceId : selectedDeviceId;
      const constraints: MediaStreamConstraints = {
        video: activeDeviceId ? { deviceId: { exact: activeDeviceId } } : { facingMode: "user" },
        audio: false,
      };

      const newStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(newStream);

      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
        try {
          await videoRef.current.play();
          console.log("📹 [VIRTUAL TRY-ON] Camera video stream playing successfully.");
          if (!logFlagsRef.current.cameraReady) {
            console.log("ℹ️ [VIRTUAL TRY-ON] Camera ready. Stream started successfully.");
            logFlagsRef.current.cameraReady = true;
          }
        } catch (playErr) {
          console.error("Error playing video stream:", playErr);
        }
      }

      setIsActive(true);
      setPermissionState("granted");
      setStatusText(faceLandmarkerRef.current ? "Live" : "Loading face model...");
    } catch (err: any) {
      console.error("Camera start failed:", err);
      setPermissionState("denied");
      setPermissionDenied(true);
      setShowPermissionModal(true);
      toast({
        title: "Camera Permission Required",
        description: "Please allow camera permissions in your browser to use the Virtual Try-On.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Stop Camera
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
    setStream(null);
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsActive(false);
    setProcessedImage(null);
    currentLandmarksRef.current = null;
    setStatusText("Inactive");
  };

  // Exponential moving average for landmark temporal smoothing to filter out high-frequency noise
  const smoothLandmarks = (rawLandmarks: any[]): any[] => {
    const history = landmarkHistoryRef.current;
    history.push(rawLandmarks);
    if (history.length > 3) {
      history.shift();
    }

    const smoothed: any[] = [];
    const numLandmarks = rawLandmarks.length;

    for (let i = 0; i < numLandmarks; i++) {
      let sumX = 0, sumY = 0, sumZ = 0;
      history.forEach((frame) => {
        sumX += frame[i].x;
        sumY += frame[i].y;
        sumZ += frame[i].z || 0;
      });
      smoothed.push({
        x: sumX / history.length,
        y: sumY / history.length,
        z: sumZ / history.length,
      });
    }
    return smoothed;
  };

  // Preset Look Loader
  const applyPreset = (preset: any) => {
    setMakeupSettings((prev) => {
      const nextSettings = { ...prev }
      const keys: (keyof MakeupSettings)[] = ["lipstick", "eyeshadow", "blush", "foundation", "eyeliner", "eyebrow"]
      
      keys.forEach((k) => {
        const presetVal = preset.settings[k]
        if (presetVal) {
          if (k === "eyeliner") {
            nextSettings.eyeliner = {
              enabled: !!presetVal.enabled,
              color: presetVal.color || prev.eyeliner.color,
              intensity: presetVal.intensity ?? prev.eyeliner.intensity,
              thickness: presetVal.thickness ?? prev.eyeliner.thickness,
            }
          } else {
            nextSettings[k] = {
              enabled: !!presetVal.enabled,
              color: presetVal.color || prev[k].color,
              intensity: presetVal.intensity ?? prev[k].intensity,
            } as any
          }
        } else {
          if (k === "eyeliner") {
            nextSettings.eyeliner = {
              ...prev.eyeliner,
              enabled: false
            }
          } else {
            nextSettings[k] = {
              ...prev[k],
              enabled: false
            } as any
          }
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
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `makeupai-look-${Date.now()}.jpg`;
    link.href = canvas.toDataURL("image/jpeg", 0.9);
    link.click();
    toast({
      title: "Image Downloaded! 📱",
      description: "Your Virtual Try-On photo has been saved to your device.",
    });
  }

  // Sync refs with React state to prevent requestAnimationFrame tear-downs
  useEffect(() => {
    makeupSettingsRef.current = makeupSettings;
  }, [makeupSettings]);

  useEffect(() => {
    viewOriginalRef.current = viewOriginal;
  }, [viewOriginal]);

  // Capture the raw webcam feed mirrored (for "Before" photo)
  const captureBeforeFrame = (): string | null => {
    if (!videoRef.current || !isActive) return null;

    const video = videoRef.current;
    if (video.videoWidth === 0 || video.videoHeight === 0 || video.readyState < 2) {
      return null;
    }

    const offscreen = document.createElement("canvas");
    offscreen.width = video.videoWidth;
    offscreen.height = video.videoHeight;
    const ctx = offscreen.getContext("2d");
    if (!ctx) return null;

    // Draw frame (horizontally flipped for mirroring)
    ctx.translate(offscreen.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, offscreen.width, offscreen.height);
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    return offscreen.toDataURL("image/jpeg", 0.8);
  };

  // Capture the canvas with makeup overlays applied (for "After" photo)
  const captureAfterFrame = (): string | null => {
    const canvas = canvasRef.current;
    if (!canvas || !isActive) return null;
    return canvas.toDataURL("image/jpeg", 0.8);
  };

  // Client-side makeup apply triggers (just updates the ref immediately)
  const applyMakeup = () => {
    makeupSettingsRef.current = makeupSettings;
    toast({
      title: "Makeup Settings Applied! 💄",
      description: "Real-time client-side overlay settings have been updated.",
    });
  };

  // Capture & Save Look (Before & After) to Database fully client-side
  const captureLook = async () => {
    if (!isActive) {
      toast({
        title: "No Try-On Active",
        description: "Please start the camera before capturing a look.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      const beforeImage = captureBeforeFrame();
      const afterImage = captureAfterFrame();

      if (!beforeImage || !afterImage) {
        throw new Error("Frame capture failed. Please make sure the camera is running and face is tracked.");
      }

      const token = localStorage.getItem("authToken");
      if (!token) {
        toast({
          title: "Login Required",
          description: "Please log in to save your captured looks to your profile.",
          variant: "destructive",
        });
        setIsProcessing(false);
        return;
      }

      const response = await fetch("/api/auth/save-look", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          beforeImage,
          afterImage,
          makeupSettings,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP Error ${response.status}`);
      }

      const result = await response.json();

      if (result.success && result.look) {
        setSavedLooks((prev) => [result.look, ...prev]);
        toast({
          title: "Look Captured & Saved! 📸",
          description: "Both Before and After images have been saved to your profile.",
        });
      } else {
        throw new Error(result.message || "Failed to save look configuration.");
      }
    } catch (err: any) {
      console.error("Save look failed:", err);
      toast({
        title: "Capture Look Failed",
        description: err.message || "An error occurred while saving the photos.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Clean up on component unmount
  useEffect(() => {
    return () => {
      if (autoApplyIntervalRef.current) {
        clearInterval(autoApplyIntervalRef.current);
      }
    };
  }, []);

  // Main client-side detection & canvas render loop
  useEffect(() => {
    let frameId: number;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    let lastTimestamp = -1;

    const drawLoop = () => {
      frameId = requestAnimationFrame(drawLoop);

      if (!isActive || !video || !canvas) return;

      // Only begin once video has frame data ready to prevent black canvases
      if (video.readyState < 2) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const startTime = performance.now();

      // Sync canvas dimensions with camera input or processing res
      const targetWidth = processingResRef.current.width;
      const targetHeight = processingResRef.current.height;
      if (canvas.width !== targetWidth || canvas.height !== targetHeight) {
        canvas.width = targetWidth;
        canvas.height = targetHeight;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 1. Draw raw video feed mirrored (capture frame)
      ctx.save();
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      ctx.restore();

      // 2. Run MediaPipe face tracking and extract landmarks
      if (faceLandmarkerRef.current) {
        const videoTime = video.currentTime * 1000;

        if (videoTime !== lastTimestamp) {
          lastTimestamp = videoTime;

          if (!logFlagsRef.current.firstFrame) {
            console.log("ℹ️ [VIRTUAL TRY-ON] First frame processed by face landmarker.");
            logFlagsRef.current.firstFrame = true;
          }

          try {
            const result = faceLandmarkerRef.current.detectForVideo(video, videoTime);

            if (result && result.faceLandmarks && result.faceLandmarks.length > 0) {
              const rawLandmarks = result.faceLandmarks[0];

              if (!logFlagsRef.current.firstFace) {
                console.log("ℹ️ [VIRTUAL TRY-ON] First face mesh landmarks detected successfully.");
                logFlagsRef.current.firstFace = true;
              }

              // Apply temporal smoothing to prevent jitter
              const smoothed = smoothLandmarks(rawLandmarks);
              currentLandmarksRef.current = smoothed;

              if (noFaceDetectedRef.current) {
                noFaceDetectedRef.current = false;
                setNoFaceDetected(false);
              }
            } else {
              currentLandmarksRef.current = null;
              if (!noFaceDetectedRef.current) {
                noFaceDetectedRef.current = true;
                setNoFaceDetected(true);
              }
            }
          } catch (err) {
            console.error("Error during landmark detection:", err);
          }
        }

        // 3. Render client-side makeup overlays on top of frame if face found
        const activeSettings = makeupSettingsRef.current;
        const hasEnabledMakeup = Object.values(activeSettings).some((s) => s.enabled);

        if (hasEnabledMakeup && currentLandmarksRef.current && !viewOriginalRef.current) {
          // Mirror landmarks horizontally to match mirrored video
          const mirroredLandmarks = currentLandmarksRef.current.map((lm: any) => ({
            x: 1 - lm.x,
            y: lm.y,
            z: lm.z,
          }));

          try {
            renderMakeup(ctx, mirroredLandmarks, activeSettings, canvas.width, canvas.height);

            if (!logFlagsRef.current.firstOverlay) {
              console.log("ℹ️ [VIRTUAL TRY-ON] First makeup overlay frame rendered to canvas.");
              logFlagsRef.current.firstOverlay = true;
            }
          } catch (renderErr) {
            console.error("Error rendering makeup overlays:", renderErr);
          }
        }
      }

      // 4. Performance Downscaling: Track frame time budget
      const duration = performance.now() - startTime;
      frameTimesRef.current.push(duration);
      if (frameTimesRef.current.length > 30) {
        frameTimesRef.current.shift();
        const avgDuration = frameTimesRef.current.reduce((a, b) => a + b, 0) / 30;

        // Downscale processing resolution if average frames consistently exceed 35ms (approx 28 FPS)
        if (avgDuration > 35 && processingResRef.current.width === 640) {
          processingResRef.current = { width: 480, height: 360 };
          console.warn(`⚠️ [VIRTUAL TRY-ON] Frame budget exceeded (${avgDuration.toFixed(1)}ms). Downscaling canvas to 480x360.`);
        } else if (avgDuration > 50 && processingResRef.current.width === 480) {
          processingResRef.current = { width: 320, height: 240 };
          console.warn(`⚠️ [VIRTUAL TRY-ON] Frame budget exceeded (${avgDuration.toFixed(1)}ms). Downscaling canvas to 320x240.`);
        }
      }
    };

    if (isActive) {
      frameId = requestAnimationFrame(drawLoop);
    }

    return () => {
      cancelAnimationFrame(frameId);
    };
  }, [isActive]);

  const hasEnabledMakeup = Object.values(makeupSettings).some((s) => s.enabled);

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
              Real-time professional makeup try-on powered by client-side MediaPipe FaceMesh algorithms.
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
                      {isActive && hasEnabledMakeup && !viewOriginal ? "Virtual Preview Active" : "Live Camera Stream"}
                    </CardTitle>
                    {isActive && (
                      <div className="flex items-center gap-2">
                        {hasEnabledMakeup && (
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
                            const newId = e.target.value
                            setSelectedDeviceId(newId)
                            if (isActive) {
                              setTimeout(() => startCamera(newId), 100)
                            }
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
                  
                  {/* Camera Video Stream (Offscreen - kept active but invisible to prevent browser suspension) */}
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="absolute pointer-events-none"
                    style={{ position: 'absolute', left: '-9999px', top: '-9999px', width: '640px', height: '480px', opacity: 1 }}
                  />

                  {/* Mirror Canvas (renders either raw webcam or processed makeup frame) */}
                  <canvas
                    ref={canvasRef}
                    className={`w-full h-full object-cover rounded-2xl ${
                      isActive ? "block" : "hidden"
                    }`}
                  />

                  {/* Live status indicators */}
                  {isActive && (
                    <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 flex items-center gap-2 z-10">
                      {statusText === "Loading face model..." ? (
                        <>
                          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500 animate-pulse"></div>
                          <span className="text-[10px] font-bold text-yellow-300 uppercase tracking-wider">Loading Model...</span>
                        </>
                      ) : statusText === "Starting camera..." ? (
                        <>
                          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500 animate-pulse"></div>
                          <span className="text-[10px] font-bold text-yellow-300 uppercase tracking-wider">Starting Camera...</span>
                        </>
                      ) : noFaceDetected ? (
                        <>
                          <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></div>
                          <span className="text-[10px] font-bold text-red-300 uppercase tracking-wider">No Face Detected</span>
                        </>
                      ) : hasEnabledMakeup && !viewOriginal ? (
                        <>
                          <div className="w-2.5 h-2.5 rounded-full bg-pink-500 animate-pulse"></div>
                          <span className="text-[10px] font-bold text-pink-300 uppercase tracking-wider">Try-On Active</span>
                        </>
                      ) : (
                        <>
                          <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></div>
                          <span className="text-[10px] font-bold text-green-300 uppercase tracking-wider">Camera Active</span>
                        </>
                      )}
                    </div>
                  )}

                  {/* No Face Detected Alert Overlay */}
                  {isActive && noFaceDetected && (
                    <div className="absolute inset-x-0 bottom-4 mx-auto w-max bg-red-950/85 border border-red-500/30 backdrop-blur-md px-4 py-2 rounded-xl text-center text-red-200 text-xs font-semibold shadow-lg animate-bounce z-10">
                      No face detected. Please face the camera.
                    </div>
                  )}

                  {/* Camera Permission Denied Screen */}
                  {permissionDenied && (
                    <div className="absolute inset-0 bg-gray-950/95 flex flex-col items-center justify-center p-6 text-center space-y-4 rounded-2xl border border-white/5 z-20">
                      <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
                        <AlertCircle className="w-8 h-8" />
                      </div>
                      <h3 className="text-xl font-bold">Camera Access Blocked</h3>
                      <p className="text-gray-400 text-xs max-w-xs">
                        Camera permissions were denied. Please enable camera access in your browser settings to try on makeup products.
                      </p>
                      <Button
                        onClick={() => {
                          setShowPermissionModal(true);
                          startCamera();
                        }}
                        className="bg-gradient-to-r from-pink-500 to-purple-500 hover:opacity-90 font-bold px-6 py-2 rounded-xl"
                      >
                        Grant Access
                      </Button>
                    </div>
                  )}

                  {/* Unsupported Browser Screen */}
                  {unsupportedBrowser && (
                    <div className="absolute inset-0 bg-gray-950/95 flex flex-col items-center justify-center p-6 text-center space-y-4 rounded-2xl border border-white/5 z-20">
                      <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
                        <AlertCircle className="w-8 h-8" />
                      </div>
                      <h3 className="text-xl font-bold">Browser Not Supported</h3>
                      <p className="text-gray-400 text-xs max-w-xs">
                        Your current browser does not support WebRTC webcam streaming (getUserMedia). Please try using Chrome, Safari, or Firefox.
                      </p>
                    </div>
                  )}

                  {/* Inactive Overlay */}
                  {!isActive && !isLoading && !permissionDenied && !unsupportedBrowser && (
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
                        onClick={() => {
                          if (permissionState === "denied") {
                            setShowPermissionModal(true)
                          } else {
                            startCamera()
                          }
                        }}
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
                      <p className="text-gray-400">{statusText}</p>
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
                    className="flex-1 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 font-bold py-6 rounded-xl shadow-lg"
                  >
                    <Brush className="w-5 h-5 mr-2" />
                    Apply Makeup Look
                  </Button>

                  <Button
                    onClick={captureLook}
                    disabled={isProcessing}
                    className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 font-bold py-6 rounded-xl shadow-lg border-0 text-white"
                  >
                    <Camera className="w-5 h-5 mr-2" />
                    Capture Look
                  </Button>
                  
                  <Button
                    onClick={downloadLook}
                    variant="outline"
                    className="border-white/10 hover:bg-white/10 font-bold py-6 px-6 rounded-xl"
                  >
                    <Download className="w-5 h-5" />
                  </Button>

                  <Button
                    onClick={stopCamera}
                    variant="outline"
                    className="border-red-500/30 text-red-400 hover:bg-red-500/10 font-bold py-6 px-6 rounded-xl animate-fade-in"
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

          {/* Saved Looks History Gallery */}
          {isLoggedIn ? (
            <Card className="mt-12 bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-rose-400/20 backdrop-blur-xl shadow-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-2xl bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                  <Camera className="h-6 w-6 text-pink-400" />
                  Your Saved Looks Gallery
                </CardTitle>
                <CardDescription className="text-gray-400 text-base">
                  View and compare your before & after looks, and restore their makeup settings instantly
                </CardDescription>
              </CardHeader>
              <CardContent>
                {savedLooks.length === 0 ? (
                  <div className="text-center py-12 text-gray-500 border border-dashed border-white/5 rounded-2xl">
                    <p className="text-lg">No saved looks found.</p>
                    <p className="text-sm text-gray-400 mt-1">Configure your makeup, apply it, and click "Capture Look" to save your first look!</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {savedLooks.map((look, index) => {
                      const dateStr = look.timestamp 
                        ? new Date(look.timestamp).toLocaleDateString(undefined, { 
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })
                        : "Unknown Date";
                      return (
                        <div 
                          key={look._id || index}
                          className="bg-black/35 rounded-2xl border border-white/5 p-6 space-y-4 hover:border-pink-500/20 transition-all duration-300 group"
                        >
                          <div className="flex justify-between items-center pb-2 border-b border-white/5">
                            <span className="text-sm font-semibold text-gray-300">{dateStr}</span>
                            <Button 
                              onClick={() => {
                                // Restore settings
                                setMakeupSettings(look.makeupSettings);
                                toast({
                                  title: "Settings Restored! 💄",
                                  description: "Makeup settings from this look have been loaded into the control panel."
                                });
                                // Scroll up to video
                                window.scrollTo({ top: 200, behavior: 'smooth' });
                              }}
                              className="bg-gradient-to-r from-pink-500 to-purple-500 text-xs px-3 py-1.5 h-auto text-white rounded-lg"
                            >
                              Restore Settings
                            </Button>
                          </div>

                          {/* Side-by-Side Images */}
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                              <span className="text-xs text-gray-400 text-center block font-semibold">Before (Original)</span>
                              <div className="relative aspect-video rounded-xl overflow-hidden border border-white/5 bg-gray-900">
                                <img 
                                  src={look.beforeImage} 
                                  alt="Original face"
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            </div>
                            <div className="space-y-1.5">
                              <span className="text-xs text-pink-300 text-center block font-semibold">After (Makeup Applied)</span>
                              <div className="relative aspect-video rounded-xl overflow-hidden border border-pink-500/10 bg-gray-900">
                                <img 
                                  src={look.afterImage} 
                                  alt="Makeup applied face"
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            </div>
                          </div>

                          {/* Active settings badge summaries */}
                          <div className="flex flex-wrap gap-1.5 pt-2">
                            {Object.entries(look.makeupSettings)
                              .filter(([_, set]: any) => set.enabled)
                              .map(([cat, set]: any) => (
                                <Badge key={cat} variant="secondary" className="bg-white/5 text-gray-400 border-0 text-[10px] px-2 py-0.5">
                                  <span className="w-1.5 h-1.5 rounded-full mr-1.5 inline-block" style={{ backgroundColor: set.color }}></span>
                                  {cat} ({set.intensity}%)
                                </Badge>
                              ))}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="mt-12 bg-gradient-to-br from-gray-800/40 to-gray-900/40 border border-white/10 backdrop-blur-xl p-8 text-center">
              <div className="max-w-md mx-auto space-y-4">
                <div className="w-16 h-16 bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded-full flex items-center justify-center mx-auto border border-white/5">
                  <Camera className="h-8 w-8 text-pink-400" />
                </div>
                <h3 className="text-2xl font-bold">Save Your Before & After Looks</h3>
                <p className="text-gray-400 text-base">
                  Log in to capture looks, compare your before and after results side-by-side, and save them permanently to your gallery.
                </p>
                <div className="flex justify-center gap-4 pt-2">
                  <Link href="/auth/login">
                    <Button variant="outline" className="border-pink-500/40 text-pink-200 hover:bg-pink-500/20 bg-transparent">
                      Log In
                    </Button>
                  </Link>
                  <Link href="/auth/signup">
                    <Button className="bg-gradient-to-r from-pink-500 to-purple-500">
                      Sign Up
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          )}

        </div>
      </div>
      
      {/* Hidden canvas for capturing video stream frames */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Camera Permission Settings Modal */}
      <Dialog open={showPermissionModal} onOpenChange={setShowPermissionModal}>
        <DialogContent className="bg-gray-950 border border-white/10 text-white rounded-2xl max-w-md p-6">
          <DialogHeader className="space-y-3">
            <div className="mx-auto w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
              <AlertCircle className="w-6 h-6" />
            </div>
            <DialogTitle className="text-xl font-bold text-center text-white">
              Camera Access Required
            </DialogTitle>
            <DialogDescription className="text-gray-400 text-sm text-center">
              We need access to your camera to overlay makeup filters onto your face in real-time.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 my-3 text-sm border-t border-b border-white/5 py-4">
            <h4 className="font-bold text-pink-300">How to grant permission:</h4>
            
            <div className="space-y-3">
              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-300 font-semibold text-xs shrink-0">
                  1
                </div>
                <p className="text-gray-300 text-xs">
                  Click the <strong>settings icon</strong> or <strong>lock icon (🔒/ℹ️)</strong> in the top-left corner of your browser's address bar.
                </p>
              </div>

              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-300 font-semibold text-xs shrink-0">
                  2
                </div>
                <p className="text-gray-300 text-xs">
                  Locate the <strong>Camera</strong> option and toggle it to <strong>Allow</strong>.
                </p>
              </div>

              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-300 font-semibold text-xs shrink-0">
                  3
                </div>
                <p className="text-gray-300 text-xs">
                  Click the <strong>Reload Page</strong> button below to activate your virtual mirror.
                </p>
              </div>
            </div>
          </div>

          <DialogFooter className="flex gap-3 sm:justify-between w-full">
            <Button
              onClick={() => {
                setShowPermissionModal(false)
                // Retry prompting the native camera dialog
                startCamera()
              }}
              variant="outline"
              className="flex-1 border-white/10 hover:bg-white/10 text-white bg-transparent rounded-xl py-5 hover:text-white"
            >
              Retry Access
            </Button>
            <Button
              onClick={() => window.location.reload()}
              className="flex-1 bg-gradient-to-r from-pink-500 to-purple-500 hover:opacity-90 text-white rounded-xl py-5 font-bold"
            >
              Reload Page
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
