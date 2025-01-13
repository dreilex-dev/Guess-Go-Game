import { doc, getDoc, updateDoc } from "firebase/firestore";
import { create } from "zustand";
import { db } from "./firebase";
import { toast } from "react-toastify";

export const useUserStore = create((set) => ({
  currentUser: null,
  isLoading: true,
  playingUser: null,
  allPlayers: [],
  gameState: "notReady",
  setAllPlayers: (players) => set({ allPlayers: players }),
  setGameState: (str) => set({ gameState: str }),
  setCurrentUser: async (user) => set({ currentUser: user }),
  resetUser: () => set({ currentUser: null }),
  fetchUserInfo: async (uid) => {
    if (!uid) return set({ currentUser: null, isLoading: false });

    try {
      const docRef = doc(db, "users", uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        set({ currentUser: docSnap.data(), isLoading: false });
      } else {
        set({ currentUser: null, isLoading: false });
      }
    } catch (err) {
      console.log(err);
      return set({ currentUser: null, isLoading: false });
    }
  },

  incrementPoints: async (uid) => {
    try {
      const docRef = doc(db, "users", uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const currentPoints = docSnap.data().points || 0;
        const updatedPoints = currentPoints + 1;

        await updateDoc(docRef, { points: updatedPoints });
        set((state) => ({
          currentUser: { ...state.currentUser, points: updatedPoints },
        }));
      }
    } catch (err) {
      console.error("Error incrementing points:", err);
    }
  },

  decrementHints: async (uid) => {
    try {
      const docRef = doc(db, "users", uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const currentHints = docSnap.data().no_of_hints || 0;

        if (currentHints > 0) {
          const updatedHints = currentHints - 1;

          await updateDoc(docRef, { no_of_hints: updatedHints });
          set((state) => ({
            currentUser: { ...state.currentUser, no_of_hints: updatedHints },
          }));
        } else {
          toast.error("No more hints available to decrement.");
        }
      }
    } catch (err) {
      console.error("Error decrementing hints:", err);
    }
  },

  setIsPlaying: async (uid, targetUserId) => {
    try {
      const docRef = doc(db, "users", uid);

      await updateDoc(docRef, { is_playing: targetUserId });
      set((state) => ({
        currentUser: { ...state.currentUser, is_playing: targetUserId },
      }));
    } catch (err) {
      console.error("Error setting isPlaying:", err);
    }
  },

  fetchPlayingUserInfo: async (targetUserId) => {
    if (!targetUserId) return set({ playingUser: null });

    try {
      const docRef = doc(db, "users", targetUserId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        set({ playingUser: docSnap.data() });
      } else {
        set({ playingUser: null });
      }
    } catch (err) {
      console.error("Error fetching playing user info:", err);
      set({ playingUser: null });
    }
  },
}));
