import { NextResponse } from "next/server";
import { readdirSync, statSync, mkdirSync } from "fs";
import { join } from "path";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs"; // Specify Node.js runtime

type Answer = {
  text: string;
  isCorrect: boolean;
};

type Question = {
  text: string;
  orderIndex: number;
  type: "multiple-choice";
  answers: Answer[];
};

export async function GET(request: Request) {
  const url = new URL(request.url);
  const path = url.pathname;

  // Handle file uploads listing
  if (path === "/api") {
    const uploadDir = join(process.cwd(), "public/uploads");
    let files = [];

    try {
      // Use sync versions of fs functions
      mkdirSync(uploadDir, { recursive: true });
      const fileNames = readdirSync(uploadDir);

      files = fileNames.map((name, index) => {
        const filePath = join(uploadDir, name);
        const stats = statSync(filePath);
        return {
          id: index + 1,
          name,
          size: stats.size,
          path: `/uploads/${name}`,
          lastUpdated: stats.mtime.toISOString(),
        };
      });

      return NextResponse.json(files);
    } catch (error) {
      console.error("Error reading uploads directory:", error);
      return NextResponse.json(
        { error: "Failed to fetch resources" },
        { status: 500 }
      );
    }
  }

  // Handle quizzes
  if (path === "/api/quizzes") {
    try {
      const idParam = url.searchParams.get("id");

      // If ID is provided, return a specific quiz
      if (idParam) {
        const id = parseInt(idParam, 10);
        if (isNaN(id)) {
          return NextResponse.json(
            { error: "Invalid quiz ID" },
            { status: 400 }
          );
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
          return NextResponse.json(
            { error: "Quiz not found" },
            { status: 404 }
          );
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

  // Default response if no matching path
  return NextResponse.json({ error: "Not found" }, { status: 404 });
}

export async function POST(request: Request) {
  const url = new URL(request.url);
  const path = url.pathname;

  // Handle quiz creation
  if (path === "/api/quizzes") {
    try {
      const { title, questions } = (await request.json()) as {
        title: string;
        questions: Question[];
      };

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
            create: questions.map((q) => ({
              text: q.text,
              orderIndex: q.orderIndex,
              type: q.type,
              answers: {
                create: q.answers.map((a) => ({
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

  // Default response if no matching path
  return NextResponse.json({ error: "Not found" }, { status: 404 });
}

export async function PUT(request: Request) {
  const url = new URL(request.url);
  const path = url.pathname;

  // Handle quiz updates
  if (path === "/api/quizzes") {
    try {
      const { id, title, questions } = (await request.json()) as {
        id: number;
        title: string;
        questions: Question[];
      };

      // Validate input
      if (!id) {
        return NextResponse.json(
          { error: "Quiz ID is required" },
          { status: 400 }
        );
      }

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
            create: questions.map((q) => ({
              text: q.text,
              orderIndex: q.orderIndex,
              type: q.type,
              answers: {
                create: q.answers.map((a) => ({
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

  // Default response if no matching path
  return NextResponse.json({ error: "Not found" }, { status: 404 });
}

export async function DELETE(request: Request) {
  const url = new URL(request.url);
  const path = url.pathname;

  // Handle quiz deletion
  if (path === "/api/quizzes") {
    try {
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

  // Default response if no matching path
  return NextResponse.json({ error: "Not found" }, { status: 404 });
}
