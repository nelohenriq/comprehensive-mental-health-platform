import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const thoughtRecords = await (prisma as any).thoughtRecord.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ records: thoughtRecords });
  } catch (error) {
    console.error('Error fetching thought records:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
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

    const thoughtRecord = await (prisma as any).thoughtRecord.create({
      data: {
        userId: session.user.id,
        situation,
        thoughts,
        emotions,
        behaviors,
        alternativeThoughts,
        outcome,
      },
    });

    return NextResponse.json({ record: thoughtRecord }, { status: 201 });
  } catch (error) {
    console.error('Error creating thought record:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}