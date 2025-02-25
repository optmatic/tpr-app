"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import QuizTaker from "./QuizTaker"
import type { Quiz, QuizWithRelations } from "@/lib/types"

// Reuse the same transform function from QuizListClient
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

export default function QuizTakerClient({ initialQuiz }: { initialQuiz: any }) {
  const [loading, setLoading] = useState(true)
  const [fullQuiz, setFullQuiz] = useState<Quiz | null>(null)
  
  useEffect(() => {
    async function fetchFullQuizData() {
      if (!initialQuiz?.id) {
        setLoading(false)
        return
      }
      
      try {
        setLoading(true)
        
        // Fetch the complete quiz with questions and answers
        const response = await fetch(`/api/assessment?id=${initialQuiz.id}`)
        
        if (!response.ok) {
          console.error(`Failed to fetch quiz: ${response.status}`)
          setLoading(false)
          return
        }
        
        const data = await response.json()
        console.log("Fetched full quiz data:", data)
        
        // Transform the data to match the expected format
        const transformedQuiz = transformToUIQuiz(data)
        setFullQuiz(transformedQuiz)
      } catch (error) {
        console.error("Error fetching full quiz data:", error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchFullQuizData()
  }, [initialQuiz?.id])
  
  if (loading) {
    return <div>Loading quiz...</div>
  }
  
  return <QuizTaker quiz={fullQuiz || initialQuiz} />
}