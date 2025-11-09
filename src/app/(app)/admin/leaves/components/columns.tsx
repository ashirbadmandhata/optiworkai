"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal, CheckCircle, XCircle } from "lucide-react"

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
import { LeaveRequest } from "@/lib/types"
import { formatDate } from "@/lib/utils"

const statusVariant: { [key: string]: "default" | "secondary" | "destructive" } = {
  Approved: "default",
  Pending: "secondary",
  Rejected: "destructive",
};

type LeaveRequestWithUserData = LeaveRequest & { employeeName: string; userDocPath: string; };


export const getColumns = (onUpdateStatus: (leaveRequest: LeaveRequestWithUserData, status: "Approved" | "Rejected") => void): ColumnDef<LeaveRequestWithUserData>[] => {

  const LeaveRequestActions = ({ leaveRequest }: { leaveRequest: LeaveRequestWithUserData }) => {
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
            {leaveRequest.status === 'Pending' && (
              <>
                <DropdownMenuItem onClick={() => onUpdateStatus(leaveRequest, 'Approved')}>
                  <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                  Approve
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onUpdateStatus(leaveRequest, 'Rejected')} className="text-destructive">
                   <XCircle className="mr-2 h-4 w-4" />
                  Reject
                </DropdownMenuItem>
              </>
            )}
            {leaveRequest.status !== 'Pending' && (
                 <DropdownMenuItem disabled>No actions available</DropdownMenuItem>
            )}
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
      accessorKey: "startDate",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Start Date
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => formatDate(row.getValue("startDate")),
    },
    {
      accessorKey: "endDate",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            End Date
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => formatDate(row.getValue("endDate")),
    },
    {
        accessorKey: "reason",
        header: "Reason",
        cell: ({ row }) => <div className="max-w-[250px] truncate">{row.getValue("reason")}</div>
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
          const status = row.getValue("status") as string;
          return <Badge variant={statusVariant[status] as any}>{status}</Badge>
      }
    },
    {
      id: "actions",
      cell: ({ row }) => {
        return <LeaveRequestActions leaveRequest={row.original} />
      },
    },
  ]
}
