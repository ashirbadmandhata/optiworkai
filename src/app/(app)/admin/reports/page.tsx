"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, FileSpreadsheet, HandCoins, Users } from "lucide-react";
import jsPDF from 'jspdf';
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection } from "firebase/firestore";
import { Attendance, Payroll, User } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/utils";


const reportTypes = [
  {
    title: "Full Payroll Summary",
    description: "A complete summary of all payroll transactions for the selected period.",
    icon: <HandCoins className="h-8 w-8 text-primary" />,
    id: "payroll",
  },
  {
    title: "Employee Data Report",
    description: "An export of all active employee information, including contact details and positions.",
    icon: <Users className="h-8 w-8 text-primary" />,
    id: "employees",
  },
  {
    title: "Attendance Log",
    description: "Detailed attendance records for all employees, including leaves and absences.",
    icon: <FileSpreadsheet className="h-8 w-8 text-primary" />,
    id: "attendance",
  },
];

export default function AdminReportsPage() {
  const firestore = useFirestore();

  const { data: users } = useCollection<User>(useMemoFirebase(() => collection(firestore, 'users'), [firestore]));
  const { data: payrolls } = useCollection<Payroll>(useMemoFirebase(() => collection(firestore, 'payrolls'), [firestore]));
  const { data: attendances } = useCollection<Attendance>(useMemoFirebase(() => collection(firestore, 'attendance'), [firestore]));

  const generatePdf = (reportId: string) => {
    const doc = new jsPDF();
    
    doc.setFontSize(22);
    doc.text("optai Report", 105, 20, { align: 'center' });
    doc.setFontSize(12);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 105, 28, { align: 'center' });
    
    doc.setLineWidth(0.5);
    doc.line(20, 35, 190, 35);
    
    let y = 45;

    switch(reportId) {
      case 'payroll':
        doc.setFontSize(18);
        doc.text("Full Payroll Summary", 20, y);
        y += 10;
        payrolls?.forEach(p => {
          const user = users?.find(u => u.id === p.userId);
          doc.setFontSize(12);
          doc.text(`Employee: ${user?.name || p.userId}`, 20, y);
          y+= 7;
          doc.setFontSize(10);
          doc.text(`Pay Period: ${formatDate(p.payPeriodStartDate)} - ${formatDate(p.payPeriodEndDate)}`, 25, y);
          doc.text(`Net Salary: ${formatCurrency(p.netSalary)}`, 130, y);
          y+= 7;
        });
        break;
      case 'employees':
        doc.setFontSize(18);
        doc.text("Employee Data Report", 20, y);
        y += 10;
        users?.forEach(u => {
          doc.setFontSize(12);
          doc.text(`Name: ${u.name}`, 20, y);
          y+=7;
          doc.setFontSize(10);
          doc.text(`Email: ${u.email} | Position: ${u.designation} | Department: ${u.department} | Status: ${u.status}`, 25, y);
          y+=7;
        });
        break;
      case 'attendance':
        doc.setFontSize(18);
        doc.text("Attendance Log", 20, y);
        y += 10;
        attendances?.forEach(a => {
           const user = users?.find(u => u.id === a.employeeId);
           doc.setFontSize(10);
           doc.text(`Date: ${formatDate(a.date)} | Employee: ${user?.name || a.employeeId} | Status: ${a.status}`, 20, y);
           y+=7;
           if(y > 280) { // Add new page if content overflows
             doc.addPage();
             y = 20;
           }
        });
        break;
    }

    doc.save(`${reportId}-report.pdf`);
  }

  return (
    <div className="container mx-auto py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-headline">Company Reports</h1>
        <p className="text-muted-foreground">Generate and download reports for your records.</p>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {reportTypes.map((report) => (
          <Card key={report.title} className="flex flex-col">
            <CardHeader className="flex flex-row items-start gap-4 space-y-0">
               <div className="bg-primary/10 p-3 rounded-full">
                {report.icon}
               </div>
              <div className="grid gap-1">
                <CardTitle>{report.title}</CardTitle>
                <CardDescription>
                  {report.description}
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="flex-1" />
            <CardFooter>
              <Button className="w-full" onClick={() => generatePdf(report.id)}>
                <Download className="mr-2 h-4 w-4" />
                Download PDF
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
