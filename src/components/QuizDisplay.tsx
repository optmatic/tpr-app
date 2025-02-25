import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Edit } from "lucide-react";
import { QuizDisplayProps } from "@/lib/types";

export default function QuizDisplay({
  quiz,
  onBack,
  onEditQuiz,
}: QuizDisplayProps) {
  console.log(
    "==================== QUIZ DISPLAY COMPONENT ===================="
  );
  console.log("QuizDisplay received quiz:", JSON.stringify(quiz, null, 2));
  console.log("Quiz questions:", quiz?.questions);
  const handleEdit = (id: string) => {
    onEditQuiz(id);
  };

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
            e.stopPropagation();
            handleEdit(quiz.id.toString());
          }}
        >
          <Edit className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">{quiz.title}</h2>
        <p className="text-muted-foreground">
          Total Questions: {quiz.questions.length}
        </p>
      </div>
      {quiz.questions.map((question, index) => (
        <Card key={question.id}>
          <CardHeader>
            <CardTitle>Question {index + 1}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 font-medium">
              <span className="font-bold">Question:</span> {question.text}
            </p>
            <div className="space-y-2">
              {question.answers?.length > 0 ? (
                <div className="bg-zinc-50 p-4 rounded-lg">
                  <p className="text-sm font-semibold text-slate-700 mb-2">
                    Option(s):
                  </p>
                  <ul className="space-y-2">
                    {question.answers.map((answer) => (
                      <li
                        key={answer.id}
                        className={`flex items-center p-2 rounded ${
                          answer.isCorrect
                            ? "bg-green-100 text-green-700"
                            : "bg-white border border-slate-200"
                        }`}
                      >
                        {answer.text}{" "}
                        {answer.isCorrect && (
                          <span className="ml-2 text-sm font-medium">
                            (Correct)
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm font-semibold text-blue-700 mb-2">
                    Short Answer
                  </p>
                  <p className="text-blue-700 font-medium pl-2">
                    {question.correctAnswer}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
