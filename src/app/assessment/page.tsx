"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/app/assessment/_components/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import QuizTaker from "./_components/QuizTaker"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import QuizTakerWrapper from "./_components/QuizTakerWrapper"

export default function AssessmentPage() {
  const [quizzes, setQuizzes] = useState<any[]>([])
  const [selectedQuiz, setSelectedQuiz] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    async function fetchQuizzes() {
      try {
        const response = await fetch('/api/quizzes')
        if (!response.ok) {
          throw new Error(`Failed to fetch quizzes: ${response.status}`)
        }
        const data = await response.json()
        console.log('Fetched quizzes data:', data)
        setQuizzes(data)
      } catch (error) {
        console.log('Error fetching quizzes:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchQuizzes()
  }, [])

  const handleQuizSelect = async (quizId: string | number) => {
    try {
      // Find the quiz in our existing data
      const quiz = quizzes.find(q => q.id === quizId)
      
      if (!quiz) {
        console.log(`Quiz with ID ${quizId} not found`)
        return
      }
      
      console.log(`Selected quiz:`, quiz)
      setSelectedQuiz(quiz)
    } catch (error) {
      console.log('Error selecting quiz:', error)
    }
  }
  
  const filteredQuizzes = quizzes
    .filter((quiz) => quiz.title?.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime())
  
  if (loading) {
    return (
      <div className="container py-8">
        <Card className="w-full mx-auto">
          <CardContent className="pt-6">
            <p className="text-center">Loading quizzes...</p>
          </CardContent>
        </Card>
      </div>
    )
  }
  
  return (
    <div className="container py-8">
      {!selectedQuiz ? (
        <Card className="w-full mx-auto">
          <CardHeader>
            <CardTitle>Select a Quiz</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Search className="h-5 w-5 text-gray-500" />
                <Input
                  placeholder="Search quizzes..."
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
                          {quiz.title || "Untitled Quiz"}
                        </a>
                      </TableCell>
                      <TableCell>{quiz.questions?.length || 0}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="max-w-3xl mx-auto">
          <div className="mb-4">
            <Button 
              variant="outline" 
              onClick={() => setSelectedQuiz(null)}
            >
              Back to Quizzes
            </Button>
          </div>
          <QuizTakerWrapper quizId={selectedQuiz.id} />
        </div>
      )}
    </div>
  )
}

