"use client";

import { useEffect, useState } from "react";
import { db, auth } from "@/lib/firebase";
import { doc, updateDoc, getDocs, collection, query, where, orderBy } from "firebase/firestore";
import { sendPasswordResetEmail } from "firebase/auth";
import { useAuthStore } from "@/store/useAuthStore";
import { logActivity } from "@/services/activityLogger";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { User, Key, History, Save, Send, ShieldCheck, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export default function StudentSettingsPage() {
  const { profile, setProfile } = useAuthStore();
  const [activeTab, setActiveTab] = useState<"profile" | "security" | "history">("profile");

  // Profile Form State
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  // Security State
  const [sendingReset, setSendingReset] = useState(false);

  // History State
  const [activities, setActivities] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    if (profile) {
      setName(profile.name || "");
      setPhone(profile.phone || "");
      setDob(profile.dob || "");
      setGender(profile.gender || "");
    }
  }, [profile]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setSavingProfile(true);

    try {
      const userRef = doc(db, "users", profile.uid);
      const updates = { name, phone, dob, gender };
      await updateDoc(userRef, updates);

      // Update global Zustand store
      setProfile({
        ...profile,
        ...updates,
      });

      // Log activity
      await logActivity(profile.uid, profile.email, "Profile Updated", "Modified personal profile parameters.");

      toast.success("Profile information updated successfully.");
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast.error(error.message || "Failed to update profile.");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSendResetEmail = async () => {
    if (!profile) return;
    setSendingReset(true);

    try {
      await sendPasswordResetEmail(auth, profile.email);
      await logActivity(profile.uid, profile.email, "Password Reset Requested", "Requested auth password reset link.");
      toast.success(`Password reset link transmitted to ${profile.email}`);
    } catch (error: any) {
      console.error("Error sending reset email:", error);
      toast.error(error.message || "Failed to send reset email.");
    } finally {
      setSendingReset(false);
    }
  };

  const loadActivityHistory = async () => {
    if (!profile) return;
    setLoadingHistory(true);
    try {
      const q = query(
        collection(db, "activity_logs"),
        where("uid", "==", profile.uid)
      );
      const snap = await getDocs(q);
      const list = snap.docs
        .map((d) => d.data())
        .sort((a, b) => {
          const timeA = a.createdAt?.seconds || 0;
          const timeB = b.createdAt?.seconds || 0;
          return timeB - timeA;
        });
      setActivities(list);
    } catch (error) {
      console.error("Error loading activity history:", error);
      toast.error("Failed to load activity log.");
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    if (activeTab === "history") {
      loadActivityHistory();
    }
  }, [activeTab]);

  if (!profile) {
    return <Skeleton className="h-96 rounded-3xl" />;
  }

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Profile Settings
        </h2>
        <p className="text-sm text-slate-500 font-medium mt-1">
          Manage your personal details, credentials, security gates, and audit history.
        </p>
      </div>

      {/* Tabs Row */}
      <div className="flex gap-2 border-b border-slate-100 pb-px">
        <button
          onClick={() => setActiveTab("profile")}
          className={`px-4 py-2 text-sm font-semibold border-b-2 cursor-pointer transition-all ${
            activeTab === "profile"
              ? "border-primary-teal text-primary-teal"
              : "border-transparent text-slate-400 hover:text-slate-600"
          }`}
        >
          <span className="flex items-center gap-1.5">
            <User className="h-4 w-4" />
            Personal Profile
          </span>
        </button>

        <button
          onClick={() => setActiveTab("security")}
          className={`px-4 py-2 text-sm font-semibold border-b-2 cursor-pointer transition-all ${
            activeTab === "security"
              ? "border-primary-teal text-primary-teal"
              : "border-transparent text-slate-400 hover:text-slate-600"
          }`}
        >
          <span className="flex items-center gap-1.5">
            <Key className="h-4 w-4" />
            Security & Auth
          </span>
        </button>

        <button
          onClick={() => setActiveTab("history")}
          className={`px-4 py-2 text-sm font-semibold border-b-2 cursor-pointer transition-all ${
            activeTab === "history"
              ? "border-primary-teal text-primary-teal"
              : "border-transparent text-slate-400 hover:text-slate-600"
          }`}
        >
          <span className="flex items-center gap-1.5">
            <History className="h-4 w-4" />
            Portal Logs
          </span>
        </button>
      </div>

      {/* Tab Contents */}
      <div className="max-w-2xl">
        {activeTab === "profile" && (
          <Card className="border border-slate-100 shadow-lg shadow-slate-100/10">
            <form onSubmit={handleUpdateProfile}>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Update candidate details for registrations.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email Address (Read-only)</Label>
                  <Input id="email" value={profile.email} disabled className="bg-slate-50 cursor-not-allowed" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} required />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="dob">Date of Birth</Label>
                    <Input id="dob" type="date" value={dob} onChange={(e) => setDob(e.target.value)} required />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="gender">Gender</Label>
                  <Select
                    id="gender"
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    options={[
                      { value: "Male", label: "Male" },
                      { value: "Female", label: "Female" },
                      { value: "Other", label: "Other" },
                    ]}
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-end bg-slate-50/20 border-t border-slate-100">
                <Button type="submit" isLoading={savingProfile} className="rounded-xl font-bold gap-1.5 shadow-sm">
                  <Save className="h-4 w-4" />
                  Save Updates
                </Button>
              </CardFooter>
            </form>
          </Card>
        )}

        {activeTab === "security" && (
          <Card className="border border-slate-100 shadow-lg shadow-slate-100/10">
            <CardHeader>
              <CardTitle>Portal Security</CardTitle>
              <CardDescription>Configure credentials and reset login passwords.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 bg-primary-teal/5 border border-primary-teal/10 rounded-2xl flex items-start gap-3 text-xs leading-relaxed text-slate-600">
                <ShieldCheck className="h-5 w-5 text-primary-teal shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-800 block mb-0.5">Secure Password Reset Engine</strong>
                  We use Firebase's secure auth link system to update credentials. Click the button below to receive an email with a secure reset link.
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border border-slate-100 rounded-2xl">
                <div>
                  <h4 className="text-sm font-bold text-slate-800">Reset Account Password</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Transmit reset instructions to registered mail.</p>
                </div>
                <Button
                  onClick={handleSendResetEmail}
                  isLoading={sendingReset}
                  className="rounded-xl font-bold gap-1 shadow-sm"
                >
                  <Send className="h-4 w-4" />
                  Send Reset Link
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === "history" && (
          <Card className="border border-slate-100 shadow-lg shadow-slate-100/10">
            <CardHeader>
              <CardTitle>Applicant Activity Audit</CardTitle>
              <CardDescription>Chronological log of portal transactions and events.</CardDescription>
            </CardHeader>
            <CardContent className="p-0 max-h-[480px] overflow-y-auto no-scrollbar">
              {loadingHistory ? (
                <div className="p-12 text-center">
                  <Skeleton className="h-8 w-8 rounded-full animate-spin border-t-2 border-primary-teal mx-auto" />
                </div>
              ) : activities.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">
                  No activity logs registered.
                </div>
              ) : (
                <div className="divide-y divide-slate-100 text-xs">
                  {activities.map((act, idx) => (
                    <div key={idx} className="p-4 flex justify-between items-center gap-4 hover:bg-slate-50/30 transition-colors">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-primary-teal" />
                          <span className="font-bold text-slate-800">{act.action}</span>
                        </div>
                        <p className="text-slate-400 mt-1 leading-normal pl-3.5">
                          {act.details}
                        </p>
                      </div>
                      <span className="text-[10px] text-slate-400 font-semibold shrink-0">
                        {act.createdAt
                          ? new Date(act.createdAt.seconds * 1000).toLocaleString()
                          : "Today"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
