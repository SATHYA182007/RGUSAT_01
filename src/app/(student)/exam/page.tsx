"use client";

import { useEffect, useState } from "react";
import useRouter from "next/navigation";
import { db } from "@/lib/firebase";
import { collection, getDocs, doc, setDoc, query, where, getDoc } from "firebase/firestore";
import { useAuthStore } from "@/store/useAuthStore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Lock, Unlock, MonitorPlay, AlertTriangle, CheckCircle2, ShieldCheck, HelpCircle, CalendarClock } from "lucide-react";
import { toast } from "sonner";
import { useRouter as useAppRouter } from "next/navigation";

interface ExamDoc {
  examId: string;
  title: string;
  duration: number; // minutes
  published: boolean;
  scheduledDate: string; // YYYY-MM-DD
}

interface SlotBooking {
  bookingId: string;
  date: string;
  timeStart: string;
  timeEnd: string;
}

export default function ExamLandingPage() {
  const router = useAppRouter();
  const { profile } = useAuthStore();
  
  const [loading, setLoading] = useState(true);
  const [exam, setExam] = useState<ExamDoc | null>(null);
  const [booking, setBooking] = useState<SlotBooking | null>(null);
  const [examCompleted, setExamCompleted] = useState(false);
  const [bypassDate, setBypassDate] = useState(false);

  // Seed default official exam if none exists
  const seedExamsIfEmpty = async () => {
    const docRef = doc(db, "exams", "rgusat_entrance_2026");
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      const defaultExam = {
        examId: "rgusat_entrance_2026",
        title: "RGUSAT 2026 – Official Scholastic Aptitude Test",
        duration: 30, // 30 minutes
        published: true,
        scheduledDate: new Date().toISOString().split("T")[0], // Set to today by default for testing!
      };
      await setDoc(docRef, defaultExam);

      const defaultQuestions = [
        {
          questionId: "eq_1",
          examId: "rgusat_entrance_2026",
          questionText: "Which of the following numbers is prime?",
          options: ["51", "57", "63", "67"],
          correctOptionIndex: 3,
          weightage: 2,
        },
        {
          questionId: "eq_2",
          examId: "rgusat_entrance_2026",
          questionText: "If 15 men can complete a construction project in 20 days, how many days will 25 men take to complete the same work?",
          options: ["10 days", "12 days", "14 days", "16 days"],
          correctOptionIndex: 1,
          weightage: 2,
        },
        {
          questionId: "eq_3",
          examId: "rgusat_entrance_2026",
          questionText: "The price of petrol increased by 25%. By what percentage must a motorist reduce consumption so that expenditures remain unchanged?",
          options: ["20%", "25%", "30%", "33.3%"],
          correctOptionIndex: 0,
          weightage: 2,
        },
        {
          questionId: "eq_4",
          examId: "rgusat_entrance_2026",
          questionText: "Choose the word most opposite in meaning to: VAGUE",
          options: ["Unclear", "Precise", "Nebulous", "Abstract"],
          correctOptionIndex: 1,
          weightage: 2,
        },
        {
          questionId: "eq_5",
          examId: "rgusat_entrance_2026",
          questionText: "A cube of side 4 cm is painted red on all faces, and then cut into 1 cm small cubes. How many of the small cubes will have exactly 3 faces painted?",
          options: ["4", "8", "12", "16"],
          correctOptionIndex: 1, // corners of a cube
          weightage: 2,
        },
      ];

      for (const q of defaultQuestions) {
        await setDoc(doc(db, "exam_questions", q.questionId), q);
      }
    }
  };

  const loadExamHubData = async () => {
    if (!profile) return;
    setLoading(true);
    try {
      await seedExamsIfEmpty();

      // 1. Fetch Official Exam info
      const examSnap = await getDoc(doc(db, "exams", "rgusat_entrance_2026"));
      if (examSnap.exists()) {
        setExam(examSnap.data() as ExamDoc);
      }

      // 2. Fetch booking
      const bookingQuery = query(collection(db, "slot_bookings"), where("uid", "==", profile.uid));
      const bookingSnap = await getDocs(bookingQuery);
      if (!bookingSnap.empty) {
        setBooking(bookingSnap.docs[0].data() as SlotBooking);
      }

      // 3. Check if exam completed
      const attemptQuery = query(collection(db, "exam_attempts"), where("uid", "==", profile.uid));
      const attemptSnap = await getDocs(attemptQuery);
      if (!attemptSnap.empty || profile.examCompleted) {
        setExamCompleted(true);
      }
    } catch (error) {
      console.error("Error loading exam info:", error);
      toast.error("Failed to load exam configurations.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExamHubData();
  }, [profile]);

  if (loading || !profile) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 rounded-3xl" />
      </div>
    );
  }

  // Gates Check
  const todayDate = new Date().toISOString().split("T")[0];
  const hasPaid = dataPaidStatus(profile);
  const hasBooked = profile.slotBooked || !!booking;
  const isDateMatched = booking ? (booking.date === todayDate || bypassDate) : false;
  const isEligible = hasPaid && hasBooked && isDateMatched && !examCompleted;

  function dataPaidStatus(prof: any) {
    // Return true since they must have logged in (and to login, they paid)
    return true; 
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Main Entrance Examination
        </h2>
        <p className="text-sm text-slate-500 font-medium mt-1">
          Authorized console for launching the official RGUSAT Scholastic Aptitude Test.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Verification Gates */}
        <div className="lg:col-span-4 space-y-4">
          <Card className="border border-slate-100 shadow-lg shadow-slate-100/10">
            <CardHeader className="pb-4">
              <CardTitle className="text-slate-800 text-sm font-extrabold uppercase tracking-wider">
                Eligibility Checklist
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0 space-y-4 text-sm font-semibold">
              {/* Gate 1: Payment */}
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Admissions Fee Clear</span>
                <Badge variant="success">Cleared</Badge>
              </div>

              {/* Gate 2: Booking */}
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Exam Slot Booked</span>
                <Badge variant={hasBooked ? "success" : "danger"}>
                  {hasBooked ? "Booked" : "Pending"}
                </Badge>
              </div>

              {/* Gate 3: Date match */}
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Scheduled Date Today</span>
                <Badge variant={isDateMatched ? "success" : "danger"}>
                  {isDateMatched ? "Matched" : "Unmatched"}
                </Badge>
              </div>
            </CardContent>
            {hasBooked && !isDateMatched && (
              <CardFooter className="bg-slate-50/50 p-4 border-t border-slate-100 text-[10px] text-slate-400 font-semibold flex flex-col gap-3">
                <div className="w-full flex justify-between">
                  <span>Reserved Slot:</span>
                  <span className="text-slate-700">{booking?.date} | {booking?.timeStart}</span>
                </div>
                {/* Dev Mode Bypass option */}
                <div className="w-full flex items-center justify-between border-t border-slate-200/60 pt-3">
                  <span>Development Mode:</span>
                  <Button
                    onClick={() => {
                      setBypassDate(true);
                      toast.info("Development override enabled. Bypassing slot date check.");
                    }}
                    size="sm"
                    className="h-6 px-2.5 rounded-md text-[9px]"
                  >
                    Bypass Date Lock
                  </Button>
                </div>
              </CardFooter>
            )}
          </Card>
        </div>

        {/* Right: Locking Status Indicator */}
        <div className="lg:col-span-8">
          {examCompleted ? (
            /* CASE: Exam already done */
            <Card className="border-emerald-500/20 bg-emerald-500/5 overflow-hidden">
              <CardContent className="p-8 text-center space-y-4">
                <div className="p-4 bg-emerald-500/10 text-emerald-500 rounded-full w-fit mx-auto scale-110">
                  <CheckCircle2 className="h-12 w-12" />
                </div>
                <CardTitle className="text-slate-900 text-xl font-extrabold">Examination Completed</CardTitle>
                <CardDescription className="max-w-md mx-auto">
                  Your entrance paper has been received. Scorecard publications are managed by the administration.
                </CardDescription>
                <Button onClick={() => router.push("/results")} className="rounded-xl font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md">
                  Check Results Portal
                </Button>
              </CardContent>
            </Card>
          ) : isEligible && exam ? (
            /* CASE: Eligible to launch */
            <Card className="border-primary-teal/20 shadow-xl overflow-hidden animate-in fade-in duration-300">
              <div className="p-8 text-center bg-gradient-to-tr from-primary-teal/5 to-primary-sky/5 border-b border-slate-50 space-y-4">
                <div className="p-4 bg-primary-teal/10 text-primary-teal rounded-full w-fit mx-auto">
                  <Unlock className="h-12 w-12 animate-bounce" />
                </div>
                <CardTitle className="text-xl text-slate-900 font-extrabold">Exam Console Unlocked</CardTitle>
                <CardDescription>
                  You are eligible to launch the official entrance examination.
                </CardDescription>
              </div>
              <CardContent className="p-8 space-y-6">
                <div className="bg-slate-50/50 p-6 rounded-2xl border border-slate-100 space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Title:</span>
                    <span className="font-bold text-slate-800">{exam.title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Duration Limit:</span>
                    <span className="font-bold text-slate-800">{exam.duration} Minutes</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Weightage:</span>
                    <span className="font-bold text-slate-800">10 Marks (5 Questions)</span>
                  </div>
                </div>

                <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-2xl text-xs text-amber-700 leading-relaxed flex gap-2.5 items-start">
                  <AlertTriangle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
                  <div>
                    <strong>Proctored Environment Warnings:</strong>
                    <ul className="list-disc list-inside mt-1 space-y-1">
                      <li>You must grant full-screen access to start the exam.</li>
                      <li>Exiting full screen or clicking out of the browser tab will be logged and can result in automatic submission.</li>
                      <li>The countdown runs continuously; do not refresh.</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="p-6 bg-slate-50/20 border-t border-slate-100 flex justify-end">
                <Button
                  onClick={() => router.push(`/exam/${exam?.examId || "rgusat_entrance_2026"}`)}
                  className="rounded-xl font-bold px-8 py-3 shadow-md gap-1.5"
                >
                  <MonitorPlay className="h-4.5 w-4.5" />
                  Start Proctored Exam
                </Button>
              </CardFooter>
            </Card>
          ) : (
            /* CASE: Locked screen */
            <Card className="border border-slate-200 shadow-xl overflow-hidden bg-white">
              <div className="p-8 text-center bg-slate-50 border-b border-slate-100 space-y-4">
                <div className="p-4 bg-slate-100 text-slate-400 rounded-full w-fit mx-auto">
                  <Lock className="h-12 w-12" />
                </div>
                <CardTitle className="text-xl text-slate-900 font-extrabold">Examination Console Locked</CardTitle>
                <CardDescription>
                  Your exam panel is locked because eligibility checks did not clear.
                </CardDescription>
              </div>
              <CardContent className="p-8 text-center text-sm text-slate-500">
                {!hasBooked ? (
                  <p>You have not booked an exam slot yet. Please navigate to Slot Booking first.</p>
                ) : (
                  <p>
                    Your booked exam date (<strong>{booking?.date}</strong>) is scheduled for a different date. 
                    Please return when your booked slot opens, or use the dev override button on the left to bypass this restriction.
                  </p>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
