import React from "react";
import LogsTable from "../LogsTable/LogsTable";
import Section from "@/components/reusable/Section/Section";
import BackRoute from "@/components/reusable/BackRoute/BackRoute";

const Content = () => {
  return (
    <Section>
      <BackRoute />
      <h2 className="text-4xl manrope font-semibold">Logs</h2>
      <LogsTable />
    </Section>
  );
};

export default Content;
