import { z } from "zod";

// Email validation is intentionally strict enough to catch typos while not
// enforcing a specific provider. Adjust to the backend's rules when shipped.
export const emailSchema = z.email({
  message: "Enter a valid email address.",
});

// Baseline password rules. The backend does not define auth rules yet; this
// keeps a reasonable minimum without inventing overly strict requirements.
// Align `passwordSchema` with the backend's rules once auth is implemented.
export const passwordSchema = z
  .string()
  .min(8, { message: "Password must be at least 8 characters." });

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, { message: "Enter your password." }),
});

export const signupSchema = z
  .object({
    name: z.string().trim().min(1, { message: "Enter your full name." }),
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
