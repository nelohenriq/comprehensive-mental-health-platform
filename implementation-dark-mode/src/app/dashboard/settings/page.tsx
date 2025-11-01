"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Settings, Key, TestTube, CheckCircle, XCircle, Loader2 } from 'lucide-react';

interface AIProvider {
  id: string;
  name: string;
  apiKey: string;
  models: string[];
  isActive: boolean;
  lastTested?: string;
  testStatus?: 'success' | 'error' | 'testing';
}

const providers = [
  { id: 'openai', name: 'OpenAI', baseUrl: 'https://api.openai.com/v1' },
  { id: 'anthropic', name: 'Anthropic', baseUrl: 'https://api.anthropic.com/v1' },
  { id: 'groq', name: 'Groq', baseUrl: 'https://api.groq.com/openai/v1' },
  { id: 'grok', name: 'Grok (xAI)', baseUrl: 'https://api.x.ai/v1' },
  { id: 'gemini', name: 'Google Gemini', baseUrl: 'https://generativelanguage.googleapis.com/v1beta' },
  { id: 'cohere', name: 'Cohere', baseUrl: 'https://api.cohere.ai/v1' },
  { id: 'openrouter', name: 'OpenRouter', baseUrl: 'https://openrouter.ai/api/v1' },
  { id: 'z-ai', name: 'Z.AI', baseUrl: 'https://api.z.ai/v1' },
];

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [providersData, setProvidersData] = useState<AIProvider[]>([
    { id: 'openai', name: 'OpenAI', apiKey: '', models: [], isActive: false },
    { id: 'anthropic', name: 'Anthropic', apiKey: '', models: [], isActive: false },
    { id: 'groq', name: 'Groq', apiKey: '', models: [], isActive: false },
    { id: 'grok', name: 'Grok (xAI)', apiKey: '', models: [], isActive: false },
    { id: 'gemini', name: 'Google Gemini', apiKey: '', models: [], isActive: false },
    { id: 'cohere', name: 'Cohere', apiKey: '', models: [], isActive: false },
    { id: 'openrouter', name: 'OpenRouter', apiKey: '', models: [], isActive: false },
    { id: 'z-ai', name: 'Z.AI', apiKey: '', models: [], isActive: false },
  ]);
  const [selectedProvider, setSelectedProvider] = useState<string>('openai');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  useEffect(() => {
    // Load saved API keys from localStorage (in production, this would be from a secure backend)
    const savedKeys = localStorage.getItem('ai_provider_keys');
    if (savedKeys) {
      try {
        const keys = JSON.parse(savedKeys);
        setProvidersData(prev =>
          prev.map(provider => ({
            ...provider,
            apiKey: keys[provider.id] || '',
            isActive: !!(keys[provider.id] && keys[provider.id].length > 0),
          }))
        );
      } catch (error) {
        console.error('Error loading saved keys:', error);
      }
    }
  }, []);

  const handleApiKeyChange = (providerId: string, apiKey: string) => {
    setProvidersData(prev =>
      prev.map(provider =>
        provider.id === providerId
          ? { ...provider, apiKey, isActive: apiKey.length > 0 }
          : provider
      )
    );

    // Save to localStorage
    const savedKeys = JSON.parse(localStorage.getItem('ai_provider_keys') || '{}');
    savedKeys[providerId] = apiKey;
    localStorage.setItem('ai_provider_keys', JSON.stringify(savedKeys));
  };

  const testConnection = async (providerId: string) => {
    const provider = providersData.find(p => p.id === providerId);
    if (!provider?.apiKey) return;

    setProvidersData(prev =>
      prev.map(p =>
        p.id === providerId
          ? { ...p, testStatus: 'testing' as const }
          : p
      )
    );

    try {
      const providerConfig = providers.find(p => p.id === providerId);
      if (!providerConfig) throw new Error('Provider not found');

      let testResult: string[];

      if (providerId === 'openai') {
        // Test OpenAI connection
        const response = await fetch(`${providerConfig.baseUrl}/models`, {
          headers: {
            'Authorization': `Bearer ${provider.apiKey}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) throw new Error('Invalid API key');

        const data = await response.json();
        testResult = data.data.map((model: any) => model.id);
      } else if (providerId === 'anthropic') {
        // Test Anthropic connection
        const response = await fetch(`${providerConfig.baseUrl}/messages`, {
          method: 'POST',
          headers: {
            'x-api-key': provider.apiKey,
            'Content-Type': 'application/json',
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify({
            model: 'claude-3-haiku-20240307',
            max_tokens: 1,
            messages: [{ role: 'user', content: 'test' }],
          }),
        });

        if (!response.ok) throw new Error('Invalid API key');

        // Anthropic doesn't have a models endpoint, so we'll use known models
        testResult = ['claude-3-opus-20240229', 'claude-3-sonnet-20240229', 'claude-3-haiku-20240307'];
      } else if (providerId === 'groq') {
        // Test Groq connection (OpenAI-compatible)
        const response = await fetch(`${providerConfig.baseUrl}/models`, {
          headers: {
            'Authorization': `Bearer ${provider.apiKey}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) throw new Error('Invalid API key');

        const data = await response.json();
        testResult = data.data.map((model: any) => model.id);
      } else if (providerId === 'grok') {
        // Test Grok (xAI) connection
        const response = await fetch(`${providerConfig.baseUrl}/models`, {
          headers: {
            'Authorization': `Bearer ${provider.apiKey}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) throw new Error('Invalid API key');

        const data = await response.json();
        testResult = data.data.map((model: any) => model.id);
      } else if (providerId === 'gemini') {
        // Test Google Gemini connection
        const response = await fetch(`${providerConfig.baseUrl}/models?key=${provider.apiKey}`, {
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) throw new Error('Invalid API key');

        const data = await response.json();
        testResult = data.models.map((model: any) => model.name);
      } else if (providerId === 'cohere') {
        // Test Cohere connection
        const response = await fetch(`${providerConfig.baseUrl}/models`, {
          headers: {
            'Authorization': `Bearer ${provider.apiKey}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) throw new Error('Invalid API key');

        const data = await response.json();
        testResult = data.models.map((model: any) => model.name);
      } else if (providerId === 'openrouter') {
        // Test OpenRouter connection
        const response = await fetch(`${providerConfig.baseUrl}/models`, {
          headers: {
            'Authorization': `Bearer ${provider.apiKey}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) throw new Error('Invalid API key');

        const data = await response.json();
        testResult = data.data.map((model: any) => model.id);
      } else if (providerId === 'z-ai') {
        // Test Z.AI connection
        const response = await fetch(`${providerConfig.baseUrl}/models`, {
          headers: {
            'Authorization': `Bearer ${provider.apiKey}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) throw new Error('Invalid API key');

        const data = await response.json();
        testResult = data.data.map((model: any) => model.id);
      }

      setProvidersData(prev =>
        prev.map(p =>
          p.id === providerId
            ? {
                ...p,
                testStatus: 'success' as const,
                models: testResult,
                lastTested: new Date().toISOString(),
              }
            : p
        )
      );
    } catch (error) {
      console.error('Connection test failed:', error);
      setProvidersData(prev =>
        prev.map(p =>
          p.id === providerId
            ? {
                ...p,
                testStatus: 'error' as const,
                lastTested: new Date().toISOString(),
              }
            : p
        )
      );
    }
  };

  if (status === 'loading') {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  if (!session) {
    return null;
  }

  const currentProvider = providersData.find(p => p.id === selectedProvider);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Settings className="h-8 w-8" />
            Settings
          </h1>
          <p className="text-muted-foreground mt-2">
            Configure your AI providers and preferences.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* AI Provider Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              AI Provider Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="provider-select">AI Provider</Label>
              <Select value={selectedProvider} onValueChange={setSelectedProvider}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select a provider" />
                </SelectTrigger>
                <SelectContent>
                  {providers.map(provider => (
                    <SelectItem key={provider.id} value={provider.id}>
                      {provider.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {currentProvider && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="api-key">API Key</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      id="api-key"
                      type="password"
                      value={currentProvider.apiKey}
                      onChange={(e) => handleApiKeyChange(currentProvider.id, e.target.value)}
                      placeholder={`Enter your ${currentProvider.name} API key`}
                      className="flex-1"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => testConnection(currentProvider.id)}
                      disabled={!currentProvider.apiKey || currentProvider.testStatus === 'testing'}
                      className="flex items-center gap-2"
                    >
                      {currentProvider.testStatus === 'testing' ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <TestTube className="h-4 w-4" />
                      )}
                      Test
                    </Button>
                  </div>
                </div>

                {currentProvider.testStatus && (
                  <div className="flex items-center gap-2 text-sm">
                    {currentProvider.testStatus === 'success' ? (
                      <>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-green-600">Connection successful</span>
                      </>
                    ) : currentProvider.testStatus === 'error' ? (
                      <>
                        <XCircle className="h-4 w-4 text-red-500" />
                        <span className="text-red-600">Connection failed</span>
                      </>
                    ) : (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                        <span className="text-blue-600">Testing connection...</span>
                      </>
                    )}
                  </div>
                )}

                {currentProvider.lastTested && (
                  <p className="text-xs text-muted-foreground">
                    Last tested: {new Date(currentProvider.lastTested).toLocaleString()}
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Available Models */}
        <Card>
          <CardHeader>
            <CardTitle>Available Models</CardTitle>
          </CardHeader>
          <CardContent>
            {currentProvider?.models && currentProvider.models.length > 0 ? (
              <div className="space-y-2">
                {currentProvider.models.map(model => (
                  <div key={model} className="flex items-center justify-between p-2 bg-muted rounded">
                    <span className="text-sm font-medium">{model}</span>
                    <span className="text-xs text-muted-foreground">Available</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">
                Test your API key to see available models.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Provider Status Overview */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Provider Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {providersData.map(provider => (
              <div key={provider.id} className="flex items-center justify-between p-4 border rounded">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${provider.isActive ? 'bg-green-500' : 'bg-gray-300'}`} />
                  <span className="font-medium">{provider.name}</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  {provider.isActive ? 'Configured' : 'Not configured'}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}