import { prisma } from "@/lib/prisma";
import PretestClient from "./_components/PretestClient";
import type { QuizWithRelations } from "@/lib/types";

export default async function PretestPage() {
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
  })) satisfies QuizWithRelations[];

  return <PretestClient initialQuizzes={quizzes} />;
}
