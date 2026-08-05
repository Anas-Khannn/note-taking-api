"use strict";

const { test } = require("node:test");
const assert = require("node:assert/strict");

const {
  BCRYPT_ROUNDS,
  hashPassword,
  comparePassword,
} = require("../src/utils/password.util");

test("BCRYPT_ROUNDS is 10", () => {
  assert.equal(BCRYPT_ROUNDS, 10);
});

test("hashPassword never stores the plaintext password", async () => {
  const plaintext = "SuperSecret123";
  const hash = await hashPassword(plaintext);
  assert.notEqual(hash, plaintext);
  assert.ok(!hash.includes(plaintext));
  assert.ok(hash.startsWith("$2"));
  assert.equal(hash.length, 60);
});

test("comparePassword verifies the correct password", async () => {
  const hash = await hashPassword("SuperSecret123");
  assert.equal(await comparePassword("SuperSecret123", hash), true);
});

test("comparePassword rejects an incorrect password", async () => {
  const hash = await hashPassword("SuperSecret123");
  assert.equal(await comparePassword("WrongPassword", hash), false);
});
