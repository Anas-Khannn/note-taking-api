require("dotenv").config();

const app = require("./app");

const { sequelize } = require("./src/models");

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
