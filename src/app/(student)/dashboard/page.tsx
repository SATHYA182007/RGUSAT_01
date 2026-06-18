"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { db } from "@/lib/firebase";
import { doc, getDoc, getDocs, collection, query, where, orderBy, limit } from "firebase/firestore";
import { useAuthStore } from "@/store/useAuthStore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  FileText, 
  CreditCard, 
  CalendarDays, 
  BookOpen, 
  MonitorPlay, 
  Award, 
  Clock, 
  ArrowRight, 
  History,
  CheckCircle2,
  XCircle,
  HelpCircle
} from "lucide-react";
import { motion } from "framer-motion";

interface DashboardData {
  application: any;
  booking: any;
  mockAttemptsCount: number;
  examAttempt: any;
  result: any;
  activities: any[];
}

export default function StudentDashboard() {
  const { profile } = useAuthStore();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const loadDashboardData = async () => {
    if (!profile) return;
    try {
      // 1. Fetch Application
      let application = null;
      if (profile.applicationId) {
        const appSnap = await getDoc(doc(db, "applications", profile.applicationId));
        if (appSnap.exists()) application = appSnap.data();
      }

      // 2. Fetch Slot Booking
      let booking = null;
      const bookingQuery = query(collection(db, "slot_bookings"), where("uid", "==", profile.uid));
      const bookingSnap = await getDocs(bookingQuery);
      if (!bookingSnap.empty) {
        booking = bookingSnap.docs[0].data();
      }

      // 3. Fetch Mock Attempts Count
      const mockQuery = query(collection(db, "mock_attempts"), where("uid", "==", profile.uid));
      const mockSnap = await getDocs(mockQuery);
      const mockAttemptsCount = mockSnap.size;

      // 4. Fetch Exam Attempt
      let examAttempt = null;
      const examAttemptQuery = query(collection(db, "exam_attempts"), where("uid", "==", profile.uid));
      const examAttemptSnap = await getDocs(examAttemptQuery);
      if (!examAttemptSnap.empty) {
        examAttempt = examAttemptSnap.docs[0].data();
      }

      // 5. Fetch Result
      let result = null;
      const resultQuery = query(collection(db, "results"), where("uid", "==", profile.uid));
      const resultSnap = await getDocs(resultQuery);
      if (!resultSnap.empty) {
        result = resultSnap.docs[0].data();
      }

      // 6. Fetch Recent Activity Logs
      const logsQuery = query(
        collection(db, "activity_logs"),
        where("uid", "==", profile.uid)
      );
      const logsSnap = await getDocs(logsQuery);
      const activities = logsSnap.docs
        .map((d) => d.data())
        .sort((a, b) => {
          const timeA = a.createdAt?.seconds || 0;
          const timeB = b.createdAt?.seconds || 0;
          return timeB - timeA;
        })
        .slice(0, 5);

      setData({
        application,
        booking,
        mockAttemptsCount,
        examAttempt,
        result,
        activities,
      });
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [profile]);

  if (loading || !profile || !data) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-40 rounded-3xl" />
          <Skeleton className="h-40 rounded-3xl" />
          <Skeleton className="h-40 rounded-3xl" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-64 rounded-3xl" />
          <Skeleton className="h-64 rounded-3xl" />
        </div>
      </div>
    );
  }

  // Determine Overall Status
  const isPaid = profile.applicationId && data.application?.paymentStatus === "paid";
  const isSlotBooked = profile.slotBooked || !!data.booking;
  const isExamCompleted = profile.examCompleted || !!data.examAttempt;
  const isResultPublished = !!data.result;

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Welcome back, {profile.name}!
        </h2>
        <p className="text-sm text-slate-500 font-medium mt-1">
          Monitor your admission steps, book slots, practice mocks, and check scorecards.
        </p>
      </div>

      {/* Progress Cards Matrix */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1: Application */}
        <Card hoverable className="border border-slate-100">
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div className="p-2.5 bg-primary-teal/10 text-primary-teal rounded-xl">
                <FileText className="h-5 w-5" />
              </div>
              <Badge variant="success">Submitted</Badge>
            </div>
            <h3 className="text-sm font-bold text-slate-500 mt-4 uppercase tracking-wider">Application</h3>
            <p className="text-lg font-bold text-slate-900 mt-1 truncate">
              {profile.applicationId || "RGU-2026-N/A"}
            </p>
          </CardContent>
        </Card>

        {/* Card 2: Fee Payment */}
        <Card hoverable className="border border-slate-100">
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div className="p-2.5 bg-primary-sky/10 text-primary-sky rounded-xl">
                <CreditCard className="h-5 w-5" />
              </div>
              <Badge variant={isPaid ? "success" : "danger"}>{isPaid ? "Paid" : "Pending"}</Badge>
            </div>
            <h3 className="text-sm font-bold text-slate-500 mt-4 uppercase tracking-wider">Fee Payment</h3>
            <p className="text-lg font-bold text-slate-900 mt-1">₹999.00 INR</p>
          </CardContent>
        </Card>

        {/* Card 3: Slot Status */}
        <Card hoverable className="border border-slate-100">
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div className="p-2.5 bg-amber-500/10 text-amber-500 rounded-xl">
                <CalendarDays className="h-5 w-5" />
              </div>
              <Badge variant={isSlotBooked ? "success" : "warning"}>
                {isSlotBooked ? "Booked" : "Not Booked"}
              </Badge>
            </div>
            <h3 className="text-sm font-bold text-slate-500 mt-4 uppercase tracking-wider">Exam Slot</h3>
            <p className="text-sm font-bold text-slate-900 mt-1 truncate">
              {data.booking ? `${data.booking.date} | ${data.booking.timeStart}` : "Booking Pending"}
            </p>
          </CardContent>
        </Card>

        {/* Card 4: Exam Status */}
        <Card hoverable className="border border-slate-100">
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div className="p-2.5 bg-indigo-500/10 text-indigo-500 rounded-xl">
                <MonitorPlay className="h-5 w-5" />
              </div>
              <Badge variant={isExamCompleted ? "success" : "secondary"}>
                {isExamCompleted ? "Completed" : "Locked"}
              </Badge>
            </div>
            <h3 className="text-sm font-bold text-slate-500 mt-4 uppercase tracking-wider">Exam Attempt</h3>
            <p className="text-sm font-bold text-slate-900 mt-1">
              {isExamCompleted ? "Submitted" : "Pending Slot Match"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid: Next Step & Recent Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Next Action Hub */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="border border-slate-100 shadow-lg shadow-slate-100/10 overflow-hidden">
            <CardHeader className="bg-gradient-to-tr from-primary-teal/5 to-primary-sky/5">
              <CardTitle className="text-slate-900 text-base font-extrabold uppercase tracking-wider">
                Admission Action Hub
              </CardTitle>
              <CardDescription>
                Complete current tasks to unlock eligibility gates.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-5">
              {/* Task 1: Book Slot */}
              <div className="flex items-start gap-4 p-4 border border-slate-100 rounded-2xl bg-white hover:border-primary-teal/30 transition-all duration-200">
                <div className="mt-0.5">
                  {isSlotBooked ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                  ) : (
                    <Clock className="h-5 w-5 text-amber-500 shrink-0 animate-pulse" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-slate-800 text-sm">Book Examination Slot</h4>
                  <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                    {isSlotBooked 
                      ? `Confirmed: ${data.booking.date} (${data.booking.timeStart} - ${data.booking.timeEnd})` 
                      : "Choose your preferred dates to take the online proctored entrance exam."}
                  </p>
                  {!isSlotBooked && (
                    <Link href="/slot-booking" className="inline-flex mt-3">
                      <Button size="sm" className="h-8 rounded-lg text-xs font-semibold gap-1">
                        Select Slot
                        <ArrowRight className="h-3 w-3" />
                      </Button>
                    </Link>
                  )}
                </div>
              </div>

              {/* Task 2: Mock Tests */}
              <div className="flex items-start gap-4 p-4 border border-slate-100 rounded-2xl bg-white hover:border-primary-teal/30 transition-all duration-200">
                <div className="mt-0.5">
                  {data.mockAttemptsCount > 0 ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                  ) : (
                    <HelpCircle className="h-5 w-5 text-slate-400 shrink-0" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-slate-800 text-sm">Practice Adaptive Mock Tests</h4>
                  <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                    {data.mockAttemptsCount > 0
                      ? `Completed ${data.mockAttemptsCount} mock test attempts. Good job!`
                      : "Try simulated entrance test modules to get comfortable with the exam panel."}
                  </p>
                  <Link href="/mock-test" className="inline-flex mt-3">
                    <Button variant="outline" size="sm" className="h-8 rounded-lg text-xs font-semibold border-slate-200">
                      Go to Mock Hub
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Task 3: Entrance Exam */}
              <div className="flex items-start gap-4 p-4 border border-slate-100 rounded-2xl bg-white hover:border-primary-teal/30 transition-all duration-200">
                <div className="mt-0.5">
                  {isExamCompleted ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                  ) : (
                    <MonitorPlay className="h-5 w-5 text-slate-400 shrink-0" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-slate-800 text-sm">Launch Official Exam</h4>
                  <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                    {isExamCompleted
                      ? "Your entrance examination attempt has been uploaded. Awaiting result publishing."
                      : "Eligible once slot booking matches the current date and time. Check console lock."}
                  </p>
                  {!isExamCompleted && (
                    <Link href="/exam" className="inline-flex mt-3">
                      <Button size="sm" className="h-8 rounded-lg text-xs font-semibold gap-1 btn-primary-gradient">
                        Enter Exam Hall
                        <ArrowRight className="h-3 w-3" />
                      </Button>
                    </Link>
                  )}
                </div>
              </div>

              {/* Task 4: Results */}
              {isResultPublished && (
                <div className="flex items-start gap-4 p-4 border border-emerald-500/20 rounded-2xl bg-emerald-500/5 hover:border-emerald-500/30 transition-all duration-200">
                  <div className="mt-0.5">
                    <Award className="h-5 w-5 text-emerald-500 shrink-0" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-emerald-800 text-sm">Entrance Results Released!</h4>
                    <p className="text-xs text-emerald-600 mt-0.5 leading-relaxed">
                      Your scorecard is published. View score, category ranking, and scholarship eligibility.
                    </p>
                    <Link href="/results" className="inline-flex mt-3">
                      <Button size="sm" className="h-8 rounded-lg text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700">
                        View Scorecard
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent logs */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="border border-slate-100 shadow-lg shadow-slate-100/10">
            <CardHeader>
              <CardTitle className="text-slate-900 text-base font-extrabold flex items-center gap-2">
                <History className="h-4 w-4 text-primary-teal" />
                Recent Portal Activities
              </CardTitle>
              <CardDescription>
                Audited timeline of your applicant logs.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flow-root">
                <ul className="-mb-8">
                  {data.activities.length === 0 ? (
                    <div className="py-6 text-center text-slate-400 text-xs">
                      No logs available yet.
                    </div>
                  ) : (
                    data.activities.map((log, logIdx) => (
                      <li key={logIdx}>
                        <div className="relative pb-8">
                          {logIdx !== data.activities.length - 1 ? (
                            <span
                              className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-slate-100"
                              aria-hidden="true"
                            />
                          ) : null}
                          <div className="relative flex space-x-3">
                            <div>
                              <span className="h-8 w-8 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-primary-teal">
                                <CheckCircle2 className="h-4 w-4 text-primary-teal" />
                              </span>
                            </div>
                            <div className="flex-1 min-w-0 pt-1.5 flex justify-between space-x-4">
                              <div>
                                <p className="text-xs font-bold text-slate-800">{log.action}</p>
                                <p className="text-[10px] text-slate-400 mt-0.5 leading-normal">
                                  {log.details}
                                </p>
                              </div>
                              <div className="text-right text-[10px] whitespace-nowrap text-slate-400">
                                {log.createdAt
                                  ? new Date(log.createdAt.seconds * 1000).toLocaleDateString()
                                  : "Today"}
                              </div>
                            </div>
                          </div>
                        </div>
                      </li>
                    ))
                  )}
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
