"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { CreditCard, Search } from "lucide-react";
import { toast } from "sonner";

interface PaymentTransaction {
  id: string;
  paymentId: string;
  applicationId: string;
  email: string;
  amount: number;
  currency: string;
  status: string;
  transactionRef: string;
  createdAt?: string;
}

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<PaymentTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchPayments = async () => {
    try {
      const snap = await getDocs(collection(db, "payments"));
      const list = snap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as PaymentTransaction[];
      // Sort payments by transaction date
      list.sort((a, b) => {
        const da = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dbTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dbTime - da;
      });
      setPayments(list);
    } catch (e: any) {
      toast.error("Failed to load payments: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const filteredPayments = payments.filter(pay => {
    return (
      (pay.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (pay.paymentId || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (pay.transactionRef || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (pay.applicationId || "").toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Financial Audits</h2>
        <p className="text-xs text-slate-500 font-medium mt-0.5">Audit transaction invoices and payment reconciliations.</p>
      </div>

      <Card className="border border-slate-100 bg-white">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle className="text-slate-900 font-bold text-sm flex items-center gap-2">
              <CreditCard className="h-4.5 w-4.5 text-rose-500" />
              Receipt Register ({filteredPayments.length})
            </CardTitle>
            
            {/* Search filter */}
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search by email, payment ID, or transaction..."
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
          ) : filteredPayments.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              No transactions recorded in collection.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-[10px] uppercase font-extrabold text-slate-500 py-3 pl-6">Receipt ID</TableHead>
                  <TableHead className="text-[10px] uppercase font-extrabold text-slate-500 py-3">Applicant Account</TableHead>
                  <TableHead className="text-[10px] uppercase font-extrabold text-slate-500 py-3">Transaction Ref</TableHead>
                  <TableHead className="text-[10px] uppercase font-extrabold text-slate-500 py-3">Amount Charged</TableHead>
                  <TableHead className="text-[10px] uppercase font-extrabold text-slate-500 py-3">Gateway Status</TableHead>
                  <TableHead className="text-[10px] uppercase font-extrabold text-slate-500 py-3 text-right pr-6">Timestamp</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayments.map((pay) => (
                  <TableRow key={pay.id}>
                    <TableCell className="py-3.5 pl-6 font-mono text-xs font-bold text-slate-900">
                      {pay.paymentId}
                    </TableCell>
                    <TableCell className="py-3.5">
                      <div className="text-xs font-bold text-slate-900">{pay.email}</div>
                      <div className="text-[9px] text-slate-400 font-bold font-mono">File: {pay.applicationId || "N/A"}</div>
                    </TableCell>
                    <TableCell className="py-3.5 font-mono text-[10px] text-slate-400">
                      {pay.transactionRef}
                    </TableCell>
                    <TableCell className="py-3.5 text-xs font-black text-slate-900 font-mono">
                      ₹{pay.amount} {pay.currency}
                    </TableCell>
                    <TableCell className="py-3.5">
                      <Badge className={`rounded-full text-[10px] font-extrabold px-2 py-0.5 border-transparent ${
                        pay.status === "success" ? "bg-emerald-500/10 text-emerald-600" : "bg-rose-500/10 text-rose-600"
                      }`}>
                        {pay.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-3.5 text-xs text-slate-450 text-right pr-6 font-mono font-semibold">
                      {pay.createdAt ? new Date(pay.createdAt).toLocaleString() : "N/A"}
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
