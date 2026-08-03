"use strict";

const { randomUUID } = require("crypto");

module.exports = {
  async up(queryInterface) {
    const now = new Date();

    await queryInterface.bulkInsert("notes", [
      {
        id: randomUUID(),
        title: "Backend Architecture",
        content:
          "Controllers coordinate HTTP traffic while services contain business logic.",
        status: "ACTIVE",
        created_at: now,
        updated_at: now,
      },
      {
        id: randomUUID(),
        title: "Database Engineering",
        content:
          "Migrations control table structure and seeders add initial data.",
        status: "ARCHIVED",
        created_at: now,
        updated_at: now,
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("notes", {
      title: [
        "Backend Architecture",
        "Database Engineering",
      ],
    });
  },
};