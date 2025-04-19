import Footer from "@/components/shared/Footer";
import NavBar from "@/components/shared/NavBar";

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div>
      <NavBar />
      {children}
      <Footer />
    </div>
  );
}
