'use server';
/**
 * @fileOverview An AI-powered chat interface for employees to interact with HR.
 *
 * - employeeAIChatWithHR - A function that handles the chat with HR process.
 * - EmployeeAIChatWithHRInput - The input type for the employeeAIChatWithHR function.
 * - EmployeeAIChatWithHROutput - The return type for the employeeAIChatWithHR function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EmployeeAIChatWithHRInputSchema = z.object({
  message: z.string().describe('The message from the employee to HR.'),
  leaveRequests: z.string().describe("A JSON string of the user's leave requests."),
});
export type EmployeeAIChatWithHRInput = z.infer<typeof EmployeeAIChatWithHRInputSchema>;

const EmployeeAIChatWithHROutputSchema = z.object({
  response: z.string().describe('The response from the AI assistant. '),
});
export type EmployeeAIChatWithHROutput = z.infer<typeof EmployeeAIChatWithHROutputSchema>;

export async function employeeAIChatWithHR(input: EmployeeAIChatWithHRInput): Promise<EmployeeAIChatWithHROutput> {
  return employeeAIChatWithHRFlow(input);
}

const prompt = ai.definePrompt({
  name: 'employeeAIChatWithHRPrompt',
  input: {schema: EmployeeAIChatWithHRInputSchema},
  output: {schema: EmployeeAIChatWithHROutputSchema},
  prompt: `You are an AI assistant for HR, that will respond to employee questions.

  If the employee asks about their leave requests, use the provided data to answer.

  Leave Requests Data: {{{leaveRequests}}}

  Respond to the following message from the employee:
  {{{message}}}`,
});

const employeeAIChatWithHRFlow = ai.defineFlow(
  {
    name: 'employeeAIChatWithHRFlow',
    inputSchema: EmployeeAIChatWithHRInputSchema,
    outputSchema: EmployeeAIChatWithHROutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
