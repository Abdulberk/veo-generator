"use client";

import React, { useState } from "react";
import { Button } from "@/app/components/ui/button";
import { Select } from "@/app/components/ui/select";
import { Textarea } from "@/app/components/ui/textarea";
import { Switch } from "@/app/components/ui/switch";
import { GenerationInput } from "@/app/lib/types/models";
import ModelRegistry from "@/app/lib/models/registry";

interface GeneratorFormProps {
  onSubmit: (input: GenerationInput) => Promise<void>;
  isGenerating: boolean;
  onCancel: () => void;
}

export function GeneratorForm({ onSubmit, isGenerating, onCancel }: GeneratorFormProps) {
  const [mode, setMode] = useState<"text-to-video" | "image-to-video">("text-to-video");
  const [prompt, setPrompt] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [duration, setDuration] = useState<number>(8);
  const [aspectRatio, setAspectRatio] = useState("16:9");
  const [resolution, setResolution] = useState("1080p");
  const [generateAudio, setGenerateAudio] = useState(true);
  const [autoFix, setAutoFix] = useState(true);
  const [enhancePrompt, setEnhancePrompt] = useState(true);
  const [errors, setErrors] = useState<string[]>([]);

  const models = ModelRegistry.getAll();
  const selectedModel = models[0]; // Using Veo3 as default for now

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);

    const input: GenerationInput = {
      modelId: selectedModel.id,
      mode,
      prompt: prompt.trim(),
      imageUrl: mode === "image-to-video" ? imageUrl.trim() : undefined,
      duration,
      aspectRatio,
      resolution,
      generateAudio,
      autoFix,
      enhancePrompt,
    };

    // Validate input
    const validation = ModelRegistry.validateInput(selectedModel.id, input);
    if (!validation.success) {
      setErrors(validation.errors || []);
      return;
    }

    // Submit
    await onSubmit(input);
  };

  const durationOptions = selectedModel?.capabilities.supportedDurations.map(d => ({
    value: d,
    label: `${d} seconds`
  })) || [];

  const aspectRatioOptions = selectedModel?.capabilities.supportedAspectRatios.map(ar => ({
    value: ar,
    label: ar
  })) || [];

  const resolutionOptions = selectedModel?.capabilities.supportedResolutions.map(r => ({
    value: r,
    label: r
  })) || [];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Model Display */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
          {selectedModel?.displayName}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Generate videos from text prompts or images using Google&apos;s advanced AI model
        </p>
      </div>

      {/* Mode Selector */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setMode("text-to-video")}
          className={`flex-1 py-2 px-4 rounded-lg transition-colors ${
            mode === "text-to-video"
              ? "bg-purple-600 text-white"
              : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
          }`}
        >
          <svg className="w-5 h-5 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Text to Video
        </button>
        <button
          type="button"
          onClick={() => setMode("image-to-video")}
          className={`flex-1 py-2 px-4 rounded-lg transition-colors ${
            mode === "image-to-video"
              ? "bg-purple-600 text-white"
              : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
          }`}
        >
          <svg className="w-5 h-5 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Image to Video
        </button>
      </div>

      {/* Image URL Input (for image-to-video mode) */}
      {mode === "image-to-video" && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Image URL
          </label>
          <input
            type="url"
            placeholder="https://example.com/image.jpg"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-900 dark:border-gray-700 dark:text-white"
            required={mode === "image-to-video"}
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Provide a direct link to an image (JPG, PNG, etc.)
          </p>
        </div>
      )}

      {/* Prompt Input */}
      <Textarea
        label={mode === "image-to-video" ? "Describe the motion/animation" : "Describe your video"}
        placeholder={
          mode === "image-to-video"
            ? "The person in the image turns and smiles at the camera..."
            : "A beautiful sunset over mountains with clouds moving slowly..."
        }
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        maxLength={2000}
        rows={4}
        required
        error={errors.find(e => e.includes("Prompt")) || ""}
      />
      <div className="text-right text-sm text-gray-500">
        {prompt.length}/2000 characters
      </div>

      {/* Video Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          label="Duration"
          options={durationOptions}
          value={duration}
          onChange={(e) => setDuration(Number(e.target.value))}
        />

        <Select
          label="Aspect Ratio"
          options={aspectRatioOptions}
          value={aspectRatio}
          onChange={(e) => setAspectRatio(e.target.value)}
        />

        <Select
          label="Resolution"
          options={resolutionOptions}
          value={resolution}
          onChange={(e) => setResolution(e.target.value)}
        />

        <div className="flex items-end pb-2">
          <Switch
            label="Generate Audio"
            checked={generateAudio}
            onChange={(e) => setGenerateAudio(e.target.checked)}
          />
        </div>
      </div>

      {/* AI Enhancement Options */}
      <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 space-y-3">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          🤖 AI Enhancement Options
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            <Switch
              label="Auto Fix"
              checked={autoFix}
              onChange={(e) => setAutoFix(e.target.checked)}
            />
            <div className="group relative">
              <svg className="w-4 h-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-help" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block w-48 p-2 bg-gray-900 text-white text-xs rounded-lg z-10">
                Automatically fix common prompt issues
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              label="Enhance Prompt"
              checked={enhancePrompt}
              onChange={(e) => setEnhancePrompt(e.target.checked)}
            />
            <div className="group relative">
              <svg className="w-4 h-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-help" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block w-48 p-2 bg-gray-900 text-white text-xs rounded-lg z-10">
                AI improves your prompt for better results
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {errors.length > 0 && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-sm font-medium text-red-800 dark:text-red-200 mb-2">
            Please fix the following errors:
          </p>
          <ul className="list-disc list-inside space-y-1">
            {errors.map((error, index) => (
              <li key={index} className="text-sm text-red-600 dark:text-red-300">
                {error}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        {isGenerating ? (
          <>
            <Button
              type="button"
              variant="destructive"
              onClick={onCancel}
              className="flex-1"
            >
              Cancel Generation
            </Button>
          </>
        ) : (
          <Button
            type="submit"
            variant="default"
            disabled={!prompt.trim() || (mode === "image-to-video" && !imageUrl.trim())}
            className="flex-1"
          >
            Generate Video
          </Button>
        )}
      </div>
    </form>
  );
}