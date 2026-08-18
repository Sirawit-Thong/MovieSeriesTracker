// Admin Users API Route
// GET    /api/admin/users       — List all users with pagination (admin only)
// PUT    /api/admin/users       — Update a user's role (admin only)
// DELETE /api/admin/users       — Delete a user (admin only)
// PATCH  /api/admin/users       — Ban/unban a user (admin only)

import {NextResponse} from 'next/server';
import {requireAdmin} from '@/lib/admin';
import prisma from '@/lib/db';
import {createLogger} from '@/lib/logger';

const log = createLogger('admin:users');

const PAGE_SIZE = 20;

// ── GET ──────────────────────────────────────────────────────

export async function GET(request: Request) {
  try {
    const auth = await requireAdmin();
    if (auth.response) return auth.response;

    const {searchParams} = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
    const search = searchParams.get('search');
    const role = searchParams.get('role');
    const skip = (page - 1) * PAGE_SIZE;

    const where: Record<string, unknown> = {};
    if (search) {
      where.OR = [
        {name: {contains: search, mode: 'insensitive'}},
        {email: {contains: search, mode: 'insensitive'}},
      ];
    }
    if (role && ['USER', 'ADMIN'].includes(role)) {
      where.role = role;
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          banned: true,
          createdAt: true,
        },
        orderBy: {createdAt: 'desc'},
        skip,
        take: PAGE_SIZE,
      }),
      prisma.user.count({where}),
    ]);

    return NextResponse.json({
      users,
      total,
      page,
      pageSize: PAGE_SIZE,
      totalPages: Math.ceil(total / PAGE_SIZE),
    });
  } catch (error) {
    log.error('Failed to fetch users', error);
    return NextResponse.json(
      {error: 'Internal server error'},
      {status: 500},
    );
  }
}

// ── PUT ─────────────────────────────────────────────────────

export async function PUT(request: Request) {
  try {
    const authResult = await requireAdmin();
    if (authResult.response) return authResult.response;
    const sessionUser = authResult.user;

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
    if (userId === sessionUser.id) {
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
        banned: true,
        createdAt: true,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    log.error('Failed to update user', error);
    return NextResponse.json(
      {error: 'Internal server error'},
      {status: 500},
    );
  }
}

// ── DELETE ───────────────────────────────────────────────────

export async function DELETE(request: Request) {
  try {
    const authResult = await requireAdmin();
    if (authResult.response) return authResult.response;
    const sessionUser = authResult.user;

    const {searchParams} = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId || typeof userId !== 'string') {
      return NextResponse.json(
        {error: 'userId is required'},
        {status: 400},
      );
    }

    // Prevent self-deletion
    if (userId === sessionUser.id) {
      return NextResponse.json(
        {error: 'Cannot delete your own account'},
        {status: 400},
      );
    }

    await prisma.user.delete({where: {id: userId}});

    return NextResponse.json({success: true});
  } catch (error) {
    log.error('Failed to delete user', error);
    return NextResponse.json(
      {error: 'Internal server error'},
      {status: 500},
    );
  }
}

// ── PATCH ────────────────────────────────────────────────────

export async function PATCH(request: Request) {
  try {
    const authResult = await requireAdmin();
    if (authResult.response) return authResult.response;
    const sessionUser = authResult.user;

    let body: Record<string, unknown>;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({error: 'Invalid JSON body'}, {status: 400});
    }

    const {userId, banned} = body;

    if (!userId || typeof userId !== 'string') {
      return NextResponse.json(
        {error: 'userId is required and must be a string'},
        {status: 400},
      );
    }

    if (typeof banned !== 'boolean') {
      return NextResponse.json(
        {error: 'banned must be a boolean'},
        {status: 400},
      );
    }

    // Prevent self-ban
    if (userId === sessionUser.id) {
      return NextResponse.json(
        {error: 'Cannot ban your own account'},
        {status: 400},
      );
    }

    const updatedUser = await prisma.user.update({
      where: {id: userId},
      data: {banned},
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        banned: true,
        createdAt: true,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    log.error('Failed to update user ban status', error);
    return NextResponse.json(
      {error: 'Internal server error'},
      {status: 500},
    );
  }
}
