"use client";

import { useState } from "react";
import QuizList from "@/components/QuizList";
import { Button } from "@/components/ui/button";
import QuizDisplay from "@/components/QuizDisplay";
import type { Quiz, QuizWithRelations } from "@/lib/types";
import { useRouter } from "next/navigation";
import QuizEditor from "@/components/QuizEditor";
import QuizCreator from "@/components/QuizCreator";

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

export default function QuizListClient({
  initialQuizzes,
}: {
  initialQuizzes: QuizWithRelations[];
}) {
  const router = useRouter();
  const [showQuizCreator, setShowQuizCreator] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState<QuizWithRelations | null>(
    null
  );
  const [view, setView] = useState<"list" | "edit" | "display">("list");

  const transformedQuizzes = initialQuizzes.map(transformToUIQuiz);
  const [quizzes] = useState(
    transformedQuizzes.map((quiz) => ({
      id: String(quiz.id),
      title: quiz.title,
      updatedAt: quiz.updatedAt,
      questions: quiz.questions.map((q) => ({
        id: String(q.id),
        type: q.type,
        question: q.text,
      })),
    }))
  );

  const handleQuizSelect = (quizId: string) => {
    const originalQuiz = initialQuizzes.find((q) => q.id === Number(quizId));
    if (originalQuiz) {
      setSelectedQuiz(originalQuiz);
    }
  };

  async function handleSaveQuiz(quiz: Quiz) {
    try {
      console.log("Saving quiz:", quiz);

      // Determine if this is a new quiz or an update
      const isNewQuiz = !quiz.id;
      const method = isNewQuiz ? "POST" : "PUT";

      // Use the correct endpoint - note we're using /api/quizzes for both
      // but with different methods (POST vs PUT)
      const endpoint = "/api/quizzes";

      // For PUT requests, add the ID as a query parameter
      const url = isNewQuiz ? endpoint : `${endpoint}?id=${quiz.id}`;

      console.log(`Using ${method} request to ${url}`);

      // Simplify the data structure to match what the API expects
      const simplifiedQuiz = {
        id: quiz.id,
        title: quiz.title,
        questions: quiz.questions.map((q) => ({
          id: q.id,
          text: q.text,
          type: q.type,
          orderIndex: q.orderIndex || 1,
          answers: q.answers.map((a) => ({
            id: a.id,
            text: a.text,
            isCorrect: a.isCorrect,
          })),
        })),
      };

      // Log the simplified payload
      console.log(
        "Simplified request payload:",
        JSON.stringify(simplifiedQuiz, null, 2)
      );

      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(simplifiedQuiz),
      });

      // Log response status and headers
      console.log("Response status:", response.status);
      console.log(
        "Response headers:",
        Object.fromEntries([...response.headers])
      );

      if (!response.ok) {
        console.error(`Server returned error status: ${response.status}`);
        const errorText = await response.text();
        console.error("Error response:", errorText.substring(0, 500)); // Limit the output
        throw new Error(`Server returned error: ${response.status}`);
      }

      // Get the response as JSON directly
      const data = await response.json();
      console.log("Saved quiz successfully:", data);

      router.refresh();
      setView("list");
      setSelectedQuiz(null);
      return data;
    } catch (error) {
      console.error("Failed to save quiz:", error);
      throw error;
    }
  }

  return (
    <main className="mx-auto p-4">
      <h1>Quiz List</h1>
      {showQuizCreator ? (
        <>
          <Button onClick={() => setShowQuizCreator(false)} className="mb-4">
            Back to Quiz List
          </Button>
          <QuizCreator />
        </>
      ) : view === "edit" && selectedQuiz ? (
        <QuizEditor
          quiz={transformToUIQuiz(selectedQuiz)}
          onSave={handleSaveQuiz}
          onBack={() => setView("list")}
        />
      ) : selectedQuiz ? (
        <QuizDisplay
          onEditQuiz={(id: string) => {
            const quiz = initialQuizzes.find((q) => q.id === Number(id));
            if (quiz) {
              setSelectedQuiz(quiz);
              setView("edit");
            }
          }}
          quiz={transformToUIQuiz(selectedQuiz)}
          onBack={() => setSelectedQuiz(null)}
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
