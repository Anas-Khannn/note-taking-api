require("dotenv").config();

const express = require("express");
const cors = require("cors");

const router = require("./src/routes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api", router);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});