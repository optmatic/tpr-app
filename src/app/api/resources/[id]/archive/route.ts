import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json(
        { error: "Invalid resource ID" },
        { status: 400 }
      );
    }

    // Instead of using isArchived, use a field that already exists
    // For example, you could use the description field to mark it as archived
    const resource = await prisma.resource.findUnique({
      where: { id },
      select: { description: true },
    });

    const updatedResource = await prisma.resource.update({
      where: { id },
      data: {
        description: resource?.description
          ? `ARCHIVED: ${resource.description}`
          : "ARCHIVED",
      },
    });

    return NextResponse.json({
      success: true,
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
