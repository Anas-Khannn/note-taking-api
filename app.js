const express = require("express");
const cors = require("cors");

const router = require("./src/routes");
const notFoundHandler = require(
  "./src/middleware/not-found.middleware"
);
const errorHandler = require(
  "./src/middleware/error.middleware"
);

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api", router);

app.use(notFoundHandler);

app.use(errorHandler);

module.exports = app;
