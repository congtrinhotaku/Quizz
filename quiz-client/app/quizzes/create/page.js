"use client";
import { useState, useEffect } from "react";
import api from "@/lib/api";
import { useRouter } from "next/navigation";

export default function CreateQuizPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);

  // category
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState([]);

  // câu hỏi
  const [questions, setQuestions] = useState([]);
  const [text, setText] = useState("");
  const [options, setOptions] = useState([{ value: "" }, { value: "" }]);
  const [correctAnswer, setCorrectAnswer] = useState(0);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await api.get("/categories");
        setCategories(res.data);
      } catch (err) {
        console.error("Lỗi load categories:", err);
      }
    };
    loadCategories();
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("isPrivate", isPrivate ? "true" : "false");
      formData.append("category", category);
      if (image) formData.append("image", image);

      const res = await api.post("/quizzes", formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const quiz = res.data;

      // thêm câu hỏi
      for (let q of questions) {
        await api.post(`/quizzes/${quiz._id}/questions`, q, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
      }

      alert("Tạo quiz và câu hỏi thành công!");
      router.push(`/quizzes/${quiz._id}`);
    } catch (err) {
      console.error("Lỗi tạo quiz:", err.response?.data || err.message);
      alert("Tạo quiz thất bại");
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow space-y-4">
      <h1 className="text-2xl font-bold">➕ Tạo Quiz Mới</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Upload ảnh trước */}
        <div className="w-full">
          <label className="block font-semibold mb-1">Ảnh quiz</label>
          <div
            className="w-full h-48 border-2 border-dashed rounded-lg flex items-center justify-center cursor-pointer bg-gray-50 hover:bg-gray-100"
            onClick={() => document.getElementById("quiz-image").click()}
          >
            {preview ? (
              <img
                src={preview}
                alt="Preview"
                className="h-full w-full object-cover rounded-lg"
              />
            ) : (
              <span className="text-gray-500">+ Chọn ảnh</span>
            )}
          </div>
          <input
            type="file"
            id="quiz-image"
            accept="image/*"
            className="hidden"
            onChange={handleImageChange}
          />
        </div>

        <input
          className="border p-2 w-full rounded"
          placeholder="Tên quiz..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          className="border p-2 w-full rounded"
          placeholder="Mô tả quiz..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        {/* chọn category */}
        <select
          className="border p-2 w-full rounded"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="">-- Chọn Category --</option>
          {categories.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={isPrivate}
            onChange={(e) => setIsPrivate(e.target.checked)}
          />
          <label>Quiz riêng tư</label>
        </div>

        <button
          type="submit"
          className="bg-purple-600 text-white px-4 py-2 rounded-lg font-semibold shadow hover:bg-purple-700"
        >
          ✅ Tạo Quiz
        </button>
      </form>
    </div>
  );
}
