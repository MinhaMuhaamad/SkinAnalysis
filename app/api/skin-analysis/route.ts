import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    console.log("🔍 Skin analysis API called")

    const { imageData } = await request.json()

    if (!imageData) {
      console.error("❌ No image data provided")
      return NextResponse.json({ error: "No image data provided" }, { status: 400 })
    }

    console.log("📸 Image data received, length:", imageData.length)

    // Remove data URL prefix if present
    const base64Data = imageData.replace(/^data:image\/[a-z]+;base64,/, "")
    console.log("📸 Base64 data length:", base64Data.length)

    // For now, we'll return mock data since we don't have the Python backend running
    // In production, you would send this to your Python Flask/FastAPI backend
    console.log("🤖 Generating mock analysis result...")

    // Simulate processing time
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Mock analysis result
    const mockResult = {
      success: true,
      skinTone: getRandomSkinTone(),
      undertone: getRandomUndertone(),
      concerns: getRandomConcerns(),
      recommendations: {
        foundations: [
          "Fenty Beauty Pro Filt'r Soft Matte Foundation",
          "NARS Natural Radiant Longwear Foundation",
          "Maybelline Fit Me Matte + Poreless Foundation",
        ],
        concealers: [
          "Tarte Shape Tape Concealer",
          "NARS Radiant Creamy Concealer",
          "Maybelline Instant Age Rewind Concealer",
        ],
        lipsticks: ["MAC Ruby Woo", "Charlotte Tilbury Pillow Talk", "Fenty Beauty Stunna Lip Paint"],
        eyeshadows: ["Urban Decay Naked3 Palette", "Huda Beauty Desert Dusk Palette", "Morphe 35O Nature Glow Palette"],
        blushes: ["NARS Orgasm Blush", "Milani Baked Blush in Luminoso", "Tarte Amazonian Clay Blush"],
        skincare: [
          "CeraVe Daily Moisturizing Lotion",
          "The Ordinary Niacinamide 10% + Zinc 1%",
          "Neutrogena Ultra Sheer Dry-Touch Sunscreen SPF 100+",
        ],
      },
      confidence: Math.floor(Math.random() * 20) + 80, // 80-99%
      analysis_details: {
        average_color: [
          Math.floor(Math.random() * 255),
          Math.floor(Math.random() * 255),
          Math.floor(Math.random() * 255),
        ],
        brightness: Math.floor(Math.random() * 100) + 100,
        skin_coverage: Math.floor(Math.random() * 30) + 70,
        pixel_count: Math.floor(Math.random() * 100000) + 500000,
      },
      timestamp: new Date().toISOString(),
    }

    console.log("✅ Mock analysis result generated:", mockResult)
    return NextResponse.json(mockResult)
  } catch (error) {
    console.error("❌ Skin analysis error:", error)
    return NextResponse.json(
      {
        error: "Failed to analyze skin",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function GET() {
  return NextResponse.json({
    status: "Skin analysis API is running",
    timestamp: new Date().toISOString(),
  })
}

function getRandomSkinTone(): string {
  const tones = ["Fair", "Light", "Medium", "Tan", "Deep", "Dark"]
  return tones[Math.floor(Math.random() * tones.length)]
}

function getRandomUndertone(): string {
  const undertones = ["Cool", "Warm", "Neutral"]
  return undertones[Math.floor(Math.random() * undertones.length)]
}

function getRandomConcerns(): string[] {
  const allConcerns = [
    "Uneven skin tone",
    "Dark circles",
    "Blemishes",
    "Dryness",
    "Oily T-zone",
    "Fine lines",
    "Enlarged pores",
    "Redness",
  ]

  const numConcerns = Math.floor(Math.random() * 3) + 1 // 1-3 concerns
  const shuffled = allConcerns.sort(() => 0.5 - Math.random())
  return shuffled.slice(0, numConcerns)
}
