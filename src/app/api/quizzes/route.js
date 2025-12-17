import { NextResponse } from 'next/server';
import prisma from 'src/lib/prisma';
import { checkAuth, checkAdmin } from 'src/lib/auth';

// GET /api/quizzes - Get all quizzes
export async function GET(request) {
  const { isAuthenticated, user, error } = checkAuth(request);

  if (!isAuthenticated) {
    return NextResponse.json({ error }, { status: 401 });
  }

  try {
    const quizzes = await prisma.quiz.findMany({
      include: {
        _count: {
          select: { questions: true },
        },
        attempts: {
          where: { userId: user.userId },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formattedQuizzes = quizzes.map((quiz) => ({
      id: quiz.id,
      title: quiz.title,
      description: quiz.description,
      questionCount: quiz._count.questions,
      userScore: quiz.attempts[0]
        ? Math.round((quiz.attempts[0].score / quiz.attempts[0].total) * 100)
        : null,
      lastAttempt: quiz.attempts[0]?.createdAt || null,
    }));

    return NextResponse.json({ quizzes: formattedQuizzes });
  } catch (err) {
    console.error('Get quizzes error:', err);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    );
  }
}

// POST /api/quizzes - Create new quiz (admin only)
export async function POST(request) {
  const { isAdmin, error } = checkAdmin(request);

  if (!isAdmin) {
    return NextResponse.json({ error }, { status: error.code === 'FORBIDDEN' ? 403 : 401 });
  }

  try {
    const body = await request.json();
    const { title, description, questions } = body;

    // Validation
    if (!title || !description || !questions || !Array.isArray(questions)) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Title, description, and questions are required',
          },
        },
        { status: 400 }
      );
    }

    if (questions.length === 0) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'At least one question is required' } },
        { status: 400 }
      );
    }

    // Validate each question
    for (let i = 0; i < questions.length; i += 1) {
      const q = questions[i];
      if (!q.text || !q.options || q.options.length !== 4) {
        return NextResponse.json(
          {
            error: {
              code: 'VALIDATION_ERROR',
              message: `Question ${i + 1} must have text and exactly 4 options`,
            },
          },
          { status: 400 }
        );
      }

      const correctCount = q.options.filter((opt) => opt.isCorrect).length;
      if (correctCount !== 1) {
        return NextResponse.json(
          {
            error: {
              code: 'VALIDATION_ERROR',
              message: `Question ${i + 1} must have exactly one correct answer`,
            },
          },
          { status: 400 }
        );
      }
    }

    // Create quiz with questions and options
    const quiz = await prisma.quiz.create({
      data: {
        title,
        description,
        questions: {
          create: questions.map((q, index) => ({
            text: q.text,
            order: index + 1,
            options: {
              create: q.options.map((opt) => ({
                text: opt.text,
                isCorrect: opt.isCorrect || false,
              })),
            },
          })),
        },
      },
      include: {
        questions: {
          include: { options: true },
        },
      },
    });

    return NextResponse.json({ quiz }, { status: 201 });
  } catch (err) {
    console.error('Create quiz error:', err);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    );
  }
}
