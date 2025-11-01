import { prisma } from '../prisma';
import { AI_PROVIDERS, getProviderConfig, validateApiKey, getSystemPrompt, AIMessage, AIConversation } from './providers';

export class ChatService {
  static async createConversation(
    userId: string,
    provider: string,
    model: string,
    initialMessage?: string
  ): Promise<AIConversation> {
    const conversation = await (prisma as any).aiConversation.create({
      data: {
        userId,
        provider,
        model,
        messages: initialMessage ? [{
          role: 'user',
          content: initialMessage,
          timestamp: new Date(),
        }] : [],
      },
    });

    return conversation;
  }

  static async getConversations(userId: string, limit = 20): Promise<AIConversation[]> {
    return await (prisma as any).aiConversation.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      take: limit,
    });
  }

  static async getConversation(userId: string, conversationId: string): Promise<AIConversation | null> {
    const conversation = await (prisma as any).aiConversation.findFirst({
      where: {
        id: conversationId,
        userId,
      },
    });

    return conversation;
  }

  static async addMessage(
    conversationId: string,
    message: AIMessage
  ): Promise<void> {
    const conversation = await (prisma as any).aiConversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) {
      throw new Error('Conversation not found');
    }

    const updatedMessages = [
      ...conversation.messages,
      { ...message, timestamp: new Date() }
    ];

    await (prisma as any).aiConversation.update({
      where: { id: conversationId },
      data: {
        messages: updatedMessages,
        updatedAt: new Date(),
      },
    });
  }

  static async sendMessage(
    userId: string,
    conversationId: string,
    message: string,
    context: 'general' | 'crisis' | 'journaling' | 'mood' = 'general'
  ): Promise<string> {
    const conversation = await this.getConversation(userId, conversationId);
    if (!conversation) {
      throw new Error('Conversation not found');
    }

    const provider = getProviderConfig(conversation.provider);
    if (!provider) {
      throw new Error('Invalid AI provider');
    }

    // Add user message to conversation
    await this.addMessage(conversationId, {
      role: 'user',
      content: message,
    });

    try {
      // Get AI response
      const aiResponse = await this.callAIProvider(
        conversation.provider,
        conversation.model,
        conversation.messages,
        context
      );

      // Add AI response to conversation
      await this.addMessage(conversationId, {
        role: 'assistant',
        content: aiResponse,
      });

      return aiResponse;
    } catch (error) {
      console.error('AI provider error:', error);
      throw new Error('Failed to get AI response');
    }
  }

  private static async callAIProvider(
    providerId: string,
    model: string,
    messages: AIMessage[],
    context: string
  ): Promise<string> {
    const provider = getProviderConfig(providerId);
    if (!provider) {
      throw new Error('Provider not configured');
    }

    // Get API key from environment (in production, this would be user-specific)
    const apiKey = this.getApiKeyForProvider(providerId);
    if (!validateApiKey(providerId, apiKey)) {
      throw new Error(`API key required for ${provider.name}`);
    }

    const systemPrompt = getSystemPrompt(context as any);

    switch (providerId) {
      case 'openai':
        return this.callOpenAI(apiKey!, model, messages, systemPrompt);
      case 'anthropic':
        return this.callAnthropic(apiKey!, model, messages, systemPrompt);
      case 'google':
        return this.callGoogle(apiKey!, model, messages, systemPrompt);
      case 'groq':
        return this.callGroq(apiKey!, model, messages, systemPrompt);
      case 'ollama':
        return this.callOllama(model, messages, systemPrompt);
      default:
        throw new Error(`Provider ${providerId} not implemented yet`);
    }
  }

  private static getApiKeyForProvider(providerId: string): string | undefined {
    // In production, these would be stored securely per user
    const envVars: Record<string, string> = {
      openai: process.env.OPENAI_API_KEY!,
      anthropic: process.env.ANTHROPIC_API_KEY!,
      google: process.env.GOOGLE_GEMINI_API_KEY!,
      groq: process.env.GROQ_API_KEY!,
      grok: process.env.GROK_API_KEY!,
      openrouter: process.env.OPENROUTER_API_KEY!,
      zai: process.env.ZAI_API_KEY!,
      cohere: process.env.COHERE_API_KEY!,
    };

    return envVars[providerId];
  }

  private static async callOpenAI(
    apiKey: string,
    model: string,
    messages: AIMessage[],
    systemPrompt: string
  ): Promise<string> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages.map(m => ({ role: m.role, content: m.content }))
        ],
        max_tokens: 1000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }

  private static async callAnthropic(
    apiKey: string,
    model: string,
    messages: AIMessage[],
    systemPrompt: string
  ): Promise<string> {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model,
        max_tokens: 1000,
        system: systemPrompt,
        messages: messages.map(m => ({ role: m.role, content: m.content })),
      }),
    });

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.status}`);
    }

    const data = await response.json();
    return data.content[0].text;
  }

  private static async callGoogle(
    apiKey: string,
    model: string,
    messages: AIMessage[],
    systemPrompt: string
  ): Promise<string> {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `${systemPrompt}\n\n${messages.map(m => `${m.role}: ${m.content}`).join('\n\n')}\n\nassistant:`
          }]
        }]
      }),
    });

    if (!response.ok) {
      throw new Error(`Google API error: ${response.status}`);
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  }

  private static async callGroq(
    apiKey: string,
    model: string,
    messages: AIMessage[],
    systemPrompt: string
  ): Promise<string> {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages.map(m => ({ role: m.role, content: m.content }))
        ],
        max_tokens: 1000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }

  private static async callOllama(
    model: string,
    messages: AIMessage[],
    systemPrompt: string
  ): Promise<string> {
    const response = await fetch('http://localhost:11434/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages.map(m => ({ role: m.role, content: m.content }))
        ],
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.status}`);
    }

    const data = await response.json();
    return data.message.content;
  }
}