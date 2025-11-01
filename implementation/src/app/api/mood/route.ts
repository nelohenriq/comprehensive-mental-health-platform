import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { MoodService } from '@/lib/mood';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '30');
    const offset = parseInt(searchParams.get('offset') || '0');
    const stats = searchParams.get('stats') === 'true';

    if (stats) {
      const moodStats = await MoodService.getMoodStats(session.user.id);
      return NextResponse.json({ stats: moodStats });
    }

    const entries = await MoodService.getEntries(session.user.id, limit, offset);
    return NextResponse.json({ entries });
  } catch (error) {
    console.error('Error fetching mood entries:', error);
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
    const { mood, note, activities, sleepHours, stressLevel } = body;

    if (!mood || typeof mood !== 'number' || mood < 1 || mood > 5) {
      return NextResponse.json({ error: 'Mood must be a number between 1 and 5' }, { status: 400 });
    }

    const entry = await MoodService.createEntry(session.user.id, {
      mood,
      note,
      activities: Array.isArray(activities) ? activities : [],
      sleepHours: sleepHours ? parseFloat(sleepHours) : undefined,
      stressLevel: stressLevel ? parseInt(stressLevel) : undefined,
    });

    return NextResponse.json({ entry }, { status: 201 });
  } catch (error) {
    console.error('Error creating mood entry:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}