"use client";

import { useAuthStore } from "@/store/useAuthStore";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { Loader2, Menu, Shield } from "lucide-react";

export default function AdminPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, profile, loading, initialized } = useAuthStore();
  const router = useRouter();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    if (initialized && !loading) {
      if (!user) {
        router.push("/admin/login");
      } else if (profile && profile.role !== "admin") {
        router.push("/dashboard");
      }
    }
  }, [user, profile, loading, initialized, router]);

  // Loading state
  if (!initialized || loading || !user || !profile || profile.role !== "admin") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-teal-50 to-cyan-50">
        <div
          className="p-4 rounded-2xl shadow-lg mb-4"
          style={{ background: "linear-gradient(135deg, #0d9488 0%, #0891b2 100%)" }}
        >
          <Loader2 className="h-8 w-8 animate-spin text-white" />
        </div>
        <p className="text-sm text-teal-700 font-semibold mt-2">Checking administrator authorization...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-teal-50/30">
      {/* Desktop Admin Sidebar */}
      <AdminSidebar className="hidden lg:flex" />

      {/* Mobile Admin Sidebar */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div 
            className="fixed inset-0 bg-teal-900/30 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="relative z-50 animate-in slide-in-from-left duration-250">
            <AdminSidebar className="w-64" />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 border-b border-teal-100 bg-white flex items-center justify-between px-6 sticky top-0 z-30 shadow-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="p-2 -ml-2 text-teal-500 hover:text-teal-700 lg:hidden rounded-lg cursor-pointer"
            >
              <Menu className="h-6 w-6" />
            </button>
            <h1 className="font-bold text-teal-800 tracking-tight flex items-center gap-2 text-base">
              <Shield className="h-4.5 w-4.5 text-teal-600" />
              Administrative Operations Console
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-full text-white font-extrabold text-xs flex items-center justify-center shadow-sm"
                style={{ background: "linear-gradient(135deg, #0d9488 0%, #0891b2 100%)" }}
              >
                {profile.name.charAt(0).toUpperCase()}
              </div>
              <span className="text-xs font-bold text-teal-700 hidden sm:block">
                Admin Console
              </span>
            </div>
          </div>
        </header>

        {/* Content Viewport */}
        <main className="flex-1 p-6 md:p-8 overflow-hidden z-10 relative bg-gradient-to-br from-teal-50/40 via-white to-cyan-50/30">
          <div className="mx-auto max-w-6xl h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
