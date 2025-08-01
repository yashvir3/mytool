'use server';
/**
 * @fileOverview A grammar correction AI agent.
 *
 * - correctGrammar - A function that handles the grammar correction process.
 * - CorrectGrammarInput - The input type for the correctGrammar function.
 * - CorrectGrammarOutput - The return type for the correctGrammar function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CorrectGrammarInputSchema = z.object({
  text: z.string().describe('The text to correct grammar and style.'),
  style: z.string().optional().describe('The desired writing style (e.g., Formal, Casual).'),
  knowledgeBase: z.string().optional().describe('A style guide or sample communications for the AI to reference.'),
});
export type CorrectGrammarInput = z.infer<typeof CorrectGrammarInputSchema>;

const CorrectGrammarOutputSchema = z.object({
  correctedText: z.string().describe('The corrected text.'),
});
export type CorrectGrammarOutput = z.infer<typeof CorrectGrammarOutputSchema>;

export async function correctGrammar(input: CorrectGrammarInput): Promise<CorrectGrammarOutput> {
  return correctGrammarFlow(input);
}

const prompt = ai.definePrompt({
  name: 'correctGrammarPrompt',
  input: {schema: CorrectGrammarInputSchema},
  output: {schema: CorrectGrammarOutputSchema},
  prompt: `You are an expert grammar and style corrector. You will analyze the text provided and suggest corrections to grammar and style.
{{#if knowledgeBase}}
Use the following sample comms as a reference for tone, style, and terminology:
---
{{{knowledgeBase}}}
---
{{/if}}
{{#if style}}
Adopt a {{{style}}} tone in your correction.
{{/if}}

Text: {{{text}}}

Please provide the corrected text.`,
});

const correctGrammarFlow = ai.defineFlow(
  {
    name: 'correctGrammarFlow',
    inputSchema: CorrectGrammarInputSchema,
    outputSchema: CorrectGrammarOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
