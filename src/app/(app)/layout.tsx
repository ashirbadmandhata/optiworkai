
'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserRole, User } from '@/lib/types';
import { useAuth } from '@/hooks/use-auth';
import { 
  SidebarProvider, 
  Sidebar, 
  SidebarHeader, 
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  SidebarInset,
} from '@/components/ui/sidebar';
import { UserNav } from '@/components/user-nav';
import { ThemeToggle } from '@/components/theme-toggle';
import { Skeleton } from '@/components/ui/skeleton';
import { Rocket, LayoutDashboard, Users, FileText, Bot, Settings, LifeBuoy, LogOut, FileSpreadsheet, HandCoins, CalendarCheck, FileStack, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

const adminNav = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Employees', href: '/admin/employees', icon: Users },
  { name: 'Payroll', href: '/admin/payroll', icon: HandCoins },
  { name: 'Attendance', href: '/admin/attendance', icon: CalendarCheck },
  { name: 'Leave Requests', href: '/admin/leaves', icon: FileStack },
  { name: 'Reports', href: '/admin/reports', icon: FileSpreadsheet },
  { name: 'AI Insights', href: '/admin/insights', icon: Bot },
];

const employeeNav = [
  { name: 'Dashboard', href: '/employee/dashboard', icon: LayoutDashboard },
  { name: 'My Profile', href: '/employee/profile', icon: Users },
  { name: 'Performance', href: '/employee/performance', icon: TrendingUp },
  { name: 'Leave Requests', href: '/employee/leaves', icon: FileText },
  { name: 'My Reports', href: '/employee/reports', icon: FileSpreadsheet },
  { name: 'Chat with HR', href: '/employee/chat', icon: Bot },
];

function getNavItems(role?: UserRole) {
  switch (role) {
    case 'admin':
    case 'hr':
      return adminNav;
    case 'employee':
      return employeeNav;
    default:
      return [];
  }
}

function AppLayoutContent({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();

  if (loading || !user) {
    return (
      <div className="flex h-screen w-full">
        <div className="hidden md:flex md:w-64 flex-col border-r">
            <div className="p-4 border-b">
                <Skeleton className="h-8 w-32" />
            </div>
            <div className="p-4 space-y-4">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
            </div>
        </div>
        <div className="flex-1 flex flex-col">
            <header className="flex items-center justify-between border-b p-4 h-16">
                 <Skeleton className="h-8 w-8 md:hidden" />
                <Skeleton className="h-8 w-24 ml-auto" />
            </header>
            <main className="flex-1 p-6">
                <Skeleton className="w-full h-full" />
            </main>
        </div>
      </div>
    );
  }

  const navItems = getNavItems(user.role);

  return (
    <>
      <Sidebar>
        <SidebarHeader>
          <Link href="/dashboard" className="flex items-center gap-2 font-bold text-lg">
            <Rocket className="h-6 w-6 text-primary" />
            <span className="font-headline text-sidebar-foreground group-data-[collapsible=icon]:hidden">optai</span>
          </Link>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.name}>
                 <SidebarMenuButton asChild isActive={pathname.startsWith(item.href)} tooltip={{children: item.name}}>
                   <Link href={item.href}>
                        <item.icon />
                        <span>{item.name}</span>
                    </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <UserNav user={user} />
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
          <SidebarTrigger className="md:hidden" />
           <div className="md:hidden">
              <Link href="/dashboard" className="flex items-center gap-2 font-bold text-lg">
                <Rocket className="h-6 w-6 text-primary" />
                <span className="font-headline">optai</span>
              </Link>
            </div>
          <div className="relative ml-auto flex items-center gap-2">
             <ThemeToggle />
             <div className="hidden md:block">
                <UserNav user={user} />
             </div>
          </div>
        </header>
        <main className="flex-1 p-4 sm:px-6 sm:py-0">{children}</main>
      </SidebarInset>
    </>
  );
}


export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppLayoutContent>{children}</AppLayoutContent>
    </SidebarProvider>
  )
}
