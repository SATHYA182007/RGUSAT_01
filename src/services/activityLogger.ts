import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export async function logActivity(uid: string, email: string, action: string, details: string) {
  try {
    await addDoc(collection(db, "activity_logs"), {
      uid,
      email,
      action,
      details,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error logging activity:", error);
  }
}
