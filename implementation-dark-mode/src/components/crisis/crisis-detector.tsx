"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Shield, MessageSquare } from 'lucide-react';
import { CrisisModal } from './crisis-modal';

interface CrisisDetectorProps {
  onCrisisDetected?: (analysis: any) => void;
  placeholder?: string;
  className?: string;
}

export function CrisisDetector({
  onCrisisDetected,
  placeholder = "Share what's on your mind...",
  className = ""
}: CrisisDetectorProps) {
  const [text, setText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [crisisModal, setCrisisModal] = useState<{
    isOpen: boolean;
    analysis: any;
    response: any;
    resources: any[];
  }>({
    isOpen: false,
    analysis: null,
    response: null,
    resources: []
  });

  const analyzeText = async () => {
    if (!text.trim()) return;

    setIsAnalyzing(true);
    try {
      const response = await fetch('/api/crisis/detect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text.trim(),
          includeResources: true,
        }),
      });

      if (response.ok) {
        const data = await response.json();

        // Show crisis modal if crisis detected
        if (data.analysis.shouldAlert || data.analysis.level !== 'LOW') {
          setCrisisModal({
            isOpen: true,
            analysis: data.analysis,
            response: data.response,
            resources: data.resources,
          });
        }

        // Call callback if provided
        if (onCrisisDetected) {
          onCrisisDetected(data.analysis);
        }
      } else {
        console.error('Failed to analyze text');
      }
    } catch (error) {
      console.error('Error analyzing text:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCloseModal = () => {
    setCrisisModal(prev => ({ ...prev, isOpen: false }));
  };

  return (
    <>
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Crisis Detection
          </CardTitle>
          <p className="text-sm text-gray-600">
            Our system monitors for crisis indicators and provides appropriate support resources.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={placeholder}
            className="min-h-[120px]"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                analyzeText();
              }
            }}
          />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <AlertTriangle className="h-4 w-4" />
              <span>Press Ctrl+Enter to analyze</span>
            </div>

            <Button
              onClick={analyzeText}
              disabled={!text.trim() || isAnalyzing}
              className="flex items-center gap-2"
            >
              <MessageSquare className="h-4 w-4" />
              {isAnalyzing ? 'Analyzing...' : 'Analyze Text'}
            </Button>
          </div>

          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Privacy Notice:</strong> Crisis detection analysis is performed locally and
              your text is not stored permanently. This helps ensure your safety while maintaining privacy.
            </p>
          </div>
        </CardContent>
      </Card>

      <CrisisModal
        isOpen={crisisModal.isOpen}
        onClose={handleCloseModal}
        analysis={crisisModal.analysis}
        response={crisisModal.response}
        resources={crisisModal.resources}
      />
    </>
  );
}