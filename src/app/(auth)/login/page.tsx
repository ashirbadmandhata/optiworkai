
"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth, } from "@/hooks/use-auth";
import { Rocket, Loader2 } from "lucide-react";
import { UserRole } from "@/lib/types";
import { Separator } from "@/components/ui/separator";

const GoogleIcon = () => (
    <svg className="mr-2 h-4 w-4" viewBox="0 0 48 48">
        <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039L38.802 9.92C34.553 6.112 29.61 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"></path>
        <path fill="#FF3D00" d="M6.306 14.691c-2.213 4.01-2.213 8.617 0 12.627L2.122 32.14C-1.036 24.846-1.036 15.154 2.122 7.86L6.306 14.691z"></path>
        <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-4.19-6.438C30.562 34.661 27.455 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-4.258 6.538C11.645 40.636 17.463 44 24 44z"></path>
        <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l4.19 6.438C41.465 34.773 44 30.091 44 24c0-1.341-.138-2.65-.389-3.917z"></path>
    </svg>
)

export default function LoginForm() {
  const [email, setEmail] = useState("admin@example.com");
  const [password, setPassword] = useState("password");
  const { login, loading, signInWithGoogle } = useAuth();
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    login(email, password);
    router.push("/dashboard");
  };

  const handleGoogleSignIn = () => {
    signInWithGoogle();
    router.push('/dashboard');
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/40">
      <Card className="mx-auto max-w-sm w-full shadow-lg">
        <CardHeader className="space-y-4">
          <div className="flex justify-center mb-4">
            <Rocket className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-2xl text-center font-headline">Welcome Back</CardTitle>
          <CardDescription className="text-center">
            Sign in to access your optai dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin}>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    href="#"
                    className="ml-auto inline-block text-sm underline"
                  >
                    Forgot your password?
                  </Link>
                </div>
                <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? <Loader2 className="animate-spin" /> : "Sign In"}
              </Button>
            </div>
          </form>
          <Separator className="my-6" />
          <Button variant="outline" className="w-full" onClick={handleGoogleSignIn}>
            <GoogleIcon />
            Sign in with Google
          </Button>
          <div className="mt-6 text-center text-sm">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="underline font-semibold">
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
