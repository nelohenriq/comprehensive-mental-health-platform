// AI Provider configurations and interfaces

export interface AIProvider {
  id: string;
  name: string;
  model: string;
  baseUrl?: string;
  apiKeyRequired: boolean;
  supportsStreaming?: boolean;
  maxTokens?: number;
  contextWindow?: number;
}

export interface AIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: Date;
}

export interface AIConversation {
  id: string;
  userId: string;
  provider: string;
  model: string;
  messages: AIMessage[];
  context?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Available AI providers configuration
export const AI_PROVIDERS: Record<string, AIProvider> = {
  openai: {
    id: 'openai',
    name: 'OpenAI',
    model: 'gpt-4',
    apiKeyRequired: true,
    supportsStreaming: true,
    maxTokens: 4096,
    contextWindow: 8192,
  },
  anthropic: {
    id: 'anthropic',
    name: 'Anthropic',
    model: 'claude-3-sonnet-20240229',
    apiKeyRequired: true,
    supportsStreaming: true,
    maxTokens: 4096,
    contextWindow: 200000,
  },
  google: {
    id: 'google',
    name: 'Google Gemini',
    model: 'gemini-pro',
    apiKeyRequired: true,
    supportsStreaming: false,
    maxTokens: 2048,
    contextWindow: 32768,
  },
  groq: {
    id: 'groq',
    name: 'Groq',
    model: 'mixtral-8x7b-32768',
    apiKeyRequired: true,
    supportsStreaming: true,
    maxTokens: 4096,
    contextWindow: 32768,
  },
  grok: {
    id: 'grok',
    name: 'Grok',
    model: 'grok-1',
    baseUrl: 'https://api.x.ai/v1',
    apiKeyRequired: true,
    supportsStreaming: true,
    maxTokens: 4096,
    contextWindow: 128000,
  },
  openrouter: {
    id: 'openrouter',
    name: 'OpenRouter',
    model: 'auto',
    baseUrl: 'https://openrouter.ai/api/v1',
    apiKeyRequired: true,
    supportsStreaming: true,
    maxTokens: 4096,
    contextWindow: 128000,
  },
  zai: {
    id: 'zai',
    name: 'Z.ai',
    model: 'zai-1',
    baseUrl: 'https://api.z.ai/v1',
    apiKeyRequired: true,
    supportsStreaming: true,
    maxTokens: 4096,
    contextWindow: 32768,
  },
  cohere: {
    id: 'cohere',
    name: 'Cohere',
    model: 'command',
    apiKeyRequired: true,
    supportsStreaming: true,
    maxTokens: 4096,
    contextWindow: 4096,
  },
  ollama: {
    id: 'ollama',
    name: 'Ollama (Local)',
    model: 'llama2',
    baseUrl: 'http://localhost:11434',
    apiKeyRequired: false,
    supportsStreaming: true,
    maxTokens: 4096,
    contextWindow: 4096,
  },
};

// Mental health specific system prompts
export const MENTAL_HEALTH_PROMPTS = {
  general: `You are a compassionate and professional mental health AI assistant. Your role is to provide supportive, evidence-based guidance while always encouraging professional help when needed. You should:

1. Listen actively and validate feelings
2. Provide coping strategies and techniques
3. Ask clarifying questions to better understand
4. Suggest professional resources when appropriate
5. Maintain appropriate boundaries - you're not a replacement for therapy
6. Be empathetic, non-judgmental, and supportive
7. Use evidence-based approaches when possible
8. Encourage self-reflection and growth

Remember: Always prioritize user safety and well-being. If someone is in crisis, direct them to emergency resources immediately.`,

  crisis: `You are responding to someone who may be in crisis. Your primary goal is to ensure their immediate safety. Follow these guidelines:

1. Take their concerns seriously
2. Ask about safety and immediate risk
3. Provide local crisis resources and hotlines
4. Stay on the line/chat until they're connected to help
5. Do not try to "fix" the situation yourself
6. Direct to emergency services if there's imminent danger
7. Be calm, compassionate, and direct

CRISIS RESOURCES:
- National Suicide Prevention Lifeline: 988 (US)
- Crisis Text Line: Text HOME to 741741 (US)
- Emergency: 911 (US) or local emergency number

Always err on the side of caution and professional help.`,

  journaling: `You are helping someone reflect on their journal entry. Your role is to:

1. Acknowledge and validate their feelings
2. Help them identify patterns or insights
3. Ask gentle questions to encourage deeper reflection
4. Suggest coping strategies if appropriate
5. Celebrate small wins and progress
6. Encourage continued self-reflection
7. Be supportive and non-judgmental

Focus on helping them understand themselves better through their writing.`,

  mood: `You are discussing mood and emotional patterns. Help them:

1. Explore what might be influencing their mood
2. Identify triggers and patterns
3. Discuss healthy coping strategies
4. Encourage mood tracking consistency
5. Suggest lifestyle factors that affect mood
6. Be empathetic about mood fluctuations
7. Help them develop self-compassion

Remember that mood tracking is a tool for self-awareness, not self-diagnosis.`,
};

// Helper functions
export function getProviderConfig(providerId: string): AIProvider | null {
  return AI_PROVIDERS[providerId] || null;
}

export function getAvailableProviders(): AIProvider[] {
  return Object.values(AI_PROVIDERS);
}

export function validateApiKey(providerId: string, apiKey?: string): boolean {
  const provider = getProviderConfig(providerId);
  if (!provider) return false;

  if (!provider.apiKeyRequired) return true;
  return !!(apiKey && apiKey.trim().length > 0);
}

export function getSystemPrompt(context: 'general' | 'crisis' | 'journaling' | 'mood' = 'general'): string {
  return MENTAL_HEALTH_PROMPTS[context];
}