"use client";
import { Toaster } from "sonner";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Toaster richColors position="top-right" />
      {children}
    </>
  );
}
