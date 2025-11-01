import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { JournalService } from '@/lib/journal';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const entry = await JournalService.getEntryById(session.user.id, params.id);

    return NextResponse.json({ entry });
  } catch (error) {
    console.error('Error fetching journal entry:', error);
    if (error instanceof Error && error.message === 'Journal entry not found') {
      return NextResponse.json({ error: 'Entry not found' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

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
    const { title, content, mood, tags, isPrivate } = body;

    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (content !== undefined) updateData.content = content;
    if (mood !== undefined) updateData.mood = parseInt(mood);
    if (tags !== undefined) updateData.tags = Array.isArray(tags) ? tags : [];
    if (isPrivate !== undefined) updateData.isPrivate = isPrivate;

    const entry = await JournalService.updateEntry(session.user.id, params.id, updateData);

    return NextResponse.json({ entry });
  } catch (error) {
    console.error('Error updating journal entry:', error);
    if (error instanceof Error && error.message === 'Journal entry not found') {
      return NextResponse.json({ error: 'Entry not found' }, { status: 404 });
    }
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

    await JournalService.deleteEntry(session.user.id, params.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting journal entry:', error);
    if (error instanceof Error && error.message === 'Journal entry not found') {
      return NextResponse.json({ error: 'Entry not found' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}