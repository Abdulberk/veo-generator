# Veo3 AI Video Generator - İmplementasyon Planı

## 🚀 Hızlı Başlangıç

### 1. Environment Setup
```bash
# .env.local dosyası oluştur
GATEAI_API_KEY=sk-db0c15faffdb4781b8bfe0404718bd82
GATEAI_API_URL=https://api.gateai.app/v1
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 2. Gerekli Paketler
```json
{
  "dependencies": {
    "@radix-ui/react-select": "^2.0.0",
    "@radix-ui/react-dialog": "^1.0.0",
    "@radix-ui/react-toast": "^1.1.0",
    "@radix-ui/react-progress": "^1.0.0",
    "axios": "^1.6.0",
    "zustand": "^4.4.0",
    "react-hook-form": "^7.48.0",
    "zod": "^3.22.0",
    "@hookform/resolvers": "^3.3.0",
    "framer-motion": "^10.16.0",
    "react-hot-toast": "^2.4.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.0.0",
    "date-fns": "^3.0.0",
    "react-player": "^2.13.0"
  }
}
```

## 📋 API Spesifikasyonları

### Veo3 Model Parametreleri

| Parametre | Tip | Zorunlu | Varsayılan | Seçenekler |
|-----------|-----|---------|------------|------------|
| prompt | string | ✅ | - | Max 2000 karakter |
| duration | number | ❌ | 8 | 4, 6, 8 |
| aspect_ratio | string | ❌ | "16:9" | "16:9", "9:16" |
| resolution | string | ❌ | "1080p" | "720p", "1080p" |
| generate_audio | boolean | ❌ | true | true, false |

### API Endpoints

#### 1. Create Prediction
```typescript
POST /api/predictions
Content-Type: application/json

Request Body:
{
  "modelId": "veo3",
  "input": {
    "prompt": "A beautiful sunset over mountains",
    "duration": 8,
    "aspect_ratio": "16:9",
    "resolution": "1080p",
    "generate_audio": true
  }
}

Response:
{
  "id": "prediction_id",
  "status": "starting",
  "urls": {
    "get": "https://api.gateai.app/v1/predictions/{id}",
    "cancel": "https://api.gateai.app/v1/predictions/{id}/cancel"
  }
}
```

#### 2. Get Prediction Status
```typescript
GET /api/predictions/{id}

Response:
{
  "id": "prediction_id",
  "status": "succeeded",
  "output": "https://video-url.mp4",
  "logs": "Generation logs...",
  "metrics": {
    "predict_time": 59.2
  }
}
```

## 🎨 UI Component Specifications

### 1. Main Generator Form
```tsx
// components/generator/GeneratorForm.tsx
interface GeneratorFormProps {
  models: Model[];
  onSubmit: (data: GenerationInput) => Promise<void>;
}

interface GenerationInput {
  modelId: string;
  prompt: string;
  duration: 4 | 6 | 8;
  aspectRatio: "16:9" | "9:16";
  resolution: "720p" | "1080p";
  generateAudio: boolean;
}
```

### 2. Video Display Component
```tsx
// components/video/VideoDisplay.tsx
interface VideoDisplayProps {
  prediction: Prediction | null;
  isGenerating: boolean;
  onCancel: () => void;
  onDownload: () => void;
}

// States to handle:
// 1. Idle (no video)
// 2. Generating (show progress)
// 3. Success (show video player)
// 4. Error (show error message)
```

### 3. Generation Status Component
```tsx
// components/generator/GenerationStatus.tsx
interface GenerationStatusProps {
  status: "starting" | "processing" | "succeeded" | "failed";
  logs?: string;
  progress?: number;
  estimatedTime?: number;
}

// Visual elements:
// - Animated progress bar
// - Real-time logs display
// - Estimated time remaining
// - Cancel button
```

## 🔄 Polling Implementation

```typescript
// lib/hooks/useVideoGenerator.ts
import { useState, useCallback } from 'react';

interface UseVideoGeneratorReturn {
  generate: (input: GenerationInput) => Promise<void>;
  prediction: Prediction | null;
  isGenerating: boolean;
  error: Error | null;
  cancel: () => Promise<void>;
}

export function useVideoGenerator(): UseVideoGeneratorReturn {
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [abortController, setAbortController] = useState<AbortController | null>(null);

  const generate = useCallback(async (input: GenerationInput) => {
    setIsGenerating(true);
    setError(null);
    
    const controller = new AbortController();
    setAbortController(controller);
    
    try {
      // 1. Create prediction
      const response = await fetch('/api/predictions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
        signal: controller.signal
      });
      
      const initialPrediction = await response.json();
      setPrediction(initialPrediction);
      
      // 2. Start polling
      const pollInterval = 2000; // 2 seconds
      const maxPolls = 90; // 3 minutes max
      let pollCount = 0;
      
      const poll = async () => {
        if (controller.signal.aborted) return;
        
        try {
          const statusResponse = await fetch(
            `/api/predictions/${initialPrediction.id}`,
            { signal: controller.signal }
          );
          
          const updatedPrediction = await statusResponse.json();
          setPrediction(updatedPrediction);
          
          if (updatedPrediction.status === 'succeeded') {
            setIsGenerating(false);
            return;
          }
          
          if (updatedPrediction.status === 'failed') {
            throw new Error(updatedPrediction.error || 'Generation failed');
          }
          
          if (pollCount++ < maxPolls) {
            setTimeout(poll, pollInterval);
          } else {
            throw new Error('Generation timeout');
          }
        } catch (err) {
          if (!controller.signal.aborted) {
            throw err;
          }
        }
      };
      
      setTimeout(poll, pollInterval);
      
    } catch (err) {
      setError(err as Error);
      setIsGenerating(false);
    }
  }, []);
  
  const cancel = useCallback(async () => {
    if (abortController) {
      abortController.abort();
    }
    
    if (prediction?.id) {
      await fetch(`/api/predictions/${prediction.id}/cancel`, {
        method: 'POST'
      });
    }
    
    setIsGenerating(false);
  }, [abortController, prediction]);
  
  return { generate, prediction, isGenerating, error, cancel };
}
```

## 🎯 Model Registry System

```typescript
// lib/models/registry.ts
interface ModelConfig {
  id: string;
  name: string;
  displayName: string;
  version: string;
  provider: "google";
  type: "text-to-video" | "image-to-video";
  capabilities: {
    maxDuration: number;
    supportedDurations: number[];
    supportedAspectRatios: string[];
    supportedResolutions: string[];
    hasAudioGeneration: boolean;
    hasImageInput: boolean;
  };
  defaults: {
    duration: number;
    aspectRatio: string;
    resolution: string;
    generateAudio: boolean;
  };
  apiConfig: {
    endpoint: string;
    versionString: string;
    pollInterval: number;
    timeout: number;
  };
}

// Model configurations
const models: ModelConfig[] = [
  {
    id: "veo3",
    name: "veo-3",
    displayName: "Veo 3",
    version: "google/veo-3",
    provider: "google",
    type: "text-to-video",
    capabilities: {
      maxDuration: 8,
      supportedDurations: [4, 6, 8],
      supportedAspectRatios: ["16:9", "9:16"],
      supportedResolutions: ["720p", "1080p"],
      hasAudioGeneration: true,
      hasImageInput: false
    },
    defaults: {
      duration: 8,
      aspectRatio: "16:9",
      resolution: "1080p",
      generateAudio: true
    },
    apiConfig: {
      endpoint: "/predictions",
      versionString: "google/veo-3",
      pollInterval: 2000,
      timeout: 180000
    }
  },
  // Future models can be added here
  // {
  //   id: "veo3-fast",
  //   name: "veo-3-fast",
  //   displayName: "Veo 3 Fast",
  //   ...
  // }
];

class ModelRegistry {
  private static models = new Map<string, ModelConfig>(
    models.map(model => [model.id, model])
  );
  
  static get(id: string): ModelConfig | undefined {
    return this.models.get(id);
  }
  
  static getAll(): ModelConfig[] {
    return Array.from(this.models.values());
  }
  
  static register(model: ModelConfig): void {
    this.models.set(model.id, model);
  }
  
  static validateInput(modelId: string, input: any): ValidationResult {
    const model = this.get(modelId);
    if (!model) {
      return { success: false, errors: ["Model not found"] };
    }
    
    // Validate based on model capabilities
    const errors: string[] = [];
    
    if (input.duration && !model.capabilities.supportedDurations.includes(input.duration)) {
      errors.push(`Duration must be one of: ${model.capabilities.supportedDurations.join(", ")}`);
    }
    
    if (input.aspectRatio && !model.capabilities.supportedAspectRatios.includes(input.aspectRatio)) {
      errors.push(`Aspect ratio must be one of: ${model.capabilities.supportedAspectRatios.join(", ")}`);
    }
    
    if (input.resolution && !model.capabilities.supportedResolutions.includes(input.resolution)) {
      errors.push(`Resolution must be one of: ${model.capabilities.supportedResolutions.join(", ")}`);
    }
    
    return {
      success: errors.length === 0,
      errors
    };
  }
  
  static transformInput(modelId: string, input: any): any {
    const model = this.get(modelId);
    if (!model) throw new Error("Model not found");
    
    // Apply defaults and transform for API
    return {
      prompt: input.prompt,
      duration: input.duration || model.defaults.duration,
      aspect_ratio: input.aspectRatio || model.defaults.aspectRatio,
      resolution: input.resolution || model.defaults.resolution,
      generate_audio: input.generateAudio ?? model.defaults.generateAudio
    };
  }
}

export default ModelRegistry;
```

## 🎨 UI Design System

### Color Palette
```css
:root {
  /* Primary Colors */
  --primary: #8B5CF6;        /* Purple */
  --primary-hover: #7C3AED;
  --primary-light: #A78BFA;
  
  /* Secondary Colors */
  --secondary: #10B981;       /* Green */
  --secondary-hover: #059669;
  
  /* Neutral Colors */
  --background: #FFFFFF;
  --surface: #F9FAFB;
  --border: #E5E7EB;
  --text-primary: #111827;
  --text-secondary: #6B7280;
  
  /* Dark Mode */
  --dark-background: #0F172A;
  --dark-surface: #1E293B;
  --dark-border: #334155;
  --dark-text-primary: #F1F5F9;
  --dark-text-secondary: #94A3B8;
  
  /* Status Colors */
  --success: #10B981;
  --warning: #F59E0B;
  --error: #EF4444;
  --info: #3B82F6;
}
```

### Component Styling Guide
```tsx
// Consistent button styles
const buttonVariants = {
  primary: "bg-primary hover:bg-primary-hover text-white",
  secondary: "bg-secondary hover:bg-secondary-hover text-white",
  outline: "border-2 border-primary text-primary hover:bg-primary hover:text-white",
  ghost: "hover:bg-gray-100 dark:hover:bg-gray-800",
  danger: "bg-error hover:bg-red-600 text-white"
};

// Consistent card styles
const cardStyles = "bg-surface dark:bg-dark-surface border border-border dark:border-dark-border rounded-xl p-6 shadow-sm";

// Consistent input styles
const inputStyles = "w-full px-4 py-2 border border-border dark:border-dark-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent";
```

## 📱 Responsive Design Breakpoints

```css
/* Tailwind breakpoints */
sm: 640px   /* Mobile landscape */
md: 768px   /* Tablet */
lg: 1024px  /* Desktop */
xl: 1280px  /* Large desktop */
2xl: 1536px /* Extra large */
```

### Mobile-First Layout
```tsx
<div className="container mx-auto px-4 sm:px-6 lg:px-8">
  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
    {/* Sidebar - Hidden on mobile, shown on desktop */}
    <div className="hidden lg:block lg:col-span-3">
      <ModelSelector />
      <OptionsPanel />
    </div>
    
    {/* Main content */}
    <div className="lg:col-span-9">
      {/* Mobile controls - Shown on mobile, hidden on desktop */}
      <div className="lg:hidden mb-4">
        <MobileControls />
      </div>
      
      <VideoDisplay />
      <PromptInput />
    </div>
  </div>
</div>
```

## 🔐 Security Considerations

1. **API Key Protection**
   - Never expose API key in client-side code
   - Use server-side API routes only
   - Implement rate limiting

2. **Input Validation**
   - Sanitize all user inputs
   - Validate prompt length (max 2000 chars)
   - Check for prohibited content

3. **Error Handling**
   - Never expose internal errors to users
   - Log errors server-side
   - Show user-friendly error messages

## 📈 Performance Metrics

### Target Metrics
- **First Contentful Paint**: < 1.5s
- **Time to Interactive**: < 3.5s
- **Cumulative Layout Shift**: < 0.1
- **API Response Time**: < 500ms (excluding generation)
- **Polling Efficiency**: Max 2 requests/second

### Optimization Strategies
1. **Lazy Loading**: Load video player only when needed
2. **Code Splitting**: Separate model-specific code
3. **Caching**: Cache model configurations and user preferences
4. **Debouncing**: Debounce prompt input (500ms)
5. **Request Batching**: Batch status checks when possible

## 🚦 Implementation Priority

### Phase 1 - MVP (Week 1)
- ✅ Basic UI layout
- ✅ Veo3 model integration
- ✅ Simple prompt input
- ✅ Video generation with polling
- ✅ Video display and download

### Phase 2 - Enhanced Features (Week 2)
- ⏳ All video options (duration, aspect ratio, etc.)
- ⏳ Generation history
- ⏳ Error handling and retry
- ⏳ Loading states and animations
- ⏳ Dark mode support

### Phase 3 - Advanced Features (Week 3-4)
- ⏳ Multiple model support
- ⏳ Image-to-video capability
- ⏳ Batch processing
- ⏳ User preferences storage
- ⏳ Advanced UI animations
- ⏳ Analytics and monitoring

## 🧪 Testing Strategy

### Unit Tests
```typescript
// Example test for model registry
describe('ModelRegistry', () => {
  it('should validate input correctly', () => {
    const result = ModelRegistry.validateInput('veo3', {
      prompt: 'Test prompt',
      duration: 4,
      aspectRatio: '16:9'
    });
    expect(result.success).toBe(true);
  });
  
  it('should reject invalid duration', () => {
    const result = ModelRegistry.validateInput('veo3', {
      prompt: 'Test prompt',
      duration: 10 // Invalid
    });
    expect(result.success).toBe(false);
    expect(result.errors).toContain('Duration must be one of: 4, 6, 8');
  });
});
```

### Integration Tests
```typescript
// Example E2E test
describe('Video Generation Flow', () => {
  it('should generate video successfully', async () => {
    // 1. Navigate to app
    await page.goto('/');
    
    // 2. Enter prompt
    await page.fill('[data-testid="prompt-input"]', 'A beautiful sunset');
    
    // 3. Select options
    await page.selectOption('[data-testid="duration-select"]', '4');
    
    // 4. Click generate
    await page.click('[data-testid="generate-button"]');
    
    // 5. Wait for video
    await page.waitForSelector('[data-testid="video-player"]', {
      timeout: 120000 // 2 minutes
    });
    
    // 6. Verify video is displayed
    const video = await page.$('[data-testid="video-player"] video');
    expect(video).toBeTruthy();
  });
});
```

## 📊 Monitoring & Analytics

### Key Metrics to Track
1. **Generation Success Rate**
2. **Average Generation Time**
3. **User Engagement** (prompts per session)
4. **Error Rate** by error type
5. **Model Usage** distribution
6. **Option Usage** (duration, aspect ratio, etc.)

### Implementation
```typescript
// lib/analytics.ts
export const trackEvent = (event: string, properties?: Record<string, any>) => {
  // Google Analytics, Mixpanel, or custom solution
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', event, properties);
  }
};

// Usage
trackEvent('video_generation_started', {
  model: 'veo3',
  duration: 8,
  aspectRatio: '16:9'
});
```

Bu plan, Veo3 AI Video Generator uygulamasının tüm teknik detaylarını ve implementasyon adımlarını içeriyor. Modular yapı sayesinde yeni modeller ve özellikler kolayca eklenebilir.