// OpenAI Configuration and Client Setup
// File: lib/ai/openai-config.ts

import OpenAI from 'openai';

export interface OpenAIConfig {
  apiKey: string;
  model: string;
  maxCompletionTokens: number; // GPT-5 uses max_completion_tokens
  temperature: number;
}

// Default configuration for engineering reports
export const DEFAULT_AI_CONFIG: Omit<OpenAIConfig, 'apiKey'> = {
  model: 'gpt-5', // GPT-5 is now available and recommended for engineering reports
  maxCompletionTokens: 8000, // Higher token limit for GPT-5
  temperature: 0.1, // Low temperature for accurate technical reports
};

// Create OpenAI client with error handling
export function createOpenAIClient(apiKey: string): OpenAI {
  if (!apiKey) {
    throw new Error('OpenAI API key is required');
  }

  return new OpenAI({
    apiKey,
    timeout: 60000, // 60 second timeout for complex reports
    maxRetries: 3,
  });
}

// Validate API key format
export function validateApiKey(apiKey: string): boolean {
  return /^sk-[a-zA-Z0-9]{20,}/.test(apiKey);
}

export const OPENAI_MODELS = {
  'gpt-5': 'GPT-5 (Latest & Recommended)',
  'gpt-5-mini': 'GPT-5 Mini (Faster & Cost-effective)',
  'gpt-5-nano': 'GPT-5 Nano (Lightweight)',
  'gpt-4': 'GPT-4 (Previous Generation)',
  'gpt-4-turbo': 'GPT-4 Turbo (Previous Generation)',
} as const;

export type AvailableModel = keyof typeof OPENAI_MODELS;