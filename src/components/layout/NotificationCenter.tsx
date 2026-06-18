"use client";

import { useEffect, useState, useRef } from "react";
import { Bell, Check, Trash2, X } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { fetchNotificationsForUser, markNotificationRead, NotificationDoc } from "@/services/notificationService";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export function NotificationCenter() {
  const { profile } = useAuthStore();
  const [notifications, setNotifications] = useState<NotificationDoc[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const loadNotifications = async () => {
    if (!profile?.uid) return;
    const data = await fetchNotificationsForUser(profile.uid);
    setNotifications(data);
  };

  useEffect(() => {
    if (profile?.uid) {
      loadNotifications();
      // Set up a polling interval every 20 seconds for notifications
      const interval = setInterval(loadNotifications, 20000);
      return () => clearInterval(interval);
    }
  }, [profile?.uid]);

  // Handle click outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id: string) => {
    await markNotificationRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    toast.success("Notification marked as read");
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 hover:bg-slate-50 text-slate-500 hover:text-slate-900 rounded-xl transition-all cursor-pointer border border-slate-100 bg-white"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
          </span>
        )}
      </button>

      {/* Dropdown Overlay */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 glass-card shadow-2xl z-50 overflow-hidden border border-slate-100 flex flex-col max-h-[480px]">
          <div className="p-4 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              Notifications
              {unreadCount > 0 && (
                <Badge variant="danger" className="rounded-full px-2 py-0.25 text-[10px]">
                  {unreadCount} New
                </Badge>
              )}
            </h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="overflow-y-auto flex-1 no-scrollbar divide-y divide-slate-50">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs flex flex-col items-center justify-center gap-2">
                <Bell className="h-8 w-8 text-slate-200" />
                No updates or messages yet.
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-4 transition-colors ${
                    notif.read ? "bg-white/40" : "bg-primary-teal/5"
                  }`}
                >
                  <div className="flex justify-between items-start gap-2">
                    <span className={`font-bold text-xs ${notif.read ? "text-slate-700" : "text-slate-900"}`}>
                      {notif.title}
                    </span>
                    {!notif.read && (
                      <button
                        onClick={() => handleMarkAsRead(notif.id)}
                        className="text-primary-teal hover:bg-primary-teal/10 p-1 rounded-md transition-colors"
                        title="Mark as read"
                      >
                        <Check className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{notif.message}</p>
                  <span className="text-[10px] text-slate-400 block mt-2">
                    {notif.createdAt
                      ? new Date(notif.createdAt.seconds * 1000).toLocaleString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "Just now"}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
