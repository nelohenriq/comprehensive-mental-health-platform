# System Architecture Design: Comprehensive Mental Health Platform

## Executive Summary

This document outlines the complete system architecture for the Comprehensive Mental Health Platform, designed to provide privacy-first, AI-powered mental health support with multi-provider AI integration and user-owned API keys.

## 1. System Overview

### Architecture Principles
- **Privacy-First**: Local storage with optional cloud sync
- **Modular Design**: Independent services and components
- **Scalable**: Microservices architecture with containerization
- **Secure**: End-to-end encryption and compliance-ready
- **User-Controlled**: Users own their AI provider costs and data

### Technology Stack
```
Frontend:    Next.js 14+ (App Router), React 18+, TypeScript
Backend:     Next.js API Routes, tRPC
Database:    PostgreSQL (cloud) + IndexedDB (local)
Cache:       Redis
AI:          Multi-provider (OpenAI, Anthropic, Google Gemini, etc.)
Deployment:  Docker + Kubernetes
Monitoring:  Comprehensive logging and analytics
```

## 2. System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                    CLIENT LAYER (Browser/PWA)                       │
├─────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐     │
│  │   React App     │  │   PWA Shell     │  │ Service Worker  │     │
│  │   (Next.js)     │  │   (Offline)     │  │   (Caching)     │     │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘     │
│           │                        │                     │         │
│           └────────────────────────┼─────────────────────┘         │
│                                    │                               │
├─────────────────────────────────────────────────────────────────────┤
│                   HYBRID STORAGE LAYER                              │
├─────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐     │
│  │   IndexedDB     │  │   Sync Engine   │  │   Encryption    │     │
│  │   (Local)       │  │   (Conflict     │  │   (E2E)         │     │
│  │                 │  │    Resolution)  │  │                 │     │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘     │
│           │                        │                     │         │
│           └────────────────────────┼─────────────────────┘         │
│                                    │                               │
├─────────────────────────────────────────────────────────────────────┤
│                    API GATEWAY LAYER                                │
├─────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐     │
│  │   Next.js API   │  │   tRPC Router   │  │   Auth Service   │     │
│  │   Routes        │  │   (Type Safe)   │  │   (NextAuth)     │     │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘     │
│           │                        │                     │         │
│           └────────────────────────┼─────────────────────┘         │
│                                    │                               │
├─────────────────────────────────────────────────────────────────────┤
│                   BUSINESS LOGIC LAYER                              │
├─────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐     │
│  │ AI Provider     │  │ Crisis Detection│  │ Exercise Gen    │     │
│  │ Manager         │  │ Service         │  │ Service         │     │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘     │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐     │
│  │ Journal Service │  │ Mood Analytics  │  │ Privacy Manager │     │
│  │                 │  │ Service         │  │                 │     │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘     │
│                                    │                               │
├─────────────────────────────────────────────────────────────────────┤
│                    DATA PERSISTENCE LAYER                           │
├─────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐     │
│  │   PostgreSQL    │  │     Redis       │  │   File Storage  │     │
│  │   (Prisma ORM)  │  │   (Cache)       │  │   (Encrypted)   │     │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘     │
│                                    │                               │
├─────────────────────────────────────────────────────────────────────┤
│                   EXTERNAL INTEGRATIONS                             │
├─────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐     │
│  │ OpenAI API      │  │ Anthropic API   │  │ Google Gemini   │     │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘     │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐     │
│  │ Groq API        │  │ Grok API        │  │ OpenRouter API  │     │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘     │
│  ┌─────────────────┐  ┌─────────────────┐                         │
│  │ Z.ai API        │  │ Cohere API      │                         │
│  └─────────────────┘  └─────────────────┘                         │
└─────────────────────────────────────────────────────────────────────┘
```

## 3. Component Architecture

### Frontend Architecture

#### Page Structure (Next.js App Router)
```
app/
├── layout.tsx              # Root layout with providers
├── page.tsx                # Landing/dashboard redirect
├── globals.css             # Global styles
├── (auth)/
│   ├── signin/page.tsx     # Authentication pages
│   └── signup/page.tsx
├── dashboard/
│   ├── page.tsx            # Main dashboard
│   ├── mood/page.tsx       # Mood tracking
│   ├── journal/page.tsx    # Voice journal
│   ├── breathing/page.tsx  # Breathing exercises
│   ├── cbt/page.tsx        # CBT tools
│   └── profile/page.tsx    # User profile
└── api/
    ├── auth/[...nextauth]/route.ts
    ├── mood/route.ts
    ├── journal/route.ts
    └── ai/route.ts
```

#### Component Architecture
```
components/
├── ui/                     # Reusable UI components
│   ├── button.tsx
│   ├── input.tsx
│   ├── card.tsx
│   └── modal.tsx
├── layout/
│   ├── header.tsx
│   ├── navigation.tsx
│   └── footer.tsx
├── features/
│   ├── ai-coach/
│   │   ├── chat-interface.tsx
│   │   ├── personality-selector.tsx
│   │   └── provider-selector.tsx
│   ├── journal/
│   │   ├── entry-form.tsx
│   │   ├── entry-list.tsx
│   │   └── voice-input.tsx
│   ├── mood/
│   │   ├── mood-logger.tsx
│   │   ├── mood-chart.tsx
│   │   └── mood-insights.tsx
│   ├── crisis/
│   │   ├── crisis-modal.tsx
│   │   ├── crisis-analytics.tsx
│   │   └── resource-list.tsx
│   └── exercises/
│       ├── exercise-generator.tsx
│       ├── breathing-visualizer.tsx
│       └── thought-record-form.tsx
├── providers/
│   ├── session-provider.tsx
│   ├── theme-provider.tsx
│   └── ai-provider.tsx
└── hooks/
    ├── useLocalStorage.ts
    ├── useAI.ts
    └── useCrisisDetection.ts
```

### Data Flow Architecture

#### State Management
```
Context Providers (Top Level)
├── SessionProvider (NextAuth)
├── ThemeProvider (Dark/Light mode)
├── AIProvider (Provider management)
└── PrivacyProvider (Consent management)

Component State (Local)
├── useState for UI state
├── useReducer for complex state
└── Custom hooks for business logic
```

#### Data Synchronization
```
Local Storage (IndexedDB)
├── User preferences
├── Journal entries (encrypted)
├── Mood logs
├── Exercise history
└── AI conversations (cached)

Cloud Sync (Optional)
├── User profile data
├── Analytics (anonymized)
├── Backup data
└── Cross-device sync
```

## 4. Database Schema Design

### Prisma Schema

```prisma
// NextAuth.js required models
model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String?
  access_token      String?
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String?
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
  @@map("accounts")
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("sessions")
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
  @@map("verification_tokens")
}

// Core application models
model User {
  id                String   @id @default(cuid())
  email             String   @unique
  name              String?
  image             String?
  consentLevel      String   @default("ESSENTIAL")
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  // Auth relations
  accounts          Account[]
  sessions          Session[]

  // App relations
  profile           UserProfile?
  journalEntries    JournalEntry[]
  moodLogs          MoodLog[]
  exercises         Exercise[]
  exerciseFeedback  ExerciseFeedback[]
  thoughtRecords    CBTThoughtRecord[]
  plans             PlanHistory[]
  achievements      UserAchievement[]
  aiProviders       UserAiProvider[]
  aiSettings        UserAiSettings?

  @@map("users")
}

model UserProfile {
  id               String   @id @default(cuid())
  userId           String   @unique
  age              Int?
  location         String?
  sleepHours       Int?
  caffeineIntake   String?
  diagnosedDisorders String?
  copingStyles     String?
  learningModality String?
  workEnvironment  String?
  accessToNature   String?
  activityLevel    String?
  bio              String?
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt

  user             User     @relation(fields: [userId], references: [id])

  @@map("user_profiles")
}

model JournalEntry {
  id           String   @id @default(cuid())
  userId       String
  title        String?
  content      String   // Encrypted in application layer
  mood         String?
  tags         String   // JSON string of tag array
  isEncrypted  Boolean  @default(true)
  aiInsights   String?  // AI analysis of entry
  voiceUrl     String?  // Audio file URL if voice entry
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  user         User     @relation(fields: [userId], references: [id])

  @@map("journal_entries")
}

model MoodLog {
  id               String   @id @default(cuid())
  userId           String
  mood             String
  intensity        Int      @default(5) // 1-10 scale
  notes            String?
  triggers         String   // JSON string of trigger array
  physicalSymptoms String   // JSON string of symptom array
  energyLevel      Int?     // 1-10 scale
  sleepQuality     Int?     // 1-10 scale
  anxietyLevel     Int?     // 1-10 scale
  loggedAt         DateTime @default(now())
  createdAt        DateTime @default(now())

  user             User     @relation(fields: [userId], references: [id])

  @@map("mood_logs")
}

model Exercise {
  id               String   @id @default(cuid())
  userId           String
  title            String
  description      String
  category         String
  steps            String   // JSON string of step array
  durationMinutes  Int
  difficulty       String   @default("medium")
  tags             String   // JSON string of tag array
  isCompleted      Boolean  @default(false)
  completedAt      DateTime?
  createdAt        DateTime @default(now())

  user             User     @relation(fields: [userId], references: [id])
  feedback         ExerciseFeedback[]

  @@map("exercises")
}

model ExerciseFeedback {
  id          String   @id @default(cuid())
  userId      String
  exerciseId  String
  rating      Int      // 1-5 stars
  helpfulness Int?     // 1-10 scale
  easeOfUse   Int?     // 1-10 scale
  wouldRepeat Boolean?
  comments    String?
  createdAt   DateTime @default(now())

  user        User     @relation(fields: [userId], references: [id])
  exercise    Exercise @relation(fields: [exerciseId], references: [id])

  @@map("exercise_feedback")
}

model CBTThoughtRecord {
  id                 String   @id @default(cuid())
  userId             String
  situation          String
  negativeThought    String
  emotions           String?  // JSON string of emotion objects
  cognitiveDistortions String // JSON string of distortion array
  challenge          String
  alternativeThought String
  outcome            String
  createdAt          DateTime @default(now())

  user               User     @relation(fields: [userId], references: [id])

  @@map("cbt_thought_records")
}

model PlanHistory {
  id                 String   @id @default(cuid())
  userId             String
  userInput          String
  generatedExercises String   // JSON string of exercise objects
  sources            String?  // JSON string of source objects
  createdAt          DateTime @default(now())

  user               User     @relation(fields: [userId], references: [id])

  @@map("plan_history")
}

model CrisisResource {
  id          String   @id @default(cuid())
  country     String
  language    String
  name        String
  phone       String
  phoneDisplay String
  description String?
  category    String   // hotline, text, chat, website, emergency
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())

  @@map("crisis_resources")
}

// AI Provider Management
model UserAiProvider {
  id           String   @id @default(cuid())
  userId       String
  providerType String   // 'openai', 'anthropic', 'gemini', 'groq', 'grok', etc.
  providerName String
  apiKey       String   // Encrypted
  baseUrl      String?
  model        String?
  maxTokens    Int?
  temperature  Float?
  isEnabled    Boolean  @default(true)
  priority     Int      @default(0)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  user         User     @relation(fields: [userId], references: [id])

  @@map("user_ai_providers")
}

model UserAiSettings {
  id               String   @id @default(cuid())
  userId           String   @unique
  favoriteProvider String?
  defaultModel     String?
  defaultMaxTokens Int?
  defaultTemperature Float?
  enableStreaming  Boolean  @default(true)
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt

  user             User     @relation(fields: [userId], references: [id])

  @@map("user_ai_settings")
}

// Achievement system
model UserAchievement {
  id          String   @id @default(cuid())
  userId      String
  type        String   // 'streak', 'completion', 'milestone', etc.
  title       String
  description String
  icon        String?
  unlockedAt  DateTime @default(now())

  user        User     @relation(fields: [userId], references: [id])

  @@map("user_achievements")
}
```

## 5. API Architecture

### API Routes Structure

```
api/
├── auth/
│   ├── [...nextauth]/route.ts    # NextAuth.js handlers
│   └── callback/route.ts         # OAuth callbacks
├── user/
│   ├── profile/route.ts          # User profile CRUD
│   └── settings/route.ts         # User settings
├── journal/
│   ├── route.ts                  # Journal entries CRUD
│   └── [id]/route.ts             # Individual entry operations
├── mood/
│   ├── route.ts                  # Mood logs CRUD
│   └── analytics/route.ts        # Mood analytics
├── ai/
│   ├── providers/route.ts        # AI provider management
│   ├── chat/route.ts             # AI conversations
│   ├── exercises/route.ts        # Exercise generation
│   └── crisis/route.ts           # Crisis detection
├── exercises/
│   ├── route.ts                  # Exercise CRUD
│   ├── feedback/route.ts         # Exercise feedback
│   └── categories/route.ts       # Exercise categories
├── cbt/
│   ├── thought-records/route.ts  # CBT thought records
│   └── tools/route.ts            # CBT tools
└── crisis/
    ├── resources/route.ts        # Crisis resources
    └── detection/route.ts        # Crisis detection
```

### API Response Standards

#### Success Response
```typescript
{
  success: true,
  data: T,
  message?: string,
  timestamp: string
}
```

#### Error Response
```typescript
{
  success: false,
  error: {
    code: string,
    message: string,
    details?: any
  },
  timestamp: string
}
```

#### Pagination Response
```typescript
{
  success: true,
  data: T[],
  pagination: {
    page: number,
    limit: number,
    total: number,
    totalPages: number,
    hasNext: boolean,
    hasPrev: boolean
  },
  timestamp: string
}
```

## 6. Security Architecture

### Data Encryption Layers

#### Client-Side Encryption
- **User Data**: AES-256 encryption for sensitive journal entries
- **API Keys**: Encrypted storage with user-specific keys
- **Local Storage**: Encrypted IndexedDB with device-specific keys

#### Transport Layer Security
- **HTTPS Only**: All communications over TLS 1.3
- **API Authentication**: JWT tokens with refresh rotation
- **Rate Limiting**: Progressive rate limiting by endpoint

#### Server-Side Security
- **Input Validation**: Comprehensive input sanitization
- **SQL Injection Prevention**: Parameterized queries via Prisma
- **XSS Protection**: Content Security Policy headers
- **CSRF Protection**: SameSite cookies and CSRF tokens

### Privacy Controls

#### Consent Management
```typescript
enum ConsentLevel {
  ESSENTIAL = 'essential',    // Basic functionality only
  ENHANCED = 'enhanced',      // Analytics and personalization
  COMPLETE = 'complete'       // All features including AI learning
}
```

#### Data Minimization
- **Essential Data Only**: Collect only necessary user data
- **Anonymized Analytics**: Aggregated data without personal identifiers
- **User Data Export**: Complete data portability
- **Right to Deletion**: Full data deletion on request

### Compliance Architecture

#### GDPR Compliance
- **Data Processing Agreement**: Clear data usage terms
- **Consent Management**: Granular privacy controls
- **Data Portability**: Export user data in standard formats
- **Right to Deletion**: Complete data removal capabilities

#### HIPAA Compliance (Healthcare Features)
- **Business Associate Agreement**: Required for healthcare integrations
- **Audit Trails**: Comprehensive logging of data access
- **Data Encryption**: End-to-end encryption for PHI
- **Breach Notification**: Automated breach detection and reporting

## 7. Deployment Architecture

### Containerization Strategy

#### Docker Configuration
```dockerfile
# Multi-stage build for optimization
FROM node:18-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine AS builder
WORKDIR /app
COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/package.json ./
CMD ["npm", "start"]
```

#### Kubernetes Deployment
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: mental-health-platform
spec:
  replicas: 3
  selector:
    matchLabels:
      app: mental-health-platform
  template:
    metadata:
      labels:
        app: mental-health-platform
    spec:
      containers:
      - name: app
        image: mental-health-platform:latest
        ports:
        - containerPort: 3000
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: db-secret
              key: url
        - name: REDIS_URL
          valueFrom:
            secretKeyRef:
              name: redis-secret
              key: url
```

### Infrastructure Components

#### Database Layer
- **Primary Database**: PostgreSQL 15+ with connection pooling
- **Read Replicas**: For analytics and reporting
- **Backup Strategy**: Daily backups with point-in-time recovery
- **Migration Strategy**: Prisma migrations with rollback capability

#### Caching Layer
- **Redis Cluster**: For session management and API caching
- **Cache Strategies**: 
  - Session data: 24-hour TTL
  - API responses: 5-minute TTL
  - User preferences: 1-hour TTL

#### File Storage
- **Encrypted Storage**: AWS S3 or equivalent with client-side encryption
- **Access Control**: Pre-signed URLs with expiration
- **Backup**: Cross-region replication

### Monitoring and Observability

#### Application Monitoring
- **Error Tracking**: Sentry for error monitoring
- **Performance Monitoring**: New Relic or DataDog
- **User Analytics**: Plausible (privacy-focused) or Mixpanel

#### Infrastructure Monitoring
- **Container Monitoring**: Prometheus + Grafana
- **Log Aggregation**: ELK stack or similar
- **Alerting**: PagerDuty integration for critical issues

#### Security Monitoring
- **Intrusion Detection**: Fail2Ban for brute force protection
- **Compliance Monitoring**: Automated compliance checks
- **Audit Logging**: Comprehensive audit trails

## 8. Performance Optimization

### Frontend Optimization
- **Code Splitting**: Route-based and component-based splitting
- **Image Optimization**: Next.js Image component with WebP
- **Bundle Analysis**: Webpack Bundle Analyzer integration
- **Caching Strategy**: Service Worker for offline functionality

### Backend Optimization
- **API Caching**: Redis caching for frequently accessed data
- **Database Optimization**: Query optimization and indexing
- **Connection Pooling**: Efficient database connection management
- **Background Jobs**: Queue system for heavy computations

### AI Integration Optimization
- **Streaming Responses**: Real-time AI responses for better UX
- **Provider Failover**: Automatic switching between AI providers
- **Caching AI Responses**: Reduce API costs and improve speed
- **Batch Processing**: Efficient handling of multiple requests

## 9. Scalability Considerations

### Horizontal Scaling
- **Application Layer**: Kubernetes HPA based on CPU/memory
- **Database Layer**: Read replicas for read-heavy operations
- **Cache Layer**: Redis cluster for distributed caching

### Vertical Scaling
- **Resource Limits**: Configurable resource allocation
- **Auto-scaling**: Based on traffic patterns and usage
- **Cost Optimization**: Right-sizing instances based on load

### Global Distribution
- **CDN Integration**: Cloudflare or AWS CloudFront
- **Regional Deployments**: Multi-region deployment for global users
- **Data Localization**: Regional data storage for compliance

## 10. Development Workflow

### CI/CD Pipeline
```yaml
# GitHub Actions example
name: CI/CD Pipeline
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
    - name: Install dependencies
      run: npm ci
    - name: Run tests
      run: npm run test
    - name: Build application
      run: npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
    - name: Deploy to production
      run: # Deployment commands
```

### Development Environment
- **Local Development**: Docker Compose for full stack
- **Testing Environment**: Staging environment matching production
- **Code Quality**: ESLint, Prettier, TypeScript strict mode
- **Testing Strategy**: Unit, integration, and E2E testing

### Version Control Strategy
- **Git Flow**: Main branch for production, develop for integration
- **Feature Branches**: Feature-specific branches with PR reviews
- **Release Tags**: Semantic versioning for releases
- **Documentation**: Auto-generated API docs and component documentation

## Conclusion

This system architecture provides a solid foundation for the Comprehensive Mental Health Platform, balancing technical excellence with user privacy and operational scalability. The modular design allows for iterative development while maintaining system integrity and security.

**Key Architecture Benefits:**
- **Privacy-First**: Local storage with optional cloud sync
- **Scalable**: Microservices architecture with containerization
- **Secure**: End-to-end encryption and compliance-ready
- **Flexible**: Multi-provider AI integration with user control
- **Maintainable**: Modular design with clear separation of concerns

**Next Steps:**
1. Begin implementation with core authentication and database setup
2. Implement basic journaling and mood tracking features
3. Add AI provider integration and basic chat functionality
4. Iterate based on user feedback and performance metrics

**System Design Complete**: Architecture designed and ready for implementation.