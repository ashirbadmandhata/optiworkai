
"use client";

import { useDoc, useFirestore, useMemoFirebase } from "@/firebase";
import { Employee } from "@/lib/types";
import { doc } from "firebase/firestore";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Briefcase, Building, Calendar, DollarSign, Mail, Phone, User as UserIcon } from "lucide-react";

interface EmployeeDetailsCardProps {
  employeeId: string;
}

const InfoRow = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: React.ReactNode }) => (
    <div className="flex items-start gap-4">
        <div className="text-muted-foreground w-6 pt-1">{icon}</div>
        <div className="flex-1">
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="font-medium">{value}</p>
        </div>
    </div>
)


export function EmployeeDetailsCard({ employeeId }: EmployeeDetailsCardProps) {
  const firestore = useFirestore();
  const employeeDocRef = useMemoFirebase(() => doc(firestore, 'users', employeeId), [firestore, employeeId]);
  const { data: employee, isLoading } = useDoc<Employee>(employeeDocRef);
  
  if (isLoading || !employee) {
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Skeleton className="h-20 w-20 rounded-full" />
                <div className="space-y-2">
                    <Skeleton className="h-6 w-40" />
                    <Skeleton className="h-4 w-32" />
                </div>
            </div>
            <Skeleton className="h-px w-full" />
            <div className="grid gap-4 md:grid-cols-2">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
            </div>
        </div>
    );
  }

  return (
    <div className="space-y-6">
        <div className="flex flex-col items-center sm:flex-row gap-6">
            <Avatar className="h-24 w-24 border-2 border-primary">
                <AvatarImage src={employee.avatar} alt={employee.name} />
                <AvatarFallback>{employee.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="space-y-1 text-center sm:text-left">
                <h2 className="text-2xl font-bold font-headline">{employee.name}</h2>
                <p className="text-muted-foreground">{employee.designation}</p>
                <Badge variant={employee.status === 'Active' ? 'default' : 'secondary'}>{employee.status}</Badge>
            </div>
        </div>
        
        <Separator />

        <div className="grid gap-6 sm:grid-cols-2">
            <InfoRow icon={<Mail />} label="Email" value={employee.email} />
            <InfoRow icon={<Phone />} label="Phone" value={"+91 98765 43210"} />
            <InfoRow icon={<Building />} label="Department" value={employee.department} />
            <InfoRow icon={<Briefcase />} label="Position" value={employee.designation} />
            <InfoRow icon={<Calendar />} label="Joining Date" value={formatDate(employee.dateOfJoining)} />
            <InfoRow icon={<DollarSign />} label="Salary" value={formatCurrency(employee.salary)} />
        </div>
    </div>
  );
}
