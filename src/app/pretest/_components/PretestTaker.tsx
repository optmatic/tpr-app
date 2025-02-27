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
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Quiz, Question, Answer } from "@/lib/types";

// Type-safe transform function
function transformToUIQuiz(quiz: {
  id: number;
  title: string;
  questions: Array<{
    id: number;
    text: string;
    type?: string;
    orderIndex?: number;
    quizId: number;
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
}): Quiz {
  return {
    id: quiz.id,
    title: quiz.title,
    questions: quiz.questions.map((q) => ({
      id: q.id,
      text: q.text,
      type: (q.type === "short-answer" ? "short-answer" : "multiple-choice") as
        | "multiple-choice"
        | "short-answer",
      orderIndex: q.orderIndex || 0,
      quizId: q.quizId,
      updatedAt: new Date(
        q.updatedAt || quiz.updatedAt || new Date().toISOString()
      ),
      correctAnswer: q.answers.find((a) => a.isCorrect)?.text || "",
      answers: q.answers.map((a) => ({
        id: a.id,
        text: a.text,
        isCorrect: a.isCorrect,
        questionId: a.questionId,
      })),
    })),
    author: quiz.author,
    updatedAt: new Date(quiz.updatedAt || new Date().toISOString()),
  };
}

interface PretestTakerProps {
  quiz: Quiz;
  onComplete?: (results: {
    total: number;
    correct: number;
    percentage: number;
  }) => void;
  onBack?: () => void;
}

export default function PretestTaker({
  quiz,
  onComplete,
  onBack,
}: PretestTakerProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<string[]>([]);
  const [showResults, setShowResults] = useState(false);

  // Initialize userAnswers array with empty strings
  useEffect(() => {
    setUserAnswers(Array(quiz.questions.length).fill(""));
    setCurrentQuestionIndex(0);
    setShowResults(false);
  }, [quiz]);

  // Handle user answering a question
  const handleAnswer = (value: string) => {
    const newAnswers = [...userAnswers];
    newAnswers[currentQuestionIndex] = value;
    setUserAnswers(newAnswers);
  };

  // Calculate quiz results
  const calculateResults = () => {
    let correctCount = 0;

    quiz.questions.forEach((question, index) => {
      const userAnswer = userAnswers[index]?.trim().toLowerCase();
      const correctAnswer = question.correctAnswer?.trim().toLowerCase();

      if (userAnswer && correctAnswer && userAnswer === correctAnswer) {
        correctCount++;
      }
    });

    return {
      total: quiz.questions.length,
      correct: correctCount,
      percentage: Math.round((correctCount / quiz.questions.length) * 100),
    };
  };

  // Handle quiz completion
  const handleComplete = () => {
    setShowResults(true);
    const results = calculateResults();

    // Save results to localStorage
    const quizResult = {
      id: Date.now().toString(), // Generate a unique ID
      studentName: "Current Student", // You might want to get this from user context
      quizName: quiz.title,
      score: `${results.correct}/${results.total} (${results.percentage}%)`,
      date: new Date().toISOString().split("T")[0], // Format as YYYY-MM-DD
    };

    try {
      // Get existing results
      const storedResults = localStorage.getItem("quizResults");
      const existingResults = storedResults ? JSON.parse(storedResults) : [];

      // Add new result and save back to localStorage
      localStorage.setItem(
        "quizResults",
        JSON.stringify([...existingResults, quizResult])
      );
    } catch (error) {
      console.error("Error saving quiz results:", error);
    }

    if (onComplete) {
      onComplete(results);
    }
  };

  // Results view
  if (showResults) {
    const results = calculateResults();

    return (
      <Card className="w-full mx-auto">
        <CardHeader>
          <CardTitle>Quiz Results: {quiz.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-4">
            <div className="text-4xl font-bold">
              {results.correct} / {results.total}
            </div>
            <div className="text-2xl">{results.percentage}%</div>
            <div className="pt-4 flex justify-center gap-4">
              <Button onClick={() => setShowResults(false)}>
                Review Answers
              </Button>
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

  return (
    <Card className="w-full mx-auto">
      <CardHeader>
        <CardTitle>{quiz.title}</CardTitle>
        <CardDescription>
          Question {currentQuestionIndex + 1} of {quiz.questions.length}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <h3 className="text-lg font-medium">
            {quiz.questions[currentQuestionIndex].text}
          </h3>

          {quiz.questions[currentQuestionIndex].type === "multiple-choice" &&
          quiz.questions[currentQuestionIndex].answers?.length > 0 ? (
            <RadioGroup
              value={userAnswers[currentQuestionIndex]}
              onValueChange={handleAnswer}
            >
              {quiz.questions[currentQuestionIndex].answers.map(
                (answer, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-2 border p-4 rounded-lg hover:bg-accent"
                  >
                    <RadioGroupItem
                      value={answer.text}
                      id={`option-${index}`}
                    />
                    <Label
                      htmlFor={`option-${index}`}
                      className="flex-grow cursor-pointer"
                    >
                      {answer.text}
                    </Label>
                  </div>
                )
              )}
            </RadioGroup>
          ) : (
            <Input
              value={userAnswers[currentQuestionIndex]}
              onChange={(e) => handleAnswer(e.target.value)}
              placeholder="Type your answer..."
            />
          )}
        </div>
      </CardContent>
      <CardContent className="flex justify-between pt-6">
        <Button
          variant="outline"
          onClick={() => setCurrentQuestionIndex((i) => i - 1)}
          disabled={currentQuestionIndex === 0}
        >
          <ChevronLeft className="w-4 h-4 mr-2" /> Previous
        </Button>
        {currentQuestionIndex === quiz.questions.length - 1 ? (
          <Button onClick={handleComplete}>Submit Quiz</Button>
        ) : (
          <Button onClick={() => setCurrentQuestionIndex((i) => i + 1)}>
            Next <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
