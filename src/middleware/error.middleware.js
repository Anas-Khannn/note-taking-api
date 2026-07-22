const HTTP_STATUS = require("../enums/http-status.enum");

const errorHandler = (error, req, res, next) => {
  console.error(error.stack);

  const statusCode =
    error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;

  const isUnexpectedError =
    statusCode === HTTP_STATUS.INTERNAL_SERVER_ERROR;

  res.status(statusCode).json({
    success: false,
    message: isUnexpectedError
      ? "Internal server error"
      : error.message,
  });
};

module.exports = errorHandler;