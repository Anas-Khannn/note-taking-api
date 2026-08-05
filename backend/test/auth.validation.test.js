"use strict";

const { test } = require("node:test");
const assert = require("node:assert/strict");

const {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} = require("../src/validations/auth.validation");

test("registerSchema accepts a valid registration", () => {
  const { error, value } = registerSchema.validate({
    name: "Ada Lovelace",
    email: "ADA@Example.COM",
    password: "StrongPassword123",
  });
  assert.equal(error, undefined);
  assert.equal(value.email, "ada@example.com");
});

test("registerSchema strips unknown fields (no password leak into extra keys)", () => {
  const { value } = registerSchema.validate({
    name: "Ada",
    email: "ada@example.com",
    password: "StrongPassword123",
    confirmPassword: "StrongPassword123",
  });
  assert.equal("confirmPassword" in value, false);
});

test("registerSchema rejects a short password", () => {
  const { error } = registerSchema.validate({
    name: "Ada",
    email: "ada@example.com",
    password: "short",
  });
  assert.ok(error);
});

test("registerSchema rejects an invalid email", () => {
  const { error } = registerSchema.validate({
    name: "Ada",
    email: "not-an-email",
    password: "StrongPassword123",
  });
  assert.ok(error);
});

test("loginSchema accepts valid credentials", () => {
  const { error } = loginSchema.validate({
    email: "ada@example.com",
    password: "whatever",
  });
  assert.equal(error, undefined);
});

test("loginSchema rejects a missing password", () => {
  const { error } = loginSchema.validate({ email: "ada@example.com" });
  assert.ok(error);
});

test("forgotPasswordSchema accepts an email and strips extras", () => {
  const { error, value } = forgotPasswordSchema.validate({
    email: "ada@example.com",
    extra: "ignored",
  });
  assert.equal(error, undefined);
  assert.equal("extra" in value, false);
});

test("forgotPasswordSchema rejects an invalid email", () => {
  const { error } = forgotPasswordSchema.validate({ email: "nope" });
  assert.ok(error);
});

test("resetPasswordSchema accepts a token and strong password", () => {
  const { error } = resetPasswordSchema.validate({
    token: "abc123",
    password: "NewStrongPassword123",
  });
  assert.equal(error, undefined);
});

test("resetPasswordSchema rejects a missing token", () => {
  const { error } = resetPasswordSchema.validate({
    password: "NewStrongPassword123",
  });
  assert.ok(error);
});

test("resetPasswordSchema rejects a weak password", () => {
  const { error } = resetPasswordSchema.validate({
    token: "abc123",
    password: "short",
  });
  assert.ok(error);
});
