"use client"

import { useState, useEffect } from "react"
import QuizTaker from "./QuizTaker"
import { Card, CardContent, CardHeader, CardTitle } from "./card"
import { Button } from "@/components/ui/button"
import { Quiz } from "@/lib/types"

export default function QuizTakerWrapper({ quizId }: { quizId: number }) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  
  useEffect(() => {
    async function fetchQuizQuestions() {
      try {
        setLoading(true)
        setError(null)
        
        // Fetch the complete quiz with questions and answers in a single request
        const response = await fetch(`/api/quizzes/${quizId}`)
        
        if (!response.ok) {
          throw new Error(`Failed to fetch quiz: ${response.status}`)
        }
        
        const quizData = await response.json()
        console.log("Fetched quiz data:", quizData)
        
        // Transform the quiz data to match the Quiz type
        const transformedQuiz = {
          id: quizData.id,
          title: quizData.title,
          questions: quizData.questions.map((q: any) => ({
            id: q.id,
            text: q.text,
            type: 'multiple-choice',
            orderIndex: q.orderIndex,
            quizId: q.quizId,
            updatedAt: quizData.updatedAt,
            correctAnswer: q.answers.find((a: any) => a.isCorrect)?.text || '',
            answers: q.answers.map((a: any) => ({
              id: a.id,
              text: a.text,
              isCorrect: a.isCorrect,
              questionId: a.questionId
            }))
          })),
          author: quizData.author,
          updatedAt: quizData.updatedAt
        }
        
        console.log("Transformed quiz:", transformedQuiz)
        setQuiz(transformedQuiz)
      } catch (error) {
        console.error("Error fetching quiz:", error)
        setError(error instanceof Error ? error.message : "Failed to fetch quiz")
      } finally {
        setLoading(false)
      }
    }
    
    fetchQuizQuestions()
  }, [quizId])
  
  if (loading) {
    return (
      <Card className="w-full mx-auto">
        <CardHeader>
          <CardTitle>Loading Quiz</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center">Please wait while we load the quiz...</p>
        </CardContent>
      </Card>
    )
  }
  
  if (error) {
    return (
      <Card className="w-full mx-auto">
        <CardHeader>
          <CardTitle>Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-red-500">{error}</p>
          <div className="flex justify-center mt-4">
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }
  
  if (!quiz) {
    return (
      <Card className="w-full mx-auto">
        <CardHeader>
          <CardTitle>Quiz Not Found</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center">The requested quiz could not be found.</p>
        </CardContent>
      </Card>
    )
  }
  
  return <QuizTaker quiz={quiz} />
}