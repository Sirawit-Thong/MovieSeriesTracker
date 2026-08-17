// Admin Users API Route
// GET  /api/admin/users       — List all users with pagination (admin only)
// PUT  /api/admin/users       — Update a user's role (admin only)

import {NextResponse} from 'next/server';
import {auth} from '@/lib/auth/config';
import prisma from '@/lib/db';

function isAdmin(role: unknown): boolean {
  return role === 'ADMIN';
}

const PAGE_SIZE = 20;

// ── GET ──────────────────────────────────────────────────────

export async function GET(request: Request) {
  try {
    const session = await auth();

    if (!session?.user || !isAdmin((session.user as Record<string, unknown>).role)) {
      return NextResponse.json({error: 'Forbidden'}, {status: 403});
    }

    const {searchParams} = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
    const skip = (page - 1) * PAGE_SIZE;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
        },
        orderBy: {createdAt: 'desc'},
        skip,
        take: PAGE_SIZE,
      }),
      prisma.user.count(),
    ]);

    return NextResponse.json({
      users,
      total,
      page,
      pageSize: PAGE_SIZE,
      totalPages: Math.ceil(total / PAGE_SIZE),
    });
  } catch (error) {
    console.error('[admin:users:get]', error);
    return NextResponse.json(
      {error: 'Internal server error'},
      {status: 500},
    );
  }
}

// ── PUT ─────────────────────────────────────────────────────

export async function PUT(request: Request) {
  try {
    const session = await auth();

    if (!session?.user || !isAdmin((session.user as Record<string, unknown>).role)) {
      return NextResponse.json({error: 'Forbidden'}, {status: 403});
    }

    let body: Record<string, unknown>;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({error: 'Invalid JSON body'}, {status: 400});
    }

    const {userId, role} = body;

    if (!userId || typeof userId !== 'string') {
      return NextResponse.json(
        {error: 'userId is required and must be a string'},
        {status: 400},
      );
    }

    const validRoles = ['USER', 'ADMIN'];
    if (!role || typeof role !== 'string' || !validRoles.includes(role)) {
      return NextResponse.json(
        {error: `role must be one of: ${validRoles.join(', ')}`},
        {status: 400},
      );
    }

    // Prevent self-demotion
    if (userId === session.user.id) {
      return NextResponse.json(
        {error: 'Cannot change your own role'},
        {status: 400},
      );
    }

    const updatedUser = await prisma.user.update({
      where: {id: userId},
      data: {role},
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('[admin:users:put]', error);
    return NextResponse.json(
      {error: 'Internal server error'},
      {status: 500},
    );
  }
}
