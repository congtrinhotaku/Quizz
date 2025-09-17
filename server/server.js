const express = require("express");
const http = require("http");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const initSocket = require("./socket");

dotenv.config();

// Kết nối DB
connectDB();

const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors());
app.use(express.json());

// Test API
app.get("/", (req, res) => {
  res.send("API is running...");
});

// Routes
const authRoutes = require("./routes/auth");
const quizRoutes = require("./routes/quiz");
const questionRoutes = require("./routes/question");
const roomRoutes = require("./routes/room");
const resultRoutes = require("./routes/result");

app.use("/api/auth", authRoutes);
app.use("/api/quizzes", quizRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/results", resultRoutes);

// Socket.IO
initSocket(server);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
