const mongoose = require("mongoose");

const quizSchema = new mongoose.Schema({
  title: { type: String, required: true },
  image: { type: String },
  description: { type: String },
  category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  status: { type: String, enum: ["draft", "live", "finished"], default: "draft" },
  isPrivate: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model("Quiz", quizSchema);
