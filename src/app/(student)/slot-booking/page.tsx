"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  query,
  where,
  runTransaction,
  serverTimestamp,
} from "firebase/firestore";
import { useAuthStore } from "@/store/useAuthStore";
import { logActivity } from "@/services/activityLogger";
import { sendNotification } from "@/services/notificationService";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Clock, CheckCircle2, ChevronRight, AlertCircle, Users2 } from "lucide-react";
import { toast } from "sonner";

interface ExamSlot {
  id: string;
  date: string;
  timeStart: string;
  timeEnd: string;
  capacity: number;
  bookedCount: number;
}

interface SlotBooking {
  bookingId: string;
  uid: string;
  email: string;
  name: string;
  slotId: string;
  date: string;
  timeStart: string;
  timeEnd: string;
}

export default function SlotBookingPage() {
  const { profile, setProfile } = useAuthStore();
  const [slots, setSlots] = useState<ExamSlot[]>([]);
  const [userBooking, setUserBooking] = useState<SlotBooking | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [bookingInProgress, setBookingInProgress] = useState<string | null>(null);

  // 1. Seed default slots if empty
  const seedSlotsIfEmpty = async () => {
    const querySnapshot = await getDocs(collection(db, "exam_slots"));
    const validSlots = querySnapshot.docs.filter((d) => {
      const data = d.data();
      return data.date && data.timeStart && data.timeEnd;
    });

    if (validSlots.length === 0) {
      const defaultSlots = [
        { id: "slot_1", date: "2026-07-10", timeStart: "09:00", timeEnd: "11:00", capacity: 120, bookedCount: 88 },
        { id: "slot_2", date: "2026-07-10", timeStart: "14:00", timeEnd: "16:00", capacity: 120, bookedCount: 119 },
        { id: "slot_3", date: "2026-07-11", timeStart: "10:00", timeEnd: "12:00", capacity: 150, bookedCount: 22 },
        { id: "slot_4", date: "2026-07-12", timeStart: "11:00", timeEnd: "13:00", capacity: 100, bookedCount: 100 }, // Full
      ];
      
      for (const slot of defaultSlots) {
        await setDoc(doc(db, "exam_slots", slot.id), {
          slotId: slot.id,
          date: slot.date,
          timeStart: slot.timeStart,
          timeEnd: slot.timeEnd,
          capacity: slot.capacity,
          bookedCount: slot.bookedCount,
        });
      }
    }
  };

  const loadData = async () => {
    if (!profile) return;
    setLoading(true);
    try {
      // Seed slots if there are none
      await seedSlotsIfEmpty();

      // Load all slots
      const slotsSnap = await getDocs(collection(db, "exam_slots"));
      const slotsList = slotsSnap.docs
        .map((d) => {
          const data = d.data();
          return {
            id: d.id,
            date: data.date,
            timeStart: data.timeStart,
            timeEnd: data.timeEnd,
            capacity: data.capacity,
            bookedCount: data.bookedCount || 0,
          };
        })
        .filter((slot) => slot.date && slot.timeStart && slot.timeEnd);
      // Sort slots chronologically
      slotsList.sort((a, b) => a.date.localeCompare(b.date) || a.timeStart.localeCompare(b.timeStart));
      setSlots(slotsList);

      // Check if user already booked a slot
      const bookingQuery = query(collection(db, "slot_bookings"), where("uid", "==", profile.uid));
      const bookingSnap = await getDocs(bookingQuery);
      if (!bookingSnap.empty) {
        setUserBooking(bookingSnap.docs[0].data() as SlotBooking);
      }
    } catch (error) {
      console.error("Error loading slot details:", error);
      toast.error("Failed to load slot details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [profile]);

  const handleBookSlot = async (slot: ExamSlot) => {
    if (!profile) return;
    setBookingInProgress(slot.id);

    try {
      // 1. Transaction to decrement slot remaining capacity & ensure we don't double book
      const slotRef = doc(db, "exam_slots", slot.id);
      const userRef = doc(db, "users", profile.uid);
      const bookingId = `BK-${Math.floor(100000 + Math.random() * 900000)}`;
      const bookingRef = doc(db, "slot_bookings", bookingId);

      await runTransaction(db, async (transaction) => {
        const slotSnap = await transaction.get(slotRef);
        if (!slotSnap.exists()) throw new Error("Slot does not exist.");

        const slotData = slotSnap.data();
        const booked = slotData.bookedCount || 0;
        const capacity = slotData.capacity || 0;

        if (booked >= capacity) {
          throw new Error("This examination slot is fully booked.");
        }

        // Increment booked count
        transaction.update(slotRef, { bookedCount: booked + 1 });

        // Update user slotBooked = true
        transaction.update(userRef, { slotBooked: true });

        // Create booking record
        transaction.set(bookingRef, {
          bookingId,
          uid: profile.uid,
          email: profile.email,
          name: profile.name,
          slotId: slot.id,
          date: slot.date || "",
          timeStart: slot.timeStart || "",
          timeEnd: slot.timeEnd || "",
          createdAt: new Date().toISOString(),
        });
      });

      // Update local state and authStore profile
      const updatedProfile = { ...profile, slotBooked: true };
      setProfile(updatedProfile);

      // Log activity
      await logActivity(
        profile.uid,
        profile.email,
        "Slot Booked",
        `Booked exam slot ${slot.date} (${slot.timeStart} - ${slot.timeEnd}). Booking Ref: ${bookingId}`
      );

      // Send notifications
      await sendNotification(
        profile.uid,
        "Exam Slot Confirmed",
        `Your slot on ${slot.date} at ${slot.timeStart} has been booked. Main Entrance will unlock at this time.`
      );
      await sendNotification(
        "admin",
        "Exam Slot Booked",
        `Student ${profile.name} booked slot for ${slot.date} (${slot.timeStart} - ${slot.timeEnd})`
      );

      toast.success("Exam slot booked successfully!");
      loadData();
    } catch (error: any) {
      console.error("Booking error:", error);
      toast.error(error.message || "Failed to book slot. Seating capacity might be full.");
    } finally {
      setBookingInProgress(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-28 rounded-3xl" />
          <Skeleton className="h-28 rounded-3xl" />
          <Skeleton className="h-28 rounded-3xl" />
        </div>
      </div>
    );
  }

  // Render Already Booked Confirmation State
  if (userBooking) {
    return (
      <div className="max-w-2xl mx-auto space-y-6 mt-8">
        <Card className="border-emerald-500/20 shadow-xl shadow-emerald-500/5 overflow-hidden">
          <div className="p-8 text-center space-y-4 bg-gradient-to-tr from-emerald-500/5 to-teal-500/5 border-b border-slate-100">
            <div className="p-4 bg-emerald-500/10 text-emerald-500 rounded-full w-fit mx-auto scale-110">
              <CheckCircle2 className="h-12 w-12" />
            </div>
            <CardTitle className="text-2xl text-slate-900 font-extrabold">Exam Slot Confirmed</CardTitle>
            <CardDescription className="max-w-md mx-auto">
              Your seat has been reserved. You can take the main exam during your booked window.
            </CardDescription>
          </div>
          <CardContent className="p-8 space-y-6 text-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-white p-6 rounded-2xl border border-slate-100">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-primary-teal shrink-0" />
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Date</span>
                  <span className="font-bold text-slate-800 text-base">{userBooking.date}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-primary-teal shrink-0" />
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Session</span>
                  <span className="font-bold text-slate-800 text-base">
                    {userBooking.timeStart} - {userBooking.timeEnd}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-2xl text-xs text-amber-700 leading-relaxed flex gap-2.5 items-start">
              <AlertCircle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
              <div>
                <strong>Instructions for Candidate:</strong>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li>Ensure you have a stable broadband connection.</li>
                  <li>Have a working webcam. The exam logs screenshot events periodically.</li>
                  <li>Closing full-screen or switching windows during the exam will auto-submit.</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Select Exam Slot
        </h2>
        <p className="text-sm text-slate-500 font-medium mt-1">
          Reserve your seat. You are permitted one booking, and slots cannot be altered once confirmed.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {slots.map((slot) => {
          const remaining = slot.capacity - slot.bookedCount;
          const isFull = remaining <= 0;
          const fillPercentage = (slot.bookedCount / slot.capacity) * 100;
          
          return (
            <Card
              key={slot.id}
              className={`border border-slate-100 hover:border-primary-teal/30 transition-all duration-200 overflow-hidden ${
                isFull ? "opacity-60 bg-slate-50/50" : ""
              }`}
            >
              <CardContent className="p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                <div className="flex flex-col sm:flex-row gap-6 sm:items-center">
                  {/* Date Badge */}
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-primary-teal/5 text-primary-teal rounded-2xl shrink-0">
                      <Calendar className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Date</span>
                      <span className="font-bold text-slate-800">{slot.date}</span>
                    </div>
                  </div>

                  {/* Time Badge */}
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-primary-sky/5 text-primary-sky rounded-2xl shrink-0">
                      <Clock className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Session</span>
                      <span className="font-bold text-slate-800">
                        {slot.timeStart} - {slot.timeEnd}
                      </span>
                    </div>
                  </div>

                  {/* Seating Capacities */}
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-slate-100 text-slate-500 rounded-2xl shrink-0">
                      <Users2 className="h-5 w-5" />
                    </div>
                    <div className="min-w-[120px]">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Capacity</span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="font-bold text-slate-800">{remaining} Available</span>
                        <span className="text-xs text-slate-400">/ {slot.capacity}</span>
                      </div>
                      <div className="w-full bg-slate-100 h-1.5 rounded-full mt-1.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            isFull ? "bg-rose-500" : fillPercentage > 80 ? "bg-amber-500" : "bg-emerald-500"
                          }`}
                          style={{ width: `${Math.min(fillPercentage, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="shrink-0 flex items-center justify-end">
                  {isFull ? (
                    <Button variant="outline" disabled className="rounded-xl font-bold bg-slate-100 text-slate-400 border-transparent">
                      Fully Booked
                    </Button>
                  ) : (
                    <Button
                      onClick={() => handleBookSlot(slot)}
                      isLoading={bookingInProgress === slot.id}
                      className="rounded-xl font-bold gap-1 shadow-md"
                    >
                      Book Slot
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
