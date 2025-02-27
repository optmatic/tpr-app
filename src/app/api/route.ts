import { NextResponse } from "next/server";
import { readdirSync, statSync, mkdirSync } from "fs";
import { join } from "path";

export const dynamic = "force-dynamic";
export const runtime = "nodejs"; // Specify Node.js runtime

export async function GET(request: Request) {
  const url = new URL(request.url);
  const path = url.pathname;

  // Handle file uploads listing
  if (path === "/api") {
    const uploadDir = join(process.cwd(), "public/uploads");
    let files = [];

    try {
      // Use sync versions of fs functions
      mkdirSync(uploadDir, { recursive: true });
      const fileNames = readdirSync(uploadDir);

      files = fileNames.map((name, index) => {
        const filePath = join(uploadDir, name);
        const stats = statSync(filePath);
        return {
          id: index + 1,
          name,
          size: stats.size,
          path: `/uploads/${name}`,
          lastUpdated: stats.mtime.toISOString(),
        };
      });

      return NextResponse.json(files);
    } catch (error) {
      console.error("Error reading uploads directory:", error);
      return NextResponse.json(
        { error: "Failed to fetch resources" },
        { status: 500 }
      );
    }
  }

  // Default response if no matching path
  return NextResponse.json({ error: "Not found" }, { status: 404 });
}
