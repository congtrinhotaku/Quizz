const mongoose = require("mongoose");

// Hàm bỏ dấu tiếng Việt và khoảng trắng
function generateCode(str) {
  return str
    .normalize("NFD") // tách dấu
    .replace(/[\u0300-\u036f]/g, "") // xóa dấu
    .replace(/\s+/g, "") // bỏ khoảng trắng
    .toLowerCase(); // về chữ thường
}

const categorySchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: { type: String },
});

// Hook trước khi lưu
categorySchema.pre("save", async function (next) {
  if (this.isNew || this.isModified("name")) {
    let baseCode = generateCode(this.name);
    let code = baseCode;
    let counter = 1;

    // Kiểm tra trùng code
    const Category = mongoose.model("Category", categorySchema);
    while (await Category.findOne({ code })) {
      code = baseCode + counter;
      counter++;
    }

    this.code = code;
  }
  next();
});

module.exports = mongoose.model("Category", categorySchema);
