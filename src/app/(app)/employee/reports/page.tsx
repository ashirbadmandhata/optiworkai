
"use client";

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Bot, Download, FileText, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { generateEmployeeReport } from '@/ai/flows/employee-download-ai-report';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import { Attendance } from '@/lib/types';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function EmployeeReportsPage() {
  const { user } = useAuth();
  const firestore = useFirestore();
  const reportRef = useRef<HTMLDivElement>(null);

  const [report, setReport] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const attendanceQuery = useMemoFirebase(
    () => (user ? collection(firestore, 'users', user.id, 'attendance') : null),
    [user, firestore]
  );
  const { data: attendanceData, isLoading: attendanceLoading } = useCollection<Attendance>(attendanceQuery);

  const handleGenerateReport = async () => {
    if (!user) return;

    setLoading(true);
    setError('');
    setReport('');

    // Process attendance data
    const totalRecords = attendanceData?.length || 0;
    const presentCount = attendanceData?.filter(a => a.status === 'Present').length || 0;
    const attendancePercentage = totalRecords > 0 ? (presentCount / totalRecords) * 100 : 100;
    const attendanceRecordSummary = `Attendance: ${attendancePercentage.toFixed(2)}% (${presentCount}/${totalRecords} days present).`;

    try {
      const result = await generateEmployeeReport({
        employeeName: user.name,
        employeeId: user.id,
        role: user.designation || 'N/A',
        department: user.department || 'N/A',
        attendanceRecord: attendanceRecordSummary,
        // NOTE: Performance Review and Achievements are placeholders as the data model doesn't support them yet.
        performanceReview: 'Exceeded targets in Q2. Shows great initiative and teamwork.',
        achievements: 'Lead on Project Phoenix, resulting in a 15% efficiency gain.',
      });
      setReport(result.report);
    } catch (e) {
      console.error(e);
      setError('Failed to generate report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPdf = () => {
    if (reportRef.current) {
      html2canvas(reportRef.current).then((canvas) => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'px', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save('performance-report.pdf');
      });
    }
  };
  
  const isDataLoading = loading || attendanceLoading;

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="bg-primary/10 p-3 rounded-full">
              <FileText className="h-8 w-8 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl font-headline">AI Performance Report</CardTitle>
              <CardDescription>
                Generate a personalized performance report with constructive feedback and areas for improvement.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {!report && !isDataLoading && (
             <div className="flex flex-col items-center justify-center gap-4 text-center p-8 min-h-[200px] bg-muted/30 rounded-lg border-2 border-dashed">
                <Bot className="h-10 w-10 text-muted-foreground" />
                <p className="text-muted-foreground">Your AI-generated report is just a click away.</p>
                <Button onClick={handleGenerateReport}>Generate My Report</Button>
            </div>
          )}
           {isDataLoading && (
            <div className="flex flex-col items-center justify-center gap-4 p-8 min-h-[200px]">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="text-muted-foreground">Our AI is analyzing your performance data...</p>
            </div>
          )}
          {report && (
            <div ref={reportRef} className="prose dark:prose-invert max-w-none p-6 bg-muted/50 rounded-md font-serif">
                <h2 className="font-headline">Your Performance Summary</h2>
                {report.split('\n').map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                ))}
            </div>
          )}
          {error && <p className="text-destructive text-sm mt-4 text-center">{error}</p>}
        </CardContent>
        {report && (
          <CardFooter className="border-t pt-6">
            <Button onClick={handleDownloadPdf} className="ml-auto">
              <Download className="mr-2 h-4 w-4" />
              Download as PDF
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
