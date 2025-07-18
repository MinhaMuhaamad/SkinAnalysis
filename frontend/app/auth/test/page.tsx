"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function TestPage() {
  const [response, setResponse] = useState<string>("")
  const [loading, setLoading] = useState(false)

  const testAPI = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/auth/test")
      const data = await res.json()
      setResponse(JSON.stringify(data, null, 2))
    } catch (error) {
      setResponse(`Error: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-2xl mx-auto">
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">API Test Page</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={testAPI} disabled={loading} className="bg-purple-600 hover:bg-purple-700">
              {loading ? "Testing..." : "Test Backend API"}
            </Button>

            {response && <pre className="bg-gray-800 p-4 rounded text-green-400 text-sm overflow-auto">{response}</pre>}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
