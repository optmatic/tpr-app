export type Resource = {
  id: number
  title: string
  description: string
  downloadUrl: string
  fileName: string
  thumbnail: string
  lastUpdated: string
  year: string
  subject: string
  curriculumCode: string
  topic: string
}

export type Answer = {
  id: number
  text: string
  isCorrect: boolean
}

export type Question = {
  updatedAt: Date
  id: number | string
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
  updatedAt: Date
  questions: Question[]
  author: {
    id: number
    name: string | null
    email: string
    createdAt: Date
  } | null
}


export type QuizWithRelations = {
  id: number
  title: string
  updatedAt: Date
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
  updatedAt: Date
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

export type QuizDisplayProps = {
  quiz: Quiz
  onBack: () => void
  onEditQuiz: (quizId: string) => void
}