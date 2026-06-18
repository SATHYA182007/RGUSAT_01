"use client";

import Link from "next/link";
import { GraduationCap, LogIn, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Header() {
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full px-4 sm:px-6 lg:px-8 pt-4">
      <div className="mx-auto max-w-7xl glass-card px-6 py-4 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center space-x-2 text-slate-900 group">
          <div className="p-2 bg-gradient-to-tr from-primary-teal to-primary-sky rounded-xl text-white group-hover:scale-105 transition-transform duration-200">
            <GraduationCap className="h-6 w-6" />
          </div>
          <span className="font-bold text-xl tracking-tight">
            Rathinam<span className="text-primary-teal font-extrabold">Global</span>
          </span>
        </Link>

        {/* Nav Links */}
        <nav className="hidden md:flex items-center space-x-8 text-sm font-semibold text-slate-700">
          <button
            onClick={() => scrollTo("features")}
            className="hover:text-primary-teal transition-colors cursor-pointer"
          >
            Features
          </button>
          <button
            onClick={() => scrollTo("programs")}
            className="hover:text-primary-teal transition-colors cursor-pointer"
          >
            Programs
          </button>
          <button
            onClick={() => scrollTo("process")}
            className="hover:text-primary-teal transition-colors cursor-pointer"
          >
            Admissions
          </button>
          <button
            onClick={() => scrollTo("faq")}
            className="hover:text-primary-teal transition-colors cursor-pointer"
          >
            FAQ
          </button>
        </nav>

        {/* Actions */}
        <div className="flex items-center space-x-3">
          <Link href="/admin/login">
            <Button variant="ghost" size="sm" className="hidden sm:inline-flex text-xs font-semibold text-slate-500 hover:text-rose-600 gap-1.5">
              <ShieldAlert className="h-3.5 w-3.5" />
              Admin
            </Button>
          </Link>
          <Link href="/login">
            <Button variant="outline" size="sm" className="text-xs font-semibold border-slate-200 text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 rounded-xl">
              <LogIn className="h-3.5 w-3.5" />
              Portal Login
            </Button>
          </Link>
          <Link href="/apply">
            <Button size="sm" className="text-xs font-semibold rounded-xl">
              Apply Now
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
