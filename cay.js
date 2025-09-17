const fs = require("fs");
const path = require("path");

function printTree(dir, prefix = "") {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    if (file === "node_modules") continue; // bỏ node_modules

    const filepath = path.join(dir, file);
    const stat = fs.statSync(filepath);

    console.log(prefix + "├── " + file);

    if (stat.isDirectory()) {
      printTree(filepath, prefix + "│   ");
    }
  }
}

printTree(process.cwd()); // chạy tại thư mục hiện tại
