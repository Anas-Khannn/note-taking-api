const bcrypt = require("bcrypt");

const BCRYPT_ROUNDS = 10;

const hashPassword = (password) =>
  bcrypt.hash(password, BCRYPT_ROUNDS);

const comparePassword = (password, hash) =>
  bcrypt.compare(password, hash);

module.exports = {
  BCRYPT_ROUNDS,
  hashPassword,
  comparePassword,
};
