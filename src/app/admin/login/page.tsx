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
import { GraduationCap, ShieldCheck, Mail, Lock, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function AdminLoginPage() {
  const router = useRouter();
  const { user, profile, loading } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // If already authenticated and profile loaded as admin, redirect to admin dashboard
  useEffect(() => {
    if (!loading && user && profile) {
      if (profile.role === "admin") {
        router.push("/admin/dashboard");
      }
    }
  }, [user, profile, loading, router]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!email) newErrors.email = "Admin email is required";
    if (!password) newErrors.password = "Security password is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoginLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      // Fetch role
      const userDoc = await getDoc(doc(db, "users", userCredential.user.uid));
      if (userDoc.exists() && userDoc.data().role === "admin") {
        await logActivity(userCredential.user.uid, email, "admin_login", "Logged into admin portal successfully");
        toast.success("Welcome back, Administrator!");
        router.push("/admin/dashboard");
      } else {
        await auth.signOut();
        toast.error("Access Denied: Not an admin account.");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to authenticate.");
    } finally {
      setLoginLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#F8FAFC] flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <style>{`
        @keyframes gridMoveAdmin {
          from { background-position: 0 0; }
          to { background-position: 40px 40px; }
        }
        .animate-grid-admin {
          animation: gridMoveAdmin 6s linear infinite;
        }
      `}</style>

      {/* Moving Grid Background */}
      <div
        className="absolute inset-0 pointer-events-none z-0 animate-grid-admin"
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
          RGUSAT Admin Portal
        </h2>
        <p className="text-sm text-teal-600 font-medium mt-1.5 text-center">
          Authorized admissions and exam administrators only
        </p>
      </div>

      {/* Login Card */}
      <div className="max-w-md w-full relative z-10 bg-white/80 backdrop-blur-md rounded-3xl shadow-xl shadow-teal-200/40 border border-white/60 overflow-hidden">
        {/* Card top gradient strip */}
        <div
          className="h-1.5 w-full"
          style={{ background: "linear-gradient(90deg, #0d9488 0%, #0891b2 50%, #38bdf8 100%)" }}
        />

        <form onSubmit={handleAdminLogin} className="p-8 space-y-6">
          {/* Card Header */}
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-teal-50 rounded-xl">
              <ShieldCheck className="h-5 w-5 text-teal-600" />
            </div>
            <div>
              <h3 className="font-extrabold text-teal-900 text-lg">Administrative Login</h3>
              <p className="text-xs text-teal-500 font-medium">Enter your secure admin credentials</p>
            </div>
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-teal-800 font-semibold text-sm">Admin Email</Label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-teal-400" />
              <Input
                id="email"
                type="email"
                placeholder="admin@rgusat.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`pl-10 border-teal-200 focus:border-teal-500 focus:ring-teal-500/20 rounded-xl bg-teal-50/30 ${errors.email ? "border-red-400" : ""}`}
              />
            </div>
            {errors.email && <p className="text-xs text-red-500 font-medium">{errors.email}</p>}
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-teal-800 font-semibold text-sm">Security Password</Label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-teal-400" />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`pl-10 border-teal-200 focus:border-teal-500 focus:ring-teal-500/20 rounded-xl bg-teal-50/30 ${errors.password ? "border-red-400" : ""}`}
              />
            </div>
            {errors.password && <p className="text-xs text-red-500 font-medium">{errors.password}</p>}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loginLoading}
            className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl text-white font-bold text-sm shadow-md transition-all hover:shadow-lg hover:scale-[1.01] active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
            style={{ background: "linear-gradient(135deg, #0d9488 0%, #0891b2 100%)" }}
          >
            {loginLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Authenticating...
              </>
            ) : (
              <>
                <ShieldCheck className="h-4 w-4" />
                Access Admin Console
              </>
            )}
          </button>

          <p className="text-xs text-center text-teal-500">
            Are you a student?{" "}
            <Link href="/login" className="font-semibold text-teal-700 hover:text-teal-900 hover:underline">
              Student Portal Login
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
