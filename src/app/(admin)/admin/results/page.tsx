"use client";

import { useEffect, useState } from "react";
import { db, auth } from "@/lib/firebase";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { logActivity } from "@/services/activityLogger";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Award, Search, Edit, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";

interface CandidateResult {
  id: string;
  uid: string;
  applicationId: string;
  examId: string;
  score: number;
  rank: number;
  qualified: boolean;
  publishedAt?: any;
}

export default function AdminResultsPage() {
  const [results, setResults] = useState<CandidateResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeResult, setActiveResult] = useState<CandidateResult | null>(null);
  const [openEdit, setOpenEdit] = useState(false);
  
  // Score form state
  const [newScore, setNewScore] = useState(0);
  const [isQualified, setIsQualified] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchResults = async () => {
    try {
      const snap = await getDocs(collection(db, "results"));
      const list = snap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as CandidateResult[];
      // Sort by score desc, then rank
      list.sort((a, b) => b.score - a.score);
      setResults(list);
    } catch (e: any) {
      toast.error("Failed to load results: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, []);

  const handleOpenEdit = (res: CandidateResult) => {
    setActiveResult(res);
    setNewScore(res.score);
    setIsQualified(res.qualified);
    setOpenEdit(true);
  };

  const handleSaveScore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeResult) return;

    setSaving(true);
    try {
      const resRef = doc(db, "results", activeResult.id);
      await updateDoc(resRef, {
        score: Number(newScore),
        qualified: isQualified
      });
      const adminUid = auth.currentUser?.uid || "admin";
      const adminEmail = auth.currentUser?.email || "admin@rgusat.com";
      await logActivity(
        adminUid,
        adminEmail,
        "edit_candidate_score",
        `Updated score for result doc ${activeResult.id} to ${newScore} (Qualified: ${isQualified})`
      );
      toast.success("Score updated successfully!");
      setOpenEdit(false);
      fetchResults();
    } catch (e: any) {
      toast.error("Failed to update score: " + e.message);
    } finally {
      setSaving(false);
    }
  };

  const filteredResults = results.filter(res => {
    return (
      (res.applicationId || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (res.uid || "").toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Merit Leaderboard</h2>
        <p className="text-xs text-slate-500 font-medium mt-0.5">Audit scores, standings, and qualified candidates.</p>
      </div>

      <Card className="border border-slate-100 bg-white">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle className="text-slate-900 font-bold text-sm flex items-center gap-2">
              <Award className="h-4.5 w-4.5 text-rose-500" />
              Published Scorecards ({filteredResults.length})
            </CardTitle>
            
            {/* Search filter */}
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search by ID or UID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-9 text-xs rounded-xl bg-slate-50/50"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 space-y-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : filteredResults.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              No results published yet.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-[10px] uppercase font-extrabold text-slate-500 py-3 pl-6">Rank</TableHead>
                  <TableHead className="text-[10px] uppercase font-extrabold text-slate-500 py-3">Application ID</TableHead>
                  <TableHead className="text-[10px] uppercase font-extrabold text-slate-500 py-3">Candidate UID</TableHead>
                  <TableHead className="text-[10px] uppercase font-extrabold text-slate-500 py-3">Exam Score</TableHead>
                  <TableHead className="text-[10px] uppercase font-extrabold text-slate-500 py-3">Qualification</TableHead>
                  <TableHead className="text-[10px] uppercase font-extrabold text-slate-500 py-3 text-right pr-6">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredResults.map((res, index) => (
                  <TableRow key={res.id}>
                    <TableCell className="py-3.5 pl-6 font-mono text-xs font-bold text-slate-900">
                      #{res.rank || index + 1}
                    </TableCell>
                    <TableCell className="py-3.5 font-mono text-xs text-slate-700 font-bold">
                      {res.applicationId || "N/A"}
                    </TableCell>
                    <TableCell className="py-3.5 font-mono text-[11px] text-slate-400 truncate max-w-[120px]">
                      {res.uid}
                    </TableCell>
                    <TableCell className="py-3.5 text-xs font-black text-slate-950 font-mono">
                      {res.score} Marks
                    </TableCell>
                    <TableCell className="py-3.5">
                      <Badge className={`rounded-full text-[10px] font-extrabold uppercase px-2 py-0.5 border-transparent ${
                        res.qualified ? "bg-emerald-500/10 text-emerald-600" : "bg-rose-500/10 text-rose-600"
                      }`}>
                        {res.qualified ? "Qualified" : "Disqualified"}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-3.5 text-right pr-6">
                      <Button
                        onClick={() => handleOpenEdit(res)}
                        size="sm"
                        variant="outline"
                        className="h-8 text-[10px] font-bold uppercase tracking-wider rounded-lg border-slate-200 cursor-pointer"
                      >
                        <Edit className="h-3.5 w-3.5 mr-1" /> Adjust Score
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Adjust Score Modal */}
      {openEdit && activeResult && (
        <Dialog open={openEdit} onOpenChange={(open) => !open && setOpenEdit(false)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-slate-900 font-black text-lg flex items-center gap-2">
                <Edit className="h-5 w-5 text-rose-500" />
                Adjust Score Standings
              </DialogTitle>
              <DialogDescription className="text-xs">
                Manually audit or correct the candidate's scores and standings.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSaveScore} className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div>
                  <span className="block text-[10px] text-slate-400 uppercase tracking-wider">Candidate UID</span>
                  <span className="font-mono text-slate-900 truncate block max-w-[120px]">{activeResult.uid}</span>
                </div>
                <div>
                  <span className="block text-[10px] text-slate-400 uppercase tracking-wider">Application ID</span>
                  <span className="font-mono text-slate-900 block">{activeResult.applicationId || "N/A"}</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="ascore">Total Score Marks</Label>
                <Input
                  id="ascore"
                  type="number"
                  value={newScore}
                  onChange={(e) => setNewScore(Number(e.target.value))}
                  required
                />
              </div>

              <div className="flex items-center space-x-2.5 py-1">
                <input
                  id="aqual"
                  type="checkbox"
                  checked={isQualified}
                  onChange={(e) => setIsQualified(e.target.checked)}
                  className="h-4.5 w-4.5 rounded border-slate-300 text-rose-600 focus:ring-rose-500 cursor-pointer"
                />
                <Label htmlFor="aqual" className="text-xs font-bold text-slate-700 cursor-pointer select-none">
                  Candidate meets qualification score thresholds
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
                  Update Standing
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
