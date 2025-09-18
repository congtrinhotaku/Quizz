"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";

export default function CategoryPage() {
  const { code } = useParams(); // <--- dynamic segment
  const cateCode = code;        // nếu muốn giữ tên cũ
  const router = useRouter();

  const [categoryName, setCategoryName] = useState("");
  const [quizzes, setQuizzes] = useState([]);

  const loadQuizzes = async () => {
    try {
      console.log("cateCode:", cateCode);
      const res = await api.get(`/quizzes/category/${cateCode}`);
      const data = res.data;
      setQuizzes(data);
      if (data.length > 0) setCategoryName(data[0].category?.name || "Chưa phân loại");
    } catch (err) {
      console.error("Lỗi load quizzes theo category:", err);
    }
  };

  useEffect(() => {
    if (cateCode) loadQuizzes();
  }, [cateCode]);

  return (
    <div className="px-4 py-6 space-y-6">
      <h1 className="text-3xl font-bold text-center">
        Quiz: {categoryName}
      </h1>

      {quizzes.length === 0 ? (
        <p className="text-center text-gray-500">Chưa có quiz trong danh mục này</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {quizzes.map((q) => (
            <div key={q._id} className="bg-white rounded shadow overflow-hidden flex flex-col">
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
                  onClick={async () => {
                    try {
                      const res = await api.post("/rooms", { quiz: q._id });
                      router.push(`/host/${res.data.code}`);
                    } catch (err) {
                      console.error("Tạo room thất bại", err);
                    }
                  }}
                  className="bg-purple-500 text-white px-2 py-1 rounded hover:bg-purple-600 mt-3"
                >
                  Chơi ngay
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
