"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [quizzesByCategory, setQuizzesByCategory] = useState({});

  // Load tất cả category
  const loadCategories = async () => {
    try {
      const res = await api.get("/categories");
      setCategories(res.data);
    } catch (err) {
      console.error("Lỗi load categories:", err);
    }
  };

  // Load tất cả quiz theo category
  const loadQuizzes = async () => {
    try {
      const grouped = {};
      for (let cat of categories) {
        const res = await api.get(`/quizzes/category/${cat.code}`);
        grouped[cat.name] = res.data;
      }
      setQuizzesByCategory(grouped);
    } catch (err) {
      console.error("Lỗi load quizzes:", err);
    }
  };

  const createRoom = async (quizId) => {
    try {
      const res = await api.post("/rooms", { quiz: quizId });
      const room = res.data;
      router.push(`/host/${room.code}`);
    } catch (err) {
      console.error("Tạo room thất bại", err);
    }
  };

  useEffect(() => {
    const init = async () => {
      await loadCategories();
    };
    init();
  }, []);

  // Khi categories thay đổi, load quizzes
  useEffect(() => {
    if (categories.length > 0) loadQuizzes();
  }, [categories]);

  return (
    <div className="space-y-8 px-4 py-6">
      <h1 className="text-3xl font-bold text-center">Trang Chủ QuizApp</h1>

      {categories.map((cat) => {
        const quizzes = quizzesByCategory[cat.name] || [];
        if (quizzes.length === 0) return null;

        return (
          <div key={cat._id} className="space-y-3">
            <h2 className="text-2xl font-semibold text-white">{cat.name}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {quizzes.slice(0, 3).map((q) => (
                <div
                  key={q._id}
                  className="bg-white rounded shadow overflow-hidden flex flex-col"
                >
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
                      <h3 className="font-bold text-lg">{q.title}</h3>
                      <p className="text-sm text-gray-600">
                        Số câu hỏi: {q.questionCount || 0}
                      </p>
                      <p className="text-sm text-gray-600">
                        {q.isPrivate ? "🔒 Riêng tư" : "🌍 Công khai"}
                      </p>
                    </div>

                    <button
                      onClick={() => createRoom(q._id)}
                      className="bg-purple-500 text-white px-2 py-1 rounded hover:bg-purple-600 mt-3"
                    >
                      Chơi ngay
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {quizzes.length > 3 && (
              <button
                onClick={() => router.push(`/category/${cat.code}`)}
                className="text-blue-500 hover:underline mt-2"
              >
                Xem thêm...
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
