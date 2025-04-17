"use client";
import React from "react";
import { usePathname } from "next/navigation";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import PublicSidebar from "@/components/common/PublicSidebar/PublicSidebar";
import { Toaster } from "react-hot-toast";
const queryClient = new QueryClient();

const publicRoutes = ["/auth/login", "/auth/register", "/auth/verify-email"];
const Layout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const isPublicRoute = publicRoutes.includes(pathname);
  return (
    <main className="min-h-screen">
      <Toaster position="bottom-right" reverseOrder={false} />
      <div className={`${!isPublicRoute && "flex"} h-full`}>
        {!isPublicRoute && <PublicSidebar />}
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </div>
    </main>
  );
};

export default Layout;
