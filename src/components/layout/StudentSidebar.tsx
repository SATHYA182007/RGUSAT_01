"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { 
  GraduationCap, 
  LayoutDashboard, 
  CalendarDays, 
  BookOpen, 
  MonitorPlay, 
  Settings, 
  LogOut 
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigationItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Slot Booking", href: "/slot-booking", icon: CalendarDays },
  { name: "Mock Tests", href: "/mock-test", icon: BookOpen },
  { name: "Main Examination", href: "/exam", icon: MonitorPlay },
  { name: "Profile Settings", href: "/settings", icon: Settings },
];

export function StudentSidebar({ className }: { className?: string }) {
  const pathname = usePathname();
  const { logout, profile } = useAuthStore();

  return (
    <aside
      className={cn(
        "w-64 border-r border-slate-100 bg-white/70 backdrop-blur-xl flex flex-col h-screen sticky top-0 shrink-0",
        className
      )}
    >
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-50 flex items-center gap-2">
        <div className="p-2 bg-gradient-to-tr from-primary-teal to-primary-sky rounded-xl text-white">
          <GraduationCap className="h-5 w-5" />
        </div>
        <span className="font-bold text-lg text-slate-900">
          RGU<span className="text-primary-teal">Portal</span>
        </span>
      </div>

      {/* Student Brief Profile */}
      <div className="p-6 border-b border-slate-50/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full btn-primary-gradient flex items-center justify-center text-white font-extrabold text-sm shadow-md">
            {profile?.name?.charAt(0).toUpperCase() || "S"}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-slate-800 truncate">{profile?.name || "Student"}</p>
            <p className="text-xs text-slate-400 truncate">{profile?.email}</p>
          </div>
        </div>
      </div>

      {/* Sidebar Links */}
      <nav className="flex-1 px-4 py-6 space-y-1">
        {navigationItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer group",
                isActive
                  ? "bg-primary-teal/10 text-primary-teal border-l-4 border-primary-teal"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <Icon
                className={cn(
                  "h-5 w-5 shrink-0 transition-transform duration-200 group-hover:scale-105",
                  isActive ? "text-primary-teal" : "text-slate-400 group-hover:text-slate-600"
                )}
              />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Sidebar Footer */}
      <div className="p-4 border-t border-slate-50 bg-slate-50/20">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-colors duration-200 cursor-pointer text-left"
        >
          <LogOut className="h-5 w-5 shrink-0 text-slate-400 hover:text-rose-500" />
          Log Out
        </button>
      </div>
    </aside>
  );
}
