
"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Attendance } from "@/lib/types"
import { formatDate } from "@/lib/utils"

type AttendanceWithUserName = Attendance & { employeeName: string };


export const getColumns = (onUpdate: (attendance: Attendance) => void): ColumnDef<AttendanceWithUserName>[] => {

  const AttendanceActions = ({ attendance }: { attendance: Attendance }) => {

    const updateStatus = (status: 'Present' | 'Absent' | 'Leave') => {
      onUpdate({ ...attendance, status });
    }

    return (
      <div className="text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => updateStatus('Present')}>Mark as Present</DropdownMenuItem>
            <DropdownMenuItem onClick={() => updateStatus('Absent')}>Mark as Absent</DropdownMenuItem>
            <DropdownMenuItem onClick={() => updateStatus('Leave')}>Mark as Leave</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    )
  }


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
      accessorKey: "employeeName",
      header: "Employee",
    },
    {
      accessorKey: "date",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Date
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => formatDate(row.getValue("date")),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
          const status = row.getValue("status") as string;
          let variant: "default" | "secondary" | "destructive" = "secondary";
          if (status === 'Present') variant = 'default';
          if (status === 'Absent') variant = 'destructive';

          return <Badge variant={variant as any}>{status}</Badge>
      }
    },
    {
      id: "actions",
      cell: ({ row }) => {
        return <AttendanceActions attendance={row.original} />
      },
    },
  ]
}
