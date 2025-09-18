"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useParams, useRouter } from "next/navigation";

export default function QuizDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);

  const [text, setText] = useState("");
  const [options, setOptions] = useState([{ value: "" }]);
  const [correctAnswer, setCorrectAnswer] = useState(0);

  const [userId, setUserId] = useState(null);

  // 👉 Modal edit question
  const [editing, setEditing] = useState(null);
  const [editText, setEditText] = useState("");
  const [editOptions, setEditOptions] = useState([]);
  const [editCorrect, setEditCorrect] = useState(0);

  // 👉 Edit quiz info
  const [editingQuiz, setEditingQuiz] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editCate, setEditCate] = useState("");
  const [editPrivate, setEditPrivate] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_SOCKET_URL;

  useEffect(() => {
    const uid = localStorage.getItem("userId");
    setUserId(uid);
  }, []);

  const load = async () => {
    const q = await api.get(`/quizzes/${id}`);
    setQuiz(q.data);
    setEditTitle(q.data.title);
    setEditDesc(q.data.description || "");
    setEditCate(q.data.category || "");
    setEditPrivate(q.data.isPrivate || false);

    const res = await api.get(`/questions/${id}`);
    setQuestions(res.data);
  };

  const updateQuizInfo = async () => {

    await api.put(`/quizzes/${id}`, {
      title: editTitle,
      description: editDesc,
      category: editCate,
      isPrivate: editPrivate,
    }, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
      }
    });

    setEditingQuiz(false);
    load();
  };

  const updateQuizImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("image", file);
    await api.put(`/quizzes/${id}/image`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    load();
  };

  const addQuestion = async () => {
    const cleanOptions = options
      .map((o) => o.value)
      .filter((o) => o.trim() !== "");
    if (!text.trim() || cleanOptions.length < 2) {
      alert("Nhập câu hỏi và ít nhất 2 đáp án!");
      return;
    }

    await api.post("/questions", {
      quizId: id,
      text,
      options: cleanOptions,
      correctAnswer,
    });
    setText("");
    setOptions([{ value: "" }]);
    setCorrectAnswer(0);
    load();
  };

  const deleteQuestion = async (qid) => {
    if (!confirm("Bạn có chắc chắn muốn xóa câu hỏi này?")) return;
    await api.delete(`/questions/${qid}`);
    load();
  };

  const openEdit = (q) => {
    setEditing(q._id);
    setEditText(q.text);
    setEditOptions(q.options.map((o) => ({ value: o })));
    setEditCorrect(q.correctAnswer);
  };

  const saveEdit = async () => {
    const cleanOptions = editOptions
      .map((o) => o.value)
      .filter((o) => o.trim() !== "");
    if (!editText.trim() || cleanOptions.length < 2) {
      alert("Nhập câu hỏi và ít nhất 2 đáp án!");
      return;
    }

    await api.put(`/questions/${editing}`, {
      text: editText,
      options: cleanOptions,
      correctAnswer: editCorrect,
    });

    setEditing(null);
    load();
  };

  const createRoom = async () => {
    try {
      const res = await api.post("/rooms", { quiz: id });
      const room = res.data;
      router.push(`/host/${room.code}`);
    } catch (err) {
      console.error("Tạo room thất bại", err);
    }
  };
  const [categories, setCategories] = useState([]);
  
  useEffect(() => {
    load();
  }, [id]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get("/categories");
        setCategories(res.data);
      } catch (err) {
        console.error("Không thể load categories", err);
      }
    };
    fetchCategories();
  }, []);

  if (!quiz) return <p>Loading...</p>;

  if (userId && quiz.createdBy !== userId) {
    return (
      <h1 className="text-red-500 text-2xl font-bold text-center mt-10">
        ❌ Bạn không có quyền truy cập quiz này
      </h1>
    );
  }

  return (
    <div className="space-y-6">
      {/* Phần thông tin Quiz */}
      <div className="p-4 bg-white rounded-lg shadow space-y-3">
        <div className="flex items-center gap-4">
          <label>
            <img
              src={
                quiz.image
                  ? `${API_URL}${quiz.image}`
                  : "https://thumb.ac-illust.com/b1/b170870007dfa419295d949814474ab2_t.jpeg"
              }
              alt="quiz"
              className="w-32 h-32 object-cover rounded cursor-pointer border"
            />
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={updateQuizImage}
            />
          </label>
          <div className="flex-1">
            {editingQuiz ? (
              <div className="space-y-2">
                <input
                  className="border p-2 w-full rounded"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                />
                <textarea
                  className="border p-2 w-full rounded"
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                />
                <select
                  className="border p-2 w-full rounded"
                  value={editCate}
                  onChange={(e) => setEditCate(e.target.value)}
                >
                  <option value="">-- Chọn phân loại --</option>
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}> {/* ⚡ dùng _id */}
                      {c.name}
                    </option>
                  ))}
                </select>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={editPrivate}
                    onChange={(e) => setEditPrivate(e.target.checked)}
                  />
                  Quiz riêng tư (chỉ bạn chơi)
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={updateQuizInfo}
                    className="bg-blue-500 text-white px-3 py-1 rounded"
                  >
                    💾 Lưu
                  </button>
                  <button
                    onClick={() => setEditingQuiz(false)}
                    className="bg-gray-500 text-white px-3 py-1 rounded"
                  >
                    Hủy
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <h1 className="text-2xl font-bold">{quiz.title}</h1>
                <p className="text-gray-600">{quiz.description}</p>
                <p className="text-sm text-gray-500">
                  Phân loại: {quiz.category?.name || "Chưa có"} |{" "}
                  {quiz.isPrivate ? "🔒 Riêng tư" : "🌍 Công khai"}
                </p>
                <button
                  onClick={() => setEditingQuiz(true)}
                  className="bg-yellow-500 text-white px-3 py-1 rounded mt-2"
                >
                  ✏️ Sửa quiz
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 👉 Nút tạo room */}
      <button
        onClick={createRoom}
        className="bg-purple-600 text-white px-4 py-2 rounded-lg font-semibold shadow hover:bg-purple-700"
      >
        🎯 Tạo Room
      </button>

      
      {/* Form thêm câu hỏi */}
      <div className="space-y-3 p-4 border rounded-lg bg-white shadow">
        <input
          className="border p-2 w-full rounded"
          placeholder="Nhập câu hỏi..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />

        {/* Danh sách đáp án */}
        <div className="space-y-2">
          {options.map((opt, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <input
                type="radio"
                name="correct"
                checked={correctAnswer === idx}
                onChange={() => setCorrectAnswer(idx)}
              />
              <input
                className="border p-2 flex-1 rounded"
                placeholder={`Đáp án ${idx + 1}`}
                value={opt.value}
                onChange={(e) => {
                  const newOpts = [...options];
                  newOpts[idx].value = e.target.value;
                  setOptions(newOpts);
                }}
              />
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setOptions([...options, { value: "" }])}
          className="bg-green-500 text-white px-4 py-2 rounded-lg shadow hover:bg-green-600 me-3"
        >
          + Thêm câu trả lời
        </button>

        <button
          onClick={addQuestion}
          className="bg-green-500 text-white px-4 py-2 rounded-lg shadow hover:bg-green-600"
        >
          ➕ Thêm câu hỏi
        </button>
      </div>

      {/* Danh sách câu hỏi */}
      <ul className="space-y-3">
        {questions.map((q) => (
          <li
            key={q._id}
            className="p-4 bg-white rounded-lg shadow border space-y-2"
          >
            <div className="flex justify-between items-center">
              <div className="font-semibold">{q.text}</div>
              <div className="space-x-2">
                <button
                  onClick={() => openEdit(q)}
                  className="bg-yellow-500 text-white px-2 py-1 rounded"
                >
                  ✏️ Sửa
                </button>
                <button
                  onClick={() => deleteQuestion(q._id)}
                  className="bg-red-500 text-white px-2 py-1 rounded"
                >
                  ❌ Xóa
                </button>
              </div>
            </div>
            <ul className="list-disc list-inside">
              {q.options.map((opt, i) => (
                <li
                  key={i}
                  className={i === q.correctAnswer ? "text-green-600 font-bold" : ""}
                >
                  {opt}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>

      {/* Modal edit question */}
      {editing && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-lg space-y-4">
            <h2 className="text-lg font-bold">Sửa câu hỏi</h2>
            <input
              className="border p-2 w-full rounded"
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
            />
            <div className="space-y-2">
              {editOptions.map((opt, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="editCorrect"
                    checked={editCorrect === idx}
                    onChange={() => setEditCorrect(idx)}
                  />
                  <input
                    className="border p-2 flex-1 rounded"
                    value={opt.value}
                    onChange={(e) => {
                      const newOpts = [...editOptions];
                      newOpts[idx].value = e.target.value;
                      setEditOptions(newOpts);
                    }}
                  />
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setEditOptions([...editOptions, { value: "" }])}
                className="bg-green-500 text-white px-3 py-1 rounded"
              >
                + Thêm đáp án
              </button>
              <button
                onClick={saveEdit}
                className="bg-blue-500 text-white px-3 py-1 rounded"
              >
                💾 Lưu
              </button>
              <button
                onClick={() => setEditing(null)}
                className="bg-gray-500 text-white px-3 py-1 rounded"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
