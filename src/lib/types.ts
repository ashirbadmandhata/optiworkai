
export type UserRole = 'admin' | 'employee' | 'hr';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  position?: string;
  department?: string;
  designation?: string;
  dateOfJoining: string;
  salary: number;
  status: 'Active' | 'On Leave' | 'Inactive';
}

export interface Payroll {
  id: string;
  userId: string;
  payPeriodStartDate: string;
  payPeriodEndDate: string;
  grossSalary: number;
  deductions: number;
  tax: number;
  deductionReason?: string;
  netSalary: number;
  status: 'Paid' | 'Pending';
}

export interface Attendance {
  id: string;
  employeeId: string;
  date: string;
  status: 'Present' | 'Absent' | 'Leave';
}

export interface LeaveRequest {
  id:string;
  userId: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
}
