"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useAuthStore } from "@/store/useAuthStore";
import { logActivity } from "@/services/activityLogger";
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
    <div className="relative min-h-screen bg-[#F8FAFC] flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <style>{`
        @keyframes gridMoveLogin {
          from { background-position: 0 0; }
          to { background-position: 40px 40px; }
        }
        .animate-grid-login {
          animation: gridMoveLogin 6s linear infinite;
        }
      `}</style>

      {/* Moving Grid Background */}
      <div
        className="absolute inset-0 pointer-events-none z-0 animate-grid-login"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(0, 160, 220, 0.22) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(0, 190, 155, 0.22) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Sprayed Gradient Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#00C9A7]/12 blur-[130px] pointer-events-none z-0" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-[#00B4FF]/12 blur-[150px] pointer-events-none z-0" />
      <div className="absolute top-[30%] right-[-5%] w-[40%] h-[40%] rounded-full bg-[#00C9A7]/8 blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-[20%] left-[-5%] w-[45%] h-[45%] rounded-full bg-[#00B4FF]/10 blur-[130px] pointer-events-none z-0" />

      {/* Return to Website */}
      <Link href="/" className="absolute top-6 left-6 inline-flex items-center text-sm font-semibold text-teal-600 hover:text-teal-800 transition-colors group z-10">
        <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
        Back to Website
      </Link>

      {/* Logo & Title */}
      <div className="mb-8 flex flex-col items-center relative z-10">
        <div className="mb-4">
          <img
            src="/logo.jpg"
            alt="Rathinam Global University"
            className="h-14 w-auto object-contain mx-auto"
            style={{ mixBlendMode: "multiply" }}
          />
        </div>
        <h2 className="text-3xl font-extrabold text-teal-900 tracking-tight text-center">
          RGUSAT Student Portal
        </h2>
        <p className="text-sm text-teal-600 font-medium mt-1.5 text-center">
          Sign in with your application credentials
        </p>
      </div>

      {/* Login Card */}
      <div className="max-w-md w-full relative z-10 bg-white/80 backdrop-blur-md rounded-3xl shadow-xl shadow-teal-200/40 border border-white/60 overflow-hidden">
        {/* Card top gradient strip */}
        <div
          className="h-1.5 w-full"
          style={{ background: "linear-gradient(90deg, #00C9A7 0%, #00B4FF 100%)" }}
        />

        <form onSubmit={handleLogin} className="p-8 space-y-6">
          {/* Card Header */}
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-teal-50/80 rounded-xl">
              <GraduationCap className="h-5 w-5 text-teal-600" />
            </div>
            <div>
              <h3 className="font-extrabold text-teal-900 text-lg">Student Login</h3>
              <p className="text-xs text-teal-500 font-medium">Access mock tests, slots, and scorecard</p>
            </div>
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-teal-800 font-semibold text-sm">Email Address</Label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-teal-450" />
              <Input
                id="email"
                type="email"
                placeholder="johndoe@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`pl-10 border-teal-200 focus:border-teal-500 focus:ring-teal-500/20 rounded-xl bg-teal-50/30 ${errors.email ? "border-red-400" : ""}`}
              />
            </div>
            {errors.email && <p className="text-xs text-red-500 font-medium pl-2">{errors.email}</p>}
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <Label htmlFor="password" className="text-teal-800 font-semibold text-sm">Password</Label>
              <Link
                href="/settings"
                className="text-xs font-semibold text-teal-600 hover:text-teal-800 hover:underline"
              >
                Forgot Password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-teal-450" />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`pl-10 border-teal-200 focus:border-teal-500 focus:ring-teal-500/20 rounded-xl bg-teal-50/30 ${errors.password ? "border-red-400" : ""}`}
              />
            </div>
            {errors.password && <p className="text-xs text-red-500 font-medium pl-2">{errors.password}</p>}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loginLoading}
            className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl text-white font-bold text-sm shadow-md transition-all hover:shadow-lg hover:scale-[1.01] active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
            style={{ background: "linear-gradient(135deg, #00C9A7 0%, #00B4FF 100%)" }}
          >
            {loginLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Logging in...
              </>
            ) : (
              <>
                <LogIn className="h-4 w-4" />
                Access Student Portal
              </>
            )}
          </button>

          <p className="text-xs text-center text-teal-500">
            Don't have an account?{" "}
            <Link href="/apply" className="font-semibold text-teal-700 hover:text-teal-900 hover:underline">
              Apply Now
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
