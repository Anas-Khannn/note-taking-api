"use strict";

const { test, beforeEach } = require("node:test");
const assert = require("node:assert/strict");
const Module = require("node:module");

process.env.JWT_SECRET = "test-only-jwt-secret-that-is-long-enough";

let nextId = 1;
const users = [];

function makeRow(data) {
  const row = {
    user_id: String(nextId++),
    username: data.username,
    email: data.email,
    password_hash: data.password_hash,
    profile_image_url: data.profile_image_url ?? null,
    reset_password_token_hash: data.reset_password_token_hash ?? null,
    reset_password_expires_at: data.reset_password_expires_at ?? null,
    async update(changes) {
      Object.assign(this, changes);
    },
  };
  return row;
}

const fakeUserModel = {
  async findOne({ where }) {
    const key = Object.keys(where)[0];
    return users.find((user) => user[key] === where[key]) ?? null;
  },
  async findByPk(userId) {
    return users.find((user) => user.user_id === userId) ?? null;
  },
  async create(data) {
    const row = makeRow(data);
    users.push(row);
    return row;
  },
  scope() {
    return fakeUserModel;
  },
};

// Intercept the ../database/models import so the service runs against the
// in-memory fake instead of a real database. Restored right after the require
// because the service captures { User } at module load.
const originalLoad = Module._load;
Module._load = function (request, parent, isMain) {
  if (request === "../database/models") {
    return { User: fakeUserModel };
  }
  return originalLoad.call(this, request, parent, isMain);
};

const AuthService = require("../src/services/auth.service");

Module._load = originalLoad;

beforeEach(() => {
  nextId = 1;
  users.length = 0;
});

test("registerUser hashes the password and returns a safe user plus token", async () => {
  const result = await AuthService.registerUser({
    name: "Ada Lovelace",
    email: "ada@example.com",
    password: "CorrectHorse123",
  });

  assert.equal(result.user.email, "ada@example.com");
  assert.ok(result.token.length > 0);
  assert.ok(!("password" in result.user));
  assert.ok(!("password_hash" in result.user));

  const stored = users[0];
  assert.notEqual(stored.password_hash, "CorrectHorse123");
  assert.ok(stored.password_hash.startsWith("$2"));
});

test("registerUser rejects a duplicate email and never creates a row", async () => {
  await AuthService.registerUser({
    name: "Ada",
    email: "ada@example.com",
    password: "CorrectHorse123",
  });

  await assert.rejects(
    AuthService.registerUser({
      name: "Ada Again",
      email: "ADA@example.com",
      password: "AnotherPassword1",
    }),
    (err) => err.name === "ConflictError"
  );
  assert.equal(users.length, 1);
});

test("loginUser returns a session for valid credentials", async () => {
  await AuthService.registerUser({
    name: "Ada",
    email: "ada@example.com",
    password: "CorrectHorse123",
  });

  const result = await AuthService.loginUser({
    email: "ADA@example.com",
    password: "CorrectHorse123",
  });

  assert.equal(result.user.email, "ada@example.com");
  assert.ok(result.token.length > 0);
});

test("loginUser rejects a wrong password", async () => {
  await AuthService.registerUser({
    name: "Ada",
    email: "ada@example.com",
    password: "CorrectHorse123",
  });

  await assert.rejects(
    AuthService.loginUser({
      email: "ada@example.com",
      password: "WrongPassword",
    }),
    (err) => err.name === "UnauthorizedError"
  );
});

test("loginUser rejects an unknown email", async () => {
  await assert.rejects(
    AuthService.loginUser({
      email: "ghost@example.com",
      password: "CorrectHorse123",
    }),
    (err) => err.name === "UnauthorizedError"
  );
});

test("getCurrentUser returns the safe user for a valid id", async () => {
  const created = await AuthService.registerUser({
    name: "Ada",
    email: "ada@example.com",
    password: "CorrectHorse123",
  });

  const user = await AuthService.getCurrentUser(created.user.user_id);
  assert.equal(user.user_id, created.user.user_id);
  assert.equal(user.name, "Ada");
  assert.ok(!("password" in user));
});

test("getCurrentUser rejects an unknown id", async () => {
  await assert.rejects(
    AuthService.getCurrentUser("missing-id"),
    (err) => err.name === "UnauthorizedError"
  );
});

test("updateProfile updates the name and keeps the profile image", async () => {
  const created = await AuthService.registerUser({
    name: "Ada",
    email: "ada@example.com",
    password: "CorrectHorse123",
  });

  const result = await AuthService.updateProfile(
    created.user.user_id,
    {
      name: "Ada Lovelace",
      profile_image_url: "/uploads/profile/profile.jpg",
      removeProfileImage: false,
    }
  );

  assert.equal(result.user.name, "Ada Lovelace");
  assert.equal(
    result.user.profile_image_url,
    "/uploads/profile/profile.jpg"
  );
  assert.ok(!("password" in result.user));
});

test("updateProfile removes the profile image when requested", async () => {
  const created = await AuthService.registerUser({
    name: "Ada",
    email: "ada@example.com",
    password: "CorrectHorse123",
  });

  await AuthService.updateProfile(created.user.user_id, {
    profile_image_url: "/uploads/profile/profile.jpg",
  });

  const result = await AuthService.updateProfile(
    created.user.user_id,
    {
      removeProfileImage: true,
    }
  );

  assert.equal(result.user.profile_image_url, null);
  assert.equal(result.user.name, "Ada");
});

test("updateProfile rejects an unknown user", async () => {
  await assert.rejects(
    AuthService.updateProfile("missing-id", {
      name: "Ada",
    }),
    (err) => err.name === "UnauthorizedError"
  );
});

test("requestPasswordReset stores only a hash and never the plaintext token", async () => {
  const created = await AuthService.registerUser({
    name: "Ada",
    email: "ada@example.com",
    password: "CorrectHorse123",
  });

  const result = await AuthService.requestPasswordReset("ada@example.com");
  assert.ok(result.message.length > 0);
  assert.ok(result.resetToken.length > 0);

  const stored = users.find((user) => user.user_id === created.user.user_id);
  assert.ok(stored.reset_password_token_hash.length > 0);
  assert.notEqual(stored.reset_password_token_hash, result.resetToken);
  assert.ok(!stored.reset_password_token_hash.includes(result.resetToken));
});

test("requestPasswordReset returns a neutral response for an unknown email", async () => {
  const result = await AuthService.requestPasswordReset("ghost@example.com");
  assert.ok(result.message.length > 0);
  assert.equal(result.resetToken, undefined);
});

test("resetPassword updates the password and clears the token", async () => {
  const created = await AuthService.registerUser({
    name: "Ada",
    email: "ada@example.com",
    password: "CorrectHorse123",
  });

  const { resetToken } = await AuthService.requestPasswordReset(
    "ada@example.com"
  );

  await AuthService.resetPassword(resetToken, "BrandNewPassword99");

  const stored = users.find((user) => user.user_id === created.user.user_id);
  assert.ok(!stored.reset_password_token_hash);
  assert.ok(!stored.reset_password_expires_at);

  const login = await AuthService.loginUser({
    email: "ada@example.com",
    password: "BrandNewPassword99",
  });
  assert.equal(login.user.email, "ada@example.com");
});

test("resetPassword rejects an invalid token", async () => {
  await AuthService.registerUser({
    name: "Ada",
    email: "ada@example.com",
    password: "CorrectHorse123",
  });

  await assert.rejects(
    AuthService.resetPassword("not-a-real-token", "BrandNewPassword99"),
    (err) => err.name === "BadRequestError"
  );
});

test("resetPassword rejects an expired token", async () => {
  const created = await AuthService.registerUser({
    name: "Ada",
    email: "ada@example.com",
    password: "CorrectHorse123",
  });

  const { resetToken } = await AuthService.requestPasswordReset(
    "ada@example.com"
  );

  const stored = users.find((user) => user.user_id === created.user.user_id);
  stored.reset_password_expires_at = new Date(Date.now() - 1000);

  await assert.rejects(
    AuthService.resetPassword(resetToken, "BrandNewPassword99"),
    (err) => err.name === "BadRequestError"
  );
});
