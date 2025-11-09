
"use client"
import { DataTable } from "./components/data-table";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { addDoc, collection, doc, setDoc } from "firebase/firestore";
import { Attendance, User } from "@/lib/types";
import { getColumns } from "./components/columns";
import { useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";

type AttendanceWithUserName = Attendance & { employeeName: string };

export default function AttendancePage() {
  const firestore = useFirestore();

  const usersQuery = useMemoFirebase(() => collection(firestore, 'users'), [firestore]);
  const { data: users, isLoading: usersLoading } = useCollection<User>(usersQuery);

  const attendanceQuery = useMemoFirebase(() => collection(firestore, 'attendance'), [firestore]);
  const { data: attendances, isLoading: attendanceLoading } = useCollection<Attendance>(attendanceQuery);

  const employeeUsers = useMemo(() => users?.filter(u => u.role !== 'admin') || [], [users]);

  const attendanceWithUsers = useMemo<AttendanceWithUserName[]>(() => {
    if (!attendances || !users) return [];
    return attendances.map(att => {
      const user = users.find(u => u.id === att.employeeId);
      return {
        ...att,
        employeeName: user?.name || 'Unknown',
      };
    });
  }, [attendances, users]);

  const handleAddAttendance = async (attendanceData: Omit<Attendance, 'id'>) => {
    try {
      const attendanceCollectionRef = collection(firestore, 'attendance');
      await addDoc(attendanceCollectionRef, attendanceData);

      // Also add to the user's subcollection
      const userAttendanceCollectionRef = collection(firestore, 'users', attendanceData.employeeId, 'attendance');
      await addDoc(userAttendanceCollectionRef, attendanceData);
    } catch (error) {
      console.error("Error adding attendance record:", error);
    }
  };

  const handleUpdateAttendance = async (attendanceData: Attendance) => {
    try {
      const attendanceDocRef = doc(firestore, 'attendance', attendanceData.id);
      await setDoc(attendanceDocRef, attendanceData, { merge: true });

      const userAttendanceDocRef = doc(firestore, 'users', attendanceData.employeeId, 'attendance', attendanceData.id);
       await setDoc(userAttendanceDocRef, attendanceData, { merge: true });

    } catch (error) {
      console.error("Error updating attendance record:", error);
    }
  };

  const columns = getColumns(handleUpdateAttendance);
  const isLoading = usersLoading || attendanceLoading;

  if (isLoading) {
    return (
        <div className="container mx-auto py-10">
            <Skeleton className="h-10 w-1/4 mb-6" />
            <div className="space-y-4">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
            </div>
        </div>
    )
  }


  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6 font-headline">Attendance Management</h1>
      <DataTable 
        columns={columns} 
        data={attendanceWithUsers || []} 
        users={employeeUsers}
        onAdd={handleAddAttendance} 
      />
    </div>
  );
}
