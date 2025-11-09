'use server';

/**
 * @fileOverview Generates an AI-driven performance report for employees.
 *
 * - generateEmployeeReport - Generates a personalized performance report for an employee.
 * - EmployeeReportInput - The input type for the generateEmployeeReport function.
 * - EmployeeReportOutput - The return type for the generateEmployeeReport function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EmployeeReportInputSchema = z.object({
  employeeName: z.string().describe('The name of the employee.'),
  employeeId: z.string().describe('The ID of the employee.'),
  role: z.string().describe('The role of the employee.'),
  department: z.string().describe('The department of the employee.'),
  attendanceRecord: z.string().describe('The employee attendance record.'),
  performanceReview: z.string().describe('The employee performance review.'),
  achievements: z.string().describe('The employee achievements.'),
});
export type EmployeeReportInput = z.infer<typeof EmployeeReportInputSchema>;

const EmployeeReportOutputSchema = z.object({
  report: z.string().describe('The generated AI performance report for the employee.'),
});
export type EmployeeReportOutput = z.infer<typeof EmployeeReportOutputSchema>;

export async function generateEmployeeReport(input: EmployeeReportInput): Promise<EmployeeReportOutput> {
  return employeeReportFlow(input);
}

const prompt = ai.definePrompt({
  name: 'employeeReportPrompt',
  input: {schema: EmployeeReportInputSchema},
  output: {schema: EmployeeReportOutputSchema},
  prompt: `You are an AI performance report generator for employees. You will generate a report based on the employee's details and performance data.

  Employee Name: {{{employeeName}}}
  Employee ID: {{{employeeId}}}
  Role: {{{role}}}
  Department: {{{department}}}
  Attendance Record: {{{attendanceRecord}}}
  Performance Review: {{{performanceReview}}}
  Achievements: {{{achievements}}}

  Generate a detailed performance report with constructive feedback and areas of improvement. The report should be professional and easy to understand.`,
});

const employeeReportFlow = ai.defineFlow(
  {
    name: 'employeeReportFlow',
    inputSchema: EmployeeReportInputSchema,
    outputSchema: EmployeeReportOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
