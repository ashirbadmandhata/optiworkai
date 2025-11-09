"use client"
import { useFirestore, useMemoFirebase, useCollection } from "@/firebase";
import { collectionGroup, doc, getDoc, getDocs, query, updateDoc } from "firebase/firestore";
import { DataTable } from "./components/data-table";
import { getColumns } from "./components/columns";
import { LeaveRequest, User } from "@/lib/types";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

type LeaveRequestWithUserData = LeaveRequest & { employeeName: string; userDocPath: string; };

export default function AdminLeavesPage() {
    const firestore = useFirestore();
    const [leaveRequests, setLeaveRequests] = useState<LeaveRequestWithUserData[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchLeaveRequests = async () => {
        setLoading(true);
        const leaveRequestsQuery = query(collectionGroup(firestore, 'leaveRequests'));
        const querySnapshot = await getDocs(leaveRequestsQuery);
        
        const requests: LeaveRequestWithUserData[] = await Promise.all(
            querySnapshot.docs.map(async (leaveDoc) => {
                const leaveData = leaveDoc.data() as LeaveRequest;
                const userDocRef = leaveDoc.ref.parent.parent;
                if (!userDocRef) {
                    return null;
                }
                const userSnapshot = await getDoc(userDocRef);
                const userName = userSnapshot.exists() ? (userSnapshot.data() as User).name : 'Unknown User';

                return {
                    ...leaveData,
                    id: leaveDoc.id,
                    employeeName: userName,
                    userDocPath: userDocRef.path,
                };
            })
        );
        setLeaveRequests(requests.filter(Boolean) as LeaveRequestWithUserData[]);
        setLoading(false);
    };

    useEffect(() => {
        fetchLeaveRequests();
    }, [firestore]);


    const handleUpdateStatus = async (leaveRequest: LeaveRequestWithUserData, status: "Approved" | "Rejected") => {
        if(!leaveRequest.userDocPath) return;
        const leaveDocRef = doc(firestore, leaveRequest.userDocPath, 'leaveRequests', leaveRequest.id);
        await updateDoc(leaveDocRef, { status: status });
        fetchLeaveRequests(); // Re-fetch to update the UI
    };
    
    const columns = getColumns(handleUpdateStatus);

    if (loading) {
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
            <h1 className="text-3xl font-bold mb-6 font-headline">Leave Requests Management</h1>
            <DataTable columns={columns} data={leaveRequests || []} />
        </div>
    );
}
