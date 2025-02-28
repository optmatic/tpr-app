"use client";

import { useState } from "react";
import QuizCreator from "@/components/QuizCreator";
import QuizList from "@/components/QuizList";
import { Button } from "@/components/ui/button";
import PretestDisplay from "./PretestDisplay";
import PretestTaker from "./PretestTaker";
import type { Quiz, QuizWithRelations } from "@/lib/types";
import { useRouter } from "next/navigation";
import QuizEditor from "@/components/QuizEditor";
import { Toaster } from "@/components/ui/sonner";

// Updated transform function to match types
function transformToUIQuiz(quiz: QuizWithRelations): Quiz {
  return {
    id: quiz.id,
    title: quiz.title,
    questions: quiz.questions.map((q) => ({
      id: q.id,
      text: q.text,
      type: "multiple-choice",
      orderIndex: q.orderIndex,
      quizId: q.quizId,
      updatedAt: quiz.updatedAt,
      correctAnswer: q.answers.find((a) => a.isCorrect)?.text || "",
      answers: q.answers.map((a) => ({
        id: a.id,
        text: a.text,
        isCorrect: a.isCorrect,
        questionId: a.questionId,
      })),
    })),
    author: quiz.author,
    updatedAt: quiz.updatedAt,
  };
}

export default function PretestClient({
  initialQuizzes,
}: {
  initialQuizzes: QuizWithRelations[];
}) {
  const router = useRouter();
  const [showQuizCreator, setShowQuizCreator] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState<QuizWithRelations | null>(
    null
  );
  const [view, setView] = useState<"list" | "edit" | "display" | "take">(
    "list"
  );
  const [quizResults, setQuizResults] = useState<{
    total: number;
    correct: number;
    percentage: number;
  } | null>(null);

  // Memoize the transformed quizzes with proper type annotation
  const quizzes = initialQuizzes.map((quiz) => ({
    id: String(quiz.id),
    title: quiz.title,
    updatedAt: quiz.updatedAt,
    questions: quiz.questions.map((q) => ({
      id: String(q.id),
      type: "multiple-choice" as const, // Use const assertion to fix the type
      question: q.text,
    })),
  }));

  const handleQuizSelect = (quizId: string) => {
    const originalQuiz = initialQuizzes.find((q) => q.id === Number(quizId));
    if (originalQuiz) {
      setSelectedQuiz(originalQuiz);
      setView("display");
    }
  };

  const handleSaveQuiz = async (updatedQuiz: Quiz) => {
    try {
      const requestBody = {
        title: updatedQuiz.title,
        questions: {
          deleteMany: { quizId: updatedQuiz.id },
          create: Array.isArray(updatedQuiz.questions)
            ? updatedQuiz.questions.map((q) => ({
                text: q.text,
                orderIndex: q.orderIndex,
                type: q.type,
                answers: {
                  create: q.answers.map((a) => ({
                    text: a.text,
                    isCorrect: a.isCorrect,
                  })),
                },
              }))
            : [],
        },
      };

      const response = await fetch(`/api/quizzes/${updatedQuiz.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok)
        throw new Error(await response.json().then((data) => data.message));

      router.refresh();
      setView("list");
      setSelectedQuiz(null);
    } catch (error) {
      console.error("Failed to save quiz:", error);
      throw error;
    }
  };

  const handleTakeQuiz = () => {
    setView("take");
    setQuizResults(null);
  };

  const handleQuizComplete = (results: {
    total: number;
    correct: number;
    percentage: number;
  }) => {
    setQuizResults(results);
    // After completing the quiz, go back to the list view
    setView("list");
    setSelectedQuiz(null);
  };

  return (
    <main className="mx-auto p-4">
      <Toaster position="top-center" richColors closeButton />
      <h1>Pretest list</h1>
      {showQuizCreator ? (
        <>
          <Button onClick={() => setShowQuizCreator(false)} className="mb-4">
            Back to Pretest List
          </Button>
          <QuizCreator />
        </>
      ) : view === "edit" && selectedQuiz ? (
        <QuizEditor
          quiz={transformToUIQuiz(selectedQuiz)}
          onSave={(updatedQuiz) => {
            handleSaveQuiz(updatedQuiz);
          }}
          onBack={() => setView("list")}
        />
      ) : view === "take" && selectedQuiz ? (
        <PretestTaker
          quiz={transformToUIQuiz(selectedQuiz)}
          onComplete={handleQuizComplete}
          onBack={() => setView("display")}
        />
      ) : view === "display" && selectedQuiz ? (
        <PretestDisplay
          onEditQuiz={(id: string) => {
            const quiz = initialQuizzes.find((q) => q.id === Number(id));
            if (quiz) {
              setSelectedQuiz(quiz);
              setView("edit");
            }
          }}
          quiz={transformToUIQuiz(selectedQuiz)}
          onBack={() => {
            setSelectedQuiz(null);
            setView("list");
          }}
          onTakeQuiz={handleTakeQuiz}
        />
      ) : (
        <QuizList
          quizzes={quizzes}
          onQuizSelect={handleQuizSelect}
          isLoading={false}
          onArchiveQuiz={() => Promise.resolve()}
          onEditQuiz={(id: string) => {
            const quiz = initialQuizzes.find((q) => q.id === Number(id));
            if (quiz) {
              setSelectedQuiz(quiz);
              setView("edit");
            }
          }}
        />
      )}
    </main>
  );
}
