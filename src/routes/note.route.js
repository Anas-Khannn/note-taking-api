const express = require("express");

const noteController = require(
  "../controllers/note.controller"
);

const router = express.Router();

router.get("/", noteController.getAll);
router.post("/", noteController.create);
router.get("/:id", noteController.getOne);
router.put("/:id", noteController.update);
router.delete("/:id", noteController.remove);

module.exports = router;