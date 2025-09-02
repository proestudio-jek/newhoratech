'use server';
/**
 * @fileOverview An AI agent that suggests hymns for a given date,
 * considering the liturgical calendar and the hymn's text and tune.
 *
 * - suggestHymnsForDate - A function that suggests hymns for a given date.
 * - SuggestHymnsForDateInput - The input type for the suggestHymnsForDate function.
 * - SuggestHymnsForDateOutput - The return type for the suggestHymnsForDate function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestHymnsForDateInputSchema = z.object({
  date: z
    .string()
    .describe(
      'The date for which to suggest hymns, in ISO 8601 format (YYYY-MM-DD).'
    ),
  liturgicalCalendarInfo: z
    .string()
    .describe(
      'Information about the liturgical calendar for the given date, including the Sunday, feast day, or holiday.'
    ),
});
export type SuggestHymnsForDateInput = z.infer<typeof SuggestHymnsForDateInputSchema>;

const SuggestHymnsForDateOutputSchema = z.object({
  hymnSuggestions: z
    .array(z.string())
    .describe(
      'An array of hymn suggestions appropriate for the given date and liturgical calendar information.'
    ),
});
export type SuggestHymnsForDateOutput = z.infer<typeof SuggestHymnsForDateOutputSchema>;

export async function suggestHymnsForDate(input: SuggestHymnsForDateInput): Promise<SuggestHymnsForDateOutput> {
  return suggestHymnsForDateFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestHymnsForDatePrompt',
  input: {schema: SuggestHymnsForDateInputSchema},
  output: {schema: SuggestHymnsForDateOutputSchema},
  prompt: `You are a knowledgeable assistant for suggesting hymns for church services, particularly suited for the Semente da Fé website.

Given the date and information about the liturgical calendar, suggest a list of hymns that would be appropriate. Consider both the text and the tune of the hymns in relation to the liturgical context.

Date: {{{date}}}
Liturgical Calendar Info: {{{liturgicalCalendarInfo}}}

Please provide a list of hymn suggestions. Be specific and include hymn titles or numbers.
`,
});

const suggestHymnsForDateFlow = ai.defineFlow(
  {
    name: 'suggestHymnsForDateFlow',
    inputSchema: SuggestHymnsForDateInputSchema,
    outputSchema: SuggestHymnsForDateOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
