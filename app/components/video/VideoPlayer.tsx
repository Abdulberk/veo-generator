"use client";

import React, { useState } from "react";
import { Button } from "@/app/components/ui/button";
import { VeoVideoOutput } from "@/app/lib/types/api";

interface VideoPlayerProps {
  prediction: {
    id?: string;
    status?: string;
    output?: string | null;
    video?: VeoVideoOutput;
    input?: {
      prompt?: string;
      duration?: number;
      aspect_ratio?: string;
      resolution?: string;
      generate_audio?: boolean;
    };
    metrics?: {
      predict_time?: number;
      file_size?: number;
    };
  } | null;
  onReset: () => void;
}

export function VideoPlayer({ prediction, onReset }: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);

  // Check for video in both old and new formats
  const videoUrl = prediction?.output || prediction?.video?.url;
  
  if (!videoUrl) {
    return null;
  }

  const handleDownload = async () => {
    if (!videoUrl) return;
    
    setIsDownloading(true);
    
    try {
      // Fetch the video as blob
      const response = await fetch(videoUrl);
      const blob = await response.blob();
      
      // Create a blob URL
      const blobUrl = URL.createObjectURL(blob);
      
      // Create a temporary link and trigger download
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = prediction?.video?.file_name || `veo3-video-${prediction?.id || Date.now()}.mp4`;
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Download failed:", error);
      // Fallback to opening in new tab if CORS fails
      window.open(videoUrl, "_blank");
    } finally {
      setIsDownloading(false);
    }
  };

  // Extract video info
  const videoInfo = prediction?.video;
  const fileSize = videoInfo?.file_size ? (videoInfo.file_size / (1024 * 1024)).toFixed(2) + " MB" : 
                   prediction?.metrics?.file_size ? (prediction.metrics.file_size / (1024 * 1024)).toFixed(2) + " MB" : null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
      {/* Video Container */}
      <div className="relative aspect-video bg-black">
        <video
          src={videoUrl}
          controls
          autoPlay={isPlaying}
          loop
          className="w-full h-full object-contain"
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        >
          Your browser does not support the video tag.
        </video>
      </div>

      {/* Video Info */}
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Generated Video
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {fileSize && `File size: ${fileSize}`}
            </p>
          </div>
          {prediction?.metrics?.predict_time && (
            <div className="text-right">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Generation time
              </p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {Math.round(prediction.metrics.predict_time)}s
              </p>
            </div>
          )}
        </div>

        {/* Video Details */}
        {prediction?.input && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 border-y border-gray-200 dark:border-gray-700">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Duration
              </p>
              <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                {prediction.input.duration || 8} seconds
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Aspect Ratio
              </p>
              <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                {prediction.input.aspect_ratio || "16:9"}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Resolution
              </p>
              <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                {prediction.input.resolution || "1080p"}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Audio
              </p>
              <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                {prediction.input.generate_audio ? "Enabled" : "Disabled"}
              </p>
            </div>
          </div>
        )}

        {/* Prompt Display */}
        {prediction?.input?.prompt && (
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
              Prompt Used
            </p>
            <p className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">
              {prediction.input.prompt}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            onClick={handleDownload}
            variant="default"
            className="flex-1"
            disabled={isDownloading}
          >
            {isDownloading ? (
              <>
                <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Downloading...
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download Video
              </>
            )}
          </Button>
          <Button
            onClick={onReset}
            variant="outline"
            className="flex-1"
          >
            Generate New Video
          </Button>
        </div>
      </div>
    </div>
  );
}