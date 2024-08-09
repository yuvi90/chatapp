import { z } from "zod";

export const ChangeRoleSchema = z.object({
  userId: z.string().trim().min(1, "User Id is required!"),
  role: z.enum(["basic", "admin"]),
});

export type ChangeRoleSchema = z.infer<typeof ChangeRoleSchema>;
