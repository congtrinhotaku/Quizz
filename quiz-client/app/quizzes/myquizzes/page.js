"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import Link from "next/link";


export default function QuizzesPage() {
  

  const [quizzes, setQuizzes] = useState([]);
  

  const loadQuizzes = async () => {
    try {
      const userId = localStorage.getItem("userId");
      if (!userId) return;

      const res = await api.get(`/quizzes/user/${userId}`);
      setQuizzes(res.data);
    } catch (err) {
      console.error("Lỗi load quiz:", err);
    }
  };

  const handleDelete = async (id) => {
  if (!confirm("Bạn có chắc muốn xóa quiz này?")) return;

  try {
      const token = localStorage.getItem("token"); 
      await api.delete(`/quizzes/${id}`, {
        headers: {
          Authorization: `Bearer ${token}` 
        }
      });
      loadQuizzes();
    } catch (err) {
      console.error("Xóa quiz thất bại:", err);
    }
  };



  useEffect(() => {
    loadQuizzes();
  }, []);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Quiz của tôi</h1>

      <Link
        href="/quizzes/create"
        className="bg-blue-500 text-white px-4 py-2 rounded inline-block"
      >
        ➕ Tạo quiz
      </Link>

      {/* Danh sách quiz */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {quizzes.map((q) => (
          <div
            key={q._id}
            className="bg-white rounded shadow overflow-hidden flex flex-col"
          >
            {/* Ảnh quiz */}
            {q.image ? (
              <img
                src={`http://localhost:5000${q.image}`}
                alt={q.title}
                className="h-40 w-full object-cover"
              />
            ) : (
              <div className="h-40 bg-gray-200 flex items-center justify-center text-gray-500">
                Không có ảnh
              </div>
            )}

            <div className="p-4 flex-1 flex flex-col justify-between">
              <div>
                <h2 className="font-bold text-lg">{q.title}</h2>
                <p className="text-sm text-gray-600">
                  Chủ đề: {q.category?.name || "Chưa có"}
                </p>
                <p className="text-sm text-gray-600">
                  Số câu hỏi: {q.questionCount || 0}
                </p>
                <p className="text-sm text-gray-600">
                      {q.isPrivate ? "🔒 Riêng tư" : "🌍 Công khai"}
                </p>
              </div>

              <div className="flex justify-end gap-2 mt-3">
                <Link
                  href={`/quizzes/${q._id}`}
                  className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600"
                >
                  Sửa
                </Link>
                
                <button
                  onClick={() => handleDelete(q._id)}
                  className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                >
                  Xóa
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      
    </div>
  );
}
