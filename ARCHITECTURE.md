# Veo3 AI Video Generator - Sistem Mimarisi

## 📋 Genel Bakış

Veo3 AI Video Generator, Google'ın Veo3 modelini kullanarak kullanıcıların text prompt'larından video oluşturmasını sağlayan enterprise seviye bir web uygulamasıdır.

## 🏗️ Teknoloji Stack

- **Frontend**: Next.js 16, React 19, TypeScript 5
- **Styling**: Tailwind CSS v4, Framer Motion
- **State Management**: Zustand / React Context
- **API Client**: Axios / Native Fetch with interceptors
- **Video Player**: React Player / Native HTML5
- **UI Components**: Radix UI / Shadcn UI
- **Form Handling**: React Hook Form + Zod
- **Notifications**: React Hot Toast

## 📁 Proje Yapısı

```
veo/
├── app/
│   ├── api/
│   │   ├── predictions/
│   │   │   ├── route.ts          # POST /api/predictions
│   │   │   └── [id]/
│   │   │       └── route.ts      # GET /api/predictions/[id]
│   │   └── models/
│   │       └── route.ts          # GET /api/models
│   ├── components/
│   │   ├── ui/                   # Temel UI bileşenleri
│   │   │   ├── Button.tsx
│   │   │   ├── Select.tsx
│   │   │   ├── Textarea.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Skeleton.tsx
│   │   │   └── Toast.tsx
│   │   ├── video/
│   │   │   ├── VideoPlayer.tsx
│   │   │   ├── VideoControls.tsx
│   │   │   └── VideoThumbnail.tsx
│   │   ├── generator/
│   │   │   ├── GeneratorForm.tsx
│   │   │   ├── PromptInput.tsx
│   │   │   ├── ModelSelector.tsx
│   │   │   ├── OptionsPanel.tsx
│   │   │   └── GenerationStatus.tsx
│   │   └── layout/
│   │       ├── Header.tsx
│   │       ├── Footer.tsx
│   │       └── Sidebar.tsx
│   ├── lib/
│   │   ├── api/
│   │   │   ├── client.ts         # API client configuration
│   │   │   ├── endpoints.ts      # API endpoint definitions
│   │   │   └── interceptors.ts   # Request/Response interceptors
│   │   ├── models/
│   │   │   ├── base.ts           # Base model interface
│   │   │   ├── veo3.ts           # Veo3 model implementation
│   │   │   ├── veo3-fast.ts      # Veo3 Fast implementation
│   │   │   └── registry.ts       # Model registry
│   │   ├── services/
│   │   │   ├── prediction.ts     # Prediction service
│   │   │   ├── polling.ts        # Polling service
│   │   │   └── storage.ts        # Local storage service
│   │   ├── hooks/
│   │   │   ├── useVideoGenerator.ts
│   │   │   ├── usePolling.ts
│   │   │   └── useModels.ts
│   │   ├── utils/
│   │   │   ├── validators.ts     # Zod schemas
│   │   │   ├── formatters.ts
│   │   │   └── constants.ts
│   │   └── types/
│   │       ├── api.ts            # API types
│   │       ├── models.ts         # Model types
│   │       └── ui.ts             # UI component types
│   ├── store/
│   │   ├── videoStore.ts         # Zustand store
│   │   └── types.ts
│   ├── styles/
│   │   ├── globals.css
│   │   └── animations.css
│   ├── page.tsx                  # Ana sayfa
│   └── layout.tsx                # Root layout
├── public/
│   └── assets/
├── .env.local                    # Environment variables
├── next.config.ts
├── tailwind.config.ts
└── package.json
```

## 🔧 Core Modüller

### 1. Model Registry System

```typescript
// lib/models/base.ts
interface BaseModel {
  id: string;
  name: string;
  version: string;
  provider: 'google' | 'openai' | 'custom';
  type: 'text-to-video' | 'image-to-video';
  capabilities: ModelCapabilities;
  apiConfig: APIConfig;
  validate(input: any): ValidationResult;
  transform(input: any): any;
}

interface ModelCapabilities {
  maxDuration: number;
  supportedDurations: number[];
  supportedAspectRatios: string[];
  supportedResolutions: string[];
  hasAudioGeneration: boolean;
  hasImageInput: boolean;
}

interface APIConfig {
  endpoint: string;
  method: 'POST' | 'GET';
  headers?: Record<string, string>;
  pollInterval: number;
  timeout: number;
}
```

### 2. Prediction Service

```typescript
// lib/services/prediction.ts
interface PredictionService {
  create(modelId: string, input: any): Promise<Prediction>;
  get(id: string): Promise<Prediction>;
  cancel(id: string): Promise<void>;
  poll(id: string, options: PollOptions): Observable<Prediction>;
}

interface Prediction {
  id: string;
  model: string;
  status: 'starting' | 'processing' | 'succeeded' | 'failed' | 'canceled';
  input: any;
  output?: string;
  error?: string;
  logs?: string;
  metrics?: {
    predict_time?: number;
  };
  created_at: string;
  started_at?: string;
  completed_at?: string;
  urls: {
    get: string;
    cancel: string;
  };
}
```

### 3. Polling Mechanism

```typescript
// lib/services/polling.ts
class PollingService {
  private pollInterval: number = 2000; // 2 saniye
  private maxRetries: number = 60; // Max 2 dakika
  
  async pollPrediction(
    id: string,
    onUpdate: (prediction: Prediction) => void,
    onComplete: (prediction: Prediction) => void,
    onError: (error: Error) => void
  ): Promise<void> {
    let retries = 0;
    
    const poll = async () => {
      try {
        const prediction = await predictionService.get(id);
        onUpdate(prediction);
        
        if (prediction.status === 'succeeded') {
          onComplete(prediction);
          return;
        }
        
        if (prediction.status === 'failed' || prediction.status === 'canceled') {
          onError(new Error(prediction.error || 'Generation failed'));
          return;
        }
        
        if (retries++ < this.maxRetries) {
          setTimeout(poll, this.pollInterval);
        } else {
          onError(new Error('Polling timeout'));
        }
      } catch (error) {
        onError(error as Error);
      }
    };
    
    poll();
  }
}
```

## 🎨 UI/UX Tasarım Prensipleri

### Ana Sayfa Layout

```
┌─────────────────────────────────────────────────────────┐
│                     Header (Logo, Nav)                   │
├─────────────────┬───────────────────────────────────────┤
│                 │                                        │
│  Model Selector │         Video Preview Area            │
│                 │                                        │
├─────────────────┤         (Video Player or             │
│                 │          Generation Status)           │
│  Options Panel  │                                        │
│   - Duration    │                                        │
│   - Aspect      ├────────────────────────────────────────┤
│   - Resolution  │                                        │
│   - Audio       │         Prompt Input Area              │
│                 │                                        │
├─────────────────┴────────────────────────────────────────┤
│                    Generation History                     │
└─────────────────────────────────────────────────────────┘
```

### Component Hiyerarşisi

```
<App>
  <Header />
  <main>
    <GeneratorContainer>
      <ModelSelector models={models} />
      <VideoGeneratorForm>
        <PromptInput />
        <OptionsPanel>
          <DurationSelect />
          <AspectRatioSelect />
          <ResolutionSelect />
          <AudioToggle />
        </OptionsPanel>
        <GenerateButton />
      </VideoGeneratorForm>
      <VideoDisplay>
        <VideoPlayer /> or <GenerationStatus />
      </VideoDisplay>
    </GeneratorContainer>
    <GenerationHistory />
  </main>
  <Footer />
</App>
```

## 🔌 API Entegrasyonu

### Environment Variables

```env
# .env.local
GATEAI_API_KEY=sk-db0c15faffdb4781b8bfe0404718bd82
GATEAI_API_URL=https://api.gateai.app/v1
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### API Route Handlers

```typescript
// app/api/predictions/route.ts
export async function POST(request: Request) {
  const body = await request.json();
  const { modelId, input } = body;
  
  // Model registry'den model al
  const model = ModelRegistry.get(modelId);
  
  // Input validation
  const validation = model.validate(input);
  if (!validation.success) {
    return NextResponse.json(
      { error: validation.errors },
      { status: 400 }
    );
  }
  
  // Transform input
  const transformedInput = model.transform(input);
  
  // API call
  const response = await fetch(`${process.env.GATEAI_API_URL}/predictions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.GATEAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      version: model.version,
      input: transformedInput,
    }),
  });
  
  const prediction = await response.json();
  
  // Store in database or cache
  await storePrediction(prediction);
  
  return NextResponse.json(prediction);
}
```

## 🚀 Özellikler

### Temel Özellikler
- ✅ Text-to-video generation
- ✅ Multiple model support (Veo3, Veo3-fast, Veo3.1)
- ✅ Customizable video options (duration, aspect ratio, resolution)
- ✅ Audio generation toggle
- ✅ Real-time generation status
- ✅ Video preview and download
- ✅ Generation history
- ✅ Dark mode support

### Gelişmiş Özellikler (Roadmap)
- 🔄 Image-to-video generation
- 🔄 Batch processing
- 🔄 Video editing tools
- 🔄 Custom presets
- 🔄 User accounts and quotas
- 🔄 Webhook notifications
- 🔄 API rate limiting
- 🔄 Analytics dashboard

## 🛡️ Güvenlik

### API Key Koruması
- Server-side only API calls
- Environment variable encryption
- Rate limiting per IP
- Request validation

### Input Sanitization
- Zod schema validation
- XSS protection
- SQL injection prevention (if DB used)
- File upload restrictions

## 📊 State Management

### Zustand Store Structure

```typescript
interface VideoStore {
  // State
  currentPrediction: Prediction | null;
  predictions: Prediction[];
  isGenerating: boolean;
  selectedModel: string;
  options: GenerationOptions;
  
  // Actions
  startGeneration: (input: GenerationInput) => Promise<void>;
  cancelGeneration: (id: string) => Promise<void>;
  updateOptions: (options: Partial<GenerationOptions>) => void;
  selectModel: (modelId: string) => void;
  loadPredictions: () => Promise<void>;
}
```

## 🎯 Performance Optimizasyonları

1. **Code Splitting**: Dynamic imports for heavy components
2. **Image/Video Optimization**: Next.js Image component, lazy loading
3. **Caching**: SWR for API calls, localStorage for user preferences
4. **Bundle Size**: Tree shaking, component lazy loading
5. **SEO**: Meta tags, Open Graph, structured data

## 🧪 Test Stratejisi

- Unit Tests: Jest + React Testing Library
- Integration Tests: Cypress
- API Tests: Supertest
- Performance Tests: Lighthouse CI

## 📝 Deployment

### Vercel Deployment
```yaml
Build Command: npm run build
Output Directory: .next
Install Command: npm ci
Environment Variables: Set in Vercel dashboard
```

### Docker Support
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 🔄 CI/CD Pipeline

1. **Pre-commit**: Husky + lint-staged
2. **GitHub Actions**: Test, build, deploy
3. **Monitoring**: Sentry, Vercel Analytics
4. **Logging**: Winston, LogRocket

Bu mimari, modular, ölçeklenebilir ve yeni model/özellik eklemelerini kolaylaştıran bir yapı sunuyor.