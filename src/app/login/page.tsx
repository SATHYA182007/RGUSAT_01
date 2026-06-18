"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useAuthStore } from "@/store/useAuthStore";
import { logActivity } from "@/services/activityLogger";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GraduationCap, LogIn, Mail, Lock, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { SpiralAnimation } from "@/components/ui/SpiralAnimation";

export default function StudentLoginPage() {
  const router = useRouter();
  const { user, profile, loading } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const [showContent, setShowContent] = useState(false);

  // If already authenticated and profile loaded, redirect
  useEffect(() => {
    if (!loading && user && profile) {
      if (profile.role === "student") {
        router.push("/dashboard");
      }
    }
  }, [user, profile, loading, router]);

  // Handle delay of 1.5 seconds for loading animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowContent(true);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const isEmailActive = emailFocused || email !== "";
  const isPasswordActive = passwordFocused || password !== "";

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
    <div className="relative min-h-screen bg-[#F8FAFC] flex flex-col justify-center items-center py-12 px-4 overflow-x-hidden">
      {/* ── Background Spiral Animation ───────────────────────────────────────── */}
      <SpiralAnimation />

      {/* ── Glass Background Overlay ─────────────────────────────────────────── */}
      <div 
        className="fixed inset-0 w-full h-full pointer-events-none transition-all duration-500" 
        style={{ 
          background: "rgba(255, 255, 255, 0.75)", 
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          zIndex: 0
        }} 
      />

      {/* ── Return to Landing (Top Left) ────────────────────────────────────── */}
      <Link 
        href="/" 
        className="absolute top-6 left-6 inline-flex items-center text-xs font-black uppercase tracking-wider text-slate-400 hover:text-[#00C9A7] transition-colors z-20"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Website
      </Link>

      {/* ── Content Container (Animate in after 1.5 seconds) ───────────────── */}
      {showContent && (
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-12 gap-12 items-center w-full max-w-6xl z-10 relative px-4"
        >
          {/* Left Panel: University Branding (Hidden on mobile, stacked on tablet, grid col on desktop) */}
          <div className="hidden md:flex flex-col lg:col-span-6 space-y-6 text-left">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <span className="inline-flex items-center px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest bg-[#00C9A7]/10 text-[#00C9A7] border border-[#00C9A7]/20 uppercase">
                RGUSAT 2026
              </span>
            </motion.div>

            <div className="space-y-2">
              <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight leading-none">
                Rathinam <span className="text-primary-gradient font-black">Global</span> University
              </h1>
              <p className="text-lg font-bold text-slate-500 uppercase tracking-widest">
                Shape Your Future
              </p>
            </div>

            <p className="text-sm text-slate-450 font-semibold leading-relaxed max-w-md">
              Access your personalized student portal. Review mock preparations, examine details, schedule real-time test slots, and confirm scholarship options.
            </p>

            <div className="space-y-3 pt-2">
              {[
                { text: "Scholarships up to 100% based on score merits", icon: "🎓" },
                { text: "Flexible Exam Slots aligning with candidate routines", icon: "📅" },
                { text: "AI Proctored Assessments ensuring secure test sessions", icon: "🛡️" },
              ].map((feat, idx) => (
                <div key={idx} className="flex items-center gap-3 text-xs font-bold text-slate-600">
                  <span className="flex items-center justify-center w-6.5 h-6.5 rounded-lg bg-white/70 border border-white/80 shadow-sm">
                    {feat.icon}
                  </span>
                  <span>{feat.text}</span>
                </div>
              ))}
            </div>

            {/* Floating Metric Cards */}
            <div className="grid grid-cols-3 gap-4 pt-4">
              {[
                { icon: "🎓", value: "25,000+", label: "Students", delay: 0 },
                { icon: "🏆", value: "Merit", label: "Scholarships", delay: 0.25 },
                { icon: "📚", value: "50+", label: "Programs", delay: 0.5 },
              ].map((metric, i) => (
                <motion.div
                  key={i}
                  animate={{ y: [0, -8, 0] }}
                  transition={{
                    repeat: Infinity,
                    duration: 4.5,
                    ease: "easeInOut",
                    delay: metric.delay,
                  }}
                  className="glass-card p-4 flex flex-col items-center text-center shadow-lg border border-white/50"
                >
                  <span className="text-2xl mb-1">{metric.icon}</span>
                  <span className="text-sm font-black text-slate-800">{metric.value}</span>
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider mt-0.5">{metric.label}</span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Right Panel: Login Card (Centered) */}
          <div className="col-span-1 lg:col-span-6 flex justify-center items-center">
            <div className="w-full max-w-[500px] rounded-[32px] bg-white/85 border border-white/60 backdrop-blur-[20px] shadow-[0_20px_60px_rgba(0,0,0,0.12)] p-8">
              <form onSubmit={handleLogin}>
                
                <div className="flex flex-col items-center text-center mb-8">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="p-3 bg-gradient-to-tr from-[#00C9A7] to-[#00B4FF] rounded-2xl text-white shadow-lg shadow-[#00C9A7]/15 mb-3"
                  >
                    <GraduationCap className="h-8 w-8" />
                  </motion.div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                    Student Portal
                  </h2>
                  <p className="text-xs text-slate-450 font-bold mt-1 uppercase tracking-wider">
                    Sign in with application credentials
                  </p>
                </div>

                <div className="space-y-5">
                  {/* Email Input */}
                  <div className="space-y-1">
                    <div className="relative">
                      <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 transition-colors duration-250 ${emailFocused ? "text-[#00C9A7]" : "text-slate-400"}`} />
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onFocus={() => setEmailFocused(true)}
                        onBlur={() => setEmailFocused(false)}
                        className={`pl-11 pr-4 pt-5 pb-1 h-14 rounded-2xl border-slate-200 focus:ring-2 focus:ring-[#00C9A7]/20 focus:border-[#00C9A7] transition-all bg-white/50 focus:bg-white ${
                          errors.email ? "border-rose-500 focus:ring-rose-200 focus:border-rose-500" : ""
                        }`}
                      />
                      <label
                        htmlFor="email"
                        className={`absolute left-11 pointer-events-none transition-all duration-250 origin-[0] ${
                          isEmailActive
                            ? "top-1.5 text-[9px] font-black text-[#00C9A7] uppercase tracking-wider"
                            : "top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400"
                        }`}
                      >
                        Email Address
                      </label>
                    </div>
                    {errors.email && <p className="text-xs text-rose-500 font-bold pl-2">{errors.email}</p>}
                  </div>

                  {/* Password Input */}
                  <div className="space-y-1">
                    <div className="relative">
                      <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 transition-colors duration-250 ${passwordFocused ? "text-[#00C9A7]" : "text-slate-400"}`} />
                      <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onFocus={() => setPasswordFocused(true)}
                        onBlur={() => setPasswordFocused(false)}
                        className={`pl-11 pr-4 pt-5 pb-1 h-14 rounded-2xl border-slate-200 focus:ring-2 focus:ring-[#00C9A7]/20 focus:border-[#00C9A7] transition-all bg-white/50 focus:bg-white ${
                          errors.password ? "border-rose-500 focus:ring-rose-200 focus:border-rose-500" : ""
                        }`}
                      />
                      <label
                        htmlFor="password"
                        className={`absolute left-11 pointer-events-none transition-all duration-250 origin-[0] ${
                          isPasswordActive
                            ? "top-1.5 text-[9px] font-black text-[#00C9A7] uppercase tracking-wider"
                            : "top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400"
                        }`}
                      >
                        Password
                      </label>
                      <Link 
                        href="/settings" 
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black uppercase text-[#00C9A7] tracking-wider hover:text-[#00B4FF] transition-colors"
                      >
                        Forgot?
                      </Link>
                    </div>
                    {errors.password && <p className="text-xs text-rose-500 font-bold pl-2">{errors.password}</p>}
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  <Button 
                    type="submit" 
                    isLoading={loginLoading}
                    className="w-full h-14 rounded-2xl font-black text-xs uppercase tracking-widest transition-all duration-300 hover:scale-[1.03] hover:shadow-lg hover:shadow-[#00C9A7]/30 active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
                  >
                    Access Student Portal
                    <LogIn className="h-4 w-4" />
                  </Button>
                  
                  <p className="text-xs text-center text-slate-400 font-semibold">
                    Don't have an account?{" "}
                    <Link href="/apply" className="font-black text-[#00C9A7] hover:text-[#00B4FF] transition-colors">
                      Apply Now
                    </Link>
                  </p>
                </div>

              </form>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
