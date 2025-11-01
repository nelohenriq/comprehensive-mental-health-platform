"use client";

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CrisisDetector } from '@/components/crisis/crisis-detector';
import { Shield, Phone, MessageCircle, Globe, Heart } from 'lucide-react';

export default function CrisisPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [showDetector, setShowDetector] = useState(false);

  if (status === 'unauthenticated') {
    router.push('/auth/signin');
    return null;
  }

  if (!session) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Shield className="h-8 w-8" />
            Crisis Support
          </h1>
          <p className="text-gray-600 mt-2">
            Get immediate help and resources when you need them most.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Crisis Detection */}
        <div className="lg:col-span-2">
          {!showDetector ? (
            <Card className="h-[400px] flex items-center justify-center">
              <div className="text-center">
                <Shield className="h-16 w-16 mx-auto mb-4 text-blue-500" />
                <h3 className="text-xl font-semibold mb-2">Crisis Detection & Support</h3>
                <p className="text-gray-600 mb-6 max-w-md">
                  Our system can analyze text for crisis indicators and provide
                  immediate access to professional help and resources.
                </p>
                <Button
                  onClick={() => setShowDetector(true)}
                  className="flex items-center gap-2"
                >
                  <MessageCircle className="h-4 w-4" />
                  Start Crisis Check
                </Button>
              </div>
            </Card>
          ) : (
            <CrisisDetector
              placeholder="Describe what's happening or how you're feeling..."
              onCrisisDetected={(analysis) => {
                console.log('Crisis detected:', analysis);
              }}
            />
          )}
        </div>

        {/* Emergency Resources */}
        <div className="space-y-6">
          {/* Emergency Contacts */}
          <Card className="border-destructive bg-destructive">
            <CardHeader>
              <CardTitle className="text-destructive-foreground flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Emergency Contacts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Emergency Services</span>
                  <span className="text-red-600 font-bold">911</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">Crisis Lifeline</span>
                  <span className="text-red-600 font-bold">988</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">Crisis Text</span>
                  <span className="text-red-600 font-bold">HOME to 741741</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Resources */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5" />
                Quick Resources
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => window.open('https://988lifeline.org/', '_blank')}
                >
                  <Globe className="h-4 w-4 mr-2" />
                  National Suicide Prevention Lifeline
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => window.open('https://www.crisistextline.org/', '_blank')}
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Crisis Text Line
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => window.open('https://www.nami.org/help', '_blank')}
                >
                  <Heart className="h-4 w-4 mr-2" />
                  NAMI Helpline
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Safety Plan */}
          <Card>
            <CardHeader>
              <CardTitle>Safety Plan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div>
                  <h4 className="font-medium mb-1">Warning Signs</h4>
                  <p className="text-gray-600">
                    Recognize when your mental health is deteriorating
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-1">Coping Strategies</h4>
                  <p className="text-gray-600">
                    Healthy ways to manage difficult emotions
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-1">Support Network</h4>
                  <p className="text-gray-600">
                    People you can reach out to for help
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-1">Professional Help</h4>
                  <p className="text-gray-600">
                    Therapists, counselors, and crisis services
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Disclaimer */}
          <Card className="bg-accent border-accent">
            <CardContent className="pt-6">
              <p className="text-sm text-accent-foreground">
                <strong>Important:</strong> This tool is for informational purposes and
                should not replace professional medical advice. In case of emergency,
                please contact emergency services immediately.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}