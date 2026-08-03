const { Note } = require("../models");

const { NotFoundError, BadRequestError } = require(
  "../errors/app.error"
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
    return Note.create(noteData);
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

    await note.update(updateData);

    return note;
  }

  static async deleteNote(id) {
    const note = await this.getNoteById(id);

    await note.destroy();

    return note;
  }
}

module.exports = NoteService;
