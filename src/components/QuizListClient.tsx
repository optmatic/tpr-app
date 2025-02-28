"use client"

import { useState } from "react"
import QuizCreator from "@/components/QuizCreator"
import QuizList from "@/components/QuizList"
import { Button } from "@/components/ui/button"
import QuizDisplay from "@/components/QuizDisplay"
import type { Quiz, QuizWithRelations } from "@/lib/types"
import { useRouter } from "next/navigation"
import QuizEditor from "@/components/QuizEditor"

// Updated transform function to match types
function transformToUIQuiz(quiz: QuizWithRelations): Quiz {
  return {
    id: quiz.id,
    title: quiz.title,
    questions: quiz.questions.map(q => ({
      id: q.id,
      text: q.text,
      type: 'multiple-choice',
      orderIndex: q.orderIndex,
      quizId: q.quizId,
      updatedAt: quiz.updatedAt,
      correctAnswer: q.answers.find(a => a.isCorrect)?.text || '',
      answers: q.answers.map(a => ({
        id: a.id,
        text: a.text,
        isCorrect: a.isCorrect,
        questionId: a.questionId
      }))
    })),
    author: quiz.author,
    updatedAt: quiz.updatedAt
  }
}

export default function QuizListClient({ initialQuizzes }: { initialQuizzes: QuizWithRelations[] }) {
  const router = useRouter()
  const [showQuizCreator, setShowQuizCreator] = useState(false)
  const [selectedQuiz, setSelectedQuiz] = useState<QuizWithRelations | null>(null)
  const [view, setView] = useState<'list' | 'edit' | 'display'>('list')
  
  const transformedQuizzes = initialQuizzes.map(transformToUIQuiz)
  const [quizzes] = useState(transformedQuizzes.map(quiz => ({
    id: String(quiz.id),
    title: quiz.title,
    updatedAt: quiz.updatedAt,
    questions: quiz.questions.map(q => ({
      id: String(q.id),
      type: q.type,
      question: q.text
    }))
  })))

  const handleQuizSelect = (quizId: string) => {
    const originalQuiz = initialQuizzes.find(q => q.id === Number(quizId))
    if (originalQuiz) {
      setSelectedQuiz(originalQuiz)
    }
  }

  const handleSaveQuiz = async (updatedQuiz: Quiz) => {
    try {
      const requestBody = {
        title: updatedQuiz.title,
        questions: {
          deleteMany: { quizId: updatedQuiz.id },
          create: Array.isArray(updatedQuiz.questions) ? updatedQuiz.questions.map(q => ({
            text: q.text,
            orderIndex: q.orderIndex,
            type: q.type,
            answers: {
              create: q.answers.map(a => ({
                text: a.text,
                isCorrect: a.isCorrect
              }))
            }
          })) : []
        }
      }

      const response = await fetch(`/api/quizzes/${updatedQuiz.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) throw new Error(await response.json().then(data => data.message))
      
      router.refresh()
      setView('list')
      setSelectedQuiz(null)
    } catch (error) {
      console.error('Failed to save quiz:', error)
      throw error
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
      ) : view === 'edit' && selectedQuiz ? (
        <QuizEditor 
          quiz={transformToUIQuiz(selectedQuiz)}
          onSave={(updatedQuiz) => {
            handleSaveQuiz(updatedQuiz)
          }}
          onBack={() => setView("list")} 
        />
      ) : selectedQuiz ? (
        <QuizDisplay 
          onEditQuiz={(id: string) => {
            const quiz = initialQuizzes.find(q => q.id === Number(id))
            if (quiz) {
              setSelectedQuiz(quiz)
              setView('edit')
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
            const quiz = initialQuizzes.find(q => q.id === Number(id))
            if (quiz) {
              setSelectedQuiz(quiz)
              setView('edit')
            }
          }}
        />
      )}
    </main>
  )
}