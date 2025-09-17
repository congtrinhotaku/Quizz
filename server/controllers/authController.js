const User = require("../models/User");
const jwt = require("jsonwebtoken");

exports.registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const newUser = new User({ username, email, password });
    await newUser.save();
    res.status(201).json({ message: "Đăng ký thành công" });
  } catch (err) {
    res.status(400).json({ message: "Đăng ký thất bại", error: err.message });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Sai email hoặc mật khẩu" });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).json({ message: "Sai email hoặc mật khẩu" });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: "1d"
    });

    res.json({ message: "Đăng nhập thành công", token, user });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};
