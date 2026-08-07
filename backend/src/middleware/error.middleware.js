const HTTP_STATUS = require("../enums/http-status.enum");

const errorHandler = (error, req, res, next) => {
  console.error(error.stack);

  if (error.name === "MulterError") {
    const message =
      error.code === "LIMIT_FILE_SIZE"
        ? "Profile image must be 2 MB or smaller"
        : "The profile image could not be uploaded";

    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message,
    });
  }

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
