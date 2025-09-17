const express = require("express");
const { createRoom, getRoom } = require("../controllers/roomController");
const verifyToken = require("../middlewares/verifyToken");

const router = express.Router();

router.post("/", verifyToken, createRoom);
router.get("/:code", getRoom);

module.exports = router;
