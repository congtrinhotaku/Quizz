"use client";
import Navbar from "@/components/Navbar";

export default function ClientLayout({ children }) {
  return (
    <>
      <Navbar />
      <main className="container mx-auto px-4 py-6">{children}</main>
    </>
  );
}
