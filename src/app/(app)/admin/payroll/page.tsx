
"use client"
import { DataTable } from "./components/data-table";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { addDoc, collection, deleteDoc, doc, getDocs, query, where, writeBatch } from "firebase/firestore";
import { Payroll, User } from "@/lib/types";
import { getColumns } from "./components/columns";

export default function PayrollPage() {
  const firestore = useFirestore();
  
  const payrollQuery = useMemoFirebase(() => collection(firestore, 'payrolls'), [firestore]);
  const { data: payrolls, isLoading: payrollsLoading, error } = useCollection<Payroll>(payrollQuery);
  
  const usersQuery = useMemoFirebase(() => collection(firestore, 'users'), [firestore]);
  const { data: users, isLoading: usersLoading } = useCollection<User>(usersQuery);

  const handleRunPayroll = async (payrollData: Omit<Payroll, 'id'>) => {
    const batch = writeBatch(firestore);
    try {
      // Add to top-level payrolls collection for admin queries
      const topLevelPayrollRef = doc(collection(firestore, 'payrolls'));
      batch.set(topLevelPayrollRef, payrollData);
      
      // Also add to the user's subcollection
      const userPayrollRef = doc(collection(firestore, 'users', payrollData.userId, 'payrolls'));
      batch.set(userPayrollRef, payrollData);

      await batch.commit();

    } catch (error) {
      console.error("Error running payroll:", error);
    }
  };

  const findPayrollDocInUserSubcollection = async (payroll: Payroll) => {
      const q = query(
        collection(firestore, 'users', payroll.userId, 'payrolls'),
        where('payPeriodStartDate', '==', payroll.payPeriodStartDate),
        where('payPeriodEndDate', '==', payroll.payPeriodEndDate),
        where('netSalary', '==', payroll.netSalary)
      );
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        return querySnapshot.docs[0].ref;
      }
      return null;
  }

  const handleUpdateStatus = async (payroll: Payroll, status: 'Paid' | 'Pending') => {
    const batch = writeBatch(firestore);
    try {
        const topLevelDocRef = doc(firestore, 'payrolls', payroll.id);
        batch.update(topLevelDocRef, { status });

        const userSubcollectionDocRef = await findPayrollDocInUserSubcollection(payroll);
        if (userSubcollectionDocRef) {
             batch.update(userSubcollectionDocRef, { status });
        }
        await batch.commit();
    } catch (error) {
        console.error("Error updating payroll status:", error);
    }
  }

  const handleDelete = async (payroll: Payroll) => {
    if (!confirm('Are you sure you want to delete this payroll record?')) return;
    const batch = writeBatch(firestore);
    try {
        const topLevelDocRef = doc(firestore, 'payrolls', payroll.id);
        batch.delete(topLevelDocRef);

        const userSubcollectionDocRef = await findPayrollDocInUserSubcollection(payroll);
        if (userSubcollectionDocRef) {
            batch.delete(userSubcollectionDocRef);
        }
        await batch.commit();
    } catch (error) {
        console.error("Error deleting payroll record:", error);
    }
  }

  const columns = getColumns(handleUpdateStatus, handleDelete);

  const isLoading = payrollsLoading || usersLoading;

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6 font-headline">Payroll Management</h1>
      <DataTable 
        columns={columns} 
        data={payrolls || []}
        users={users || []}
        onRunPayroll={handleRunPayroll}
        isLoading={isLoading}
      />
    </div>
  );
}
