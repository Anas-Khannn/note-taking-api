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

const allowedOrigins = (
  process.env.FRONTEND_URL ||
  "http://localhost:3000,http://localhost:3001,http://localhost:3100"
)
  .split(",")
  .map((origin) => origin.trim());

app.use(
  cors({
    origin(origin, callback) {
      // Allow same-origin / non-browser requests (curl, Postman, tests).
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, false);
    },
    allowedHeaders: ["Content-Type", "Authorization"],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  })
);
app.use(express.json());

app.use("/api", router);

app.use(notFoundHandler);

app.use(errorHandler);

module.exports = app;
