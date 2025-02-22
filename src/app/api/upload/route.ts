import { put } from "@vercel/blob"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url)
  const filename = searchParams.get("filename")

  if (!filename) {
    return NextResponse.json({ error: "Filename is required" }, { status: 400 })
  }

  try {
    const blob = await put(filename, request.body, {
      access: "public",
    })

    return NextResponse.json(blob)
  } catch (error) {
    return NextResponse.json({ error: "Error uploading file" }, { status: 500 })
  }
}

