import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { imageData } = await request.json()

    if (!imageData) {
      return NextResponse.json({ error: "No image data provided" }, { status: 400 })
    }

    // Simulate processing time
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Mock analysis result
    const mockResult = {
      success: true,
      skinTone: "Medium",
      undertone: "Warm",
      concerns: ["Uneven skin tone", "Dark circles"],
      recommendations: {
        foundations: ["Warm Beige Foundation", "Medium Coverage Concealer"],
        concealers: ["Peach Corrector", "Medium Concealer"],
        lipsticks: ["Coral Pink", "Berry Red"],
        eyeshadows: ["Warm Browns", "Golden Tones"],
        blushes: ["Peachy Pink", "Coral Blush"],
        skincare: ["Vitamin C Serum", "Moisturizing Cream"],
      },
      confidence: 85,
      analysis_details: {
        average_color: [180, 140, 120],
        brightness: 128,
        skin_coverage: 75,
        pixel_count: 307200,
      },
      timestamp: new Date().toISOString(),
    }

    return NextResponse.json(mockResult)
  } catch (error) {
    console.error("Skin analysis error:", error)
    return NextResponse.json(
      { error: "Failed to analyze skin", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
