import { Answer, Prisma } from '@prisma/client'

export type Question = {
  id: number
  text: string
  orderIndex: number
  quizId: number
  type: "multiple-choice" | "short-answer"
  options?: string[]
  correctAnswer: string
  answers: Answer[]
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

export type QuizWithRelations = {
  id: number
  title: string
  questions: {
    id: number
    quizId: number
    text: string
    orderIndex: number
    answers: {
      id: number
      text: string
      isCorrect: boolean
      questionId: number
    }[]
  }[]
  author: {
    id: number
    name: string | null
    email: string
    createdAt: Date
  } | null
}

export type QuizListItem = {
  id: string
  title: string
  questions: Array<{
    id: string
    type: "multiple-choice" | "short-answer"
    question: string
  }>
}

export type QuizListProps = {
  quizzes: QuizListItem[]
  onQuizSelect: (quizId: string) => void
  isLoading: boolean
  onArchiveQuiz: (quizId: string) => Promise<void>
  onEditQuiz: (quizId: string) => void
}
