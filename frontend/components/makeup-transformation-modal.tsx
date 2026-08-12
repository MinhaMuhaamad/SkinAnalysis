"use client"

import type React from "react"
import { useState, useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import { BeforeAfterSlider } from "./before-after-slider"
import { Upload, Camera, Wand2, X, AlertCircle } from "lucide-react"
import Image from "next/image"

interface MakeupTransformationModalProps {
  look: { // Changed from lookData to look to match the prop name
    id: string
    name: string
    image: string
    occasion: string
    style: string
  }
  onClose: () => void
}

export function MakeupTransformationModal({ look, onClose }: MakeupTransformationModalProps) {
  const [step, setStep] = useState<"upload" | "processing" | "result">("upload")
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [transformedImage, setTransformedImage] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid File Type",
        description: "Please upload an image file (JPG, PNG, etc.)",
        variant: "destructive",
      })
      return
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please upload an image smaller than 10MB",
        variant: "destructive",
      })
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      setUploadedImage(result)
      setError(null)
    }
    reader.readAsDataURL(file)
  }

  const handleTransform = async () => {
    if (!uploadedImage) return

    setIsProcessing(true)
    setStep("processing")
    setProgress(0)
    setError(null)

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + Math.random() * 15
        })
      }, 500)

      const response = await fetch("/api/transform-makeup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imageData: uploadedImage,
          lookStyle: { style: look.style.toLowerCase() },
          lookId: look.id,
        }),
      })

      const result = await response.json()
      clearInterval(progressInterval)
      setProgress(100)

      if (result.success) {
        setTransformedImage(result.transformed_image)
        setStep("result")
        toast({
          title: "Transformation Complete! ✨",
          description: `Applied ${look.name} look successfully`,
        })
      } else {
        throw new Error(result.error || "Transformation failed")
      }
    } catch (error) {
      console.error("Transformation error:", error)
      setError(error instanceof Error ? error.message : "Unknown error occurred")
      toast({
        title: "Transformation Failed",
        description: "Please try again with a different image",
        variant: "destructive",
      })
      setStep("upload")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleReset = () => {
    setStep("upload")
    setUploadedImage(null)
    setTransformedImage(null)
    setProgress(0)
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleDownload = () => {
    if (!transformedImage) return

    const link = document.createElement("a")
    link.download = `${look.name.replace(/\s+/g, "-").toLowerCase()}-transformation.jpg`
    link.href = transformedImage
    link.click()

    toast({
      title: "Image Downloaded! 📸",
      description: "Your transformation has been saved",
    })
  }

  const handleShare = async () => {
    if (!transformedImage) return

    try {
      if (navigator.share) {
        // Convert base64 to blob for sharing
        const response = await fetch(transformedImage)
        const blob = await response.blob()
        const file = new File([blob], `${look.name}-transformation.jpg`, { type: "image/jpeg" })

        await navigator.share({
          title: `My ${look.name} Transformation`,
          text: `Check out my makeup transformation using MakeupAI!`,
          files: [file],
        })
      } else {
        // Fallback: copy link to clipboard
        await navigator.clipboard.writeText(window.location.href)
        toast({
          title: "Link Copied!",
          description: "Share link has been copied to clipboard",
        })
      }
    } catch (error) {
      console.error("Share error:", error)
      toast({
        title: "Share Failed",
        description: "Unable to share at this time",
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-purple-900/20 to-pink-900/20 border-purple-400/20">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Wand2 className="h-6 w-6 text-pink-400" />
              <span className="text-shimmer">Transform with {look.name}</span>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Look Info */}
          <Card className="card-premium">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="relative w-16 h-16 rounded-lg overflow-hidden">
                  <Image src={look.image || "/placeholder.svg"} alt={look.name} fill className="object-cover" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-foreground/90">{look.name}</h3>
                  <div className="flex gap-2 mt-2">
                    <Badge variant="secondary" className="bg-pink-500/20 text-pink-400">
                      {look.occasion}
                    </Badge>
                    <Badge variant="outline" className="border-purple-400/30 text-purple-400">
                      {look.style} Style
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Step Content */}
          {step === "upload" && (
            <div className="space-y-6">
              <Card className="card-premium">
                <CardContent className="p-6">
                  <div className="text-center space-y-4">
                    <div className="mx-auto w-20 h-20 bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded-full flex items-center justify-center">
                      <Upload className="h-10 w-10 text-pink-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-foreground/90 mb-2">Upload Your Photo</h3>
                      <p className="text-foreground/70">
                        Upload a clear, front-facing photo for the best transformation results
                      </p>
                    </div>

                    <div className="space-y-4">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <Button onClick={() => fileInputRef.current?.click()} className="btn-premium px-8 py-3 text-lg">
                        <Camera className="mr-2 h-5 w-5" />
                        Choose Photo
                      </Button>
                    </div>

                    {/* Tips */}
                    <div className="bg-blue-500/10 border border-blue-400/20 rounded-lg p-4 text-left">
                      <h4 className="font-semibold text-blue-400 mb-2">📸 Photo Tips:</h4>
                      <ul className="text-sm text-foreground/70 space-y-1">
                        <li>• Use good lighting (natural light works best)</li>
                        <li>• Face the camera directly</li>
                        <li>• Keep your face clearly visible</li>
                        <li>• Avoid heavy shadows or filters</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Preview uploaded image */}
              {uploadedImage && (
                <Card className="card-premium">
                  <CardContent className="p-4">
                    <div className="space-y-4">
                      <h4 className="font-semibold text-foreground/90">Preview</h4>
                      <div className="relative w-full max-w-md mx-auto aspect-square rounded-lg overflow-hidden">
                        <Image
                          src={uploadedImage || "/placeholder.svg"}
                          alt="Uploaded photo"
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex gap-3 justify-center">
                        <Button
                          variant="outline"
                          onClick={handleReset}
                          className="glass-morphism border-white/20 bg-transparent"
                        >
                          Choose Different Photo
                        </Button>
                        <Button onClick={handleTransform} className="btn-premium px-8">
                          <Wand2 className="mr-2 h-4 w-4" />
                          Apply Transformation
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {step === "processing" && (
            <Card className="card-premium">
              <CardContent className="p-8">
                <div className="text-center space-y-6">
                  <div className="mx-auto w-20 h-20 bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded-full flex items-center justify-center">
                    <Wand2 className="h-10 w-10 text-pink-400 animate-spin" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-foreground/90 mb-2">Applying Transformation</h3>
                    <p className="text-foreground/70">
                      AI is analyzing your face and applying the {look.name} look...
                    </p>
                  </div>
                  <div className="space-y-3">
                    <Progress value={progress} className="w-full max-w-md mx-auto" />
                    <p className="text-sm text-foreground/60">{Math.round(progress)}% complete</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {step === "result" && uploadedImage && transformedImage && (
            <BeforeAfterSlider
              beforeImage={uploadedImage}
              afterImage={transformedImage}
              referenceImage={look.image}
              lookName={look.name}
              onDownload={handleDownload}
              onReset={handleReset}
              onShare={handleShare}
            />
          )}

          {/* Error State */}
          {error && (
            <Card className="card-premium border-red-400/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 text-red-400">
                  <AlertCircle className="h-5 w-5" />
                  <div>
                    <h4 className="font-semibold">Transformation Failed</h4>
                    <p className="text-sm text-foreground/70">{error}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
