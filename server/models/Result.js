const mongoose = require("mongoose");

const resultSchema = new mongoose.Schema({
  roomId: { type: mongoose.Schema.Types.ObjectId, ref: "Room", required: true },
  quizId: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz", required: true },

  // Nếu là user login
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

  // Nếu là guest
  nickname: { type: String },

  score: { type: Number, default: 0 },
  answers: [
    {
      questionId: { type: mongoose.Schema.Types.ObjectId, ref: "Question" },
      selectedOption: { type: Number },
      isCorrect: { type: Boolean },
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model("Result", resultSchema);
