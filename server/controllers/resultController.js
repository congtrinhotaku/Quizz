const Result = require("../models/Result");

exports.getResultsByRoom = async (req, res) => {
  try {
    const results = await Result.find({ roomId: req.params.roomId }).populate("userId", "username email");
    res.json(results);
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};
