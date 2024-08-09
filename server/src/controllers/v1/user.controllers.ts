import { Request, Response, NextFunction } from "express";
// Importing Locals
import config from "../../config/index.js";
import userService from "../../services/v1/user.services.js";
import { ApiResponse, ApiError } from "../../utils/response-handler.js";
import { createHashToken, generateTemporaryToken, isAuthenticated } from "../../utils/helpers.js";
import {
  emailVerificationMailgenContent,
  forgotPasswordMailgenContent,
  sendEmail,
} from "../../utils/mail.js";

interface TypedRequestBody<T> extends Request {
  body: T;
}
interface TypedRequestCookies extends Request {
  cookies: {
    jwt?: string;
  };
}

const UserController = {
  // Get All Users
  getAllUsers: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const users = await userService.getUsers();
      return res.status(200).json(new ApiResponse(200, "Users fetched successfully !", users));
    } catch (error) {
      next(error);
    }
  },

  verifyEmail: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { token } = req.params;

      if (!token) {
        throw new ApiError(400, "Email verification token is missing");
      }

      // Generate a hash from the token that we are receiving
      let hashedToken = createHashToken(token);

      const user = await userService.verifyEmail(hashedToken);

      if (!user) {
        throw new ApiError(489, "Invalid verification token");
      }

      // Delete hashedToken and tokenExpiry from DB and set isEmailVerified to true
      await userService.updateUser(user.id, {
        emailVerificationToken: null,
        emailVerificationExpiry: null,
        isEmailVerified: true,
      });

      return res.status(200).json(new ApiResponse(200, "Email verified successfully !"));
    } catch (error) {
      next(error);
    }
  },

  resendVerificationEmail: async (req: Request, res: Response, next: NextFunction) => {
    try {
      // if user is not authenticated
      if (!isAuthenticated(req)) {
        throw new ApiError(401, "Unauthorized!");
      }

      const { username } = req.user;
      const user = await userService.getUserByUsername(username);

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
          // Send Email
          sendEmail({
            email: user.email,
            subject: "Please verify your email",
            mailgenContent: emailVerificationMailgenContent({
              username: user.userProfile ? user.userProfile.firstName : user.username,
              verificationUrl: `${req.protocol}://${req.get(
                "host",
              )}/api/users/verify-email/${unHashedToken}`,
            }),
          });
        })
        .catch((error) => {
          console.log(error);
        });

      return res.status(200).json(new ApiResponse(200, "Verification email sent successfully !"));
    } catch (error) {
      next(error);
    }
  },

  forgotPassword: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email } = req.body as { email: string };

      const user = await userService.getUserByEmail(email);
      if (!user) {
        throw new ApiError(404, "User not found with this email address !");
      }

      const { unHashedToken, hashedToken, tokenExpiry } = generateTemporaryToken();

      userService
        .updateUser(user.id, {
          resetPasswordToken: hashedToken,
          resetPasswordExpiry: tokenExpiry,
        })
        .then((user) => {
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
      return res.status(200).json(new ApiResponse(200, "Password reset email sent successfully !"));
    } catch (error) {
      next(error);
    }
  },

  resetPassword: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { token } = req.params;
      const { newPassword } = req.body;

      if (!token) {
        throw new ApiError(400, "Password reset token is missing");
      }

      // Generate a hash from the token that we are receiving
      let hashedToken = createHashToken(token);

      const user = await userService.verifyPasswordResetToken(hashedToken);

      if (!user) {
        throw new ApiError(489, "Invalid verification token");
      }

      await userService.updateUser(user.id, {
        password: await userService.createPasswordHash(newPassword),
        resetPasswordToken: null,
        resetPasswordExpiry: null,
      });

      return res.status(200).json(new ApiResponse(200, "Password reset successfully !"));
    } catch (error) {
      next(error);
    }
  },

  changePassword: async (req: Request, res: Response, next: NextFunction) => {
    try {
      // if user is not authenticated
      if (!isAuthenticated(req)) {
        throw new ApiError(401, "Unauthorized!");
      }

      const { username } = req.user;
      const { oldPassword, newPassword }: { oldPassword: string; newPassword: string } = req.body;

      const user = await userService.getUserByUsername(username);
      if (!user) {
        throw new ApiError(404, "User not found");
      }

      const match = await userService.checkPassword(oldPassword, user.password);
      if (!match) {
        throw new ApiError(400, "Old password is incorrect");
      }

      await userService.updateUser(user.id, {
        password: await userService.createPasswordHash(newPassword),
      });

      return res.status(200).json(new ApiResponse(200, "Password changed successfully !"));
    } catch (error) {
      next(error);
    }
  },
};

export default UserController;
