const jwt = require("jsonwebtoken");

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;

  if (!secret || secret.trim().length === 0) {
    throw new Error(
      "JWT_SECRET environment variable is not configured"
    );
  }

  return secret;
}

function signAccessToken(user) {
  const payload = {
    sub: user.id,
  };

  const expiresIn = process.env.JWT_EXPIRES_IN || "7d";

  return jwt.sign(payload, getJwtSecret(), { expiresIn });
}

function verifyAccessToken(token) {
  return jwt.verify(token, getJwtSecret());
}

module.exports = {
  signAccessToken,
  verifyAccessToken,
};
