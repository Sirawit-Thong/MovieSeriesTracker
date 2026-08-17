import {NextResponse} from 'next/server';
import prisma from '@/lib/db';
import {auth} from '@/lib/auth/config';
import {verifyPassword, hashPassword} from '@/lib/auth/password';
import {changePasswordSchema} from '@/lib/validations/auth';

export async function PUT(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({error: 'Unauthorized'}, {status: 401});
    }

    const body = await request.json();
    const result = changePasswordSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {error: result.error.issues[0].message},
        {status: 400},
      );
    }

    const {currentPassword, newPassword} = result.data;

    const user = await prisma.user.findUnique({
      where: {id: session.user.id},
    });

    if (!user || !user.passwordHash) {
      return NextResponse.json(
        {error: 'No password set for this account'},
        {status: 400},
      );
    }

    const isValid = await verifyPassword(currentPassword, user.passwordHash);

    if (!isValid) {
      return NextResponse.json(
        {error: 'Current password is incorrect'},
        {status: 400},
      );
    }

    const passwordHash = await hashPassword(newPassword);

    await prisma.user.update({
      where: {id: session.user.id},
      data: {passwordHash},
    });

    return NextResponse.json({message: 'Password updated'});
  } catch (error) {
    console.error('[password:put]', error);
    return NextResponse.json(
      {error: 'Internal server error'},
      {status: 500},
    );
  }
}
