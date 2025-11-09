"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Payroll } from "@/lib/types"
import { formatCurrency, formatDate } from "@/lib/utils"

export const getColumns = (
  onUpdateStatus: (payroll: Payroll, status: 'Paid' | 'Pending') => void,
  onDelete: (payroll: Payroll) => void
): ColumnDef<Payroll>[] => {
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
    accessorKey: "userId",
    header: "Employee ID",
  },
  {
    accessorKey: "payPeriod",
    header: "Pay Period",
    cell: ({ row }) => {
      const payroll = row.original;
      return `${formatDate(payroll.payPeriodStartDate)} - ${formatDate(payroll.payPeriodEndDate)}`;
    }
  },
  {
    accessorKey: "grossSalary",
    header: () => <div className="text-right">Gross Salary</div>,
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("grossSalary"))
      return <div className="text-right font-medium">{formatCurrency(amount, 'INR')}</div>
    },
  },
    {
    accessorKey: "deductions",
    header: () => <div className="text-right">Deductions</div>,
     cell: ({ row }) => {
      const amount = parseFloat(row.getValue("deductions"))
      return <div className="text-right font-medium text-destructive">{formatCurrency(amount, 'INR')}</div>
    },
  },
   {
    accessorKey: "tax",
    header: () => <div className="text-right">Tax</div>,
     cell: ({ row }) => {
      const amount = parseFloat(row.getValue("tax"))
      return <div className="text-right font-medium text-destructive">{formatCurrency(amount, 'INR')}</div>
    },
  },
    {
    accessorKey: "netSalary",
    header: () => <div className="text-right">Net Salary</div>,
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("netSalary"))
      return <div className="text-right font-medium">{formatCurrency(amount, 'INR')}</div>
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
        const status = row.getValue("status") as string;
        const variant = status === 'Paid' ? 'default' : 'secondary';
        return <Badge variant={variant as any}>{status}</Badge>
    }
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const payroll = row.original

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
              {payroll.status === 'Pending' && (
                <DropdownMenuItem onClick={() => onUpdateStatus(payroll, 'Paid')}>
                  Mark as Paid
                </DropdownMenuItem>
              )}
              <DropdownMenuItem>View Details</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDelete(payroll)} className="text-destructive">
                Delete Record
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )
    },
  },
]};
