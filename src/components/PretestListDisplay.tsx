import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Edit, Trash2 } from "lucide-react";
import { PretestDisplayProps } from "@/lib/types";

export default function PretestDisplay({
  pretest,
  onBack,
  onEditPretest,
}: PretestDisplayProps) {
  console.log(
    "==================== PRETEST DISPLAY COMPONENT ===================="
  );
  console.log(
    "PretestDisplay received pretest:",
    JSON.stringify(pretest, null, 2)
  );
  console.log("Pretest questions:", pretest?.questions);
  const handleEdit = (id: string) => {
    onEditPretest(id);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to archive this pretest?")) {
      handleArchivePretest(id);
    }
  };

  const handleArchivePretest = async (pretestId: string) => {
    try {
      await fetch(`/api/pretests/${pretestId}/archive`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ archived: true }),
      });
      onBack();
    } catch (error) {
      console.error("Error archiving pretest:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Button variant="ghost" onClick={onBack} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Pretest List
        </Button>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(pretest.id.toString());
            }}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(pretest.id.toString());
            }}
            className="text-yellow-500 hover:text-yellow-700 hover:bg-yellow-100"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">{pretest.title}</h2>
        <p className="text-muted-foreground">
          Total Questions: {pretest.questions.length}
        </p>
      </div>
      {pretest.questions.map((question, index) => (
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
