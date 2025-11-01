"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Brain, Plus, Edit, Trash2, Save, X } from 'lucide-react';

interface ThoughtRecord {
  id: string;
  situation: string;
  thoughts: string;
  emotions: string;
  behaviors: string;
  alternativeThoughts: string;
  outcome: string;
  createdAt: string;
}

const EMOTION_OPTIONS = [
  'Anxious', 'Sad', 'Angry', 'Frustrated', 'Overwhelmed',
  'Guilty', 'Ashamed', 'Hopeless', 'Irritable', 'Stressed'
];

export default function CBTPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [thoughtRecords, setThoughtRecords] = useState<ThoughtRecord[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    situation: '',
    thoughts: '',
    emotions: '',
    behaviors: '',
    alternativeThoughts: '',
    outcome: ''
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  useEffect(() => {
    if (session) {
      fetchThoughtRecords();
    }
  }, [session]);

  const fetchThoughtRecords = async () => {
    try {
      const response = await fetch('/api/cbt');
      if (response.ok) {
        const data = await response.json();
        setThoughtRecords(data.records);
      }
    } catch (error) {
      console.error('Error fetching thought records:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const method = editingId ? 'PUT' : 'POST';
      const url = editingId ? `/api/cbt/${editingId}` : '/api/cbt';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await fetchThoughtRecords();
        resetForm();
      } else {
        alert('Failed to save thought record');
      }
    } catch (error) {
      console.error('Error saving thought record:', error);
      alert('Failed to save thought record');
    }
  };

  const handleEdit = (record: ThoughtRecord) => {
    setFormData({
      situation: record.situation,
      thoughts: record.thoughts,
      emotions: record.emotions,
      behaviors: record.behaviors,
      alternativeThoughts: record.alternativeThoughts,
      outcome: record.outcome,
    });
    setEditingId(record.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this thought record?')) return;

    try {
      const response = await fetch(`/api/cbt/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchThoughtRecords();
      } else {
        alert('Failed to delete thought record');
      }
    } catch (error) {
      console.error('Error deleting thought record:', error);
      alert('Failed to delete thought record');
    }
  };

  const resetForm = () => {
    setFormData({
      situation: '',
      thoughts: '',
      emotions: '',
      behaviors: '',
      alternativeThoughts: '',
      outcome: ''
    });
    setEditingId(null);
    setShowForm(false);
  };

  const addEmotion = (emotion: string) => {
    const currentEmotions = formData.emotions ? formData.emotions.split(', ') : [];
    if (!currentEmotions.includes(emotion)) {
      setFormData(prev => ({
        ...prev,
        emotions: [...currentEmotions, emotion].join(', ')
      }));
    }
  };

  if (!session) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Brain className="h-8 w-8" />
            CBT Tools
          </h1>
          <p className="text-muted-foreground mt-2">
            Cognitive Behavioral Therapy tools to help identify and challenge negative thought patterns.
          </p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          New Thought Record
        </Button>
      </div>

      {/* CBT Form */}
      {showForm && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              {editingId ? 'Edit Thought Record' : 'New Thought Record'}
              <Button variant="ghost" size="sm" onClick={resetForm}>
                <X className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="situation">Situation</Label>
                <Textarea
                  id="situation"
                  value={formData.situation}
                  onChange={(e) => setFormData(prev => ({ ...prev, situation: e.target.value }))}
                  placeholder="Describe the situation that triggered these thoughts..."
                  required
                />
              </div>

              <div>
                <Label htmlFor="thoughts">Automatic Thoughts</Label>
                <Textarea
                  id="thoughts"
                  value={formData.thoughts}
                  onChange={(e) => setFormData(prev => ({ ...prev, thoughts: e.target.value }))}
                  placeholder="What thoughts automatically came to mind?"
                  required
                />
              </div>

              <div>
                <Label>Emotions</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {EMOTION_OPTIONS.map((emotion) => (
                    <Button
                      key={emotion}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addEmotion(emotion)}
                      className="text-xs"
                    >
                      {emotion}
                    </Button>
                  ))}
                </div>
                <Textarea
                  value={formData.emotions}
                  onChange={(e) => setFormData(prev => ({ ...prev, emotions: e.target.value }))}
                  placeholder="List the emotions you felt (e.g., anxious, sad, angry)"
                  required
                />
              </div>

              <div>
                <Label htmlFor="behaviors">Behaviors/Physical Sensations</Label>
                <Textarea
                  id="behaviors"
                  value={formData.behaviors}
                  onChange={(e) => setFormData(prev => ({ ...prev, behaviors: e.target.value }))}
                  placeholder="What did you do? How did your body feel?"
                  required
                />
              </div>

              <div>
                <Label htmlFor="alternativeThoughts">Alternative Thoughts</Label>
                <Textarea
                  id="alternativeThoughts"
                  value={formData.alternativeThoughts}
                  onChange={(e) => setFormData(prev => ({ ...prev, alternativeThoughts: e.target.value }))}
                  placeholder="What are some more balanced or realistic thoughts?"
                  required
                />
              </div>

              <div>
                <Label htmlFor="outcome">Outcome</Label>
                <Textarea
                  id="outcome"
                  value={formData.outcome}
                  onChange={(e) => setFormData(prev => ({ ...prev, outcome: e.target.value }))}
                  placeholder="How do you feel after challenging your thoughts?"
                  required
                />
              </div>

              <div className="flex gap-4">
                <Button type="submit">
                  <Save className="h-4 w-4 mr-2" />
                  {editingId ? 'Update' : 'Save'} Record
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Thought Records List */}
      <div className="space-y-6">
        {thoughtRecords.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Brain className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">No Thought Records Yet</h3>
              <p className="text-muted-foreground mb-4">
                Start tracking your thoughts and emotions with CBT thought records.
              </p>
              <Button onClick={() => setShowForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Record
              </Button>
            </CardContent>
          </Card>
        ) : (
          thoughtRecords.map((record) => (
            <Card key={record.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    Thought Record - {new Date(record.createdAt).toLocaleDateString()}
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(record)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(record.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-sm text-foreground mb-1">Situation</h4>
                    <p className="text-sm bg-muted p-2 rounded">{record.situation}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-foreground mb-1">Emotions</h4>
                    <p className="text-sm bg-muted p-2 rounded">{record.emotions}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-foreground mb-1">Automatic Thoughts</h4>
                    <p className="text-sm bg-muted p-2 rounded">{record.thoughts}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-foreground mb-1">Behaviors</h4>
                    <p className="text-sm bg-muted p-2 rounded">{record.behaviors}</p>
                  </div>
                  <div className="md:col-span-2">
                    <h4 className="font-semibold text-sm text-foreground mb-1">Alternative Thoughts</h4>
                    <p className="text-sm bg-accent p-2 rounded border-l-4 border-primary">
                      {record.alternativeThoughts}
                    </p>
                  </div>
                  <div className="md:col-span-2">
                    <h4 className="font-semibold text-sm text-foreground mb-1">Outcome</h4>
                    <p className="text-sm bg-accent p-2 rounded border-l-4 border-primary">
                      {record.outcome}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}