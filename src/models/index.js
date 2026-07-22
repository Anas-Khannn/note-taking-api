require("dotenv").config();

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

const db = {
  sequelize,
  Sequelize,
};

db.Note = require("./note.model")(
  sequelize,
  DataTypes
);

module.exports = db;