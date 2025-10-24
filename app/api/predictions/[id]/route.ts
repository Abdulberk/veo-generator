import { NextRequest, NextResponse } from "next/server";
import { VeoStatusResponse, VeoCompletedResponse } from "@/app/lib/types/api";

const GATEAI_API_KEY = process.env.GATEAI_API_KEY;
const GATEAI_QUEUE_URL = "https://queue.gateai.app";

if (!GATEAI_API_KEY) {
  throw new Error("Missing required environment variable: GATEAI_API_KEY");
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Next.js 15+ requires awaiting params
    const params = await context.params;
    const { id } = params;

    console.log("GET /api/predictions/[id] called with id:", id);

    if (!id) {
      return NextResponse.json(
        { error: "Request ID is required" },
        { status: 400 }
      );
    }

    // Check status using the new API endpoint
    const url = `${GATEAI_QUEUE_URL}/fal-ai/veo3/requests/${id}`;
    console.log("Fetching from GateAI Queue:", url);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${GATEAI_API_KEY}`,
      },
    });

    // Get the response data regardless of status
    const statusResponse = await response.json();

    // Check for content policy violation (422 error)
    if (response.status === 422 && statusResponse.detail) {
      const detail = Array.isArray(statusResponse.detail) ? statusResponse.detail[0] : statusResponse.detail;
      if (detail?.type === "content_policy_violation") {
        console.error("Content policy violation:", detail);
        
        const transformedResponse = {
          id: id,
          status: "failed",
          output: null,
          logs: "",
          error: "Content Policy Violation: Your prompt was flagged by the content filter. Please try a different prompt that doesn't involve minors, violence, or other sensitive content.",
          detail: detail.msg || "Content policy violation",
          policy_message: "The AI has safety guidelines and cannot generate content involving: minors, violence, adult content, or other sensitive topics. Please modify your prompt."
        };
        
        return NextResponse.json(transformedResponse);
      }
    }

    // Check if this is a "still in progress" response (which API returns as 400)
    const isStillInProgress = response.status === 400 && 
                             statusResponse.detail && 
                             statusResponse.detail.includes("in progress");

    // If it"s not OK and not "still in progress", it"s a real error
    if (!response.ok && !isStillInProgress) {
      console.error("GateAI Queue API error:", {
        status: response.status,
        statusText: response.statusText,
        error: statusResponse,
        url: url
      });
      
      // For other 4xx errors, provide a user-friendly message
      if (response.status >= 400 && response.status < 500) {
        const transformedResponse = {
          id: id,
          status: "failed",
          output: null,
          logs: "",
          error: "Request failed. Please check your input and try again.",
          detail: statusResponse.detail || response.statusText
        };
        return NextResponse.json(transformedResponse);
      }
      
      return NextResponse.json(
        { error: "Failed to get video status", details: statusResponse },
        { status: response.status }
      );
    }

    // Log successful or in-progress status
    if (isStillInProgress) {
      console.log("Video still processing (400 but normal):", {
        request_id: statusResponse.request_id,
        detail: statusResponse.detail
      });
    }
    
    // Check if video is completed
    let transformedResponse;
    
    if ("video" in statusResponse && statusResponse.video) {
      // Video is completed
      console.log("Video generation completed:", {
        request_id: statusResponse.request_id || id,
        video_url: statusResponse.video.url
      });
      
      transformedResponse = {
        id: statusResponse.request_id || id,
        status: "succeeded",
        output: statusResponse.video.url,
        video: statusResponse.video,
        logs: "",
        error: null,
        metrics: {
          file_size: statusResponse.video.file_size
        }
      };
    } else if (statusResponse.detail && statusResponse.detail.includes("in progress")) {
      // Still processing (either from 200 or 400 response)
      console.log("Video processing:", {
        request_id: statusResponse.request_id,
        detail: statusResponse.detail
      });
      
      transformedResponse = {
        id: statusResponse.request_id || id,
        status: "processing",
        output: null,
        logs: statusResponse.logs || "Processing...",
        error: null,
        detail: statusResponse.detail,
        response_url: statusResponse.response_url,
        status_url: statusResponse.status_url,
        cancel_url: statusResponse.cancel_url
      };
    } else if ("status" in statusResponse && statusResponse.status) {
      // Has status field
      const statusMap: Record<string, string> = {
        "IN_QUEUE": "starting",
        "IN_PROGRESS": "processing",
        "COMPLETED": "succeeded",
        "FAILED": "failed"
      };
      
      const statusValue = statusResponse as VeoStatusResponse;
      
      transformedResponse = {
        id: statusValue.request_id || id,
        status: statusMap[statusValue.status || "IN_PROGRESS"] || "processing",
        output: statusValue.video ? statusValue.video.url : null,
        logs: statusValue.logs || "",
        error: statusValue.status === "FAILED" ? "Video generation failed" : null,
        response_url: statusValue.response_url,
        status_url: statusValue.status_url,
        cancel_url: statusValue.cancel_url
      };
    } else {
      // Unknown response format or still processing
      const defaultStatus = statusResponse as VeoStatusResponse;
      transformedResponse = {
        id: defaultStatus.request_id || id,
        status: "processing",
        output: null,
        logs: defaultStatus.logs || "Processing...",
        error: null,
        response_url: defaultStatus.response_url,
        status_url: defaultStatus.status_url,
        cancel_url: defaultStatus.cancel_url
      };
    }
    
    return NextResponse.json(transformedResponse);
  } catch (error) {
    console.error("Error in GET /api/predictions/[id]:", error);
    return NextResponse.json(
      { error: "Internal server error", message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Next.js 15+ requires awaiting params
    const params = await context.params;
    const { id } = params;

    console.log("DELETE /api/predictions/[id] called with id:", id);

    if (!id) {
      return NextResponse.json(
        { error: "Request ID is required" },
        { status: 400 }
      );
    }

    // Cancel request via new API
    const response = await fetch(`${GATEAI_QUEUE_URL}/fal-ai/veo3/requests/${id}/cancel`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${GATEAI_API_KEY}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("GateAI Queue API cancel error:", errorData);
      return NextResponse.json(
        { error: "Failed to cancel video generation", details: errorData },
        { status: response.status }
      );
    }

    return NextResponse.json({ success: true, message: "Video generation canceled" });
  } catch (error) {
    console.error("Error in DELETE /api/predictions/[id]:", error);
    return NextResponse.json(
      { error: "Internal server error", message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}