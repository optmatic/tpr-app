"use client"

import { useState } from "react"
import QuizCreator from "@/components/QuizCreator"
import QuizList from "@/components/QuizList"
import { Button } from "@/components/ui/button"
import QuizDisplay from "@/components/QuizDisplay"
import type { Quiz } from "@/components/QuizDisplay"
import type { QuizWithRelations } from "@/lib/types"

export default function QuizListClient({ initialQuizzes }: { initialQuizzes: QuizWithRelations[] }) {
  const [showQuizCreator, setShowQuizCreator] = useState(false)
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null)
  
  const transformedQuizzes = initialQuizzes.map(quiz => {
    console.log("Initial quiz:", quiz);
    return ({
      id: String(quiz.id),
      title: quiz.title,
      author: quiz.author,
      questions: quiz.questions.map(q => {
        console.log("Question with answers:", q);
        return ({
          id: String(q.id),
          type: "multiple-choice" as const,
          question: q.text,
          options: q.answers.map(a => ({
            id: String(a.id),
            text: a.text,
            isCorrect: a.isCorrect
          }))
        })
      })
    })
  })
  console.log("Transformed quizzes:", transformedQuizzes);
  
  const [quizzes] = useState(transformedQuizzes)
  const handleQuizSelect = (quizId: string) => {
    const quiz = quizzes.find(q => q.id === quizId)
    if (quiz) {
      setSelectedQuiz({
        id: Number(quiz.id),
        title: quiz.title,
        author: quiz.author,
        questions: quiz.questions.map(q => ({
          id: Number(q.id),
          text: q.question,
          orderIndex: 0,
          quizId: Number(quiz.id),
          answers: q.options
        }))
      })
    }
  }

  return (
    <main className="container mx-auto p-4">
      <h1 className="text-3xl font-serif font-bold mb-6">Quiz List</h1>
      {showQuizCreator ? (
        <>
          <Button onClick={() => setShowQuizCreator(false)} className="mb-4">
            Back to Quiz List
          </Button>
          <QuizCreator />
        </>
      ) : selectedQuiz ? (
        <QuizDisplay 
          quiz={selectedQuiz} 
          onBack={() => setSelectedQuiz(null)} 
        />
      ) : (
        <QuizList 
          quizzes={(() => {
            console.log("Quizzes being passed to QuizList:", quizzes);
            return quizzes;
          })()}
          onQuizSelect={handleQuizSelect}
          isLoading={false} 
        />
      )}
    </main>
  )
}