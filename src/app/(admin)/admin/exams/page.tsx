"use client";

import { useEffect, useState } from "react";
import { db, auth } from "@/lib/firebase";
import {
  collection,
  getDocs,
  doc,
  setDoc,
  updateDoc,
  query,
  where,
  deleteDoc
} from "firebase/firestore";
import { logActivity } from "@/services/activityLogger";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { MonitorPlay, Clock, HelpCircle, Plus, Trash, Edit, Calendar } from "lucide-react";
import { toast } from "sonner";

interface Exam {
  id: string;
  title: string;
  duration: number;
  status: string;
  totalQuestions: number;
  examWindowStart?: any;
  examWindowEnd?: any;
}

interface ExamQuestion {
  questionId: string;
  examId: string;
  questionText: string;
  options: string[];
  correctOptionIndex: number;
  weightage: number;
}

export default function AdminExamsPage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingExam, setEditingExam] = useState<Exam | null>(null);
  const [openEdit, setOpenEdit] = useState(false);
  
  // Question bank state
  const [activeExam, setActiveExam] = useState<Exam | null>(null);
  const [questions, setQuestions] = useState<ExamQuestion[]>([]);
  const [questionsLoading, setQuestionsLoading] = useState(false);
  const [openQuestions, setOpenQuestions] = useState(false);
  
  // New Question Form state
  const [questionText, setQuestionText] = useState("");
  const [optA, setOptA] = useState("");
  const [optB, setOptB] = useState("");
  const [optC, setOptC] = useState("");
  const [optD, setOptD] = useState("");
  const [correctIdx, setCorrectIdx] = useState(0);
  const [appending, setAppending] = useState(false);

  // Edit Exam Form state
  const [duration, setDuration] = useState(120);
  const [status, setStatus] = useState("scheduled");
  const [totalQuestions, setTotalQuestions] = useState(100);
  const [saving, setSaving] = useState(false);

  const fetchExams = async () => {
    try {
      const snap = await getDocs(collection(db, "exams"));
      const list = snap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Exam[];
      setExams(list);
    } catch (e: any) {
      toast.error("Failed to load exams: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  const handleOpenQuestions = async (exam: Exam) => {
    setActiveExam(exam);
    setOpenQuestions(true);
    setQuestionsLoading(true);
    try {
      const q = query(collection(db, "exam_questions"), where("examId", "==", exam.id));
      const snap = await getDocs(q);
      const list = snap.docs.map(doc => ({
        questionId: doc.id,
        ...doc.data()
      })) as ExamQuestion[];
      setQuestions(list);
    } catch (e: any) {
      toast.error("Failed to load exam questions: " + e.message);
    } finally {
      setQuestionsLoading(false);
    }
  };

  const handleAppendQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeExam) return;
    if (!questionText || !optA || !optB || !optC || !optD) {
      toast.error("Please fill in question text and all four options");
      return;
    }

    setAppending(true);
    const generatedId = `q_${Date.now()}`;
    const newQuestion: ExamQuestion = {
      questionId: generatedId,
      examId: activeExam.id,
      questionText,
      options: [optA, optB, optC, optD],
      correctOptionIndex: Number(correctIdx),
      weightage: 1
    };

    try {
      await setDoc(doc(db, "exam_questions", generatedId), newQuestion);
      toast.success("Question appended successfully!");
      // Reset form
      setQuestionText("");
      setOptA("");
      setOptB("");
      setOptC("");
      setOptD("");
      setCorrectIdx(0);
      
      // Refresh list
      const q = query(collection(db, "exam_questions"), where("examId", "==", activeExam.id));
      const snap = await getDocs(q);
      setQuestions(snap.docs.map(d => d.data() as ExamQuestion));
    } catch (e: any) {
      toast.error("Failed to add question: " + e.message);
    } finally {
      setAppending(false);
    }
  };

  const handleDeleteQuestion = async (qId: string) => {
    if (!confirm("Delete this question?")) return;
    try {
      await deleteDoc(doc(db, "exam_questions", qId));
      toast.success("Question deleted");
      if (activeExam) {
        setQuestions(questions.filter(q => q.questionId !== qId));
      }
    } catch (e: any) {
      toast.error("Delete failed: " + e.message);
    }
  };

  const handleOpenEdit = (exam: Exam) => {
    setEditingExam(exam);
    setDuration(exam.duration);
    setStatus(exam.status);
    setTotalQuestions(exam.totalQuestions);
    setOpenEdit(true);
  };

  const handleSaveExam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingExam) return;

    setSaving(true);
    try {
      const examRef = doc(db, "exams", editingExam.id);
      await updateDoc(examRef, {
        duration: Number(duration),
        status,
        totalQuestions: Number(totalQuestions)
      });
      const adminUid = auth.currentUser?.uid || "admin";
      const adminEmail = auth.currentUser?.email || "admin@rgusat.com";
      await logActivity(adminUid, adminEmail, "update_exam_config", `Updated exam configuration for ${editingExam.id}`);
      toast.success("Exam config updated successfully!");
      setOpenEdit(false);
      fetchExams();
    } catch (e: any) {
      toast.error("Failed to save config: " + e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Exam Operations</h2>
        <p className="text-xs text-slate-500 font-medium mt-0.5">Configure entrance exams, monitor status, and manage templates.</p>
      </div>

      <Card className="border border-slate-100 bg-white">
        <CardHeader>
          <CardTitle className="text-slate-900 font-bold text-sm flex items-center gap-2">
            <MonitorPlay className="h-4.5 w-4.5 text-rose-500" />
            Scheduled Exams Control ({exams.length})
          </CardTitle>
          <CardDescription className="text-xs">Adjust configurations, set timers, and edit question papers.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 space-y-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : exams.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              No exams scheduled in collection.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-[10px] uppercase font-extrabold text-slate-500 py-3 pl-6">Exam Title</TableHead>
                  <TableHead className="text-[10px] uppercase font-extrabold text-slate-500 py-3">Duration</TableHead>
                  <TableHead className="text-[10px] uppercase font-extrabold text-slate-500 py-3">Total Questions</TableHead>
                  <TableHead className="text-[10px] uppercase font-extrabold text-slate-500 py-3">Status</TableHead>
                  <TableHead className="text-[10px] uppercase font-extrabold text-slate-500 py-3 text-right pr-6">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {exams.map((exam) => (
                  <TableRow key={exam.id}>
                    <TableCell className="py-3.5 pl-6 font-bold text-slate-900 text-xs">
                      {exam.title}
                    </TableCell>
                    <TableCell className="py-3.5 text-xs font-semibold text-slate-700 font-mono">
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-slate-400" />
                        {exam.duration} minutes
                      </div>
                    </TableCell>
                    <TableCell className="py-3.5 text-xs text-slate-700 font-mono font-semibold">
                      {exam.totalQuestions} Questions
                    </TableCell>
                    <TableCell className="py-3.5">
                      <Badge className={`rounded-full text-[10px] font-extrabold uppercase px-2 py-0.5 border-transparent ${
                        exam.status === "live" ? "bg-emerald-500/10 text-emerald-600 animate-pulse" :
                        exam.status === "completed" ? "bg-slate-100 text-slate-650" :
                        "bg-amber-500/10 text-amber-600"
                      }`}>
                        {exam.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-3.5 text-right pr-6">
                      <div className="flex justify-end gap-2">
                        <Button
                          onClick={() => handleOpenQuestions(exam)}
                          size="sm"
                          variant="outline"
                          className="h-8 text-[10px] font-bold uppercase tracking-wider rounded-lg border-slate-200 cursor-pointer"
                        >
                          <HelpCircle className="h-3.5 w-3.5 mr-1" /> Questions
                        </Button>
                        <Button
                          onClick={() => handleOpenEdit(exam)}
                          size="sm"
                          variant="outline"
                          className="h-8 text-[10px] font-bold uppercase tracking-wider rounded-lg border-slate-200 cursor-pointer"
                        >
                          <Edit className="h-3.5 w-3.5 mr-1" /> Edit Config
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit Config Modal */}
      {openEdit && editingExam && (
        <Dialog open={openEdit} onOpenChange={(open) => !open && setOpenEdit(false)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-slate-900 font-black text-lg flex items-center gap-2">
                <Edit className="h-5 w-5 text-rose-500" />
                Configure Exam Parameters
              </DialogTitle>
              <DialogDescription className="text-xs">
                Edit active duration, total questions parameter, and scheduler state.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSaveExam} className="space-y-4 py-2">
              <div className="space-y-1.5">
                <Label htmlFor="edur">Duration (minutes)</Label>
                <Input
                  id="edur"
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="eqs">Questions Parameter</Label>
                <Input
                  id="eqs"
                  type="number"
                  value={totalQuestions}
                  onChange={(e) => setTotalQuestions(Number(e.target.value))}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="estatus">Scheduler State</Label>
                <select
                  id="estatus"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="flex h-10 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 focus:outline-none"
                >
                  <option value="scheduled">Scheduled</option>
                  <option value="live">Live</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <DialogFooter className="pt-3 border-t border-slate-100 mt-4">
                <Button 
                  onClick={() => setOpenEdit(false)} 
                  variant="outline" 
                  type="button" 
                  className="rounded-xl border-slate-200 h-9 text-xs px-4"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  isLoading={saving} 
                  className="rounded-xl font-bold bg-slate-900 hover:bg-slate-800 text-white h-9 text-xs px-6 border-transparent"
                >
                  Save Config
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* Questions Modal */}
      {openQuestions && activeExam && (
        <Dialog open={openQuestions} onOpenChange={(open) => !open && setOpenQuestions(false)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-slate-900 font-black text-lg flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-rose-500" />
                Question Bank: {activeExam.title}
              </DialogTitle>
              <DialogDescription className="text-xs">
                Manage questions and correct option configurations.
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4 overflow-y-auto max-h-[60vh] pr-2">
              {/* Question list */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b pb-1">Current Questions ({questions.length})</h3>
                {questionsLoading ? (
                  <div className="py-6 text-center text-slate-400 text-xs">
                    Loading questions...
                  </div>
                ) : questions.length === 0 ? (
                  <div className="py-6 text-center text-slate-400 text-xs">
                    No questions mapped yet. Append one on the right.
                  </div>
                ) : (
                  <div className="space-y-3.5">
                    {questions.map((q, idx) => (
                      <div key={q.questionId || idx} className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-2">
                        <div className="flex justify-between items-start gap-2">
                          <span className="font-extrabold text-[10px] text-rose-500 uppercase">Q{idx + 1}</span>
                          <button
                            onClick={() => handleDeleteQuestion(q.questionId)}
                            className="text-slate-400 hover:text-rose-500 cursor-pointer"
                          >
                            <Trash className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <p className="text-xs font-bold text-slate-900 leading-normal">{q.questionText}</p>
                        <div className="grid grid-cols-2 gap-1.5 text-[10px] text-slate-500 font-semibold pt-1">
                          {q.options.map((opt, oIdx) => (
                            <span key={oIdx} className={oIdx === q.correctOptionIndex ? "text-emerald-600 font-bold" : ""}>
                              {String.fromCharCode(65 + oIdx)}. {opt}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Append form */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b pb-1">Append Question</h3>
                <form onSubmit={handleAppendQuestion} className="space-y-3">
                  <div className="space-y-1">
                    <Label htmlFor="qtext">Question Text</Label>
                    <textarea
                      id="qtext"
                      value={questionText}
                      onChange={(e) => setQuestionText(e.target.value)}
                      required
                      className="flex min-h-[60px] w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label htmlFor="optA">Option A</Label>
                      <Input
                        id="optA"
                        value={optA}
                        onChange={(e) => setOptA(e.target.value)}
                        required
                        className="h-8 text-xs px-2.5 rounded-lg"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="optB">Option B</Label>
                      <Input
                        id="optB"
                        value={optB}
                        onChange={(e) => setOptB(e.target.value)}
                        required
                        className="h-8 text-xs px-2.5 rounded-lg"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="optC">Option C</Label>
                      <Input
                        id="optC"
                        value={optC}
                        onChange={(e) => setOptC(e.target.value)}
                        required
                        className="h-8 text-xs px-2.5 rounded-lg"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="optD">Option D</Label>
                      <Input
                        id="optD"
                        value={optD}
                        onChange={(e) => setOptD(e.target.value)}
                        required
                        className="h-8 text-xs px-2.5 rounded-lg"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="correctIdx">Correct Option</Label>
                    <select
                      id="correctIdx"
                      value={correctIdx}
                      onChange={(e) => setCorrectIdx(Number(e.target.value))}
                      className="flex h-8 w-full rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-slate-900 focus:outline-none"
                    >
                      <option value={0}>Option A</option>
                      <option value={1}>Option B</option>
                      <option value={2}>Option C</option>
                      <option value={3}>Option D</option>
                    </select>
                  </div>
                  <Button type="submit" size="sm" className="w-full rounded-xl font-bold h-9 bg-rose-500 text-white hover:bg-rose-600 border-transparent cursor-pointer">
                    Append Question
                  </Button>
                </form>
              </div>
            </div>
            <DialogFooter className="border-t border-slate-100 pt-3">
              <Button onClick={() => setOpenQuestions(false)} className="rounded-xl bg-slate-900 hover:bg-slate-800 text-white px-6 h-9 text-xs border-transparent cursor-pointer">
                Done
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
