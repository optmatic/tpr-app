"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronLeft } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Pretest } from "@/lib/types";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";

// Type-safe transform function
function transformToUIPretest(pretest: {
  id: number;
  title: string;
  questions: Array<{
    id: number;
    text: string;
    type?: string;
    orderIndex?: number;
    pretestId: number;
    updatedAt?: string;
    correctAnswer?: string;
    answers: Array<{
      id: number;
      text: string;
      isCorrect: boolean;
      questionId: number;
    }>;
  }>;
  author?: any;
  updatedAt?: string;
}): Pretest {
  return {
    id: pretest.id,
    title: pretest.title,
    questions: pretest.questions.map((q) => ({
      id: q.id,
      text: q.text,
      type: "multiple-choice",
      orderIndex: q.orderIndex || 0,
      pretestId: q.pretestId,
      updatedAt: new Date(
        q.updatedAt || pretest.updatedAt || new Date().toISOString()
      ),
      correctAnswer: q.answers.find((a) => a.isCorrect)?.text || "",
      answers: q.answers.map((a) => ({
        id: a.id,
        text: a.text,
        isCorrect: a.isCorrect,
        questionId: a.questionId,
      })),
    })),
    author: pretest.author,
    updatedAt: new Date(pretest.updatedAt || new Date().toISOString()),
  };
}

interface PretestTakerProps {
  pretest: Pretest;
  onComplete?: (results: {
    total: number;
    correct: number;
    percentage: number;
  }) => void;
  onBack?: () => void;
}

export default function PretestTaker({
  pretest,
  onComplete,
  onBack,
}: PretestTakerProps) {
  console.log("PretestTaker rendering with pretest:", pretest.title);
  console.log("Questions count:", pretest.questions.length);
  console.log("Question IDs:", pretest.questions.map((q) => q.id).join(", "));

  const [userAnswers, setUserAnswers] = useState<string[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [allQuestionsAnswered, setAllQuestionsAnswered] = useState(false);

  // Initialize userAnswers array with empty strings
  useEffect(() => {
    console.log("Pretest changed, resetting state for pretest:", pretest.title);
    setUserAnswers(Array(pretest.questions.length).fill(""));
    setShowResults(false);
    setAllQuestionsAnswered(false);
  }, [pretest]);

  // Check if all questions have been answered
  useEffect(() => {
    const answered = userAnswers.every((answer) => answer.trim() !== "");
    setAllQuestionsAnswered(answered);
  }, [userAnswers]);

  // Handle user answering a question
  const handleAnswer = (index: number, value: string) => {
    console.log(`Answering question ${index} with value: ${value}`);
    const newAnswers = [...userAnswers];
    newAnswers[index] = value;
    setUserAnswers(newAnswers);
  };

  // Calculate pretest results
  const calculateResults = () => {
    let correctCount = 0;

    pretest.questions.forEach((question, index) => {
      const userAnswer = userAnswers[index]?.trim().toLowerCase();
      const correctAnswer = question.correctAnswer?.trim().toLowerCase();

      if (userAnswer && correctAnswer && userAnswer === correctAnswer) {
        correctCount++;
      }
    });

    return {
      total: pretest.questions.length,
      correct: correctCount,
      percentage: Math.round((correctCount / pretest.questions.length) * 100),
    };
  };

  // Handle pretest completion
  const handleComplete = () => {
    console.log("Pretest completed, showing results");
    setShowResults(true);
    const results = calculateResults();

    // Save results to localStorage
    const pretestResult = {
      id: Date.now().toString(),
      studentName: "Current Student",
      pretestName: pretest.title,
      score: `${results.correct}/${results.total} (${results.percentage}%)`,
      date: new Date().toISOString().split("T")[0],
    };

    try {
      // Get existing results
      const storedResults = localStorage.getItem("pretestResults");
      const existingResults = storedResults ? JSON.parse(storedResults) : [];

      // Add new result and save back to localStorage
      localStorage.setItem(
        "pretestResults",
        JSON.stringify([...existingResults, pretestResult])
      );
      console.log("Pretest results saved to localStorage");

      // Show success notification with Sonner - using setTimeout to ensure it happens after state update
      setTimeout(() => {
        toast.success("Pretest Submitted Successfully", {
          description: `Your score: ${results.correct}/${results.total} (${results.percentage}%)`,
          duration: 5000, // Show for 5 seconds
        });
        console.log("Toast notification triggered");
      }, 100);
    } catch (error) {
      console.error("Error saving pretest results:", error);
      toast.error("Error Saving Results", {
        description: "There was a problem saving your pretest results.",
        duration: 5000,
      });
    }

    if (onComplete) {
      console.log("Calling onComplete callback");
      onComplete(results);
    }
  };

  // Results view
  if (showResults) {
    console.log("Rendering results view");
    const results = calculateResults();

    return (
      <Card className="w-full mx-auto">
        <CardHeader>
          <CardTitle>Pretest Results: {pretest.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-4">
            <div className="text-4xl font-bold">
              {results.correct} / {results.total}
            </div>
            <div className="text-2xl">{results.percentage}%</div>
            <div className="pt-4 flex justify-center gap-4">
              {onBack && (
                <Button variant="outline" onClick={onBack}>
                  Back
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  console.log(
    "Rendering pretest view with",
    pretest.questions.length,
    "questions"
  );

  // Ensure we have unique questions by ID
  const uniqueQuestions = Array.from(
    new Map(pretest.questions.map((q) => [q.id, q])).values()
  );

  return (
    <Card className="w-full mx-auto">
      <CardHeader>
        <CardTitle>{pretest.title}</CardTitle>
        <CardDescription>
          Answer all questions to complete the pretest.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {uniqueQuestions.map((question, index) => (
          <div key={question.id} className="space-y-4 border-b pb-6">
            <h3 className="text-lg font-medium">
              {index + 1}. {question.text}
            </h3>
            <RadioGroup
              value={userAnswers[index]}
              onValueChange={(value) => handleAnswer(index, value)}
            >
              {question.answers.map((answer, ansIndex) => (
                <div
                  key={ansIndex}
                  className="flex items-center space-x-2 border p-4 rounded-lg hover:bg-accent"
                >
                  <RadioGroupItem
                    value={answer.text}
                    id={`question-${index}-option-${ansIndex}`}
                  />
                  <Label
                    htmlFor={`question-${index}-option-${ansIndex}`}
                    className="flex-grow cursor-pointer"
                  >
                    {answer.text}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        ))}

        <div className="flex justify-between pt-6">
          {onBack && (
            <Button variant="outline" onClick={onBack}>
              <ChevronLeft className="w-4 h-4 mr-2" /> Back
            </Button>
          )}
          <Button onClick={handleComplete} disabled={!allQuestionsAnswered}>
            Submit Pretest
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
