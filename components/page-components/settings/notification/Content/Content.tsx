import BackRoute from "@/components/reusable/BackRoute/BackRoute";
import React from "react";
import OthersLink from "../../OthersLink/OthersLink";

const Content = () => {
  return (
    <section className="container mx-auto p-4 w-full h-full">
      <BackRoute />
      <div className="flex flex-col md:flex-row gap-4 w-full">
      <div className="w-full flex-1 md:w-1/2 mx-auto space-y-6 bg-slate-100 rounded p-4 border border-black/10">
      </div>
        <OthersLink />
      </div>
    </section>
  );
};

export default Content;
