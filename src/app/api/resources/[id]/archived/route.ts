import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Find all resources where the description starts with "ARCHIVED:"
    const archivedResources = await prisma.resource.findMany({
      where: {
        description: {
          startsWith: "ARCHIVED:",
        },
      },
      orderBy: {
        lastUpdated: "desc",
      },
    });

    // Transform the data to match the ResourceInfo interface
    const formattedResources = archivedResources.map((resource) => ({
      id: resource.id.toString(),
      name: resource.title || "Untitled",
      size: 0,
      lastUpdated: resource.lastUpdated.toISOString(),
      yearLevel: resource.year || "unknown",
      subject: resource.subject || "unknown",
      imageUrl: resource.thumbnail || null,
      path: resource.downloadUrl || "",
      archived: true,
    }));

    return NextResponse.json(formattedResources);
  } catch (error) {
    console.error("Error fetching archived resources:", error);
    return NextResponse.json(
      { error: "Failed to fetch archived resources" },
      { status: 500 }
    );
  }
}

// This route is used to fetch all resources that have been archived
// It returns a list of resources that have been archived
// The resources are formatted to match the ResourceInfo interface
// The resources are ordered by the lastUpdated field in descending order
// The resources are fetched from the database using the prisma client
