"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal } from "lucide-react"
import React from 'react'

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Employee } from "@/lib/types"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { formatCurrency, formatDate } from "@/lib/utils"
import { EmployeeForm } from "./employee-form"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { deleteDoc, doc } from "firebase/firestore"
import { useFirestore } from "@/firebase"
import { EmployeeDetailsCard } from "./employee-details-card"

export const getColumns = (onUpdate: (employee: Employee) => void): ColumnDef<Employee>[] => {
  const DeleteMenuItem = ({ employeeId }: { employeeId: string }) => {
    const firestore = useFirestore();
    const handleDelete = () => {
      if (confirm('Are you sure you want to delete this employee?')) {
        const employeeDocRef = doc(firestore, 'users', employeeId);
        deleteDoc(employeeDocRef);
      }
    };

    return <DropdownMenuItem onClick={handleDelete} className="text-destructive">Delete employee</DropdownMenuItem>;
  };
  
  return [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: "Employee",
    cell: ({ row }) => {
      const employee = row.original;
      return (
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={employee.avatar} alt={employee.name} />
            <AvatarFallback>{employee.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="grid gap-0.5">
            <span className="font-medium">{employee.name}</span>
            <span className="text-xs text-muted-foreground">{employee.email}</span>
          </div>
        </div>
      )
    }
  },
  {
    accessorKey: "department",
    header: "Department",
  },
  {
    accessorKey: "designation",
    header: "Position",
  },
  {
    accessorKey: "dateOfJoining",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Joining Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => formatDate(row.getValue("dateOfJoining")),
  },
  {
    accessorKey: "salary",
    header: () => <div className="text-right">Salary</div>,
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("salary"))
      return <div className="text-right font-medium">{formatCurrency(amount, 'INR')}</div>
    },
  },
    {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
        const status = row.getValue("status") as string;
        const variant = status === 'Active' ? 'default' : status === 'On Leave' ? 'secondary' : 'destructive';
        return <Badge variant={variant as any}>{status}</Badge>
    }
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const employee = row.original
      const [isEditOpen, setIsEditOpen] = React.useState(false);
      const [isViewOpen, setIsViewOpen] = React.useState(false);

      return (
        <div className="text-right">
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
            <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
                <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem
                    onClick={() => navigator.clipboard.writeText(employee.id)}
                    >
                    Copy employee ID
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DialogTrigger asChild onSelect={(e) => { e.preventDefault(); setIsViewOpen(true); }}>
                        <DropdownMenuItem>View details</DropdownMenuItem>
                    </DialogTrigger>
                    <DialogTrigger asChild onSelect={(e) => { e.preventDefault(); setIsEditOpen(true); }}>
                        <DropdownMenuItem>Edit employee</DropdownMenuItem>
                    </DialogTrigger>
                    <DeleteMenuItem employeeId={employee.id} />
                </DropdownMenuContent>
                </DropdownMenu>

                {/* View Details Dialog */}
                <DialogContent className="max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Employee Details</DialogTitle>
                        <DialogDescription>
                            A complete overview of {employee.name}'s profile.
                        </DialogDescription>
                    </DialogHeader>
                    <EmployeeDetailsCard employeeId={employee.id} />
                </DialogContent>
            </Dialog>

            {/* Edit Employee Dialog */}
            <DialogContent className="max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Edit Employee</DialogTitle>
                </DialogHeader>
                <EmployeeForm employee={employee} onSave={(data) => {
                    onUpdate(data as Employee);
                    setIsEditOpen(false);
                }} />
            </DialogContent>
            </Dialog>
        </div>
      )
    },
  },
]};
