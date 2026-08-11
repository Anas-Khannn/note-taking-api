const NOTE_STATUS = require("../enums/note-status.enum");

module.exports = (sequelize, DataTypes) => {
  const Note = sequelize.define(
    "Note",
    {
      note_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },

      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "users",
          key: "user_id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },

      title: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },

      content: {
        type: DataTypes.TEXT,
        allowNull: false,
      },

      status: {
        type: DataTypes.ENUM(
          NOTE_STATUS.ACTIVE,
          NOTE_STATUS.ARCHIVED,
          NOTE_STATUS.DELETED
        ),
        allowNull: false,
        defaultValue: NOTE_STATUS.ACTIVE,
      },
    },
    {
      tableName: "notes",
      timestamps: true,
      underscored: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  return Note;
};
