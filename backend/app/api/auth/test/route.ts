import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({
    message: "Backend API is working!",
    timestamp: new Date().toISOString(),
  })
}

export async function POST() {
  return NextResponse.json({
    message: "POST request successful!",
    timestamp: new Date().toISOString(),
  })
}
