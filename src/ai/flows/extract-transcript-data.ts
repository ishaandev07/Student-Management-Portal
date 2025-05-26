'use server';

/**
 * @fileOverview An AI-powered tool that extracts key data points from unstructured student transcripts.
 *
 * - extractTranscriptData - A function that handles the transcript data extraction process.
 * - ExtractTranscriptDataInput - The input type for the extractTranscriptData function.
 * - ExtractTranscriptDataOutput - The return type for the extractTranscriptData function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExtractTranscriptDataInputSchema = z.object({
  transcriptDataUri: z
    .string()
    .describe(
      "A student transcript, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type ExtractTranscriptDataInput = z.infer<typeof ExtractTranscriptDataInputSchema>;

const ExtractTranscriptDataOutputSchema = z.object({
  courses: z
    .array(
      z.object({
        name: z.string().describe('The name of the course.'),
        grade: z.string().describe('The grade received in the course.'),
        credits: z.number().describe('The number of credits earned for the course.'),
      })
    )
    .describe('A list of courses extracted from the transcript.'),
  studentId: z.string().describe('The ID of the student.'),
  studentName: z.string().describe('The name of the student.'),
});
export type ExtractTranscriptDataOutput = z.infer<typeof ExtractTranscriptDataOutputSchema>;

export async function extractTranscriptData(input: ExtractTranscriptDataInput): Promise<ExtractTranscriptDataOutput> {
  return extractTranscriptDataFlow(input);
}

const prompt = ai.definePrompt({
  name: 'extractTranscriptDataPrompt',
  input: {schema: ExtractTranscriptDataInputSchema},
  output: {schema: ExtractTranscriptDataOutputSchema},
  prompt: `You are an expert at extracting data from student transcripts.

  Given a student transcript, extract the following information:

  - A list of courses, including the name, grade, and credits earned for each course.
  - The student's ID.
  - The student's name.

  Here is the transcript:

  {{media url=transcriptDataUri}}

  Ensure that the extracted data is accurate and complete.
  Return the data in JSON format.
  `,
});

const extractTranscriptDataFlow = ai.defineFlow(
  {
    name: 'extractTranscriptDataFlow',
    inputSchema: ExtractTranscriptDataInputSchema,
    outputSchema: ExtractTranscriptDataOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
