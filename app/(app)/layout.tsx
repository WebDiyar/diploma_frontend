"use client";
import { usePathname } from "next/navigation";
import Footer from "@/components/shared/Footer";
import NavBar from "@/components/shared/NavBar";

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();

  const hideLayout = pathname === "/addProfile";

  return (
    <div>
      {!hideLayout && <NavBar />}
      {children}
      {!hideLayout && <Footer />}
    </div>
  );
}
