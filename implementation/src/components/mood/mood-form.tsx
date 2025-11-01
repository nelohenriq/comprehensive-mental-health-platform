"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface MoodFormProps {
  onSubmit: (data: {
    mood: number;
    note?: string;
    activities: string[];
    sleepHours?: number;
    stressLevel?: number;
  }) => Promise<void>;
  isLoading?: boolean;
}

const moodOptions = [
  { value: 1, label: 'Very Bad', emoji: '😢', color: 'bg-red-100 text-red-800' },
  { value: 2, label: 'Bad', emoji: '😞', color: 'bg-orange-100 text-orange-800' },
  { value: 3, label: 'Neutral', emoji: '😐', color: 'bg-yellow-100 text-yellow-800' },
  { value: 4, label: 'Good', emoji: '🙂', color: 'bg-lime-100 text-lime-800' },
  { value: 5, label: 'Very Good', emoji: '😊', color: 'bg-green-100 text-green-800' },
];

export function MoodForm({ onSubmit, isLoading }: MoodFormProps) {
  const [mood, setMood] = useState<number>(0);
  const [note, setNote] = useState('');
  const [activities, setActivities] = useState('');
  const [sleepHours, setSleepHours] = useState('');
  const [stressLevel, setStressLevel] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (mood === 0) {
      alert('Please select your current mood');
      return;
    }

    const activityArray = activities
      .split(',')
      .map(activity => activity.trim())
      .filter(activity => activity.length > 0);

    await onSubmit({
      mood,
      note: note.trim() || undefined,
      activities: activityArray,
      sleepHours: sleepHours ? parseFloat(sleepHours) : undefined,
      stressLevel: stressLevel ? parseInt(stressLevel) : undefined,
    });

    // Reset form
    setMood(0);
    setNote('');
    setActivities('');
    setSleepHours('');
    setStressLevel('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Label className="text-base font-medium">How are you feeling right now?</Label>
        <div className="grid grid-cols-5 gap-2 mt-3">
          {moodOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setMood(option.value)}
              className={`p-3 rounded-lg border-2 transition-all ${
                mood === option.value
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-2xl mb-1">{option.emoji}</div>
              <div className="text-xs font-medium">{option.label}</div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <Label htmlFor="note">Note (Optional)</Label>
        <Textarea
          id="note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Any thoughts about how you're feeling?"
          className="mt-1"
          rows={3}
        />
      </div>

      <div>
        <Label htmlFor="activities">Activities Today (Optional)</Label>
        <Input
          id="activities"
          type="text"
          value={activities}
          onChange={(e) => setActivities(e.target.value)}
          placeholder="work, exercise, reading, friends (comma-separated)"
          className="mt-1"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="sleepHours">Sleep Hours (Optional)</Label>
          <Input
            id="sleepHours"
            type="number"
            min="0"
            max="24"
            step="0.5"
            value={sleepHours}
            onChange={(e) => setSleepHours(e.target.value)}
            placeholder="7.5"
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="stressLevel">Stress Level (Optional)</Label>
          <select
            id="stressLevel"
            value={stressLevel}
            onChange={(e) => setStressLevel(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">Select stress level...</option>
            <option value="1">Very Low</option>
            <option value="2">Low</option>
            <option value="3">Moderate</option>
            <option value="4">High</option>
            <option value="5">Very High</option>
          </select>
        </div>
      </div>

      <Button
        type="submit"
        disabled={isLoading || mood === 0}
        className="w-full"
      >
        {isLoading ? 'Saving...' : 'Save Mood Entry'}
      </Button>
    </form>
  );
}