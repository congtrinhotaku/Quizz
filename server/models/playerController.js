// controllers/playerController.js
const Quiz = require("../models/Quiz");
const Player = require("../models/Player");
const GameSession = require("../models/GameSession");

// Player join quiz qua quizId/link + nickname
exports.joinQuiz = async (req, res) => {
  try {
    const { link } = req.params;   // quizId (truyền vào từ client)
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Tên người chơi là bắt buộc" });
    }

    // 1. Tìm quiz
    const quiz = await Quiz.findById(link);
    if (!quiz) return res.status(404).json({ message: "Quiz không tồn tại" });

    // 2. Tìm hoặc tạo session "waiting"
    let session = await GameSession.findOne({ quizId: quiz._id, status: "waiting" });
    if (!session) {
      session = new GameSession({ quizId: quiz._id, status: "waiting" });
      await session.save();
    }

    // 3. Tạo player gắn với session (chỉ cần name, không cần user)
    const player = new Player({
      gameSessionId: session._id,
      name
    });
    await player.save();

    // 4. Push player vào session
    session.players.push(player._id);
    await session.save();

    res.status(201).json({
      message: "Tham gia quiz thành công",
      quizId: quiz._id,
      gameSessionId: session._id,
      playerId: player._id,
      player
    });
  } catch (err) {
    console.error("joinQuiz error:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
};
