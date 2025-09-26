const jwt = require('jsonwebtoken');

// Middleware kiểm tra đăng nhập
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Không có token, vui lòng đăng nhập' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // lưu thông tin user vào req
    next();
  } catch (err) {
    return res.status(403).json({ message: 'Token không hợp lệ hoặc đã hết hạn' });
  }
};

// Middleware kiểm tra role (tuỳ chọn)
const authorizeRole = (role) => {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: 'Chưa đăng nhập' });
    if (req.user.role !== role)
      return res.status(403).json({ message: 'Bạn không có quyền truy cập' });
    next();
  };
};

module.exports = {
  authenticate,
  authorizeRole
};
