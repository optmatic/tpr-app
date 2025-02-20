"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Edit, Trash2, Search } from "lucide-react"
import { QuizListProps } from "@/lib/types"

export default function QuizList({ quizzes, onQuizSelect, isLoading, onArchiveQuiz, onEditQuiz }: QuizListProps) {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredQuizzes = quizzes
    .filter((quiz) => quiz.title.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())

  const handleDelete = async (id: string) => {
    try {
      await onArchiveQuiz(id)
    } catch (error) {
      console.error('Failed to archive quiz:', error)
      // You might want to add toast notification here
    }
  }

  const handleEdit = (id: string) => {
    onEditQuiz(id)
  }

  return (
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

      {isLoading ? (
        <div>Loading quizzes...</div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Questions</TableHead>
              {/* <TableHead>Actions</TableHead> */}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredQuizzes.map((quiz) => (
              <TableRow key={quiz.id} className="hover:bg-transparent">
                <TableCell className="font-medium"><a onClick={() => onQuizSelect(quiz.id)} className="hover:text-blue-500 hover:cursor-pointer">{quiz.title}</a></TableCell>
                <TableCell>{quiz.questions.length}</TableCell>
                {/* <TableCell>
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleEdit(quiz.id)
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDelete(quiz.id)
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell> */}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}

