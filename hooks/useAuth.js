// hooks/useAuth.js
import { useState, useEffect, createContext, useContext } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../lib/firebase";
import { getUserDoc, updateStreak } from "../lib/firestore";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        // Try to fetch profile — if offline, just continue with null profile
        try {
          const prof = await Promise.race([
            getUserDoc(firebaseUser.uid),
            new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), 4000)),
          ]);
          setProfile(prof);
          // Update streak in background — don't block UI
          updateStreak(firebaseUser.uid).catch(() => {});
        } catch {
          // Offline or slow — app still works
          setProfile(null);
        }
      } else {
        setProfile(null);
      }

      setLoading(false);
    });

    // Safety: stop loading after 6s no matter what
    const timer = setTimeout(() => setLoading(false), 6000);

    return () => {
      unsub();
      clearTimeout(timer);
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, profile, loading, setProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
