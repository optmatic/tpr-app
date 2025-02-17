import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

interface Answer {
  text: string
  isCorrect: boolean
}

interface Question {
  text: string
  orderIndex: number
  answers: Answer[]
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { title, questions } = await request.json()
    const id = parseInt(params.id)

    const updatedQuiz = await prisma.quiz.update({
      where: { id },
      data: {
        title,
        questions: {
          deleteMany: {
            quizId: id
          },
          create: questions.map((q: any) => ({
            text: q.text,
            orderIndex: q.orderIndex,
            answers: {
              create: q.answers.create
            }
          }))
        }
      },
      include: {
        questions: {
          include: {
            answers: true
          }
        }
      }
    })

    return Response.json(updatedQuiz)
  } catch (error: unknown) {
    console.error('Failed to update quiz:', error)
    return Response.json(
      { message: error instanceof Error ? error.message : 'An unknown error occurred' },
      { status: 500 }
    )
  }
} 