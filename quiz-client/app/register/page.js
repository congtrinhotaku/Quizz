"use client";
import { useState } from "react";
import api from "@/lib/api";

export default function RegisterPage() {
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [msg, setMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/auth/register", form);
      setMsg("Đăng ký thành công! Hãy đăng nhập.");
    } catch (err) {
      setMsg("Đăng ký thất bại");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow w-96 space-y-4">
        <h1 className="text-xl font-bold">Đăng ký</h1>
        <input placeholder="Username" className="w-full border p-2 rounded"
          value={form.username} onChange={e => setForm({ ...form, username: e.target.value })}/>
        <input type="email" placeholder="Email" className="w-full border p-2 rounded"
          value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}/>
        <input type="password" placeholder="Mật khẩu" className="w-full border p-2 rounded"
          value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}/>
        <button className="w-full bg-green-500 text-white py-2 rounded">Đăng ký</button>
        {msg && <p className="text-center text-sm text-red-500">{msg}</p>}
      </form>
    </div>
  );
}
