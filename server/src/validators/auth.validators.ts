import { z } from "zod";

export const RegisterSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(1, "First Name is required!")
    .min(3, "First Name must be between 3 and 12 characters!")
    .max(12, "First name must be between 3 and 12 characters!"),
  lastName: z
    .string()
    .trim()
    .min(1, "Last Name is required!")
    .min(3, "Last Name must be between 3 and 12 characters!")
    .max(12, "Last Name must be between 3 and 12 characters!"),
  username: z
    .string()
    .trim()
    .min(1, "Username is required!")
    .toLowerCase()
    .min(3, "Username must be between 3 and 12 characters!")
    .max(12, "Username must be between 3 and 12 characters!"),
  password: z
    .string()
    .trim()
    .min(1, "Password is required!")
    .min(6, "Password must be between 6 and 20 characters!")
    .max(20, "Password must be between 6 and 20 characters!"),
  email: z.string().trim().min(1, "Email is required!").email("Invalid email address!"),
});

export type SignUpSchema = z.infer<typeof RegisterSchema>;

export const LoginSchema = z.object({
  username: z.string().trim().min(1, "Username is required!").toLowerCase(),
  password: z.string().trim().min(1, "Password is required!"),
});

export type SignInSchema = z.infer<typeof LoginSchema>;
