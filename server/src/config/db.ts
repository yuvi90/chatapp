import { Prisma, PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const signUpExtension = Prisma.defineExtension({
  model: {
    users: {
      async signUp(
        firstName: string,
        lastName: string,
        username: string,
        email: string,
        password: string,
        role: "basic" | "admin" = "basic"
      ) {
        const hash = await bcrypt.hash(password, 12);
        return xPrisma.users.create({
          data: {
            username,
            email,
            password: hash,
            loginType: "email",
            role,
            userProfile: {
              create: {
                firstName,
                lastName,
              },
            },
          },
        });
      },
      async createPasswordHash(password: string) {
        return bcrypt.hash(password, 12);
      },
      async checkPassword(password: string, hash: string) {
        return bcrypt.compare(password, hash);
      },
    },
  },
});

const xPrisma = new PrismaClient().$extends(signUpExtension);

export default xPrisma;
export type ExtendedPrismaClient = typeof xPrisma;
