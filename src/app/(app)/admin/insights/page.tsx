"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Bot, Loader2, Sparkles } from 'lucide-react';
import { generatePayrollInsights } from '@/ai/flows/admin-generate-payroll-insights';
import { Textarea } from '@/components/ui/textarea';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import { User, Payroll, Attendance } from '@/lib/types';

export default function InsightsPage() {
  const [insights, setInsights] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const firestore = useFirestore();

  const usersQuery = useMemoFirebase(() => collection(firestore, 'users'), [firestore]);
  const { data: users, isLoading: usersLoading } = useCollection<User>(usersQuery);

  const payrollQuery = useMemoFirebase(() => collection(firestore, 'payrolls'), [firestore]);
  const { data: payrolls, isLoading: payrollsLoading } = useCollection<Payroll>(payrollQuery);

  const attendanceQuery = useMemoFirebase(() => collection(firestore, 'attendance'), [firestore]);
  const { data: attendances, isLoading: attendanceLoading } = useCollection<Attendance>(attendanceQuery);


  const handleGenerateInsights = async () => {
    setLoading(true);
    setError('');
    setInsights('');
    try {
      const result = await generatePayrollInsights({
        employeeData: JSON.stringify(users),
        attendanceData: JSON.stringify(attendances),
        payrollData: JSON.stringify(payrolls),
      });
      setInsights(result.insights);
    } catch (e) {
      console.error(e);
      setError('Failed to generate insights. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isDataLoading = usersLoading || payrollsLoading || attendanceLoading;

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="bg-primary/10 p-3 rounded-full">
              <Bot className="h-8 w-8 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl font-headline">AI-Powered Payroll Insights</CardTitle>
              <CardDescription>
                Analyze employee, attendance, and payroll data to uncover trends and anomalies.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading || isDataLoading ? (
            <div className="flex flex-col items-center justify-center gap-4 p-8 min-h-[200px]">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="text-muted-foreground">
                {loading ? 'Generating insights...' : 'Loading data...'}
              </p>
            </div>
          ) : insights ? (
            <div className="space-y-4">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-accent" />
                Generated Report
              </h3>
              <Textarea
                readOnly
                value={insights}
                className="w-full min-h-[300px] bg-muted/50 p-4 rounded-md font-code text-sm"
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-4 text-center p-8 min-h-[200px] bg-muted/30 rounded-lg border-2 border-dashed">
              <p className="text-muted-foreground">Click the button below to start the AI analysis.</p>
              <p className="text-xs text-muted-foreground max-w-sm">
                Our AI will process your organization's data to provide a concise report summarizing key findings and recommendations.
              </p>
            </div>
          )}
          {error && <p className="text-destructive text-sm mt-4 text-center">{error}</p>}
        </CardContent>
        <CardFooter className="border-t pt-6">
          <Button onClick={handleGenerateInsights} disabled={loading || isDataLoading} className="ml-auto">
            {loading || isDataLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {loading ? 'Generating...' : 'Loading Data...'}
              </>
            ) : (
              'Generate Insights'
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
