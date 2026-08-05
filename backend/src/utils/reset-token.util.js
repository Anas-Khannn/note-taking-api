const crypto = require("crypto");

const generateResetToken = () =>
  crypto.randomBytes(32).toString("hex");

const hashResetToken = (token) =>
  crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

const RESET_TOKEN_TTL_MS =
  60 * 60 * 1000;

module.exports = {
  generateResetToken,
  hashResetToken,
  RESET_TOKEN_TTL_MS,
};
