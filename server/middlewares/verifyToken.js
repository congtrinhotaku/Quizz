const jwt = require("jsonwebtoken");

function verifyToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  if (!authHeader) return res.status(401).json({ message: "Không có token" });

  const token = authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Token không hợp lệ" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, role }
    next();
  } catch (err) {
    res.status(403).json({ message: "Token không hợp lệ hoặc hết hạn" });
  }
}

module.exports = verifyToken;
