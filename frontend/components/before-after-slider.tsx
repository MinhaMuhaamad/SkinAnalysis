"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, RotateCcw, Share2, Maximize2 } from "lucide-react"
import Image from "next/image"

interface BeforeAfterSliderProps {
  beforeImage: string
  afterImage: string
  referenceImage?: string
  lookName: string
  onDownload?: () => void
  onReset?: () => void
  onShare?: () => void
}

export function BeforeAfterSlider({
  beforeImage,
  afterImage,
  referenceImage,
  lookName,
  onDownload,
  onReset,
  onShare,
}: BeforeAfterSliderProps) {
  const [sliderPosition, setSliderPosition] = useState(50)
  const [isDragging, setIsDragging] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const sliderRef = useRef<HTMLDivElement>(null)

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    updateSliderPosition(e)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      updateSliderPosition(e)
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true)
    updateSliderPositionTouch(e)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isDragging) {
      updateSliderPositionTouch(e)
    }
  }

  const handleTouchEnd = () => {
    setIsDragging(false)
  }

  const updateSliderPosition = (e: React.MouseEvent) => {
    if (!containerRef.current) return

    const rect = containerRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100))
    setSliderPosition(percentage)
  }

  const updateSliderPositionTouch = (e: React.TouchEvent) => {
    if (!containerRef.current) return

    const rect = containerRef.current.getBoundingClientRect()
    const x = e.touches[0].clientX - rect.left
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100))
    setSliderPosition(percentage)
  }

  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (isDragging && containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        const x = e.clientX - rect.left
        const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100))
        setSliderPosition(percentage)
      }
    }

    const handleGlobalMouseUp = () => {
      setIsDragging(false)
    }

    if (isDragging) {
      document.addEventListener("mousemove", handleGlobalMouseMove)
      document.addEventListener("mouseup", handleGlobalMouseUp)
    }

    return () => {
      document.removeEventListener("mousemove", handleGlobalMouseMove)
      document.removeEventListener("mouseup", handleGlobalMouseUp)
    }
  }, [isDragging])

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  return (
    <div className={`space-y-6 ${isFullscreen ? "fixed inset-0 z-50 bg-black/95 p-8 flex flex-col" : ""}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-shimmer font-poppins">{lookName} Transformation</h3>
          <p className="text-foreground/70">Drag the slider to compare before and after</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleFullscreen}
            className="glass-morphism border-white/20 hover:bg-white/10 bg-transparent"
          >
            <Maximize2 className="h-4 w-4" />
          </Button>
          {onShare && (
            <Button
              variant="outline"
              size="sm"
              onClick={onShare}
              className="glass-morphism border-white/20 hover:bg-white/10 bg-transparent"
            >
              <Share2 className="h-4 w-4" />
            </Button>
          )}
          {onDownload && (
            <Button
              variant="outline"
              size="sm"
              onClick={onDownload}
              className="glass-morphism border-white/20 hover:bg-white/10 bg-transparent"
            >
              <Download className="h-4 w-4" />
            </Button>
          )}
          {onReset && (
            <Button
              variant="outline"
              size="sm"
              onClick={onReset}
              className="glass-morphism border-red-400/20 hover:bg-red-500/10 text-red-400 bg-transparent"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <div
        className={`grid gap-6 ${isFullscreen ? "flex-1" : ""} ${referenceImage ? "lg:grid-cols-3" : "lg:grid-cols-1"}`}
      >
        {/* Reference Image */}
        {referenceImage && (
          <Card className="card-premium">
            <CardContent className="p-4">
              <h4 className="text-lg font-semibold text-foreground/90 mb-3">Reference Look</h4>
              <div className="relative aspect-square rounded-lg overflow-hidden">
                <Image src={referenceImage || "/placeholder.svg"} alt="Reference look" fill className="object-cover" />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Before/After Slider */}
        <Card className={`card-premium ${referenceImage ? "lg:col-span-2" : ""} ${isFullscreen ? "flex-1" : ""}`}>
          <CardContent className="p-4">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="text-lg font-semibold text-foreground/90">Your Transformation</h4>
                <div className="flex gap-4 text-sm text-foreground/60">
                  <span className={sliderPosition > 50 ? "text-foreground/40" : "text-pink-400 font-semibold"}>
                    Before
                  </span>
                  <span className={sliderPosition < 50 ? "text-foreground/40" : "text-pink-400 font-semibold"}>
                    After
                  </span>
                </div>
              </div>

              <div
                ref={containerRef}
                className={`relative overflow-hidden rounded-lg cursor-ew-resize select-none ${isFullscreen ? "flex-1" : "aspect-square"}`}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                {/* After Image (Background) */}
                <div className="absolute inset-0">
                  <Image
                    src={afterImage || "/placeholder.svg"}
                    alt="After transformation"
                    fill
                    className="object-cover"
                    priority
                  />
                </div>

                {/* Before Image (Clipped) */}
                <div
                  className="absolute inset-0 overflow-hidden"
                  style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
                >
                  <Image
                    src={beforeImage || "/placeholder.svg"}
                    alt="Before transformation"
                    fill
                    className="object-cover"
                    priority
                  />
                </div>

                {/* Slider Line */}
                <div
                  className="absolute top-0 bottom-0 w-1 bg-white shadow-lg z-10 transition-all duration-100"
                  style={{ left: `${sliderPosition}%`, transform: "translateX(-50%)" }}
                >
                  {/* Slider Handle */}
                  <div
                    ref={sliderRef}
                    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-lg border-2 border-pink-400 cursor-ew-resize flex items-center justify-center hover:scale-110 transition-transform duration-200"
                  >
                    <div className="w-1 h-4 bg-pink-400 rounded-full"></div>
                  </div>
                </div>

                {/* Labels */}
                <div className="absolute top-4 left-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm font-medium">
                  Before
                </div>
                <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm font-medium">
                  After
                </div>
              </div>

              {/* Slider Progress */}
              <div className="flex items-center gap-4">
                <span className="text-sm text-foreground/60 min-w-[60px]">Before</span>
                <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-pink-400 to-purple-500 transition-all duration-200"
                    style={{ width: `${sliderPosition}%` }}
                  ></div>
                </div>
                <span className="text-sm text-foreground/60 min-w-[60px] text-right">After</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Close Fullscreen */}
      {isFullscreen && (
        <Button onClick={toggleFullscreen} className="btn-premium self-center px-8 py-3">
          Exit Fullscreen
        </Button>
      )}
    </div>
  )
}
