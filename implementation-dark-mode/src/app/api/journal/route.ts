import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { JournalService } from '@/lib/journal';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    const entries = await JournalService.getEntries(session.user.id, limit, offset);

    return NextResponse.json({ entries });
  } catch (error) {
    console.error('Error fetching journal entries:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    console.log('Session:', session); // Debug log
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    console.log('Request body:', body); // Debug log
    
    const { title, content, mood, tags, isPrivate } = body;

    if (!content || typeof content !== 'string') {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    const entryData = {
      title,
      content,
      mood: mood ? parseInt(mood) : undefined,
      tags: Array.isArray(tags) ? tags : [],
      isPrivate: isPrivate ?? true,
    };
    
    console.log('Creating entry with data:', entryData); // Debug log
    
    const entry = await JournalService.createEntry(session.user.id, entryData);
    
    console.log('Entry created successfully:', entry); // Debug log

    return NextResponse.json({ entry }, { status: 201 });
  } catch (error) {
    // Enhanced error logging
    console.error('Error creating journal entry:');
    console.error('Error message:', error instanceof Error ? error.message : 'Unknown error');
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    console.error('Full error object:', error);
    
    return NextResponse.json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}