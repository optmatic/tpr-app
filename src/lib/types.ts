import { Prisma } from '@prisma/client'

export type Question = {
  id: number
  text: string
  orderIndex: number
  quizId: number
  answers: {
    id: number
    text: string
    isCorrect: boolean
    questionId: number
  }[]
}

export type Quiz = {
  id: number
  title: string
  questions: Question[]
  author: {
    id: number
    name: string | null
    email: string
    createdAt: Date
  } | null
}

export type QuizDisplayProps = {
  quiz: Quiz
  onBack: () => void
}

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
