import { NextRequest, NextResponse } from "next/server";
import ModelRegistry from "@/app/lib/models/registry";
import { GenerationInput } from "@/app/lib/types/models";
import { VeoRequest, VeoCreateResponse } from "@/app/lib/types/api";

const GATEAI_API_KEY = process.env.GATEAI_API_KEY;
const GATEAI_QUEUE_URL = "https://queue.gateai.app";

if (!GATEAI_API_KEY) {
  throw new Error("Missing required environment variable: GATEAI_API_KEY");
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as GenerationInput;
    
    console.log("Received generation request:", body);
    
    // Validate model exists
    const model = ModelRegistry.get(body.modelId);
    if (!model) {
      return NextResponse.json(
        { error: "Invalid model ID" },
        { status: 400 }
      );
    }

    // Validate input
    const validation = ModelRegistry.validateInput(body.modelId, body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", errors: validation.errors },
        { status: 400 }
      );
    }

    // Transform input for new API format
    const veoRequest: VeoRequest = {
      prompt: body.prompt,
      duration: `${body.duration || 8}s` as "4s" | "6s" | "8s",
      aspect_ratio: (body.aspectRatio || "16:9") as "16:9" | "9:16",
      resolution: (body.resolution || "1080p") as "720p" | "1080p",
      generate_audio: body.generateAudio ?? true,
      auto_fix: body.autoFix ?? true,
      enhance_prompt: body.enhancePrompt ?? true
    };

    // Add image_url for image-to-video mode
    if (body.mode === "image-to-video" && body.imageUrl) {
      veoRequest.image_url = body.imageUrl;
    }

    // Determine the correct endpoint based on model and mode
    const baseEndpoint = model.apiConfig.endpoint;
    const apiEndpoint = body.mode === "image-to-video" 
      ? `${GATEAI_QUEUE_URL}${baseEndpoint}/image-to-video`
      : `${GATEAI_QUEUE_URL}${baseEndpoint}`;

    console.log("Sending to GateAI Queue API:", {
      url: apiEndpoint,
      mode: body.mode,
      request: veoRequest
    });

    // Make API call to new GateAI Queue endpoint
    const response = await fetch(apiEndpoint, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${GATEAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(veoRequest),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("GateAI Queue API error:", {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      });
      return NextResponse.json(
        { error: "Failed to create video generation request", details: errorData },
        { status: response.status }
      );
    }

    const veoResponse: VeoCreateResponse = await response.json();
    
    console.log("Video generation request created successfully:", {
      request_id: veoResponse.request_id,
      status: veoResponse.status,
      queue_position: veoResponse.queue_position,
      mode: body.mode
    });
    
    // Transform response to match our frontend expectations
    // We"ll use request_id as the id for compatibility
    const transformedResponse = {
      id: veoResponse.request_id,
      status: veoResponse.status === "IN_QUEUE" ? "starting" : "processing",
      request_id: veoResponse.request_id,
      response_url: veoResponse.response_url,
      status_url: veoResponse.status_url,
      cancel_url: veoResponse.cancel_url,
      queue_position: veoResponse.queue_position,
      logs: veoResponse.logs || "",
      input: {
        prompt: body.prompt,
        duration: body.duration,
        aspect_ratio: body.aspectRatio,
        resolution: body.resolution,
        generate_audio: body.generateAudio,
        auto_fix: body.autoFix,
        enhance_prompt: body.enhancePrompt,
        image_url: body.imageUrl,
        mode: body.mode
      }
    };
    
    return NextResponse.json(transformedResponse);
  } catch (error) {
    console.error("Error in POST /api/predictions:", error);
    return NextResponse.json(
      { error: "Internal server error", message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
