const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
  quizId: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz", required: true },
  text: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctAnswer: { type: Number, required: true }, // index của đáp án đúng
}, { timestamps: true });

module.exports = mongoose.model("Question", questionSchema);
