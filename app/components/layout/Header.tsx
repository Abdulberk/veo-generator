"use client";

import React from "react";
import Link from "next/link";
import { useModel } from "@/app/lib/context/ModelContext";

export function Header() {
  const { selectedModel, setSelectedModel, availableModels } = useModel();

  return (
    <header className="border-b border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-10">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Veo AI Video Generator
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Powered by {selectedModel.displayName}
              </p>
            </div>
          </div>

          {/* Model Navigation Tabs */}
          <div className="flex items-center space-x-4">
            <nav className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
              {availableModels.map((model) => {
                const getModelUrl = (modelId: string) => {
                  switch (modelId) {
                    case "veo3": return "/";
                    case "veo3.1": return "/veo3.1";
                    case "veo3.1-fast": return "/veo3.1-fast";
                    default: return `/${modelId}`;
                  }
                };

                const getModelColor = (modelId: string, isSelected: boolean) => {
                  if (modelId === "veo3.1-fast") {
                    return isSelected 
                      ? "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 shadow-sm"
                      : "text-gray-600 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400";
                  } else if (modelId === "veo3.1") {
                    return isSelected 
                      ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 shadow-sm"
                      : "text-gray-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400";
                  } else {
                    return isSelected 
                      ? "bg-white dark:bg-gray-700 text-purple-600 dark:text-purple-400 shadow-sm"
                      : "text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400";
                  }
                };

                return (
                  <Link
                    key={model.id}
                    href={getModelUrl(model.id)}
                    onClick={() => setSelectedModel(model.id)}
                    className={`px-3 py-2 text-sm font-medium rounded-md transition-colors flex items-center space-x-1 ${getModelColor(model.id, selectedModel.id === model.id)}`}
                  >
                    <span>{model.displayName}</span>
                    {model.id === "veo3.1-fast" && (
                      <span className="text-xs bg-orange-200 dark:bg-orange-900/50 text-orange-800 dark:text-orange-300 px-1 py-0.5 rounded">
                        FAST
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>

            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
            </a>
          </div>
        </div>

        {/* Model-specific Info Bar */}
        <div className="mt-3 flex items-center justify-between text-sm">
          <div className="flex items-center space-x-4 text-gray-600 dark:text-gray-400">
            <div className="flex items-center space-x-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Up to {selectedModel.capabilities.maxDuration}s</span>
            </div>
            <div className="flex items-center space-x-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>{selectedModel.capabilities.supportedResolutions.join(", ")}</span>
            </div>
            {selectedModel.capabilities.hasAudioGeneration && (
              <div className="flex items-center space-x-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M9 12a1 1 0 01-.883-.993l-.004-.117V5.236a1 1 0 011.447-.894l8.5 4.886a1 1 0 010 1.788l-8.5 4.886A1 1 0 019 14.118V12.11L9 12z" />
                </svg>
                <span>Audio Generation</span>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-4">
            {selectedModel.id === "veo3.1" && (
              <div className="flex items-center space-x-1 text-emerald-600 dark:text-emerald-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span className="text-xs font-medium">Latest Model</span>
              </div>
            )}
            {selectedModel.id === "veo3.1-fast" && (
              <div className="flex items-center space-x-1 text-orange-600 dark:text-orange-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span className="text-xs font-medium">Fastest Model</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
