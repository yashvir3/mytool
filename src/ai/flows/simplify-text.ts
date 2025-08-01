'use server';

/**
 * @fileOverview An AI agent that simplifies complex text for a non-technical audience.
 *
 * - simplifyText - A function that handles the text simplification process.
 * - SimplifyTextInput - The input type for the simplifyText function.
 * - SimplifyTextOutput - The return type for the simplifyText function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SimplifyTextInputSchema = z.object({
  text: z.string().describe('The text to be simplified.'),
  style: z.string().optional().describe('The desired writing style for the simplified text (e.g., Formal, Casual).'),
  knowledgeBase: z.string().optional().describe('A style guide or sample communications for the AI to reference.'),
});
export type SimplifyTextInput = z.infer<typeof SimplifyTextInputSchema>;

const SimplifyTextOutputSchema = z.object({
  simplifiedText: z
    .string()
    .describe('The simplified text, made more easily understood by a non-technical audience.'),
});
export type SimplifyTextOutput = z.infer<typeof SimplifyTextOutputSchema>;

export async function simplifyText(input: SimplifyTextInput): Promise<SimplifyTextOutput> {
  return simplifyTextFlow(input);
}

const prompt = ai.definePrompt({
  name: 'simplifyTextPrompt',
  input: {schema: SimplifyTextInputSchema},
  output: {schema: SimplifyTextOutputSchema},
  prompt: `You are an expert at simplifying complex text for a non-technical audience.

{{#if knowledgeBase}}
Use the following sample comms as a reference for tone, style, and terminology:
---
{{{knowledgeBase}}}
---
{{/if}}

{{#if style}}
Simplify the following text so that it is easily understood by someone without technical expertise, while maintaining a {{{style}}} tone:
{{else}}
Please simplify the following text so that it is easily understood by someone without technical expertise:
{{/if}}

{{{text}}}
  `,
});

const simplifyTextFlow = ai.defineFlow(
  {
    name: 'simplifyTextFlow',
    inputSchema: SimplifyTextInputSchema,
    outputSchema: SimplifyTextOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
