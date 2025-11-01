import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ChatService } from '@/lib/ai/chat-service';
import { getAvailableProviders, getProviderConfig } from '@/lib/ai/providers';

// Simple in-memory cache for connection status (resets on server restart)
const connectionCache = new Map<string, { status: string; timestamp: number; ttl: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Helper function to test provider connection
async function testProviderConnection(providerId: string, apiKey: string): Promise<boolean> {
  try {
    const provider = getProviderConfig(providerId);
    if (!provider) return false;

    // Simple test request - just check if API responds
    switch (providerId) {
      case 'openai':
        const openaiResponse = await fetch('https://api.openai.com/v1/models', {
          headers: { 'Authorization': `Bearer ${apiKey}` }
        });
        return openaiResponse.ok;

      case 'anthropic':
        const anthropicResponse = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify({
            model: 'claude-3-haiku-20240307',
            max_tokens: 1,
            messages: [{ role: 'user', content: 'test' }]
          })
        });
        return anthropicResponse.status !== 401 && anthropicResponse.status !== 403;

      case 'google':
        const googleResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        return googleResponse.ok;

      case 'groq':
        console.log('Testing Groq connection with API key starting with:', apiKey.substring(0, 10));
        try {
          const groqResponse = await fetch('https://api.groq.com/openai/v1/models', {
            headers: { 'Authorization': `Bearer ${apiKey}` }
          });
          console.log('Groq response status:', groqResponse.status, groqResponse.statusText);
          if (!groqResponse.ok) {
            console.log('Groq response body:', await groqResponse.text());
          }
          return groqResponse.ok;
        } catch (fetchError) {
          console.error('Groq fetch error:', fetchError);
          return false;
        }

      case 'ollama':
        // For Ollama, just check if the service is running
        const ollamaResponse = await fetch('http://localhost:11434/api/tags');
        return ollamaResponse.ok;

      default:
        return true; // Assume connected for other providers
    }
  } catch (error) {
    console.error(`Connection test failed for ${providerId}:`, error);
    return false;
  }
}

// Helper function to get user-configured providers
async function getUserConfiguredProviders(userId: string): Promise<Array<{id: string, apiKey: string}>> {
  // Temporary implementation for testing - check environment variables
  // TODO: Replace with proper database implementation
  const configuredProviders: Array<{id: string, apiKey: string}> = [];

  const envVars: Record<string, string> = {
    openai: process.env.OPENAI_API_KEY!,
    anthropic: process.env.ANTHROPIC_API_KEY!,
    groq: process.env.GROQ_API_KEY!,
    google: process.env.GOOGLE_GEMINI_API_KEY!,
    grok: process.env.GROK_API_KEY!,
    openrouter: process.env.OPENROUTER_API_KEY!,
    zai: process.env.ZAI_API_KEY!,
    cohere: process.env.COHERE_API_KEY!,
  };

  Object.entries(envVars).forEach(([providerId, apiKey]) => {
    if (apiKey && apiKey.trim() !== '' && !apiKey.includes('your-') && !apiKey.includes('mock')) {
      configuredProviders.push({ id: providerId, apiKey });
    }
  });

  return configuredProviders;
}

// Helper function to get available models for a provider
async function getProviderModels(providerId: string): Promise<string[]> {
  // TODO: Implement actual API calls to fetch available models from each provider
  // This should be called when the user selects a provider in the chat component
  throw new Error(`Model fetching not implemented for provider: ${providerId}`);
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'providers') {
      // Get user-configured providers from settings
      const userProviders = await getUserConfiguredProviders(session.user.id);

      console.log('Configured providers:', userProviders.map((p: any) => p.id));

      // Test connections for user-configured providers only
      const configuredProvidersWithStatus = await Promise.all(
        userProviders.map(async (userProvider) => {
          const provider = getProviderConfig(userProvider.id);
          if (!provider) {
            return {
              id: userProvider.id,
              name: userProvider.id,
              connectionStatus: 'unknown',
              availableModels: [],
            };
          }

          let connectionStatus = 'unknown';
          let availableModels: string[] = [];

          // Check cache first
          const cacheKey = `user_${session.user.id}_connection_${userProvider.id}`;
          const cached = connectionCache.get(cacheKey);
          const now = Date.now();

          if (cached && (now - cached.timestamp) < cached.ttl) {
            connectionStatus = cached.status;
          } else {
            try {
              // Test connection with user's API key
              console.log(`Testing connection for ${userProvider.id} with API key starting with: ${userProvider.apiKey.substring(0, 10)}...`);
              const isConnected = await testProviderConnection(userProvider.id, userProvider.apiKey);
              console.log(`Connection test result for ${userProvider.id}: ${isConnected}`);
              connectionStatus = isConnected ? 'connected' : 'failed';

              // Cache the result
              connectionCache.set(cacheKey, {
                status: connectionStatus,
                timestamp: now,
                ttl: connectionStatus === 'connected' ? CACHE_TTL : CACHE_TTL / 2 // Shorter cache for failed connections
              });
            } catch (error) {
              console.error(`Error testing ${userProvider.id} connection:`, error);
              connectionStatus = 'error';
            }
          }

          return {
            ...provider,
            connectionStatus,
          };
        })
      );

      return NextResponse.json({
        providers: configuredProvidersWithStatus,
        configuredProviders: userProviders // Include raw configured providers with API keys for frontend state
      });
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