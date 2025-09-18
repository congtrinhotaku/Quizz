const Category = require("../models/Category");

// Tạo category mới
exports.createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    const code = generateCode(name);
    const category = new Category({ name,code, description });
    await category.save();
    res.status(201).json(category);
  } catch (err) {
    res.status(400).json({ message: "Tạo category thất bại", error: err.message });
  }
  function generateCode(str) {
  return str
    .normalize("NFD") // tách dấu
    .replace(/[\u0300-\u036f]/g, "") // xóa dấu
    .replace(/\s+/g, "") // bỏ khoảng trắng
    .toLowerCase(); // về chữ thường
  }
 

};

// Lấy tất cả categories
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

// Lấy category theo ID
exports.getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ message: "Category không tồn tại" });
    res.json(category);
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};
// Lấy category theo code
exports.getCategoryByCode = async (req, res) => {
  try {
    const { code } = req.params;
    const category = await Category.findOne({ code });
    if (!category) return res.status(404).json({ message: "Category không tồn tại" });
    res.json(category);
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

// Cập nhật category
exports.updateCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!category) return res.status(404).json({ message: "Category không tồn tại" });
    res.json(category);
  } catch (err) {
    res.status(400).json({ message: "Cập nhật category thất bại", error: err.message });
  }
};

// Xóa category
exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) return res.status(404).json({ message: "Category không tồn tại" });
    res.json({ message: "Xóa category thành công" });
  } catch (err) {
    res.status(400).json({ message: "Xóa category thất bại", error: err.message });
  }
};
