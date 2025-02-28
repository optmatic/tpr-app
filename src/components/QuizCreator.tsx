"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Plus, Trash2 } from "lucide-react";

type Question = {
  text: string;
  orderIndex: number;
  type: "multiple-choice";
  answers: {
    text: string;
    isCorrect: boolean;
  }[];
};

export default function QuizCreator() {
  const [quizTitle, setQuizTitle] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<Question>({
    text: "",
    orderIndex: 0,
    type: "multiple-choice",
    answers: Array(4).fill({ text: "", isCorrect: false }),
  });

  const addQuestion = () => {
    if (
      currentQuestion.text &&
      currentQuestion.answers.some((a) => a.text && a.isCorrect)
    ) {
      setQuestions([
        ...questions,
        {
          ...currentQuestion,
          orderIndex: questions.length,
        },
      ]);
      setCurrentQuestion({
        text: "",
        type: "multiple-choice",
        orderIndex: questions.length + 1,
        answers: Array(4).fill({ text: "", isCorrect: false }),
      });
    }
  };

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleOptionChange = (index: number, value: string) => {
    const newAnswers = [...currentQuestion.answers];
    newAnswers[index] = { ...newAnswers[index], text: value };
    setCurrentQuestion({ ...currentQuestion, answers: newAnswers });
  };

  const handleCorrectAnswerChange = (index: number) => {
    const newAnswers = currentQuestion.answers.map((answer, i) => ({
      ...answer,
      isCorrect: i === index,
    }));
    setCurrentQuestion({ ...currentQuestion, answers: newAnswers });
  };

  const handleSaveQuiz = async () => {
    try {
      if (!quizTitle.trim()) {
        alert("Please enter a quiz title");
        return;
      }

      // Debug logs
      console.log("Original questions:", questions);

      // Validate questions
      const validQuestions = questions.filter((q) => {
        const hasValidText = q.text.trim().length > 0;
        const hasValidAnswer = q.answers.some(
          (a) => a.text.trim() && a.isCorrect
        );

        console.log("Question validation:", {
          text: q.text,
          hasValidText,
          hasValidAnswer,
          answers: q.answers,
        });

        return hasValidText && hasValidAnswer;
      });

      console.log("Valid questions:", validQuestions);

      if (validQuestions.length === 0) {
        alert(
          "Please ensure each question has text and at least one correct answer marked"
        );
        return;
      }

      const requestBody = {
        title: quizTitle,
        questions: validQuestions.map((q) => ({
          text: q.text.trim(),
          orderIndex: q.orderIndex,
          type: q.type,
          answers: q.answers
            .filter((a) => a.text.trim())
            .map((a) => ({
              text: a.text.trim(),
              isCorrect: a.isCorrect,
            })),
        })),
      };

      const response = await fetch("/api/quizzes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      console.log("Response status:", response.status);

      const data = await response.json();
      console.log("Response data:", data);

      if (!response.ok) {
        throw new Error(
          data?.error ||
            data?.message ||
            JSON.stringify(data) ||
            "Failed to save quiz"
        );
      }

      // Clear form after successful save
      setQuizTitle("");
      setQuestions([]);
      setCurrentQuestion({
        text: "",
        type: "multiple-choice",
        orderIndex: 0,
        answers: Array(4).fill({ text: "", isCorrect: false }),
      });

      alert("Quiz saved successfully!");
    } catch (error) {
      console.error("Failed to save quiz:", error);
      alert(
        `Failed to save quiz: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="quiz-title">
          <span className="text-lg font-semibold">Quiz Title</span>
        </Label>
        <Input
          id="quiz-title"
          value={quizTitle}
          onChange={(e) => setQuizTitle(e.target.value)}
          placeholder="Enter quiz title"
          className="mt-2"
        />
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Add New Question</h2>

        <div className="space-y-2">
          <Label>
            <span className="text-lg font-semibold">Question Type</span>
          </Label>
        </div>

        <div>
          <Label htmlFor="question">Question</Label>
          <Input
            id="question"
            value={currentQuestion.text}
            onChange={(e) =>
              setCurrentQuestion({ ...currentQuestion, text: e.target.value })
            }
            placeholder="Enter your question"
          />
        </div>

        <div className="space-y-2">
          <Label>Options</Label>
          {currentQuestion.answers.map((answer, index) => (
            <div key={index} className="flex items-center gap-2">
              <Input
                value={answer.text}
                onChange={(e) => handleOptionChange(index, e.target.value)}
                placeholder={`Option ${index + 1}`}
              />
              <RadioGroup
                value={answer.isCorrect ? index.toString() : ""}
                onValueChange={() => handleCorrectAnswerChange(index)}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem
                    value={index.toString()}
                    id={`option-${index}`}
                  />
                  <Label htmlFor={`option-${index}`}>Correct</Label>
                </div>
              </RadioGroup>
            </div>
          ))}
        </div>

        <Button onClick={addQuestion}>
          <Plus className="mr-2 h-4 w-4" /> Add Question
        </Button>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Quiz Preview</h2>
        {questions.map((q, index) => (
          <div key={index} className="border p-4 rounded-md">
            <div className="flex justify-between items-start">
              <p className="font-medium mb-4">
                <span className="font-bold">Question {index + 1}:</span>{" "}
                {q.text}
              </p>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeQuestion(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-2">
              <div className="bg-zinc-50 p-4 rounded-lg">
                <p className="text-sm font-semibold text-slate-700 mb-2">
                  Option(s):
                </p>
                <ul className="space-y-2">
                  {q.answers.map((answer, i) => (
                    <li
                      key={i}
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
            </div>
          </div>
        ))}
      </div>

      <Button
        className="w-full"
        disabled={questions.length === 0}
        onClick={handleSaveQuiz}
      >
        Save Quiz
      </Button>
    </div>
  );
}
