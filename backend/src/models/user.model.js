const { normalizeEmail } = require(
  "../utils/normalize-email.util"
);

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    "User",
    {
      user_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },

      username: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },

      email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
      },

      password_hash: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },

      role: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: "user",
      },

      profile_image_url: {
        type: DataTypes.STRING(500),
        allowNull: true,
        defaultValue: null,
      },

      reset_password_token_hash: {
        type: DataTypes.STRING(64),
        allowNull: true,
        defaultValue: null,
      },

      reset_password_expires_at: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null,
      },
    },
    {
      tableName: "users",
      timestamps: true,
      underscored: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      defaultScope: {
        attributes: {
          exclude: [
            "password_hash",
            "reset_password_token_hash",
            "reset_password_expires_at",
          ],
        },
      },
      scopes: {
        withPassword: {
          attributes: {
            include: [
              "password_hash",
              "reset_password_token_hash",
              "reset_password_expires_at",
            ],
          },
        },
      },
      hooks: {
        beforeValidate: (user) => {
          if (user.email && typeof user.email === "string") {
            user.email = normalizeEmail(user.email);
          }
        },
      },
    }
  );

  User.prototype.toSafeJSON = function toSafeJSON() {
    const {
      user_id,
      username,
      email,
      profile_image_url,
      created_at,
      updated_at,
    } = this.toJSON();

    return {
      user_id,
      name: username,
      email,
      profile_image_url: profile_image_url ?? null,
      created_at,
      updated_at,
    };
  };

  return User;
};
