const AppError = require("./app.error");
const HTTP_STATUS = require("../enums/http-status.enum");

class NotFoundError extends AppError {
  constructor(message = "Resource not found") {
    super(message, HTTP_STATUS.NOT_FOUND);
  }
}

module.exports = NotFoundError;