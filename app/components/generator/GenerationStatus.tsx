"use client";

import React from "react";

interface GenerationStatusProps {
  prediction: any | null;
  isGenerating: boolean;
}

export function GenerationStatus({ prediction, isGenerating }: GenerationStatusProps) {
  if (!isGenerating && !prediction) {
    return null;
  }

  const getStatusMessage = () => {
    if (!prediction) return "Initializing...";
    
    // Handle both old and new status formats
    const status = prediction.status;
    
    switch (status) {
      case "starting":
      case "IN_QUEUE":
        return "Starting generation...";
      case "processing":
      case "IN_PROGRESS":
        return "Generating your video...";
      case "succeeded":
      case "COMPLETED":
        return "Video generated successfully!";
      case "failed":
      case "FAILED":
        return "Generation failed";
      case "canceled":
        return "Generation canceled";
      default:
        return "Processing...";
    }
  };

  const getStatusColor = () => {
    if (!prediction) return "bg-gray-500";
    
    const status = prediction.status;
    
    switch (status) {
      case "succeeded":
      case "COMPLETED":
        return "bg-green-500";
      case "failed":
      case "FAILED":
      case "canceled":
        return "bg-red-500";
      default:
        return "bg-blue-500";
    }
  };

  const getLogs = () => {
    if (!prediction?.logs) return [];
    return prediction.logs.split("\n").filter((log: string) => log.trim());
  };

  const logs = getLogs();
  const lastLog = logs[logs.length - 1] || "";
  
  // Get queue position if available
  const queuePosition = prediction?.queue_position;
  const detail = prediction?.detail;
  
  // Parse the last log to show meaningful status
  const getDisplayLog = () => {
    if (prediction?.status === "failed" || prediction?.status === "FAILED") {
      return "Error occurred during generation";
    }
    if (queuePosition !== undefined && queuePosition > 0) {
      return `Queue position: ${queuePosition}`;
    }
    if (detail && typeof detail === "string") {
      return detail;
    }
    if (lastLog.includes("Still generating")) {
      return "Processing video... This may take a minute";
    }
    return lastLog || "Preparing your video...";
  };

  const isProcessing = prediction?.status === "processing" || 
                       prediction?.status === "IN_PROGRESS" || 
                       prediction?.status === "starting" || 
                       prediction?.status === "IN_QUEUE";

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 space-y-4">
      {/* Status Header */}
      <div className="flex items-center space-x-3">
        <div className="relative">
          <div className={`w-3 h-3 rounded-full ${getStatusColor()}`} />
          {isProcessing && (
            <div className={`absolute inset-0 w-3 h-3 rounded-full ${getStatusColor()} animate-ping`} />
          )}
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {getStatusMessage()}
        </h3>
      </div>

      {/* Progress Bar */}
      {isGenerating && prediction?.status !== "failed" && prediction?.status !== "FAILED" && (
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full animate-pulse"
            style={{ width: isProcessing ? "75%" : "25%" }}
          />
        </div>
      )}

      {/* Status Display */}
      {(lastLog || detail || queuePosition !== undefined || isProcessing) && 
       prediction?.status !== "failed" && prediction?.status !== "FAILED" && (
        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400 font-mono">
            {getDisplayLog()}
          </p>
          {queuePosition !== undefined && queuePosition === 0 && (
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
              Your video is being processed now...
            </p>
          )}
        </div>
      )}

      {/* Time Metrics */}
      {prediction?.metrics?.predict_time && (
        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
          <span>Generation time:</span>
          <span className="font-medium">
            {Math.round(prediction.metrics.predict_time)} seconds
          </span>
        </div>
      )}

      {/* Error Message */}
      {(prediction?.status === "failed" || prediction?.status === "FAILED") && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                Video generation failed
              </h3>
              <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                {prediction?.error ? (
                  <>
                    <p>{prediction.error}</p>
                    <p className="mt-2 font-semibold">Please try again with:</p>
                    <ul className="list-disc list-inside mt-1">
                      <li>A simpler prompt</li>
                      <li>Shorter duration (4 or 6 seconds)</li>
                      <li>Different settings</li>
                    </ul>
                  </>
                ) : (
                  <p>An unexpected error occurred. Please try again.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Timeout Warning */}
      {isGenerating && prediction?.metrics?.predict_time && prediction.metrics.predict_time > 90 && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
          <p className="text-sm text-yellow-700 dark:text-yellow-300">
            ⚠️ Generation is taking longer than usual. Complex prompts may require more time.
          </p>
        </div>
      )}
    </div>
  );
}