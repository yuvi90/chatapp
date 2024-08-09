import { z } from "zod";

export const ForgotPasswordSchema = z.object({
  email: z.string().trim().min(1, "Email is required!").email("Invalid email address!"),
});

export type ForgotPasswordSchemaType = z.infer<typeof ForgotPasswordSchema>;

export const PasswordResetSchema = z.object({
  newPassword: z
    .string()
    .trim()
    .min(1, "Password is required!")
    .min(6, "Password must be between 6 and 20 characters!")
    .max(20, "Password must be between 6 and 20 characters!"),
  confirmPassword: z
    .string()
    .trim()
    .min(1, "Password is required!")
    .min(6, "Password must be between 6 and 20 characters!")
    .max(20, "Password must be between 6 and 20 characters!"),
});

export type PasswordResetSchemaType = z.infer<typeof PasswordResetSchema>;

export const ChangePasswordSchema = z.object({
  oldPassword: z
    .string()
    .trim()
    .min(1, "Password is required!")
    .min(6, "Password must be between 6 and 20 characters!")
    .max(20, "Password must be between 6 and 20 characters!"),
  newPassword: z
    .string()
    .trim()
    .min(1, "Password is required!")
    .min(6, "Password must be between 6 and 20 characters!")
    .max(20, "Password must be between 6 and 20 characters!"),
  confirmPassword: z
    .string()
    .trim()
    .min(1, "Password is required!")
    .min(6, "Password must be between 6 and 20 characters!")
    .max(20, "Password must be between 6 and 20 characters!"),
});

export type ChangePasswordSchemaType = z.infer<typeof ChangePasswordSchema>;
