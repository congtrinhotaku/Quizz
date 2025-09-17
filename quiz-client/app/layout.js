import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata = {
  title: "Quiz App",
  description: "Quiz Realtime with Next.js + Socket.IO",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-800">
        <Navbar />
        <main className="container mx-auto px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
