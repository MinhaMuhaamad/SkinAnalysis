import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { imageData } = await request.json()

    if (!imageData) {
      return NextResponse.json({ error: "No image data provided" }, { status: 400 })
    }

    // Simulate processing time
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Mock analysis results
    const mockResults = {
      skinTone: ["Fair", "Light", "Medium", "Tan", "Deep"][Math.floor(Math.random() * 5)],
      confidence: Math.floor(Math.random() * 20) + 80, // 80-100%
      undertone: ["Cool", "Warm", "Neutral"][Math.floor(Math.random() * 3)],
      skinType: ["Dry", "Oily", "Combination", "Normal"][Math.floor(Math.random() * 4)],
      recommendations: [
        "Try warm-toned foundations for your skin undertone",
        "Consider using a primer for better makeup longevity",
        "Peachy blush would complement your skin tone beautifully",
      ],
      timestamp: new Date().toISOString(),
    }

    return NextResponse.json(mockResults)
  } catch (error) {
    console.error("Skin analysis error:", error)
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 })
  }
}
