"use client";

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface MoodEntry {
  id: string;
  mood: number;
  note?: string;
  activities: string[];
  sleepHours?: number;
  stressLevel?: number;
  createdAt: string;
}

interface MoodChartProps {
  entries: MoodEntry[];
}

const moodEmojis = {
  1: '😢',
  2: '😞',
  3: '😐',
  4: '🙂',
  5: '😊',
};

const moodColors = {
  1: 'bg-red-500',
  2: 'bg-orange-500',
  3: 'bg-yellow-500',
  4: 'bg-lime-500',
  5: 'bg-green-500',
};

export function MoodChart({ entries }: MoodChartProps) {
  const chartData = useMemo(() => {
    if (entries.length === 0) return [];

    // Group by date and take the latest entry for each day
    const dailyMoods = entries.reduce((acc: Record<string, MoodEntry>, entry) => {
      const date = new Date(entry.createdAt).toISOString().split('T')[0];
      if (!acc[date] || new Date(entry.createdAt) > new Date(acc[date].createdAt)) {
        acc[date] = entry;
      }
      return acc;
    }, {});

    return Object.entries(dailyMoods)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-14); // Last 14 days
  }, [entries]);

  const averageMood = useMemo(() => {
    if (entries.length === 0) return 0;
    return entries.reduce((sum, entry) => sum + entry.mood, 0) / entries.length;
  }, [entries]);

  const moodDistribution = useMemo(() => {
    const dist = entries.reduce((acc: Record<number, number>, entry) => {
      acc[entry.mood] = (acc[entry.mood] || 0) + 1;
      return acc;
    }, {});
    return dist;
  }, [entries]);

  if (entries.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Mood Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-center py-8">
            No mood entries yet. Start tracking your mood to see trends and insights!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Mood Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Mood Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-3xl mb-2">
                {moodEmojis[Math.round(averageMood) as keyof typeof moodEmojis] || '😐'}
              </div>
              <div className="text-sm text-gray-600">Average Mood</div>
              <div className="text-lg font-semibold">{averageMood.toFixed(1)}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">📊</div>
              <div className="text-sm text-gray-600">Total Entries</div>
              <div className="text-lg font-semibold">{entries.length}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Mood Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Last 14 Days</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end justify-between h-32 gap-1">
            {chartData.map(([date, entry]) => (
              <div key={date} className="flex flex-col items-center flex-1">
                <div
                  className={`w-full ${moodColors[entry.mood as keyof typeof moodColors]} rounded-t transition-all hover:opacity-80`}
                  style={{
                    height: `${(entry.mood / 5) * 100}%`,
                    minHeight: '8px'
                  }}
                  title={`${new Date(date).toLocaleDateString()}: ${entry.mood}/5`}
                />
                <div className="text-xs text-gray-500 mt-1 transform -rotate-45 origin-top">
                  {new Date(date).getDate()}
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-2">
            <span>1</span>
            <span>2</span>
            <span>3</span>
            <span>4</span>
            <span>5</span>
          </div>
        </CardContent>
      </Card>

      {/* Mood Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Mood Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[5, 4, 3, 2, 1].map((mood) => {
              const count = moodDistribution[mood] || 0;
              const percentage = entries.length > 0 ? (count / entries.length) * 100 : 0;

              return (
                <div key={mood} className="flex items-center gap-3">
                  <div className="flex items-center gap-2 w-16">
                    <span>{moodEmojis[mood as keyof typeof moodEmojis]}</span>
                    <span className="text-sm font-medium">{mood}</span>
                  </div>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className={`${moodColors[mood as keyof typeof moodColors]} h-2 rounded-full transition-all`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <div className="text-sm text-gray-600 w-12 text-right">
                    {count}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}