"use client";

import { useState } from "react";
import { db, auth } from "@/lib/firebase";
import { collection, addDoc, getDocs, query, where, serverTimestamp } from "firebase/firestore";
import { logActivity } from "@/services/activityLogger";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Settings, Send, ShieldAlert, Wifi } from "lucide-react";
import { toast } from "sonner";

export default function AdminSettingsPage() {
  const [broadcastTitle, setBroadcastTitle] = useState("");
  const [broadcastMessage, setBroadcastMessage] = useState("");
  const [recipientEmail, setRecipientEmail] = useState(""); // empty means "all"
  const [sending, setSending] = useState(false);

  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastTitle || !broadcastMessage) {
      toast.error("Please provide notification title and message text.");
      return;
    }

    setSending(true);
    try {
      let recipientId = "all";
      
      // If specific email is provided, fetch candidate's uid
      if (recipientEmail.trim()) {
        const q = query(collection(db, "users"), where("email", "==", recipientEmail.trim()));
        const snap = await getDocs(q);
        if (snap.empty) {
          toast.error("No candidate account found with the specified email.");
          setSending(false);
          return;
        }
        recipientId = snap.docs[0].id;
      }

      const newNotification = {
        recipientId,
        title: broadcastTitle,
        message: broadcastMessage,
        read: false,
        createdAt: serverTimestamp()
      };

      await addDoc(collection(db, "notifications"), newNotification);
      const adminUid = auth.currentUser?.uid || "admin";
      const adminEmail = auth.currentUser?.email || "admin@rgusat.com";
      await logActivity(
        adminUid,
        adminEmail,
        "broadcast_notification",
        `Sent alert "${broadcastTitle}" to recipient ${recipientId}`
      );

      toast.success("Notification broadcast dispatched!");
      setBroadcastTitle("");
      setBroadcastMessage("");
      setRecipientEmail("");
    } catch (e: any) {
      toast.error("Dispaching failed: " + e.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">System Settings</h2>
        <p className="text-xs text-slate-500 font-medium mt-0.5">Control global configs and alert broadcasts.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Broadcast Form */}
        <Card className="border border-slate-100 bg-white">
          <CardHeader>
            <CardTitle className="text-slate-900 font-bold text-sm flex items-center gap-2">
              <Send className="h-4.5 w-4.5 text-rose-500" />
              Broadcast Notification Alert
            </CardTitle>
            <CardDescription className="text-xs">
              Dispatch push notifications to candidates. Leave recipient email blank to broadcast globally.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSendBroadcast} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="recip">Recipient Email (Optional)</Label>
                <Input
                  id="recip"
                  placeholder="Leave blank for global broadcast"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="ntitle">Notification Title</Label>
                <Input
                  id="ntitle"
                  placeholder="e.g. Admit Card Published"
                  value={broadcastTitle}
                  onChange={(e) => setBroadcastTitle(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="nmsg">Message Details</Label>
                <textarea
                  id="nmsg"
                  placeholder="Enter details of dispatch alert..."
                  value={broadcastMessage}
                  onChange={(e) => setBroadcastMessage(e.target.value)}
                  required
                  className="flex min-h-[90px] w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-950 focus:outline-none"
                />
              </div>

              <Button 
                type="submit" 
                isLoading={sending} 
                className="w-full rounded-xl font-bold h-10 bg-slate-900 hover:bg-slate-800 text-white border-transparent cursor-pointer"
              >
                Send Notification
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Global Configuration */}
        <div className="space-y-6">
          <Card className="border border-slate-100 bg-white">
            <CardHeader>
              <CardTitle className="text-slate-900 font-bold text-sm flex items-center gap-2">
                <Settings className="h-4.5 w-4.5 text-rose-500" />
                Portal Telemetry Configurations
              </CardTitle>
              <CardDescription className="text-xs">Audit active platform parameters and services.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-xl">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-emerald-500/10 text-emerald-600 rounded-lg">
                    <Wifi className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Firestore Services</h4>
                    <p className="text-[10px] text-slate-500">Database synchronization loop</p>
                  </div>
                </div>
                <Badge className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/10 border-transparent text-[9px] font-black uppercase rounded-full">
                  ONLINE
                </Badge>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-xl">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-emerald-500/10 text-emerald-600 rounded-lg">
                    <ShieldAlert className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Authentication Gateways</h4>
                    <p className="text-[10px] text-slate-500">Candidate verification portal</p>
                  </div>
                </div>
                <Badge className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/10 border-transparent text-[9px] font-black uppercase rounded-full">
                  SECURE
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
