const express = require("express");

const noteController = require(
  "../controllers/note.controller"
);

const asyncHandler = require(
  "../utils/async-handler"
);

const validate = require(
  "../middleware/validate-request.middleware"
);

const {
  createNoteSchema,
  updateNoteSchema,
  noteIdParamSchema,
} = require("../schemas/note.schema");

const router = express.Router();

router.get("/", asyncHandler(noteController.getAll));

router.post(
  "/",
  validate(createNoteSchema, "body"),
  asyncHandler(noteController.create)
);

router.get(
  "/:id",
  validate(noteIdParamSchema, "params"),
  asyncHandler(noteController.getOne)
);

router.put(
  "/:id",
  validate(noteIdParamSchema, "params"),
  validate(updateNoteSchema, "body"),
  asyncHandler(noteController.update)
);

router.delete(
  "/:id",
  validate(noteIdParamSchema, "params"),
  asyncHandler(noteController.remove)
);

module.exports = router;
