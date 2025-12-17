import { NextResponse } from 'next/server';

import prisma from 'src/lib/prisma';
import { checkAuth } from 'src/lib/auth';

// GET /api/attempts/[id] - Get attempt details
export async function GET(request, { params }) {
  const { isAuthenticated, user, error } = checkAuth(request);

  if (!isAuthenticated) {
    return NextResponse.json({ error }, { status: 401 });
  }

  try {
    const { id } = await params;

    const attempt = await prisma.quizAttempt.findUnique({
      where: { id },
      include: {
        quiz: {
          select: {
            id: true,
            title: true,
            description: true,
          },
        },
      },
    });

    if (!attempt) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Attempt not found' } },
        { status: 404 }
      );
    }

    // Check if attempt belongs to user
    if (attempt.userId !== user.userId) {
      return NextResponse.json(
        { error: { code: 'FORBIDDEN', message: 'Access denied' } },
        { status: 403 }
      );
    }

    return NextResponse.json({
      attempt: {
        id: attempt.id,
        quiz: attempt.quiz,
        score: attempt.score,
        total: attempt.total,
        correctCount: attempt.score,
        incorrectCount: attempt.total - attempt.score,
        percentage: Math.round((attempt.score / attempt.total) * 100),
        answers: attempt.answers,
        createdAt: attempt.createdAt,
      },
    });
  } catch (err) {
    console.error('Get attempt error:', err);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    );
  }
}
