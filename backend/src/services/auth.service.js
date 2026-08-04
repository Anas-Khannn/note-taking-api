const { User } = require("../models");

const {
  ConflictError,
  UnauthorizedError,
} = require("../errors/app.error");

const { hashPassword, comparePassword } = require(
  "../utils/password.util"
);

const { signAccessToken } = require("../utils/jwt.util");

const normalizeEmail = (email) =>
  String(email).trim().toLowerCase();

const toSafeUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
});

class AuthService {
  static async registerUser(input) {
    const email = normalizeEmail(input.email);

    const existingUser = await User.findOne({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictError(
        "An account with this email already exists"
      );
    }

    const hashedPassword = await hashPassword(
      input.password
    );

    const user = await User.create({
      name: input.name,
      email,
      password: hashedPassword,
    });

    const token = signAccessToken(user);

    return {
      user: toSafeUser(user),
      token,
    };
  }

  static async loginUser(input) {
    const email = normalizeEmail(input.email);

    const user = await User.scope(
      "withPassword"
    ).findOne({ where: { email } });

    if (!user) {
      throw new UnauthorizedError(
        "Invalid email or password"
      );
    }

    const passwordMatches = await comparePassword(
      input.password,
      user.password
    );

    if (!passwordMatches) {
      throw new UnauthorizedError(
        "Invalid email or password"
      );
    }

    const token = signAccessToken(user);

    return {
      user: toSafeUser(user),
      token,
    };
  }

  static async getCurrentUser(userId) {
    const user = await User.findByPk(userId);

    if (!user) {
      throw new UnauthorizedError(
        "The session is no longer valid"
      );
    }

    return toSafeUser(user);
  }
}

module.exports = AuthService;
