"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import Link from "next/link";

export default function QuizzesPage() {
  const [quizzes, setQuizzes] = useState([]);
  const [title, setTitle] = useState("");

  const loadQuizzes = async () => {
    try {
      const userId = localStorage.getItem("userId");
      if (!userId) return; // chưa login thì không load
      const res = await api.get(`/quizzes/user/${userId}`);
      setQuizzes(res.data);
    } catch (err) {
      console.error("Lỗi load quiz:", err);
    }
  };

  const handleCreate = async () => {
    try {
      const userId = localStorage.getItem("userId");
      if (!userId) {
        alert("Bạn cần đăng nhập!");
        return;
      }
      await api.post("/quizzes", { title, createdBy: userId });
      setTitle("");
      loadQuizzes();
    } catch (err) {
      console.error("Tạo quiz thất bại:", err);
    }
  };

  useEffect(() => {
    loadQuizzes();
  }, []);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Quiz của tôi</h1>

      <div className="flex gap-2">
        <input
          className="border p-2 rounded flex-1 bg-white"
          placeholder="Tên quiz"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <button
          onClick={handleCreate}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Tạo quiz
        </button>
      </div>

      <ul className="space-y-2">
        {quizzes.map((q) => (
          <li
            key={q._id}
            className="p-4 bg-white text-black rounded shadow flex justify-between"
          >
            <span className="font-bold">{q.title}</span>
            <Link href={`/quizzes/${q._id}`} className="text-blue-500 hover:underline">
              Chi tiết
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
