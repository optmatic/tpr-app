import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"

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

type QuizDisplayProps = {
  quiz: Quiz
  onBack: () => void
}

export default function QuizDisplay({ quiz, onBack }: QuizDisplayProps) {
  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={onBack} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Quiz List
      </Button>
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">{quiz.title}</h2>
        <p className="text-muted-foreground">Total Questions: {quiz.questions.length}</p>
      </div>
      {quiz.questions.map((question, index) => (
        <Card key={question.id}>
          <CardHeader>
            <CardTitle>Question {index + 1}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 font-medium">{question.text}</p>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Options:</p>
              <ul className="list-disc list-inside">
                {question.answers.map((answer) => (
                  <li
                    key={answer.id}
                    className={answer.isCorrect ? "text-green-600 font-medium" : ""}
                  >
                    {answer.text} {answer.isCorrect && "(Correct Answer)"}
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

