const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/categoryController");

// CRUD Category
router.post("/", categoryController.createCategory);         // Tạo mới
router.get("/", categoryController.getAllCategories);        // Lấy tất cả
router.get("/:id", categoryController.getCategoryById);      // Lấy theo id
router.get("/code/:code", categoryController.getCategoryByCode); // ✅ Lấy theo code
router.put("/:id", categoryController.updateCategory);       // Cập nhật
router.delete("/:id", categoryController.deleteCategory);    // Xóa

module.exports = router;
