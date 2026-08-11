require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");

const router = require("./src/routes");
const notFoundHandler = require(
  "./src/middleware/not-found.middleware"
);
const errorHandler = require(
  "./src/middleware/error.middleware"
);

const { authenticateDatabase } = require(
  "./src/models"
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

app.use(
  "/uploads",
  express.static(
    path.resolve(__dirname, "uploads")
  )
);

app.use("/api", router);

app.use(notFoundHandler);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await authenticateDatabase();

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
