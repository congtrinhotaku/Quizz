const express = require("express");
const {
  createQuestion,
  getQuestionsByQuiz,
  updateQuestion,
  deleteQuestion
} = require("../controllers/questionController");
const verifyToken = require("../middlewares/verifyToken");

const router = express.Router();

// Thêm câu hỏi
router.post("/", verifyToken, createQuestion);

// Lấy tất cả câu hỏi của quiz
router.get("/:quizId", getQuestionsByQuiz);

// ✅ Sửa câu hỏi
router.put("/:id", verifyToken, updateQuestion);

// ✅ Xóa câu hỏi
router.delete("/:id", verifyToken, deleteQuestion);

module.exports = router;
