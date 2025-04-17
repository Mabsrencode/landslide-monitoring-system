import Content from "@/components/page-components/root/home-director/Content";
import React, { Suspense } from "react";

const page = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Content />
    </Suspense>
  );
};

export default page;
