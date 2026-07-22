require("dotenv").config();

const express = require("express");
const cors = require("cors");

const router = require("./src/routes");
const { sequelize } = require("./src/models");

const errorHandler = require(
  "./src/middleware/error.middleware"
);

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api", router);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await sequelize.authenticate();

    console.log(
      "Database connection established successfully"
    );

    app.listen(PORT, () => {
      console.log(
        `Server is running on port ${PORT}`
      );
    });
  } catch (error) {
    console.error(
      "Unable to connect to the database:",
      error.message
    );

    process.exit(1);
  }
};

startServer();