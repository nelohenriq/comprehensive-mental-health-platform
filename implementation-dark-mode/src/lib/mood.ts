import { prisma } from './prisma';
import { MoodEntry } from '@prisma/client';

export interface MoodEntryData {
  mood: number;
  note?: string;
  activities?: string[];
  sleepHours?: number;
  stressLevel?: number;
}

export class MoodService {
  static async createEntry(userId: string, data: MoodEntryData) {
    return await (prisma as any).moodEntry.create({
      data: {
        userId,
        mood: data.mood,
        note: data.note,
        activities: data.activities || [],
        sleepHours: data.sleepHours,
        stressLevel: data.stressLevel,
      },
    });
  }

  static async getEntries(userId: string, limit = 30, offset = 0) {
    return await (prisma as any).moodEntry.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });
  }

  static async getEntryById(userId: string, entryId: string) {
    const entry = await (prisma as any).moodEntry.findFirst({
      where: {
        id: entryId,
        userId,
      },
    });

    if (!entry) {
      throw new Error('Mood entry not found');
    }

    return entry;
  }

  static async updateEntry(userId: string, entryId: string, data: Partial<MoodEntryData>) {
    return await (prisma as any).moodEntry.update({
      where: {
        id: entryId,
        userId,
      },
      data,
    });
  }

  static async deleteEntry(userId: string, entryId: string) {
    return await (prisma as any).moodEntry.delete({
      where: {
        id: entryId,
        userId,
      },
    });
  }

  static async getMoodStats(userId: string, days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const entries: MoodEntry[] = await (prisma as any).moodEntry.findMany({
      where: {
        userId,
        createdAt: {
          gte: startDate,
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    if (entries.length === 0) {
      return {
        averageMood: 0,
        totalEntries: 0,
        moodDistribution: {},
        recentTrend: [],
        insights: [],
      };
    }

    // Calculate average mood
    const averageMood = entries.reduce((sum, entry) => sum + entry.mood, 0) / entries.length;

    // Mood distribution
    const moodDistribution = entries.reduce((dist: Record<number, number>, entry) => {
      dist[entry.mood] = (dist[entry.mood] || 0) + 1;
      return dist;
    }, {});

    // Recent trend (last 7 entries)
    const recentTrend = entries.slice(-7).map(entry => ({
      date: entry.createdAt.toISOString().split('T')[0],
      mood: entry.mood,
    }));

    // Generate insights
    const insights = this.generateInsights(entries, averageMood);

    return {
      averageMood: Math.round(averageMood * 10) / 10,
      totalEntries: entries.length,
      moodDistribution,
      recentTrend,
      insights,
    };
  }

  private static generateInsights(entries: MoodEntry[], averageMood: number): string[] {
    const insights: string[] = [];

    // Mood stability
    const moodVariance = entries.reduce((sum, entry) => {
      return sum + Math.pow(entry.mood - averageMood, 2);
    }, 0) / entries.length;

    if (moodVariance < 0.5) {
      insights.push("Your mood has been relatively stable recently.");
    } else if (moodVariance > 2) {
      insights.push("Your mood has been fluctuating quite a bit. Consider tracking what affects your mood.");
    }

    // Sleep correlation
    const entriesWithSleep = entries.filter(e => e.sleepHours !== null);
    if (entriesWithSleep.length >= 3) {
      const sleepCorrelation = this.calculateCorrelation(
        entriesWithSleep.map(e => e.sleepHours!),
        entriesWithSleep.map(e => e.mood)
      );

      if (sleepCorrelation > 0.3) {
        insights.push("Better sleep seems to correlate with improved mood.");
      } else if (sleepCorrelation < -0.3) {
        insights.push("Poor sleep appears to negatively impact your mood.");
      }
    }

    // Stress correlation
    const entriesWithStress = entries.filter(e => e.stressLevel !== null);
    if (entriesWithStress.length >= 3) {
      const stressCorrelation = this.calculateCorrelation(
        entriesWithStress.map(e => e.stressLevel!),
        entriesWithStress.map(e => e.mood)
      );

      if (stressCorrelation < -0.3) {
        insights.push("High stress levels seem to negatively affect your mood.");
      }
    }

    // Activity patterns
    const activityCount: Record<string, number> = {};
    entries.forEach(entry => {
      entry.activities.forEach((activity: string) => {
        activityCount[activity] = (activityCount[activity] || 0) + 1;
      });
    });

    const topActivities = Object.entries(activityCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3);

    if (topActivities.length > 0) {
      insights.push(`Your most common activities: ${topActivities.map(([activity]) => activity).join(', ')}`);
    }

    return insights;
  }

  private static calculateCorrelation(x: number[], y: number[]): number {
    const n = x.length;
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
    const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0);

    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

    return denominator === 0 ? 0 : numerator / denominator;
  }
}