import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const idParam = searchParams.get('id')
    
    if (!idParam) {
      return NextResponse.json({ error: 'Quiz ID is required' }, { status: 400 })
    }
    
    const id = parseInt(idParam)
    
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid quiz ID' }, { status: 400 })
    }
    
    const quiz = await prisma.quiz.findUnique({
      where: { id },
      include: {
        questions: {
          include: {
            answers: true
          },
          orderBy: {
            orderIndex: 'asc'
          }
        }
      }
    })
    
    if (!quiz) {
      return NextResponse.json({ error: 'Quiz not found' }, { status: 404 })
    }
    
    return NextResponse.json(quiz)
  } catch (error) {
    console.error('Error fetching quiz:', error)
    return NextResponse.json(
      { error: 'Failed to fetch quiz' },
      { status: 500 }
    )
  }
}