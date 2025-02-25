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

// Add this function at the top level, similar to QuizListClient
function transformToUIQuiz(quizData: any): Quiz {
  if (!quizData) return null;

  return {
    id: quizData.id,
    title: quizData.title,
    questions:
      quizData.questions?.map((q: any) => ({
        id: q.id,
        text: q.text,
        type: "multiple-choice",
        orderIndex: q.orderIndex || 0,
        quizId: q.quizId,
        updatedAt: quizData.updatedAt,
        correctAnswer: q.answers?.find((a: any) => a.isCorrect)?.text || "",
        answers:
          q.answers?.map((a: any) => ({
            id: a.id,
            text: a.text,
            isCorrect: a.isCorrect,
            questionId: a.questionId,
          })) || [],
      })) || [],
    author: quizData.author || { name: "Unknown" },
    updatedAt: quizData.updatedAt,
  };
}

export default function PretestPage() {
  // Quiz selection state
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [selectedQuiz, setSelectedQuiz] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Quiz taking state
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<string[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [quizLoading, setQuizLoading] = useState(false);
  const [quizError, setQuizError] = useState<string | null>(null);

  console.log("=========== PRETESTING LOGS ==========");
  console.log("QuizDisplay received quiz:", JSON.stringify(quiz, null, 2));

  // Fetch all quizzes on page load
  useEffect(() => {
    async function fetchQuizzes() {
      try {
        const response = await fetch("/api/quizzes");
        if (!response.ok) {
          throw new Error(`Failed to fetch quizzes: ${response.status}`);
        }
        const data = await response.json();

        // Add a flag to track quizzes that have previously failed
        const storedFailedQuizzes = localStorage.getItem("failedQuizIds");
        const failedQuizIds = storedFailedQuizzes
          ? JSON.parse(storedFailedQuizzes)
          : [];

        // Mark previously failed quizzes
        const quizzesWithWarnings = data.map((quiz: any) => ({
          ...quiz,
          hasFailedPreviously: failedQuizIds.includes(quiz.id),
        }));

        setQuizzes(quizzesWithWarnings);
      } catch (error) {
        console.log("Error fetching quizzes:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchQuizzes();
  }, []);

  // Handle quiz selection
  const handleQuizSelect = async (quizId: string | number) => {
    try {
      const quiz = quizzes.find((q) => q.id === quizId);
      if (!quiz) {
        setQuizError(`Quiz with ID ${quizId} not found in loaded quizzes`);
        return;
      }

      setSelectedQuiz(quiz);
      setQuizLoading(true);
      setQuizError(null);

      console.log(`Fetching quiz with ID: ${quizId}`);

      // Fetch the complete quiz with questions and answers
      const response = await fetch(`/api/quizzes/${quizId}`, {
        headers: {
          Accept: "application/json",
        },
      });

      console.log(`Response status: ${response.status}`);

      if (!response.ok) {
        let errorMessage;
        try {
          const errorData = await response.json();
          errorMessage = errorData?.error || JSON.stringify(errorData);
        } catch (e) {
          errorMessage = (await response.text()) || "Unknown error";
        }

        // Store the failed quiz ID in localStorage
        const storedFailedQuizzes = localStorage.getItem("failedQuizIds");
        const failedQuizIds = storedFailedQuizzes
          ? JSON.parse(storedFailedQuizzes)
          : [];
        if (!failedQuizIds.includes(quiz.id)) {
          failedQuizIds.push(quiz.id);
          localStorage.setItem("failedQuizIds", JSON.stringify(failedQuizIds));
        }

        // Update the quiz list to mark this quiz as having failed
        setQuizzes((prevQuizzes) =>
          prevQuizzes.map((q) =>
            q.id === quiz.id ? { ...q, hasFailedPreviously: true } : q
          )
        );

        throw new Error(
          `Failed to fetch quiz (${response.status}): ${errorMessage}`
        );
      }

      const quizData = await response.json();
      console.log("Quiz data received:", quizData ? "data present" : "no data");

      // Check if the quiz data has the expected structure
      if (!quizData) {
        throw new Error("No quiz data received from server");
      }

      if (!quizData.questions || !Array.isArray(quizData.questions)) {
        throw new Error(
          `Invalid quiz data: questions property is ${
            quizData.questions ? typeof quizData.questions : "missing"
          }`
        );
      }

      // Use the same transformation function as QuizListClient
      const transformedQuiz = transformToUIQuiz(quizData);

      // Validate that all questions have answers
      const invalidQuestions = transformedQuiz.questions.filter(
        (q) => !q.answers || q.answers.length === 0
      );
      if (invalidQuestions.length > 0) {
        throw new Error(
          `${invalidQuestions.length} questions are missing answer options`
        );
      }

      console.log(
        "Transformed quiz:",
        JSON.stringify(transformedQuiz, null, 2)
      );

      setQuiz(transformedQuiz);
      // Initialize user answers array with empty strings
      setUserAnswers(Array(transformedQuiz.questions.length).fill(""));
      setCurrentQuestionIndex(0);
      setShowResults(false);
    } catch (error) {
      console.error("Error selecting quiz:", error);
      setQuizError(
        error instanceof Error
          ? error.message
          : "Failed to fetch quiz: " + String(error)
      );
    } finally {
      setQuizLoading(false);
    }
  };

  // Filter and sort quizzes based on search term
  const filteredQuizzes = quizzes
    .filter((quiz: Quiz) =>
      quiz.title?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort(
      (a: Quiz, b: Quiz) =>
        new Date(b.updatedAt || 0).getTime() -
        new Date(a.updatedAt || 0).getTime()
    );

  // Handle user answering a question
  const handleAnswer = (value: string) => {
    const newAnswers = [...userAnswers];
    newAnswers[currentQuestionIndex] = value;
    setUserAnswers(newAnswers);
  };

  // Calculate quiz results
  const calculateResults = () => {
    if (!quiz) return { total: 0, correct: 0, percentage: 0 };

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

  // Reset quiz state and go back to quiz selection
  const handleBackToQuizzes = () => {
    setSelectedQuiz(null);
    setQuiz(null);
    setUserAnswers([]);
    setCurrentQuestionIndex(0);
    setShowResults(false);
  };

  // Loading state for initial quiz list
  if (loading) {
    return (
      <div className="container py-8">
        <Card className="w-full mx-auto">
          <CardContent className="pt-6">
            <p className="text-center">Loading pretests...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Quiz selection view
  if (!selectedQuiz) {
    return (
      <div className="container py-8">
        <Card className="w-full mx-auto">
          <CardHeader>
            <CardTitle>Select a Pretest</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Search className="h-5 w-5 text-gray-500" />
                <Input
                  placeholder="Search pretests..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Questions</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredQuizzes.map((quiz) => (
                    <TableRow key={quiz.id} className="hover:bg-transparent">
                      <TableCell className="font-medium">
                        <a
                          onClick={() => handleQuizSelect(quiz.id)}
                          className="hover:text-blue-500 hover:cursor-pointer"
                        >
                          {quiz.title || "Untitled Pretest"}
                        </a>
                      </TableCell>
                      <TableCell>{quiz.questions?.length || 0}</TableCell>
                      <TableCell>
                        {quiz.hasFailedPreviously && (
                          <span className="text-amber-500 text-sm">
                            ⚠️ Previously had loading issues
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Quiz loading state
  if (quizLoading) {
    return (
      <div className="container py-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-4">
            <Button variant="outline" onClick={handleBackToQuizzes}>
              Back to Pretests
            </Button>
          </div>
          <Card className="w-full mx-auto">
            <CardHeader>
              <CardTitle>Loading Pretest</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center">
                Please wait while we load the pretest...
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Quiz error state
  if (quizError) {
    return (
      <div className="container py-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-4">
            <Button variant="outline" onClick={handleBackToQuizzes}>
              Back to Pretests
            </Button>
          </div>
          <Card className="w-full mx-auto">
            <CardHeader>
              <CardTitle>Error Loading Pretest</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center text-red-500">{quizError}</p>
              <p className="text-center mt-2">
                {quizError.includes("Failed to fetch question") ||
                quizError.includes("missing answer options")
                  ? "There appears to be an issue with one or more questions in this pretest. The server may be experiencing problems or the quiz data may be incomplete."
                  : "Please try again or select a different pretest."}
              </p>
              <div className="flex justify-center mt-4">
                <Button
                  onClick={() => handleQuizSelect(selectedQuiz.id)}
                  className="mr-2"
                >
                  Try Again
                </Button>
                <Button variant="outline" onClick={handleBackToQuizzes}>
                  Choose Another Pretest
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Quiz not found state
  if (!quiz) {
    return (
      <div className="container py-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-4">
            <Button variant="outline" onClick={handleBackToQuizzes}>
              Back to Pretests
            </Button>
          </div>
          <Card className="w-full mx-auto">
            <CardHeader>
              <CardTitle>Pretest Not Found</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center">
                The requested pretest could not be found.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Results view
  if (showResults) {
    const results = calculateResults();

    return (
      <div className="container py-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-4">
            <Button variant="outline" onClick={handleBackToQuizzes}>
              Back to Pretests
            </Button>
          </div>
          <Card className="w-full mx-auto">
            <CardHeader>
              <CardTitle>Pretest Results: {quiz.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-4">
                <div className="text-4xl font-bold">
                  {results.correct} / {results.total}
                </div>
                <div className="text-2xl">{results.percentage}%</div>
                <div className="pt-4">
                  <Button onClick={() => setShowResults(false)}>
                    Review Answers
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Quiz taking view
  const currentQuestion = quiz.questions[currentQuestionIndex];

  return (
    <div className="container py-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-4">
          <Button variant="outline" onClick={handleBackToQuizzes}>
            Back to Pretests
          </Button>
        </div>
        <Card className="w-full mx-auto">
          <CardHeader>
            <CardTitle>{quiz.title}</CardTitle>
            <CardDescription>
              Question {currentQuestionIndex + 1} of {quiz.questions.length}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-lg font-medium">{currentQuestion.text}</h3>

              {currentQuestion.type === "multiple-choice" &&
              currentQuestion.answers?.length > 0 ? (
                <RadioGroup
                  value={userAnswers[currentQuestionIndex]}
                  onValueChange={handleAnswer}
                >
                  {currentQuestion.answers.map((answer, index) => (
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
                  ))}
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
              <Button onClick={() => setShowResults(true)}>
                Submit Pretest
              </Button>
            ) : (
              <Button onClick={() => setCurrentQuestionIndex((i) => i + 1)}>
                Next <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
