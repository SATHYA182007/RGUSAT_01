"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/firebase";
import { collection, getDocs, doc, getDoc, addDoc } from "firebase/firestore";
import { useAuthStore } from "@/store/useAuthStore";
import { logActivity } from "@/services/activityLogger";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Clock, HelpCircle, ArrowLeft, ArrowRight, CheckCircle2, AlertTriangle, BookOpen, RotateCcw, Award } from "lucide-react";
import { toast } from "sonner";

interface MockQuestion {
  questionId: string;
  testId: string;
  questionText: string;
  options: string[];
  correctOptionIndex: number;
  weightage: number;
}

interface MockTest {
  testId: string;
  title: string;
  duration: number;
}

export default function MockExamPage({ params }: { params: Promise<{ testId: string }> }) {
  const { testId } = use(params);
  const router = useRouter();
  const { profile } = useAuthStore();

  const [loading, setLoading] = useState(true);
  const [testInfo, setTestInfo] = useState<MockTest | null>(null);
  const [questions, setQuestions] = useState<MockQuestion[]>([]);
  
  // Test Taker State
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({}); // questionId -> optionIndex
  const [timeLeft, setTimeLeft] = useState(0); // seconds
  const [testState, setTestState] = useState<"taking" | "submitting" | "scorecard">("taking");
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submittingAttempt, setSubmittingAttempt] = useState(false);
  
  // Scorecard State
  const [attemptSummary, setAttemptSummary] = useState<{
    score: number;
    totalQuestions: number;
    correctAnswers: number;
  } | null>(null);

  useEffect(() => {
    const fetchExamData = async () => {
      try {
        // 1. Fetch Test Information
        const testSnap = await getDoc(doc(db, "mock_tests", testId));
        if (!testSnap.exists()) {
          toast.error("Mock test not found.");
          router.push("/mock-test");
          return;
        }
        const rawData = testSnap.data();
        const testData = {
          testId: rawData.testId || testSnap.id,
          title: rawData.title || "",
          duration: rawData.duration || 0,
        } as MockTest;
        setTestInfo(testData);
        setTimeLeft(testData.duration * 60);

        // 2. Fetch Questions
        const qSnap = await getDocs(collection(db, "mock_questions"));
        const qList = qSnap.docs
          .map((d) => {
            const data = d.data();
            return {
              questionId: data.questionId || d.id,
              testId: data.testId || data.mockTestId || "",
              questionText: data.questionText || data.question || "",
              options: Array.isArray(data.options) ? data.options : [],
              correctOptionIndex: data.correctOptionIndex !== undefined ? data.correctOptionIndex : (data.correctAnswer !== undefined ? parseInt(data.correctAnswer) : 0),
              weightage: data.weightage || data.marks || 2,
            } as MockQuestion;
          })
          .filter((q) => q.testId === testId && q.questionText && q.options.length > 0);
        
        if (qList.length === 0) {
          toast.error("No questions found for this mock test.");
          router.push("/mock-test");
          return;
        }
        setQuestions(qList);
      } catch (error) {
        console.error("Error loading test questions:", error);
        toast.error("Failed to load mock exam data.");
      } finally {
        setLoading(false);
      }
    };

    fetchExamData();
  }, [testId, router]);

  // Timer Countdown Effect
  useEffect(() => {
    if (testState !== "taking" || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitTest(true); // Auto submit
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, testState]);

  const handleSelectOption = (questionId: string, optionIdx: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionIdx }));
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

  const handleSubmitTest = async (isAutoSubmit = false) => {
    if (!profile || !testInfo) return;
    setSubmittingAttempt(true);
    setShowSubmitModal(false);

    try {
      // 1. Evaluate answers
      let correctAnswersCount = 0;
      let totalScore = 0;

      questions.forEach((q) => {
        const studentAnswer = answers[q.questionId];
        if (studentAnswer !== undefined && studentAnswer === q.correctOptionIndex) {
          correctAnswersCount++;
          totalScore += q.weightage || 2;
        }
      });

      // 2. Save attempt to mock_attempts
      const attemptDoc = {
        uid: profile.uid,
        email: profile.email,
        name: profile.name,
        testId: testInfo.testId,
        testTitle: testInfo.title,
        score: totalScore,
        totalQuestions: questions.length,
        correctAnswers: correctAnswersCount,
        answers: answers,
        createdAt: new Date().toISOString(),
      };
      
      await addDoc(collection(db, "mock_attempts"), attemptDoc);

      // 3. Log activity
      await logActivity(
        profile.uid,
        profile.email,
        "Mock Test Attempted",
        `Completed mock test ${testInfo.title}. Score: ${totalScore}/${questions.length * 2}`
      );

      // Set Summary State for Scorecard
      setAttemptSummary({
        score: totalScore,
        totalQuestions: questions.length,
        correctAnswers: correctAnswersCount,
      });

      setTestState("scorecard");
      if (isAutoSubmit) {
        toast.info("Time expired! Your mock test was submitted automatically.");
      } else {
        toast.success("Mock test submitted successfully!");
      }
    } catch (error) {
      console.error("Error submitting mock test:", error);
      toast.error("Failed to submit attempt.");
    } finally {
      setSubmittingAttempt(false);
    }
  };

  // Helper to format remaining seconds as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  if (loading || !testInfo) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          <Skeleton className="md:col-span-8 h-80 rounded-3xl" />
          <Skeleton className="md:col-span-4 h-64 rounded-3xl" />
        </div>
      </div>
    );
  }

  // RENDER SCORECARD SUMMARY STATE
  if (testState === "scorecard" && attemptSummary) {
    const totalPossibleScore = questions.length * 2;
    const scorePercentage = (attemptSummary.score / totalPossibleScore) * 100;

    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <Card className="border border-slate-100 shadow-xl overflow-hidden">
          <div className="p-8 text-center bg-gradient-to-tr from-primary-teal/5 to-primary-sky/5 border-b border-slate-50 space-y-4">
            <div className="p-4 bg-primary-teal/10 text-primary-teal rounded-full w-fit mx-auto scale-110">
              <Award className="h-12 w-12" />
            </div>
            <CardTitle className="text-2xl text-slate-900 font-extrabold">Mock Evaluation Summary</CardTitle>
            <CardDescription className="max-w-md mx-auto">
              Your mock practice results are evaluated below.
            </CardDescription>
          </div>
          <CardContent className="p-8 space-y-8">
            {/* Stats Metrics */}
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Score</span>
                <span className="text-2xl font-extrabold text-slate-900 mt-1 block">
                  {attemptSummary.score} <span className="text-sm font-medium text-slate-400">/ {totalPossibleScore}</span>
                </span>
              </div>
              <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Accuracy</span>
                <span className="text-2xl font-extrabold text-slate-900 mt-1 block">
                  {attemptSummary.correctAnswers} <span className="text-sm font-medium text-slate-400">/ {attemptSummary.totalQuestions}</span>
                </span>
              </div>
              <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Percentage</span>
                <span className="text-2xl font-extrabold text-slate-900 mt-1 block">
                  {scorePercentage.toFixed(0)}%
                </span>
              </div>
            </div>

            {/* Answer Key Review Details */}
            <div className="space-y-4">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <BookOpen className="h-4.5 w-4.5 text-primary-teal" />
                Dossier Review & Explanations
              </h3>
              <div className="space-y-4">
                {questions.map((q, idx) => {
                  const studentAnswer = answers[q.questionId];
                  const isCorrect = studentAnswer === q.correctOptionIndex;
                  return (
                    <div key={q.questionId} className={`p-5 rounded-2xl border ${
                      isCorrect ? "border-emerald-500/20 bg-emerald-500/5" : "border-rose-500/20 bg-rose-500/5"
                    }`}>
                      <p className="text-sm font-bold text-slate-900">
                        Q{idx + 1}. {q.questionText}
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4 text-xs">
                        {q.options.map((opt, optIdx) => {
                          const isKey = optIdx === q.correctOptionIndex;
                          const isStudentSelected = optIdx === studentAnswer;
                          return (
                            <div
                              key={optIdx}
                              className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                                isKey
                                  ? "border-emerald-500 bg-emerald-500/10 text-emerald-800 font-bold"
                                  : isStudentSelected
                                  ? "border-rose-500 bg-rose-500/10 text-rose-800 font-semibold"
                                  : "border-slate-200 bg-white text-slate-600"
                              }`}
                            >
                              <div className="w-5 h-5 rounded-full shrink-0 flex items-center justify-center border text-[10px] font-bold">
                                {String.fromCharCode(65 + optIdx)}
                              </div>
                              <span>{opt}</span>
                            </div>
                          );
                        })}
                      </div>
                      <div className="mt-3.5 text-xs text-slate-500 font-medium">
                        {isCorrect ? (
                          <span className="text-emerald-600 font-bold">✓ Correct Answer selected (+2 marks)</span>
                        ) : (
                          <span>
                            <span className="text-rose-600 font-bold">✗ Incorrect selection. </span>
                            Correct option is <strong>{String.fromCharCode(65 + q.correctOptionIndex)}</strong>
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between items-center bg-slate-50/50 p-6">
            <Link href="/mock-test">
              <Button variant="outline" className="rounded-xl font-bold gap-1 border-slate-200">
                <ArrowLeft className="h-4 w-4" />
                Return to Hub
              </Button>
            </Link>
            <Button
              onClick={() => {
                setTestState("taking");
                setAnswers({});
                setCurrentQuestionIndex(0);
                setTimeLeft(testInfo.duration * 60);
              }}
              className="rounded-xl font-bold gap-1.5 shadow-sm"
            >
              <RotateCcw className="h-4 w-4" />
              Retake Mock
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // RENDER INTERACTIVE TEST TAKER SCREEN
  const currentQuestion = questions[currentQuestionIndex];
  const totalQuestions = questions.length;
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="space-y-6">
      {/* Test Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">{testInfo.title}</h2>
          <p className="text-xs text-slate-400 font-medium mt-1">
            Question {currentQuestionIndex + 1} of {totalQuestions} | Answered: {answeredCount} / {totalQuestions}
          </p>
        </div>

        {/* Timer Box */}
        <div className={`p-3 border rounded-2xl flex items-center gap-2.5 font-mono font-bold text-base shrink-0 transition-colors ${
          timeLeft < 120 
            ? "border-rose-500 bg-rose-500/5 text-rose-600 animate-pulse" 
            : "border-slate-200 bg-white text-slate-700"
        }`}>
          <Clock className="h-5 w-5" />
          <span>{formatTime(timeLeft)}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Question Pane */}
        <div className="lg:col-span-8">
          <Card className="border border-slate-100 shadow-xl min-h-[360px] flex flex-col justify-between">
            <CardHeader className="border-b border-slate-50 bg-slate-50/10">
              <div className="flex justify-between items-center">
                <Badge className="bg-primary-teal/10 text-primary-teal hover:bg-primary-teal/10 font-bold rounded-lg border-transparent">
                  MCQ Item {currentQuestionIndex + 1}
                </Badge>
                <span className="text-xs text-slate-400 font-bold">Weightage: 2 Marks</span>
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
                    <div className={`w-6 h-6 rounded-full border shrink-0 flex items-center justify-center font-bold transition-all text-xs ${
                      isSelected
                        ? "bg-primary-teal border-primary-teal text-white"
                        : "border-slate-200 text-slate-400 group-hover:border-slate-300"
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
                  Submit Practice Test
                </Button>
              )}
            </CardFooter>
          </Card>
        </div>

        {/* Right Side: Palette Pane */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="border border-slate-100 shadow-xl">
            <CardHeader className="pb-4 border-b border-slate-50">
              <CardTitle className="text-slate-800 text-sm font-extrabold uppercase tracking-wider">
                Question Palette
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {/* Palette Grid */}
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
                          ? "border-transparent bg-primary-teal text-white"
                          : "border-slate-100 bg-slate-50 text-slate-400"
                      }`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>

              {/* Legends */}
              <div className="border-t border-slate-50 pt-4 mt-6 grid grid-cols-2 gap-y-2 text-[10px] font-bold text-slate-400">
                <div className="flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 rounded-lg border-2 border-primary-teal bg-primary-teal/10 shrink-0" />
                  Active
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 rounded-lg bg-primary-teal shrink-0" />
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
            className="w-full h-11 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold shadow-md border-transparent"
          >
            Submit Test
          </Button>
        </div>
      </div>

      {/* CONFIRMATION SUBMISSION DIALOG */}
      <Dialog open={showSubmitModal} onOpenChange={setShowSubmitModal}>
        <DialogContent>
          <DialogHeader>
            <div className="p-3 bg-amber-500/10 text-amber-500 rounded-full w-fit mb-3">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <DialogTitle>Submit Practice Exam?</DialogTitle>
            <DialogDescription>
              You have completed <strong>{answeredCount}</strong> out of <strong>{totalQuestions}</strong> questions.
              Are you ready to submit your scorecard evaluation?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSubmitModal(false)} className="rounded-xl border-slate-200">
              Continue Test
            </Button>
            <Button
              onClick={() => handleSubmitTest(false)}
              isLoading={submittingAttempt}
              className="rounded-xl btn-primary-gradient font-bold"
            >
              Finish Evaluation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
