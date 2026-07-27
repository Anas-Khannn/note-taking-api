const { BadRequestError } = require("../errors/app.error");

const validate = (schema, source = "body") => {
  return (req, res, next) => {
    const dataToValidate = req[source];

    const { error, value } = schema.validate(dataToValidate, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const message = error.details
        .map((detail) => detail.message)
        .join(", ");

      return next(new BadRequestError(message));
    }

    req[source] = value;

    next();
  };
};

module.exports = validate;
