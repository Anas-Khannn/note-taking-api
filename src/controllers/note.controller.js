const NoteService = require(
  "../services/note.service"
);

const HTTP_STATUS = require(
  "../enums/http-status.enum"
);

const getAll = async (req, res, next) => {
  try {
    const notes = await NoteService.getAllNotes();

    return res.status(HTTP_STATUS.OK).json({
      success: true,
      message: "Notes retrieved successfully",
      data: notes,
    });
  } catch (error) {
    return next(error);
  }
};

const create = async (req, res, next) => {
  try {
    const note = await NoteService.createNote(
      req.body
    );

    return res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: "Note created successfully",
      data: note,
    });
  } catch (error) {
    return next(error);
  }
};

const getOne = async (req, res, next) => {
  try {
    const note = await NoteService.getNoteById(
      req.params.id
    );

    return res.status(HTTP_STATUS.OK).json({
      success: true,
      message: "Note retrieved successfully",
      data: note,
    });
  } catch (error) {
    return next(error);
  }
};

const update = async (req, res, next) => {
  try {
    const note = await NoteService.updateNote(
      req.params.id,
      req.body
    );

    return res.status(HTTP_STATUS.OK).json({
      success: true,
      message: "Note updated successfully",
      data: note,
    });
  } catch (error) {
    return next(error);
  }
};

const remove = async (req, res, next) => {
  try {
    await NoteService.deleteNote(req.params.id);

    return res.status(HTTP_STATUS.OK).json({
      success: true,
      message: "Note deleted successfully",
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getAll,
  create,
  getOne,
  update,
  remove,
};