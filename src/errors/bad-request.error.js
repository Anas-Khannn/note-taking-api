const AppError = require("./app.error");
const HTTP_STATUS = require("../enums/http-status.enum");

class BadRequestError extends AppError {
  constructor(message = "Bad request") {
    super(message, HTTP_STATUS.BAD_REQUEST);
  }
}

module.exports = BadRequestError;