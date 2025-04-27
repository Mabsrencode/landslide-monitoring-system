"use client";

import { useEffect } from "react";
import { auth } from "@/lib/firebase/config";
import { onAuthStateChanged } from "firebase/auth";
import { useAuthStore } from "@/stores/authStore";
export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { setIsLoading } = useAuthStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, () => {
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [setIsLoading]);

  return <>{children}</>;
}
