
"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ArrowRight, CalendarDays, DollarSign, FileText, Download } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query, where, limit, orderBy } from "firebase/firestore";
import { Payroll, Attendance, LeaveRequest } from "@/lib/types";
import jsPDF from 'jspdf';

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const firestore = useFirestore();

  const payrollQuery = useMemoFirebase(() => 
    user ? query(collection(firestore, 'users', user.id, 'payrolls'), orderBy('payPeriodEndDate', 'desc'), limit(3)) : null,
    [user, firestore]
  );
  const { data: employeePayroll } = useCollection<Payroll>(payrollQuery);

  const attendanceQuery = useMemoFirebase(() => {
    if (!user) return null;
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString();
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString();
    
    return query(
      collection(firestore, 'users', user.id, 'attendance'),
      where('date', '>=', startOfMonth),
      where('date', '<=', endOfMonth)
    );
  }, [user, firestore]);
  const { data: employeeAttendance } = useCollection<Attendance>(attendanceQuery);

  const leaveQuery = useMemoFirebase(() => 
    user ? query(collection(firestore, 'users', user.id, 'leaveRequests'), where('status', '==', 'Pending')) : null,
    [user, firestore]
  );
  const { data: pendingLeaves } = useCollection<LeaveRequest>(leaveQuery);
  
  const approvedLeaveQuery = useMemoFirebase(() => 
  user ? query(collection(firestore, 'users', user.id, 'leaveRequests'), where('status', '==', 'Approved')) : null,
  [user, firestore]
);
const { data: approvedLeaves } = useCollection<LeaveRequest>(approvedLeaveQuery);


  const presentDays = employeeAttendance?.filter(a => a.status === 'Present').length || 0;
  const totalDaysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
  const attendancePercentage = employeeAttendance ? (presentDays / totalDaysInMonth) * 100 : 0;
  const leaveDays = employeeAttendance?.filter(a => a.status === 'Leave').length || 0;

  const handleDownloadSlip = (payout: Payroll) => {
    if (!user) return;
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    let y = 20;

    // Header with gradient
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    const gradient = doc.context2d.createLinearGradient(0, 0, 80, 0);
    gradient.addColorStop(0, '#86efac'); // light green
    gradient.addColorStop(1, '#facc15'); // yellow
    doc.context2d.fillStyle = gradient;
    doc.text("optai", margin, y);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 100, 100);
    doc.text("123 Tech Avenue, Silicon Valley, CA 94043", margin, y += 7);
    
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    doc.text("Pay Slip", pageWidth - margin, y - 7, { align: "right" });

    y += 15;
    doc.setDrawColor(230, 230, 230);
    doc.line(margin, y, pageWidth - margin, y);
    y += 10;
    
    // Employee & Pay Period Details
    doc.setFontSize(10);
    const col1 = margin;
    const col2 = pageWidth / 2;

    doc.setFont("helvetica", "bold");
    doc.text("Employee Name:", col1, y);
    doc.setFont("helvetica", "normal");
    doc.text(user.name, col1 + 40, y);
    
    doc.setFont("helvetica", "bold");
    doc.text("Pay Period:", col2, y);
    doc.setFont("helvetica", "normal");
    doc.text(`${formatDate(payout.payPeriodStartDate)} - ${formatDate(payout.payPeriodEndDate)}`, col2 + 40, y);
    y += 7;

    doc.setFont("helvetica", "bold");
    doc.text("Designation:", col1, y);
    doc.setFont("helvetica", "normal");
    doc.text(user.designation || 'N/A', col1 + 40, y);

    doc.setFont("helvetica", "bold");
    doc.text("Payment Date:", col2, y);
    doc.setFont("helvetica", "normal");
    doc.text(formatDate(new Date().toISOString()), col2 + 40, y);
    y += 7;

    doc.setFont("helvetica", "bold");
    doc.text("Department:", col1, y);
    doc.setFont("helvetica", "normal");
    doc.text(user.department || 'N/A', col1 + 40, y);
    y += 15;

    // Earnings and Deductions Table
    doc.setDrawColor(180, 180, 180);
    doc.line(margin, y, pageWidth - margin, y);
    y += 7;
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Earnings", col1, y);
    doc.text("Amount", col2 - 20, y, { align: 'right' });
    doc.text("Deductions", col2, y);
    doc.text("Amount", pageWidth - margin, y, { align: 'right' });
    y += 5;
    doc.line(margin, y, pageWidth - margin, y);
    y += 7;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");

    // Earnings
    doc.text("Gross Salary", col1, y);
    doc.text(formatCurrency(payout.grossSalary, 'INR'), col2 - 20, y, { align: 'right' });
    
    // Deductions
    doc.text("Tax", col2, y);
    doc.text(formatCurrency(payout.tax, 'INR'), pageWidth - margin, y, { align: 'right' });
    y += 7;
    doc.text("Other Deductions", col2, y);
    doc.text(formatCurrency(payout.deductions, 'INR'), pageWidth - margin, y, { align: 'right' });
    
    if (payout.deductionReason) {
      y += 5;
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(`(${payout.deductionReason})`, col2, y);
      doc.setTextColor(0);
    }
    
    y += 15;
    doc.line(margin, y, pageWidth - margin, y);
    y += 7;

    // Totals
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("Total Earnings", col1, y);
    doc.text(formatCurrency(payout.grossSalary, 'INR'), col2 - 20, y, { align: 'right' });

    const totalDeductions = payout.tax + payout.deductions;
    doc.text("Total Deductions", col2, y);
    doc.text(formatCurrency(totalDeductions, 'INR'), pageWidth - margin, y, { align: 'right' });
    y += 10;
    doc.line(margin, y, pageWidth - margin, y);
    y += 10;

    // Net Salary
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Net Salary", col1, y);
    doc.text(formatCurrency(payout.netSalary, 'INR'), pageWidth - margin, y, { align: 'right' });
    y += 15;

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text("This is a computer-generated payslip and does not require a signature.", pageWidth / 2, y, { align: 'center' });

    doc.save(`Payslip-${payout.payPeriodStartDate}-${payout.payPeriodEndDate}.pdf`);
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex-1 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-headline">Welcome back, {user.name}!</h1>
          <p className="text-muted-foreground">Here's a summary of your activity.</p>
        </div>
        <Button asChild>
          <Link href="/employee/leaves">
            Request Leave
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Net Salary</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(employeePayroll?.[0]?.netSalary || 0, "INR")}</div>
            <p className="text-xs text-muted-foreground">For pay period ending {formatDate(employeePayroll?.[0]?.payPeriodEndDate || new Date().toISOString())}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Attendance This Month</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{presentDays} / {totalDaysInMonth} Days</div>
            <p className="text-xs text-muted-foreground">{leaveDays} days on leave</p>
            <Progress value={attendancePercentage} className="mt-2 h-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Leave Requests</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingLeaves?.length || 0} Pending</div>
            <p className="text-xs text-muted-foreground">{approvedLeaves?.length || 0} approved this year</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Payouts</CardTitle>
          <CardDescription>Your last three salary payments.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pay Period</TableHead>
                <TableHead>Gross Salary</TableHead>
                <TableHead>Deductions</TableHead>
                <TableHead className="text-right">Net Salary</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employeePayroll?.map((payout) => (
                <TableRow key={payout.id}>
                  <TableCell>{formatDate(payout.payPeriodStartDate)} - {formatDate(payout.payPeriodEndDate)}</TableCell>
                  <TableCell>{formatCurrency(payout.grossSalary, 'INR')}</TableCell>
                  <TableCell className="text-destructive">-{formatCurrency(payout.deductions + payout.tax, 'INR')}</TableCell>
                  <TableCell className="text-right font-medium">{formatCurrency(payout.netSalary, 'INR')}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant={payout.status === 'Paid' ? 'default' : 'secondary'}>{payout.status}</Badge>
                  </TableCell>
                   <TableCell className="text-right">
                    <Button variant="outline" size="sm" onClick={() => handleDownloadSlip(payout)}>
                      <Download className="mr-2 h-4 w-4" />
                      Download Slip
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {!employeePayroll?.length && (
                <TableRow>
                    <TableCell colSpan={6} className="text-center h-24">
                        No payroll data found.
                    </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
