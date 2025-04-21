import React, { Suspense } from "react";
import Content from "@/components/page-components/root/auth/verify-email/Content";
import MainLoader from "@/components/reusable/MainLoader/MainLoader";

const Page = () => {
  return (
    <Suspense fallback={<MainLoader />}>
      <Content />
    </Suspense>
  );
};

export default Page;
