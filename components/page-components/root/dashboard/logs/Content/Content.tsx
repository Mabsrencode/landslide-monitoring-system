import React from "react";
import LogsTable from "../LogsTable/LogsTable";

const Content = () => {
  return (
    <section className="container mx-auto p-4">
      <h2 className="text-4xl manrope font-semibold">Logs</h2>
      <LogsTable />
    </section>
  );
};

export default Content;
