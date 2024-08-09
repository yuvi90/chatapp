import { z } from "zod";

export const ForgotPasswordSchema = z.object({
  email: z.string().nonempty("Email is required !").trim().email("Invalid email address !"),
});

export type ForgotPasswordSchemaType = z.infer<typeof ForgotPasswordSchema>;

export const PasswordResetSchema = z.object({
  newPassword: z
    .string()
    .nonempty("Password is required !")
    .trim()
    .min(6, "Password must be between 6 and 12 characters !"),
});

export type PasswordResetSchemaType = z.infer<typeof PasswordResetSchema>;

export const ChangePasswordSchema = z.object({
  oldPassword: z
    .string()
    .nonempty("Password is required !")
    .trim()
    .min(6, "Password must be between 6 and 12 characters !"),
  newPassword: z
    .string()
    .nonempty("Password is required !")
    .trim()
    .min(6, "Password must be between 6 and 12 characters !"),
});

export type ChangePasswordSchemaType = z.infer<typeof ChangePasswordSchema>;
