"use client";

import { useEffect, useState } from "react";
import { db, auth } from "@/lib/firebase";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { logActivity } from "@/services/activityLogger";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Search, ShieldAlert, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

interface StudentUser {
  id: string;
  uid: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  accountStatus: string;
  slotBooked: boolean;
  paymentCompleted: boolean;
  applicationId?: string;
}

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<StudentUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [togglingUid, setTogglingUid] = useState<string | null>(null);

  const fetchStudents = async () => {
    try {
      const snap = await getDocs(collection(db, "users"));
      const list = snap.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        } as any))
        .filter(user => user.role === "student") as StudentUser[];
      setStudents(list);
    } catch (e: any) {
      toast.error("Failed to load students directory: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleToggleStatus = async (userDocId: string, currentStatus: string) => {
    setTogglingUid(userDocId);
    const newStatus = currentStatus === "active" ? "suspended" : "active";
    try {
      const userRef = doc(db, "users", userDocId);
      await updateDoc(userRef, { accountStatus: newStatus });
      const adminUid = auth.currentUser?.uid || "admin";
      const adminEmail = auth.currentUser?.email || "admin@rgusat.com";
      await logActivity(
        adminUid,
        adminEmail,
        "toggle_user_status",
        `Changed account status of user ${userDocId} to ${newStatus}`
      );
      toast.success(`Account marked as ${newStatus}`);
      fetchStudents();
    } catch (e: any) {
      toast.error("Status update failed: " + e.message);
    } finally {
      setTogglingUid(null);
    }
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = 
      (student.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (student.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (student.phone || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (student.applicationId || "").toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesStatus = true;
    if (statusFilter === "active") matchesStatus = student.accountStatus === "active";
    if (statusFilter === "suspended") matchesStatus = student.accountStatus === "suspended";
    if (statusFilter === "unpaid") matchesStatus = !student.paymentCompleted;
    if (statusFilter === "booked") matchesStatus = student.slotBooked;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Candidate Registry</h2>
        <p className="text-xs text-slate-500 font-medium mt-0.5">Manage and review student registrations.</p>
      </div>

      <Card className="border border-slate-100 bg-white">
        <CardHeader className="pb-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle className="text-slate-900 font-bold text-sm flex items-center gap-2">
              <Users className="h-4.5 w-4.5 text-rose-500" />
              Student Accounts Directory ({filteredStudents.length})
            </CardTitle>
            
            {/* Search & Filters */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search by name, email, phone, or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 h-9 text-xs rounded-xl bg-slate-50/50"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="flex h-9 rounded-xl border border-slate-200 bg-white px-3 py-1 text-xs text-slate-700 focus:outline-none"
              >
                <option value="all">All Filters</option>
                <option value="active">Active Only</option>
                <option value="suspended">Suspended Only</option>
                <option value="booked">Slot Booked</option>
                <option value="unpaid">Unpaid Fee</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 space-y-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              No student records match filters.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-[10px] uppercase font-extrabold text-slate-500 py-3 pl-6">ID / Name</TableHead>
                  <TableHead className="text-[10px] uppercase font-extrabold text-slate-500 py-3">Credentials</TableHead>
                  <TableHead className="text-[10px] uppercase font-extrabold text-slate-500 py-3">Phone Number</TableHead>
                  <TableHead className="text-[10px] uppercase font-extrabold text-slate-500 py-3">Fee Status</TableHead>
                  <TableHead className="text-[10px] uppercase font-extrabold text-slate-500 py-3">Exam Booking</TableHead>
                  <TableHead className="text-[10px] uppercase font-extrabold text-slate-500 py-3">Account Status</TableHead>
                  <TableHead className="text-[10px] uppercase font-extrabold text-slate-500 py-3 text-right pr-6">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell className="py-3.5 pl-6">
                      <div className="font-bold text-slate-900 text-xs">{student.name}</div>
                      <div className="text-[10px] text-slate-450 font-bold font-mono">
                        {student.applicationId || "Pending File"}
                      </div>
                    </TableCell>
                    <TableCell className="py-3.5 text-xs text-slate-700 font-semibold">
                      {student.email}
                    </TableCell>
                    <TableCell className="py-3.5 text-xs text-slate-700 font-mono font-semibold">
                      {student.phone || "N/A"}
                    </TableCell>
                    <TableCell className="py-3.5">
                      <Badge className={`rounded-full text-[10px] font-extrabold uppercase px-2 py-0.5 border-transparent ${
                        student.paymentCompleted ? "bg-emerald-500/10 text-emerald-600" : "bg-amber-500/10 text-amber-600"
                      }`}>
                        {student.paymentCompleted ? "Paid ₹999" : "Unpaid"}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-3.5">
                      <Badge className={`rounded-full text-[10px] font-extrabold uppercase px-2 py-0.5 border-transparent ${
                        student.slotBooked ? "bg-sky-500/10 text-sky-600" : "bg-slate-100 text-slate-500"
                      }`}>
                        {student.slotBooked ? "Confirmed" : "Not Booked"}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-3.5">
                      {student.accountStatus === "active" ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600">
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-600">
                          Suspended
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="py-3.5 text-right pr-6">
                      <Button
                        onClick={() => handleToggleStatus(student.id, student.accountStatus)}
                        disabled={togglingUid === student.id}
                        size="sm"
                        variant={student.accountStatus === "active" ? "default" : "outline"}
                        className={`h-8 text-[10px] font-bold uppercase tracking-wider rounded-lg cursor-pointer ${
                          student.accountStatus === "active" ? "bg-rose-500 hover:bg-rose-600 text-white border-transparent" : "border-slate-200"
                        }`}
                      >
                        {togglingUid === student.id ? (
                          "Processing..."
                        ) : student.accountStatus === "active" ? (
                          <div className="flex items-center gap-1"><ShieldAlert className="h-3.5 w-3.5" /> Suspend</div>
                        ) : (
                          <div className="flex items-center gap-1"><ShieldCheck className="h-3.5 w-3.5" /> Activate</div>
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
