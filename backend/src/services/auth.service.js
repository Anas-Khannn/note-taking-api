const { User } = require("../models");

const {
  BadRequestError,
  ConflictError,
  UnauthorizedError,
} = require("../errors/app.error");

const { hashPassword, comparePassword } = require(
  "../utils/password.util"
);

const { signAccessToken } = require("../utils/jwt.util");

const {
  generateResetToken,
  hashResetToken,
  RESET_TOKEN_TTL_MS,
} = require("../utils/reset-token.util");

const { normalizeEmail } = require(
  "../utils/normalize-email.util"
);

const EmailService = require(
  "./email.service"
);

const toSafeUser = (user) => ({
  user_id: user.user_id,
  name: user.name,
  email: user.email,
  profile_image_url: user.profile_image_url ?? null,
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

  static async updateProfile(
    userId,
    { name, profile_image_url, removeProfileImage }
  ) {
    const user = await User.findByPk(userId);

    if (!user) {
      throw new UnauthorizedError(
        "The session is no longer valid"
      );
    }

    const changes = {};

    if (name && name.trim().length > 0) {
      changes.name = name.trim();
    }

    if (removeProfileImage) {
      changes.profile_image_url = null;
    } else if (profile_image_url) {
      changes.profile_image_url = profile_image_url;
    }

    if (Object.keys(changes).length > 0) {
      await user.update(changes);
    }

    return {
      user: toSafeUser(user),
    };
  }

  static async requestPasswordReset(email) {
    const normalizedEmail =
      normalizeEmail(email);

    // Neutral, account-agnostic message: it never reveals whether an account
    // exists, and it does not claim an email was sent. Email delivery is not
    // configured yet, so the honest response says exactly that.
    const message =
      "If an account exists for that email, password reset instructions have been prepared. Email delivery is not configured yet, so no email was sent.";

    const user = await User.findOne({
      where: { email: normalizedEmail },
    });

    if (!user) {
      return { message };
    }

    const token = generateResetToken();

    await user.update({
      resetPasswordTokenHash:
        hashResetToken(token),
      resetPasswordExpiresAt: new Date(
        Date.now() + RESET_TOKEN_TTL_MS
      ),
    });

    await EmailService.sendPasswordResetEmail({
      to: user.email,
      resetToken: token,
    });

    // No email delivery service is configured yet, so the plaintext token is
    // only returned in non-production environments to allow local testing.
    // In production it is never exposed.
    if (process.env.NODE_ENV !== "production") {
      return { message, resetToken: token };
    }

    return { message };
  }

  static async resetPassword(token, password) {
    const tokenHash = hashResetToken(token);

    const user = await User.scope(
      "withPassword"
    ).findOne({
      where: {
        resetPasswordTokenHash: tokenHash,
      },
    });

    if (
      !user ||
      !user.resetPasswordExpiresAt ||
      new Date(user.resetPasswordExpiresAt).getTime() <
        Date.now()
    ) {
      throw new BadRequestError(
        "This password reset link is invalid or has expired"
      );
    }

    const hashedPassword =
      await hashPassword(password);

    await user.update({
      password: hashedPassword,
      resetPasswordTokenHash: null,
      resetPasswordExpiresAt: null,
    });

    return {
      message:
        "Your password has been reset successfully",
    };
  }
}

module.exports = AuthService;
