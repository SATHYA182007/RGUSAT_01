"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useAuthStore } from "@/store/useAuthStore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { GraduationCap, Award, Printer, AlertCircle, FileText, CheckCircle2, ChevronRight } from "lucide-react";
import { toast } from "sonner";

interface ResultDoc {
  resultId: string;
  uid: string;
  email: string;
  name: string;
  examTitle: string;
  score: number;
  rank: number;
  qualificationStatus: "Qualified" | "Not Qualified" | "Pending";
  summary: string;
  publishedAt: any;
}

export default function StudentResultsPage() {
  const { profile } = useAuthStore();
  const [result, setResult] = useState<ResultDoc | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;

    const fetchResult = async () => {
      try {
        const q = query(collection(db, "results"), where("uid", "==", profile.uid));
        const snap = await getDocs(q);
        if (!snap.empty) {
          const docData = snap.docs[0].data() as ResultDoc;
          setResult(docData);
        }
      } catch (error) {
        console.error("Error loading results:", error);
        toast.error("Failed to load result scorecard.");
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
  }, [profile]);

  const handlePrint = () => {
    window.print();
  };

  if (loading || !profile) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-96 rounded-3xl" />
      </div>
    );
  }

  const isPublished = result && result.qualificationStatus !== "Pending";

  return (
    <div className="space-y-8">
      {/* Non-Printable Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 print:hidden">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Entrance Results & Ranks
          </h2>
          <p className="text-sm text-slate-500 font-medium mt-1">
            Access and print your official Rathinam Global Aptitude Test scorecard.
          </p>
        </div>
        {isPublished && (
          <Button onClick={handlePrint} className="rounded-xl font-bold gap-1.5 shadow-sm">
            <Printer className="h-4 w-4" />
            Print / Download Scorecard
          </Button>
        )}
      </div>

      {/* Printable Scorecard Container */}
      <div className="mx-auto max-w-3xl">
        {result && isPublished ? (
          /* CASE: Result is published */
          <Card className="border border-slate-100 shadow-xl overflow-hidden bg-white print:border-0 print:shadow-none">
            {/* Certificate Style Header */}
            <div className="p-8 text-center bg-gradient-to-tr from-primary-teal/5 to-primary-sky/5 border-b border-slate-100 flex flex-col items-center gap-4 print:bg-none">
              <div className="p-3 bg-gradient-to-tr from-primary-teal to-primary-sky rounded-2xl text-white shadow-md">
                <GraduationCap className="h-10 w-10" />
              </div>
              <div>
                <h1 className="text-xl font-extrabold tracking-tight text-slate-900 uppercase">
                  Rathinam Global University
                </h1>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                  Scholastic Aptitude Test (RGUSAT) 2026 Scorecard
                </p>
              </div>
            </div>

            <CardContent className="p-8 space-y-8">
              {/* Candidate Metadata */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border border-slate-100 p-6 rounded-2xl bg-slate-50/20 text-sm">
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Candidate Name</span>
                  <span className="font-bold text-slate-800">{result.name}</span>
                </div>
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Application ID</span>
                  <span className="font-bold text-slate-800 font-mono">{profile.applicationId}</span>
                </div>
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Email Address</span>
                  <span className="font-bold text-slate-800">{result.email}</span>
                </div>
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Assessment Portal</span>
                  <span className="font-bold text-slate-800">{result.examTitle}</span>
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
                <div className="p-6 bg-slate-50/50 rounded-2xl border border-slate-100 flex flex-col justify-between h-full">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Aptitude Score</span>
                  <span className="text-3xl font-extrabold text-slate-950 mt-2 block">
                    {result.score} <span className="text-xs font-semibold text-slate-400">/ 10</span>
                  </span>
                </div>

                <div className="p-6 bg-slate-50/50 rounded-2xl border border-slate-100 flex flex-col justify-between h-full">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Merit Rank</span>
                  <span className="text-3xl font-extrabold text-slate-950 mt-2 block">
                    #{result.rank || 1}
                  </span>
                </div>

                <div className="p-6 bg-slate-50/50 rounded-2xl border border-slate-100 flex flex-col justify-between h-full">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Admissions Status</span>
                  <div className="mt-2 block">
                    <Badge variant={result.qualificationStatus === "Qualified" ? "success" : "danger"} className="text-sm px-3.5 py-0.5 rounded-lg">
                      {result.qualificationStatus}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Summary Description */}
              <div className="p-5 border border-slate-100 bg-slate-50/20 rounded-2xl text-xs text-slate-600 leading-relaxed">
                <strong className="text-slate-800 block mb-1">Admissions Registrar Summary:</strong>
                {result.summary || "Congratulations! You have qualified the entrance examination. Please present this scorecard during document verification."}
              </div>
            </CardContent>

            <CardFooter className="p-8 border-t border-slate-50 flex items-center justify-between text-[10px] text-slate-400 font-semibold bg-slate-50/30 print:hidden">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                Verified Registrar Document
              </span>
              <span>Generated on: {new Date().toLocaleDateString()}</span>
            </CardFooter>
          </Card>
        ) : (
          /* CASE: Pending or no exam attempt taken */
          <Card className="border border-slate-200 shadow-xl overflow-hidden bg-white">
            <div className="p-8 text-center bg-slate-50 border-b border-slate-100 space-y-4">
              <div className="p-4 bg-slate-100 text-slate-400 rounded-full w-fit mx-auto">
                <Award className="h-12 w-12" />
              </div>
              <CardTitle className="text-xl text-slate-900 font-extrabold">Results Pending Compilation</CardTitle>
              <CardDescription>
                Your entrance test results are not published yet.
              </CardDescription>
            </div>
            <CardContent className="p-8 text-center text-sm text-slate-500 space-y-4">
              {!profile.examCompleted && !result ? (
                <p>You have not attempted the entrance examination yet. Please complete the main exam first.</p>
              ) : (
                <p>
                  Your exam answers have been uploaded and are currently undergoing registrar review. 
                  Rankings and merit cutoff sheets are published in batches. Please check back later.
                </p>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
