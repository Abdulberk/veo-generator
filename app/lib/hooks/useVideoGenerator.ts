import { useState, useCallback, useRef, useEffect } from "react";
import { GenerationInput } from "@/app/lib/types/models";
import { PredictionResponse, PredictionStatus } from "@/app/lib/types/api";

interface UseVideoGeneratorReturn {
  generate: (input: GenerationInput) => Promise<void>;
  prediction: PredictionResponse | null;
  isGenerating: boolean;
  error: Error | null;
  cancel: () => Promise<void>;
  reset: () => void;
}

export function useVideoGenerator(): UseVideoGeneratorReturn {
  const [prediction, setPrediction] = useState<PredictionResponse | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const pollingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const cleanupPolling = useCallback(() => {
    if (pollingTimeoutRef.current) {
      clearTimeout(pollingTimeoutRef.current);
      pollingTimeoutRef.current = null;
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  const pollPrediction = useCallback(async (
    predictionId: string,
    controller: AbortController,
    pollCount: number = 0
  ) => {
    const MAX_POLLS = 90; // 3 minutes max (90 * 2 seconds)
    const POLL_INTERVAL = 2000; // 2 seconds

    try {
      const response = await fetch(`/api/predictions/${predictionId}`, {
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`Failed to get prediction status: ${response.statusText}`);
      }

      const updatedPrediction: PredictionResponse = await response.json();
      setPrediction(updatedPrediction);

      // Check if generation is complete
      if (updatedPrediction.status === "succeeded") {
        setIsGenerating(false);
        cleanupPolling();
        return;
      }

      // Check if generation failed
      if (updatedPrediction.status === "failed" || updatedPrediction.status === "canceled") {
        throw new Error(updatedPrediction.error || "Generation failed");
      }

      // Continue polling if not complete and within limits
      if (pollCount < MAX_POLLS && !controller.signal.aborted) {
        pollingTimeoutRef.current = setTimeout(() => {
          pollPrediction(predictionId, controller, pollCount + 1);
        }, POLL_INTERVAL);
      } else if (pollCount >= MAX_POLLS) {
        throw new Error("Generation timeout - exceeded maximum wait time");
      }
    } catch (err) {
      if (controller.signal.aborted) {
        // Ignore abort errors
        return;
      }
      setError(err as Error);
      setIsGenerating(false);
      cleanupPolling();
    }
  }, [cleanupPolling]);

  const generate = useCallback(async (input: GenerationInput) => {
    // Reset state
    setIsGenerating(true);
    setError(null);
    cleanupPolling();

    // Create new abort controller
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      // Create prediction
      const response = await fetch("/api/predictions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(input),
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to create prediction: ${response.statusText}`);
      }

      const initialPrediction: PredictionResponse = await response.json();
      setPrediction(initialPrediction);

      // Start polling for status updates
      pollingTimeoutRef.current = setTimeout(() => {
        pollPrediction(initialPrediction.id, controller);
      }, 2000);

    } catch (err) {
      if (!controller.signal.aborted) {
        setError(err as Error);
        setIsGenerating(false);
        cleanupPolling();
      }
    }
  }, [pollPrediction, cleanupPolling]);

  const cancel = useCallback(async () => {
    cleanupPolling();

    if (prediction?.id && prediction.status !== "succeeded" && prediction.status !== "failed") {
      try {
        await fetch(`/api/predictions/${prediction.id}`, {
          method: "DELETE",
        });
      } catch (err) {
        console.error("Failed to cancel prediction:", err);
      }
    }

    setIsGenerating(false);
  }, [prediction, cleanupPolling]);

  const reset = useCallback(() => {
    cleanupPolling();
    setPrediction(null);
    setIsGenerating(false);
    setError(null);
  }, [cleanupPolling]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupPolling();
    };
  }, [cleanupPolling]);

  return {
    generate,
    prediction,
    isGenerating,
    error,
    cancel,
    reset,
  };
}