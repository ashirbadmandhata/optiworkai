"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { addDoc, collection } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { cn, formatDate } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { LeaveRequest } from "@/lib/types";

const statusVariant = {
  Pending: "secondary",
  Approved: "default",
  Rejected: "destructive",
};

export default function LeavesPage() {
  const { user } = useAuth();
  const firestore = useFirestore();

  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [reason, setReason] = useState("");
  const [leaveType, setLeaveType] = useState("Annual Leave");

  const leaveRequestsQuery = useMemoFirebase(
    () =>
      user ? collection(firestore, "users", user.id, "leaveRequests") : null,
    [user, firestore]
  );

  const { data: leaveRequests, isLoading } =
    useCollection<LeaveRequest>(leaveRequestsQuery);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !startDate || !endDate || !reason) {
      alert("Please fill all fields");
      return;
    }

    const newLeaveRequest: Omit<LeaveRequest, "id" | "status" > = {
      userId: user.id,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      reason,
      status: "Pending",
    };

    if (leaveRequestsQuery) {
        await addDoc(leaveRequestsQuery, newLeaveRequest);
    }

    setStartDate(undefined);
    setEndDate(undefined);
    setReason("");
  };

  return (
    <div className="grid gap-8 md:grid-cols-3">
      <div className="md:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle>Apply for Leave</CardTitle>
            <CardDescription>
              Fill out the form to request time off.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="leave-type">Leave Type</Label>
                <Input
                  id="leave-type"
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="start-date">Start Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "justify-start text-left font-normal",
                          !startDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {startDate ? formatDate(startDate.toISOString()) : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={setStartDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="end-date">End Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "justify-start text-left font-normal",
                          !endDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {endDate ? formatDate(endDate.toISOString()) : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={endDate}
                        onSelect={setEndDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="reason">Reason</Label>
                <Textarea
                  id="reason"
                  placeholder="Please provide a brief reason for your leave."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
              </div>
              <Button type="submit" className="w-full">
                Submit Request
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <div className="md:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Leave History</CardTitle>
            <CardDescription>
              A record of your past leave requests.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading && (
                    <TableRow>
                        <TableCell colSpan={4} className="text-center">Loading...</TableCell>
                    </TableRow>
                )}
                {leaveRequests?.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>{formatDate(request.startDate)}</TableCell>
                    <TableCell>{formatDate(request.endDate)}</TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {request.reason}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge
                        variant={statusVariant[request.status] as any}
                      >
                        {request.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
