"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface JournalFormProps {
  onSubmit: (data: {
    title: string;
    content: string;
    mood?: number;
    tags: string[];
  }) => Promise<void>;
  initialData?: {
    title?: string;
    content?: string;
    mood?: number;
    tags?: string[];
  };
  isLoading?: boolean;
}

export function JournalForm({ onSubmit, initialData, isLoading }: JournalFormProps) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [content, setContent] = useState(initialData?.content || '');
  const [mood, setMood] = useState(initialData?.mood?.toString() || '');
  const [tags, setTags] = useState(initialData?.tags?.join(', ') || '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) {
      alert('Please write something in your journal entry');
      return;
    }

    const tagArray = tags
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);

    await onSubmit({
      title: title.trim(),
      content: content.trim(),
      mood: mood ? parseInt(mood) : undefined,
      tags: tagArray,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Label htmlFor="title">Title (Optional)</Label>
        <Input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Give your entry a title..."
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="content">Journal Entry</Label>
        <Textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write about your thoughts, feelings, or experiences..."
          className="mt-1 min-h-[200px]"
          required
        />
      </div>

      <div>
        <Label htmlFor="mood">Mood (Optional)</Label>
        <select
          id="mood"
          value={mood}
          onChange={(e) => setMood(e.target.value)}
          className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        >
          <option value="">Select mood...</option>
          <option value="1">😢 Very Bad</option>
          <option value="2">😞 Bad</option>
          <option value="3">😐 Neutral</option>
          <option value="4">🙂 Good</option>
          <option value="5">😊 Very Good</option>
        </select>
      </div>

      <div>
        <Label htmlFor="tags">Tags (Optional)</Label>
        <Input
          id="tags"
          type="text"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="anxiety, work, family (comma-separated)"
          className="mt-1"
        />
      </div>

      <Button
        type="submit"
        disabled={isLoading}
        className="w-full"
      >
        {isLoading ? 'Saving...' : 'Save Entry'}
      </Button>
    </form>
  );
}