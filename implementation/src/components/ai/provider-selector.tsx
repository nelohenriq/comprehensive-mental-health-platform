"use client";

import { useState } from 'react';
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

  const availableProviders = Object.values(AI_PROVIDERS);
  const selectedProviderConfig = provider ? AI_PROVIDERS[provider] : null;

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
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Provider Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            AI Provider
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {availableProviders.map((prov) => {
              const Icon = providerIcons[prov.id as keyof typeof providerIcons] || Bot;
              const isSelected = provider === prov.id;

              return (
                <button
                  key={prov.id}
                  onClick={() => handleProviderChange(prov.id)}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${providerColors[prov.id as keyof typeof providerColors] || 'bg-gray-100'}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="text-left">
                      <div className="font-medium">{prov.name}</div>
                      <div className="text-xs text-gray-500">
                        {prov.contextWindow?.toLocaleString()} tokens
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Model Selection */}
        {selectedProviderConfig && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Model
            </label>
            <Select value={model} onValueChange={setModel}>
              <SelectTrigger>
                <SelectValue placeholder="Select a model" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={selectedProviderConfig.model}>
                  {selectedProviderConfig.model} (Recommended)
                </SelectItem>
                {/* Could add more model options here */}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Provider Info */}
        {selectedProviderConfig && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Provider Information</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Streaming:</span>
                <span className="ml-2">{selectedProviderConfig.supportsStreaming ? 'Yes' : 'No'}</span>
              </div>
              <div>
                <span className="text-gray-600">API Key:</span>
                <span className="ml-2">{selectedProviderConfig.apiKeyRequired ? 'Required' : 'Not Required'}</span>
              </div>
              <div>
                <span className="text-gray-600">Max Tokens:</span>
                <span className="ml-2">{selectedProviderConfig.maxTokens}</span>
              </div>
              <div>
                <span className="text-gray-600">Context Window:</span>
                <span className="ml-2">{selectedProviderConfig.contextWindow?.toLocaleString()}</span>
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