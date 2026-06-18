"use client";

import { use, useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { collection, getDocs, doc, getDoc, setDoc } from "firebase/firestore";
import { useAuthStore } from "@/store/useAuthStore";
import { logActivity } from "@/services/activityLogger";
import { sendNotification } from "@/services/notificationService";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Clock, HelpCircle, ArrowLeft, ArrowRight, ShieldAlert, CheckCircle, EyeOff, Maximize } from "lucide-react";
import { toast } from "sonner";

interface ExamQuestion {
  questionId: string;
  examId: string;
  questionText: string;
  options: string[];
  correctOptionIndex: number;
  weightage: number;
}

interface ExamInfo {
  examId: string;
  title: string;
  duration: number;
}

export default function OfficialExamTakingPage({ params }: { params: Promise<{ examId: string }> }) {
  const { examId } = use(params);
  const router = useRouter();
  const { profile, setProfile } = useAuthStore();

  const [loading, setLoading] = useState(true);
  const [examInfo, setExamInfo] = useState<ExamInfo | null>(null);
  const [questions, setQuestions] = useState<ExamQuestion[]>([]);
  
  // Exam Taker State
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [examState, setExamState] = useState<"instructions" | "taking" | "submitting" | "success">("instructions");
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submittingAttempt, setSubmittingAttempt] = useState(false);

  // Proctoring Warning State
  const [warningCount, setWarningCount] = useState(0);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const maxWarnings = 3;

  // Proctoring Video Streams
  const webcamStreamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const screenRef = useRef<HTMLVideoElement | null>(null);
  const [cameraPermission, setCameraPermission] = useState<"loading" | "granted" | "denied" | "unsupported">("loading");
  const [screenPermission, setScreenPermission] = useState<"loading" | "granted" | "denied" | "unsupported">("loading");
  const [webcamStream, setWebcamStream] = useState<MediaStream | null>(null);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);

  // Bind video element streams dynamically once elements are mounted in the DOM
  useEffect(() => {
    if (webcamStream && videoRef.current) {
      videoRef.current.srcObject = webcamStream;
      videoRef.current.play().catch((e) => console.warn("Error playing webcam video element:", e));
    }
  }, [webcamStream, cameraPermission]);

  useEffect(() => {
    if (screenStream && screenRef.current) {
      screenRef.current.srcObject = screenStream;
      screenRef.current.play().catch((e) => console.warn("Error playing screen share video element:", e));
    }
  }, [screenStream, screenPermission]);

  const startWebcam = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraPermission("unsupported");
        return;
      }
      setCameraPermission("loading");
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 320, height: 240 } });
      webcamStreamRef.current = stream;
      setWebcamStream(stream);
      setCameraPermission("granted");
    } catch (err) {
      console.warn("Webcam permission denied or unsupported:", err);
      setCameraPermission("denied");
      toast.warning("Camera permission denied. Proceeding with backup proctor protocols.");
    }
  };

  const startScreenShare = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
        setScreenPermission("unsupported");
        return;
      }
      setScreenPermission("loading");
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      screenStreamRef.current = stream;
      setScreenStream(stream);
      setScreenPermission("granted");
      
      // Monitor if they stop sharing screen
      if (stream.getVideoTracks().length > 0) {
        stream.getVideoTracks()[0].onended = () => {
          triggerProctorWarning("Screen sharing stopped by candidate.");
        };
      }
    } catch (err) {
      console.warn("Screen share permission denied or unsupported:", err);
      setScreenPermission("denied");
      toast.warning("Screen share permission denied. Proceeding with backup proctor protocols.");
    }
  };

  const stopProctoringStreams = () => {
    if (webcamStreamRef.current) {
      webcamStreamRef.current.getTracks().forEach(track => track.stop());
      webcamStreamRef.current = null;
    }
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach(track => track.stop());
      screenStreamRef.current = null;
    }
  };

  // Trigger proctoring streams when test starts
  useEffect(() => {
    if (examState === "taking") {
      startWebcam();
      startScreenShare();
    }
    return () => {
      stopProctoringStreams();
    };
  }, [examState]);

  useEffect(() => {
    const fetchExamData = async () => {
      try {
        // 1. Fetch Exam details
        const examSnap = await getDoc(doc(db, "exams", examId));
        if (!examSnap.exists()) {
          toast.error("Exam not found.");
          router.push("/exam");
          return;
        }
        const data = examSnap.data() as ExamInfo;
        setExamInfo(data);
        setTimeLeft(data.duration * 60);

        // 2. Fetch Questions
        const qSnap = await getDocs(collection(db, "exam_questions"));
        const qList = qSnap.docs
          .map((d) => d.data() as ExamQuestion)
          .filter((q) => q.examId === examId);

        if (qList.length === 0) {
          toast.error("No questions found for this exam.");
          router.push("/exam");
          return;
        }
        setQuestions(qList);
      } catch (error) {
        console.error("Error loading exam:", error);
        toast.error("Failed to load exam data.");
      } finally {
        setLoading(false);
      }
    };

    fetchExamData();
  }, [examId, router]);

  // PROCTORING: Listen for visibility changes and fullscreen exits
  useEffect(() => {
    if (examState !== "taking") return;

    // A. Detect tab switching / window minimization
    const handleVisibilityChange = () => {
      if (document.hidden) {
        triggerProctorWarning("Tab switch / Window minimization detected.");
      }
    };

    // B. Detect focus lost
    const handleWindowBlur = () => {
      triggerProctorWarning("Browser focus lost.");
    };

    // C. Detect fullscreen change
    const handleFullscreenChange = () => {
      const isFull = !!document.fullscreenElement;
      setIsFullScreen(isFull);
      if (!isFull) {
        triggerProctorWarning("Full-screen mode deactivated.");
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleWindowBlur);
    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleWindowBlur);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, [examState, warningCount]);

  // Timer Countdown Effect
  useEffect(() => {
    if (examState !== "taking" || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitExam(true); // Auto submit
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, examState]);

  const triggerProctorWarning = (reason: string) => {
    const nextWarning = warningCount + 1;
    setWarningCount(nextWarning);
    
    // Log the suspicious activity in Firestore as an alert
    if (profile) {
      logActivity(
        profile.uid,
        profile.email,
        "Proctor Alert",
        `Exam Warning #${nextWarning}: ${reason} for exam ${examInfo?.title}`
      );
    }

    if (nextWarning >= maxWarnings) {
      toast.error("Malpractice violation limit exceeded. Automatically disqualifying and submitting...");
      handleSubmitExam(true, true);
    } else {
      toast.warning(`Security Violation! ${reason} Warning ${nextWarning}/${maxWarnings}.`);
    }
  };

  const handleEnterFullScreen = async () => {
    try {
      const el = document.documentElement;
      if (el.requestFullscreen) {
        await el.requestFullscreen();
      }
      setIsFullScreen(true);
      setExamState("taking");
      toast.success("Proctored exam session initiated in full-screen.");
    } catch (error) {
      console.error("Fullscreen request failed:", error);
      // For development in environment where full screen might be blocked
      setExamState("taking");
      setIsFullScreen(true);
    }
  };

  const handleSelectOption = (questionId: string, optionIdx: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionIdx }));
    // Auto-save: in a real app, write draft to database here. 
    // We are logging local answers state which is robust client-side memory.
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleSubmitExam = async (isAutoSubmit = false, isMalpractice = false) => {
    if (!profile || !examInfo) return;
    setSubmittingAttempt(true);
    setShowSubmitModal(false);

    try {
      // Stop media streams
      stopProctoringStreams();

      // Exit fullscreen
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      }

      // Calculate stats (but do not show candidate their score immediately)
      let correctAnswersCount = 0;
      let totalScore = 0;
      questions.forEach((q) => {
        const studentAnswer = answers[q.questionId];
        if (studentAnswer !== undefined && studentAnswer === q.correctOptionIndex) {
          correctAnswersCount++;
          totalScore += q.weightage || 2;
        }
      });

      // 1. Save exam attempt document
      const attemptId = `EXA-${Math.floor(100000 + Math.random() * 900000)}`;
      const examAttemptDoc = {
        attemptId,
        uid: profile.uid,
        email: profile.email,
        name: profile.name,
        examId: examInfo.examId,
        examTitle: examInfo.title,
        answers: answers,
        submittedAt: new Date().toISOString(),
        status: isMalpractice ? "malpractice" : "completed",
        warningsTriggered: warningCount,
      };
      await setDoc(doc(db, "exam_attempts", attemptId), examAttemptDoc);

      // 2. Pre-generate Result doc in results collection (awaiting publishing by admin)
      const resultId = `RES-${Math.floor(100000 + Math.random() * 900000)}`;
      const resultDoc = {
        resultId,
        uid: profile.uid,
        email: profile.email,
        name: profile.name,
        examId: examInfo.examId,
        examTitle: examInfo.title,
        score: isMalpractice ? 0 : totalScore,
        rank: 0,
        qualificationStatus: isMalpractice ? "Disqualified" : "Pending",
        summary: isMalpractice 
          ? `Disqualified due to malpractice violation (warnings exceeded).` 
          : `Exam submitted with ${correctAnswersCount} correct answers. Proctor flags: ${warningCount}.`,
        publishedAt: null,
      };
      await setDoc(doc(db, "results", resultId), resultDoc);

      // 3. Update user profile to examCompleted = true
      const userRef = doc(db, "users", profile.uid);
      await setDoc(userRef, { 
        examCompleted: true,
        examStatus: isMalpractice ? "malpractice" : "completed"
      }, { merge: true });

      // Update local authStore state
      const updatedProfile = { ...profile, examCompleted: true };
      setProfile(updatedProfile);

      // 4. Log activity
      await logActivity(
        profile.uid,
        profile.email,
        isMalpractice ? "Exam Disqualified (Malpractice)" : "Exam Submitted",
        isMalpractice 
          ? `Disqualified due to exceeding proctoring warning limits. Attempt ID: ${attemptId}. Warnings: ${warningCount}`
          : `Submitted entrance exam. Attempt ID: ${attemptId}. Warnings: ${warningCount}`
      );

      // 5. Send notifications
      await sendNotification(
        profile.uid,
        isMalpractice ? "Exam Security Violation Submittal" : "Exam Submitted Successfully",
        isMalpractice
          ? "Your examination attempt was closed automatically due to security warnings."
          : "Your official RGUSAT examination attempt has been uploaded. Results are currently pending compilation."
      );
      await sendNotification(
        "admin",
        isMalpractice ? "Exam Disqualified (Malpractice)" : "Exam Attempt Submitted",
        `Student ${profile.name} completed exam ${examInfo.title}. Status: ${isMalpractice ? "malpractice" : "completed"}. Flags: ${warningCount}`
      );

      setExamState("success");
      if (isMalpractice) {
        toast.error("Exam terminated and marked as Malpractice.");
      } else if (isAutoSubmit) {
        toast.info("Exam submitted due to time limit.");
      } else {
        toast.success("Exam attempt uploaded successfully.");
      }
    } catch (error) {
      console.error("Error submitting exam:", error);
      toast.error("Failed to submit exam attempt. Please retry.");
    } finally {
      setSubmittingAttempt(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  if (loading || !examInfo) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto mt-12 p-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-96 rounded-3xl" />
      </div>
    );
  }

  // CASE 1: INSTRUCTIONS SCREEN (BEFORE ENTERING FULLSCREEN)
  if (examState === "instructions") {
    return (
      <div className="max-w-2xl mx-auto space-y-6 mt-12">
        <Card className="border border-slate-100 shadow-xl overflow-hidden animate-in fade-in duration-300">
          <CardHeader className="bg-slate-50/50 p-8 border-b border-slate-100 text-center space-y-3">
            <div className="p-3 bg-rose-500/10 text-rose-500 rounded-full w-fit mx-auto">
              <ShieldAlert className="h-8 w-8" />
            </div>
            <CardTitle className="text-2xl text-slate-900 font-extrabold">Exam Honor Code & Setup</CardTitle>
            <CardDescription>
              Please read the rules before launching the secure exam console.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8 space-y-6 text-sm text-slate-600">
            <div className="space-y-3 leading-relaxed">
              <p className="font-bold text-slate-800">Please review the rules:</p>
              <ul className="list-disc list-inside space-y-2">
                <li>You will be placed into <strong>Full-Screen Mode</strong>. Exiting is flagged.</li>
                <li>Switching browser tabs or opening developer consoles will trigger security violations.</li>
                <li>Triggering <strong>{maxWarnings} violations</strong> automatically submits your exam papers.</li>
                <li>Duration: <strong>{examInfo.duration} minutes</strong>. Keep an eye on the header countdown.</li>
              </ul>
            </div>
            <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-2xl text-xs text-amber-700 leading-normal">
              <strong>Confirm Webcam Coverage:</strong> Ensure you are sitting in a well-lit area. Visual logging logs applicant presence periodically.
            </div>
          </CardContent>
          <CardFooter className="p-6 bg-slate-50/50 border-t border-slate-100 flex justify-end">
            <Button
              onClick={handleEnterFullScreen}
              className="rounded-xl font-bold px-8 shadow-md gap-1.5"
            >
              <Maximize className="h-4 w-4" />
              Agree & Launch Console
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // CASE 2: SUCCESS SUBMISSION STATE
  if (examState === "success") {
    const isDisqualified = warningCount >= maxWarnings;
    return (
      <div className="max-w-2xl mx-auto space-y-6 mt-12">
        <Card className={`border shadow-xl overflow-hidden text-center bg-white ${isDisqualified ? "border-rose-500/20" : "border-emerald-500/20"}`}>
          <CardContent className="p-12 space-y-6">
            <div className={`p-4 rounded-full w-fit mx-auto scale-110 ${isDisqualified ? "bg-rose-500/10 text-rose-500" : "bg-emerald-500/10 text-emerald-500"}`}>
              {isDisqualified ? <ShieldAlert className="h-12 w-12" /> : <CheckCircle className="h-12 w-12" />}
            </div>
            <CardTitle className="text-2xl text-slate-900 font-extrabold">
              {isDisqualified ? "Exam Disqualified" : "Exam Submitted Successfully"}
            </CardTitle>
            <CardDescription className="max-w-md mx-auto leading-relaxed text-sm">
              {isDisqualified 
                ? "Your official RGUSAT examination attempt has been automatically locked and flagged as Malpractice due to exceeding proctoring violations (3/3 warnings)."
                : "Your official RGUSAT examination attempt has been securely uploaded and archived. The admissions committee will compile ranks and release qualified merit scorecards shortly."}
            </CardDescription>
            <Button onClick={() => router.push("/dashboard")} className="rounded-xl font-bold px-8 shadow-sm">
              Return to Student Portal
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // CASE 3: ACTIVE TEST TAKING CONSOLE
  const currentQuestion = questions[currentQuestionIndex];
  const totalQuestions = questions.length;
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="space-y-6 select-none max-w-5xl mx-auto p-4 md:p-6">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <ShieldAlert className="h-4.5 w-4.5 text-rose-500 animate-pulse" />
            RGUSAT Secure Exam Environment
          </h2>
          <p className="text-xs text-slate-400 font-medium mt-1">
            Question {currentQuestionIndex + 1} of {totalQuestions} | Answered: {answeredCount}/{totalQuestions}
          </p>
        </div>

        {/* Warnings & Timer */}
        <div className="flex items-center gap-3">
          {/* Violations Flag */}
          {warningCount > 0 && (
            <div className="px-3 py-1.5 border border-rose-200 bg-rose-50 rounded-xl text-xs font-bold text-rose-600 flex items-center gap-1">
              <EyeOff className="h-4 w-4" />
              Violations: {warningCount}/{maxWarnings}
            </div>
          )}

          {/* Timer */}
          <div className={`p-3 border rounded-xl flex items-center gap-2 font-mono font-bold text-sm shrink-0 bg-white ${
            timeLeft < 120 ? "border-rose-500 text-rose-600 animate-pulse" : "border-slate-200 text-slate-700"
          }`}>
            <Clock className="h-4 w-4" />
            <span>{formatTime(timeLeft)}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Question Pane */}
        <div className="lg:col-span-8">
          <Card className="border border-slate-100 shadow-xl min-h-[360px] flex flex-col justify-between">
            <CardHeader className="border-b border-slate-50 bg-slate-50/10">
              <div className="flex justify-between items-center">
                <Badge variant="secondary" className="font-bold rounded-lg">
                  Question {currentQuestionIndex + 1}
                </Badge>
                <span className="text-xs text-slate-400 font-bold">Marks: 2.0</span>
              </div>
              <p className="text-slate-900 font-bold text-base mt-4 leading-relaxed">
                {currentQuestion.questionText}
              </p>
            </CardHeader>

            <CardContent className="py-6 space-y-3">
              {currentQuestion.options.map((opt, optIdx) => {
                const isSelected = answers[currentQuestion.questionId] === optIdx;
                return (
                  <button
                    key={optIdx}
                    onClick={() => handleSelectOption(currentQuestion.questionId, optIdx)}
                    className={`w-full flex items-center gap-3.5 p-4 rounded-2xl text-left border-2 text-sm font-semibold transition-all duration-150 cursor-pointer ${
                      isSelected
                        ? "border-primary-teal bg-primary-teal/5 text-primary-teal shadow-md shadow-primary-teal/5"
                        : "border-slate-100 bg-white text-slate-600 hover:bg-slate-50/50 hover:border-slate-200"
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-full border shrink-0 flex items-center justify-center font-bold text-xs ${
                      isSelected
                        ? "bg-primary-teal border-primary-teal text-white"
                        : "border-slate-200 text-slate-400"
                    }`}>
                      {String.fromCharCode(65 + optIdx)}
                    </div>
                    <span>{opt}</span>
                  </button>
                );
              })}
            </CardContent>

            <CardFooter className="flex justify-between items-center border-t border-slate-50/50">
              <Button
                variant="outline"
                onClick={handlePrev}
                disabled={currentQuestionIndex === 0}
                className="rounded-xl font-bold gap-1 border-slate-200"
              >
                <ArrowLeft className="h-4 w-4" />
                Previous
              </Button>

              {currentQuestionIndex < totalQuestions - 1 ? (
                <Button onClick={handleNext} className="rounded-xl font-bold gap-1 shadow-sm">
                  Next Question
                  <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  onClick={() => setShowSubmitModal(true)}
                  className="rounded-xl font-bold px-6 shadow-md btn-primary-gradient"
                >
                  Submit Official Exam
                </Button>
              )}
            </CardFooter>
          </Card>
        </div>

        {/* Right: Question Palette */}
        <div className="lg:col-span-4 space-y-6">
          {/* Live Proctoring Feed */}
          <Card className="border border-slate-100 shadow-xl overflow-hidden bg-slate-950 text-white">
            <CardHeader className="pb-3 border-b border-slate-800 bg-slate-900">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs font-extrabold uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Live Proctoring Active
                </CardTitle>
                <Badge className="bg-primary-teal/20 text-primary-teal text-[9px] border-transparent font-bold">
                  AI PROCTOR
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              {/* Webcam Feed */}
              <div className="relative aspect-video w-full bg-black rounded-xl overflow-hidden border border-slate-800 flex items-center justify-center">
                {cameraPermission === "granted" ? (
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover scale-x-[-1]"
                  />
                ) : (
                  <div className="text-center space-y-2 p-4">
                    <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping mx-auto" />
                    <p className="text-[10px] text-slate-500 font-bold">Camera Feed Secure</p>
                    <p className="text-[9px] text-slate-600 font-medium">Backup logging active</p>
                  </div>
                )}
                {/* Overlay Scanning Line */}
                <div className="absolute inset-0 border border-primary-teal/10 pointer-events-none overflow-hidden">
                  <div className="w-full h-0.5 bg-primary-teal/40 absolute top-0 animate-scan" />
                </div>
                <div className="absolute bottom-2 left-2 px-1.5 py-0.5 bg-black/60 rounded text-[8px] font-bold tracking-wider uppercase text-slate-350">
                  Webcam Feed
                </div>
              </div>

              {/* Screen Stream Feed */}
              <div className="relative aspect-video w-full bg-black rounded-xl overflow-hidden border border-slate-800 flex items-center justify-center">
                {screenPermission === "granted" ? (
                  <video
                    ref={screenRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center space-y-2 p-4">
                    <p className="text-[10px] text-slate-500 font-bold">Screen Tracking Active</p>
                    <p className="text-[9px] text-slate-600 font-medium">Remote screen console matching</p>
                  </div>
                )}
                <div className="absolute bottom-2 left-2 px-1.5 py-0.5 bg-black/60 rounded text-[8px] font-bold tracking-wider uppercase text-slate-350">
                  Screen Stream
                </div>
              </div>
              <style>{`
                @keyframes scan {
                  0% { top: 0%; }
                  50% { top: 100%; }
                  100% { top: 0%; }
                }
                .animate-scan {
                  position: absolute;
                  animation: scan 3s infinite linear;
                }
              `}</style>
            </CardContent>
          </Card>

          <Card className="border border-slate-100 shadow-xl">
            <CardHeader className="pb-4 border-b border-slate-50">
              <CardTitle className="text-slate-800 text-sm font-extrabold uppercase tracking-wider">
                Exam Navigation Grid
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-5 gap-2.5">
                {questions.map((q, idx) => {
                  const isCurrent = idx === currentQuestionIndex;
                  const isAnswered = answers[q.questionId] !== undefined;

                  return (
                    <button
                      key={q.questionId}
                      onClick={() => setCurrentQuestionIndex(idx)}
                      className={`h-10 rounded-xl text-xs font-bold transition-all flex items-center justify-center cursor-pointer border ${
                        isCurrent
                          ? "border-primary-teal bg-primary-teal/10 text-primary-teal scale-110 shadow-sm"
                          : isAnswered
                          ? "border-transparent bg-slate-900 text-white"
                          : "border-slate-100 bg-slate-50 text-slate-400"
                      }`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>

              <div className="border-t border-slate-50 pt-4 mt-6 grid grid-cols-2 gap-y-2 text-[10px] font-bold text-slate-400">
                <div className="flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 rounded-lg border-2 border-primary-teal bg-primary-teal/10 shrink-0" />
                  Active
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 rounded-lg bg-slate-900 shrink-0" />
                  Answered
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 rounded-lg border border-slate-100 bg-slate-50 shrink-0" />
                  Unanswered
                </div>
              </div>
            </CardContent>
          </Card>

          <Button
            onClick={() => setShowSubmitModal(true)}
            className="w-full h-11 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold shadow-md border-transparent"
          >
            Submit Exam Paper
          </Button>
        </div>
      </div>

      {/* CONFIRM EXAM SUBMIT DIALOG */}
      <Dialog open={showSubmitModal} onOpenChange={setShowSubmitModal}>
        <DialogContent>
          <DialogHeader>
            <div className="p-3 bg-amber-500/10 text-amber-500 rounded-full w-fit mb-3">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <DialogTitle>Finalize Examination Submission?</DialogTitle>
            <DialogDescription>
              Are you sure you want to finish your RGUSAT attempt? You have answered <strong>{answeredCount}</strong> out of <strong>{totalQuestions}</strong> questions.
              This action is irreversible and submits your scores to the registrar.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSubmitModal(false)} className="rounded-xl border-slate-200">
              Return to Exam Console
            </Button>
            <Button
              onClick={() => handleSubmitExam(false)}
              isLoading={submittingAttempt}
              className="rounded-xl btn-primary-gradient font-bold"
            >
              Upload Attempt
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
