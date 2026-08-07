import { z } from "zod";

// These rules mirror the backend Joi schemas (src/validations/auth.validation.js):
// email is required and capped at 255 characters, passwords are 8-72 characters,
// and names are 1-100 characters. Keeping both sides aligned means a request the
// frontend accepts will never be rejected by the backend for a rule we forgot.
export const emailSchema = z.email({
  message: "Enter a valid email address.",
}).max(255, {
  message: "Email must be at most 255 characters.",
});

export const passwordSchema = z
  .string()
  .min(8, { message: "Password must be at least 8 characters." })
  .max(72, { message: "Password must not exceed 72 characters." });

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, { message: "Enter your password." }),
});

export const signupSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, { message: "Enter your full name." })
      .max(100, { message: "Name cannot exceed 100 characters." }),
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, {
      message: "Re-enter your password to confirm it.",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string().min(1, {
      message: "Re-enter your new password.",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export type LoginFormValues = z.infer<typeof loginSchema>;
export type SignupFormValues = z.infer<typeof signupSchema>;
export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;
