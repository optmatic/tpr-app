import { readdir, stat } from "fs/promises";
import { join } from "path";
import { NextResponse } from "next/server";

// Add type for resource
interface Resource {
  id: string;
  name: string;
  size: number;
  lastUpdated: string;
  yearLevel: string;
  subject: string;
  path: string;
  imageUrl: string | null;
}

export async function GET() {
  try {
    const uploadDir = join(process.cwd(), "public/uploads");
    const imageDir = join(process.cwd(), "public/uploads/images");

    // Read the uploads directory
    const files = await readdir(uploadDir);

    // Get details for each file
    const resourcePromises = files.map(async (filename) => {
      // Skip the images directory itself
      if (filename === "images") return null;

      const filePath = join(uploadDir, filename);
      const fileStats = await stat(filePath);

      // Try to find matching image (assuming same name with image extension)
      let imageUrl = null;
      try {
        const imageFiles = await readdir(imageDir);
        // Look for an image that starts with the same name
        const matchingImage = imageFiles.find((img) =>
          img.startsWith(filename.split(".")[0])
        );
        if (matchingImage) {
          imageUrl = `/uploads/images/${matchingImage}`;
        }
      } catch (e) {
        // No matching image found
      }

      // Return typed resource
      return {
        id: filename,
        name: filename,
        size: fileStats.size,
        lastUpdated: fileStats.mtime.toISOString(),
        // Default values since we don't have a DB yet
        yearLevel: "unknown",
        subject: "unknown",
        path: `/uploads/${filename}`,
        imageUrl: imageUrl,
      } as Resource;
    });

    const resources = await Promise.all(resourcePromises);

    // Filter out null values first, then sort
    const validResources = resources.filter((r): r is Resource => r !== null);
    const sortedResources = validResources.sort(
      (a, b) =>
        new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()
    );

    return NextResponse.json(sortedResources);
  } catch (error) {
    console.error("Error reading resources:", error);
    return NextResponse.json(
      { error: "Failed to fetch resources" },
      { status: 500 }
    );
  }
}
