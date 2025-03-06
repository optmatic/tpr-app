import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Make sure params.id exists
    if (!params.id) {
      return NextResponse.json(
        { error: "Resource ID is required" },
        { status: 400 }
      );
    }

    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json(
        { error: "Invalid resource ID" },
        { status: 400 }
      );
    }

    // Get the current resource
    const currentResource = await prisma.resource.findUnique({
      where: { id },
      select: { description: true },
    });

    if (!currentResource) {
      return NextResponse.json(
        { error: "Resource not found" },
        { status: 404 }
      );
    }

    // Check if it's actually archived
    if (!currentResource.description?.startsWith("ARCHIVED:")) {
      return NextResponse.json(
        { error: "Resource is not archived" },
        { status: 400 }
      );
    }

    // Remove the "ARCHIVED:" prefix
    const originalDescription = currentResource.description
      .replace("ARCHIVED:", "")
      .trim();

    // Update the resource to restore it
    const updatedResource = await prisma.resource.update({
      where: { id },
      data: {
        description: originalDescription,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Resource restored successfully",
      resource: updatedResource,
    });
  } catch (error) {
    console.error("Error restoring resource:", error);
    return NextResponse.json(
      { error: "Failed to restore resource" },
      { status: 500 }
    );
  }
}
