import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Checky — AP Style Validator",
  description:
    "ChatGPT-like editor with an AP-adjacent style validator and configurable rules."
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
