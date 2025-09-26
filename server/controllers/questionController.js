const Question = require("../models/Question");

// Tạo câu hỏi
exports.createQuestion = async (req, res) => {
  try {
    const question = new Question(req.body);
    await question.save();
    res.status(201).json(question);
  } catch (err) {
    res.status(400).json({ message: "Tạo câu hỏi thất bại", error: err.message });
  }
};

// Lấy danh sách câu hỏi theo quiz
exports.getQuestionsByQuiz = async (req, res) => {
  try {
    const questions = await Question.find({ quizId: req.params.quizId });
    res.json(questions);
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

// ✅ Cập nhật câu hỏi
exports.updateQuestion = async (req, res) => {
  try {
    const question = await Question.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!question) return res.status(404).json({ message: "Câu hỏi không tồn tại" });
    res.json(question);
  } catch (err) {
    res.status(400).json({ message: "Cập nhật thất bại", error: err.message });
  }
};

// ✅ Xóa câu hỏi
exports.deleteQuestion = async (req, res) => {
  try {
    const question = await Question.findByIdAndDelete(req.params.id);
    if (!question) return res.status(404).json({ message: "Câu hỏi không tồn tại" });
    res.json({ message: "Xóa câu hỏi thành công" });
  } catch (err) {
    res.status(400).json({ message: "Xóa thất bại", error: err.message });
  }
};


