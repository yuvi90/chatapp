import xPrisma, { ExtendedPrismaClient } from "../../config/db.js";
import { Prisma, User, UserProfile } from "@prisma/client";

type UserWithProfile = Pick<
  User,
  "id" | "username" | "email" | "role" | "loginType" | "isEmailVerified" | "createdAt" | "updatedAt"
> & {
  userProfile: Pick<UserProfile, "firstName" | "lastName" | "avatar"> | null;
};

class UserService {
  private prisma: ExtendedPrismaClient["user"];

  constructor(prisma: ExtendedPrismaClient["user"]) {
    this.prisma = prisma;
  }

  /**
   * Retrieves a list of all users.
   * @return {Promise<UserWithProfile[]>} A promise that resolves to a list of users.
   */
  async getUsers(): Promise<UserWithProfile[]> {
    return this.prisma.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        loginType: true,
        isEmailVerified: true,
        createdAt: true,
        updatedAt: true,
        userProfile: {
          select: {
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
      },
    });
  }

  /**
   * Registers a new user with the given details.
   *
   * @param {string} firstName - The first name of the user.
   * @param {string} lastName - The last name of the user.
   * @param {string} username - The username of the user.
   * @param {string} email - The email of the user.
   * @param {string} password - The password of the user.
   * @param {"basic" | "admin"} [role="basic"] - The role of the user. Defaults to "basic".
   * @return {Promise<User | null>} A promise that resolves to the created user.
   */
  async userSignUp(
    firstName: string,
    lastName: string,
    username: string,
    email: string,
    password: string,
    role: "basic" | "admin" = "basic",
  ): Promise<User | null> {
    return this.prisma.signUp(firstName, lastName, username, email, password, role);
  }

  /**
   * Checks if the provided password matches the hashed password.
   *
   * @param {string} password - The password to be checked.
   * @param {string} hash - The hashed password to compare against.
   * @return {Promise<boolean>} A promise that resolves to a boolean indicating if the password matches the hash.
   */
  async checkPassword(password: string, hash: string): Promise<boolean> {
    return this.prisma.checkPassword(password, hash);
  }

  /**
   * Creates a hashed password from the provided password.
   *
   * @param {string} password - The password to be hashed.
   * @return {Promise<string>} A promise that resolves to the hashed password.
   */
  async createPasswordHash(password: string): Promise<string> {
    return this.prisma.createPasswordHash(password);
  }

  /**
   * Finds a user by username or email.
   *
   * @param {string} username - The username to search for.
   * @param {string} email - The email to search for.
   * @returns {Promise<User | null>} - The found user or null if not found.
   */
  async findExistingUser(username: string, email: string): Promise<User | null> {
    return this.prisma.findFirst({
      where: {
        OR: [{ username: { equals: username } }, { email: { equals: email } }],
      },
    });
  }

  /**
   * Retrieves a user by a specific property.
   *
   * @param {"id" | "username" | "email" | "refreshToken"} property - The property to search for (e.g. 'username', 'email', etc.).
   * @param {User["id" | "username" | "email" | "refreshToken"]} value - The value of the property to search for.
   * @return {Promise<(User & { userProfile: UserProfile | null }) | null>} A promise that resolves to the user with the given property value, or null if not found.
   */
  async getUserByProperty(
    property: "id" | "username" | "email" | "refreshToken",
    value: User["id" | "username" | "email" | "refreshToken"],
  ): Promise<(User & { userProfile: UserProfile | null }) | null> {
    return this.prisma.findFirst({
      where: {
        [property]: {
          equals: value,
        },
      },
      include: {
        userProfile: true,
      },
    });
  }

  /**
   * Updates a user with the given user ID and data.
   *
   * @param {string} userId - The ID of the user to update.
   * @param {Prisma.UserUpdateInput} data - The data to update the user with.
   * @return {Promise<User & { userProfile: UserProfile | null } | null>} A promise that resolves to the updated user or null if not found.
   */
  async updateUser(
    userId: string,
    data: Prisma.UserUpdateInput,
  ): Promise<(User & { userProfile: UserProfile | null }) | null> {
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

  /**
   * Verifies a user's email by checking if the provided token matches the email verification token and if it has not expired.
   *
   * @param {string} token - The email verification token to verify.
   * @return {Promise<User | null>} A promise that resolves to the user with the verified email or null if not found.
   */
  async verifyEmail(token: string): Promise<User | null> {
    return this.prisma.findFirst({
      where: {
        AND: [
          { emailVerificationToken: { equals: token } },
          { emailVerificationExpiry: { gte: new Date() } },
        ],
      },
    });
  }

  /**
   * Verifies a password reset token by checking if it matches the token stored in the database and if it has not expired.
   *
   * @param {string} token - The password reset token to verify.
   * @return {Promise<User | null>} A promise that resolves to the user with the matching token or null if not found.
   */
  async verifyPasswordResetToken(token: string): Promise<User | null> {
    return this.prisma.findFirst({
      where: {
        AND: [
          { resetPasswordToken: { equals: token } },
          { resetPasswordExpiry: { gte: new Date() } },
        ],
      },
    });
  }

  /**
   * Updates the avatar of a user with the given userId.
   *
   * @param {string} userId - The ID of the user whose avatar is being updated.
   * @param {string} fileName - The new file name for the avatar.
   */
  async updateAvatar(userId: string, fileName: string) {
    return this.prisma.update({
      where: {
        id: userId,
      },
      include: {
        userProfile: true,
      },
      data: {
        userProfile: {
          update: {
            avatar: fileName,
          },
        },
      },
    });
  }
}

export default new UserService(xPrisma.user);
