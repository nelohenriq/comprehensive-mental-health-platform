import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { situation, thoughts, emotions, behaviors, alternativeThoughts, outcome } = body;

    if (!situation || !thoughts || !emotions || !behaviors || !alternativeThoughts || !outcome) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    const thoughtRecord = await (prisma as any).thoughtRecord.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });

    if (!thoughtRecord) {
      return NextResponse.json({ error: 'Thought record not found' }, { status: 404 });
    }

    const updatedRecord = await (prisma as any).thoughtRecord.update({
      where: { id: params.id },
      data: {
        situation,
        thoughts,
        emotions,
        behaviors,
        alternativeThoughts,
        outcome,
      },
    });

    return NextResponse.json({ record: updatedRecord });
  } catch (error) {
    console.error('Error updating thought record:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const thoughtRecord = await (prisma as any).thoughtRecord.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });

    if (!thoughtRecord) {
      return NextResponse.json({ error: 'Thought record not found' }, { status: 404 });
    }

    await (prisma as any).thoughtRecord.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Thought record deleted successfully' });
  } catch (error) {
    console.error('Error deleting thought record:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}