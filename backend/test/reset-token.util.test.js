"use strict";

const { test } = require("node:test");
const assert = require("node:assert/strict");

const {
  generateResetToken,
  hashResetToken,
  RESET_TOKEN_TTL_MS,
} = require("../src/utils/reset-token.util");

test("generateResetToken returns a 64-character hex string", () => {
  assert.match(generateResetToken(), /^[0-9a-f]{64}$/);
});

test("generateResetToken produces unique values", () => {
  assert.notEqual(generateResetToken(), generateResetToken());
});

test("hashResetToken returns a 64-character sha256 hex string", () => {
  const token = "plaintext-reset-token";
  const hash = hashResetToken(token);
  assert.match(hash, /^[0-9a-f]{64}$/);
  assert.notEqual(hash, token);
});

test("hashResetToken never contains the plaintext token", () => {
  const token = "super-secret-token-abc-123";
  assert.ok(!hashResetToken(token).includes(token));
});

test("hashResetToken is deterministic for the same token", () => {
  const token = "repeatable-token";
  assert.equal(hashResetToken(token), hashResetToken(token));
});

test("RESET_TOKEN_TTL_MS is one hour", () => {
  assert.equal(RESET_TOKEN_TTL_MS, 60 * 60 * 1000);
});
