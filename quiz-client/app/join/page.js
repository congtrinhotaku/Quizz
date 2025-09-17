"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function JoinPage() {
  const [code, setCode] = useState("");
  const router = useRouter();

  const handleJoin = () => {
    if (code.trim()) {
      router.push(`/join/${code}`);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="bg-white p-6 rounded shadow space-y-4 w-80">
        <h1 className="text-xl font-bold text-center">🔑 Join Room</h1>
        <input
          type="text"
          placeholder="Nhập mã room (vd: ABC123)"
          className="w-full border p-2 rounded"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
        />
        <button
          onClick={handleJoin}
          className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
        >
          Tham gia
        </button>
      </div>
    </div>
  );
}
