const Quiz = require("../models/Quiz");
const Question = require("../models/Question");
const Category = require("../models/Category");
const Room = require("../models/Room");
const mongoose = require("mongoose");


exports.createQuiz = async (req, res) => {
  try {
    const { title, description, category, status, isPrivate } = req.body;

    // Nếu có file upload thì gán vào image
    let imagePath = null;
    if (req.file) {
      imagePath = "/uploads/" + req.file.filename; // lưu path để client truy cập
    }

    const quiz = new Quiz({
      title,
      description,
      category,
      status,
      isPrivate,
      image: imagePath,
      createdBy: req.user.id,
    });

    await quiz.save();
    res.status(201).json(quiz);
  } catch (err) {
    res.status(400).json({ message: "Tạo quiz thất bại", error: err.message });
  }
};

exports.getAllQuizzes = async (req, res) => {
  try {
    // Lấy tất cả quiz công khai
    const quizzes = await Quiz.find({ isPrivate: { $eq: false } })
      .populate("createdBy", "username email")
      .populate("category", "name")
      .lean();

    // Thêm questionCount và roomCount
    for (let quiz of quizzes) {
      const countQuestions = await Question.countDocuments({ quizId: quiz._id });
      const countRooms = await Room.countDocuments({ quiz: quiz._id }); // <-- đếm số room
      quiz.questionCount = countQuestions;
      quiz.roomCount = countRooms;
    }

    // Sort theo số room giảm dần
    quizzes.sort((a, b) => b.roomCount - a.roomCount);

    res.json(quizzes);
  } catch (err) {
    console.error("❌ Lỗi getAllQuizzes:", err);
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

exports.getByCategory = async (req, res) => {
  try {
    const { cateCode } = req.params;

    // Tìm category theo code
    const cate = await Category.findOne({ code: cateCode.toLowerCase() });
    if (!cate) return res.status(404).json({ message: "Category không tồn tại" });

    // Lấy quiz thuộc category này và chỉ lấy public
    const quizzes = await Quiz.find({ category: cate._id, isPrivate: false })
      .populate("createdBy", "username email")
      .lean();

    // Thêm questionCount cho từng quiz
    for (let quiz of quizzes) {
      const count = await Question.countDocuments({ quizId: quiz._id });
      quiz.questionCount = count;
    }

    res.json(quizzes);
  } catch (err) {
    console.error("❌ Lỗi getByCategory:", err);
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};


exports.getQuizzesByUserId = async (req, res) => {
  try {
    const userId = req.params.userId;

    // Lấy danh sách quiz của user (plain object vì dùng .lean)
    const quizzes = await Quiz.find({ createdBy: userId })
      .populate("createdBy", "username email")
      .populate("category", "name")
      .lean();

    // Thêm questionCount cho từng quiz
    for (let quiz of quizzes) {
      const count = await Question.countDocuments({ quizId: quiz._id });
      quiz.questionCount = count;
    }

    res.json(quizzes);
  } catch (err) {
    console.error("❌ Lỗi getQuizzesByUserId:", err);
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};


exports.getQuizById = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id).populate("category", "name");
    if (!quiz) return res.status(404).json({ message: "Quiz không tồn tại" });
    res.json(quiz);
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

exports.updateQuiz = async (req, res) => {
  try {
    const { title, description, category, isPrivate } = req.body;
    
    const quiz = await Quiz.findByIdAndUpdate(
      req.params.id,
      { title, description: description || "", category, isPrivate },
      { new: true }
    );

    if (!quiz) return res.status(404).json({ message: "Quiz không tồn tại" });

    res.json(quiz);
  } catch (err) {
    console.error("❌ Lỗi updateQuiz:", err);
    res.status(500).json({ message: "Cập nhật quiz thất bại", error: err.message });
  }
};



exports.updateQuizImage = async (req, res) => {
  try {
    const { id } = req.params;
    if (!req.file) {
      return res.status(400).json({ message: "Không có file được upload" });
    }

    const imagePath = `/uploads/${req.file.filename}`;

    const quiz = await Quiz.findByIdAndUpdate(
      id,
      { image: imagePath },
      { new: true }
    );

    if (!quiz) {
      return res.status(404).json({ message: "Quiz không tồn tại" });
    }

    res.json(quiz);
  } catch (err) {
    console.error("❌ Lỗi updateQuizImage:", err);
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

exports.deleteQuiz = async (req, res) => {
  try {
    await Quiz.findByIdAndDelete(req.params.id);
    res.json({ message: "Xóa quiz thành công" });
  } catch (err) {
    res.status(400).json({ message: "Xóa quiz thất bại", error: err.message });
  }
};
