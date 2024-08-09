import { Request, Response, NextFunction } from "express";
// Importing Locals
import config from "@/config/index.js";
import userService from "@/services/v1/user.services.js";
import { ApiResponse, ApiError } from "@/utils/response-handler.js";
import { createHashToken, generateTemporaryToken, isAuthenticated } from "@/utils/helpers.js";
import {
  emailVerificationMailgenContent,
  forgotPasswordMailgenContent,
  sendEmail,
} from "@/utils/mail.js";

const UserController = {
  /**
   * Retrieves a list of all users.
   *
   * @param {Request} req - The request object.
   * @param {Response} res - The response object.
   * @param {NextFunction} next - The next function in the middleware chain.
   */
  getAllUsers: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const users = await userService.getUsers();
      return res.status(200).json(new ApiResponse(200, "Users fetched successfully!", users));
    } catch (error) {
      next(error);
    }
  },

  /**
   * Handles email verification by validating the provided token and updating the user's email verification status.
   *
   * @param {Request} req - The request object containing the email verification token.
   * @param {Response} res - The response object to send the result back to the client.
   * @param {NextFunction} next - The next function in the middleware chain.
   */
  verifyEmail: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { token } = req.params;
      if (!token) {
        throw new ApiError(400, "Email verification token is missing!");
      }

      // Generate a hash from the token that we are receiving
      let hashedToken = createHashToken(token);

      const user = await userService.verifyEmail(hashedToken);
      if (!user) {
        throw new ApiError(489, "Invalid verification token!");
      }

      // Delete hashedToken and tokenExpiry from DB and set isEmailVerified to true
      await userService.updateUser(user.id, {
        emailVerificationToken: null,
        emailVerificationExpiry: null,
        isEmailVerified: true,
      });

      return res.status(200).json(new ApiResponse(200, "Email verified successfully!"));
    } catch (error) {
      next(error);
    }
  },

  /**
   * Resends the verification email for the user.
   *
   * @param {Request} req - The request object.
   * @param {Response} res - The response object.
   * @param {NextFunction} next - The next function in the middleware chain.
   */
  resendVerificationEmail: async (req: Request, res: Response, next: NextFunction) => {
    try {
      // if user is not authenticated
      if (!isAuthenticated(req)) {
        throw new ApiError(401, "Unauthorized!");
      }

      const { username } = req.user;
      const user = await userService.getUserByProperty("username", username);

      // if user doesn't exist
      if (!user) {
        throw new ApiError(404, "User not found");
      }

      // if email is already verified throw an error
      if (user.isEmailVerified) {
        throw new ApiError(409, "Email is already verified!");
      }

      const { unHashedToken, hashedToken, tokenExpiry } = generateTemporaryToken();

      userService
        .updateUser(user.id, {
          emailVerificationToken: hashedToken,
          emailVerificationExpiry: tokenExpiry,
        })
        .then((user) => {
          if (!user) {
            throw new Error("Something went wrong while registering the user!");
          }
          // Send Email
          sendEmail({
            email: user.email,
            subject: "Please verify your email",
            mailgenContent: emailVerificationMailgenContent({
              username: user.userProfile ? user.userProfile.firstName : user.username,
              verificationUrl: `${req.protocol}://${req.get(
                "host",
              )}/api/v1/users/verify-email/${unHashedToken}`,
            }),
          });
        })
        .catch((error) => {
          console.log(error);
        });

      return res.status(200).json(new ApiResponse(200, "Verification email sent successfully!"));
    } catch (error) {
      next(error);
    }
  },

  /**
   * Sends a password reset email to the user with the provided email address.
   *
   * @param {Request} req - The request object containing the user's email.
   * @param {Response} res - The response object to send the API response.
   * @param {NextFunction} next - The next middleware function.
   * @throws {ApiError} - If the user is not found with the provided email address.
   * @throws {Error} - If something goes wrong while updating the user's reset password token.
   */
  forgotPassword: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email } = req.body as { email: string };

      const user = await userService.getUserByProperty("email", email);
      if (!user) {
        throw new ApiError(404, "User not found with this email address!");
      }

      const { unHashedToken, hashedToken, tokenExpiry } = generateTemporaryToken();

      // Update the user's reset password token and expiry in the database and send an email
      userService
        .updateUser(user.id, {
          resetPasswordToken: hashedToken,
          resetPasswordExpiry: tokenExpiry,
        })
        .then((user) => {
          if (!user) {
            throw new Error("Something went wrong while registering the user!");
          }
          // Send Email
          sendEmail({
            email: user.email,
            subject: "Reset your password",
            mailgenContent: forgotPasswordMailgenContent({
              username: user.userProfile ? user.userProfile.firstName : user.username,
              passwordResetUrl:
                // ! NOTE: Following link should be the link of the frontend page responsible to request password reset
                // ! Frontend will send the below token with the new password in the request body to the backend reset password endpoint
                `${config.forgotPasswordRedirectUrl}/${unHashedToken}`,
            }),
          });
        })
        .catch((error) => {
          console.log(error);
        });

      return res.status(200).json(new ApiResponse(200, "Password reset email sent successfully!"));
    } catch (error) {
      next(error);
    }
  },

  /**
   * Resets the user's password using a password reset token.
   *
   * @param {Request} req - The request object containing the token and new password.
   * @param {Response} res - The response object to send the API response.
   * @param {NextFunction} next - The next function to handle any errors.
   * @throws {ApiError} - If the password reset token is missing or invalid.
   */
  resetPassword: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { token } = req.params;
      const { newPassword, confirmPassword } = req.body as {
        newPassword: string;
        confirmPassword: string;
      };

      if (!token) {
        throw new ApiError(400, "Password reset token is missing!");
      }

      if (newPassword !== confirmPassword) {
        throw new ApiError(400, "Passwords do not match!");
      }

      // Generate a hash from the token that we are receiving
      let hashedToken = createHashToken(token);

      const user = await userService.verifyPasswordResetToken(hashedToken);
      if (!user) {
        throw new ApiError(489, "Invalid verification token!");
      }

      // Update the user's password
      await userService.updateUser(user.id, {
        password: await userService.createPasswordHash(newPassword),
        resetPasswordToken: null,
        resetPasswordExpiry: null,
      });

      return res.status(200).json(new ApiResponse(200, "Password reset successfully!"));
    } catch (error) {
      next(error);
    }
  },

  /**
   * A function to change the user's password after authentication.
   *
   * @param {Request} req - The request object containing the user data.
   * @param {Response} res - The response object to send the API response.
   * @param {NextFunction} next - The next middleware function.
   * @throws {ApiError} - If the user is not authenticated or if the password is incorrect.
   */
  changePassword: async (req: Request, res: Response, next: NextFunction) => {
    try {
      // if user is not authenticated
      if (!isAuthenticated(req)) {
        throw new ApiError(401, "Unauthorized!");
      }

      const { username } = req.user;
      const {
        oldPassword,
        newPassword,
        confirmPassword,
      }: { oldPassword: string; newPassword: string; confirmPassword: string } = req.body;

      const user = await userService.getUserByProperty("username", username);
      if (!user) {
        throw new ApiError(404, "User not found!");
      }

      const match = await userService.checkPassword(oldPassword, user.password);
      if (!match) {
        throw new ApiError(400, "Old password is incorrect!");
      }

      if (newPassword !== confirmPassword) {
        throw new ApiError(400, "Passwords do not match!");
      }

      await userService.updateUser(user.id, {
        password: await userService.createPasswordHash(newPassword),
      });

      return res.status(200).json(new ApiResponse(200, "Password changed successfully!"));
    } catch (error) {
      next(error);
    }
  },
};

export default UserController;
