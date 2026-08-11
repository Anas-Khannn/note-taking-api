"use strict";

const { test, beforeEach } = require("node:test");
const assert = require("node:assert/strict");
const Module = require("node:module");

let nextId = 1;
const notes = [];

function makeRow(data) {
  return {
    note_id: String(nextId++),
    user_id: data.user_id,
    title: data.title,
    content: data.content,
    status: data.status ?? "ACTIVE",
    created_at: new Date(),
    updated_at: new Date(),
    async update(changes) {
      Object.assign(this, changes);
      this.updated_at = new Date();
    },
    async destroy() {
      const index = notes.findIndex(
        (note) => note.note_id === this.note_id
      );
      if (index !== -1) {
        notes.splice(index, 1);
      }
    },
  };
}

const fakeNoteModel = {
  async findAll({ where }) {
    return notes.filter(
      (note) => note.user_id === where.user_id
    );
  },
  async findOne({ where }) {
    return (
      notes.find(
        (note) =>
          note.note_id === where.note_id &&
          note.user_id === where.user_id
      ) ?? null
    );
  },
  async create(data) {
    const row = makeRow(data);
    notes.push(row);
    return row;
  },
};

const originalLoad = Module._load;
Module._load = function (request, parent, isMain) {
  if (request === "../models") {
    return { Note: fakeNoteModel };
  }
  return originalLoad.call(this, request, parent, isMain);
};

const NoteService = require("../src/services/note.service");

Module._load = originalLoad;

beforeEach(() => {
  nextId = 1;
  notes.length = 0;
});

test("createNote assigns the authenticated user and ignores a client-supplied user_id", async () => {
  const note = await NoteService.createNote(
    {
      title: "Owned note",
      content: "contents",
      user_id: "another-user",
    },
    "user-a"
  );

  assert.equal(note.user_id, "user-a");
  assert.equal(note.title, "Owned note");
});

test("getAllNotes returns only notes belonging to the authenticated user", async () => {
  await NoteService.createNote(
    { title: "A1", content: "c" },
    "user-a"
  );
  await NoteService.createNote(
    { title: "A2", content: "c" },
    "user-a"
  );
  await NoteService.createNote(
    { title: "B1", content: "c" },
    "user-b"
  );

  const aNotes = await NoteService.getAllNotes("user-a");
  const bNotes = await NoteService.getAllNotes("user-b");

  assert.equal(aNotes.length, 2);
  assert.ok(aNotes.every((note) => note.user_id === "user-a"));
  assert.equal(bNotes.length, 1);
  assert.ok(bNotes.every((note) => note.user_id === "user-b"));
});

test("getNoteById returns the note only when it belongs to the authenticated user", async () => {
  const owned = await NoteService.createNote(
    { title: "A", content: "c" },
    "user-a"
  );
  await NoteService.createNote(
    { title: "B", content: "c" },
    "user-b"
  );

  const found = await NoteService.getNoteById(
    owned.note_id,
    "user-a"
  );
  assert.equal(found.note_id, owned.note_id);

  await assert.rejects(
    NoteService.getNoteById(owned.note_id, "user-b"),
    (err) => err.name === "NotFoundError"
  );
});

test("updateNote only updates a note owned by the authenticated user", async () => {
  const owned = await NoteService.createNote(
    { title: "A", content: "c" },
    "user-a"
  );
  await NoteService.createNote(
    { title: "B", content: "c" },
    "user-b"
  );

  const updated = await NoteService.updateNote(
    owned.note_id,
    { title: "A updated" },
    "user-a"
  );
  assert.equal(updated.title, "A updated");

  await assert.rejects(
    NoteService.updateNote(
      owned.note_id,
      { title: "Hijacked" },
      "user-b"
    ),
    (err) => err.name === "NotFoundError"
  );

  const stillOwned = await NoteService.getNoteById(
    owned.note_id,
    "user-a"
  );
  assert.equal(stillOwned.title, "A updated");
});

test("deleteNote only deletes a note owned by the authenticated user", async () => {
  const owned = await NoteService.createNote(
    { title: "A", content: "c" },
    "user-a"
  );
  await NoteService.createNote(
    { title: "B", content: "c" },
    "user-b"
  );

  await assert.rejects(
    NoteService.deleteNote(owned.note_id, "user-b"),
    (err) => err.name === "NotFoundError"
  );

  assert.equal(notes.length, 2);

  await NoteService.deleteNote(owned.note_id, "user-a");

  assert.equal(notes.length, 1);
  assert.equal(notes[0].user_id, "user-b");
});

test("updateNote rejects an update on a deleted note", async () => {
  const owned = await NoteService.createNote(
    { title: "A", content: "c", status: "DELETED" },
    "user-a"
  );

  await assert.rejects(
    NoteService.updateNote(
      owned.note_id,
      { title: "No" },
      "user-a"
    ),
    (err) => err.name === "BadRequestError"
  );
});
