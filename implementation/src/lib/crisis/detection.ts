export interface CrisisLevel {
  level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  score: number;
  keywords: string[];
  recommendations: string[];
}

export interface CrisisAnalysis {
  level: CrisisLevel['level'];
  score: number;
  detectedKeywords: string[];
  recommendations: string[];
  shouldAlert: boolean;
  immediateAction: string[];
}

export class CrisisDetector {
  // Crisis keywords organized by severity levels
  private static readonly CRISIS_KEYWORDS = {
    CRITICAL: [
      'suicide', 'suicidal', 'kill myself', 'end it all', 'not worth living',
      'want to die', 'better off dead', 'self harm', 'cutting', 'overdose',
      'hang myself', 'jump', 'shoot myself', 'poison', 'drown'
    ],
    HIGH: [
      'can\'t go on', 'give up', 'no hope', 'hopeless', 'worthless',
      'hate myself', 'hate my life', 'want to disappear', 'end my life',
      'tired of living', 'sick of everything', 'can\'t take it anymore',
      'breakdown', 'losing it', 'falling apart'
    ],
    MEDIUM: [
      'depressed', 'anxious', 'panic', 'scared', 'terrified', 'overwhelmed',
      'stressed out', 'can\'t cope', 'falling apart', 'losing control',
      'breaking down', 'mental breakdown', 'nervous breakdown'
    ],
    LOW: [
      'sad', 'down', 'unhappy', 'worried', 'stressed', 'tired',
      'exhausted', 'overwhelmed', 'frustrated', 'angry', 'upset'
    ]
  };

  // Contextual modifiers that increase severity
  private static readonly SEVERITY_MODIFIERS = {
    CRITICAL: [
      'tonight', 'today', 'now', 'immediately', 'right now', 'can\'t wait',
      'final', 'last', 'forever', 'never again', 'end of the line'
    ],
    HIGH: [
      'always', 'never', 'everyone', 'everything', 'all the time',
      'constantly', 'forever', 'eternal', 'permanent'
    ]
  };

  // Positive indicators that might reduce severity
  private static readonly POSITIVE_INDICATORS = [
    'getting better', 'feeling better', 'improving', 'hope', 'positive',
    'grateful', 'thankful', 'appreciate', 'love', 'happy', 'joy',
    'support', 'help', 'therapy', 'counseling', 'doctor'
  ];

  static analyzeText(text: string): CrisisAnalysis {
    const normalizedText = text.toLowerCase();
    const words = normalizedText.split(/\s+/);

    let totalScore = 0;
    const detectedKeywords: string[] = [];
    const recommendations: string[] = [];
    const immediateActions: string[] = [];

    // Check for critical keywords
    const criticalMatches = this.findKeywordMatches(normalizedText, this.CRISIS_KEYWORDS.CRITICAL);
    if (criticalMatches.length > 0) {
      totalScore += criticalMatches.length * 10;
      detectedKeywords.push(...criticalMatches);
      immediateActions.push('Call emergency services (911) immediately');
      immediateActions.push('Contact National Suicide Prevention Lifeline: 988');
      immediateActions.push('Go to nearest emergency room');
    }

    // Check for high severity keywords
    const highMatches = this.findKeywordMatches(normalizedText, this.CRISIS_KEYWORDS.HIGH);
    if (highMatches.length > 0) {
      totalScore += highMatches.length * 5;
      detectedKeywords.push(...highMatches);
      recommendations.push('Contact a crisis hotline immediately');
      recommendations.push('Reach out to a trusted friend or family member');
      recommendations.push('Consider speaking with a mental health professional');
    }

    // Check for medium severity keywords
    const mediumMatches = this.findKeywordMatches(normalizedText, this.CRISIS_KEYWORDS.MEDIUM);
    if (mediumMatches.length > 0) {
      totalScore += mediumMatches.length * 2;
      detectedKeywords.push(...mediumMatches);
      recommendations.push('Practice deep breathing or grounding exercises');
      recommendations.push('Consider journaling your thoughts');
      recommendations.push('Reach out to a support network');
    }

    // Check for low severity keywords
    const lowMatches = this.findKeywordMatches(normalizedText, this.CRISIS_KEYWORDS.LOW);
    if (lowMatches.length > 0) {
      totalScore += lowMatches.length * 1;
      detectedKeywords.push(...lowMatches);
      recommendations.push('Try relaxation techniques');
      recommendations.push('Consider talking to someone you trust');
      recommendations.push('Practice self-care activities');
    }

    // Check for severity modifiers
    const criticalModifiers = this.findKeywordMatches(normalizedText, this.SEVERITY_MODIFIERS.CRITICAL);
    if (criticalModifiers.length > 0 && totalScore > 0) {
      totalScore *= 2;
      recommendations.unshift('This appears to be an urgent situation');
    }

    const highModifiers = this.findKeywordMatches(normalizedText, this.SEVERITY_MODIFIERS.HIGH);
    if (highModifiers.length > 0 && totalScore > 0) {
      totalScore *= 1.5;
    }

    // Check for positive indicators that might reduce severity
    const positiveMatches = this.findKeywordMatches(normalizedText, this.POSITIVE_INDICATORS);
    if (positiveMatches.length > 0 && totalScore > 0) {
      totalScore *= 0.7; // Reduce severity if positive indicators present
      recommendations.push('It\'s good that you\'re recognizing positive aspects');
    }

    // Determine crisis level
    const level = this.determineCrisisLevel(totalScore);
    const shouldAlert = level === 'CRITICAL' || level === 'HIGH';

    // Add general recommendations
    if (totalScore > 0) {
      recommendations.push('Remember that you are not alone');
      recommendations.push('Your feelings are valid and temporary');
      recommendations.push('Professional help is available and effective');
    }

    return {
      level,
      score: Math.round(totalScore * 100) / 100,
      detectedKeywords: [...new Set(detectedKeywords)], // Remove duplicates
      recommendations: [...new Set(recommendations)], // Remove duplicates
      shouldAlert,
      immediateAction: immediateActions
    };
  }

  private static findKeywordMatches(text: string, keywords: string[]): string[] {
    const matches: string[] = [];
    for (const keyword of keywords) {
      if (text.includes(keyword)) {
        matches.push(keyword);
      }
    }
    return matches;
  }

  private static determineCrisisLevel(score: number): CrisisLevel['level'] {
    if (score >= 15) return 'CRITICAL';
    if (score >= 8) return 'HIGH';
    if (score >= 3) return 'MEDIUM';
    if (score >= 1) return 'LOW';
    return 'LOW';
  }

  static getCrisisResources(location?: string): Record<string, any> {
    const resources = {
      global: {
        suicidePrevention: {
          name: 'International Association for Suicide Prevention',
          url: 'https://www.iasp.info/',
          phone: null
        }
      },
      us: {
        nationalSuicidePreventionLifeline: {
          name: '988 Suicide & Crisis Lifeline',
          phone: '988',
          url: 'https://988lifeline.org/',
          description: '24/7 free and confidential support'
        },
        crisisTextLine: {
          name: 'Crisis Text Line',
          phone: null,
          text: 'Text HOME to 741741',
          url: 'https://www.crisistextline.org/',
          description: '24/7 crisis counseling via text'
        },
        nationalAllianceOnMentalIllness: {
          name: 'NAMI Helpline',
          phone: '1-800-950-6264',
          url: 'https://www.nami.org/help',
          description: 'Mental health support and information'
        }
      },
      uk: {
        samaritans: {
          name: 'Samaritans',
          phone: '116 123',
          url: 'https://www.samaritans.org/',
          description: '24/7 emotional support'
        }
      },
      canada: {
        crisisServicesCanada: {
          name: 'Canada Suicide Prevention Service',
          phone: '988',
          url: 'https://www.canada.ca/en/public-health/services/mental-health-services/canada-suicide-prevention-service.html',
          description: '24/7 crisis support'
        }
      },
      australia: {
        lifeline: {
          name: 'Lifeline Australia',
          phone: '13 11 14',
          url: 'https://www.lifeline.org.au/',
          description: '24/7 crisis support and suicide prevention'
        }
      }
    };

    // Default to US resources if location not specified
    const locationKey = location?.toLowerCase() || 'us';
    return resources[locationKey as keyof typeof resources] || resources.us;
  }

  static generateCrisisResponse(analysis: CrisisAnalysis): {
    message: string;
    urgency: 'low' | 'medium' | 'high' | 'critical';
    actions: string[];
  } {
    let message = '';
    let urgency: 'low' | 'medium' | 'high' | 'critical' = 'low';
    const actions: string[] = [];

    switch (analysis.level) {
      case 'CRITICAL':
        urgency = 'critical';
        message = 'I\'m very concerned about what you\'ve shared. Your safety is the most important thing right now. Please reach out for immediate help.';
        actions.push('Call emergency services (911) right now');
        actions.push('Contact the National Suicide Prevention Lifeline at 988');
        actions.push('Go to your nearest emergency room');
        break;

      case 'HIGH':
        urgency = 'high';
        message = 'I\'m concerned about how you\'re feeling. It sounds like you\'re going through a very difficult time. Please don\'t hesitate to reach out for help.';
        actions.push('Call the National Suicide Prevention Lifeline at 988');
        actions.push('Contact a trusted friend or family member');
        actions.push('Speak with a mental health professional');
        break;

      case 'MEDIUM':
        urgency = 'medium';
        message = 'It sounds like you\'re experiencing some difficult emotions. Remember that it\'s okay to ask for help, and there are people who care about you.';
        actions.push('Try some deep breathing exercises');
        actions.push('Reach out to someone you trust');
        actions.push('Consider speaking with a counselor or therapist');
        break;

      case 'LOW':
        urgency = 'low';
        message = 'I hear that you\'re going through a challenging time. It\'s brave of you to recognize and express these feelings.';
        actions.push('Practice self-care activities');
        actions.push('Try relaxation techniques');
        actions.push('Consider journaling your thoughts');
        break;
    }

    // Add detected keywords context if appropriate
    if (analysis.detectedKeywords.length > 0 && urgency !== 'critical') {
      message += ' I noticed you mentioned feeling ' +
        analysis.detectedKeywords.slice(0, 2).join(' and ') +
        '. These feelings are valid, and help is available.';
    }

    return { message, urgency, actions };
  }
}