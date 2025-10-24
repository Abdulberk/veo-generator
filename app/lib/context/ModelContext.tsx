"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import ModelRegistry from "@/app/lib/models/registry";
import { ModelConfig } from "@/app/lib/types/models";

interface ModelContextType {
  selectedModel: ModelConfig;
  setSelectedModel: (modelId: string) => void;
  availableModels: ModelConfig[];
}

const ModelContext = createContext<ModelContextType | undefined>(undefined);

interface ModelProviderProps {
  children: ReactNode;
  defaultModelId?: string;
}

export function ModelProvider({ children, defaultModelId = "veo3" }: ModelProviderProps) {
  const availableModels = ModelRegistry.getAll();
  const defaultModel = ModelRegistry.get(defaultModelId) || availableModels[0];
  
  const [selectedModel, setSelectedModelState] = useState<ModelConfig>(defaultModel);

  const setSelectedModel = useCallback((modelId: string) => {
    const model = ModelRegistry.get(modelId);
    if (model) {
      setSelectedModelState(model);
    }
  }, []);

  const value: ModelContextType = {
    selectedModel,
    setSelectedModel,
    availableModels,
  };

  return (
    <ModelContext.Provider value={value}>
      {children}
    </ModelContext.Provider>
  );
}

export function useModel() {
  const context = useContext(ModelContext);
  if (context === undefined) {
    throw new Error("useModel must be used within a ModelProvider");
  }
  return context;
}
