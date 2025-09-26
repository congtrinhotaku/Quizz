const express = require("express");
const {
  createQuiz,
  getAllQuizzes,
  getQuizById,
  updateQuiz,
  updateQuizImage,   // ⚡ thêm ở đây
  deleteQuiz,
  getQuizzesByUserId,
  getByCategory,
} = require("../controllers/quizController");

const verifyToken = require("../middlewares/verifyToken");
const upload = require("../middlewares/multer");

const router = express.Router();

router.post("/", verifyToken, upload.single("image"), createQuiz);
router.get("/", getAllQuizzes);
router.get("/category/:cateCode", getByCategory);
router.get("/user/:userId", getQuizzesByUserId);
router.get("/:id", getQuizById);
router.put("/:id", verifyToken, updateQuiz);
router.put("/:id/image", upload.single("image"),verifyToken, updateQuizImage); 
router.delete("/:id", verifyToken, deleteQuiz);

module.exports = router;
