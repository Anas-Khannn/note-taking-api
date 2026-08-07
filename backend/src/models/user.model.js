module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    "User",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },

      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },

      email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
      },

      password: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },

      profileImageUrl: {
        type: DataTypes.STRING(500),
        allowNull: true,
        defaultValue: null,
      },

      resetPasswordTokenHash: {
        type: DataTypes.STRING(64),
        allowNull: true,
        defaultValue: null,
      },

      resetPasswordExpiresAt: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null,
      },
    },
    {
      tableName: "users",
      timestamps: true,
      underscored: true,
      defaultScope: {
        attributes: {
          exclude: ["password", "resetPasswordTokenHash", "resetPasswordExpiresAt"],
        },
      },
      scopes: {
        withPassword: {
          attributes: {
            include: ["password", "resetPasswordTokenHash", "resetPasswordExpiresAt"],
          },
        },
      },
      hooks: {
        beforeValidate: (user) => {
          if (user.email && typeof user.email === "string") {
            user.email = user.email.trim().toLowerCase();
          }
        },
      },
    }
  );

  User.prototype.toSafeJSON = function toSafeJSON() {
    const { id, name, email, profileImageUrl, createdAt, updatedAt } =
      this.toJSON();

    return {
      id,
      name,
      email,
      profileImageUrl: profileImageUrl ?? null,
      createdAt,
      updatedAt,
    };
  };

  return User;
};
