"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Navigation } from "@/components/ui/navigation";
import {
  Heart,
  Wind,
  Brain,
  Mic,
  TrendingUp,
  Calendar,
  Target,
  Award,
} from "lucide-react";

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("overview");

  const quickActions = [
    {
      title: "Log Mood",
      description: "Track your current emotional state",
      icon: Heart,
      href: "/dashboard/mood",
      color: "text-red-500",
    },
    {
      title: "Breathing Exercise",
      description: "Practice calming breathing techniques",
      icon: Wind,
      href: "/dashboard/breathing",
      color: "text-blue-500",
    },
    {
      title: "CBT Tools",
      description: "Cognitive behavioral therapy exercises",
      icon: Brain,
      href: "/dashboard/cbt",
      color: "text-purple-500",
    },
    {
      title: "Voice Journal",
      description: "Record your thoughts and feelings",
      icon: Mic,
      href: "/dashboard/journal",
      color: "text-green-500",
    },
  ];

  const stats = [
    {
      title: "Today's Mood",
      value: "Good",
      change: "+2 from yesterday",
      icon: Heart,
      color: "text-red-500",
    },
    {
      title: "Weekly Average",
      value: "7.2/10",
      change: "Improving trend",
      icon: TrendingUp,
      color: "text-green-500",
    },
    {
      title: "Exercises Completed",
      value: "12",
      change: "This week",
      icon: Target,
      color: "text-blue-500",
    },
    {
      title: "Streak",
      value: "5 days",
      change: "Keep it up!",
      icon: Award,
      color: "text-yellow-500",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-foreground">
          Welcome back to SereneMind
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Your comprehensive mental health companion. Track your mood, practice
          mindfulness, and access evidence-based tools for better mental
          well-being.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Jump into your favorite mental health activities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <Button
                key={index}
                variant="outline"
                className="h-auto p-6 flex flex-col items-center space-y-3 hover:scale-105 transition-transform"
                asChild
              >
                <a href={action.href}>
                  <action.icon className={`h-8 w-8 ${action.color}`} />
                  <div className="text-center">
                    <div className="font-semibold">{action.title}</div>
                    <div className="text-sm text-muted-foreground">
                      {action.description}
                    </div>
                  </div>
                </a>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            Your latest mental health journey entries
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-4 p-4 border rounded-lg">
              <Heart className="h-8 w-8 text-red-500" />
              <div className="flex-1">
                <div className="font-semibold">Mood Logged</div>
                <div className="text-sm text-muted-foreground">
                  You felt "Good" today - keep up the positive momentum!
                </div>
              </div>
              <div className="text-sm text-muted-foreground">2 hours ago</div>
            </div>

            <div className="flex items-center space-x-4 p-4 border rounded-lg">
              <Wind className="h-8 w-8 text-blue-500" />
              <div className="flex-1">
                <div className="font-semibold">Breathing Exercise</div>
                <div className="text-sm text-muted-foreground">
                  Completed a 5-minute Box Breathing session
                </div>
              </div>
              <div className="text-sm text-muted-foreground">Yesterday</div>
            </div>

            <div className="flex items-center space-x-4 p-4 border rounded-lg">
              <Mic className="h-8 w-8 text-green-500" />
              <div className="flex-1">
                <div className="font-semibold">Voice Journal Entry</div>
                <div className="text-sm text-muted-foreground">
                  Recorded thoughts about work stress
                </div>
              </div>
              <div className="text-sm text-muted-foreground">2 days ago</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
