import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Clearbrief — Clarity before the contract", template: "%s · Clearbrief" },
  description: "A calm, private workspace to shape an early client conversation into a clear project brief and starting estimate.",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
