import { prisma } from "@/lib/prisma"
import QuizListClient from "@/components/QuizListClient"
import type { QuizWithRelations } from "@/lib/types"

export default async function QuizEditorPage() {
  const quizzes = await prisma.quiz.findMany({
    include: {
      author: true,
      questions: {
        select: {
          id: true,
          text: true,
          options: true,
          quizId: true,
          orderIndex: true,
          answers: true,
        }
      }
    },
  }) satisfies QuizWithRelations[]

  return <QuizListClient initialQuizzes={quizzes} />
}

