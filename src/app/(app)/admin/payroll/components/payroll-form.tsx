"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Payroll, User } from "@/lib/types"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import { Textarea } from "@/components/ui/textarea"

const formSchema = z.object({
  userId: z.string().min(1, "Please select an employee."),
  payPeriodStartDate: z.date(),
  payPeriodEndDate: z.date(),
  grossSalary: z.coerce.number().positive("Gross salary must be a positive number."),
  tax: z.coerce.number().min(0, "Tax cannot be negative."),
  deductions: z.coerce.number().min(0, "Deductions cannot be negative."),
  deductionReason: z.string().optional(),
})

type PayrollFormValues = z.infer<typeof formSchema>

interface PayrollFormProps {
  users: User[];
  onSave: (data: Omit<Payroll, 'id'>) => void;
}

export function PayrollForm({ users, onSave }: PayrollFormProps) {
  const form = useForm<PayrollFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      grossSalary: 0,
      tax: 0,
      deductions: 0,
    },
  })

  function onSubmit(data: PayrollFormValues) {
    const netSalary = data.grossSalary - data.tax - data.deductions;
    
    const payrollData: Omit<Payroll, 'id'> = {
      userId: data.userId,
      payPeriodStartDate: data.payPeriodStartDate.toISOString(),
      payPeriodEndDate: data.payPeriodEndDate.toISOString(),
      grossSalary: data.grossSalary,
      tax: data.tax,
      deductions: data.deductions,
      netSalary,
      status: "Pending"
    };

    if (data.deductionReason) {
      payrollData.deductionReason = data.deductionReason;
    }

    onSave(payrollData);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="userId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Employee</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an employee" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {users.map(user => (
                    <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="payPeriodStartDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Pay Period Start</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                      >
                        {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="payPeriodEndDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Pay Period End</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                      >
                        {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="grossSalary"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Gross Salary (INR)</FormLabel>
              <FormControl>
                <Input type="number" placeholder="50000" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="tax"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tax (INR)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="5000" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="deductions"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Deductions (INR)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="1000" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="deductionReason"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Deduction Reason (Optional)</FormLabel>
              <FormControl>
                <Textarea placeholder="e.g., Unpaid leave, professional tax" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full">Save Payroll</Button>
      </form>
    </Form>
  )
}
