"use client"; // bắt buộc
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
   const handleUserUpdated = () => {
    const uid = localStorage.getItem("userId");
    const uname = localStorage.getItem("username");
    if (uid) setUser({ id: uid, name: uname });
  };

  window.addEventListener("userUpdated", handleUserUpdated);

  return () => window.removeEventListener("userUpdated", handleUserUpdated);
    
  }, 
  []);

  const handleLogout = () => {
    localStorage.removeItem("userId");
    localStorage.removeItem("username");
    setUser(null);
    router.push("/login");
  };

  return (
     <nav className="bg-gray-900 shadow-md">
      <div className="container mx-auto flex justify-between items-center px-4 py-3">
        <Link href="/" className="text-xl font-bold text-blue-500">
          QuizApp
        </Link>

        <div className="space-x-4 flex items-center">
          <Link href="/quizzes/myquizzes" className="hover:text-blue-400 text-white">
            My Quizzes
          </Link>
          <Link href="/join" className="hover:text-blue-400 text-white">
            Join Room
          </Link>

          {!user ? (
            <>
              <Link href="/login" className="hover:text-blue-400 text-white">
                Login
              </Link>
              <Link href="/register" className="hover:text-blue-400 text-white">
                Register
              </Link>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <span className="text-white font-medium">👤 {user.name}</span>
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
              >
                Đăng xuất
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
