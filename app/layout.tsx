import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bantay Landslide",
  description:
    "Bantay is a landslide monitoring system designed to provide early warnings and real-time data on slope stability. By utilizing sensors, data analytics, and alerts, Bantay helps communities and authorities detect potential landslides, enhancing disaster preparedness and minimizing risks to lives and property.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`antialiased`}>{children}</body>
    </html>
  );
}
