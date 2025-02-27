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
  const handleEdit = (id: string) => {
    onEditQuiz(id);
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

      <Card>
        <CardHeader>
          <CardTitle>{quiz.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p>Total Questions: {quiz.questions.length}</p>
            <p>Last Updated: {new Date(quiz.updatedAt).toLocaleDateString()}</p>

            <Button onClick={onTakeQuiz} className="w-full mt-4">
              Start Quiz
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
