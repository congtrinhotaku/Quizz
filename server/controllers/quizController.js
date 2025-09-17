const Quiz = require("../models/Quiz");

exports.createQuiz = async (req, res) => {
  try {
    const quiz = new Quiz({ ...req.body, createdBy: req.user.id });
    await quiz.save();
    res.status(201).json(quiz);
  } catch (err) {
    res.status(400).json({ message: "Tạo quiz thất bại", error: err.message });
  }
};

exports.getAllQuizzes = async (req, res) => {
  try {
    const quizzes = await Quiz.find().populate("createdBy", "username email");
    res.json(quizzes);
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};
exports.getQuizzesByUserId = async (req, res) => {
  try {
    const userId = req.params.userId;
    const quizzes = await Quiz.find({ createdBy: userId })
      .populate("createdBy", "username email");

    res.json(quizzes);
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};
exports.getQuizById = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ message: "Quiz không tồn tại" });
    res.json(quiz);
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

exports.updateQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(quiz);
  } catch (err) {
    res.status(400).json({ message: "Cập nhật quiz thất bại", error: err.message });
  }
};

exports.deleteQuiz = async (req, res) => {
  try {
    await Quiz.findByIdAndDelete(req.params.id);
    res.json({ message: "Xóa quiz thành công" });
  } catch (err) {
    res.status(400).json({ message: "Xóa quiz thất bại", error: err.message });
  }
};
