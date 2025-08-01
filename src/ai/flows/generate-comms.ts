'use server';
/**
 * @fileOverview An AI agent that generates communications based on an incident summary.
 *
 * - generateComms - A function that handles the communication generation process.
 * - GenerateCommsInput - The input type for the generateComms function.
 * - GenerateCommsOutput - The return type for the generateComms function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateCommsInputSchema = z.object({
  analysis: z.string().describe('The summary of the incident analysis.'),
  knowledgeBase: z.string().optional().describe('A style guide or sample communications for the AI to reference.'),
});
export type GenerateCommsInput = z.infer<typeof GenerateCommsInputSchema>;

const GenerateCommsOutputSchema = z.object({
  communication: z.string().describe('The generated communication text.'),
});
export type GenerateCommsOutput = z.infer<typeof GenerateCommsOutputSchema>;

export async function generateComms(input: GenerateCommsInput): Promise<GenerateCommsOutput> {
  return generateCommsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateCommsPrompt',
  input: {schema: GenerateCommsInputSchema},
  output: {schema: GenerateCommsOutputSchema},
  prompt: `You are an expert communications manager. Your task is to write a clear and concise communication based on the provided incident analysis summary.
{{#if knowledgeBase}}
Use the following sample comms as a reference for tone, style, and terminology:
---
{{{knowledgeBase}}}
---
{{/if}}

Please draft a communication based on the following analysis:
---
{{{analysis}}}
---
`,
});

const generateCommsFlow = ai.defineFlow(
  {
    name: 'generateCommsFlow',
    inputSchema: GenerateCommsInputSchema,
    outputSchema: GenerateCommsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
