import React, { ReactNode } from "react";

const Section = ({ children }: { children?: ReactNode }) => {
  return <section className="container mx-auto p-4 py-12">{children}</section>;
};

export default Section;
