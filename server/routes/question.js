const express = require("express");
const { createQuestion, getQuestionsByQuiz } = require("../controllers/questionController");
const verifyToken = require("../middlewares/verifyToken");

const router = express.Router();

router.post("/", verifyToken, createQuestion);
router.get("/:quizId", getQuestionsByQuiz);

module.exports = router;
