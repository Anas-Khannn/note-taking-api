const express = require("express");

const noteController = require(
  "../controllers/note.controller"
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
  noteController.getAllNotes
);

router.post(
  "/",
  validate(createNoteSchema, "body"),
  noteController.createNote
);

router.get(
  "/:note_id",
  validate(noteIdParamSchema, "params"),
  noteController.getNoteById
);

router.put(
  "/:note_id",
  validate(noteIdParamSchema, "params"),
  validate(updateNoteSchema, "body"),
  noteController.updateNote
);

router.delete(
  "/:note_id",
  validate(noteIdParamSchema, "params"),
  noteController.deleteNote
);

module.exports = router;
