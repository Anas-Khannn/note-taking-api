const NoteService = require(
  "../services/note.service"
);

const HTTP_STATUS = require(
  "../enums/http-status.enum"
);

const getAll = async (req, res) => {
  const notes = await NoteService.getAllNotes();

  return res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "Notes retrieved successfully",
    data: notes,
  });
};

const create = async (req, res) => {
  const note = await NoteService.createNote(req.body);

  return res.status(HTTP_STATUS.CREATED).json({
    success: true,
    message: "Note created successfully",
    data: note,
  });
};

const getOne = async (req, res) => {
  const note = await NoteService.getNoteById(
    req.params.id
  );

  return res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "Note retrieved successfully",
    data: note,
  });
};

const update = async (req, res) => {
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

const remove = async (req, res) => {
  await NoteService.deleteNote(req.params.id);

  return res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "Note deleted successfully",
  });
};

module.exports = {
  getAll,
  create,
  getOne,
  update,
  remove,
};
