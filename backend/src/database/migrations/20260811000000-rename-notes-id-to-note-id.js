"use strict";

module.exports = {
  async up(queryInterface) {
    await queryInterface.renameColumn(
      "notes",
      "id",
      "note_id"
    );
  },

  async down(queryInterface) {
    await queryInterface.renameColumn(
      "notes",
      "note_id",
      "id"
    );
  },
};
