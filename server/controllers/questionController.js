const Question = require("../models/Question");

exports.createQuestion = async (req, res) => {
  try {
    const question = new Question(req.body);
    await question.save();
    res.status(201).json(question);
  } catch (err) {
    res.status(400).json({ message: "Tạo câu hỏi thất bại", error: err.message });
  }
};

exports.getQuestionsByQuiz = async (req, res) => {
  try {
    const questions = await Question.find({ quizId: req.params.quizId });
    res.json(questions);
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};
