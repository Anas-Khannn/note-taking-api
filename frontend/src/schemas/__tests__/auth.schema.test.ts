import { describe, expect, it } from "vitest";

import {
  emailSchema,
  forgotPasswordSchema,
  loginSchema,
  passwordSchema,
  resetPasswordSchema,
  signupSchema,
} from "@/schemas/auth.schema";

const validEmail = "ada@example.com";

describe("emailSchema", () => {
  it("accepts a valid email", () => {
    expect(emailSchema.safeParse(validEmail).success).toBe(true);
  });

  it("rejects an invalid email", () => {
    const result = emailSchema.safeParse("not-an-email");

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        "Enter a valid email address."
      );
    }
  });

  it("rejects an email longer than 255 characters (backend max)", () => {
    const result = emailSchema.safeParse(`${"a".repeat(250)}@example.com`);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(
        result.error.issues.some(
          (issue) => issue.message === "Email must be at most 255 characters."
        )
      ).toBe(true);
    }
  });
});

describe("passwordSchema", () => {
  it("rejects a password shorter than 8 characters", () => {
    const result = passwordSchema.safeParse("short");

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        "Password must be at least 8 characters."
      );
    }
  });

  it("accepts a password of at least 8 characters", () => {
    expect(passwordSchema.safeParse("password123").success).toBe(true);
  });

  it("rejects a password longer than 72 characters (backend max)", () => {
    const result = passwordSchema.safeParse("p".repeat(73));

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(
        result.error.issues.some(
          (issue) => issue.message === "Password must not exceed 72 characters."
        )
      ).toBe(true);
    }
  });
});

describe("loginSchema", () => {
  it("accepts valid credentials", () => {
    const result = loginSchema.safeParse({
      email: validEmail,
      password: "password123",
    });

    expect(result.success).toBe(true);
  });

  it("rejects an invalid email", () => {
    const result = loginSchema.safeParse({
      email: "nope",
      password: "password123",
    });

    expect(result.success).toBe(false);
  });

  it("rejects an empty password", () => {
    const result = loginSchema.safeParse({
      email: validEmail,
      password: "",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(
        result.error.issues.some(
          (issue) => issue.message === "Enter your password."
        )
      ).toBe(true);
    }
  });
});

describe("signupSchema", () => {
  it("accepts a valid signup", () => {
    const result = signupSchema.safeParse({
      name: "Ada Lovelace",
      email: validEmail,
      password: "password123",
      confirmPassword: "password123",
    });

    expect(result.success).toBe(true);
  });

  it("rejects an empty name", () => {
    const result = signupSchema.safeParse({
      name: "   ",
      email: validEmail,
      password: "password123",
      confirmPassword: "password123",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Enter your full name.");
    }
  });

  it("rejects a password shorter than 8 characters", () => {
    const result = signupSchema.safeParse({
      name: "Ada Lovelace",
      email: validEmail,
      password: "short",
      confirmPassword: "short",
    });

    expect(result.success).toBe(false);
  });

  it("rejects mismatched passwords", () => {
    const result = signupSchema.safeParse({
      name: "Ada Lovelace",
      email: validEmail,
      password: "password123",
      confirmPassword: "password456",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      const mismatch = result.error.issues.find(
        (issue) => issue.message === "Passwords do not match."
      );
      expect(mismatch).toBeDefined();
      expect(mismatch?.path).toEqual(["confirmPassword"]);
    }
  });

  it("rejects an invalid email", () => {
    const result = signupSchema.safeParse({
      name: "Ada Lovelace",
      email: "nope",
      password: "password123",
      confirmPassword: "password123",
    });

    expect(result.success).toBe(false);
  });

  it("rejects a name longer than 100 characters (backend max)", () => {
    const result = signupSchema.safeParse({
      name: "A".repeat(101),
      email: validEmail,
      password: "password123",
      confirmPassword: "password123",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(
        result.error.issues.some(
          (issue) => issue.message === "Name cannot exceed 100 characters."
        )
      ).toBe(true);
    }
  });

  it("rejects a password longer than 72 characters (backend max)", () => {
    const result = signupSchema.safeParse({
      name: "Ada Lovelace",
      email: validEmail,
      password: "p".repeat(73),
      confirmPassword: "p".repeat(73),
    });

    expect(result.success).toBe(false);
  });
});

describe("forgotPasswordSchema", () => {
  it("accepts a valid email", () => {
    expect(forgotPasswordSchema.safeParse({ email: validEmail }).success).toBe(
      true
    );
  });

  it("rejects an invalid email", () => {
    expect(forgotPasswordSchema.safeParse({ email: "nope" }).success).toBe(
      false
    );
  });
});

describe("resetPasswordSchema", () => {
  it("accepts matching passwords", () => {
    const result = resetPasswordSchema.safeParse({
      password: "password123",
      confirmPassword: "password123",
    });

    expect(result.success).toBe(true);
  });

  it("rejects mismatched passwords", () => {
    const result = resetPasswordSchema.safeParse({
      password: "password123",
      confirmPassword: "password456",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      const mismatch = result.error.issues.find(
        (issue) => issue.message === "Passwords do not match."
      );
      expect(mismatch?.path).toEqual(["confirmPassword"]);
    }
  });
});
