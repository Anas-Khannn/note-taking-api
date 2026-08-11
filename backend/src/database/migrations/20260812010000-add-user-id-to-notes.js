"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("notes", "user_id", {
      type: Sequelize.UUID,
      allowNull: true,
    });

    // Notes created before user ownership existed have no owner and cannot be
    // assigned to a user. They are removed so the NOT NULL constraint holds.
    await queryInterface.sequelize.query(
      'DELETE FROM "notes" WHERE "user_id" IS NULL;'
    );

    await queryInterface.changeColumn("notes", "user_id", {
      type: Sequelize.UUID,
      allowNull: false,
    });

    await queryInterface.addConstraint("notes", {
      fields: ["user_id"],
      type: "foreign key",
      name: "notes_user_id_fkey",
      references: {
        table: "users",
        field: "user_id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    });
  },

  async down(queryInterface) {
    await queryInterface.removeConstraint(
      "notes",
      "notes_user_id_fkey"
    );

    await queryInterface.removeColumn("notes", "user_id");
  },
};
