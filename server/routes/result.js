const express = require("express");
const { getResultsByRoom } = require("../controllers/resultController");
const router = express.Router();

router.get("/:roomId", getResultsByRoom);

module.exports = router;
