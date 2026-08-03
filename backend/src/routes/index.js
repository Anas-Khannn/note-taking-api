const express = require("express");
const noteRoutes = require("./note.route");

const router = express.Router();

router.use("/note", noteRoutes);

module.exports = router;