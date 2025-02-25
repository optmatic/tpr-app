import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)
    
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid question ID' }, { status: 400 })
    }
    
    const question = await prisma.question.findUnique({
      where: { id },
      include: {
        answers: true
      }
    })
    
    if (!question) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 })
    }
    
    return NextResponse.json(question)
  } catch (error) {
    console.error('Error fetching question:', error)
    return NextResponse.json(
      { error: 'Failed to fetch question' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const id = parseInt(params.id)

    // First, delete all existing answers for this quiz's questions
    await prisma.answer.deleteMany({
      where: {
        question: {
          quizId: id
        }
      }
    })

    // Then delete all existing questions
    await prisma.question.deleteMany({
      where: {
        quizId: id
      }
    })

    // Finally, update the quiz with new questions and answers
    const updatedQuiz = await prisma.quiz.update({
      where: { id },
      data: {
        title: body.title,
        questions: {
          create: body.questions.map((q: any) => ({
            text: q.text,
            orderIndex: q.orderIndex,
            type: q.type || 'multiple-choice',
            correctAnswer: q.correctAnswer,
            answers: {
              create: q.answers.map((a: any) => ({
                text: a.text,
                isCorrect: a.isCorrect
              }))
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

    return NextResponse.json(updatedQuiz)
  } catch (error: unknown) {
    console.error('Failed to update quiz:', error)
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'An unknown error occurred' },
      { status: 500 }
    )
  }
} 