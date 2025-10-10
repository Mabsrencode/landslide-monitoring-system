import React, { ReactNode } from "react";

const Section = ({
  children,
  className,
}: {
  children?: ReactNode;
  className?: string;
}) => {
  return (
    <section className={`container mx-auto p-4 py-12 ${className}`}>
      {children}
    </section>
  );
};

export default Section;
