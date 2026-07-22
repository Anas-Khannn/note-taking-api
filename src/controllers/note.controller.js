const HTTP_STATUS = require("../enums/httpStatus.enum");

const getAll = (req, res) => {
  res.status(HTTP_STATUS.OK).json({
    message: "All notes retrieved successfully",
    data: [],
  });
};

const create = (req, res) => {
  res.status(HTTP_STATUS.CREATED).json({
    message: "Note created successfully",
    data: req.body,
  });
};

const getOne = (req, res) => {
  res.status(HTTP_STATUS.OK).json({
    message: "Note retrieved successfully",
    noteId: req.params.id,
  });
};

const update = (req, res) => {
  res.status(HTTP_STATUS.OK).json({
    message: "Note updated successfully",
    noteId: req.params.id,
    data: req.body,
  });
};

const remove = (req, res) => {
  res.status(HTTP_STATUS.OK).json({
    message: "Note deleted successfully",
    noteId: req.params.id,
  });
};

module.exports = {
  getAll,
  create,
  getOne,
  update,
  remove,
};
