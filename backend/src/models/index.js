const { Sequelize, DataTypes } = require("sequelize");
const databaseConfig = require(
  "../config/database.config"
);

const environment =
  process.env.NODE_ENV || "development";

const config = databaseConfig[environment];

if (!config) {
  throw new Error(
    `Database configuration not found for environment: ${environment}`
  );
}

const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  {
    host: config.host,
    port: config.port,
    dialect: config.dialect,
    logging: config.logging,
    pool: config.pool,
  }
);

const User = require("./user.model")(
  sequelize,
  DataTypes
);

const Note = require("./note.model")(
  sequelize,
  DataTypes
);

User.hasMany(Note, {
  foreignKey: "user_id",
  as: "notes",
  onDelete: "CASCADE",
});

Note.belongsTo(User, {
  foreignKey: "user_id",
  as: "user",
});

async function authenticateDatabase() {
  await sequelize.authenticate();
}

module.exports = {
  sequelize,
  Sequelize,
  User,
  Note,
  authenticateDatabase,
};
