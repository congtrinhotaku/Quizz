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
      <h1 className="text-2xl font-bold">Quiz: {quiz.title}</h1>

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
            <div className="font-semibold">{q.text}</div>
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
    </div>
  );
}
