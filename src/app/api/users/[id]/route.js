import { NextResponse } from 'next/server';

import prisma from 'src/lib/prisma';
import { checkAdmin } from 'src/lib/auth';

// PATCH /api/users/:id - Update user role (admin only)
export async function PATCH(request, { params }) {
  const { isAdmin, user: adminUser, error } = checkAdmin(request);

  if (!isAdmin) {
    return NextResponse.json({ error }, { status: error.code === 'FORBIDDEN' ? 403 : 401 });
  }

  const { id } = await params;

  // Prevent admin from changing their own role
  if (adminUser.userId === id) {
    return NextResponse.json(
      { error: { code: 'SELF_ROLE_CHANGE', message: 'Cannot change your own role' } },
      { status: 400 }
    );
  }

  try {
    const body = await request.json();
    const { role } = body;

    // Validate role
    if (!role || !['USER', 'ADMIN'].includes(role)) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Invalid role value' } },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { id } });
    if (!existingUser) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'User not found' } },
        { status: 404 }
      );
    }

    // Update user role
    const updatedUser = await prisma.user.update({
      where: { id },
      data: { role },
      select: {
        id: true,
        username: true,
        role: true,
      },
    });

    return NextResponse.json({ user: updatedUser });
  } catch (err) {
    console.error('Update user role error:', err);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    );
  }
}
