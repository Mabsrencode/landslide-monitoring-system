import React, { Suspense } from "react";
import Content from "@/components/page-components/root/auth/verify-email/Content";

const Page = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Content />
    </Suspense>
  );
};

export default Page;
