"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MoodForm } from '@/components/mood/mood-form';
import { MoodChart } from '@/components/mood/mood-chart';
import { Heart, TrendingUp, Plus } from 'lucide-react';

interface MoodEntry {
  id: string;
  mood: number;
  note?: string;
  activities: string[];
  sleepHours?: number;
  stressLevel?: number;
  createdAt: string;
}

interface MoodStats {
  averageMood: number;
  totalEntries: number;
  moodDistribution: Record<number, number>;
  recentTrend: Array<{ date: string; mood: number }>;
  insights: string[];
}

export default function MoodPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [entries, setEntries] = useState<MoodEntry[]>([]);
  const [stats, setStats] = useState<MoodStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  useEffect(() => {
    if (session) {
      fetchMoodData();
    }
  }, [session]);

  const fetchMoodData = async () => {
    try {
      const [entriesResponse, statsResponse] = await Promise.all([
        fetch('/api/mood'),
        fetch('/api/mood?stats=true')
      ]);

      if (entriesResponse.ok) {
        const entriesData = await entriesResponse.json();
        setEntries(entriesData.entries);
      }

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData.stats);
      }
    } catch (error) {
      console.error('Error fetching mood data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateEntry = async (data: {
    mood: number;
    note?: string;
    activities: string[];
    sleepHours?: number;
    stressLevel?: number;
  }) => {
    try {
      const response = await fetch('/api/mood', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        await fetchMoodData();
        setShowForm(false);
      } else {
        alert('Failed to save mood entry');
      }
    } catch (error) {
      console.error('Error creating mood entry:', error);
      alert('Failed to save mood entry');
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
            <Heart className="h-8 w-8" />
            Mood Tracker
          </h1>
          <p className="text-muted-foreground mt-2">
            Track your daily mood and discover patterns in your emotional well-being.
          </p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Log Mood
        </Button>
      </div>

      {showForm && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>How are you feeling today?</CardTitle>
          </CardHeader>
          <CardContent>
            <MoodForm onSubmit={handleCreateEntry} />
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Mood Chart */}
        <div className="lg:col-span-2">
          <MoodChart entries={entries} />
        </div>

        {/* Insights and Stats */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Quick Stats
              </CardTitle>
            </CardHeader>
            <CardContent>
              {stats ? (
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Average Mood</span>
                    <span className="font-semibold text-foreground">{stats.averageMood.toFixed(1)}/5</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Entries</span>
                    <span className="font-semibold text-foreground">{stats.totalEntries}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Most Common</span>
                    <span className="font-semibold text-foreground">
                      {Object.entries(stats.moodDistribution).length > 0
                        ? Object.entries(stats.moodDistribution).reduce((a, b) =>
                            stats.moodDistribution[parseInt(a[0])] > stats.moodDistribution[parseInt(b[0])] ? a : b
                          )[0]
                        : 'N/A'}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">Loading stats...</p>
              )}
            </CardContent>
          </Card>

          {/* Insights */}
          {stats && stats.insights.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {stats.insights.map((insight, index) => (
                    <li key={index} className="text-sm text-foreground flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      {insight}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Recent Entries */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Entries</CardTitle>
            </CardHeader>
            <CardContent>
              {entries.length > 0 ? (
                <div className="space-y-3">
                  {entries.slice(0, 5).map((entry) => (
                    <div key={entry.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">
                          {['😢', '😞', '😐', '🙂', '😊'][entry.mood - 1]}
                        </span>
                        <div>
                          <div className="text-sm font-medium">
                            {new Date(entry.createdAt).toLocaleDateString()}
                          </div>
                          {entry.note && (
                            <div className="text-xs text-muted-foreground truncate max-w-32">
                              {entry.note}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {entry.mood}/5
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">No entries yet</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}