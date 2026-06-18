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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { FileText, Search, Eye, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";

interface Application {
  id: string;
  applicationId: string;
  uid: string;
  name: string;
  email: string;
  phone: string;
  gender: string;
  dob: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  courseApplied: string;
  schoolName: string;
  board: string;
  percentage: number;
  status: string;
  createdAt?: any;
}

export default function AdminApplicationsPage() {
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);

  const fetchApplications = async () => {
    try {
      const snap = await getDocs(collection(db, "applications"));
      const list = snap.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          name: data.personalInfo?.name || data.name || "Unknown Applicant",
          email: data.personalInfo?.email || data.email || "—",
          phone: data.personalInfo?.phone || data.phone || "—",
          gender: data.personalInfo?.gender || data.gender || "—",
          dob: data.personalInfo?.dob || data.dob || "—",
          schoolName: data.academicInfo?.schoolName || data.schoolName || "N/A",
          board: data.academicInfo?.board || data.board || "N/A",
          percentage: data.academicInfo?.percentage ?? data.percentage ?? null,
          status: data.paymentStatus === "paid" && data.status === "submitted" ? "paid" : (data.status || "submitted"),
        };
      }) as Application[];
      setApps(list);
    } catch (e: any) {
      toast.error("Failed to load applications: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleUpdateStatus = async (appId: string, newStatus: string) => {
    try {
      const appRef = doc(db, "applications", appId);
      await updateDoc(appRef, { status: newStatus });
      const adminUid = auth.currentUser?.uid || "admin";
      const adminEmail = auth.currentUser?.email || "admin@rgusat.com";
      await logActivity(adminUid, adminEmail, "update_application_status", `Updated application status to ${newStatus} for app ${appId}`);
      toast.success(`Application marked as ${newStatus}`);
      fetchApplications();
      if (selectedApp && selectedApp.id === appId) {
        setSelectedApp({ ...selectedApp, status: newStatus });
      }
    } catch (e: any) {
      toast.error("Status update failed: " + e.message);
    }
  };

  const filteredApps = apps.filter(app => {
    const matchesSearch = 
      (app.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (app.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (app.applicationId || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Admissions Dashboard</h2>
        <p className="text-xs text-slate-500 font-medium mt-0.5">Manage and review student application files.</p>
      </div>

      <Card className="border border-slate-100 bg-white">
        <CardHeader className="pb-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle className="text-slate-900 font-bold text-sm flex items-center gap-2">
              <FileText className="h-4.5 w-4.5 text-rose-500" />
              Admissions Directory ({filteredApps.length})
            </CardTitle>
            
            {/* Search & Filters */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search by name, email, or dossier ID..."
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
                <option value="all">All Statuses</option>
                <option value="submitted">Submitted</option>
                <option value="paid">Paid</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
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
          ) : filteredApps.length === 0 ? (
            <div className="p-8 text-center text-slate-450 text-xs">
              No application dossiers match search query.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-[10px] uppercase font-extrabold text-slate-500 py-3 pl-6">ID</TableHead>
                  <TableHead className="text-[10px] uppercase font-extrabold text-slate-500 py-3">Applicant</TableHead>
                  <TableHead className="text-[10px] uppercase font-extrabold text-slate-500 py-3">Course</TableHead>
                  <TableHead className="text-[10px] uppercase font-extrabold text-slate-500 py-3">Grade Percentage</TableHead>
                  <TableHead className="text-[10px] uppercase font-extrabold text-slate-500 py-3">Status</TableHead>
                  <TableHead className="text-[10px] uppercase font-extrabold text-slate-500 py-3 text-right pr-6">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredApps.map((app) => (
                  <TableRow key={app.id}>
                    <TableCell className="py-3.5 font-bold font-mono text-slate-900 text-xs pl-6">
                      {app.applicationId || "N/A"}
                    </TableCell>
                    <TableCell className="py-3.5">
                      <div className="font-bold text-slate-900 text-xs">{app.name}</div>
                      <div className="text-[10px] text-slate-400 font-semibold">{app.email}</div>
                    </TableCell>
                    <TableCell className="py-3.5 text-xs text-slate-700 font-semibold">
                      {app.courseApplied || "Unspecified"}
                    </TableCell>
                    <TableCell className="py-3.5 text-xs text-slate-700 font-semibold">
                      {app.percentage ? `${app.percentage}%` : "N/A"}
                    </TableCell>
                    <TableCell className="py-3.5">
                      <Badge className={`rounded-full text-[10px] font-extrabold uppercase px-2 py-0.5 border-transparent ${
                        app.status === "approved" ? "bg-emerald-500/10 text-emerald-600" :
                        app.status === "rejected" ? "bg-rose-500/10 text-rose-600" :
                        app.status === "paid" ? "bg-sky-500/10 text-sky-600" :
                        "bg-amber-500/10 text-amber-600"
                      }`}>
                        {app.status || "Submitted"}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-3.5 text-right pr-6">
                      <div className="flex justify-end gap-2">
                        <Button 
                          onClick={() => setSelectedApp(app)} 
                          size="sm" 
                          variant="outline" 
                          className="h-8 text-[10px] font-bold uppercase tracking-wider rounded-lg border-slate-200 cursor-pointer"
                        >
                          <Eye className="h-3.5 w-3.5 mr-1" /> View dossier
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

      {/* Review Dossier Modal */}
      {selectedApp && (
        <Dialog open={!!selectedApp} onOpenChange={(open) => !open && setSelectedApp(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-slate-900 font-black text-lg flex items-center gap-2">
                <FileText className="h-5 w-5 text-rose-500" />
                Dossier ID: {selectedApp.applicationId || "N/A"}
              </DialogTitle>
              <DialogDescription className="text-xs">
                Review candidate eligibility, score thresholds, and documents.
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4 overflow-y-auto max-h-[60vh] pr-2">
              {/* Personal Details */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b pb-1">Personal Details</h3>
                <div className="grid grid-cols-2 gap-y-2 text-xs">
                  <span className="text-slate-500 font-medium">Full Name:</span>
                  <span className="text-slate-950 font-bold">{selectedApp.name}</span>
                  <span className="text-slate-500 font-medium">Email:</span>
                  <span className="text-slate-950 font-bold">{selectedApp.email}</span>
                  <span className="text-slate-500 font-medium">Phone:</span>
                  <span className="text-slate-950 font-bold font-mono">{selectedApp.phone}</span>
                  <span className="text-slate-500 font-medium">Gender / DOB:</span>
                  <span className="text-slate-950 font-bold">{selectedApp.gender || "N/A"} / {selectedApp.dob || "N/A"}</span>
                </div>
              </div>

              {/* Course Selection & Marks */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b pb-1">Academics</h3>
                <div className="grid grid-cols-2 gap-y-2 text-xs">
                  <span className="text-slate-500 font-medium">Course Selected:</span>
                  <span className="text-slate-950 font-bold">{selectedApp.courseApplied || "N/A"}</span>
                  <span className="text-slate-500 font-medium">School / Institution:</span>
                  <span className="text-slate-950 font-bold">{selectedApp.schoolName || "N/A"}</span>
                  <span className="text-slate-500 font-medium">Secondary Board:</span>
                  <span className="text-slate-950 font-bold">{selectedApp.board || "N/A"}</span>
                  <span className="text-slate-500 font-medium">Result Percentage:</span>
                  <span className="text-slate-950 font-bold font-mono">{selectedApp.percentage ? `${selectedApp.percentage}%` : "N/A"}</span>
                </div>
              </div>

              {/* Address details */}
              <div className="space-y-4 md:col-span-2">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b pb-1">Residential Details</h3>
                <div className="grid grid-cols-4 gap-y-2 text-xs">
                  <span className="text-slate-500 font-medium">Address:</span>
                  <span className="text-slate-950 font-bold col-span-3">{selectedApp.address || "N/A"}</span>
                  <span className="text-slate-500 font-medium">City / State:</span>
                  <span className="text-slate-950 font-bold col-span-3">{selectedApp.city || "N/A"} / {selectedApp.state || "N/A"}</span>
                  <span className="text-slate-500 font-medium">Pincode:</span>
                  <span className="text-slate-950 font-bold col-span-3 font-mono">{selectedApp.pincode || "N/A"}</span>
                </div>
              </div>
            </div>

            <DialogFooter className="flex flex-col sm:flex-row justify-between items-center border-t border-slate-100 pt-4 gap-3">
              <div className="flex gap-2">
                <Button 
                  onClick={() => handleUpdateStatus(selectedApp.id, "approved")}
                  disabled={selectedApp.status === "approved"}
                  className="rounded-xl font-bold px-4 h-9 text-xs bg-emerald-600 hover:bg-emerald-700 text-white border-transparent"
                >
                  <CheckCircle className="h-4 w-4 mr-1.5" /> Approve Dossier
                </Button>
                <Button 
                  onClick={() => handleUpdateStatus(selectedApp.id, "rejected")}
                  disabled={selectedApp.status === "rejected"}
                  className="rounded-xl font-bold px-4 h-9 text-xs bg-rose-600 hover:bg-rose-700 text-white border-transparent"
                >
                  <XCircle className="h-4 w-4 mr-1.5" /> Reject Dossier
                </Button>
              </div>
              <Button onClick={() => setSelectedApp(null)} className="rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold px-6 h-9 text-xs border-transparent">
                Close Review
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
