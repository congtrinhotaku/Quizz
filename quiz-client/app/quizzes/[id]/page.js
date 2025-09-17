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

  // 👉 State cho các đáp án
  const [options, setOptions] = useState([{ value: "" }]);
  const [correctAnswer, setCorrectAnswer] = useState(0);

  // 👉 userId lấy từ localStorage
  const [userId, setUserId] = useState(null);

  // 👉 Modal edit
  const [editing, setEditing] = useState(null); // question đang edit
  const [editText, setEditText] = useState("");
  const [editOptions, setEditOptions] = useState([]);
  const [editCorrect, setEditCorrect] = useState(0);

  useEffect(() => {
    const uid = localStorage.getItem("userId");
    setUserId(uid);
  }, []);

  const load = async () => {
    const q = await api.get(`/quizzes/${id}`);
    setQuiz(q.data);
    const res = await api.get(`/questions/${id}`);
    setQuestions(res.data);
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

  useEffect(() => {
    load();
  }, [id]);

  if (!quiz) return <p>Loading...</p>;

  // 👉 chỉ render thông báo khi đã có userId
  if (userId && quiz.createdBy !== userId) {
    return (
      <h1 className="text-red-500 text-2xl font-bold text-center mt-10">
        ❌ Bạn không có quyền truy cập quiz này
      </h1>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Quiz: {quiz.title}</h1>

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

      {/* Modal edit */}
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
