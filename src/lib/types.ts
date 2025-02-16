import { Prisma } from '@prisma/client'

export type QuizWithRelations = Prisma.QuizGetPayload<{
  include: {
    author: true
    questions: {
      select: {
        id: true
        text: true
        options: true
        answers: true
        orderIndex: true
        quizId: true
      }
    }
  }
}>
