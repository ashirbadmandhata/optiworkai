'use server';

/**
 * @fileOverview Generates AI-driven insights and reports on employee data, attendance, and payroll trends for admin users.
 *
 * - generatePayrollInsights - A function that generates payroll insights.
 * - GeneratePayrollInsightsInput - The input type for the generatePayrollInsights function.
 * - GeneratePayrollInsightsOutput - The return type for the generatePayrollInsights function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GeneratePayrollInsightsInputSchema = z.object({
  employeeData: z.string().describe('Employee data in JSON format.'),
  attendanceData: z.string().describe('Attendance data in JSON format.'),
  payrollData: z.string().describe('Payroll data in JSON format.'),
});
export type GeneratePayrollInsightsInput = z.infer<typeof GeneratePayrollInsightsInputSchema>;

const GeneratePayrollInsightsOutputSchema = z.object({
  insights: z.string().describe('AI-driven insights and reports on payroll trends.'),
});
export type GeneratePayrollInsightsOutput = z.infer<typeof GeneratePayrollInsightsOutputSchema>;

export async function generatePayrollInsights(input: GeneratePayrollInsightsInput): Promise<GeneratePayrollInsightsOutput> {
  return generatePayrollInsightsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generatePayrollInsightsPrompt',
  input: {schema: GeneratePayrollInsightsInputSchema},
  output: {schema: GeneratePayrollInsightsOutputSchema},
  prompt: `You are an AI assistant tasked with generating insights and reports on employee data, attendance, and payroll trends.

  Analyze the following data to identify key trends, anomalies, and areas for improvement in payroll management.

  Employee Data: {{{employeeData}}}
  Attendance Data: {{{attendanceData}}}
  Payroll Data: {{{payrollData}}}

  Provide a concise report summarizing your findings and recommendations.
  `,
});

const generatePayrollInsightsFlow = ai.defineFlow(
  {
    name: 'generatePayrollInsightsFlow',
    inputSchema: GeneratePayrollInsightsInputSchema,
    outputSchema: GeneratePayrollInsightsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
