"use client";

import { useEffect, useState } from "react";
import { db, auth } from "@/lib/firebase";
import {
  collection,
  getDocs,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where
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
import { BookOpen, Clock, HelpCircle, Plus, Trash, Edit, Settings } from "lucide-react";
import { toast } from "sonner";

interface MockTest {
  id: string;
  testId: string;
  title: string;
  description: string;
  questionCount: number;
  duration: number;
  published: boolean;
}

interface MockQuestion {
  questionId: string;
  testId: string;
  questionText: string;
  options: string[];
  correctOptionIndex: number;
}

export default function AdminMockTestsPage() {
  const [tests, setTests] = useState<MockTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTest, setActiveTest] = useState<MockTest | null>(null);
  const [questions, setQuestions] = useState<MockQuestion[]>([]);
  const [questionsLoading, setQuestionsLoading] = useState(false);
  const [openQuestions, setOpenQuestions] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [editingTest, setEditingTest] = useState<MockTest | null>(null);

  // New Question Form state
  const [questionText, setQuestionText] = useState("");
  const [optA, setOptA] = useState("");
  const [optB, setOptB] = useState("");
  const [optC, setOptC] = useState("");
  const [optD, setOptD] = useState("");
  const [correctIdx, setCorrectIdx] = useState(0);
  const [appending, setAppending] = useState(false);

  // Edit Form state
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [duration, setDuration] = useState(15);
  const [published, setPublished] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchMockTests = async () => {
    try {
      const snap = await getDocs(collection(db, "mock_tests"));
      const list = snap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as MockTest[];
      setTests(list);
    } catch (e: any) {
      toast.error("Failed to load mock tests: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMockTests();
  }, []);

  const handleOpenQuestions = async (test: MockTest) => {
    setActiveTest(test);
    setOpenQuestions(true);
    setQuestionsLoading(true);
    try {
      const q = query(collection(db, "mock_questions"), where("testId", "==", test.testId));
      const snap = await getDocs(q);
      const list = snap.docs.map(doc => ({
        questionId: doc.id,
        ...doc.data()
      })) as MockQuestion[];
      setQuestions(list);
    } catch (e: any) {
      toast.error("Failed to load questions: " + e.message);
    } finally {
      setQuestionsLoading(false);
    }
  };

  const handleAppendQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTest) return;
    if (!questionText || !optA || !optB || !optC || !optD) {
      toast.error("Please fill in question text and options");
      return;
    }

    setAppending(true);
    const generatedId = `mq_${Date.now()}`;
    const newQuestion: MockQuestion = {
      questionId: generatedId,
      testId: activeTest.testId,
      questionText,
      options: [optA, optB, optC, optD],
      correctOptionIndex: Number(correctIdx)
    };

    try {
      await setDoc(doc(db, "mock_questions", generatedId), newQuestion);
      toast.success("Question appended successfully!");
      setQuestionText("");
      setOptA("");
      setOptB("");
      setOptC("");
      setOptD("");
      setCorrectIdx(0);
      
      // Update count in mock test doc
      const testRef = doc(db, "mock_tests", activeTest.id);
      const newCount = questions.length + 1;
      await updateDoc(testRef, { questionCount: newCount });
      
      // Refresh questions list
      const q = query(collection(db, "mock_questions"), where("testId", "==", activeTest.testId));
      const snap = await getDocs(q);
      setQuestions(snap.docs.map(d => d.data() as MockQuestion));
      fetchMockTests();
    } catch (e: any) {
      toast.error("Failed to append question: " + e.message);
    } finally {
      setAppending(false);
    }
  };

  const handleDeleteQuestion = async (qId: string) => {
    if (!confirm("Delete this question?")) return;
    try {
      await deleteDoc(doc(db, "mock_questions", qId));
      toast.success("Question deleted");
      
      if (activeTest) {
        const newCount = Math.max(0, questions.length - 1);
        const testRef = doc(db, "mock_tests", activeTest.id);
        await updateDoc(testRef, { questionCount: newCount });
        setQuestions(questions.filter(q => q.questionId !== qId));
        fetchMockTests();
      }
    } catch (e: any) {
      toast.error("Delete failed: " + e.message);
    }
  };

  const handleOpenEdit = (test: MockTest) => {
    setEditingTest(test);
    setTitle(test.title);
    setDesc(test.description);
    setDuration(test.duration);
    setPublished(test.published);
    setOpenEdit(true);
  };

  const handleSaveTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTest) return;

    setSaving(true);
    try {
      const testRef = doc(db, "mock_tests", editingTest.id);
      await updateDoc(testRef, {
        title,
        description: desc,
        duration: Number(duration),
        published
      });
      const adminUid = auth.currentUser?.uid || "admin";
      const adminEmail = auth.currentUser?.email || "admin@rgusat.com";
      await logActivity(adminUid, adminEmail, "update_mock_config", `Updated mock test config for ${editingTest.testId}`);
      toast.success("Mock test config saved successfully!");
      setOpenEdit(false);
      fetchMockTests();
    } catch (e: any) {
      toast.error("Failed to save mock config: " + e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Mock Exam Controls</h2>
        <p className="text-xs text-slate-500 font-medium mt-0.5">Manage mock exam configs and practice question databases.</p>
      </div>

      <Card className="border border-slate-100 bg-white">
        <CardHeader>
          <CardTitle className="text-slate-900 font-bold text-sm flex items-center gap-2">
            <BookOpen className="h-4.5 w-4.5 text-rose-500" />
            Configured Mock Tests ({tests.length})
          </CardTitle>
          <CardDescription className="text-xs">Edit duration ceilings, text instructions, and correct keys.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 space-y-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : tests.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              No mock tests configured yet.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-[10px] uppercase font-extrabold text-slate-500 py-3 pl-6">Mock Title</TableHead>
                  <TableHead className="text-[10px] uppercase font-extrabold text-slate-500 py-3">Duration</TableHead>
                  <TableHead className="text-[10px] uppercase font-extrabold text-slate-500 py-3">Questions Count</TableHead>
                  <TableHead className="text-[10px] uppercase font-extrabold text-slate-500 py-3">Status</TableHead>
                  <TableHead className="text-[10px] uppercase font-extrabold text-slate-500 py-3 text-right pr-6">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tests.map((test) => (
                  <TableRow key={test.id}>
                    <TableCell className="py-3.5 pl-6">
                      <div className="font-bold text-slate-900 text-xs">{test.title}</div>
                      <div className="text-[10px] text-slate-400 font-semibold mt-0.5 truncate max-w-[200px]">
                        {test.description}
                      </div>
                    </TableCell>
                    <TableCell className="py-3.5 text-xs font-semibold text-slate-700 font-mono">
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-slate-400" />
                        {test.duration} minutes
                      </div>
                    </TableCell>
                    <TableCell className="py-3.5 text-xs text-slate-700 font-mono font-semibold">
                      {test.questionCount} Questions
                    </TableCell>
                    <TableCell className="py-3.5">
                      <Badge className={`rounded-full text-[10px] font-extrabold uppercase px-2 py-0.5 border-transparent ${
                        test.published ? "bg-emerald-500/10 text-emerald-600" : "bg-slate-100 text-slate-500"
                      }`}>
                        {test.published ? "Published" : "Draft"}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-3.5 text-right pr-6">
                      <div className="flex justify-end gap-2">
                        <Button
                          onClick={() => handleOpenQuestions(test)}
                          size="sm"
                          variant="outline"
                          className="h-8 text-[10px] font-bold uppercase tracking-wider rounded-lg border-slate-200 cursor-pointer"
                        >
                          <HelpCircle className="h-3.5 w-3.5 mr-1" /> Questions
                        </Button>
                        <Button
                          onClick={() => handleOpenEdit(test)}
                          size="sm"
                          variant="outline"
                          className="h-8 text-[10px] font-bold uppercase tracking-wider rounded-lg border-slate-200 cursor-pointer"
                        >
                          <Settings className="h-3.5 w-3.5 mr-1" /> Settings
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

      {/* Settings Modal */}
      {openEdit && editingTest && (
        <Dialog open={openEdit} onOpenChange={(open) => !open && setOpenEdit(false)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-slate-900 font-black text-lg flex items-center gap-2">
                <Edit className="h-5 w-5 text-rose-500" />
                Edit Mock Settings
              </DialogTitle>
              <DialogDescription className="text-xs">
                Edit titles, duration ceilings, and set publication drafts.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSaveTest} className="space-y-4 py-2">
              <div className="space-y-1.5">
                <Label htmlFor="mtitle">Mock Title</Label>
                <Input
                  id="mtitle"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="mdesc">Description Instructions</Label>
                <textarea
                  id="mdesc"
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  required
                  className="flex min-h-[60px] w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="mdur">Duration Ceiling (minutes)</Label>
                <Input
                  id="mdur"
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  required
                />
              </div>

              <div className="flex items-center space-x-2.5 py-1">
                <input
                  id="mpub"
                  type="checkbox"
                  checked={published}
                  onChange={(e) => setPublished(e.target.checked)}
                  className="h-4.5 w-4.5 rounded border-slate-300 text-rose-600 focus:ring-rose-500 cursor-pointer"
                />
                <Label htmlFor="mpub" className="text-xs font-bold text-slate-700 cursor-pointer select-none">
                  Publish test as active mock prep
                </Label>
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
      {openQuestions && activeTest && (
        <Dialog open={openQuestions} onOpenChange={(open) => !open && setOpenQuestions(false)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-slate-900 font-black text-lg flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-rose-500" />
                Mock Database: {activeTest.title}
              </DialogTitle>
              <DialogDescription className="text-xs">
                Manage practice questions and correct option configurations.
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
                    No mock questions mapped. Append one on the right.
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
                    <Label htmlFor="mqtext">Question Text</Label>
                    <textarea
                      id="mqtext"
                      value={questionText}
                      onChange={(e) => setQuestionText(e.target.value)}
                      required
                      className="flex min-h-[60px] w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label htmlFor="moptA">Option A</Label>
                      <Input
                        id="moptA"
                        value={optA}
                        onChange={(e) => setOptA(e.target.value)}
                        required
                        className="h-8 text-xs px-2.5 rounded-lg"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="moptB">Option B</Label>
                      <Input
                        id="moptB"
                        value={optB}
                        onChange={(e) => setOptB(e.target.value)}
                        required
                        className="h-8 text-xs px-2.5 rounded-lg"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="moptC">Option C</Label>
                      <Input
                        id="moptC"
                        value={optC}
                        onChange={(e) => setOptC(e.target.value)}
                        required
                        className="h-8 text-xs px-2.5 rounded-lg"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="moptD">Option D</Label>
                      <Input
                        id="moptD"
                        value={optD}
                        onChange={(e) => setOptD(e.target.value)}
                        required
                        className="h-8 text-xs px-2.5 rounded-lg"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="mcorrectIdx">Correct Option</Label>
                    <select
                      id="mcorrectIdx"
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
