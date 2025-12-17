import { NextResponse } from 'next/server';
import prisma from 'src/lib/prisma';
import { checkAuth } from 'src/lib/auth';

// GET /api/quizzes/[id] - Get quiz with questions (without correct answers)
export async function GET(request, { params }) {
  const { isAuthenticated, error } = checkAuth(request);

  if (!isAuthenticated) {
    return NextResponse.json({ error }, { status: 401 });
  }

  try {
    const { id } = await params;

    const quiz = await prisma.quiz.findUnique({
      where: { id },
      include: {
        questions: {
          orderBy: { order: 'asc' },
          include: {
            options: {
              select: {
                id: true,
                text: true,
                // Don't include isCorrect for quiz taking
              },
            },
          },
        },
      },
    });

    if (!quiz) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Quiz not found' } },
        { status: 404 }
      );
    }

    return NextResponse.json({
      quiz: {
        id: quiz.id,
        title: quiz.title,
        description: quiz.description,
        questions: quiz.questions.map((q) => ({
          id: q.id,
          text: q.text,
          order: q.order,
          options: q.options,
        })),
      },
    });
  } catch (err) {
    console.error('Get quiz error:', err);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    );
  }
}
