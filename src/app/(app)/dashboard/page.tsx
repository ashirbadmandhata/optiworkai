'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.replace('/login');
      return;
    }

    switch (user.role) {
      case 'admin':
      case 'hr':
        router.replace('/admin/dashboard');
        break;
      case 'employee':
        router.replace('/employee/dashboard');
        break;
      default:
        router.replace('/login');
    }
  }, [user, loading, router]);

  return (
    <div className="flex h-[80vh] w-full flex-col items-center justify-center gap-4">
      <div className="space-y-4 text-center">
        <Skeleton className="h-12 w-64 mx-auto" />
        <Skeleton className="h-6 w-80 mx-auto" />
      </div>
      <div className="w-full max-w-4xl space-y-4 p-8">
        <Skeleton className="h-40 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
       <p className="text-center mt-4 text-muted-foreground">Loading your dashboard...</p>
    </div>
  );
}
