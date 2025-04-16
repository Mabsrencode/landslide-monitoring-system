"use client";

import { useEffect } from "react";
import { auth } from "@/lib/firebase/config";
import { onAuthStateChanged, User } from "firebase/auth";
import { useAuthStore } from "@/stores/authStore";
export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { setUser, setIsLoading } = useAuthStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [setUser, setIsLoading]);

  return <>{children}</>;
}
