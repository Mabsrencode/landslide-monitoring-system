import BackRoute from "@/components/reusable/BackRoute/BackRoute";
import Section from "@/components/reusable/Section/Section";
import React from "react";
import IncidentTable from "../IncidentTable/IncidentTable";

const Content = () => {
  return (
    <Section>
      <BackRoute />
      <h2 className="text-4xl manrope font-semibold">Incidents</h2>
      <IncidentTable pagination />
    </Section>
  );
};

export default Content;
