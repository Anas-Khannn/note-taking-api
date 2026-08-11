const Joi = require("joi");

const { BadRequestError } = require("../errors/app.error");

const emailSchema = Joi.string()
  .trim()
  .lowercase()
  .email()
  .max(255)
  .required()
  .messages({
    "string.empty": "Email is required",
    "string.email": "Enter a valid email address",
    "any.required": "Email is required",
    "string.base": "Email must be a string",
  });

const passwordSchema = Joi.string()
  .min(8)
  .max(72)
  .required()
  .messages({
    "string.empty": "Password is required",
    "string.min":
      "Password must be at least 8 characters",
    "string.max":
      "Password must not exceed 72 characters",
    "any.required": "Password is required",
    "string.base": "Password must be a string",
  });

const registerSchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(1)
    .max(100)
    .required()
    .messages({
      "string.empty": "Name is required",
      "string.min": "Name is required",
      "string.max": "Name cannot exceed 100 characters",
      "any.required": "Name is required",
      "string.base": "Name must be a string",
    }),
  email: emailSchema,
  password: passwordSchema,
}).options({ stripUnknown: true });

const loginSchema = Joi.object({
  email: emailSchema,
  password: Joi.string()
    .min(1)
    .required()
    .messages({
      "string.empty": "Password is required",
      "any.required": "Password is required",
      "string.base": "Password must be a string",
    }),
}).options({ stripUnknown: true });

const forgotPasswordSchema = Joi.object({
  email: emailSchema,
}).options({ stripUnknown: true });

const resetPasswordSchema = Joi.object({
  token: Joi.string()
    .trim()
    .min(1)
    .required()
    .messages({
      "string.empty": "Reset token is required",
      "any.required": "Reset token is required",
      "string.base": "Reset token must be a string",
    }),
  password: passwordSchema,
}).options({ stripUnknown: true });

const updateProfileSchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(1)
    .max(100)
    .optional()
    .messages({
      "string.empty": "Name cannot be empty",
      "string.min": "Name cannot be empty",
      "string.max":
        "Name cannot exceed 100 characters",
      "string.base": "Name must be a string",
    }),
  removeProfileImage: Joi.boolean()
    .truthy("true")
    .falsy("false")
    .optional()
    .messages({
      "boolean.base":
        "removeProfileImage must be true or false",
    }),
}).options({ stripUnknown: true });

const validateProfileUpdate = (req, res, next) => {
  const { error, value } = updateProfileSchema.validate(
    req.body,
    {
      abortEarly: false,
      stripUnknown: true,
    }
  );

  if (error) {
    const message = error.details
      .map((detail) => detail.message)
      .join(", ");

    return next(new BadRequestError(message));
  }

  req.body = value;

  if (value.removeProfileImage === true && req.file) {
    return next(
      new BadRequestError(
        "profileImage and removeProfileImage cannot be used together"
      )
    );
  }

  next();
};

module.exports = {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  updateProfileSchema,
  validateProfileUpdate,
};
