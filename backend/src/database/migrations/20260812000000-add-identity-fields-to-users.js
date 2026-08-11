"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.renameColumn(
      "users",
      "name",
      "username"
    );

    await queryInterface.renameColumn(
      "users",
      "password",
      "password_hash"
    );

    await queryInterface.addColumn("users", "role", {
      type: Sequelize.STRING(20),
      allowNull: false,
      defaultValue: "user",
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn("users", "role");

    await queryInterface.renameColumn(
      "users",
      "password_hash",
      "password"
    );

    await queryInterface.renameColumn(
      "users",
      "username",
      "name"
    );
  },
};
