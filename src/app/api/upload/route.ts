import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Create uploads directory if it doesn't exist
    const uploadDir = join(process.cwd(), "public/uploads")
    try {
      await mkdir(uploadDir, { recursive: true })
    } catch (error) {
      // Directory already exists
    }

    // Convert File to Buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Write file to public/uploads
    const filePath = join(uploadDir, file.name)
    await writeFile(filePath, buffer)

    return NextResponse.json({
      name: file.name,
      path: `/uploads/${file.name}`,
      size: buffer.length,
    })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({ error: "Error uploading file" }, { status: 500 })
  }
}

