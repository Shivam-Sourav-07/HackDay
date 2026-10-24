import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "UMEED | Government schemes, made simple",
  description:
    "Answer a few simple questions to find government schemes you may be eligible for.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
