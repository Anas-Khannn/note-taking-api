"use strict";

module.exports = {
  async up(queryInterface) {
    await queryInterface.renameColumn(
      "users",
      "id",
      "user_id"
    );
  },

  async down(queryInterface) {
    await queryInterface.renameColumn(
      "users",
      "user_id",
      "id"
    );
  },
};
