import { create } from "zustand";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { doc, getDoc, onSnapshot } from "firebase/firestore";

export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  role: "student" | "admin";
  phone: string;
  dob: string;
  gender: string;
  applicationId: string;
  slotBooked: boolean;
  examCompleted: boolean;
  status: "active" | "inactive";
}

interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  initialized: boolean;
  setProfile: (profile: UserProfile | null) => void;
  logout: () => Promise<void>;
  initialize: () => () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  profile: null,
  loading: true,
  initialized: false,
  setProfile: (profile) => set({ profile }),
  logout: async () => {
    await signOut(auth);
    set({ user: null, profile: null, loading: false });
  },
  initialize: () => {
    let unsubscribeSnapshot: (() => void) | null = null;
    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (unsubscribeSnapshot) {
        unsubscribeSnapshot();
        unsubscribeSnapshot = null;
      }
      if (firebaseUser) {
        set({ user: firebaseUser, loading: true });
        unsubscribeSnapshot = onSnapshot(doc(db, "users", firebaseUser.uid), (userDoc) => {
          if (userDoc.exists()) {
            set({ profile: userDoc.data() as UserProfile, loading: false, initialized: true });
          } else {
            set({ profile: null, loading: false, initialized: true });
          }
        }, (error) => {
          console.error("Error fetching user profile:", error);
          set({ profile: null, loading: false, initialized: true });
        });
      } else {
        set({ user: null, profile: null, loading: false, initialized: true });
      }
    });
    return () => {
      unsubscribeAuth();
      if (unsubscribeSnapshot) {
        unsubscribeSnapshot();
      }
    };
  },
}));
