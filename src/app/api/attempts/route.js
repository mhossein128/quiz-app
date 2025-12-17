import { NextResponse } from 'next/server';
import prisma from 'src/lib/prisma';
import { checkAuth } from 'src/lib/auth';

// POST /api/attempts - Submit quiz attempt
export async function POST(request) {
  const { isAuthenticated, user, error } = checkAuth(request);

  if (!isAuthenticated) {
    return NextResponse.json({ error }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { quizId, answers } = body;

    // Validation
    if (!quizId || !answers || !Array.isArray(answers)) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Quiz ID and answers are required' } },
        { status: 400 }
      );
    }

    // Get quiz with correct answers
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        questions: {
          include: {
            options: true,
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

    // Calculate score
    let correctCount = 0;
    const processedAnswers = [];

    for (const answer of answers) {
      const question = quiz.questions.find((q) => q.id === answer.questionId);
      if (question) {
        const correctOption = question.options.find((opt) => opt.isCorrect);
        const isCorrect = correctOption?.id === answer.optionId;
        if (isCorrect) correctCount += 1;

        processedAnswers.push({
          questionId: answer.questionId,
          optionId: answer.optionId,
          isCorrect,
        });
      }
    }

    const totalQuestions = quiz.questions.length;

    // Create attempt record
    const attempt = await prisma.quizAttempt.create({
      data: {
        userId: user.userId,
        quizId,
        score: correctCount,
        total: totalQuestions,
        answers: processedAnswers,
      },
    });

    return NextResponse.json(
      {
        attempt: {
          id: attempt.id,
          score: attempt.score,
          total: attempt.total,
          correctCount,
          incorrectCount: totalQuestions - correctCount,
          percentage: Math.round((correctCount / totalQuestions) * 100),
          createdAt: attempt.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (err) {
    console.error('Submit attempt error:', err);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    );
  }
}

// GET /api/attempts - Get user's attempt history
export async function GET(request) {
  const { isAuthenticated, user, error } = checkAuth(request);

  if (!isAuthenticated) {
    return NextResponse.json({ error }, { status: 401 });
  }

  try {
    const attempts = await prisma.quizAttempt.findMany({
      where: { userId: user.userId },
      include: {
        quiz: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formattedAttempts = attempts.map((attempt) => ({
      id: attempt.id,
      quizId: attempt.quizId,
      quizTitle: attempt.quiz.title,
      score: attempt.score,
      total: attempt.total,
      percentage: Math.round((attempt.score / attempt.total) * 100),
      createdAt: attempt.createdAt,
    }));

    return NextResponse.json({ attempts: formattedAttempts });
  } catch (err) {
    console.error('Get attempts error:', err);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    );
  }
}
