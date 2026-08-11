const Joi = require("joi");

const NOTE_STATUS = require("../enums/note-status.enum");

const allowedStatuses = Object.values(NOTE_STATUS);

const titleSchema = Joi.string()
  .trim()
  .min(1)
  .max(100)
  .required()
  .messages({
    "string.empty": "Note title is required",
    "string.min": "Note title is required",
    "string.max":
      "Note title cannot exceed 100 characters",
    "any.required": "Note title is required",
    "string.base": "Note title must be a string",
  });

const contentSchema = Joi.string()
  .trim()
  .min(1)
  .required()
  .messages({
    "string.empty": "Note content is required",
    "string.min": "Note content is required",
    "any.required": "Note content is required",
    "string.base": "Note content must be a string",
  });

const statusSchema = Joi.string()
  .valid(...allowedStatuses)
  .messages({
    "any.only": `Status must be one of: ${allowedStatuses.join(", ")}`,
    "string.base": "Status must be a string",
  });

const uuidSchema = Joi.string()
  .uuid({ version: "uuidv4" })
  .messages({
    "string.uuid": "Invalid note ID format",
  });

const titleUpdateSchema = Joi.string()
  .trim()
  .min(1)
  .max(100)
  .messages({
    "string.empty": "Note title cannot be empty",
    "string.min": "Note title cannot be empty",
    "string.max":
      "Note title cannot exceed 100 characters",
    "string.base": "Note title must be a string",
  });

const contentUpdateSchema = Joi.string()
  .trim()
  .min(1)
  .messages({
    "string.empty": "Note content cannot be empty",
    "string.min": "Note content cannot be empty",
    "string.base": "Note content must be a string",
  });

const createNoteSchema = Joi.object({
  title: titleSchema,
  content: contentSchema,
  status: statusSchema.optional(),
}).options({ stripUnknown: true });

const updateNoteSchema = Joi.object({
  title: titleUpdateSchema,
  content: contentUpdateSchema,
  status: statusSchema,
})
  .min(1)
  .options({ stripUnknown: true })
  .messages({
    "object.min":
      "Provide at least one valid field to update",
  });

const noteIdParamSchema = Joi.object({
  note_id: uuidSchema.required(),
});

module.exports = {
  createNoteSchema,
  updateNoteSchema,
  noteIdParamSchema,
};
