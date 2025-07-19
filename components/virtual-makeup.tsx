"use client"

import type React from "react"

import { useRef, useEffect, useState, useCallback } from "react"

interface MakeupOverlayProps {
  landmarks: number[][]
  selectedMakeup: Array<{
    id: string
    name: string
    category: string
    color: string
    intensity: number
  }>
  videoRef: React.RefObject<HTMLVideoElement>
}

export function MakeupOverlay({ landmarks, selectedMakeup, videoRef }: MakeupOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })

  const drawMakeup = useCallback(() => {
    if (!canvasRef.current || !videoRef.current || !landmarks.length) return

    const canvas = canvasRef.current
    const video = videoRef.current
    const ctx = canvas.getContext("2d")

    if (!ctx) return

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    setDimensions({ width: canvas.width, height: canvas.height })

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    selectedMakeup.forEach((makeup) => {
      ctx.globalAlpha = makeup.intensity / 100
      ctx.fillStyle = makeup.color

      switch (makeup.category) {
        case "foundation":
          drawFoundation(ctx, landmarks, canvas.width, canvas.height)
          break
        case "lipstick":
          drawLipstick(ctx, landmarks, canvas.width, canvas.height)
          break
        case "eyeshadow":
          drawEyeshadow(ctx, landmarks, canvas.width, canvas.height)
          break
        case "blush":
          drawBlush(ctx, landmarks, canvas.width, canvas.height)
          break
        case "eyeliner":
          drawEyeliner(ctx, landmarks, canvas.width, canvas.height)
          break
      }
      ctx.globalAlpha = 1
    })
  }, [landmarks, selectedMakeup, videoRef])

  const drawFoundation = (ctx: CanvasRenderingContext2D, landmarks: number[][], width: number, height: number) => {
    // Face contour landmarks for foundation
    const faceContour = [
      10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379, 378, 400, 377, 152, 148, 176, 149, 150,
      136, 172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109,
    ]

    ctx.beginPath()
    faceContour.forEach((idx, i) => {
      if (idx < landmarks.length) {
        const x = landmarks[idx][0] * width
        const y = landmarks[idx][1] * height
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
    })
    ctx.closePath()
    ctx.fill()
  }

  const drawLipstick = (ctx: CanvasRenderingContext2D, landmarks: number[][], width: number, height: number) => {
    // Lip landmarks
    const upperLip = [61, 84, 17, 314, 405, 320, 307, 375, 321, 308, 324, 318]
    const lowerLip = [78, 95, 88, 178, 87, 14, 317, 402, 318, 324, 308, 415]

    // Draw upper lip
    ctx.beginPath()
    upperLip.forEach((idx, i) => {
      if (idx < landmarks.length) {
        const x = landmarks[idx][0] * width
        const y = landmarks[idx][1] * height
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
    })
    ctx.closePath()
    ctx.fill()

    // Draw lower lip
    ctx.beginPath()
    lowerLip.forEach((idx, i) => {
      if (idx < landmarks.length) {
        const x = landmarks[idx][0] * width
        const y = landmarks[idx][1] * height
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
    })
    ctx.closePath()
    ctx.fill()
  }

  const drawEyeshadow = (ctx: CanvasRenderingContext2D, landmarks: number[][], width: number, height: number) => {
    // Left eye landmarks
    const leftEye = [33, 7, 163, 144, 145, 153, 154, 155, 133, 173, 157, 158, 159, 160, 161, 246]
    // Right eye landmarks
    const rightEye = [362, 382, 381, 380, 374, 373, 390, 249, 263, 466, 388, 387, 386, 385, 384, 398][
      (leftEye, rightEye)
    ].forEach((eyeLandmarks) => {
      ctx.beginPath()
      eyeLandmarks.forEach((idx, i) => {
        if (idx < landmarks.length) {
          const x = landmarks[idx][0] * width
          const y = landmarks[idx][1] * height
          if (i === 0) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        }
      })
      ctx.closePath()
      ctx.fill()
    })
  }

  const drawBlush = (ctx: CanvasRenderingContext2D, landmarks: number[][], width: number, height: number) => {
    // Cheek landmarks
    const leftCheek = [
      116, 117, 118, 119, 120, 121, 126, 142, 36, 205, 206, 207, 213, 192, 147, 187, 207, 213, 192, 147,
    ]
    const rightCheek = [345, 346, 347, 348, 349, 350, 451, 452, 453, 464, 435, 410, 454, 323, 361, 340][
      (leftCheek, rightCheek)
    ].forEach((cheekLandmarks) => {
      const centerX =
        cheekLandmarks.reduce((sum, idx) => {
          return idx < landmarks.length ? sum + landmarks[idx][0] * width : sum
        }, 0) / cheekLandmarks.length

      const centerY =
        cheekLandmarks.reduce((sum, idx) => {
          return idx < landmarks.length ? sum + landmarks[idx][1] * height : sum
        }, 0) / cheekLandmarks.length

      const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 40)
      gradient.addColorStop(0, ctx.fillStyle as string)
      gradient.addColorStop(1, "transparent")

      ctx.fillStyle = gradient
      ctx.beginPath()
      ctx.arc(centerX, centerY, 40, 0, 2 * Math.PI)
      ctx.fill()
    })
  }

  const drawEyeliner = (ctx: CanvasRenderingContext2D, landmarks: number[][], width: number, height: number) => {
    // Upper eyelid landmarks for eyeliner
    const leftUpperEyelid = [33, 7, 163, 144, 145, 153, 154, 155, 133]
    const rightUpperEyelid = [362, 382, 381, 380, 374, 373, 390, 249, 263]

    ctx.lineWidth = 3
    ctx.strokeStyle = ctx.fillStyle as string
    ;[leftUpperEyelid, rightUpperEyelid].forEach((eyelidLandmarks) => {
      ctx.beginPath()
      eyelidLandmarks.forEach((idx, i) => {
        if (idx < landmarks.length) {
          const x = landmarks[idx][0] * width
          const y = landmarks[idx][1] * height
          if (i === 0) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        }
      })
      ctx.stroke()
    })
  }

  useEffect(() => {
    const interval = setInterval(drawMakeup, 16) // ~60fps
    return () => clearInterval(interval)
  }, [drawMakeup])

  return (
    <canvas
      ref={canvasRef}
      className="absolute top-0 left-0 w-full h-full pointer-events-none z-10"
      style={{
        width: "100%",
        height: "100%",
        mixBlendMode: "multiply",
      }}
    />
  )
}
