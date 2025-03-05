import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Resource as ResourceType } from "@/lib/types";
import type { Prisma } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    // Get the URL to check for query parameters
    const url = new URL(request.url);
    const showArchived = url.searchParams.get("showArchived") === "true";

    // Build the where clause based on whether to show archived resources
    // Since we don't have isArchived field yet, we'll filter by description
    const whereClause = showArchived
      ? {}
      : {
          NOT: {
            description: {
              startsWith: "ARCHIVED:",
            },
          },
        };

    const resources = await prisma.resource.findMany({
      where: whereClause,
      orderBy: {
        lastUpdated: "desc",
      },
    });

    console.log(`Found ${resources.length} resources`);

    // Convert the Prisma Resource to our Resource type
    const formattedResources = resources.map((dbResource) => ({
      id: dbResource.id,
      title: dbResource.title,
      fileName: dbResource.fileName,
      downloadUrl: dbResource.downloadUrl,
      thumbnail: dbResource.thumbnail || "/placeholder.svg",
      year: dbResource.year,
      subject: dbResource.subject,
      curriculumCode: dbResource.curriculumCode,
      topic: dbResource.topic,
      description: dbResource.description || "",
      lastUpdated: dbResource.lastUpdated.toISOString(),
    }));

    return NextResponse.json(formattedResources);
  } catch (error) {
    console.error("Error in GET /api/resources:", error);
    return NextResponse.json(
      { error: "Failed to fetch resources" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const resource: ResourceType = await request.json();

    // Check if resource already exists
    const existing = await prisma.resource.findFirst({
      where: {
        fileName: resource.fileName,
        downloadUrl: resource.downloadUrl,
      },
    });

    let savedResource;
    if (existing) {
      // Update existing resource
      savedResource = await prisma.resource.update({
        where: { id: existing.id },
        data: {
          title: resource.title,
          thumbnail: resource.thumbnail,
          year: resource.year,
          subject: resource.subject,
          curriculumCode: resource.curriculumCode,
          topic: resource.topic,
          description: resource.description,
          lastUpdated: new Date(),
        },
      });
    } else {
      // Create new resource
      savedResource = await prisma.resource.create({
        data: {
          title: resource.title,
          fileName: resource.fileName,
          downloadUrl: resource.downloadUrl,
          thumbnail: resource.thumbnail,
          year: resource.year,
          subject: resource.subject,
          curriculumCode: resource.curriculumCode,
          topic: resource.topic,
          description: resource.description,
          // authorId: can be added when auth is implemented
        },
      });
    }

    // Convert to Resource type
    const formattedResource = {
      id: savedResource.id,
      title: savedResource.title,
      fileName: savedResource.fileName,
      downloadUrl: savedResource.downloadUrl,
      thumbnail: savedResource.thumbnail || "/placeholder.svg",
      year: savedResource.year,
      subject: savedResource.subject,
      curriculumCode: savedResource.curriculumCode,
      topic: savedResource.topic,
      description: savedResource.description || "",
      lastUpdated: savedResource.lastUpdated.toISOString(),
    };

    return NextResponse.json(formattedResource);
  } catch (error) {
    console.error("Error saving resource:", error);
    return NextResponse.json(
      { error: "Failed to save resource" },
      { status: 500 }
    );
  }
}
