const { Note } = require("../models");

const NotFoundError = require(
  "../errors/not-found.error"
);
const BadRequestError = require(
  "../errors/bad-request.error"
);

const NOTE_STATUS = require(
  "../enums/note-status.enum"
);

class NoteService {
  static async getAllNotes() {
    return Note.findAll({
      order: [["created_at", "DESC"]],
    });
  }

  static async createNote(noteData) {
    const title = noteData.title?.trim();
    const content = noteData.content?.trim();

    if (!title) {
      throw new BadRequestError(
        "Note title is required"
      );
    }

    if (!content) {
      throw new BadRequestError(
        "Note content is required"
      );
    }

    if (title.length > 100) {
      throw new BadRequestError(
        "Note title cannot exceed 100 characters"
      );
    }

    const status =
      noteData.status || NOTE_STATUS.ACTIVE;

    if (!Object.values(NOTE_STATUS).includes(status)) {
      throw new BadRequestError(
        "Status must be ACTIVE, ARCHIVED, or DELETED"
      );
    }

    return Note.create({
      title,
      content,
      status,
    });
  }

  static async getNoteById(id) {
    const note = await Note.findByPk(id);

    if (!note) {
      throw new NotFoundError(
        `Note with ID ${id} was not found`
      );
    }

    return note;
  }

  static async updateNote(id, updateData) {
    const note = await this.getNoteById(id);

    if (note.status === NOTE_STATUS.DELETED) {
      throw new BadRequestError(
        "A deleted note cannot be updated"
      );
    }

    const changes = {};

    if (updateData.title !== undefined) {
      const title = updateData.title.trim();

      if (!title) {
        throw new BadRequestError(
          "Note title cannot be empty"
        );
      }

      if (title.length > 100) {
        throw new BadRequestError(
          "Note title cannot exceed 100 characters"
        );
      }

      changes.title = title;
    }

    if (updateData.content !== undefined) {
      const content = updateData.content.trim();

      if (!content) {
        throw new BadRequestError(
          "Note content cannot be empty"
        );
      }

      changes.content = content;
    }

    if (updateData.status !== undefined) {
      if (
        !Object.values(NOTE_STATUS).includes(
          updateData.status
        )
      ) {
        throw new BadRequestError(
          "Status must be ACTIVE, ARCHIVED, or DELETED"
        );
      }

      changes.status = updateData.status;
    }

    if (Object.keys(changes).length === 0) {
      throw new BadRequestError(
        "Provide at least one valid field to update"
      );
    }

    await note.update(changes);

    return note;
  }

  static async deleteNote(id) {
    const note = await this.getNoteById(id);

    await note.destroy();

    return note;
  }
}

module.exports = NoteService;