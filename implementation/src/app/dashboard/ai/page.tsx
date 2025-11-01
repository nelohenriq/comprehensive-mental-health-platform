"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ProviderSelector } from '@/components/ai/provider-selector';
import { ChatInterface } from '@/components/ai/chat-interface';
import { Bot, MessageSquare, History } from 'lucide-react';
import { AIConversation, AIMessage } from '@/lib/ai/providers';

export default function AIPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [conversations, setConversations] = useState<AIConversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<AIConversation | null>(null);
  const [showProviderSelector, setShowProviderSelector] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  useEffect(() => {
    if (session) {
      fetchConversations();
    }
  }, [session]);

  const fetchConversations = async () => {
    try {
      const response = await fetch('/api/chat?action=conversations');
      if (response.ok) {
        const data = await response.json();
        setConversations(data.conversations);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProviderSelect = async (provider: string, model: string) => {
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'create',
          provider,
          model,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setSelectedConversation(data.conversation);
        setShowProviderSelector(false);
        await fetchConversations();
      } else {
        alert('Failed to create conversation');
      }
    } catch (error) {
      console.error('Error creating conversation:', error);
      alert('Failed to create conversation');
    }
  };

  const handleSendMessage = async (message: string): Promise<string> => {
    if (!selectedConversation) {
      throw new Error('No conversation selected');
    }

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'send',
          conversationId: selectedConversation.id,
          message,
          context: 'general', // Could be dynamic based on user context
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return data.response;
      } else {
        throw new Error('Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  };

  const handleSelectConversation = (conversation: AIConversation) => {
    setSelectedConversation(conversation);
    setShowProviderSelector(false);
  };

  if (status === 'loading') {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  if (!session) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Bot className="h-8 w-8" />
            AI Mental Health Assistant
          </h1>
          <p className="text-muted-foreground mt-2">
            Talk to an AI assistant trained to support your mental health journey.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowProviderSelector(!showProviderSelector)}
            className="flex items-center gap-2"
          >
            <MessageSquare className="h-4 w-4" />
            New Chat
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar - Conversations */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Conversations
              </CardTitle>
            </CardHeader>
            <CardContent>
              {conversations.length === 0 ? (
                <p className="text-muted-foreground text-sm">No conversations yet</p>
              ) : (
                <div className="space-y-2">
                  {conversations.map((conversation) => (
                    <button
                      key={conversation.id}
                      onClick={() => handleSelectConversation(conversation)}
                      className={`w-full text-left p-3 rounded-lg transition-colors ${
                        selectedConversation?.id === conversation.id
                          ? 'bg-accent border-primary'
                          : 'hover:bg-muted'
                      }`}
                    >
                      <div className="font-medium text-sm">
                        {conversation.provider} - {conversation.model}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {new Date(conversation.updatedAt).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {conversation.messages.length} messages
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {showProviderSelector ? (
            <ProviderSelector onProviderSelect={handleProviderSelect} />
          ) : selectedConversation ? (
            <ChatInterface
              conversationId={selectedConversation.id}
              initialMessages={selectedConversation.messages}
              onSendMessage={handleSendMessage}
            />
          ) : (
            <Card className="h-[600px] flex items-center justify-center">
              <div className="text-center">
                <Bot className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">Start a Conversation</h3>
                <p className="text-muted-foreground mb-6">
                  Choose an AI provider and begin your mental health support conversation.
                </p>
                <Button
                  onClick={() => setShowProviderSelector(true)}
                  className="flex items-center gap-2"
                >
                  <MessageSquare className="h-4 w-4" />
                  Start New Chat
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}