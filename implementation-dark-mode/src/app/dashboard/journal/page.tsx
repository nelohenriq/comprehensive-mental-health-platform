"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { JournalForm } from '@/components/journal/journal-form';
import { JournalList } from '@/components/journal/journal-list';
import { Plus, BookOpen } from 'lucide-react';

interface JournalEntry {
  id: string;
  title?: string;
  content: string;
  mood?: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export default function JournalPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  useEffect(() => {
    if (session) {
      fetchEntries();
    }
  }, [session]);

  const fetchEntries = async () => {
    try {
      const response = await fetch('/api/journal');
      if (response.ok) {
        const data = await response.json();
        setEntries(data.entries);
      }
    } catch (error) {
      console.error('Error fetching entries:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateEntry = async (data: {
    title: string;
    content: string;
    mood?: number;
    tags: string[];
  }) => {
    try {
      const response = await fetch('/api/journal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        await fetchEntries();
        setShowForm(false);
      } else {
        alert('Failed to save entry');
      }
    } catch (error) {
      console.error('Error creating entry:', error);
      alert('Failed to save entry');
    }
  };

  const handleEditEntry = (entry: JournalEntry) => {
    setEditingEntry(entry);
    setShowForm(true);
  };

  const handleUpdateEntry = async (data: {
    title: string;
    content: string;
    mood?: number;
    tags: string[];
  }) => {
    if (!editingEntry) return;

    try {
      const response = await fetch(`/api/journal/${editingEntry.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        await fetchEntries();
        setShowForm(false);
        setEditingEntry(null);
      } else {
        alert('Failed to update entry');
      }
    } catch (error) {
      console.error('Error updating entry:', error);
      alert('Failed to update entry');
    }
  };

  const handleDeleteEntry = async (entryId: string) => {
    if (!confirm('Are you sure you want to delete this entry?')) return;

    try {
      const response = await fetch(`/api/journal/${entryId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchEntries();
      } else {
        alert('Failed to delete entry');
      }
    } catch (error) {
      console.error('Error deleting entry:', error);
      alert('Failed to delete entry');
    }
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
            <BookOpen className="h-8 w-8" />
            Journal
          </h1>
          <p className="text-muted-foreground mt-2">
            Write about your thoughts and feelings in a safe, private space.
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingEntry(null);
            setShowForm(!showForm);
          }}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          New Entry
        </Button>
      </div>

      {showForm && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>
              {editingEntry ? 'Edit Entry' : 'New Journal Entry'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <JournalForm
              onSubmit={editingEntry ? handleUpdateEntry : handleCreateEntry}
              initialData={editingEntry ? {
                title: editingEntry.title,
                content: editingEntry.content,
                mood: editingEntry.mood,
                tags: editingEntry.tags,
              } : undefined}
            />
          </CardContent>
        </Card>
      )}

      <JournalList
        entries={entries}
        onEdit={handleEditEntry}
        onDelete={handleDeleteEntry}
        isLoading={isLoading}
      />
    </div>
  );
}