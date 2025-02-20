import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Edit } from "lucide-react"
import { QuizDisplayProps } from "@/lib/types"

export default function QuizDisplay({ quiz, onBack, onEditQuiz }: QuizDisplayProps) {
    const handleEdit = (id: string) => {
    onEditQuiz(id)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Button variant="ghost" onClick={onBack} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Quiz List
        </Button>
      <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleEdit(quiz.id.toString())
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
      </div>

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

