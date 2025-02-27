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

type QuizData = {
  id?: number;
  title: string;
  questions: Question[];
};

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const idParam = url.searchParams.get("id");

    // If ID is provided, return a specific quiz
    if (idParam) {
      const id = parseInt(idParam, 10);
      if (isNaN(id)) {
        return NextResponse.json({ error: "Invalid quiz ID" }, { status: 400 });
      }

      const quiz = await prisma.quiz.findUnique({
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

      if (!quiz) {
        return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
      }

      return NextResponse.json(quiz);
    }

    // Otherwise return all quizzes
    const quizzes = await prisma.quiz.findMany({
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

    return NextResponse.json(quizzes);
  } catch (error) {
    console.error("Failed to fetch quizzes:", error);
    return NextResponse.json(
      { error: "Failed to fetch quizzes" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { title, questions } = (await request.json()) as QuizData;

    // Validate input
    if (!title.trim()) {
      return NextResponse.json(
        { error: "Quiz title is required" },
        { status: 400 }
      );
    }

    if (!questions.length) {
      return NextResponse.json(
        { error: "At least one question is required" },
        { status: 400 }
      );
    }

    const quiz = await prisma.quiz.create({
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

    return NextResponse.json(quiz);
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      {
        error:
          "API Error: " +
          (error instanceof Error ? error.message : "Unknown error"),
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const url = new URL(request.url);
    const idParam = url.searchParams.get("id");

    if (!idParam) {
      return NextResponse.json(
        { error: "Quiz ID is required" },
        { status: 400 }
      );
    }

    const id = parseInt(idParam, 10);
    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid quiz ID" }, { status: 400 });
    }

    const { title, questions } = (await request.json()) as QuizData;

    // Validate input
    if (!title.trim()) {
      return NextResponse.json(
        { error: "Quiz title is required" },
        { status: 400 }
      );
    }

    // First, delete all existing answers for this quiz's questions
    await prisma.answer.deleteMany({
      where: {
        question: {
          quizId: id,
        },
      },
    });

    // Then delete all existing questions
    await prisma.question.deleteMany({
      where: {
        quizId: id,
      },
    });

    // Finally, update the quiz with new questions and answers
    const updatedQuiz = await prisma.quiz.update({
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

    return NextResponse.json(updatedQuiz);
  } catch (error) {
    console.error("Failed to update quiz:", error);
    return NextResponse.json(
      {
        error: "Failed to update quiz",
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
        { error: "Quiz ID is required" },
        { status: 400 }
      );
    }

    const id = parseInt(idParam, 10);
    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid quiz ID" }, { status: 400 });
    }

    // Delete the quiz (answers and questions will be deleted via cascade)
    await prisma.quiz.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete quiz:", error);
    return NextResponse.json(
      {
        error: "Failed to delete quiz",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
