import { NextResponse } from "next/server"
import { readdirSync, statSync, mkdirSync } from "fs"
import { join } from "path"

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs' // Specify Node.js runtime

export async function GET() {
  const uploadDir = join(process.cwd(), "public/uploads")
  let files = []

  try {
    // Use sync versions of fs functions
    mkdirSync(uploadDir, { recursive: true })
    const fileNames = readdirSync(uploadDir)
    
    files = fileNames.map((name, index) => {
      const filePath = join(uploadDir, name)
      const stats = statSync(filePath)
      return {
        id: index + 1,
        name,
        size: stats.size,
        path: `/uploads/${name}`,
        lastUpdated: stats.mtime.toISOString()
      }
    })

    return NextResponse.json(files)
  } catch (error) {
    console.error("Error reading uploads directory:", error)
    return NextResponse.json({ error: "Failed to fetch resources" }, { status: 500 })
  }
}