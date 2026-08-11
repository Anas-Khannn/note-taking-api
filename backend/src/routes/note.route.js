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

const authenticate = require(
  "../middleware/auth.middleware"
);

const {
  createNoteSchema,
  updateNoteSchema,
  noteIdParamSchema,
} = require("../schemas/note.schema");

const router = express.Router();

router.use(authenticate);

router.get(
  "/",
  asyncHandler(noteController.getAllNotes)
);

router.post(
  "/",
  validate(createNoteSchema, "body"),
  asyncHandler(noteController.createNote)
);

router.get(
  "/:note_id",
  validate(noteIdParamSchema, "params"),
  asyncHandler(noteController.getNoteById)
);

router.put(
  "/:note_id",
  validate(noteIdParamSchema, "params"),
  validate(updateNoteSchema, "body"),
  asyncHandler(noteController.updateNote)
);

router.delete(
  "/:note_id",
  validate(noteIdParamSchema, "params"),
  asyncHandler(noteController.deleteNote)
);

module.exports = router;
