"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useAuthStore } from "@/store/useAuthStore";
import { logActivity } from "@/services/activityLogger";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GraduationCap, LogIn, Mail, Lock, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function StudentLoginPage() {
  const router = useRouter();
  const { user, profile, loading } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // If already authenticated and profile loaded, redirect
  useEffect(() => {
    if (!loading && user && profile) {
      if (profile.role === "student") {
        router.push("/dashboard");
      }
    }
  }, [user, profile, loading, router]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Invalid email format";
    }
    if (!password) {
      newErrors.password = "Password is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoginLoading(true);

    try {
      // 1. Sign in with Firebase Auth
      const userCred = await signInWithEmailAndPassword(auth, email, password);
      const uid = userCred.user.uid;

      // 2. Fetch and check role in users collection
      const userDocRef = doc(db, "users", uid);
      const userDocSnap = await getDoc(userDocRef);

      if (!userDocSnap.exists()) {
        await auth.signOut();
        toast.error("User profile record not found. Access denied.");
        setLoginLoading(false);
        return;
      }

      const userData = userDocSnap.data();
      if (userData.role !== "student") {
        await auth.signOut();
        toast.error("Access denied. Admin credentials detected. Please use the Admin login portal.");
        setLoginLoading(false);
        return;
      }

      if (userData.status === "inactive") {
        await auth.signOut();
        toast.error("Your student account is deactivated. Please contact support.");
        setLoginLoading(false);
        return;
      }

      // Update auth store manually to speed up transition
      useAuthStore.setState({ user: userCred.user, profile: userData as any, loading: false });

      // 3. Log activity
      await logActivity(uid, email, "Student Logged In", "Logged in to student dashboard.");

      toast.success("Welcome back! Loading student dashboard...");
      router.push("/dashboard");
    } catch (error: any) {
      console.error("Login error:", error);
      let errMsg = "Invalid credentials. Please verify your email and password.";
      if (error.code === "auth/user-not-found" || error.code === "auth/wrong-password") {
        errMsg = "Incorrect email address or password.";
      } else if (error.code === "auth/too-many-requests") {
        errMsg = "Too many failed attempts. Try again later.";
      }
      toast.error(errMsg);
    } finally {
      setLoginLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-slate-50/50 flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Background glows */}
      <div className="glow-bg w-[300px] h-[300px] bg-primary-teal/10 top-10 left-10" />
      <div className="glow-bg w-[300px] h-[300px] bg-primary-sky/10 bottom-10 right-10" />

      {/* Return to Landing */}
      <Link href="/" className="absolute top-6 left-6 inline-flex items-center text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Website
      </Link>

      <div className="mb-8 flex flex-col items-center">
        <div className="p-3 bg-gradient-to-tr from-primary-teal to-primary-sky rounded-2xl text-white shadow-md mb-3">
          <GraduationCap className="h-8 w-8" />
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight text-center">
          Student Portal Login
        </h2>
        <p className="text-sm text-slate-500 font-medium mt-1">
          Access your RGUSAT slot booking, mocks, and exams
        </p>
      </div>

      <Card className="max-w-md w-full border border-slate-100 shadow-xl shadow-slate-100/30 relative z-10">
        <form onSubmit={handleLogin}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LogIn className="h-5 w-5 text-primary-teal" />
              Sign In
            </CardTitle>
            <CardDescription>
              Enter your registered application credentials.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`pl-10 ${errors.email ? "border-rose-500" : ""}`}
                />
              </div>
              {errors.email && <p className="text-xs text-rose-500 font-medium">{errors.email}</p>}
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <Label htmlFor="password">Password</Label>
                <Link href="/settings" className="text-xs font-semibold text-primary-teal hover:underline">
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`pl-10 ${errors.password ? "border-rose-500" : ""}`}
                />
              </div>
              {errors.password && <p className="text-xs text-rose-500 font-medium">{errors.password}</p>}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" isLoading={loginLoading} className="w-full rounded-xl font-bold py-3 shadow-md">
              Access Student Portal
            </Button>
            <p className="text-xs text-center text-slate-500">
              Don't have an account?{" "}
              <Link href="/apply" className="font-semibold text-primary-teal hover:underline">
                Apply Now
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
