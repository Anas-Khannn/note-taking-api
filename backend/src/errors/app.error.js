const HTTP_STATUS = require("../enums/http-status.enum");

class AppError extends Error {
  constructor(message, statusCode) {
    super(message);

    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

class BadRequestError extends AppError {
  constructor(message = "Bad request") {
    super(message, HTTP_STATUS.BAD_REQUEST);
  }
}

class NotFoundError extends AppError {
  constructor(message = "Resource not found") {
    super(message, HTTP_STATUS.NOT_FOUND);
  }
}

class ConflictError extends AppError {
  constructor(message = "Resource conflict") {
    super(message, HTTP_STATUS.CONFLICT);
  }
}

module.exports = {
  AppError,
  BadRequestError,
  NotFoundError,
  ConflictError,
};
