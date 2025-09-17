const express = require("express");
const {
  createQuiz,
  getAllQuizzes,
  getQuizById,
  updateQuiz,
  deleteQuiz,
  getQuizzesByUserId, // 👈 thêm vào
} = require("../controllers/quizController");
const verifyToken = require("../middlewares/verifyToken");

const router = express.Router();

router.post("/", verifyToken, createQuiz);
router.get("/", getAllQuizzes);
router.get("/user/:userId", getQuizzesByUserId); // 👈 route mới
router.get("/:id", getQuizById);
router.put("/:id", verifyToken, updateQuiz);
router.delete("/:id", verifyToken, deleteQuiz);

module.exports = router;
