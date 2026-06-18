"use client";

import Link from "next/link";
import { GraduationCap, ShieldAlert, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Header() {
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full px-4 sm:px-6 lg:px-8 pt-4">
      <div 
        className="mx-auto max-w-7xl glass-card px-6 flex items-center justify-between shadow-xl shadow-slate-100/30 border border-white/60 h-20 transition-all duration-300"
      >
        {/* Brand Logo */}
        <Link href="/" className="flex items-center space-x-2 text-slate-900 group shrink-0">
          <div className="p-2.5 bg-gradient-to-tr from-primary-teal to-primary-sky rounded-2xl text-white group-hover:scale-105 transition-transform duration-200 shadow-md shadow-primary-teal/15">
            <GraduationCap className="h-6 w-6" />
          </div>
          <span className="font-bold text-xl tracking-tight hidden sm:block">
            Rathinam<span className="text-primary-teal font-extrabold">Global</span>
          </span>
          <span className="font-extrabold text-xl tracking-tight text-primary-teal sm:hidden">
            RGU
          </span>
        </Link>

        {/* Centered Nav Links */}
        <nav className="hidden lg:flex items-center space-x-7 text-[13px] font-bold text-slate-650">
          <Link href="/" className="hover:text-primary-teal transition-colors">
            Home
          </Link>
          <button
            onClick={() => scrollTo("programs")}
            className="hover:text-primary-teal transition-colors cursor-pointer font-bold"
          >
            Programs
          </button>
          <button
            onClick={() => scrollTo("scholarships")}
            className="hover:text-primary-teal transition-colors cursor-pointer font-bold"
          >
            Scholarships
          </button>
          <button
            onClick={() => scrollTo("process")}
            className="hover:text-primary-teal transition-colors cursor-pointer font-bold"
          >
            Exam Pattern
          </button>
          <button
            onClick={() => scrollTo("faq")}
            className="hover:text-primary-teal transition-colors cursor-pointer font-bold"
          >
            FAQ
          </button>
          <button
            onClick={() => scrollTo("footer")}
            className="hover:text-primary-teal transition-colors cursor-pointer font-bold"
          >
            Contact
          </button>
        </nav>

        {/* Actions */}
        <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
          <Link href="/admin/login">
            <Button variant="ghost" size="sm" className="hidden xl:inline-flex text-xs font-bold text-slate-450 hover:text-rose-600 hover:bg-slate-50 gap-1.5 rounded-xl px-3 h-9 border-transparent">
              <ShieldAlert className="h-4 w-4" />
              Admin Login
            </Button>
          </Link>
          <Link href="/login">
            <Button variant="outline" size="sm" className="text-xs font-bold border-slate-200 text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 rounded-xl px-4 h-9">
              <LogIn className="h-4 w-4 text-slate-400" />
              Student Portal
            </Button>
          </Link>
          <Link href="/apply">
            <Button size="sm" className="text-xs font-bold rounded-xl px-5 h-9 shadow-md shadow-primary-teal/20 hover:shadow-lg hover:shadow-primary-teal/25 hover:scale-[1.02] active:scale-[0.98] transition-all bg-gradient-to-r from-primary-teal to-primary-sky text-white border-transparent">
              Apply Now
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
