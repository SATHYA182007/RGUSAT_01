"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { db } from "@/lib/firebase";
import { collection, getDocs, doc, setDoc, query, where, orderBy } from "firebase/firestore";
import { useAuthStore } from "@/store/useAuthStore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen, Clock, HelpCircle, ArrowRight, Award, RefreshCw, BarChart2 } from "lucide-react";
import { toast } from "sonner";

interface MockTest {
  testId: string;
  title: string;
  description: string;
  duration: number; // minutes
  questionCount: number;
}

interface MockAttempt {
  id: string;
  testId: string;
  testTitle: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  createdAt: any;
}

export default function MockTestHubPage() {
  const { profile } = useAuthStore();
  const [tests, setTests] = useState<MockTest[]>([]);
  const [attempts, setAttempts] = useState<MockAttempt[]>([]);
  
  const [loading, setLoading] = useState(true);

  // Seed default mocks & questions if database is empty
  const seedMocksIfEmpty = async () => {
    const testsSnap = await getDocs(collection(db, "mock_tests"));
    const validTests = testsSnap.docs.filter((d) => {
      const data = d.data();
      return (data.testId || d.id) && data.title && data.duration;
    });

    if (validTests.length === 0) {
      // 1. Create Mock Tests
      const mocks = [
        {
          testId: "mock_aptitude_01",
          title: "Quantitative Aptitude Mock Prep",
          description: "Practice arithmetic modeling, statistical percentages, series, and algebra calculations.",
          duration: 15,
          questionCount: 5,
          published: true,
        },
        {
          testId: "mock_verbal_01",
          title: "Verbal Reasoning Mock Prep",
          description: "Practice language comprehension, grammatical edits, sentence structuring, and vocab.",
          duration: 10,
          questionCount: 5,
          published: true,
        },
      ];

      for (const m of mocks) {
        await setDoc(doc(db, "mock_tests", m.testId), m);
      }

      // 2. Create Mock Questions for mock_aptitude_01
      const qAptitude = [
        {
          questionId: "q_apt_1",
          testId: "mock_aptitude_01",
          questionText: "If a boat travels 24 km upstream in 4 hours and 36 km downstream in 3 hours, what is the speed of the current?",
          options: ["1 km/h", "2 km/h", "3 km/h", "4 km/h"],
          correctOptionIndex: 2,
          weightage: 2,
        },
        {
          questionId: "q_apt_2",
          testId: "mock_aptitude_01",
          questionText: "A cistern is normally filled in 8 hours, but takes 2 hours longer to fill because of a leak in its bottom. If the cistern is full, how long will the leak take to empty it?",
          options: ["30 hours", "40 hours", "45 hours", "50 hours"],
          correctOptionIndex: 1,
          weightage: 2,
        },
        {
          questionId: "q_apt_3",
          testId: "mock_aptitude_01",
          questionText: "Two numbers are in the ratio 3:5. If 9 is subtracted from each, the new numbers are in the ratio 12:23. What is the smaller number?",
          options: ["27", "33", "49", "55"],
          correctOptionIndex: 0,
          weightage: 2,
        },
        {
          questionId: "q_apt_4",
          testId: "mock_aptitude_01",
          questionText: "A sum of money doubles itself at compound interest in 15 years. In how many years will it become eight times itself?",
          options: ["30 years", "45 years", "50 years", "60 years"],
          correctOptionIndex: 1,
          weightage: 2,
        },
        {
          questionId: "q_apt_5",
          testId: "mock_aptitude_01",
          questionText: "What is the next number in the series: 3, 7, 15, 31, 63, ...?",
          options: ["95", "112", "127", "131"],
          correctOptionIndex: 2,
          weightage: 2,
        },
      ];

      for (const q of qAptitude) {
        await setDoc(doc(db, "mock_questions", q.questionId), q);
      }

      // 3. Create Mock Questions for mock_verbal_01
      const qVerbal = [
        {
          questionId: "q_verb_1",
          testId: "mock_verbal_01",
          questionText: "Choose the synonym for: ADVERSITY",
          options: ["Prosperity", "Misfortune", "Opportunity", "Sincerity"],
          correctOptionIndex: 1,
          weightage: 2,
        },
        {
          questionId: "q_verb_2",
          testId: "mock_verbal_01",
          questionText: "Complete the analogy: LUBRICANT : FRICTION :: ________ : ________",
          options: ["Silencer : Noise", "Motor : Electricity", "Adhesive : Connection", "Catalyst : Process"],
          correctOptionIndex: 0,
          weightage: 2,
        },
        {
          questionId: "q_verb_3",
          testId: "mock_verbal_01",
          questionText: "Identify the grammatically correct sentence.",
          options: [
            "Neither the teacher nor the students was present.",
            "Neither the teacher nor the students were present.",
            "Neither the teacher or the students were present.",
            "Neither the teacher nor the students is present.",
          ],
          correctOptionIndex: 1,
          weightage: 2,
        },
        {
          questionId: "q_verb_4",
          testId: "mock_verbal_01",
          questionText: "Choose the antonym for: EPHEMERAL",
          options: ["Transient", "Permanent", "Brief", "Dynamic"],
          correctOptionIndex: 1,
          weightage: 2,
        },
        {
          questionId: "q_verb_5",
          testId: "mock_verbal_01",
          questionText: "Find the misspelled word.",
          options: ["Occurrence", "Necessary", "Embarrass", "Accomodate"],
          correctOptionIndex: 3, // should be Accommodate
          weightage: 2,
        },
      ];

      for (const q of qVerbal) {
        await setDoc(doc(db, "mock_questions", q.questionId), q);
      }
    }
  };

  const loadHubData = async () => {
    if (!profile) return;
    setLoading(true);
    try {
      await seedMocksIfEmpty();

      // Get Mock Tests
      const testsSnap = await getDocs(collection(db, "mock_tests"));
      const testsList = testsSnap.docs
        .map((d) => {
          const data = d.data();
          return {
            testId: data.testId || d.id,
            title: data.title || "",
            description: data.description || "",
            duration: data.duration || 0,
            questionCount: data.questionCount !== undefined ? data.questionCount : (data.totalQuestions || 0),
          } as MockTest;
        })
        .filter((test) => test.testId && test.title);
      setTests(testsList);

      // Get Mock Attempts
      const attemptsQuery = query(
        collection(db, "mock_attempts"),
        where("uid", "==", profile.uid)
      );
      const attemptsSnap = await getDocs(attemptsQuery);
      const attemptsList = attemptsSnap.docs
        .map((d) => ({
          id: d.id,
          ...d.data(),
        } as any))
        .sort((a, b) => {
          const timeA = a.createdAt?.seconds || 0;
          const timeB = b.createdAt?.seconds || 0;
          return timeB - timeA;
        }) as MockAttempt[];
      setAttempts(attemptsList);
    } catch (error) {
      console.error("Error loading mock test hub:", error);
      toast.error("Failed to load mock tests.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHubData();
  }, [profile]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-44 rounded-3xl" />
          <Skeleton className="h-44 rounded-3xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Adaptive Mock Preparation
        </h2>
        <p className="text-sm text-slate-500 font-medium mt-1">
          Take practice mock tests. Attempts are unlimited and evaluations are processed instantly.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {tests.map((test) => {
          // Find if there are previous attempts for this test
          const testAttempts = attempts.filter((att) => att.testId === test.testId);
          const highestScore = testAttempts.length > 0 
            ? Math.max(...testAttempts.map((a) => a.score)) 
            : null;

          return (
            <Card key={test.testId} className="border border-slate-100 hover:border-primary-teal/30 transition-all duration-200 flex flex-col justify-between">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <span className="p-2.5 bg-primary-teal/5 text-primary-teal rounded-xl">
                    <BookOpen className="h-5 w-5" />
                  </span>
                  {highestScore !== null && (
                    <Badge variant="success" className="gap-1">
                      <Award className="h-3 w-3" />
                      Best: {highestScore}/{test.questionCount * 2}
                    </Badge>
                  )}
                </div>
                <CardTitle className="text-lg text-slate-900 font-bold mt-4">
                  {test.title}
                </CardTitle>
                <CardDescription className="line-clamp-2 mt-2 leading-relaxed text-sm">
                  {test.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0 pb-4 text-xs font-semibold text-slate-500 flex gap-4">
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4 text-slate-400" />
                  {test.duration} Mins
                </span>
                <span className="flex items-center gap-1">
                  <HelpCircle className="h-4 w-4 text-slate-400" />
                  {test.questionCount} MCQs
                </span>
              </CardContent>
              <CardFooter className="flex justify-between items-center border-t border-slate-50 bg-slate-50/20">
                <span className="text-xs text-slate-400">
                  {testAttempts.length} Previous {testAttempts.length === 1 ? "attempt" : "attempts"}
                </span>
                <Link href={`/mock-test/${test.testId}`}>
                  <Button size="sm" className="rounded-xl font-bold gap-1 shadow-sm">
                    Start Prep
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      {/* Attempts log */}
      {attempts.length > 0 && (
        <Card className="border border-slate-100 shadow-lg shadow-slate-100/10">
          <CardHeader>
            <CardTitle className="text-slate-900 text-base font-extrabold flex items-center gap-2">
              <BarChart2 className="h-4 w-4 text-primary-teal" />
              Mock Performance History
            </CardTitle>
            <CardDescription>
              Review your scoring parameters across all attempts.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-bold">
                  <tr>
                    <th className="px-6 py-4">Mock Test</th>
                    <th className="px-6 py-4">Correct Answers</th>
                    <th className="px-6 py-4">Score</th>
                    <th className="px-6 py-4">Attempt Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                  {attempts.map((att) => (
                    <tr key={att.id}>
                      <td className="px-6 py-4 font-bold text-slate-900">{att.testTitle}</td>
                      <td className="px-6 py-4">
                        {att.correctAnswers} / {att.totalQuestions}
                      </td>
                      <td className="px-6 py-4 font-bold text-primary-teal">
                        {att.score} / {att.totalQuestions * 2}
                      </td>
                      <td className="px-6 py-4 text-slate-400 text-xs">
                        {att.createdAt
                          ? new Date(att.createdAt.seconds * 1000).toLocaleString()
                          : "Just now"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
