import { Employee, Payroll, Attendance, LeaveRequest } from './types';

const adminAvatar = "https://i.pravatar.cc/150?u=admin1";
const emp1Avatar = "https://i.pravatar.cc/150?u=emp1";
const emp2Avatar = "https://i.pravatar.cc/150?u=emp2";
const emp3Avatar = "https://i.pravatar.cc/150?u=emp3";

export const employees: Employee[] = [
  { id: 'admin1', name: 'Admin User', email: 'admin@example.com', position: 'System Administrator', department: 'IT', dateOfJoining: '2020-01-15', salary: 90000, status: 'Active', avatar: adminAvatar, role: 'admin' },
  { id: 'emp1', name: 'Alice Johnson', email: 'alice.j@example.com', position: 'Lead Developer', department: 'Engineering', dateOfJoining: '2021-03-20', salary: 85000, status: 'Active', avatar: emp1Avatar, role: 'employee' },
  { id: 'emp2', name: 'Bob Williams', email: 'bob.w@example.com', position: 'UI/UX Designer', department: 'Design', dateOfJoining: '2022-07-01', salary: 72000, status: 'Active', avatar: emp2Avatar, role: 'employee' },
  { id: 'emp3', name: 'Charlie Brown', email: 'charlie.b@example.com', position: 'Marketing Manager', department: 'Marketing', dateOfJoining: '2019-11-12', salary: 78000, status: 'On Leave', avatar: emp3Avatar, role: 'employee' },
];

export const payrollData: Payroll[] = [
  { id: 'pay1', employeeId: 'emp1', payPeriod: '2023-05-01 - 2023-05-31', grossSalary: 7083.33, deductions: 1200, netSalary: 5883.33, status: 'Paid' },
  { id: 'pay2', employeeId: 'emp2', payPeriod: '2023-05-01 - 2023-05-31', grossSalary: 6000, deductions: 1000, netSalary: 5000, status: 'Paid' },
  { id: 'pay3', employeeId: 'emp3', payPeriod: '2023-05-01 - 2023-05-31', grossSalary: 6500, deductions: 1100, netSalary: 5400, status: 'Paid' },
  { id: 'pay4', employeeId: 'emp1', payPeriod: '2023-06-01 - 2023-06-30', grossSalary: 7083.33, deductions: 1200, netSalary: 5883.33, status: 'Paid' },
  { id: 'pay5', employeeId: 'emp2', payPeriod: '2023-06-01 - 2023-06-30', grossSalary: 6000, deductions: 1000, netSalary: 5000, status: 'Paid' },
];

export const attendance: Attendance[] = [
  ...Array.from({ length: 28 }, (_, i) => ({ id: `att_emp1_${i}`, employeeId: 'emp1', date: `2023-06-${i + 1}`, status: 'Present' as 'Present' })),
  { id: 'att_emp1_29', employeeId: 'emp1', date: '2023-06-29', status: 'Leave' },
  { id: 'att_emp1_30', employeeId: 'emp1', date: '2023-06-30', status: 'Leave' },
  ...Array.from({ length: 30 }, (_, i) => ({ id: `att_emp2_${i}`, employeeId: 'emp2', date: `2023-06-${i + 1}`, status: (i % 10 === 0 ? 'Absent' : 'Present') as 'Present' | 'Absent' })),
];

export const leaveRequests: LeaveRequest[] = [
  { id: 'leave1', employeeId: 'emp2', startDate: '2023-07-10', endDate: '2023-07-12', reason: 'Family event', status: 'Approved' },
  { id: 'leave2', employeeId: 'emp2', startDate: '2023-08-01', endDate: '2023-08-05', reason: 'Vacation', status: 'Pending' },
  { id: 'leave3', employeeId: 'emp1', startDate: '2023-06-29', endDate: '2023-06-30', reason: 'Personal', status: 'Approved' },
  { id: 'leave4', employeeId: 'emp2', startDate: '2023-05-15', endDate: '2023-05-15', reason: 'Medical appointment', status: 'Rejected' },
];

export const recentActivities = [
    { employeeId: 'emp2', activity: 'submitted a leave request.', time: '2h ago', type: 'Update' },
    { employeeId: 'emp1', activity: 'was paid successfully.', time: '1d ago', type: 'Positive' },
    { employeeId: 'emp3', activity: 'updated their bank details.', time: '3d ago', type: 'Update' },
    { employeeId: 'admin1', activity: 'generated a payroll report.', time: '5d ago', type: 'Update' },
]
