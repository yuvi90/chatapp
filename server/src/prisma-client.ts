import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient().$extends({
  model: {
    users: {
      async signUp(
        username: string,
        email: string,
        password: string,
        role: "basic" | "admin" = "basic"
      ) {
        const hash = await bcrypt.hash(password, 12);
        return prisma.users.create({
          data: {
            username,
            email,
            password: hash,
            loginType: "email",
            role,
          },
        });
      },
    },
  },
});

export default prisma;
