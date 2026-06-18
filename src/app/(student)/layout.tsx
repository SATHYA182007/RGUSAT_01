"use client";

import { useAuthStore } from "@/store/useAuthStore";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { StudentSidebar } from "@/components/layout/StudentSidebar";
import { NotificationCenter } from "@/components/layout/NotificationCenter";
import { Loader2, Menu } from "lucide-react";

export default function StudentPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, profile, loading, initialized } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    if (initialized && !loading) {
      if (!user) {
        router.push("/login");
      } else if (profile && profile.role !== "student") {
        router.push("/admin/dashboard");
      }
    }
  }, [user, profile, loading, initialized, router]);

  // Loading state
  if (!initialized || loading || !user || !profile || profile.role !== "student") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
        <Loader2 className="h-10 w-10 animate-spin text-primary-teal" />
        <p className="text-sm text-slate-500 font-semibold mt-4">Loading student profile...</p>
      </div>
    );
  }

  const isTakingExam = pathname.match(/^\/exam\/.+/);

  if (isTakingExam) {
    return (
      <main className="min-h-screen bg-slate-950 text-white">
        {children}
      </main>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50/50">
      {/* Desktop Sidebar */}
      <StudentSidebar className="hidden md:flex" />

      {/* Mobile Sidebar */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="relative z-50 animate-in slide-in-from-left duration-250">
            <StudentSidebar className="w-64" />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 border-b border-slate-100 bg-white/70 backdrop-blur-xl flex items-center justify-between px-6 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="p-2 -ml-2 text-slate-500 hover:text-slate-900 md:hidden rounded-lg cursor-pointer"
            >
              <Menu className="h-6 w-6" />
            </button>
            <h1 className="font-bold text-slate-950 tracking-tight hidden md:block text-lg">
              Student Console
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <NotificationCenter />
            <div className="h-8 w-px bg-slate-100" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full btn-primary-gradient flex items-center justify-center text-white font-extrabold text-xs shadow-sm">
                {profile.name.charAt(0).toUpperCase()}
              </div>
              <span className="text-xs font-bold text-slate-700 hidden sm:block">
                {profile.name.split(" ")[0]}
              </span>
            </div>
          </div>
        </header>

        {/* Content Viewport */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto z-10 relative">
          <div className="mx-auto max-w-5xl space-y-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
