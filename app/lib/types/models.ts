// Model related types
export interface ModelConfig {
  id: string;
  name: string;
  displayName: string;
  version: string;
  provider: "google" | "openai" | "custom";
  type: "text-to-video" | "image-to-video" | "both";
  capabilities: ModelCapabilities;
  defaults: ModelDefaults;
  apiConfig: ModelAPIConfig;
}

export interface ModelCapabilities {
  maxDuration: number;
  supportedDurations: number[];
  supportedAspectRatios: string[];
  supportedResolutions: string[];
  hasAudioGeneration: boolean;
  hasImageInput: boolean;
  hasTextInput: boolean;
}

export interface ModelDefaults {
  duration: number;
  aspectRatio: string;
  resolution: string;
  generateAudio: boolean;
}

export interface ModelAPIConfig {
  endpoint: string;
  versionString: string;
  pollInterval: number;
  timeout: number;
}

export interface GenerationInput {
  modelId: string;
  mode: "text-to-video" | "image-to-video";
  prompt: string;
  imageUrl?: string;
  duration?: number;
  aspectRatio?: string;
  resolution?: string;
  generateAudio?: boolean;
  autoFix?: boolean;
  enhancePrompt?: boolean;
}

export interface ValidationResult {
  success: boolean;
  errors?: string[];
}

export type Duration = 4 | 6 | 8;
export type AspectRatio = "16:9" | "9:16";
export type Resolution = "720p" | "1080p";