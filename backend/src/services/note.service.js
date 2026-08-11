const { Note } = require("../models");

const { NotFoundError, BadRequestError } = require(
  "../errors/app.error"
);

const NOTE_STATUS = require(
  "../enums/note-status.enum"
);

class NoteService {
  static async getAllNotes(userId) {
    return Note.findAll({
      where: { user_id: userId },
      order: [["created_at", "DESC"]],
    });
  }

  static async createNote(noteData, userId) {
    return Note.create({
      title: noteData.title,
      content: noteData.content,
      status: noteData.status ?? NOTE_STATUS.ACTIVE,
      user_id: userId,
    });
  }

  static async getNoteById(id, userId) {
    const note = await Note.findOne({
      where: {
        note_id: id,
        user_id: userId,
      },
    });

    if (!note) {
      throw new NotFoundError(
        `Note with ID ${id} was not found`
      );
    }

    return note;
  }

  static async updateNote(id, updateData, userId) {
    const note = await this.getNoteById(id, userId);

    if (note.status === NOTE_STATUS.DELETED) {
      throw new BadRequestError(
        "A deleted note cannot be updated"
      );
    }

    const changes = {};

    if (updateData.title !== undefined) {
      changes.title = updateData.title;
    }

    if (updateData.content !== undefined) {
      changes.content = updateData.content;
    }

    if (updateData.status !== undefined) {
      changes.status = updateData.status;
    }

    await note.update(changes);

    return note;
  }

  static async deleteNote(id, userId) {
    const note = await this.getNoteById(id, userId);

    await note.destroy();

    return note;
  }
}

module.exports = NoteService;
