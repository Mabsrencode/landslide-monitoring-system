import Content from "@/components/page-components/root/home-director/Content";
import MainLoader from "@/components/reusable/MainLoader/MainLoader";
import React, { Suspense } from "react";

const page = () => {
  return (
    <Suspense fallback={<MainLoader />}>
      <Content />
    </Suspense>
  );
};

export default page;
