import "./globals.css";
import ClientLayout from "./ClientLayout";

export const metadata = {
  title: "QuizApp",
  description: "Ứng dụng tạo và chơi quiz",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-800 min-h-screen">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
