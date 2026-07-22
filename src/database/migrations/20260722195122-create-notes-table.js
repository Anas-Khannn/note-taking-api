"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("notes", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },

      title: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },

      content: {
        type: Sequelize.TEXT,
        allowNull: false,
      },

      status: {
        type: Sequelize.ENUM(
          "ACTIVE",
          "ARCHIVED",
          "DELETED"
        ),
        allowNull: false,
        defaultValue: "ACTIVE",
      },

      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },

      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("notes");

    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_notes_status";'
    );
  },
};
