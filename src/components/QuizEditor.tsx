"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Trash2, Plus, ArrowLeft } from "lucide-react"
import { Question } from "@/lib/types"
import { Quiz } from '../lib/types'

type QuizEditorProps = {
  quiz: Quiz
  onSave: (updatedQuiz: Quiz) => void
  onBack: () => void
}

export default function QuizEditor({ quiz: initialQuiz, onSave, onBack }: QuizEditorProps) {
  const [quiz, setQuiz] = useState<Quiz>(initialQuiz)

  const updateQuizTitle = (newTitle: string) => {
    setQuiz({ ...quiz, title: newTitle })
  }

  const addQuestion = () => {
    const newQuestion: Question = {
      id: Date.now(),
      text: "",
      orderIndex: quiz.questions.length,
      quizId: quiz.id,
      type: "multiple-choice",
      correctAnswer: "",
      answers: [
        { id: Date.now(), text: "", isCorrect: false, questionId: Date.now() },
        { id: Date.now() + 1, text: "", isCorrect: false, questionId: Date.now() },
        { id: Date.now() + 2, text: "", isCorrect: false, questionId: Date.now() },
        { id: Date.now() + 3, text: "", isCorrect: true, questionId: Date.now() }
      ]
    }
    setQuiz({ ...quiz, questions: [...quiz.questions, newQuestion] })
  }

  const updateQuestion = (index: number, updatedQuestion: Question) => {
    const updatedQuestions = [...quiz.questions]
    updatedQuestions[index] = updatedQuestion
    setQuiz({ ...quiz, questions: updatedQuestions })
  }

  const removeQuestion = (index: number) => {
    const updatedQuestions = quiz.questions.filter((_, i) => i !== index)
    setQuiz({ ...quiz, questions: updatedQuestions })
  }

  const handleSave = async () => {
    try {
      await onSave(quiz)
    } catch (error) {
      console.error('Failed to save quiz:', error)
    }
  }

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={onBack} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Quiz List
      </Button>
      <div className="space-y-4">
        <h2 className="text-3xl font-bold">Edit Quiz</h2>
        <Input
          value={quiz.title}
          onChange={(e) => updateQuizTitle(e.target.value)}
          placeholder="Quiz Title"
          className="text-2xl font-bold"
        />
      </div>
      {quiz.questions.map((question, index) => (
        <Card key={question.id}>
          <CardHeader>
            <CardTitle className="flex justify-between">
              <span>Question {index + 1}</span>
              <Button variant="ghost" size="icon" onClick={() => removeQuestion(index)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Textarea
                value={question.text}
                onChange={(e) => updateQuestion(index, { ...question, text: e.target.value })}
                placeholder="Enter question"
              />
              <RadioGroup
                value={question.type}
                onValueChange={(value) =>
                  updateQuestion(index, { ...question, type: value as "multiple-choice" | "short-answer" })
                }
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="multiple-choice" id={`mc-${index}`} />
                  <Label htmlFor={`mc-${index}`}>Multiple Choice</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="short-answer" id={`sa-${index}`} />
                  <Label htmlFor={`sa-${index}`}>Short Answer</Label>
                </div>
              </RadioGroup>
              {question.type === "multiple-choice" && (
                <div className="space-y-2">
                  {question.answers.map((answer, answerIndex) => (
                    <div key={answer.id} className="flex gap-2">
                      <Input
                        value={answer.text}
                        onChange={(e) => {
                          const newAnswers = [...question.answers]
                          newAnswers[answerIndex] = { ...answer, text: e.target.value }
                          updateQuestion(index, { ...question, answers: newAnswers })
                        }}
                        placeholder={`Option ${answerIndex + 1}`}
                      />
                      <RadioGroup
                        value={answer.isCorrect ? "correct" : "incorrect"}
                        onValueChange={(value) => {
                          const newAnswers = question.answers.map((a, idx) => ({
                            ...a,
                            isCorrect: idx === answerIndex ? value === "correct" : false
                          }))
                          updateQuestion(index, { ...question, answers: newAnswers })
                        }}
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="correct" id={`correct-${answer.id}`} />
                          <Label htmlFor={`correct-${answer.id}`}>Correct</Label>
                        </div>
                      </RadioGroup>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
      <div className="flex justify-between">
        <Button onClick={addQuestion}>
          <Plus className="mr-2 h-4 w-4" /> Add Question
        </Button>
        <Button onClick={handleSave}>Save Quiz</Button>
      </div>
    </div>
  )
}

