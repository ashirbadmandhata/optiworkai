"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Users, DollarSign, BarChart, Activity } from "lucide-react"
import { Bar, BarChart as RechartsBarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase"
import { collection, query } from "firebase/firestore"
import { User, Payroll, Attendance } from "@/lib/types"
import { useAuth } from "@/hooks/use-auth"
import { useEffect, useState } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { formatCurrency } from "@/lib/utils"

export default function AdminDashboard() {
  const { user } = useAuth()
  const firestore = useFirestore();

  const usersQuery = useMemoFirebase(() => collection(firestore, 'users'), [firestore]);
  const { data: users, isLoading: usersLoading } = useCollection<User>(usersQuery);

  const payrollsQuery = useMemoFirebase(() => collection(firestore, 'payrolls'), [firestore]);
  const { data: payrolls, isLoading: payrollsLoading } = useCollection<Payroll>(payrollsQuery);

  const attendanceQuery = useMemoFirebase(() => collection(firestore, 'attendance'), [firestore]);
  const { data: attendances, isLoading: attendanceLoading } = useCollection<Attendance>(attendanceQuery);

  const [totalEmployees, setTotalEmployees] = useState(0);
  const [totalPayroll, setTotalPayroll] = useState(0);
  const [attendanceRate, setAttendanceRate] = useState(0);
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    if (users) {
      setTotalEmployees(users.length);
    }
    if (payrolls) {
      const monthlyTotal = payrolls.reduce((acc, p) => acc + p.netSalary, 0);
      setTotalPayroll(monthlyTotal);

      const monthlyData = payrolls.reduce((acc, p) => {
        const month = new Date(p.payPeriodStartDate).toLocaleString('default', { month: 'short' });
        if (!acc[month]) {
          acc[month] = { name: month, total: 0 };
        }
        acc[month].total += p.netSalary;
        return acc;
      }, {} as { [key: string]: { name: string; total: number } });

      const sortedChartData = Object.values(monthlyData).sort((a, b) => {
          const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
          return months.indexOf(a.name) - months.indexOf(b.name);
      });
      setChartData(sortedChartData);
    }
    if (attendances && users) {
        const presentCount = attendances.filter(a => a.status === 'Present').length;
        const totalPossibleDays = users.length * 30; // Assuming 30 days period
        setAttendanceRate((presentCount / totalPossibleDays) * 100);
    }
  }, [users, payrolls, attendances]);

  const isLoading = usersLoading || payrollsLoading || attendanceLoading;

  if (isLoading) {
    return (
       <div className="flex-1 space-y-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Skeleton className="col-span-4 h-96" />
            <Skeleton className="col-span-3 h-96" />
        </div>
      </div>
    )
  }
  
  return (
    <div className="flex-1 space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEmployees}</div>
            <p className="text-xs text-muted-foreground">+2 since last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Payroll</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalPayroll)}</div>
            <p className="text-xs text-muted-foreground">+5.2% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{attendanceRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">-0.5% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Now</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{users?.filter(e => e.status === 'Active').length}</div>
            <p className="text-xs text-muted-foreground">Currently on the platform</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Payroll Overview</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <ResponsiveContainer width="100%" height={350}>
              <RechartsBarChart data={chartData}>
                <XAxis
                  dataKey="name"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${formatCurrency(value / 1000)}K`}
                />
                 <Tooltip
                    formatter={(value) => formatCurrency(value as number)}
                    contentStyle={{ 
                        backgroundColor: 'hsl(var(--background))',
                        borderColor: 'hsl(var(--border))'
                    }}
                 />
                 <Legend />
                <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </RechartsBarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="col-span-4 lg:col-span-3">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Updates from across the organization.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {users?.slice(0, 4).map((employee) => (
                 <div className="flex items-center" key={employee.id}>
                     <Avatar className="h-9 w-9">
                     <AvatarImage src={employee.avatar} alt={employee.name} />
                     <AvatarFallback>{employee.name.charAt(0)}</AvatarFallback>
                     </Avatar>
                     <div className="ml-4 space-y-1">
                     <p className="text-sm font-medium leading-none">{employee.name}</p>
                     <p className="text-sm text-muted-foreground">{employee.email}</p>
                     </div>
                     <div className="ml-auto font-medium">
                         <Badge variant={employee.status === 'Active' ? 'default' : 'secondary'}>{employee.status}</Badge>
                     </div>
                 </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
