"use client";

import React from "react";
import { GeneratorForm } from "@/app/components/generator/GeneratorForm";
import { GenerationStatus } from "@/app/components/generator/GenerationStatus";
import { VideoPlayer } from "@/app/components/video/VideoPlayer";
import { useVideoGenerator } from "@/app/lib/hooks/useVideoGenerator";
import { useModel } from "@/app/lib/context/ModelContext";
import { GenerationInput } from "@/app/lib/types/models";

export default function Veo31Page() {
  const { selectedModel } = useModel();
  const { generate, prediction, isGenerating, error, cancel, reset } = useVideoGenerator();

  const handleSubmit = async (input: GenerationInput) => {
    // Ensure we're using the veo3.1 model
    const veo31Input = { ...input, modelId: "veo3.1" };
    await generate(veo31Input);
  };

  const showVideo = prediction?.status === "succeeded" && prediction.output;
  const showStatus = isGenerating || (prediction && !showVideo);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
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
                    <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Enhanced Speed</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Faster generation</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Improved Quality</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Better realism</p>
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
                    <div className="w-24 h-24 bg-gradient-to-br from-emerald-100 to-blue-100 dark:from-emerald-900/30 dark:to-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-12 h-12 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      Ready to Create with Veo 3.1
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-2">
                      Experience the latest AI video generation model
                    </p>
                    <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300">
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      Latest Model
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

          {/* Veo 3.1 Info Section */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                🚀 Enhanced Performance
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Veo 3.1 offers improved generation speed and better resource efficiency
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                ✨ Better Realism
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Enhanced AI model produces more realistic and detailed video content
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                🎯 Improved Prompt Understanding
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Better interpretation of complex prompts and scene descriptions
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
              Powered by Google Veo 3.1 AI Model • Built with Next.js & TypeScript
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
