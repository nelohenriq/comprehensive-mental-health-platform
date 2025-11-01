"use client";

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wind, Play, Pause, RotateCcw, Timer } from 'lucide-react';

interface BreathingExercise {
  id: string;
  name: string;
  description: string;
  pattern: {
    inhale: number;
    hold?: number;
    exhale: number;
    pause?: number;
  };
  duration: number; // in seconds
  category: string;
}

const BREATHING_EXERCISES: BreathingExercise[] = [
  {
    id: '4-7-8',
    name: '4-7-8 Breathing',
    description: 'A calming technique that helps reduce anxiety and promote sleep. Inhale for 4 seconds, hold for 7 seconds, exhale for 8 seconds.',
    pattern: { inhale: 4, hold: 7, exhale: 8 },
    duration: 120,
    category: 'Relaxation'
  },
  {
    id: 'box-breathing',
    name: 'Box Breathing',
    description: 'A simple technique used by Navy SEALs. Inhale for 4, hold for 4, exhale for 4, hold for 4.',
    pattern: { inhale: 4, hold: 4, exhale: 4, pause: 4 },
    duration: 120,
    category: 'Focus'
  },
  {
    id: 'deep-breathing',
    name: 'Deep Breathing',
    description: 'Basic diaphragmatic breathing to reduce stress and increase oxygen flow.',
    pattern: { inhale: 4, exhale: 6 },
    duration: 180,
    category: 'Stress Relief'
  },
  {
    id: 'alternate-nostril',
    name: 'Alternate Nostril Breathing',
    description: 'Balances the nervous system and promotes mental clarity.',
    pattern: { inhale: 4, exhale: 4 },
    duration: 240,
    category: 'Balance'
  }
];

export default function BreathingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [selectedExercise, setSelectedExercise] = useState<BreathingExercise | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [currentPhase, setCurrentPhase] = useState<'inhale' | 'hold' | 'exhale' | 'pause'>('inhale');
  const [timeLeft, setTimeLeft] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [phaseTimeLeft, setPhaseTimeLeft] = useState(0);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  // Helper function to get phase sequence
  const getPhaseSequence = (exercise: BreathingExercise): Array<'inhale' | 'hold' | 'exhale' | 'pause'> => {
    const phases: Array<'inhale' | 'hold' | 'exhale' | 'pause'> = ['inhale'];
    if (exercise.pattern.hold) phases.push('hold');
    phases.push('exhale');
    if (exercise.pattern.pause) phases.push('pause');
    return phases;
  };

  // Helper function to get phase duration
  const getPhaseDuration = (phase: 'inhale' | 'hold' | 'exhale' | 'pause', exercise: BreathingExercise): number => {
    switch (phase) {
      case 'inhale': return exercise.pattern.inhale;
      case 'hold': return exercise.pattern.hold || 0;
      case 'exhale': return exercise.pattern.exhale;
      case 'pause': return exercise.pattern.pause || 0;
      default: return 0;
    }
  };

  // Main timer effect
  useEffect(() => {
    if (!isActive || !selectedExercise) return;

    const interval = setInterval(() => {
      setPhaseTimeLeft(prev => {
        if (prev <= 1) {
          // Move to next phase
          const phases = getPhaseSequence(selectedExercise);
          const currentIndex = phases.indexOf(currentPhase);
          const nextIndex = (currentIndex + 1) % phases.length;
          const nextPhase = phases[nextIndex];
          
          setCurrentPhase(nextPhase);
          return getPhaseDuration(nextPhase, selectedExercise);
        }
        return prev - 1;
      });

      setTimeLeft(prev => {
        if (prev <= 1) {
          setIsActive(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, selectedExercise, currentPhase]);

  const startExercise = (exercise: BreathingExercise) => {
    setSelectedExercise(exercise);
    setIsActive(true);
    setTimeLeft(exercise.duration);
    setTotalTime(exercise.duration);
    setCurrentPhase('inhale');
    setPhaseTimeLeft(exercise.pattern.inhale);
  };

  const pauseExercise = () => {
    setIsActive(false);
  };

  const resumeExercise = () => {
    setIsActive(true);
  };

  const resetExercise = () => {
    if (selectedExercise) {
      setIsActive(false);
      setTimeLeft(selectedExercise.duration);
      setTotalTime(selectedExercise.duration);
      setCurrentPhase('inhale');
      setPhaseTimeLeft(selectedExercise.pattern.inhale);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!session) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Wind className="h-8 w-8" />
            Breathing Exercises
          </h1>
          <p className="text-muted-foreground mt-2">
            Guided breathing exercises to help you relax, focus, and reduce stress.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Exercise Selection */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Choose an Exercise</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {BREATHING_EXERCISES.map((exercise) => (
                  <button
                    key={exercise.id}
                    onClick={() => startExercise(exercise)}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                      selectedExercise?.id === exercise.id
                        ? 'border-primary bg-accent'
                        : 'border-border hover:border-muted'
                    }`}
                  >
                    <div className="font-medium">{exercise.name}</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {exercise.category} • {formatTime(exercise.duration)}
                    </div>
                    <div className="text-xs text-muted-foreground mt-2">
                      {exercise.description}
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Breathing Guide */}
        <div className="lg:col-span-2">
          {selectedExercise ? (
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{selectedExercise.name}</span>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Timer className="h-4 w-4" />
                    {formatTime(timeLeft)}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center h-96">
                {/* Breathing Circle */}
                <div className="relative mb-8">
                  <div
                    className={`w-48 h-48 rounded-full border-8 transition-all duration-1000 ease-in-out ${
                      currentPhase === 'inhale'
                        ? 'border-primary bg-primary/10 scale-125'
                        : currentPhase === 'hold'
                        ? 'border-accent bg-accent/10 scale-125'
                        : currentPhase === 'exhale'
                        ? 'border-secondary bg-secondary/10 scale-75'
                        : 'border-muted bg-muted/10 scale-90'
                    }`}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-3xl font-bold capitalize text-foreground">
                        {currentPhase}
                      </div>
                      <div className="text-2xl text-muted-foreground">
                        {phaseTimeLeft}s
                      </div>
                    </div>
                  </div>
                </div>

                {/* Instructions */}
                <div className="text-center mb-8">
                  <h3 className="text-xl font-semibold mb-2">
                    {currentPhase === 'inhale' && 'Breathe In'}
                    {currentPhase === 'hold' && 'Hold Your Breath'}
                    {currentPhase === 'exhale' && 'Breathe Out'}
                    {currentPhase === 'pause' && 'Pause'}
                  </h3>
                  <p className="text-muted-foreground">
                    {selectedExercise.description}
                  </p>
                </div>

                {/* Controls */}
                <div className="flex gap-4">
                  {isActive ? (
                    <Button onClick={pauseExercise} variant="outline">
                      <Pause className="h-4 w-4 mr-2" />
                      Pause
                    </Button>
                  ) : (
                    <Button onClick={resumeExercise}>
                      <Play className="h-4 w-4 mr-2" />
                      {timeLeft === 0 ? 'Start' : 'Resume'}
                    </Button>
                  )}
                  <Button onClick={resetExercise} variant="outline">
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reset
                  </Button>
                </div>

                {/* Progress Bar */}
                <div className="w-full max-w-md mt-8">
                  <div className="bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all duration-1000"
                      style={{
                        width: `${totalTime > 0 ? ((totalTime - timeLeft) / totalTime) * 100 : 0}%`
                      }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="h-96 flex items-center justify-center">
              <div className="text-center">
                <Wind className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">Choose a Breathing Exercise</h3>
                <p className="text-muted-foreground">
                  Select an exercise from the list to begin your breathing practice.
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
