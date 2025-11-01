"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AI_PROVIDERS, AIProvider } from '@/lib/ai/providers';
import { Brain, Zap, Cpu, Globe, Bot, Sparkles } from 'lucide-react';

interface ProviderSelectorProps {
  onProviderSelect: (provider: string, model: string) => void;
  selectedProvider?: string;
  selectedModel?: string;
}

interface ProviderWithStatus {
  id: string;
  name: string;
  model: string;
  connectionStatus: 'connected' | 'failed' | 'no_api_key' | 'unknown' | 'error';
  availableModels: string[];
  apiKeyRequired: boolean;
  supportsStreaming?: boolean;
  maxTokens?: number;
  contextWindow?: number;
}

const providerIcons = {
  openai: Brain,
  anthropic: Sparkles,
  google: Cpu,
  groq: Zap,
  grok: Bot,
  openrouter: Globe,
  zai: Sparkles,
  cohere: Brain,
  ollama: Cpu,
};

const providerColors = {
  openai: 'bg-blue-100 text-blue-800',
  anthropic: 'bg-purple-100 text-purple-800',
  google: 'bg-green-100 text-green-800',
  groq: 'bg-orange-100 text-orange-800',
  grok: 'bg-gray-100 text-gray-800',
  openrouter: 'bg-indigo-100 text-indigo-800',
  zai: 'bg-pink-100 text-pink-800',
  cohere: 'bg-teal-100 text-teal-800',
  ollama: 'bg-yellow-100 text-yellow-800',
};

export function ProviderSelector({
  onProviderSelect,
  selectedProvider,
  selectedModel
}: ProviderSelectorProps) {
  const [provider, setProvider] = useState(selectedProvider || '');
  const [model, setModel] = useState(selectedModel || '');
  const [providersWithStatus, setProvidersWithStatus] = useState<ProviderWithStatus[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch providers with connection status on mount
  useEffect(() => {
    const fetchProviders = async () => {
      try {
        const response = await fetch('/api/chat?action=providers');
        if (response.ok) {
          const data = await response.json();
          setProvidersWithStatus(data.providers);
        }
      } catch (error) {
        console.error('Error fetching providers:', error);
        // Fallback to static providers
        setProvidersWithStatus(Object.values(AI_PROVIDERS).map(p => ({
          ...p,
          connectionStatus: 'unknown' as const,
          availableModels: [p.model]
        })));
      } finally {
        setLoading(false);
      }
    };

    fetchProviders();
  }, []);

  const selectedProviderConfig = provider ? AI_PROVIDERS[provider] : null;
  const selectedProviderWithStatus = providersWithStatus.find(p => p.id === provider);

  const handleProviderChange = (newProvider: string) => {
    setProvider(newProvider);
    const providerConfig = AI_PROVIDERS[newProvider];
    if (providerConfig) {
      setModel(providerConfig.model);
    }
  };

  const handleConfirm = () => {
    if (provider && model) {
      onProviderSelect(provider, model);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5" />
          Choose Your AI Assistant
        </CardTitle>
        <p className="text-sm text-gray-600">
          Select an AI provider and model for your mental health conversations.
          {loading && <span className="ml-2 text-blue-600">Checking connections...</span>}
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Provider Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            AI Provider
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {providersWithStatus.map((prov) => {
              const Icon = providerIcons[prov.id as keyof typeof providerIcons] || Bot;
              const isSelected = provider === prov.id;

              return (
                <button
                  key={prov.id}
                  onClick={() => handleProviderChange(prov.id)}
                  disabled={prov.connectionStatus === 'no_api_key' || prov.connectionStatus === 'failed'}
                  className={`p-4 border-2 rounded-lg transition-all relative ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50'
                      : prov.connectionStatus === 'connected'
                      ? 'border-green-200 hover:border-green-300 bg-green-50/50'
                      : prov.connectionStatus === 'failed' || prov.connectionStatus === 'no_api_key'
                      ? 'border-red-200 bg-red-50/50 opacity-60 cursor-not-allowed'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg relative ${providerColors[prov.id as keyof typeof providerColors] || 'bg-gray-100'}`}>
                      <Icon className="h-4 w-4" />
                      {/* Connection status indicator */}
                      <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                        prov.connectionStatus === 'connected' ? 'bg-green-500' :
                        prov.connectionStatus === 'failed' || prov.connectionStatus === 'no_api_key' ? 'bg-red-500' :
                        prov.connectionStatus === 'error' ? 'bg-yellow-500' : 'bg-gray-400'
                      }`} />
                    </div>
                    <div className="text-left flex-1">
                      <div className="font-medium">{prov.name}</div>
                      <div className="text-xs text-gray-500">
                        {prov.contextWindow?.toLocaleString()} tokens
                      </div>
                      <div className="text-xs mt-1">
                        {prov.connectionStatus === 'connected' && <span className="text-green-600">✓ Connected</span>}
                        {prov.connectionStatus === 'no_api_key' && <span className="text-red-600">⚠ API Key Required</span>}
                        {prov.connectionStatus === 'failed' && <span className="text-red-600">✗ Connection Failed</span>}
                        {prov.connectionStatus === 'error' && <span className="text-yellow-600">⚠ Error</span>}
                        {prov.connectionStatus === 'unknown' && <span className="text-gray-500">Checking...</span>}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Model Selection */}
        {selectedProviderWithStatus && selectedProviderWithStatus.connectionStatus === 'connected' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Model
            </label>
            <Select value={model} onValueChange={setModel}>
              <SelectTrigger>
                <SelectValue placeholder="Select a model" />
              </SelectTrigger>
              <SelectContent>
                {selectedProviderWithStatus.availableModels.map((modelOption) => (
                  <SelectItem key={modelOption} value={modelOption}>
                    {modelOption} {modelOption === selectedProviderWithStatus.model ? '(Recommended)' : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Provider Info */}
        {selectedProviderWithStatus && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Provider Information</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Status:</span>
                <span className={`ml-2 font-medium ${
                  selectedProviderWithStatus.connectionStatus === 'connected' ? 'text-green-600' :
                  selectedProviderWithStatus.connectionStatus === 'failed' || selectedProviderWithStatus.connectionStatus === 'no_api_key' ? 'text-red-600' :
                  'text-yellow-600'
                }`}>
                  {selectedProviderWithStatus.connectionStatus === 'connected' ? 'Connected' :
                   selectedProviderWithStatus.connectionStatus === 'no_api_key' ? 'API Key Required' :
                   selectedProviderWithStatus.connectionStatus === 'failed' ? 'Connection Failed' :
                   'Checking...'}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Streaming:</span>
                <span className="ml-2">{selectedProviderWithStatus.supportsStreaming ? 'Yes' : 'No'}</span>
              </div>
              <div>
                <span className="text-gray-600">API Key:</span>
                <span className="ml-2">{selectedProviderWithStatus.apiKeyRequired ? 'Required' : 'Not Required'}</span>
              </div>
              <div>
                <span className="text-gray-600">Context Window:</span>
                <span className="ml-2">{selectedProviderWithStatus.contextWindow?.toLocaleString()}</span>
              </div>
            </div>
          </div>
        )}

        {/* Confirm Button */}
        <Button
          onClick={handleConfirm}
          disabled={!provider || !model}
          className="w-full"
        >
          Start Conversation
        </Button>
      </CardContent>
    </Card>
  );
}