import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

type Answer = {
  text: string
  isCorrect: boolean
}

type Question = {
  text: string
  orderIndex: number
  type: 'multiple-choice'
  answers: Answer[]
}

// Test endpoint
export async function GET() {
  try {
    const quizzes = await prisma.quiz.findMany({
      include: {
        questions: {
          select: {
            id: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    return NextResponse.json(quizzes, {
      headers: {
        'Content-Type': 'application/json'
      }
    })
  } catch (error) {
    console.error('Failed to fetch quizzes:', error)
    return NextResponse.json(
      { error: 'Failed to fetch quizzes' },
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )
  }
}

export async function POST(request: Request) {
  try {
    const { title, questions } = await request.json() as { 
      title: string
      questions: Question[]
    }
    
    console.log('Received request:', { title, questions });

    // Validate input
    if (!title.trim()) {
      return NextResponse.json(
        { error: 'Quiz title is required' },
        { status: 400 }
      )
    }

    if (!questions.length) {
      return NextResponse.json(
        { error: 'At least one question is required' },
        { status: 400 }
      )
    }
    
    const quiz = await prisma.quiz.create({
      data: {
        title,
        questions: {
          create: questions.map((q: Question) => ({
            text: q.text,
            orderIndex: q.orderIndex,
            type: q.type,
            options: q.answers.map(a => a.text).join(','),
            answer: q.answers.find(a => a.isCorrect)?.text || ''
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

    return NextResponse.json(quiz)
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'API Error: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const { id, title, questions } = await request.json() as {
      id: number
      title: string
      questions: Question[]
    }

    // Validate input
    if (!id) {
      return NextResponse.json(
        { error: 'Quiz ID is required' },
        { status: 400 }
      )
    }

    if (!title.trim()) {
      return NextResponse.json(
        { error: 'Quiz title is required' },
        { status: 400 }
      )
    }

    // Update the quiz and its questions
    const updatedQuiz = await prisma.quiz.update({
      where: { id },
      data: {
        title,
        questions: {
          deleteMany: {},
          create: questions.map((q) => ({
            text: q.text,
            orderIndex: q.orderIndex,
            type: q.type,
            options: q.answers.map(a => a.text).join(','),
            answer: q.answers.find(a => a.isCorrect)?.text || ''
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
  } catch (error) {
    console.error('Failed to update quiz:', error)
    return NextResponse.json(
      { error: 'Failed to update quiz' },
      { status: 500 }
    )
  }
} 