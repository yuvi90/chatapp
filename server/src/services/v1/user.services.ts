import xPrisma, { ExtendedPrismaClient } from "../../config/db.js";
import { Prisma } from "@prisma/client";

class UserService {
  private prisma: ExtendedPrismaClient["users"];

  constructor(prisma: ExtendedPrismaClient["users"]) {
    this.prisma = prisma;
  }

  async getUsers() {
    return this.prisma.findMany({ include: { userProfile: true } });
  }

  async userSignUp(
    firstName: string,
    lastName: string,
    username: string,
    email: string,
    password: string,
    role: "basic" | "admin" = "basic"
  ) {
    return this.prisma.signUp(
      firstName,
      lastName,
      username,
      email,
      password,
      role
    );
  }

  async checkPassword(password: string, hash: string) {
    return this.prisma.checkPassword(password, hash);
  }

  async createPasswordHash(password: string) {
    return this.prisma.createPasswordHash(password);
  }

  async findExistingUser(username: string, email: string) {
    return this.prisma.findFirst({
      where: {
        OR: [{ username: { equals: username } }, { email: { equals: email } }],
      },
    });
  }

  async getUserByUsername(username: string) {
    return this.prisma.findUnique({
      where: {
        username,
      },
    });
  }

  async getUserByEmail(email: string) {
    return this.prisma.findUnique({
      where: {
        email,
      },
    });
  }

  async getUserById(id: string) {
    return this.prisma.findUnique({
      where: {
        id,
      },
    });
  }

  async updateUser(userId: string, data: Prisma.UsersUpdateInput) {
    return this.prisma.update({
      where: {
        id: userId,
      },
      data,
      include: {
        userProfile: true,
      },
    });
  }

  async getRefreshToken(refreshToken: string) {
    return this.prisma.findFirst({
      where: {
        refreshToken,
      },
    });
  }

  async saveRefreshToken(userId: string, refreshToken: string) {
    return this.prisma.update({
      where: {
        id: userId,
      },
      data: {
        refreshToken,
      },
    });
  }

  async deleteRefreshToken(userId: string, refreshToken: string) {
    return this.prisma.update({
      where: {
        id: userId,
      },
      data: {
        refreshToken: null,
      },
    });
  }

  async resendVerificationEmail(email: string) {
    return this.prisma.findFirst({
      where: {
        email,
      },
    });
  }

  async verifyEmail(token: string) {
    return this.prisma.findFirst({
      where: {
        AND: [
          { emailVerificationToken: { equals: token } },
          { emailVerificationExpiry: { gte: new Date() } },
        ],
      },
    });
  }

  async verifyPasswordResetToken(token: string) {
    return this.prisma.findFirst({
      where: {
        AND: [
          { resetPasswordToken: { equals: token } },
          { resetPasswordExpiry: { gte: new Date() } },
        ],
      },
    });
  }
}

export default new UserService(xPrisma.users);
