import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ChatService } from '@/lib/ai/chat-service';
import { getAvailableProviders } from '@/lib/ai/providers';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'providers') {
      const providers = getAvailableProviders();
      return NextResponse.json({ providers });
    }

    if (action === 'conversations') {
      const conversations = await ChatService.getConversations(session.user.id);
      return NextResponse.json({ conversations });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error fetching chat data:', error);
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
    const { action, conversationId, message, provider, model, context } = body;

    if (action === 'create') {
      if (!provider || !model) {
        return NextResponse.json({ error: 'Provider and model are required' }, { status: 400 });
      }

      const conversation = await ChatService.createConversation(
        session.user.id,
        provider,
        model,
        message
      );

      return NextResponse.json({ conversation }, { status: 201 });
    }

    if (action === 'send' && conversationId && message) {
      const response = await ChatService.sendMessage(
        session.user.id,
        conversationId,
        message,
        context || 'general'
      );

      return NextResponse.json({ response });
    }

    return NextResponse.json({ error: 'Invalid action or missing parameters' }, { status: 400 });
  } catch (error) {
    console.error('Error in chat API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}