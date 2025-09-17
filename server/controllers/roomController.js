const Room = require("../models/Room");

exports.createRoom = async (req, res) => {
  try {
    const { quiz } = req.body;
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const room = new Room({ code, host: req.user.id, quiz });
    await room.save();
    res.status(201).json(room);
  } catch (err) {
    res.status(400).json({ message: "Tạo room thất bại", error: err.message });
  }
};

exports.getRoom = async (req, res) => {
  try {
    const room = await Room.findOne({ code: req.params.code }).populate("quiz");
    if (!room) return res.status(404).json({ message: "Room không tồn tại" });
    res.json(room);
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};
