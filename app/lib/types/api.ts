// API related types for new queue.gateai.app API

// Request types
export interface VeoRequest {
  prompt: string;
  duration: "4s" | "6s" | "8s";
  aspect_ratio: "16:9" | "9:16";
  resolution: "720p" | "1080p";
  generate_audio: boolean;
  auto_fix?: boolean;
  enhance_prompt?: boolean;
  image_url?: string; // For image-to-video mode
}

// Initial response when creating a video
export interface VeoCreateResponse {
  status: "IN_QUEUE" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
  request_id: string;
  response_url: string;
  status_url: string;
  cancel_url: string;
  logs: string | null;
  metrics: Record<string, number>;
  queue_position?: number;
}

// Status check response while processing
export interface VeoStatusResponse {
  detail?: string;
  request_id: string;
  response_url: string;
  status_url: string;
  cancel_url: string;
  status?: "IN_QUEUE" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
  logs?: string | null;
  video?: VeoVideoOutput;
}

// Final video output
export interface VeoVideoOutput {
  url: string;
  content_type: string;
  file_name: string;
  file_size: number;
}

// Completed response
export interface VeoCompletedResponse {
  video: VeoVideoOutput;
  request_id?: string;
  status?: "COMPLETED";
}

// Error response
export interface VeoErrorResponse {
  error: string;
  message?: string;
  detail?: string;
}

// Unified response type for easier handling
export type VeoResponse = VeoCreateResponse | VeoStatusResponse | VeoCompletedResponse;

// Legacy types for compatibility (will be phased out)
export interface PredictionRequest {
  version: string;
  input: PredictionInput;
}

export interface PredictionInput {
  prompt: string;
  duration?: number;
  aspect_ratio?: string;
  resolution?: string;
  generate_audio?: boolean;
}

export interface PredictionResponse {
  id: string;
  model: string;
  version: string;
  input: PredictionInput;
  logs: string;
  output: string | null;
  data_removed: boolean;
  error: string | null;
  source: string;
  status: PredictionStatus;
  created_at: string;
  started_at?: string;
  completed_at?: string;
  urls: {
    cancel: string;
    get: string;
  };
  metrics?: {
    predict_time?: number;
  };
}

export type PredictionStatus = 
  | "starting"
  | "processing"
  | "succeeded"
  | "failed"
  | "canceled";

export interface APIError {
  error: string;
  message?: string;
  code?: string;
}