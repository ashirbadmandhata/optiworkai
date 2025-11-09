"use client"
import { getColumns } from "./components/columns";
import { DataTable } from "./components/data-table";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { addDoc, collection, doc, setDoc } from "firebase/firestore";
import { Employee } from "@/lib/types";

export default function EmployeesPage() {
  const firestore = useFirestore();
  const employeesQuery = useMemoFirebase(() => collection(firestore, 'users'), [firestore]);
  const { data: employees, isLoading } = useCollection<Employee>(employeesQuery);

  const handleAddEmployee = async (employeeData: Omit<Employee, 'id'>) => {
    try {
      await addDoc(collection(firestore, 'users'), {
        ...employeeData,
        avatar: `https://i.pravatar.cc/150?u=${Math.random()}`,
        dateOfJoining: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error adding employee:", error);
    }
  };

  const handleUpdateEmployee = async (employeeData: Employee) => {
    try {
      const employeeDocRef = doc(firestore, 'users', employeeData.id);
      await setDoc(employeeDocRef, employeeData, { merge: true });
    } catch (error) {
      console.error("Error updating employee:", error);
    }
  };

  const columns = getColumns(handleUpdateEmployee);

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6 font-headline">Employee Management</h1>
      <DataTable 
        columns={columns} 
        data={employees || []} 
        onAdd={handleAddEmployee} 
      />
    </div>
  );
}
