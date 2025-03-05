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

    // For now, let's use a workaround since we don't have isArchived field yet
    // We'll mark it as archived by updating a field that does exist
    const updatedResource = await prisma.resource.update({
      where: { id },
      data: {
        // Instead of isArchived: true, use an existing field
        description:
          "ARCHIVED: " +
            (
              await prisma.resource.findUnique({
                where: { id },
                select: { description: true },
              })
            )?.description || "",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Resource archived successfully",
      resource: updatedResource,
    });
  } catch (error) {
    console.error("Error archiving resource:", error);
    return NextResponse.json(
      { error: "Failed to archive resource" },
      { status: 500 }
    );
  }
}
