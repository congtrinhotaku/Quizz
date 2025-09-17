"use client";
import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import socket from "@/lib/socket";

export default function JoinRoomPage() {
  const { code } = useParams();
  const [nickname, setNickname] = useState("");
  const [joined, setJoined] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [locked, setLocked] = useState(false);
  const [reveal, setReveal] = useState({});
  const [ranking, setRanking] = useState([]);
  const intervalRef = useRef(null);
  const startedAtRef = useRef(null);

  useEffect(() => {
    socket.connect();

    socket.on("showQuestion", ({ question, timePerQuestion, startedAt, index }) => {
      setCurrentQuestion({ ...question, timePerQuestion, index });
      setLocked(false);
      setReveal({});
      startedAtRef.current = startedAt || Date.now();
      startClientTimer(timePerQuestion || 20, startedAtRef.current);
    });

    socket.on("revealAnswer", ({ questionIndex, correctIndex }) => {
      setReveal({ questionIndex, correctIndex });
      stopClientTimer();
      setTimeLeft(0);
      setLocked(true); // lock after reveal
    });

    socket.on("updatePlayers", (data) => {
      // optional: update a local scoreboard if needed
      // console.log("players updated", data.players);
    });

    socket.on("quizEnded", (data) => {
      stopClientTimer();
      const results = (data.results || []).sort((a, b) => b.score - a.score);
      setRanking(results);
    });

    return () => {
      stopClientTimer();
      socket.disconnect();
    };
  }, [code]);

  function startClientTimer(sec, startedAt) {
    stopClientTimer();
    function tick() {
      const elapsed = Math.floor((Date.now() - startedAt) / 1000);
      const left = Math.max(0, sec - elapsed);
      setTimeLeft(left);
      if (left <= 0) {
        stopClientTimer();
        setLocked(true);
      }
    }
    tick();
    intervalRef.current = setInterval(tick, 300);
  }

  function stopClientTimer() {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }

  function handleJoin() {
    if (!nickname.trim()) return alert("Nhập tên để tham gia");
    socket.emit("joinRoom", { roomCode: code, nickname });
    setJoined(true);
  }

  function handleSelectOption(idx) {
    if (locked || !currentQuestion) return;
    setLocked(true);
    setReveal((prev) => ({ ...prev, selectedIndex: idx }));
    socket.emit("submitAnswer", {
      roomCode: code,
      questionId: currentQuestion._id,
      selectedOption: idx,
      nickname,
    });
  }

  if (ranking.length > 0) {
    return (
      <div className="max-w-2xl mx-auto bg-white rounded-xl p-6 shadow text-black">
        <h2 className="text-2xl font-bold mb-4">Kết quả cuối</h2>
        <ol className="list-decimal pl-6 space-y-2">
          {ranking.map((r, i) => (
            <li key={i} className="flex justify-between">
              <span>{r.nickname}</span>
              <span>{r.score} pts</span>
            </li>
          ))}
        </ol>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 text-black">
      <div className="bg-white rounded-xl p-6 shadow">
        <h1 className="text-2xl font-bold">Join Room — {code}</h1>

        {!joined ? (
          <div className="mt-4 space-y-3">
            <input
              className="w-full border p-2 rounded"
              placeholder="Tên hiển thị"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
            />
            <button onClick={handleJoin} className="w-full bg-blue-600 text-white py-2 rounded">
              Tham gia
            </button>
          </div>
        ) : currentQuestion ? (
          <div className="mt-4 text-black">
            <div className="flex justify-between">
              <div className="text-lg font-semibold">{currentQuestion.text}</div>
              <div className="font-mono text-xl">{timeLeft}s</div>
            </div>
            <div className="mt-3 space-y-2">
              {currentQuestion.options.map((opt, i) => {
                let classes = "block w-full text-left border p-3 rounded";
                if (reveal?.correctIndex !== undefined && reveal.questionIndex === currentQuestion.index) {
                  if (i === reveal.correctIndex) classes += " bg-green-100 border-green-400";
                  if (i === reveal.selectedIndex && reveal.selectedIndex !== reveal.correctIndex)
                    classes += " bg-red-100 border-red-400";
                } else if (reveal?.selectedIndex === i) {
                  classes += " bg-gray-100";
                }
                return (
                  <button key={i} onClick={() => handleSelectOption(i)} disabled={locked} className={classes}>
                    {String.fromCharCode(65 + i)}. {opt}
                  </button>
                );
              })}
            </div>

            <div className="h-2 bg-gray-200 rounded mt-4 overflow-hidden">
              <div
                style={{
                  width: `${(timeLeft / (currentQuestion?.timePerQuestion || 20)) * 100}%`,
                }}
                className="h-full bg-blue-500 transition-all"
              />
            </div>
          </div>
        ) : (
          <p className="mt-4 text-gray-500">Chưa có câu hỏi - chờ host phát.</p>
        )}
      </div>
    </div>
  );
}
