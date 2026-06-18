"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import {
  Users, CreditCard, CalendarDays, BookOpen,
  MonitorPlay, Award, Activity, RefreshCw,
  Zap, CheckCircle2, Clock3, UserCheck,
  ArrowRight, AlertCircle, CircleDot,
} from "lucide-react";
import { toast } from "sonner";

interface AppRecord {
  id: string;
  name: string;
  email: string;
  course: string;
  status: string;
  createdAt: any;
}

interface AdminStats {
  totalApps: number;
  paidApps: number;
  totalSlotsBooked: number;
  mockAttempts: number;
  examAttempts: number;
  resultsPublished: number;
  recentLogs: any[];
  recentApps: AppRecord[];
}

// ── Gradient avatar from initials ────────────────────────────────────────────
const AVATAR_GRADS = [
  "linear-gradient(135deg,#0d9488,#14b8a6)",
  "linear-gradient(135deg,#0891b2,#06b6d4)",
  "linear-gradient(135deg,#0e7490,#22d3ee)",
  "linear-gradient(135deg,#0284c7,#38bdf8)",
  "linear-gradient(135deg,#14b8a6,#0891b2)",
];
function initials(name: string) {
  const parts = name.trim().split(" ");
  return parts.length >= 2
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : name.slice(0, 2).toUpperCase();
}

// ── Status badge config ───────────────────────────────────────────────────────
function statusBadge(status: string) {
  const s = (status || "").toLowerCase();
  if (s === "paid" || s === "payment_complete")
    return { label: "Paid", bg: "#dcfce7", text: "#15803d", dot: "#22c55e" };
  if (s === "booked" || s === "slot_booked")
    return { label: "Slot Booked", bg: "#dbeafe", text: "#1d4ed8", dot: "#3b82f6" };
  if (s === "attempted" || s === "exam_taken")
    return { label: "Exam Done", bg: "#fef9c3", text: "#a16207", dot: "#eab308" };
  if (s === "result_published" || s === "completed")
    return { label: "Completed", bg: "#f0fdf4", text: "#0d9488", dot: "#0d9488" };
  return { label: "Pending", bg: "#fff7ed", text: "#c2410c", dot: "#f97316" };
}

// ── Relative time ─────────────────────────────────────────────────────────────
function relativeTime(ts: any): string {
  if (!ts) return "—";
  let seconds: number;
  if (typeof ts === "string") {
    seconds = Math.floor(new Date(ts).getTime() / 1000);
  } else if (ts.seconds) {
    seconds = ts.seconds;
  } else if (ts.toDate && typeof ts.toDate === "function") {
    seconds = Math.floor(ts.toDate().getTime() / 1000);
  } else if (typeof ts === "number") {
    seconds = Math.floor(ts / 1000);
  } else {
    return "—";
  }

  if (isNaN(seconds)) return "—";

  const diff = Math.floor((Date.now() / 1000) - seconds);
  if (diff < 0)    return "just now";
  if (diff < 60)   return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

// ── Action badge ─────────────────────────────────────────────────────────────
const actionColors: Record<string, { bg: string; text: string; label: string }> = {
  admin_login:              { bg: "#e0f2fe", text: "#0284c7", label: "Login" },
  admin_logged_in:          { bg: "#e0f2fe", text: "#0284c7", label: "Login" },
  toggle_user_status:       { bg: "#f0fdfa", text: "#0d9488", label: "Status" },
  mock_test_attempted:      { bg: "#ecfeff", text: "#06b6d4", label: "Mock" },
  slot_booked:              { bg: "#e0f7fa", text: "#0891b2", label: "Slot" },
  password_reset_requested: { bg: "#fef9c3", text: "#a16207", label: "Reset" },
};
function getActionStyle(action: string) {
  const key = Object.keys(actionColors).find(k =>
    (action || "").toLowerCase().replace(/\s+/g, "_").includes(k)
  );
  return key ? actionColors[key] : { bg: "#f0fdfa", text: "#0d9488", label: "Event" };
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  const loadAdminMetrics = async () => {
    try {
      // Applications
      const appsSnap = await getDocs(
        query(collection(db, "applications"), orderBy("createdAt", "desc"))
      );
      const allApps = appsSnap.docs.map(d => ({ id: d.id, ...d.data() } as any));
      const totalApps = allApps.length;
      let paidApps = 0;
      allApps.forEach(app => {
        if (app.paymentStatus === "paid" || app.status === "paid" || app.paymentCompleted === true || app.paid === true) paidApps++;
      });

      // Build recent apps list (up to 8)
      const recentApps: AppRecord[] = allApps.slice(0, 8).map((app, i) => ({
        id: app.id,
        name: app.personalInfo?.name || app.applicantName || app.fullName || app.name || app.studentName || "Unknown Applicant",
        email: app.personalInfo?.email || app.email || app.applicantEmail || app.studentEmail || "—",
        course: app.courseApplied || app.course || app.programApplied || "Not specified",
        status: app.paymentStatus === "paid" && app.status === "submitted" ? "paid" : (app.status || "pending"),
        createdAt: app.createdAt,
      }));

      const slotsSnap = await getDocs(collection(db, "slot_bookings"));
      const totalSlotsBooked = slotsSnap.size;
      let mockAttempts = 0;
      try { mockAttempts = (await getDocs(collection(db, "mock_attempts"))).size; } catch {}
      let examAttempts = 0;
      try { examAttempts = (await getDocs(collection(db, "exam_attempts"))).size; } catch {}
      const resultsPublished = (await getDocs(collection(db, "results"))).size;

      const logsSnap = await getDocs(
        query(collection(db, "activity_logs"), orderBy("createdAt", "desc"), limit(8))
      );
      const recentLogs = logsSnap.docs.map(d => ({ id: d.id, ...d.data() }));

      setStats({ totalApps, paidApps, totalSlotsBooked, mockAttempts, examAttempts, resultsPublished, recentLogs, recentApps });
    } catch (e: any) {
      toast.error("Failed to load metrics: " + e.message);
    } finally { setLoading(false); setSyncing(false); }
  };

  useEffect(() => { loadAdminMetrics(); }, []);
  const handleSync = () => { setSyncing(true); loadAdminMetrics(); };

  const kpiCards = stats ? [
    { label: "Total Applications",  value: stats.totalApps,        icon: Users,        grad: "linear-gradient(135deg,#0d9488,#14b8a6)", soft: "#f0fdfa", col: "#0d9488", sub: "Candidates registered" },
    { label: "Paid Registrations",  value: stats.paidApps,         icon: CreditCard,   grad: "linear-gradient(135deg,#0891b2,#06b6d4)", soft: "#e0f2fe", col: "#0891b2", sub: "Payments finalised" },
    { label: "Booked Slots",        value: stats.totalSlotsBooked, icon: CalendarDays, grad: "linear-gradient(135deg,#0e7490,#22d3ee)", soft: "#ecfeff", col: "#0e7490", sub: "Exam seats confirmed" },
    { label: "Mock Attempts",       value: stats.mockAttempts,     icon: BookOpen,     grad: "linear-gradient(135deg,#0d9488,#0891b2)", soft: "#f0fdfa", col: "#0d9488", sub: "Practice tests taken" },
    { label: "Entrance Attempts",   value: stats.examAttempts,     icon: MonitorPlay,  grad: "linear-gradient(135deg,#0284c7,#38bdf8)", soft: "#e0f2fe", col: "#0284c7", sub: "Live exam submissions" },
    { label: "Published Results",   value: stats.resultsPublished, icon: Award,        grad: "linear-gradient(135deg,#0891b2,#0d9488)", soft: "#ecfeff", col: "#0891b2", sub: "Scorecards issued" },
  ] : [];

  if (loading) {
    return (
      <div className="flex flex-col gap-4" style={{ height: "calc(100vh - 7rem)" }}>
        <div className="flex justify-between items-center flex-none">
          <div className="space-y-1.5">
            <div className="h-6 w-56 bg-teal-100 rounded-lg animate-pulse" />
            <div className="h-3 w-40 bg-teal-50 rounded animate-pulse" />
          </div>
          <div className="h-9 w-28 bg-teal-100 rounded-xl animate-pulse" />
        </div>
        <div className="grid grid-cols-3 gap-4 flex-none">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-24 bg-gradient-to-br from-teal-50 to-cyan-50 rounded-2xl animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-3 gap-4 flex-1 min-h-0">
          <div className="col-span-2 bg-teal-50 rounded-2xl animate-pulse" />
          <div className="bg-teal-50 rounded-2xl animate-pulse" />
        </div>
      </div>
    );
  }

  const pending = stats!.totalApps - stats!.paidApps;

  return (
    <div className="flex flex-col gap-4" style={{ height: "calc(100vh - 7rem)" }}>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between flex-none">
        <div>
          <h2 className="text-xl font-extrabold text-teal-900 tracking-tight leading-tight">
            System Analytics &amp; Health
          </h2>
          <p className="text-xs text-teal-500 font-medium mt-0.5">Real-time statistics across all portal operations</p>
        </div>
        <button onClick={handleSync} disabled={syncing}
          className="flex items-center gap-2 px-4 py-2 text-white rounded-xl text-xs font-bold shadow-md transition-all hover:shadow-lg hover:scale-[1.02] active:scale-95 disabled:opacity-60"
          style={{ background: "linear-gradient(135deg,#0d9488,#0891b2)" }}
        >
          <RefreshCw className={`h-3.5 w-3.5 ${syncing ? "animate-spin" : ""}`} />
          {syncing ? "Syncing…" : "Sync Data"}
        </button>
      </div>

      {/* ── KPI Cards ───────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-4 flex-none">
        {kpiCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx}
              className="relative rounded-2xl p-4 border border-white/80 shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 group"
              style={{ background: "linear-gradient(145deg,#ffffff 0%,#f0fdfa 100%)" }}
            >
              <div className="absolute left-0 top-3 bottom-3 w-1 rounded-r-full" style={{ background: card.grad }} />
              <div className="absolute -right-4 -top-4 w-20 h-20 rounded-full opacity-10" style={{ background: card.grad }} />
              <div className="flex items-start justify-between pl-3">
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5 truncate">{card.label}</p>
                  <div className="text-4xl font-black font-mono tabular-nums leading-none" style={{ color: card.col }}>{card.value}</div>
                  <p className="text-[10px] text-slate-400 font-medium mt-1.5 truncate">{card.sub}</p>
                </div>
                <div className="p-2.5 rounded-xl shadow-sm flex-none ml-2 group-hover:scale-105 transition-transform" style={{ background: card.soft }}>
                  <Icon className="h-5 w-5" style={{ color: card.col }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Bottom Section ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-4 flex-1 min-h-0">

        {/* ── Recent Registrations ──────────────────────────────────────────── */}
        <div className="col-span-2 rounded-2xl border border-teal-100/80 shadow-sm flex flex-col overflow-hidden"
          style={{ background: "linear-gradient(145deg,#ffffff,#f0fdfa)" }}
        >
          {/* Header */}
          <div className="px-5 py-3.5 border-b border-teal-50 flex items-center justify-between flex-none">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg" style={{ background: "linear-gradient(135deg,#0d9488,#0891b2)" }}>
                <UserCheck className="h-3.5 w-3.5 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-teal-900">Recent Registrations</h3>
                <p className="text-[10px] text-slate-400">Latest applicants — sorted by registration time</p>
              </div>
            </div>
            {/* Summary chips */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg"
                style={{ background: "#f0fdfa", border: "1px solid #ccfbf1" }}>
                <CheckCircle2 className="h-3 w-3 text-teal-500" />
                <span className="text-[10px] font-bold text-teal-700">{stats!.paidApps} paid</span>
              </div>
              {pending > 0 && (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg"
                  style={{ background: "#fff7ed", border: "1px solid #fed7aa" }}>
                  <AlertCircle className="h-3 w-3 text-orange-400" />
                  <span className="text-[10px] font-bold text-orange-600">{pending} pending</span>
                </div>
              )}
            </div>
          </div>

          {/* Table Header */}
          {stats!.recentApps.length > 0 && (
            <div className="px-5 py-2 border-b border-slate-50 flex items-center gap-3 flex-none"
              style={{ background: "#f8fafc" }}>
              <div className="w-8 flex-none" />
              <div className="flex-1 min-w-0">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Applicant</span>
              </div>
              <div className="w-44 flex-none">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Course Applied</span>
              </div>
              <div className="w-24 flex-none text-center">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Status</span>
              </div>
              <div className="w-16 flex-none text-right">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Time</span>
              </div>
            </div>
          )}

          {/* Rows */}
          <div className="flex-1 overflow-y-auto">
            {stats!.recentApps.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center">
                <Users className="h-12 w-12 mb-3 text-teal-200" />
                <p className="text-sm font-bold text-slate-400">No registrations yet</p>
                <p className="text-xs text-slate-300 mt-1">Applications will appear here once students register</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-50">
                {stats!.recentApps.map((app, idx) => {
                  const badge = statusBadge(app.status);
                  const grad = AVATAR_GRADS[idx % AVATAR_GRADS.length];
                  const ini = initials(app.name);
                  return (
                    <div key={app.id}
                      className="px-5 py-3 flex items-center gap-3 hover:bg-teal-50/40 transition-colors group"
                    >
                      {/* Avatar */}
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center text-[11px] font-black text-white flex-none shadow-sm"
                        style={{ background: grad }}>
                        {ini}
                      </div>

                      {/* Name + email */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-800 truncate leading-tight">{app.name}</p>
                        <p className="text-[10px] text-slate-400 font-medium truncate">{app.email}</p>
                      </div>

                      {/* Course */}
                      <div className="w-44 flex-none">
                        <p className="text-xs font-semibold text-slate-600 truncate leading-tight">{app.course}</p>
                      </div>

                      {/* Status badge */}
                      <div className="w-24 flex-none flex justify-center">
                        <span className="inline-flex items-center gap-1.5 text-[10px] font-black px-2.5 py-1 rounded-full whitespace-nowrap"
                          style={{ background: badge.bg, color: badge.text }}>
                          <span className="w-1.5 h-1.5 rounded-full flex-none" style={{ background: badge.dot }} />
                          {badge.label}
                        </span>
                      </div>

                      {/* Time */}
                      <div className="w-16 flex-none flex items-center justify-end gap-1">
                        <Clock3 className="h-3 w-3 text-slate-300 flex-none" />
                        <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap">
                          {relativeTime(app.createdAt)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-5 py-2.5 border-t border-teal-50 flex-none flex items-center justify-between"
            style={{ background: "#f8fafc" }}>
            <span className="text-[10px] font-semibold text-slate-400">
              Showing {stats!.recentApps.length} of {stats!.totalApps} total registrations
            </span>
            <button className="flex items-center gap-1 text-[10px] font-bold text-teal-600 hover:text-teal-800 transition-colors">
              View all in Applications List
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>
        </div>

        {/* ── Live Activity Feed ───────────────────────────────────────────── */}
        <div className="rounded-2xl border border-teal-100/80 shadow-sm flex flex-col overflow-hidden"
          style={{ background: "linear-gradient(145deg,#ffffff,#f0fdfa)" }}
        >
          <div className="px-5 py-3.5 border-b border-teal-50 flex items-center gap-2.5 flex-none">
            <div className="p-1.5 rounded-lg" style={{ background: "linear-gradient(135deg,#0d9488,#0891b2)" }}>
              <Zap className="h-3.5 w-3.5 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-teal-900">Live Activity</h3>
              <p className="text-[10px] text-slate-400">Portal action timeline</p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {stats!.recentLogs.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center py-8">
                <Activity className="h-10 w-10 mb-3 text-teal-200" />
                <p className="text-sm font-semibold text-slate-400">No logs yet</p>
              </div>
            ) : (
              <div className="px-4 py-3 space-y-2">
                {stats!.recentLogs.map((log, idx) => {
                  const style = getActionStyle(log.action || "");
                  const timeStr = log.createdAt?.seconds
                    ? new Date(log.createdAt.seconds * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                    : "—";
                  return (
                    <div key={idx}
                      className="flex items-start gap-3 p-3 rounded-xl border border-teal-50 bg-white hover:border-teal-100 hover:shadow-sm transition-all"
                    >
                      <span className="text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded-lg flex-none mt-0.5 whitespace-nowrap"
                        style={{ background: style.bg, color: style.text }}>{style.label}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-700 truncate leading-tight">{log.action}</p>
                        <p className="text-[10px] font-medium truncate mt-0.5" style={{ color: style.text }}>
                          {log.email || log.uid || "system"}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 flex-none mt-0.5">
                        <Clock3 className="h-3 w-3 text-slate-300" />
                        <span className="text-[10px] text-slate-400 font-medium">{timeStr}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="px-4 py-3 border-t border-teal-50 flex-none flex items-center gap-1.5">
            <CheckCircle2 className="h-3 w-3 text-teal-400" />
            <span className="text-[10px] font-semibold text-teal-500">
              {stats!.recentLogs.length} recent event{stats!.recentLogs.length !== 1 ? "s" : ""} loaded
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}
