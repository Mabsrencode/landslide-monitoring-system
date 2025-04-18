"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import MainLoader from "@/components/reusable/MainLoader/MainLoader";

export default function Content() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const mode = searchParams.get("mode");
    const oobCode = searchParams.get("oobCode");

    if (!mode) {
      router.replace("/auth/login");
      return;
    }

    switch (mode) {
      case "resetPassword":
        router.replace(`/auth/reset-password?oobCode=${oobCode}`);
        break;
      case "verifyEmail":
        router.replace(`/auth/verify-email?oobCode=${oobCode}`);
        break;
      case "recoverEmail":
        break;
      default:
        router.replace("/auth/login");
    }
  }, [router, searchParams]);

  return <MainLoader />;
}
