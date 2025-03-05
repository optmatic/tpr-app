import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const title = formData.get("title") as string;
    const yearLevel = formData.get("yearLevel") as string;
    const subject = formData.get("subject") as string;
    const image = formData.get("image") as File | null;

    if (!file || !title || !yearLevel || !subject) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create directories if they don't exist
    const uploadDir = join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });

    // Save the file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const fileName = `${Date.now()}-${file.name.replace(/\s+/g, "-")}`;
    const filePath = join(uploadDir, fileName);
    await writeFile(filePath, buffer);
    const downloadUrl = `/uploads/${fileName}`;

    // Save the image if provided
    let imagePath = null;
    if (image) {
      const imageBytes = await image.arrayBuffer();
      const imageBuffer = Buffer.from(imageBytes);
      const imageName = `${Date.now()}-${image.name.replace(/\s+/g, "-")}`;
      const imageSavePath = join(uploadDir, imageName);
      await writeFile(imageSavePath, imageBuffer);
      imagePath = `/uploads/${imageName}`;
    }

    // Save to database using Prisma
    const resource = await prisma.resource.create({
      data: {
        title,
        fileName: file.name,
        downloadUrl,
        thumbnail: imagePath,
        year: yearLevel,
        subject,
        curriculumCode: "-", // Default value
        topic: subject, // Using subject as topic for now
        description: "", // Empty description
      },
    });

    console.log("Resource saved to database:", resource);

    return NextResponse.json({
      id: resource.id,
      path: downloadUrl,
      imagePath,
      success: true,
    });
  } catch (error) {
    console.error("Error in upload API:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}
