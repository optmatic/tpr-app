import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const image = formData.get("image") as File;
    const title = formData.get("title") as string;
    const yearLevel = formData.get("yearLevel") as string;
    const subject = formData.get("subject") as string;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Create uploads directory if it doesn't exist
    const uploadDir = join(process.cwd(), "public/uploads");
    const imageDir = join(process.cwd(), "public/uploads/images");
    await mkdir(uploadDir, { recursive: true });
    await mkdir(imageDir, { recursive: true });

    // Save the main file
    const fileBytes = await file.arrayBuffer();
    const fileBuffer = Buffer.from(fileBytes);
    const filePath = join(uploadDir, file.name);
    await writeFile(filePath, fileBuffer);

    // Handle the image if provided
    let imagePath = null;
    if (image) {
      const imageBytes = await image.arrayBuffer();
      const imageBuffer = Buffer.from(imageBytes);
      const imageFileName = `${Date.now()}-${image.name}`;
      const fullImagePath = join(imageDir, imageFileName);
      await writeFile(fullImagePath, imageBuffer);
      imagePath = `/uploads/images/${imageFileName}`; // Use URL path, not filesystem path
    }

    return NextResponse.json({
      name: file.name,
      path: `/uploads/${file.name}`,
      imagePath: imagePath,
      title,
      yearLevel,
      subject,
      size: fileBuffer.length,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Error uploading file" },
      { status: 500 }
    );
  }
}
