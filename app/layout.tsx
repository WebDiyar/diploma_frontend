import type { Metadata } from "next";
import Provider from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Diploma",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Provider>{children}</Provider>
      </body>
    </html>
  );
}
