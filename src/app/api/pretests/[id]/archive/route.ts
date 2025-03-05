import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { archived } = await request.json();

    const updatedPretest = await prisma.pretest.update({
      where: { id: parseInt(id) },
      data: { archived },
    });

    return NextResponse.json(updatedPretest);
  } catch (error) {
    console.error("Error updating pretest archive status:", error);

    // More detailed error logging
    if (error instanceof Error) {
      console.error("Error details:", error.message, error.stack);
    }

    return NextResponse.json(
      {
        error: "Failed to update pretest archive status",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
