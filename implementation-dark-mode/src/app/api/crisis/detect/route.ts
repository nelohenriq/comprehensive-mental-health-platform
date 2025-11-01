import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { CrisisDetector } from '@/lib/crisis/detection';
import { CrisisResources } from '@/lib/crisis/resources';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { text, location, includeResources = true } = body;

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Text content is required' }, { status: 400 });
    }

    // Analyze the text for crisis indicators
    const analysis = CrisisDetector.analyzeText(text);

    let resources: any[] = [];
    if (includeResources) {
      // Get appropriate resources based on crisis level and location
      const crisisLevel = analysis.level === 'CRITICAL' ? 'critical' :
                         analysis.level === 'HIGH' ? 'high' : 'all';

      resources = CrisisResources.getResources(location, crisisLevel)
        .slice(0, 5) // Limit to top 5 resources
        .map(resource => CrisisResources.formatResourceForDisplay(resource));
    }

    // Generate appropriate response
    const response = CrisisDetector.generateCrisisResponse(analysis);

    return NextResponse.json({
      analysis: {
        level: analysis.level,
        score: analysis.score,
        detectedKeywords: analysis.detectedKeywords,
        shouldAlert: analysis.shouldAlert,
        immediateAction: analysis.immediateAction,
      },
      response,
      resources,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error in crisis detection:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const location = searchParams.get('location');
    const crisisLevel = searchParams.get('crisisLevel') as 'all' | 'high' | 'critical' || 'all';

    const resources = CrisisResources.getResources(location || undefined, crisisLevel);

    return NextResponse.json({
      resources: resources.map(resource =>
        CrisisResources.formatResourceForDisplay(resource)
      )
    });
  } catch (error) {
    console.error('Error fetching crisis resources:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}