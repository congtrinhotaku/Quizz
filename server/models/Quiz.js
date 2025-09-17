const mongoose = require("mongoose");

const quizSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  status: { type: String, enum: ["draft", "live", "finished"], default: "draft" },
}, { timestamps: true });

module.exports = mongoose.model("Quiz", quizSchema);
