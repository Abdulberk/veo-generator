"use client";

import React from "react";
import { GeneratorForm } from "@/app/components/generator/GeneratorForm";
import { GenerationStatus } from "@/app/components/generator/GenerationStatus";
import { VideoPlayer } from "@/app/components/video/VideoPlayer";
import { useVideoGenerator } from "@/app/lib/hooks/useVideoGenerator";
import { useModel } from "@/app/lib/context/ModelContext";
import { GenerationInput } from "@/app/lib/types/models";

export default function Veo31FastPage() {
  const { selectedModel } = useModel();
  const { generate, prediction, isGenerating, error, cancel, reset } = useVideoGenerator();

  const handleSubmit = async (input: GenerationInput) => {
    // Ensure we're using the veo3.1-fast model
    const veo31FastInput = { ...input, modelId: "veo3.1-fast" };
    await generate(veo31FastInput);
  };

  const showVideo = prediction?.status === "succeeded" && prediction.output;
  const showStatus = isGenerating || (prediction && !showVideo);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Form */}
            <div>
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6">
                <GeneratorForm
                  onSubmit={handleSubmit}
                  isGenerating={isGenerating}
                  onCancel={cancel}
                />
              </div>

              {/* Features */}
              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Lightning Fast</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">~30-45 seconds</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Quick Iteration</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Perfect for testing</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Video/Status */}
            <div>
              {showVideo ? (
                <VideoPlayer prediction={prediction} onReset={reset} />
              ) : showStatus ? (
                <GenerationStatus prediction={prediction} isGenerating={isGenerating} />
              ) : (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-12">
                  <div className="text-center">
                    <div className="w-24 h-24 bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-900/30 dark:to-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-12 h-12 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      Ready to Create Fast with Veo 3.1
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-2">
                      Lightning fast AI video generation for rapid prototyping
                    </p>
                    <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300">
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      Fastest Model
                    </div>
                  </div>
                </div>
              )}

              {/* Error Display */}
              {error && (
                <div className="mt-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-800 dark:text-red-200">
                        {error.message}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Veo 3.1 Fast Info Section */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                ⚡ Lightning Speed
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Generate videos in 30-45 seconds - perfect for rapid iteration and testing concepts
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                🎯 Optimized for Speed
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                720p resolution focus ensures fastest possible generation without compromising quality
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                🚀 Rapid Prototyping
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Ideal for content creators who need quick results and fast feedback loops
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center text-sm text-gray-600 dark:text-gray-400">
            <p>
              Powered by Google Veo 3.1 Fast AI Model • Built with Next.js & TypeScript
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
