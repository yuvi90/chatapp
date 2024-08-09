import { Request, Response, NextFunction } from "express";
// Importing Locals
import userService from "@/services/v1/user.services.js";
import { ApiResponse, ApiError } from "@/utils/response-handler.js";
import { sendEmail, emailVerificationMailgenContent } from "@/utils/mail.js";
import {
  generateAccessToken,
  generateRefreshToken,
  generateTemporaryToken,
  verifyToken,
} from "@/utils/helpers.js";
// Types
import { SignUpSchema, SignInSchema } from "@/validators/auth.validators.js";

interface TypedRequestBody<T> extends Request {
  body: T;
}
interface TypedRequestCookies extends Request {
  cookies: {
    jwt?: string;
  };
}

const AuthController = {
  /**
   * Handles user registration by creating a new user account and sending a verification email.
   *
   * @param {TypedRequestBody<SignUpSchema>} req - The request object containing user registration details.
   * @param {Response} res - The response object to send the result back to the client.
   * @param {NextFunction} next - The next function in the middleware chain.
   */
  registerUser: async (req: TypedRequestBody<SignUpSchema>, res: Response, next: NextFunction) => {
    try {
      const { username, password, email, firstName, lastName } = req.body;

      // Check for duplicate username or email
      const duplicateUser = await userService.findExistingUser(username, email);
      if (duplicateUser) {
        throw new ApiError(409, "User with email or username already exists!");
      }

      // Create and store new user
      const user = await userService.userSignUp(firstName, lastName, username, email, password);
      if (!user) {
        throw new ApiError(500, "Something went wrong while registering the user!");
      }

      /**
       * unHashedToken: UnHashed token is send to the user's mail
       * hashedToken: To keep record of hashedToken to validate the unHashedToken in verify email controller
       * tokenExpiry: Expiry to be checked before validating the incoming token
       */
      const { unHashedToken, hashedToken, tokenExpiry } = generateTemporaryToken();

      // Update user with verification token
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

      // Send Response
      return res.status(201).json(new ApiResponse(200, "User created successfully!"));
    } catch (error) {
      next(error);
    }
  },

  /**
   * Handles user login by verifying username and password, generating access and refresh tokens,
   * and setting cookies for further authentication.
   *
   * @param {Request} req - The incoming HTTP request.
   * @param {Response} res - The outgoing HTTP response.
   * @param {NextFunction} next - The next middleware function in the stack.
   */
  loginUser: async (req: TypedRequestBody<SignInSchema>, res: Response, next: NextFunction) => {
    try {
      const { username, password } = req.body;

      // Check User existence
      const foundUser = await userService.getUserByProperty("username", username);
      if (!foundUser) {
        // No User
        throw new ApiError(400, "User not found!");
      }

      // Check Password
      const match = await userService.checkPassword(password, foundUser.password);
      if (!match) {
        throw new ApiError(400, "Invalid Password!");
      }

      // Access Token
      const tokenPayload: TokenPayload.JwtPayload = {
        user: {
          _id: foundUser.id,
          username: foundUser.username,
          role: foundUser.role,
        },
      };
      const accessToken = generateAccessToken(tokenPayload);
      if (!accessToken) {
        throw new ApiError(500, "Something went wrong!");
      }

      // Refresh Token
      const refreshTokenPayload: TokenPayload.RefreshTokenPayLoad = {
        _id: foundUser.id,
        username: foundUser.username,
      };
      const refreshToken = generateRefreshToken(refreshTokenPayload);
      if (!refreshToken) {
        throw new ApiError(500, "Something went wrong!");
      }

      // Save RefreshToken in Database
      const result = await userService.updateUser(foundUser.id, {
        refreshToken: refreshToken,
      });
      if (!result) {
        throw new ApiError(500, "Something went wrong!");
      }

      // Set Cookies
      res.cookie("jwt", refreshToken, {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
        // TODO: Add SameSite and Secure
        // sameSite: "none",
        // secure: true,
      });

      // Send Response
      res.status(201).json(
        new ApiResponse(200, "Login successful!", {
          accessToken,
          user: {
            _id: foundUser.id,
            avatar: foundUser.userProfile?.avatar,
            username: foundUser.username,
            firstName: foundUser.userProfile?.firstName,
            lastName: foundUser.userProfile?.lastName,
            role: foundUser.role,
            email: foundUser.email,
            isEmailVerified: foundUser.isEmailVerified,
            loginType: foundUser.loginType,
          },
        }),
      );
    } catch (error) {
      next(error);
    }
  },

  /**
   * Handles user logout by verifying the refresh token, deleting the refresh token from the database,
   * and clearing the cookie.
   *
   * @param {TypedRequestCookies} req - The incoming HTTP request with cookies.
   * @param {Response} res - The outgoing HTTP response.
   * @param {NextFunction} next - The next middleware function in the stack.
   */
  logoutUser: async (req: TypedRequestCookies, res: Response, next: NextFunction) => {
    try {
      const cookies = req.cookies;
      // Check Cookies
      if (!cookies?.jwt) return res.sendStatus(204);

      const refreshToken = cookies.jwt;

      // Check user existence with refresh token
      const foundUser = await userService.getUserByProperty("refreshToken", refreshToken);
      if (!foundUser) {
        res.clearCookie("jwt", {
          httpOnly: true,
          // TODO: Add SameSite and Secure
          // sameSite: "none",
          // secure: true,
        });
        return res.sendStatus(204);
      }

      // If user found
      const result = await userService.updateUser(foundUser.id, {
        refreshToken: null,
      });
      if (!result) return res.sendStatus(403);

      return res
        .clearCookie("jwt", {
          httpOnly: true,
          // sameSite: "none",
          // secure: true,
        })
        .sendStatus(204);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Refreshes an access token using a provided refresh token.
   *
   * @param {TypedRequestCookies} req - The incoming HTTP request with cookies.
   * @param {Response} res - The outgoing HTTP response.
   * @param {NextFunction} next - The next middleware function in the stack.
   */
  refreshAccessToken: async (req: TypedRequestCookies, res: Response, next: NextFunction) => {
    try {
      const cookies = req.cookies;
      if (!cookies?.jwt) return res.sendStatus(401); // Unauthorized

      const refreshToken = cookies.jwt;

      // Check user existence with refresh token
      const foundUser = await userService.getUserByProperty("refreshToken", refreshToken);
      if (!foundUser) return res.status(403); // Forbidden

      // Validate refresh token
      const decoded = verifyToken<TokenPayload.RefreshTokenPayLoad>(refreshToken, "refresh");

      // Forbidden (if invalid token)
      if (
        typeof decoded === "string" ||
        !decoded?._id ||
        !decoded?.username ||
        foundUser.id !== decoded._id ||
        foundUser.username !== decoded.username
      )
        return res.sendStatus(403); // Forbidden

      // Generate a new access token
      const tokenPayload: TokenPayload.JwtPayload = {
        user: {
          _id: foundUser.id,
          username: foundUser.username,
          role: foundUser.role,
        },
      };
      const accessToken = generateAccessToken(tokenPayload);
      if (!accessToken) {
        throw new ApiError(500, "Something went wrong!");
      }

      // Send Response
      return res.status(201).json(
        new ApiResponse(200, "Success!", {
          accessToken,
        }),
      );
    } catch (error) {
      next(error);
    }
  },
};

export default AuthController;
