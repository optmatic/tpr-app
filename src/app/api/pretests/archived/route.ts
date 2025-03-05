import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic"; // Prevents caching

export async function GET() {
  try {
    // Try to fetch all pretests first, then filter by archived status
    // This is a workaround for potential schema sync issues
    const allPretests = await prisma.pretest.findMany({
      include: {
        questions: {
          include: {
            answers: true,
          },
          orderBy: {
            orderIndex: "asc",
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    // Filter pretests with archived=true in memory
    const archivedPretests = allPretests.filter(
      (pretest) =>
        // @ts-ignore - Handle case where archived might not be recognized by TypeScript
        pretest.archived === true
    );

    return NextResponse.json(archivedPretests);
  } catch (error) {
    console.error("Error fetching archived pretests:", error);

    // More detailed error logging
    if (error instanceof Error) {
      console.error("Error details:", error.message, error.stack);
    }

    return NextResponse.json(
      {
        error: "Failed to fetch archived pretests",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
