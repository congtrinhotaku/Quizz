"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import Link from "next/link";

export default function QuizzesPage() {
  const [quizzes, setQuizzes] = useState([]);
  const [title, setTitle] = useState("");
  const [editQuiz, setEditQuiz] = useState(null); // quiz đang sửa
  const [editTitle, setEditTitle] = useState("");

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

  const handleDelete = async (id) => {
    if (!confirm("Bạn có chắc muốn xóa quiz này?")) return;
    try {
      await api.delete(`/quizzes/${id}`);
      loadQuizzes();
    } catch (err) {
      console.error("Xóa quiz thất bại:", err);
    }
  };

  const handleEdit = (quiz) => {
    setEditQuiz(quiz);
    setEditTitle(quiz.title);
  };

  const handleUpdate = async () => {
    try {
      await api.put(`/quizzes/${editQuiz._id}`, { title: editTitle });
      setEditQuiz(null);
      setEditTitle("");
      loadQuizzes();
    } catch (err) {
      console.error("Cập nhật quiz thất bại:", err);
    }
  };

  useEffect(() => {
    loadQuizzes();
  }, []);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Quiz của tôi</h1>

      {/* Form tạo quiz */}
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

      {/* Danh sách quiz */}
      <ul className="space-y-2">
        {quizzes.map((q) => (
          <li
            key={q._id}
            className="p-4 bg-white text-black rounded shadow flex justify-between items-center"
          >
            <span className="font-bold">{q.title}</span>
            <div className="space-x-2">
              <Link
                href={`/quizzes/${q._id}`}
                className="bg-blue-500 text-white px-2 py-2 rounded hover:bg-yellow-600"
              >
                Chi tiết
              </Link>
              <button
                onClick={() => handleEdit(q)}
                className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600"
              >
                Sửa
              </button>
              <button
                onClick={() => handleDelete(q._id)}
                className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
              >
                Xóa
              </button>
            </div>
          </li>
        ))}
      </ul>

      {/* Modal sửa quiz */}
      {editQuiz && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded shadow-lg w-96 space-y-4">
            <h2 className="text-lg font-bold">Sửa Quiz</h2>
            <input
              className="border p-2 w-full rounded"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setEditQuiz(null)}
                className="bg-gray-300 px-3 py-1 rounded"
              >
                Hủy
              </button>
              <button
                onClick={handleUpdate}
                className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
              >
                Lưu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
