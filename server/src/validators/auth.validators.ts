import { z } from "zod";

export const RegisterSchema = z.object({
  firstName: z
    .string()
    .nonempty("First name is required !")
    .trim()
    .min(3, "First name must be between 3 and 12 characters !")
    .max(12, "First name must be between 3 and 12 characters !"),
  lastName: z
    .string()
    .nonempty("Last name is required !")
    .trim()
    .min(3, "Last name must be between 3 and 12 characters !")
    .max(12, "Last name must be between 3 and 12 characters !"),
  username: z
    .string()
    .nonempty("Username is required !")
    .trim()
    .toLowerCase()
    .min(3, "Username must be between 3 and 12 characters !")
    .max(12, "Username must be between 3 and 12 characters !"),
  email: z
    .string()
    .nonempty("Email is required !")
    .trim()
    .email("Invalid email address !"),
  password: z
    .string()
    .nonempty("Password is required !")
    .trim()
    .min(6, "Password must be between 6 and 12 characters !"),
});

export type SignUpSchema = z.infer<typeof RegisterSchema>;

export const LoginSchema = z.object({
  username: z.string().nonempty("Username is required !").trim().toLowerCase(),
  password: z.string().nonempty("Password is required !").trim(),
});

export type SignInSchema = z.infer<typeof LoginSchema>;
