"use client";
import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import socket from "@/lib/socket";
import api from "@/lib/api";

export default function HostRoomPage() {
  const { code } = useParams();
  const [room, setRoom] = useState(null);
  const [players, setPlayers] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [timePerQuestion, setTimePerQuestion] = useState(20);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    api.get(`/rooms/${code}`).then((res) => setRoom(res.data));
  }, [code]);

  useEffect(() => {
    socket.connect();
    socket.emit("joinRoom", { roomCode: code });

    socket.on("playerJoined", (data) => {
      updatePlayers(data.players);
    });

    socket.on("quizStarted", ({ questions, timePerQuestion }) => {
      setQuestions(questions || []);
      setIsRunning(true);
      setCurrentIndex(0);
      startQuestionTimer(timePerQuestion);
    });

    socket.on("showQuestion", ({ index, question, timePerQuestion }) => {
      setCurrentIndex(index);
      setShowAnswer(false);
      setQuestions((prev) => {
        const copy = [...prev];
        copy[index] = question;
        return copy;
      });
      startQuestionTimer(timePerQuestion);
    });


    socket.on("updatePlayers", (data) => {
      updatePlayers(data.players);
    });

    socket.on("quizEnded", (data) => {
      setIsRunning(false);
      stopTimer();
      const results = (data.results || []).sort((a, b) => b.score - a.score);
    
    });

    return () => socket.disconnect();
  }, [code]);

  function updatePlayers(list = []) {
    const normalized = list.map((p) => ({
      id: p.userId || p.socketId,
      name: p.nickname,
      score: p.score || 0,
    }));
    normalized.sort((a, b) => b.score - a.score);
    setPlayers(normalized);
  }

  function startQuestionTimer(sec) {
    stopTimer();
    setTimeLeft(sec);
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setShowAnswer(true);

          socket.emit("revealAnswer", {
            roomCode: code,
            questionIndex: currentIndex,
          });

          setTimeout(() => {
            autoNextAfterAnswer();
          }, 3000);

          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }

  function autoNextAfterAnswer() {
    if (!questions.length) return;
    const next = currentIndex + 1;
    if (next >= questions.length) {
      handleEnd();
    } else {
      socket.emit("hostShowQuestion", {
        roomCode: code,
        index: next,
        question: questions[next],
        timePerQuestion,
      });
    }
  }

  function stopTimer() {
    if (timerRef.current) clearInterval(timerRef.current);
  }

  function handleStart() {
    if (!room?.quiz?._id) {
      alert("Không tìm thấy quizId!");
      return;
    }
    socket.emit("startQuiz", {
      roomCode: code,
      timePerQuestion,
      quizId: room.quiz._id,
    });
  }

  function handleEnd() {
    socket.emit("endQuiz", { roomCode: code });
    setIsRunning(false);
    stopTimer();
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Host Room — {code}</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-black">
        <div className="col-span-1 bg-white rounded-xl p-4 shadow">
          <h2 className="font-semibold mb-2">Control panel</h2>
          <input
            type="number"
            value={timePerQuestion}
            min={5}
            onChange={(e) => setTimePerQuestion(Number(e.target.value))}
            className="w-full border p-2 rounded mb-3"
          />
          <div className="flex gap-2">
            <button
              onClick={handleStart}
              disabled={isRunning}
              className="flex-1 bg-green-600 text-white py-2 rounded"
            >
              Bắt đầu
            </button>
            <button
              onClick={handleEnd}
              className="bg-red-600 text-white py-2 px-3 rounded"
            >
              Kết thúc
            </button>
          </div>
        </div>

        <div className="col-span-2 bg-white rounded-xl p-4 shadow">
          {currentIndex >= 0 && questions[currentIndex] ? (
            <>
              <div className="flex justify-between">
                <div>
                  <div className="text-lg font-bold">
                    {questions[currentIndex].text}
                  </div>
                  <div className="text-sm text-gray-500">
                    Câu {currentIndex + 1}/{questions.length}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm">Thời gian</div>
                  <div className="text-2xl">{timeLeft}s</div>
                </div>
              </div>
              <div className="mt-3 space-y-2">
                {questions[currentIndex].options.map((opt, i) => {
                  const isCorrect =
                    i === questions[currentIndex].answer && showAnswer;
                  return (
                    <div
                      key={i}
                      className={`border rounded p-2 ${
                        isCorrect ? "bg-green-200" : ""
                      }`}
                    >
                      {String.fromCharCode(65 + i)}. {opt}
                    </div>
                  );
                })}
              </div>
              <div className="h-2 bg-gray-200 rounded mt-3 overflow-hidden">
                <div
                  style={{ width: `${(timeLeft / timePerQuestion) * 100}%` }}
                  className="h-full bg-green-500"
                ></div>
              </div>
            </>
          ) : (
            <p className="text-gray-500">Chưa có câu hỏi</p>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl p-4 shadow text-black">
        <h3 className="font-semibold">Người chơi ({players.length})</h3>
        <ul className="mt-2 space-y-1">
          {players.map((p, i) => (
            <li key={i} className="flex justify-between border p-2 rounded">
              <span>{p.name}</span>
              <span>{p.score ?? 0} pts</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
