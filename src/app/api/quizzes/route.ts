import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

type Answer = {
  text: string
  isCorrect: boolean
}

type Question = {
  text: string
  orderIndex: number
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
            answers: {
              create: q.answers.map((a: Answer) => ({
                text: a.text,
                isCorrect: a.isCorrect
              }))
            }
          }))
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