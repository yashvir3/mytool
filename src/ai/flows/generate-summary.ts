'use server';
/**
 * @fileOverview An AI agent that summarizes documents based on a specified type.
 *
 * - generateSummary - A function that handles the document summarization.
 * - GenerateSummaryInput - The input type for the generateSummary function.
 * - GenerateSummaryOutput - The return type for the generateSummary function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateSummaryInputSchema = z.object({
  documentText: z.string().describe('The text of the document to be summarized.'),
  summaryType: z.enum(['technical', 'pir']).describe('The type of summary to generate.'),
});
export type GenerateSummaryInput = z.infer<typeof GenerateSummaryInputSchema>;

const GenerateSummaryOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the document.'),
});
export type GenerateSummaryOutput = z.infer<typeof GenerateSummaryOutputSchema>;

export async function generateSummary(input: GenerateSummaryInput): Promise<GenerateSummaryOutput> {
  return generateSummaryFlow(input);
}

// Define the detailed schema for the Technical Report
const TechnicalReportSchema = z.object({
    technicalDetails: z.object({
        incident: z.string().describe("The incident number."),
        priority: z.string().describe("The priority of the incident."),
        description: z.string().describe("A short description of the issue."),
        incidentManager: z.string().describe("The name of the Incident Manager."),
        timelineScribe: z.string().describe("The name of the Timeline Scribe."),
        nbcuProduct: z.string().describe("The NBCU Product affected."),
    }),
    systemsAffected: z.object({
        impactedDevices: z.string().describe("The devices impacted by the incident."),
        servicesImpacted: z.string().describe("The services or products impacted."),
    }),
    investigationSteps: z.string().describe("A summary of the investigation steps taken."),
    rootCauseAnalysis: z.string().describe("An analysis of the root cause of the incident."),
    resolutionSteps: z.string().describe("The steps taken to resolve the incident, including which team took action."),
    preventionMeasures: z.string().describe("Steps that should be taken to prevent this from happening in the future."),
    communication: z.object({
        teamsEngaged: z.string().describe("A list of all workgroups and individuals engaged during the incident."),
    }),
});

const technicalPrompt = ai.definePrompt({
    name: 'technicalSummaryPrompt',
    input: {schema: z.object({ documentText: z.string() })},
    output: {schema: TechnicalReportSchema},
    prompt: `You are an expert incident analyst. Analyze the provided incident document and extract the required information to fill out a structured report.
You MUST fill in every field. If information for a field is not available in the document, you MUST write 'N/A'.

Document:
---
{{{documentText}}}
---`,
});


// Define the detailed schema for the Post-Incident Review (PIR)
const PirReportSchema = z.object({
    problemStatement: z.string().describe("A clear and concise statement of the problem that occurred."),
    majorTimestamps: z.object({
        businessImpactStart: z.string().describe("The time when the incident's impact on the business was first identified."),
        detectionTime: z.string().describe("The time when the incident was reported to the Incident Management Team."),
        lastReassignmentTime: z.string().describe("The time when the correct fixing agent or team was engaged."),
        actionTime: z.string().describe("The time when the fixing agent took the first step to mitigate or resolve the incident."),
        mitigationTime: z.string().describe("The time when the incident was mitigated and customer impact was resolved."),
    }),
    changeDetails: z.object({
        causedByChange: z.string().describe("The change number or description that caused the incident. Should be 'N/A' if not caused by a change."),
        resolvedByChange: z.string().describe("The change number or description that resolved the incident. Should be 'N/A' if not applicable."),
    }),
    concernAndRecommendation: z.string().describe("Any concerns raised during the incident and recommendations for future prevention."),
    resolutionSummary: z.string().describe("A brief summary of what was done to resolve the incident."),
});


const pirPrompt = ai.definePrompt({
  name: 'pirSummaryPrompt',
  input: {schema: z.object({ documentText: z.string() })},
  output: {schema: PirReportSchema},
  prompt: `You are an expert incident report analyst. Your task is to read the following incident timeline and generate a structured Post-Incident Review (PIR) report.

Analyze the document below and extract the required information. You MUST answer every question and include every field. If a piece of information is not available in the document, you MUST indicate that with 'N/A'. Do not omit any fields.

Document:
---
{{{documentText}}}
---
`,
});

const generateSummaryFlow = ai.defineFlow(
  {
    name: 'generateSummaryFlow',
    inputSchema: GenerateSummaryInputSchema,
    outputSchema: GenerateSummaryOutputSchema,
  },
  async (input) => {
    if (input.summaryType === 'technical') {
        const { output } = await technicalPrompt({ documentText: input.documentText });
        if (!output) {
            throw new Error('Technical summary generation failed.');
        }

        const {
            technicalDetails,
            systemsAffected,
            investigationSteps,
            rootCauseAnalysis,
            resolutionSteps,
            preventionMeasures,
            communication,
        } = output;

        const formattedSummary = `Technical Report

TECHNICAL DETAILS
Incident: ${technicalDetails.incident}
Priority: ${technicalDetails.priority}
Description: ${technicalDetails.description}
Incident Manager: ${technicalDetails.incidentManager}
Timeline Scribe: ${technicalDetails.timelineScribe}
NBCU Product: ${technicalDetails.nbcuProduct}

SYSTEMS AFFECTED
Impacted Devices: ${systemsAffected.impactedDevices}
Services Impacted: ${systemsAffected.servicesImpacted}

INVESTIGATION STEPS
${investigationSteps}

ROOT CAUSE ANALYSIS
${rootCauseAnalysis}

RESOLUTION STEPS
${resolutionSteps}

PREVENTION MEASURES
${preventionMeasures}

COMMUNICATION
Teams Engaged: ${communication.teamsEngaged}
`;
        return { summary: formattedSummary };

    } else if (input.summaryType === 'pir') {
        const { output } = await pirPrompt({ documentText: input.documentText });
        if (!output) {
            throw new Error('PIR summary generation failed.');
        }
        
        const {
            problemStatement,
            majorTimestamps,
            changeDetails,
            concernAndRecommendation,
            resolutionSummary,
        } = output;

        const formattedSummary = `Problem Statement:
${problemStatement}

Major Timestamp:-
1. Start of Business impact(when the incident was identified) -->
${majorTimestamps.businessImpactStart}
2. Detected Time(when the incident was reported to Incident Management Team) -->
${majorTimestamps.detectionTime}
3. Last reassignment Group time(when the fix agent was reached out) -->
${majorTimestamps.lastReassignmentTime}
4. Action time(when did the fix agent took first step to mitigate/resolve the incident) -->
${majorTimestamps.actionTime}
5. Mitigated Time( When was the incident mitigated and Customer impact was resolved)-->
${majorTimestamps.mitigationTime}

Caused by Change:-
${changeDetails.causedByChange}

Resolved by Change:-
${changeDetails.resolvedByChange}

Concern/ Recommendation:-
${concernAndRecommendation}

Resolution Summary:
${resolutionSummary}
`;
        return { summary: formattedSummary };
    } else {
        throw new Error(`Unknown summary type: ${input.summaryType}`);
    }
  }
);
