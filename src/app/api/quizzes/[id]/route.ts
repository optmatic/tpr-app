import { prisma } from '@/lib/prisma'
import { Answer, Question } from '@/lib/types'

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
          create: body.questions.create.map((q: Question) => ({
            text: q.text,
            orderIndex: q.orderIndex,
            answers: {
              create: q.answers.create.map((a: Answer) => ({
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

    return Response.json(updatedQuiz)
  } catch (error: unknown) {
    console.error('Failed to update quiz:', error)
    return Response.json(
      { message: error instanceof Error ? error.message : 'An unknown error occurred' },
      { status: 500 }
    )
  }
} 