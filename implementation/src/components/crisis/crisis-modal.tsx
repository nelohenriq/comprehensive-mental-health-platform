"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Phone, MessageCircle, ExternalLink, X } from 'lucide-react';

interface CrisisModalProps {
  isOpen: boolean;
  onClose: () => void;
  analysis: {
    level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    score: number;
    detectedKeywords: string[];
    shouldAlert: boolean;
    immediateAction: string[];
  };
  response: {
    message: string;
    urgency: 'low' | 'medium' | 'high' | 'critical';
    actions: string[];
  };
  resources: Array<{
    title: string;
    contact: string[];
    description: string;
    availability: string;
    services: string;
  }>;
}

const urgencyColors = {
  low: 'bg-yellow-100 border-yellow-300 text-yellow-800',
  medium: 'bg-orange-100 border-orange-300 text-orange-800',
  high: 'bg-red-100 border-red-300 text-red-800',
  critical: 'bg-red-200 border-red-400 text-red-900',
};

const urgencyIcons = {
  low: AlertTriangle,
  medium: AlertTriangle,
  high: AlertTriangle,
  critical: AlertTriangle,
};

export function CrisisModal({
  isOpen,
  onClose,
  analysis,
  response,
  resources
}: CrisisModalProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    } else {
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isVisible) return null;

  const UrgencyIcon = urgencyIcons[response.urgency];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div
        className={`w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-lg shadow-xl transform transition-all duration-300 ${
          isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
      >
        {/* Header */}
        <div className={`p-6 border-b ${urgencyColors[response.urgency]}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <UrgencyIcon className="h-6 w-6" />
              <div>
                <h2 className="text-xl font-bold">
                  {analysis.level === 'CRITICAL' ? 'CRITICAL CRISIS DETECTED' :
                   analysis.level === 'HIGH' ? 'HIGH RISK DETECTED' :
                   'Support Recommended'}
                </h2>
                <p className="text-sm opacity-90">
                  Crisis Level: {analysis.level} (Score: {analysis.score})
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-current hover:bg-black hover:bg-opacity-10"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Main Message */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-gray-800 leading-relaxed">{response.message}</p>
          </div>

          {/* Immediate Actions (Critical/High only) */}
          {(analysis.level === 'CRITICAL' || analysis.level === 'HIGH') && (
            <Card className="border-red-200 bg-red-50">
              <CardHeader className="pb-3">
                <CardTitle className="text-red-800 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Immediate Actions Required
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {analysis.immediateAction.map((action, index) => (
                    <li key={index} className="flex items-start gap-2 text-red-700">
                      <span className="font-bold">•</span>
                      <span className="font-medium">{action}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Recommended Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Recommended Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {response.actions.map((action, index) => (
                  <li key={index} className="flex items-start gap-2 text-gray-700">
                    <span className="text-blue-500">•</span>
                    <span>{action}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Crisis Resources */}
          {resources.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  Crisis Support Resources
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {resources.map((resource, index) => (
                    <div key={index} className="border rounded-lg p-4 bg-gray-50">
                      <h4 className="font-semibold text-gray-900 mb-2">
                        {resource.title}
                      </h4>
                      <p className="text-sm text-gray-600 mb-3">
                        {resource.description}
                      </p>

                      <div className="space-y-1 mb-3">
                        {resource.contact.map((contact, contactIndex) => (
                          <div key={contactIndex} className="text-sm font-medium text-blue-600">
                            {contact}
                          </div>
                        ))}
                      </div>

                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{resource.availability}</span>
                        <span>{resource.services}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Keywords Detected */}
          {analysis.detectedKeywords.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Keywords Detected</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {analysis.detectedKeywords.map((keyword, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Footer */}
          <div className="flex justify-between items-center pt-4 border-t">
            <p className="text-sm text-gray-500">
              Remember: You are not alone. Help is available 24/7.
            </p>
            <Button onClick={onClose} variant="outline">
              I Understand
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}