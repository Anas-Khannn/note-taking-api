const NoteService = require(
  "../services/note.service"
);

const HTTP_STATUS = require(
  "../enums/http-status.enum"
);

const getAllNotes = async (req, res) => {
  const notes = await NoteService.getAllNotes();

  return res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "Notes retrieved successfully",
    data: notes,
  });
};

const createNote = async (req, res) => {
  const note = await NoteService.createNote(req.body);

  return res.status(HTTP_STATUS.CREATED).json({
    success: true,
    message: "Note created successfully",
    data: note,
  });
};

const getNoteById = async (req, res) => {
  const note = await NoteService.getNoteById(
    req.params.id
  );

  return res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "Note retrieved successfully",
    data: note,
  });
};

const updateNote = async (req, res) => {
  const note = await NoteService.updateNote(
    req.params.id,
    req.body
  );

  return res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "Note updated successfully",
    data: note,
  });
};

const deleteNote = async (req, res) => {
  await NoteService.deleteNote(req.params.id);

  return res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "Note deleted successfully",
  });
};

module.exports = {
  getAllNotes,
  createNote,
  getNoteById,
  updateNote,
  deleteNote,
};
