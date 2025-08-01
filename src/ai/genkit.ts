// src/ai/genkit.ts - Updated for OpenAI/Copilot
import { genkit } from 'genkit';
import { openAI } from '@genkit-ai/openai';

export const ai = genkit({
  plugins: [
    openAI({
      apiKey: process.env.OPENAI_API_KEY,
    }),
  ],
  // Use GPT-4 Turbo for best performance, or GPT-3.5-turbo for cost efficiency
  model: 'openai/gpt-4-turbo-preview',
});

// Alternative models you can use:
// 'openai/gpt-4-turbo-preview' - Best performance, higher cost
// 'openai/gpt-4' - Good performance, moderate cost  
// 'openai/gpt-3.5-turbo' - Fast and cost-effective
// 'openai/gpt-3.5-turbo-16k' - Longer context window
