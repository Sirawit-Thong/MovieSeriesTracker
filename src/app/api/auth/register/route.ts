import {NextResponse} from 'next/server';
import prisma from '@/lib/db';
import {hashPassword} from '@/lib/auth/password';
import {registerSchema} from '@/lib/validations/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = registerSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {error: result.error.issues[0].message},
        {status: 400},
      );
    }

    const {name, email, password} = result.data;

    const existingUser = await prisma.user.findUnique({
      where: {email},
    });

    if (existingUser) {
      return NextResponse.json(
        {error: 'Email already registered'},
        {status: 409},
      );
    }

    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
      },
    });

    return NextResponse.json(
      {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      {status: 201},
    );
  } catch (error) {
    console.error('[register]', error);
    return NextResponse.json(
      {error: 'Internal server error'},
      {status: 500},
    );
  }
}
