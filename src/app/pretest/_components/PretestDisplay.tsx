import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Edit } from "lucide-react";
import { QuizDisplayProps } from "@/lib/types";
import React from "react";

export default function PretestDisplay({
  quiz,
  onBack,
  onEditQuiz,
  onTakeQuiz,
}: QuizDisplayProps & { onTakeQuiz: () => void }) {
  console.log(
    "==================== PRETEST DISPLAY COMPONENT ===================="
  );
  console.log("PretestDisplay received quiz:", JSON.stringify(quiz, null, 2));
  console.log("Pretest questions:", quiz?.questions);
  const [answers, setAnswers] = React.useState<Record<string, string | number>>(
    {}
  );
  const [showResults, setShowResults] = React.useState(false);

  const handleEdit = (id: string) => {
    onEditQuiz(id);
  };

  const handleAnswerChange = (questionId: string, value: string | number) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const handleSubmit = () => {
    setShowResults(true);
    // You could also pass the answers to a parent component if needed
    // e.g., onSubmitAnswers(answers);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Button variant="ghost" onClick={onBack} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Pretest List
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

            {question.answers?.length > 0 ? (
              <div className="space-y-2">
                {question.answers.map((answer) => (
                  <div key={answer.id} className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id={`answer-${answer.id}`}
                      name={`question-${question.id}`}
                      value={answer.id}
                      onChange={() =>
                        handleAnswerChange(question.id.toString(), answer.id)
                      }
                      disabled={showResults}
                    />
                    <label
                      htmlFor={`answer-${answer.id}`}
                      className={`p-2 rounded flex-1 ${
                        showResults && answer.isCorrect
                          ? "bg-green-100 text-green-700"
                          : showResults &&
                            answers[question.id.toString()] === answer.id &&
                            !answer.isCorrect
                          ? "bg-red-100 text-red-700"
                          : "bg-white border border-slate-200"
                      }`}
                    >
                      {answer.text}
                      {showResults && answer.isCorrect && (
                        <span className="ml-2 text-sm font-medium">
                          (Correct)
                        </span>
                      )}
                    </label>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                <input
                  type="text"
                  className="w-full p-2 border rounded"
                  placeholder="Your answer..."
                  onChange={(e) =>
                    handleAnswerChange(question.id.toString(), e.target.value)
                  }
                  disabled={showResults}
                />
                {showResults && (
                  <div className="bg-blue-50 p-4 rounded-lg mt-2">
                    <p className="text-sm font-semibold text-blue-700 mb-2">
                      Correct Answer:
                    </p>
                    <p className="text-blue-700 font-medium pl-2">
                      {question.correctAnswer}
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      ))}

      <div className="flex space-x-4">
        {!showResults ? (
          <Button onClick={handleSubmit} className="w-full">
            Submit Answers
          </Button>
        ) : (
          <>
            <Button
              onClick={() => setShowResults(false)}
              variant="outline"
              className="flex-1"
            >
              Try Again
            </Button>
            <Button onClick={onTakeQuiz} className="flex-1">
              Continue
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
