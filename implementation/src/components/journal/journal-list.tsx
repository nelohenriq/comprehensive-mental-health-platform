"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface JournalEntry {
  id: string;
  title?: string;
  content: string;
  mood?: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

interface JournalListProps {
  entries: JournalEntry[];
  onEdit?: (entry: JournalEntry) => void;
  onDelete?: (entryId: string) => void;
  isLoading?: boolean;
}

const moodEmojis = {
  1: '😢',
  2: '😞',
  3: '😐',
  4: '🙂',
  5: '😊',
};

const moodLabels = {
  1: 'Very Bad',
  2: 'Bad',
  3: 'Neutral',
  4: 'Good',
  5: 'Very Good',
};

export function JournalList({ entries, onEdit, onDelete, isLoading }: JournalListProps) {
  const [expandedEntries, setExpandedEntries] = useState<Set<string>>(new Set());

  const toggleExpanded = (entryId: string) => {
    const newExpanded = new Set(expandedEntries);
    if (newExpanded.has(entryId)) {
      newExpanded.delete(entryId);
    } else {
      newExpanded.add(entryId);
    }
    setExpandedEntries(newExpanded);
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading entries...</div>;
  }

  if (entries.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No journal entries yet. Start writing your first entry!
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {entries.map((entry) => {
        const isExpanded = expandedEntries.has(entry.id);
        const preview = entry.content.length > 200
          ? entry.content.substring(0, 200) + '...'
          : entry.content;

        return (
          <Card key={entry.id} className="w-full">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-lg">
                    {entry.title || 'Untitled Entry'}
                  </CardTitle>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                    <span>{new Date(entry.createdAt).toLocaleDateString()}</span>
                    {entry.mood && (
                      <span className="flex items-center gap-1">
                        {moodEmojis[entry.mood as keyof typeof moodEmojis]}
                        {moodLabels[entry.mood as keyof typeof moodLabels]}
                      </span>
                    )}
                  </div>
                  {entry.tags.length > 0 && (
                    <div className="flex gap-1 mt-2">
                      {entry.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  {onEdit && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(entry)}
                    >
                      Edit
                    </Button>
                  )}
                  {onDelete && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDelete(entry.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      Delete
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-gray-700">
                {isExpanded ? entry.content : preview}
              </div>
              {entry.content.length > 200 && (
                <Button
                  variant="link"
                  className="mt-2 p-0 h-auto"
                  onClick={() => toggleExpanded(entry.id)}
                >
                  {isExpanded ? 'Show less' : 'Read more'}
                </Button>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}