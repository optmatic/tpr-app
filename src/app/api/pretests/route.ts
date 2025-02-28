import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Define types for our data structures
type Answer = {
  id?: number;
  text: string;
  isCorrect: boolean;
};

type Question = {
  id?: number;
  text: string;
  orderIndex: number;
  type: "multiple-choice";
  answers: Answer[];
};

type PretestData = {
  id?: number;
  title: string;
  questions: Question[];
};

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const idParam = url.searchParams.get("id");

    // If ID is provided, return a specific pretest
    if (idParam) {
      const id = parseInt(idParam, 10);
      if (isNaN(id)) {
        return NextResponse.json(
          { error: "Invalid pretest ID" },
          { status: 400 }
        );
      }

      const pretest = await prisma.pretest.findUnique({
        where: { id },
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
      });

      if (!pretest) {
        return NextResponse.json(
          { error: "Pretest not found" },
          { status: 404 }
        );
      }

      return NextResponse.json(pretest);
    }

    // Otherwise return all pretests
    const pretests = await prisma.pretest.findMany({
      include: {
        questions: {
          select: {
            id: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(pretests);
  } catch (error) {
    console.error("Failed to fetch pretests:", error);
    return NextResponse.json(
      { error: "Failed to fetch pretests" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    console.log("Starting POST request");

    // Debug Prisma instance
    console.log("Prisma client:", {
      exists: !!prisma,
      pretest: !!prisma?.pretest,
      question: !!prisma?.question,
      answer: !!prisma?.answer,
    });

    const { title, questions } = (await request.json()) as PretestData;
    console.log("Received data:", { title, questionCount: questions.length });

    // Validate input
    if (!title?.trim()) {
      return NextResponse.json(
        { error: "Pretest title is required" },
        { status: 400 }
      );
    }

    if (!questions?.length) {
      return NextResponse.json(
        { error: "At least one question is required" },
        { status: 400 }
      );
    }

    try {
      // Test Prisma connection
      await prisma.$connect();
      console.log("Prisma connected successfully");

      // Test a simple query
      const count = await prisma.pretest.count();
      console.log("Current pretest count:", count);
    } catch (connError) {
      console.error("Prisma connection test failed:", connError);
      throw connError;
    }

    const pretest = await prisma.pretest.create({
      data: {
        title,
        questions: {
          create: questions.map((q: Question) => ({
            text: q.text,
            orderIndex: q.orderIndex,
            type: q.type || "multiple-choice",
            answers: {
              create: q.answers.map((a: Answer) => ({
                text: a.text,
                isCorrect: a.isCorrect,
              })),
            },
          })),
        },
      },
      include: {
        questions: {
          include: {
            answers: true,
          },
        },
      },
    });

    return NextResponse.json(pretest);
  } catch (error) {
    console.error("API Error:", error);
    if (error instanceof Error) {
      console.error("Detailed error:", {
        name: error.name,
        message: error.message,
        stack: error.stack,
      });
    }
    return NextResponse.json(
      {
        error:
          "API Error: " +
          (error instanceof Error ? error.message : "Unknown error"),
        details: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function PUT(request: Request) {
  try {
    const url = new URL(request.url);
    const idParam = url.searchParams.get("id");

    if (!idParam) {
      return NextResponse.json(
        { error: "Pretest ID is required" },
        { status: 400 }
      );
    }

    const id = parseInt(idParam, 10);
    if (isNaN(id)) {
      return NextResponse.json(
        { error: "Invalid pretest ID" },
        { status: 400 }
      );
    }

    const { title, questions } = (await request.json()) as PretestData;

    // Validate input
    if (!title.trim()) {
      return NextResponse.json(
        { error: "Pretest title is required" },
        { status: 400 }
      );
    }

    // First, delete all existing answers for this pretest's questions
    await prisma.answer.deleteMany({
      where: {
        question: {
          pretestId: id,
        },
      },
    });

    // Then delete all existing questions
    await prisma.question.deleteMany({
      where: {
        pretestId: id,
      },
    });

    // Finally, update the pretest with new questions and answers
    const updatedPretest = await prisma.pretest.update({
      where: { id },
      data: {
        title,
        questions: {
          create: questions.map((q: Question) => ({
            text: q.text,
            orderIndex: q.orderIndex,
            type: q.type || "multiple-choice",
            answers: {
              create: q.answers.map((a: Answer) => ({
                text: a.text,
                isCorrect: a.isCorrect,
              })),
            },
          })),
        },
      },
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
    });

    return NextResponse.json(updatedPretest);
  } catch (error) {
    console.error("Failed to update pretest:", error);
    return NextResponse.json(
      {
        error: "Failed to update pretest",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url);
    const idParam = url.searchParams.get("id");

    if (!idParam) {
      return NextResponse.json(
        { error: "Pretest ID is required" },
        { status: 400 }
      );
    }

    const id = parseInt(idParam, 10);
    if (isNaN(id)) {
      return NextResponse.json(
        { error: "Invalid pretest ID" },
        { status: 400 }
      );
    }

    // Delete the pretest (answers and questions will be deleted via cascade)
    await prisma.pretest.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete pretest:", error);
    return NextResponse.json(
      {
        error: "Failed to delete pretest",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
