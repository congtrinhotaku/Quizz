"use client";
import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (userId) {
      router.push("/quizzes");
    }
  }, [router]);

  return (
    <div className="text-center space-y-6">
      <h1 className="text-3xl font-bold text-white">🎯 Quiz App</h1>
      <p className="text-gray-600">
        Tham gia quiz hoặc tự tạo quiz của riêng bạn
      </p>
      <div className="space-x-4">
        <Link
          href="/login"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Đăng nhập
        </Link>
        <Link
          href="/register"
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Đăng ký
        </Link>
      </div>
    </div>
  );
}
