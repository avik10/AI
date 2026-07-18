"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { insforge } from "@/lib/insforge";

interface AuthContextType {
  user: any | null;
  loading: boolean;
  logout: () => Promise<void>;
  checkUserSync: (user: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  logout: async () => {},
  checkUserSync: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Core function to check database user profile sync
  const checkUserSync = async (currentUser: any) => {
    if (!currentUser) return;
    try {
      // 1. Check if user already exists in 'users' table
      const { data, error } = await insforge.database
        .from("users")
        .select("*")
        .eq("id", currentUser.id);

      if (error) {
        console.error("Error querying users table:", error);
        return;
      }

      // 2. If user doesn't exist, insert them (first-time sync)
      if (!data || data.length === 0) {
        console.log("First time login detected. Syncing user profile to DB...");
        const fallbackName = currentUser.profile?.name || currentUser.email.split("@")[0];
        
        const { error: insertError } = await insforge.database
          .from("users")
          .insert([
            {
              id: currentUser.id,
              email: currentUser.email,
              name: fallbackName,
            },
          ]);

        if (insertError) {
          console.error("Error inserting user into db:", insertError);
        } else {
          console.log("User successfully saved in database.");
        }
      }
    } catch (err) {
      console.error("User profile sync exception:", err);
    }
  };

  const checkAuth = async () => {
    try {
      // 1. Check for custom phone session in localStorage first
      if (typeof window !== "undefined") {
        const phoneSessionStr = localStorage.getItem("omnisync_phone_session");
        if (phoneSessionStr) {
          try {
            const phoneUser = JSON.parse(phoneSessionStr);
            setUser(phoneUser);
            setLoading(false);
            return;
          } catch (e) {
            localStorage.removeItem("omnisync_phone_session");
          }
        }
      }

      // 2. Fall back to standard InsForge getCurrentUser session
      const { data, error } = await insforge.auth.getCurrentUser();
      
      if (data?.user) {
        setUser(data.user);
        await checkUserSync(data.user);
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error("Check auth error:", err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, [pathname]);

  const logout = async () => {
    setLoading(true);
    try {
      if (typeof window !== "undefined") {
        localStorage.removeItem("omnisync_phone_session");
      }
      await insforge.auth.signOut();
      setUser(null);
      router.push("/");
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout, checkUserSync }}>
      {children}
    </AuthContext.Provider>
  );
}
