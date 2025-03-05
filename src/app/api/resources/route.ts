import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Resource as ResourceType } from "@/lib/types";
import type { Prisma } from "@prisma/client";

export async function GET() {
  try {
    console.log("Fetching resources from database...");
    const resources = await prisma.resource.findMany({
      orderBy: {
        lastUpdated: "desc",
      },
    });

    console.log(`Found ${resources.length} resources in database`);

    // Map database resources to the expected format
    const formattedResources = resources.map((resource) => ({
      id: resource.id.toString(),
      name: resource.title,
      title: resource.title,
      size: 0, // You might want to store file size in the database
      lastUpdated: resource.lastUpdated.toISOString(),
      yearLevel: resource.year,
      subject: resource.subject,
      imageUrl: resource.thumbnail || null,
      path: resource.downloadUrl,
    }));

    return NextResponse.json(formattedResources);
  } catch (error) {
    console.error("Error fetching resources:", error);
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
