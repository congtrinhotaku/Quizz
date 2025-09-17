// server/socket.js
const { Server } = require("socket.io");
const Question = require("./models/Question"); // your Mongoose model

function setupSocket(server) {
  const io = new Server(server, { cors: { origin: "*" } });

  // rooms state on server
  // rooms[roomCode] = {
  //   quizId, questions: [], players: { socketId: { socketId, nickname, score, answered: {} } },
  //   timePerQuestion, currentQuestionIndex, timer (Node timeout id), startedAt
  // }
  const rooms = {};

  function clearRoomTimer(room) {
    if (!room) return;
    if (room.timer) {
      clearTimeout(room.timer);
      room.timer = null;
    }
  }

  function emitShowQuestion(io, roomCode, index) {
    const room = rooms[roomCode];
    if (!room) return;
    const q = room.questions[index];
    if (!q) return;

    room.currentQuestionIndex = index;
    room.startedAt = Date.now();

    // clear any previous timer just in case
    clearRoomTimer(room);

    io.to(roomCode).emit("showQuestion", {
      index,
      question: {
        _id: q._id,
        text: q.text,
        options: q.options,
      },
      timePerQuestion: room.timePerQuestion,
      startedAt: room.startedAt,
    });

    // server-side timer: after timePerQuestion seconds, reveal and then advance (3s reveal delay built-in)
    room.timer = setTimeout(() => {
      revealAndAdvance(io, roomCode, index);
    }, room.timePerQuestion * 1000);
  }

  function revealAndAdvance(io, roomCode, questionIndex) {
    const room = rooms[roomCode];
    if (!room) return;

    // avoid double reveal if already revealed and advanced
    if (room.lastRevealedIndex === questionIndex) return;
    room.lastRevealedIndex = questionIndex;

    const question = room.questions[questionIndex];
    if (!question) return;

    // emit revealAnswer to all clients (include questionIndex so clients know which question)
    io.to(roomCode).emit("revealAnswer", {
      questionIndex,
      correctIndex: question.answer,
    });

    // wait 3s then advance or end
    setTimeout(() => {
      const next = questionIndex + 1;
      if (room.questions[next]) {
        emitShowQuestion(io, roomCode, next);
      } else {
        // end quiz
        clearRoomTimer(room);
        const results = Object.values(room.players || {}).map((p) => ({
          socketId: p.socketId,
          nickname: p.nickname,
          score: p.score || 0,
        }));
        results.sort((a, b) => b.score - a.score);
        io.to(roomCode).emit("quizEnded", { results });
      }
    }, 3000);
  }

  io.on("connection", (socket) => {
    console.log("⚡ client connected:", socket.id);

    socket.on("joinRoom", ({ roomCode, nickname }) => {
      if (!roomCode) return;
      socket.join(roomCode);

      if (!rooms[roomCode]) {
        rooms[roomCode] = {
          quizId: null,
          questions: [],
          players: {},
          timePerQuestion: 15,
          currentQuestionIndex: -1,
          timer: null,
          startedAt: null,
        };
      }

      rooms[roomCode].players[socket.id] = {
        socketId: socket.id,
        nickname: nickname || `Player-${socket.id.substring(0, 4)}`,
        score: 0,
        answered: {}, // track answered per questionId to avoid double scoring
      };

      // broadcast updated player list
      io.to(roomCode).emit("updatePlayers", {
        players: Object.values(rooms[roomCode].players),
      });
    });

    socket.on("startQuiz", async ({ roomCode, timePerQuestion, quizId }) => {
      const room = rooms[roomCode];
      if (!room) return;

      room.quizId = quizId || room.quizId;
      room.timePerQuestion = Number(timePerQuestion) || room.timePerQuestion || 15;

      // load questions from DB
      try {
        const questions = await Question.find({ quizId: room.quizId }).lean();
        room.questions = (questions || []).map((q) => ({
          _id: q._id.toString(),
          text: q.text,
          options: q.options,
          answer: q.correctAnswer,
        }));
      } catch (err) {
        console.error("Failed to load questions:", err);
        room.questions = [];
      }

      // reset players' scores / answered history
      Object.values(room.players).forEach((p) => {
        p.score = 0;
        p.answered = {};
      });

      io.to(roomCode).emit("quizStarted", {
        questions: room.questions,
        timePerQuestion: room.timePerQuestion,
      });

      // start with question 0 if exists
      if (room.questions.length > 0) {
        emitShowQuestion(io, roomCode, 0);
      } else {
        io.to(roomCode).emit("quizEnded", { results: [] });
      }
    });

    // player submit answer
    socket.on("submitAnswer", ({ roomCode, questionId, selectedOption }) => {
      const room = rooms[roomCode];
      if (!room) return;

      const player = room.players[socket.id];
      if (!player) return;

      // only accept answers for the current question
      const currentIdx = room.currentQuestionIndex;
      const currentQ = room.questions[currentIdx];
      if (!currentQ || currentQ._id !== questionId) {
        // ignore or send feedback
        socket.emit("answerSaved", { ok: false, reason: "not_current_question" });
        return;
      }

      // avoid double scoring
      if (player.answered && player.answered[questionId] !== undefined) {
        socket.emit("answerSaved", { ok: false, reason: "already_answered" });
        return;
      }

      player.answered = player.answered || {};
      player.answered[questionId] = selectedOption;

      const isCorrect = currentQ.answer === selectedOption;
      if (isCorrect) {
        player.score = (player.score || 0) + 10;
      }

      socket.emit("answerSaved", { questionId, isCorrect });

      // broadcast updated scores
      io.to(roomCode).emit("updatePlayers", {
        players: Object.values(room.players),
      });
    });

    // allow host to force reveal early (server still controls the rest)
    socket.on("forceReveal", ({ roomCode }) => {
      const room = rooms[roomCode];
      if (!room) return;
      const index = room.currentQuestionIndex;
      if (index < 0) return;

      // cancel scheduled timer and reveal immediately
      clearRoomTimer(room);
      revealAndAdvance(io, roomCode, index);
    });

    socket.on("endQuiz", ({ roomCode }) => {
      const room = rooms[roomCode];
      if (!room) return;
      clearRoomTimer(room);
      const results = Object.values(room.players || {}).map((p) => ({
        socketId: p.socketId,
        nickname: p.nickname,
        score: p.score || 0,
      }));
      results.sort((a, b) => b.score - a.score);
      io.to(roomCode).emit("quizEnded", { results });
    });

    socket.on("disconnect", () => {
      // remove player from all rooms they were in
      for (const code in rooms) {
        const r = rooms[code];
        if (r.players && r.players[socket.id]) {
          delete r.players[socket.id];
          io.to(code).emit("updatePlayers", {
            players: Object.values(r.players),
          });
        }
      }
      console.log("client disconnected:", socket.id);
    });
  });

  return io;
}

module.exports = setupSocket;
