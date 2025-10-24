import { 
  ModelConfig, 
  ValidationResult, 
  GenerationInput 
} from "@/app/lib/types/models";
import { PredictionInput } from "@/app/lib/types/api";

// Veo3 model configuration
const veo3Config: ModelConfig = {
  id: "veo3",
  name: "veo-3",
  displayName: "Veo 3",
  version: "google/veo-3",
  provider: "google",
  type: "both",
  capabilities: {
    maxDuration: 8,
    supportedDurations: [4, 6, 8],
    supportedAspectRatios: ["16:9", "9:16"],
    supportedResolutions: ["720p", "1080p"],
    hasAudioGeneration: true,
    hasImageInput: true,
    hasTextInput: true
  },
  defaults: {
    duration: 8,
    aspectRatio: "16:9",
    resolution: "1080p",
    generateAudio: true
  },
  apiConfig: {
    endpoint: "/fal-ai/veo3",
    versionString: "google/veo-3",
    pollInterval: 2000,
    timeout: 180000 // 3 minutes
  }
};

// Veo3.1 model configuration
const veo31Config: ModelConfig = {
  id: "veo3.1",
  name: "veo-3.1",
  displayName: "Veo 3.1",
  version: "google/veo-3.1",
  provider: "google",
  type: "both",
  capabilities: {
    maxDuration: 8,
    supportedDurations: [4, 6, 8],
    supportedAspectRatios: ["16:9", "9:16"],
    supportedResolutions: ["720p", "1080p"],
    hasAudioGeneration: true,
    hasImageInput: true,
    hasTextInput: true
  },
  defaults: {
    duration: 8,
    aspectRatio: "16:9",
    resolution: "720p", // Veo 3.1 default resolution
    generateAudio: true
  },
  apiConfig: {
    endpoint: "/fal-ai/veo3.1",
    versionString: "google/veo-3.1",
    pollInterval: 2000,
    timeout: 180000 // 3 minutes
  }
};

// Veo3.1 Fast model configuration
const veo31FastConfig: ModelConfig = {
  id: "veo3.1-fast",
  name: "veo-3.1-fast",
  displayName: "Veo 3.1 Fast",
  version: "google/veo-3.1-fast",
  provider: "google",
  type: "both",
  capabilities: {
    maxDuration: 8,
    supportedDurations: [4, 6, 8],
    supportedAspectRatios: ["16:9", "9:16"],
    supportedResolutions: ["720p"], // Fast version only supports 720p
    hasAudioGeneration: true,
    hasImageInput: true,
    hasTextInput: true
  },
  defaults: {
    duration: 8,
    aspectRatio: "16:9",
    resolution: "720p",
    generateAudio: true
  },
  apiConfig: {
    endpoint: "/fal-ai/veo3.1/fast",
    versionString: "google/veo-3.1-fast",
    pollInterval: 1500, // Faster polling for fast model
    timeout: 120000 // 2 minutes - faster generation
  }
};

class ModelRegistry {
  private static models = new Map<string, ModelConfig>([
    [veo3Config.id, veo3Config],
    [veo31Config.id, veo31Config],
    [veo31FastConfig.id, veo31FastConfig],
  ]);

  static get(id: string): ModelConfig | undefined {
    return this.models.get(id);
  }

  static getAll(): ModelConfig[] {
    return Array.from(this.models.values());
  }

  static register(model: ModelConfig): void {
    this.models.set(model.id, model);
  }

  static validateInput(modelId: string, input: Partial<GenerationInput>): ValidationResult {
    const model = this.get(modelId);
    if (!model) {
      return { success: false, errors: ["Model not found"] };
    }

    const errors: string[] = [];

    // Validate prompt
    if (!input.prompt || input.prompt.trim().length === 0) {
      errors.push("Prompt is required");
    } else if (input.prompt.length > 2000) {
      errors.push("Prompt must be less than 2000 characters");
    }

    // Validate image URL for image-to-video mode
    if (input.mode === "image-to-video") {
      if (!input.imageUrl || input.imageUrl.trim().length === 0) {
        errors.push("Image URL is required for image-to-video mode");
      } else if (!input.imageUrl.match(/^https?:\/\/.+/)) {
        errors.push("Please provide a valid image URL");
      }
    }

    // Validate duration
    if (input.duration !== undefined) {
      if (!model.capabilities.supportedDurations.includes(input.duration)) {
        errors.push(`Duration must be one of: ${model.capabilities.supportedDurations.join(", ")} seconds`);
      }
    }

    // Validate aspect ratio
    if (input.aspectRatio !== undefined) {
      if (!model.capabilities.supportedAspectRatios.includes(input.aspectRatio)) {
        errors.push(`Aspect ratio must be one of: ${model.capabilities.supportedAspectRatios.join(", ")}`);
      }
    }

    // Validate resolution
    if (input.resolution !== undefined) {
      if (!model.capabilities.supportedResolutions.includes(input.resolution)) {
        errors.push(`Resolution must be one of: ${model.capabilities.supportedResolutions.join(", ")}`);
      }
    }

    return {
      success: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined
    };
  }

  static transformInput(modelId: string, input: Partial<GenerationInput>): PredictionInput {
    const model = this.get(modelId);
    if (!model) {
      throw new Error("Model not found");
    }

    // Transform to API format with underscores
    return {
      prompt: input.prompt || "",
      duration: input.duration ?? model.defaults.duration,
      aspect_ratio: input.aspectRatio ?? model.defaults.aspectRatio,
      resolution: input.resolution ?? model.defaults.resolution,
      generate_audio: input.generateAudio ?? model.defaults.generateAudio
    };
  }

  static getModelByVersion(version: string): ModelConfig | undefined {
    return Array.from(this.models.values()).find(m => m.version === version);
  }
}

export default ModelRegistry;
