"use client";

import { useEffect, useState } from "react";
import { db, auth } from "@/lib/firebase";
import {
  collection,
  getDocs,
  doc,
  setDoc,
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
import { CalendarDays, Clock, Users, Plus, Trash, Users2, Eye } from "lucide-react";
import { toast } from "sonner";

interface ExamSlot {
  slotId: string;
  date: string;
  timeStart: string;
  timeEnd: string;
  capacity: number;
  bookedCount: number;
}

interface SlotBooking {
  bookingId: string;
  name: string;
  email: string;
  createdAt: string;
}

export default function AdminSlotsPage() {
  const [slots, setSlots] = useState<ExamSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSlot, setActiveSlot] = useState<ExamSlot | null>(null);
  const [activeBookings, setActiveBookings] = useState<SlotBooking[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [openBookings, setOpenBookings] = useState(false);
  const [openCreate, setOpenCreate] = useState(false);

  // Form states
  const [slotDate, setSlotDate] = useState("");
  const [timeStart, setTimeStart] = useState("");
  const [timeEnd, setTimeEnd] = useState("");
  const [capacity, setCapacity] = useState(60);
  const [creating, setCreating] = useState(false);

  const fetchSlots = async () => {
    try {
      const snap = await getDocs(collection(db, "exam_slots"));
      const list = snap.docs.map(doc => ({
        slotId: doc.id,
        ...doc.data()
      })) as ExamSlot[];
      // Sort slots by date and time
      list.sort((a, b) => {
        const dateCompare = a.date.localeCompare(b.date);
        if (dateCompare !== 0) return dateCompare;
        return a.timeStart.localeCompare(b.timeStart);
      });
      setSlots(list);
    } catch (e: any) {
      toast.error("Failed to load slots: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlots();
  }, []);

  const handleOpenBookings = async (slot: ExamSlot) => {
    setActiveSlot(slot);
    setOpenBookings(true);
    setBookingsLoading(true);
    try {
      const q = query(collection(db, "slot_bookings"), where("slotId", "==", slot.slotId));
      const snap = await getDocs(q);
      const list = snap.docs.map(doc => ({
        bookingId: doc.id,
        ...doc.data()
      })) as SlotBooking[];
      setActiveBookings(list);
    } catch (e: any) {
      toast.error("Failed to load bookings: " + e.message);
    } finally {
      setBookingsLoading(false);
    }
  };

  const handleCreateSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!slotDate || !timeStart || !timeEnd || !capacity) {
      toast.error("Please fill in all slot configurations");
      return;
    }

    setCreating(true);
    const generatedId = `slot_${Date.now()}`;
    const newSlot: ExamSlot = {
      slotId: generatedId,
      date: slotDate,
      timeStart,
      timeEnd,
      capacity: Number(capacity),
      bookedCount: 0
    };

    try {
      await setDoc(doc(db, "exam_slots", generatedId), newSlot);
      const adminUid = auth.currentUser?.uid || "admin";
      const adminEmail = auth.currentUser?.email || "admin@rgusat.com";
      await logActivity(adminUid, adminEmail, "create_exam_slot", `Created exam slot for ${slotDate} (${timeStart} - ${timeEnd})`);
      toast.success("Exam slot created successfully!");
      setOpenCreate(false);
      // Reset form
      setSlotDate("");
      setTimeStart("");
      setTimeEnd("");
      setCapacity(60);
      fetchSlots();
    } catch (e: any) {
      toast.error("Slot creation failed: " + e.message);
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteSlot = async (slotId: string, bookedCount: number) => {
    if (bookedCount > 0) {
      toast.error("Cannot delete a slot with active candidate bookings.");
      return;
    }

    if (!confirm("Are you sure you want to delete this exam slot?")) return;

    try {
      await deleteDoc(doc(db, "exam_slots", slotId));
      const adminUid = auth.currentUser?.uid || "admin";
      const adminEmail = auth.currentUser?.email || "admin@rgusat.com";
      await logActivity(adminUid, adminEmail, "delete_exam_slot", `Deleted exam slot ${slotId}`);
      toast.success("Exam slot deleted successfully!");
      fetchSlots();
    } catch (e: any) {
      toast.error("Deletion failed: " + e.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Exam Scheduling</h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">Manage date & time slots for entrance exams.</p>
        </div>
        <Button 
          onClick={() => setOpenCreate(true)} 
          className="rounded-xl font-bold bg-slate-900 hover:bg-slate-800 text-white flex items-center gap-1.5 h-9 text-xs px-4 border-transparent cursor-pointer"
        >
          <Plus className="h-4 w-4" /> Create Exam Slot
        </Button>
      </div>

      <Card className="border border-slate-100 bg-white">
        <CardHeader>
          <CardTitle className="text-slate-900 font-bold text-sm flex items-center gap-2">
            <CalendarDays className="h-4.5 w-4.5 text-rose-500" />
            Configured Exam Slots ({slots.length})
          </CardTitle>
          <CardDescription className="text-xs">Schedule dates, capacity thresholds, and manage booking lists.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 space-y-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : slots.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              No exam slots scheduled yet.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-[10px] uppercase font-extrabold text-slate-500 py-3 pl-6">Scheduled Date</TableHead>
                  <TableHead className="text-[10px] uppercase font-extrabold text-slate-500 py-3">Timing</TableHead>
                  <TableHead className="text-[10px] uppercase font-extrabold text-slate-500 py-3">Booked / Total Capacity</TableHead>
                  <TableHead className="text-[10px] uppercase font-extrabold text-slate-500 py-3">Seats Available</TableHead>
                  <TableHead className="text-[10px] uppercase font-extrabold text-slate-500 py-3 text-right pr-6">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {slots.map((slot) => {
                  const available = slot.capacity - slot.bookedCount;
                  return (
                    <TableRow key={slot.slotId}>
                      <TableCell className="py-3.5 pl-6 font-bold text-slate-950 text-xs">
                        {new Date(slot.date).toLocaleDateString([], { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                      </TableCell>
                      <TableCell className="py-3.5 text-xs text-slate-700 font-semibold font-mono">
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 text-slate-450" />
                          {slot.timeStart} – {slot.timeEnd}
                        </div>
                      </TableCell>
                      <TableCell className="py-3.5 text-xs font-semibold text-slate-950 font-mono">
                        {slot.bookedCount} / {slot.capacity}
                      </TableCell>
                      <TableCell className="py-3.5">
                        <Badge className={`rounded-full text-[10px] font-extrabold px-2 py-0.5 border-transparent ${
                          available > 10 ? "bg-emerald-500/10 text-emerald-600" :
                          available > 0 ? "bg-amber-500/10 text-amber-600" :
                          "bg-rose-500/10 text-rose-600"
                        }`}>
                          {available <= 0 ? "Full" : `${available} Left`}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-3.5 text-right pr-6">
                        <div className="flex justify-end gap-2">
                          <Button
                            onClick={() => handleOpenBookings(slot)}
                            size="sm"
                            variant="outline"
                            className="h-8 text-[10px] font-bold uppercase tracking-wider rounded-lg border-slate-200 cursor-pointer"
                          >
                            <Eye className="h-3.5 w-3.5 mr-1" /> Roster
                          </Button>
                          <Button
                            onClick={() => handleDeleteSlot(slot.slotId, slot.bookedCount)}
                            disabled={slot.bookedCount > 0}
                            size="sm"
                            className="h-8 text-[10px] font-bold bg-rose-500 text-white hover:bg-rose-600 border-transparent rounded-lg cursor-pointer"
                          >
                            <Trash className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Roster Modal */}
      {openBookings && activeSlot && (
        <Dialog open={openBookings} onOpenChange={(open) => !open && setOpenBookings(false)}>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle className="text-slate-900 font-black text-lg flex items-center gap-2">
                <Users2 className="h-5 w-5 text-rose-500" />
                Session Roster: {activeSlot.date}
              </DialogTitle>
              <DialogDescription className="text-xs">
                Candidates booked in the {activeSlot.timeStart} – {activeSlot.timeEnd} session.
              </DialogDescription>
            </DialogHeader>

            <div className="py-4 max-h-[50vh] overflow-y-auto">
              {bookingsLoading ? (
                <div className="py-8 text-center text-slate-400 text-xs">
                  Loading candidate list...
                </div>
              ) : activeBookings.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  No candidates have booked this session yet.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-[9px] uppercase font-extrabold text-slate-400">Name</TableHead>
                      <TableHead className="text-[9px] uppercase font-extrabold text-slate-400">Email</TableHead>
                      <TableHead className="text-[9px] uppercase font-extrabold text-slate-400 text-right">Booked Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activeBookings.map((b) => (
                      <TableRow key={b.bookingId}>
                        <TableCell className="py-2.5 font-bold text-slate-900 text-xs">{b.name}</TableCell>
                        <TableCell className="py-2.5 text-slate-500 text-xs">{b.email}</TableCell>
                        <TableCell className="py-2.5 text-[10px] text-slate-400 text-right font-mono">
                          {b.createdAt ? new Date(b.createdAt).toLocaleDateString() : "N/A"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
            <DialogFooter>
              <Button onClick={() => setOpenBookings(false)} className="rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold px-6 h-9 text-xs border-transparent cursor-pointer">
                Close Roster
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Create Slot Modal */}
      {openCreate && (
        <Dialog open={openCreate} onOpenChange={(open) => !open && setOpenCreate(false)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-slate-900 font-black text-lg flex items-center gap-2">
                <Plus className="h-5 w-5 text-rose-500" />
                Schedule Exam Session
              </DialogTitle>
              <DialogDescription className="text-xs">
                Configure a new date, time window, and seating capacity limit.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleCreateSlot} className="space-y-4 py-2">
              <div className="space-y-1.5">
                <Label htmlFor="sdate">Exam Date</Label>
                <Input
                  id="sdate"
                  type="date"
                  value={slotDate}
                  onChange={(e) => setSlotDate(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="tstart">Start Time</Label>
                  <Input
                    id="tstart"
                    type="time"
                    value={timeStart}
                    onChange={(e) => setTimeStart(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="tend">End Time</Label>
                  <Input
                    id="tend"
                    type="time"
                    value={timeEnd}
                    onChange={(e) => setTimeEnd(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="scap">Seating Capacity</Label>
                <Input
                  id="scap"
                  type="number"
                  value={capacity}
                  onChange={(e) => setCapacity(Number(e.target.value))}
                  required
                  min={1}
                />
              </div>

              <DialogFooter className="pt-3 border-t border-slate-100 mt-4">
                <Button 
                  onClick={() => setOpenCreate(false)} 
                  variant="outline" 
                  type="button" 
                  className="rounded-xl border-slate-200 h-9 text-xs px-4"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  isLoading={creating} 
                  className="rounded-xl font-bold bg-slate-900 hover:bg-slate-800 text-white h-9 text-xs px-6 border-transparent"
                >
                  Add Session
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
