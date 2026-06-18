"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { 
  ShieldAlert, 
  LayoutDashboard, 
  Users, 
  FileText, 
  CreditCard, 
  CalendarDays, 
  BookOpen, 
  MonitorPlay, 
  Award, 
  Settings, 
  LogOut 
} from "lucide-react";
import { cn } from "@/lib/utils";

const adminNavigation = [
  { name: "Analytics", href: "/admin/dashboard", icon: LayoutDashboard },
  { name: "Students Directory", href: "/admin/students", icon: Users },
  { name: "Applications List", href: "/admin/applications", icon: FileText },
  { name: "Audited Payments", href: "/admin/payments", icon: CreditCard },
  { name: "Exam Slots", href: "/admin/slots", icon: CalendarDays },
  { name: "Mock Tests Config", href: "/admin/mock-tests", icon: BookOpen },
  { name: "Live Exams Config", href: "/admin/exams", icon: MonitorPlay },
  { name: "Merit & Results", href: "/admin/results", icon: Award },
  { name: "Admin Settings", href: "/admin/settings", icon: Settings },
];

export function AdminSidebar({ className }: { className?: string }) {
  const pathname = usePathname();
  const { logout, profile } = useAuthStore();

  return (
    <aside
      className={cn(
        "w-64 border-r border-teal-100 bg-white text-slate-600 flex flex-col h-screen sticky top-0 shrink-0 shadow-md",
        className
      )}
    >
      {/* Brand Header */}
      <div className="p-6 border-b border-teal-100 flex flex-col gap-4"
        style={{ background: "linear-gradient(135deg, #f0fdfa 0%, #e0f7fa 100%)" }}
      >
        <div className="flex items-center gap-3">
          <div
            className="p-2.5 text-white rounded-xl shadow-md"
            style={{ background: "linear-gradient(135deg, #0d9488 0%, #0891b2 100%)" }}
          >
            <ShieldAlert className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-extrabold text-sm text-teal-800 tracking-wider uppercase">
              RGUSAT ADMIN
            </h1>
            <p className="text-[10px] text-teal-500 font-bold uppercase tracking-wider">
              Console v1.0
            </p>
          </div>
        </div>


      </div>

      {/* Navigation list */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto no-scrollbar bg-white">
        {adminNavigation.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3.5 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer group",
                isActive
                  ? "text-white border-l-4 border-cyan-400"
                  : "text-slate-500 hover:bg-teal-50 hover:text-teal-700"
              )}
              style={isActive ? { background: "linear-gradient(135deg, #0d9488 0%, #0891b2 100%)" } : {}}
            >
              <Icon
                className={cn(
                  "h-5 w-5 shrink-0 transition-transform duration-200 group-hover:scale-105",
                  isActive ? "text-white" : "text-slate-400 group-hover:text-teal-600"
                )}
              />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Sidebar Footer */}
      <div className="p-4 border-t border-teal-100 bg-teal-50/50">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider text-teal-600 hover:bg-teal-100 hover:text-teal-800 transition-colors duration-200 cursor-pointer text-left"
        >
          <LogOut className="h-5 w-5 shrink-0 text-teal-500" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
