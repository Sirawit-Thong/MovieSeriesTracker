import {NextResponse} from 'next/server';
import {requireAdmin} from '@/lib/admin';
import prisma from '@/lib/db';

export async function GET(request: Request) {
  try {
    const auth = await requireAdmin();
    if (auth.response) return auth.response;

    const {searchParams} = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
    const pageSize = 20;
    const skip = (page - 1) * pageSize;
    const search = searchParams.get('search') ?? '';
    const method = searchParams.get('method') ?? '';
    const success = searchParams.get('success');

    const where: Record<string, unknown> = {};
    if (search) {
      where.OR = [
        {email: {contains: search, mode: 'insensitive'}},
        {name: {contains: search, mode: 'insensitive'}},
      ];
    }
    if (method) {
      where.method = method;
    }
    if (success !== null && success !== '') {
      where.success = success === 'true';
    }

    const [logs, total] = await Promise.all([
      prisma.loginLog.findMany({
        where,
        orderBy: {createdAt: 'desc'},
        skip,
        take: pageSize,
      }),
      prisma.loginLog.count({where}),
    ]);

    return NextResponse.json({
      logs,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error) {
    console.error('[admin:login-logs]', error);
    return NextResponse.json({error: 'Internal server error'}, {status: 500});
  }
}
