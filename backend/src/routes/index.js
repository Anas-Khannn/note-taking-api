const express = require("express");
const noteRoutes = require("./note.route");
const authRoutes = require("./auth.route");

const router = express.Router();

router.use("/note", noteRoutes);
router.use("/auth", authRoutes);

module.exports = router;
