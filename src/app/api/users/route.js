import { NextResponse } from 'next/server';

import prisma from 'src/lib/prisma';
import { checkAdmin } from 'src/lib/auth';

// GET /api/users - Get all users (admin only)
export async function GET(request) {
  const { isAdmin, error } = checkAdmin(request);

  if (!isAdmin) {
    return NextResponse.json({ error }, { status: error.code === 'FORBIDDEN' ? 403 : 401 });
  }

  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ users });
  } catch (err) {
    console.error('Get users error:', err);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    );
  }
}
