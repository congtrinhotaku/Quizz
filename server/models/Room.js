const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true }, // mã room (vd: 6 ký tự)
  host: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  quiz: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz", required: true },
  players: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  guestPlayers: [
    {
      socketId: { type: String }, // để track guest theo socket
      nickname: { type: String, required: true }, // tên hiển thị
      score: { type: Number, default: 0 },
    }
  ],
  status: { type: String, enum: ["waiting", "in-progress", "finished"], default: "waiting" }
}, { timestamps: true });

module.exports = mongoose.model("Room", roomSchema);
