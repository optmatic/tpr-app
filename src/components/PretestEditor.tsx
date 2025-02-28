"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Trash2, Plus, ArrowLeft } from "lucide-react";
import { Pretest, Question } from "@/lib/types";

type PretestEditorProps = {
  pretest: Pretest;
  onSave: (updatedPretest: Pretest) => void;
  onBack: () => void;
};

export default function PretestEditor({
  pretest: initialPretest,
  onSave,
  onBack,
}: PretestEditorProps) {
  const [pretest, setPretest] = useState<Pretest>(initialPretest);

  const updatePretestTitle = (newTitle: string) => {
    setPretest({ ...pretest, title: newTitle });
  };

  const addQuestion = () => {
    const questionId = pretest.questions.length + 1;
    const newQuestion: Question = {
      updatedAt: new Date(),
      id: questionId,
      text: "",
      orderIndex: pretest.questions.length,
      pretestId: pretest.id,
      type: "multiple-choice",
      correctAnswer: "",
      answers: Array(4)
        .fill(null)
        .map((_, index) => ({
          id: Date.now() + index,
          text: "",
          isCorrect: index === 3,
          questionId,
        })),
    };
    setPretest({ ...pretest, questions: [...pretest.questions, newQuestion] });
  };

  const updateQuestion = (index: number, updatedQuestion: Question) => {
    const updatedQuestions = [...pretest.questions];
    updatedQuestions[index] = updatedQuestion;
    setPretest({ ...pretest, questions: updatedQuestions });
  };

  const removeQuestion = (index: number) => {
    const updatedQuestions = pretest.questions.filter((_, i) => i !== index);
    setPretest({ ...pretest, questions: updatedQuestions });
  };

  const handleSave = async () => {
    try {
      await onSave(pretest);
    } catch (error) {
      console.error("Failed to save pretest:", error);
    }
  };

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={onBack} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Pretest List
      </Button>
      <div className="space-y-4">
        <h2 className="text-3xl font-bold">Edit Pretest</h2>
        <Input
          value={pretest.title}
          onChange={(e) => updatePretestTitle(e.target.value)}
          placeholder="Pretest Title"
          className="text-2xl font-bold"
        />
      </div>
      {pretest.questions.map((question, index) => (
        <Card key={question.id}>
          <CardHeader>
            <CardTitle className="flex justify-between">
              <span>Question {index + 1}</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeQuestion(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Textarea
                value={question.text}
                onChange={(e) =>
                  updateQuestion(index, { ...question, text: e.target.value })
                }
                placeholder="Enter question"
              />
              <div className="space-y-2">
                {question.answers.map((answer, answerIndex) => (
                  <div key={answer.id} className="flex gap-2">
                    <Input
                      value={answer.text}
                      onChange={(e) => {
                        const newAnswers = [...question.answers];
                        newAnswers[answerIndex] = {
                          ...answer,
                          text: e.target.value,
                        };
                        updateQuestion(index, {
                          ...question,
                          answers: newAnswers,
                        });
                      }}
                      placeholder={`Option ${answerIndex + 1}`}
                    />
                    <RadioGroup
                      value={answer.isCorrect ? answerIndex.toString() : ""}
                      onValueChange={() => {
                        const newAnswers = question.answers.map((a, idx) => ({
                          ...a,
                          isCorrect: idx === answerIndex,
                        }));
                        updateQuestion(index, {
                          ...question,
                          answers: newAnswers,
                        });
                      }}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem
                          value={answerIndex.toString()}
                          id={`correct-${answer.id}`}
                        />
                        <Label htmlFor={`correct-${answer.id}`}>Correct</Label>
                      </div>
                    </RadioGroup>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      <div className="flex justify-between">
        <Button onClick={addQuestion}>
          <Plus className="mr-2 h-4 w-4" /> Add Question
        </Button>
        <Button onClick={handleSave}>Save Pretest</Button>
      </div>
    </div>
  );
}
