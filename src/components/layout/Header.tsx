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
        className="mx-auto max-w-7xl bg-[#050816]/75 backdrop-blur-md px-6 flex items-center justify-between shadow-2xl border border-white/10 h-20 transition-all duration-300 rounded-2xl"
      >
        {/* Brand Logo */}
        <Link href="/" className="flex items-center group shrink-0">
          <img
            src="/logo.png"
            alt="Rathinam Global University"
            className="h-10 w-auto object-contain transition-transform duration-200 group-hover:scale-[1.02]"
          />
        </Link>

        {/* Centered Nav Links */}
        <nav className="hidden lg:flex items-center space-x-7 text-[13px] font-bold text-slate-300">
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
            <Button variant="ghost" size="sm" className="hidden xl:inline-flex text-xs font-bold text-slate-350 hover:text-rose-400 hover:bg-white/5 gap-1.5 rounded-xl px-3 h-9 border-transparent">
              <ShieldAlert className="h-4 w-4" />
              Admin Login
            </Button>
          </Link>
          <Link href="/login">
            <Button variant="outline" size="sm" className="text-xs font-bold bg-transparent border-white/20 text-white hover:bg-white/10 hover:text-white flex items-center gap-1.5 rounded-xl px-4 h-9">
              <LogIn className="h-4 w-4 text-slate-300" />
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
