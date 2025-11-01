export interface CrisisResource {
  id: string;
  name: string;
  description: string;
  phone?: string;
  text?: string;
  email?: string;
  website: string;
  available24_7: boolean;
  languages: string[];
  services: string[];
  location: string;
  crisisLevel: 'all' | 'high' | 'critical';
}

export class CrisisResources {
  private static readonly RESOURCES: CrisisResource[] = [
    // US Resources
    {
      id: 'us-988-lifeline',
      name: '988 Suicide & Crisis Lifeline',
      description: '24/7 free and confidential emotional support for people in crisis',
      phone: '988',
      website: 'https://988lifeline.org/',
      available24_7: true,
      languages: ['English', 'Spanish'],
      services: ['crisis counseling', 'suicide prevention', 'emotional support'],
      location: 'US',
      crisisLevel: 'all'
    },
    {
      id: 'us-crisis-text',
      name: 'Crisis Text Line',
      description: '24/7 crisis counseling via text message',
      text: 'Text HOME to 741741',
      website: 'https://www.crisistextline.org/',
      available24_7: true,
      languages: ['English', 'Spanish'],
      services: ['text counseling', 'crisis support', 'emotional support'],
      location: 'US',
      crisisLevel: 'all'
    },
    {
      id: 'us-nami-helpline',
      name: 'NAMI Helpline',
      description: 'Mental health information and support',
      phone: '1-800-950-6264',
      email: 'info@nami.org',
      website: 'https://www.nami.org/help',
      available24_7: false,
      languages: ['English', 'Spanish'],
      services: ['information', 'referrals', 'support groups'],
      location: 'US',
      crisisLevel: 'all'
    },
    {
      id: 'us-veterans-crisis',
      name: 'Veterans Crisis Line',
      description: 'Confidential support for veterans in crisis',
      phone: '988 (press 1)',
      text: 'Text 838255',
      website: 'https://www.veteranscrisisline.net/',
      available24_7: true,
      languages: ['English'],
      services: ['veteran support', 'crisis counseling', 'suicide prevention'],
      location: 'US',
      crisisLevel: 'all'
    },
    {
      id: 'us-trans-lifeline',
      name: 'Trans Lifeline',
      description: 'Peer support for transgender people in crisis',
      phone: '877-565-8860',
      website: 'https://translifeline.org/',
      available24_7: true,
      languages: ['English', 'Spanish'],
      services: ['transgender support', 'crisis counseling', 'peer support'],
      location: 'US',
      crisisLevel: 'all'
    },

    // UK Resources
    {
      id: 'uk-samaritans',
      name: 'Samaritans',
      description: '24/7 emotional support service',
      phone: '116 123',
      email: 'jo@samaritans.org',
      website: 'https://www.samaritans.org/',
      available24_7: true,
      languages: ['English', 'Welsh'],
      services: ['emotional support', 'listening', 'crisis counseling'],
      location: 'UK',
      crisisLevel: 'all'
    },
    {
      id: 'uk-shout',
      name: 'Shout',
      description: '24/7 text service for anyone in crisis',
      text: 'Text SHOUT to 85258',
      website: 'https://www.giveusashout.org/',
      available24_7: true,
      languages: ['English'],
      services: ['text support', 'crisis counseling', 'mental health support'],
      location: 'UK',
      crisisLevel: 'all'
    },

    // Canada Resources
    {
      id: 'canada-crisis',
      name: 'Canada Suicide Prevention Service',
      description: '24/7 crisis support service',
      phone: '988',
      website: 'https://www.canada.ca/en/public-health/services/mental-health-services/canada-suicide-prevention-service.html',
      available24_7: true,
      languages: ['English', 'French'],
      services: ['crisis support', 'suicide prevention', 'emotional support'],
      location: 'Canada',
      crisisLevel: 'all'
    },

    // Australia Resources
    {
      id: 'au-lifeline',
      name: 'Lifeline Australia',
      description: '24/7 crisis support and suicide prevention',
      phone: '13 11 14',
      website: 'https://www.lifeline.org.au/',
      available24_7: true,
      languages: ['English'],
      services: ['crisis support', 'suicide prevention', 'counseling'],
      location: 'Australia',
      crisisLevel: 'all'
    },

    // International Resources
    {
      id: 'international-befrienders',
      name: 'Befrienders Worldwide',
      description: 'International network of suicide prevention hotlines',
      website: 'https://www.befrienders.org/',
      available24_7: false,
      languages: ['Multiple'],
      services: ['international support', 'local referrals', 'crisis counseling'],
      location: 'International',
      crisisLevel: 'all'
    },
    {
      id: 'international-iasp',
      name: 'International Association for Suicide Prevention',
      description: 'Global suicide prevention resources and information',
      website: 'https://www.iasp.info/',
      available24_7: false,
      languages: ['English'],
      services: ['information', 'resources', 'prevention strategies'],
      location: 'International',
      crisisLevel: 'all'
    }
  ];

  static getResources(
    location?: string,
    crisisLevel: 'all' | 'high' | 'critical' = 'all',
    language?: string
  ): CrisisResource[] {
    let filtered = this.RESOURCES;

    // Filter by location
    if (location) {
      const locationLower = location.toLowerCase();
      filtered = filtered.filter(resource =>
        resource.location.toLowerCase().includes(locationLower) ||
        resource.location === 'International'
      );
    }

    // Filter by crisis level
    if (crisisLevel !== 'all') {
      filtered = filtered.filter(resource =>
        resource.crisisLevel === 'all' || resource.crisisLevel === crisisLevel
      );
    }

    // Filter by language
    if (language) {
      const languageLower = language.toLowerCase();
      filtered = filtered.filter(resource =>
        resource.languages.some(lang =>
          lang.toLowerCase().includes(languageLower)
        )
      );
    }

    // Sort by availability and relevance
    return filtered.sort((a, b) => {
      // Prioritize 24/7 services
      if (a.available24_7 && !b.available24_7) return -1;
      if (!a.available24_7 && b.available24_7) return 1;

      // Then by location match
      if (location && a.location === location && b.location !== location) return -1;
      if (location && b.location === location && a.location !== location) return 1;

      return 0;
    });
  }

  static getEmergencyResources(location?: string): CrisisResource[] {
    return this.getResources(location, 'critical');
  }

  static getLocalResources(location: string): CrisisResource[] {
    return this.getResources(location);
  }

  static searchResources(query: string): CrisisResource[] {
    const queryLower = query.toLowerCase();

    return this.RESOURCES.filter(resource =>
      resource.name.toLowerCase().includes(queryLower) ||
      resource.description.toLowerCase().includes(queryLower) ||
      resource.services.some(service =>
        service.toLowerCase().includes(queryLower)
      ) ||
      resource.location.toLowerCase().includes(queryLower)
    );
  }

  static getResourceById(id: string): CrisisResource | null {
    return this.RESOURCES.find(resource => resource.id === id) || null;
  }

  static getHotlineNumbers(location?: string): Array<{
    name: string;
    phone: string;
    description: string;
  }> {
    const resources = this.getResources(location);

    return resources
      .filter(resource => resource.phone)
      .map(resource => ({
        name: resource.name,
        phone: resource.phone!,
        description: resource.description
      }))
      .slice(0, 5); // Limit to top 5
  }

  static formatResourceForDisplay(resource: CrisisResource): {
    title: string;
    contact: string[];
    description: string;
    availability: string;
    services: string;
  } {
    const contact: string[] = [];

    if (resource.phone) contact.push(`📞 ${resource.phone}`);
    if (resource.text) contact.push(`💬 ${resource.text}`);
    if (resource.email) contact.push(`✉️ ${resource.email}`);
    if (resource.website) contact.push(`🌐 ${resource.website}`);

    return {
      title: resource.name,
      contact,
      description: resource.description,
      availability: resource.available24_7 ? 'Available 24/7' : 'Limited hours',
      services: resource.services.join(', ')
    };
  }
}