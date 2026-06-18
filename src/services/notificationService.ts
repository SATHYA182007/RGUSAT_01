import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  doc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";

export interface NotificationDoc {
  id: string;
  recipientId: string; // "all", "admin", or a specific user UID
  title: string;
  message: string;
  read: boolean;
  createdAt: any;
}

export async function sendNotification(
  recipientId: string | "all" | "admin",
  title: string,
  message: string
) {
  try {
    await addDoc(collection(db, "notifications"), {
      recipientId,
      title,
      message,
      read: false,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error sending notification:", error);
  }
}

export async function fetchNotificationsForUser(recipientId: string) {
  try {
    const q = query(
      collection(db, "notifications"),
      where("recipientId", "in", ["all", recipientId])
    );
    const snap = await getDocs(q);
    const list = snap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as NotificationDoc[];
    return list.sort((a, b) => {
      const timeA = a.createdAt?.seconds || 0;
      const timeB = b.createdAt?.seconds || 0;
      return timeB - timeA;
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return [];
  }
}

export async function fetchAdminNotifications() {
  try {
    const q = query(
      collection(db, "notifications"),
      where("recipientId", "==", "admin")
    );
    const snap = await getDocs(q);
    const list = snap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as NotificationDoc[];
    return list.sort((a, b) => {
      const timeA = a.createdAt?.seconds || 0;
      const timeB = b.createdAt?.seconds || 0;
      return timeB - timeA;
    });
  } catch (error) {
    console.error("Error fetching admin notifications:", error);
    return [];
  }
}

export async function markNotificationRead(notificationId: string) {
  try {
    const docRef = doc(db, "notifications", notificationId);
    await updateDoc(docRef, { read: true });
  } catch (error) {
    console.error("Error marking notification read:", error);
  }
}
