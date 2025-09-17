"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [msg, setMsg] = useState("");
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/auth/login", form);

      // lưu token và user info vào localStorage
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("userId", res.data.user._id);
      localStorage.setItem("username", res.data.user.username);
      window.dispatchEvent(new Event("storage"));
      setMsg("Đăng nhập thành công!");
      router.push("/quizzes");
    } catch (err) {
      setMsg("Sai email hoặc mật khẩu");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-dark">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded shadow w-96 space-y-4"
      >
        <h1 className="text-xl font-bold text-center">Đăng nhập</h1>

        <input
          type="email"
          placeholder="Email"
          className="w-full border p-2 rounded"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />

        <input
          type="password"
          placeholder="Mật khẩu"
          className="w-full border p-2 rounded"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />

        <button
          type="submit"
          className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded"
        >
          Đăng nhập
        </button>

        {msg && <p className="text-center text-sm text-red-500">{msg}</p>}
      </form>
    </div>
  );
}
