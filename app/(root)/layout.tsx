"use client";
import React from "react";
import { usePathname } from "next/navigation";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import PrivateSidebar from "@/components/common/PrivateSidebar/PrivateSidebar";
const queryClient = new QueryClient();

const publicRoutes = [
  "/auth/login",
  "/auth/register",
  "/auth/verify-email",
  "/auth/forgot-password",
  "/auth/reset-password",
];
const Layout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const isPublicRoute = publicRoutes.includes(pathname);
  return (
    <main className="min-h-screen">
      <Toaster position="bottom-right" reverseOrder={false} />
      <div className={`${!isPublicRoute && "flex"} h-full`}>
        <QueryClientProvider client={queryClient}>
          {!isPublicRoute && <PrivateSidebar />}
          {children}
        </QueryClientProvider>
      </div>
    </main>
  );
};

export default Layout;
