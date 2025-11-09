
'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell, Legend, Tooltip } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { Attendance, LeaveRequest } from '@/lib/types';
import { useMemo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const COLORS = {
  Present: 'hsl(var(--primary))',
  Absent: 'hsl(var(--destructive))',
  Leave: 'hsl(var(--muted-foreground))',
};

const LEAVE_COLORS = {
  Approved: 'hsl(var(--primary))',
  Pending: 'hsl(var(--muted-foreground))',
  Rejected: 'hsl(var(--destructive))',
};

export default function PerformancePage() {
  const { user } = useAuth();
  const firestore = useFirestore();

  const attendanceQuery = useMemoFirebase(() => {
    if (!user) return null;
    const today = new Date();
    const startOfYear = new Date(today.getFullYear(), 0, 1).toISOString();
    
    return query(
      collection(firestore, 'users', user.id, 'attendance'),
      where('date', '>=', startOfYear)
    );
  }, [user, firestore]);

  const { data: employeeAttendance, isLoading: attendanceLoading } = useCollection<Attendance>(attendanceQuery);

  const leaveRequestsQuery = useMemoFirebase(
    () => user ? collection(firestore, 'users', user.id, 'leaveRequests') : null,
    [user, firestore]
  );
  const { data: leaveRequests, isLoading: leavesLoading } = useCollection<LeaveRequest>(leaveRequestsQuery);

  const attendanceData = useMemo(() => {
    if (!employeeAttendance) return [];
    const monthlyData: { [key: string]: { Present: number; Absent: number; Leave: number } } = {};
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    employeeAttendance.forEach(att => {
      const month = new Date(att.date).getMonth();
      const monthName = monthNames[month];
      if (!monthlyData[monthName]) {
        monthlyData[monthName] = { Present: 0, Absent: 0, Leave: 0 };
      }
      monthlyData[monthName][att.status]++;
    });
    
    return monthNames.map(monthName => ({
        name: monthName,
        ...monthlyData[monthName]
    })).filter(d => d.Present || d.Absent || d.Leave);

  }, [employeeAttendance]);

  const leaveData = useMemo(() => {
    const counts = { Approved: 0, Pending: 0, Rejected: 0 };
    leaveRequests?.forEach(req => {
        counts[req.status]++;
    });
     return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [leaveRequests]);

  const totalDaysSoFar = employeeAttendance?.length || 0;
  const presentDays = employeeAttendance?.filter(a => a.status === 'Present').length || 0;
  const attendanceRate = totalDaysSoFar > 0 ? (presentDays / totalDaysSoFar) * 100 : 100;


  if (attendanceLoading || leavesLoading) {
    return (
        <div className="space-y-6">
            <Skeleton className="h-10 w-1/3" />
             <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-48 w-full" />
             </div>
             <div className="grid gap-6 md:grid-cols-2">
                <Skeleton className="h-80 w-full" />
                <Skeleton className="h-80 w-full" />
            </div>
        </div>
    )
  }

  return (
    <div className="space-y-6">
       <div>
        <h1 className="text-2xl font-bold font-headline">My Performance</h1>
        <p className="text-muted-foreground">Your performance metrics for this year.</p>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Attendance Rate (YTD)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">
                {attendanceRate.toFixed(0)}%
            </div>
             <p className="text-xs text-muted-foreground">Based on {totalDaysSoFar} working days this year</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Days Present</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{presentDays}</div>
            <p className="text-xs text-muted-foreground">out of {totalDaysSoFar} total working days</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Leave Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{leaveRequests?.filter(l => l.status === 'Approved').length || 0}</div>
             <p className="text-xs text-muted-foreground">days taken this year</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Yearly Attendance</CardTitle>
            <CardDescription>Overview of your presence, absence, and leaves this year.</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={attendanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="Present" stackId="a" fill={COLORS.Present} />
                <Bar dataKey="Absent" stackId="a" fill={COLORS.Absent} />
                <Bar dataKey="Leave" stackId="a" fill={COLORS.Leave} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Leave Request Status</CardTitle>
            <CardDescription>A summary of all your leave requests.</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                    <Pie data={leaveData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                        {leaveData.map((entry, index) => (
                             <Cell key={`cell-${index}`} fill={LEAVE_COLORS[entry.name as keyof typeof LEAVE_COLORS]} />
                        ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
