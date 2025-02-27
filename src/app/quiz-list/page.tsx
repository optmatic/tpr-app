import { prisma } from "@/lib/prisma";
import QuizListClient from "@/components/QuizListClient";
import type { QuizWithRelations } from "@/lib/types";

export default async function QuizListPage() {
  // Log the quizzes before fetching to track execution
  console.log("Fetching quizzes...");

  const quizzes = (await prisma.quiz.findMany({
    include: {
      author: true,
      questions: {
        select: {
          id: true,
          text: true,
          quizId: true,
          orderIndex: true,
          answers: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc", // Optional: show newest quizzes first
    },
  })) satisfies QuizWithRelations[];

  console.log("Quizzes fetched successfully:", quizzes.length);

  return <QuizListClient initialQuizzes={quizzes} />;
}
