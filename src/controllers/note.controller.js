const getAll = (req, res) => {
  res.status(200).json({
    message: "All notes retrieved successfully",
    data: [],
  });
};

const create = (req, res) => {
  res.status(201).json({
    message: "Note created successfully",
    data: req.body,
  });
};

const getOne = (req, res) => {
  res.status(200).json({
    message: "Note retrieved successfully",
    noteId: req.params.id,
  });
};

const update = (req, res) => {
  res.status(200).json({
    message: "Note updated successfully",
    noteId: req.params.id,
    data: req.body,
  });
};

const remove = (req, res) => {
  res.status(200).json({
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
