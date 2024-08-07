import { Request, Response, NextFunction } from "express";
// Importing Locals
import userService from "../services/user.services.js";
import { ApiResponse, ApiError } from "../utils/response-handler.js";
import {
  generateAccessToken,
  generateRefreshToken,
  generateTemporaryToken,
  verifyToken,
} from "../utils/helpers.js";

// Types
import { SignUpSchema, SignInSchema } from "../validators/auth.validators.js";
import { JwtPayload, RefreshTokenPayLoad } from "../types/types.js";
import { sendEmail, emailVerificationMailgenContent } from "../utils/mail.js";

interface TypedRequestBody<T> extends Request {
  body: T;
}
interface TypedRequestCookies extends Request {
  cookies: {
    jwt?: string;
  };
}

const AuthController = {
  // Register New User
  registerUser: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { username, password, email, firstName, lastName }: SignUpSchema =
        req.body;

      // Check for duplicate username or email
      const duplicateUser = await userService.findExistingUser(username, email);

      if (duplicateUser) {
        throw new ApiError(409, "User with email or username already exists !");
      }

      // Create and store new user
      const user = await userService.userSignUp(
        firstName,
        lastName,
        username,
        email,
        password
      );
      if (!user) {
        throw new ApiError(
          500,
          "Something went wrong while registering the user !"
        );
      }

      /**
       * unHashedToken: unHashed token is something we will send to the user's mail
       * hashedToken: we will keep record of hashedToken to validate the unHashedToken in verify email controller
       * tokenExpiry: Expiry to be checked before validating the incoming token
       */
      const { unHashedToken, hashedToken, tokenExpiry } =
        generateTemporaryToken();

      /**
       * assign hashedToken and tokenExpiry in DB till user clicks on email verification link
       * The email verification is handled by {@link verifyEmail}
       */
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
              username: user.userProfile
                ? user.userProfile.firstName
                : user.username,
              verificationUrl: `${req.protocol}://${req.get(
                "host"
              )}/api/users/verify-email/${unHashedToken}`,
            }),
          });
        })
        .catch((error) => {
          console.log(error);
        });

      // Send Response
      return res
        .status(201)
        .json(new ApiResponse(200, "User created successfully !"));
    } catch (error) {
      next(error);
    }
  },

  // Login User
  loginUser: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { username, password }: SignInSchema = req.body;

      // Check User existence
      const foundUser = await userService.getUserByUsername(username);
      if (!foundUser) {
        // No User
        throw new ApiError(400, "User not found !");
      }

      // Check Password
      const match = await userService.checkPassword(
        password,
        foundUser.password
      );
      if (!match) {
        throw new ApiError(400, "Invalid Password !");
      }

      // Access Token
      const tokenPayload: JwtPayload = {
        user: {
          _id: foundUser.id,
          username: foundUser.username,
          role: foundUser.role,
        },
      };
      const accessToken = generateAccessToken(tokenPayload);
      if (!accessToken) {
        throw new ApiError(500, "Something went wrong !");
      }

      // Refresh Token
      const refreshTokenPayload: RefreshTokenPayLoad = {
        _id: foundUser.id,
        username: foundUser.username,
      };
      const refreshToken = generateRefreshToken(refreshTokenPayload);
      if (!refreshToken) {
        throw new ApiError(500, "Something went wrong !");
      }

      // Save RefreshToken in Database
      const result = await userService.saveRefreshToken(
        foundUser.id,
        refreshToken
      );

      if (!result) {
        throw new ApiError(500, "Something went wrong !");
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
      return res.status(201).json(
        new ApiResponse(200, "Login successful !", {
          accessToken,
          role: foundUser.role,
        })
      );
    } catch (error) {
      next(error);
    }
  },

  // Logout
  logoutUser: async (
    req: TypedRequestCookies,
    res: Response,
    next: NextFunction
  ) => {
    const cookies = req.cookies;
    try {
      // No Content
      if (!cookies?.jwt) return res.sendStatus(204);
      const refreshToken = cookies.jwt;

      // Check user existence with refresh token
      const foundUser = await userService.getRefreshToken(refreshToken);

      // If user not found
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
      const result = await userService.deleteRefreshToken(
        foundUser.id,
        refreshToken
      );
      if (!result) return res.sendStatus(403);

      res.clearCookie("jwt", {
        httpOnly: true,
        // sameSite: "none",
        // secure: true,
      });
      return res.sendStatus(204);
    } catch (error) {
      next(error);
    }
  },

  // Refresh Token
  refreshAccessToken: async (
    req: TypedRequestCookies,
    res: Response,
    next: NextFunction
  ) => {
    const cookies = req.cookies;
    try {
      if (!cookies?.jwt) return res.sendStatus(401); // Unauthorized
      const refreshToken = cookies.jwt;

      // Check user existence with refresh token
      const foundUser = await userService.getRefreshToken(refreshToken);
      if (!foundUser) return res.status(403); // Forbidden

      // Validate refresh token
      const decoded = verifyToken<RefreshTokenPayLoad>(refreshToken, "refresh");

      // Forbidden (invalid token)
      if (typeof decoded === "string") {
        return res.sendStatus(403); // Forbidden
      }
      if (!decoded?.username) {
        return res.sendStatus(403); // Forbidden
      }
      if (foundUser.username != decoded?.username) {
        return res.sendStatus(403); // Forbidden
      }

      // Generate a new access token
      const tokenPayload: JwtPayload = {
        user: {
          _id: foundUser.id,
          username: foundUser.username,
          role: foundUser.role,
        },
      };
      const accessToken = generateAccessToken(tokenPayload);
      if (!accessToken) {
        throw new ApiError(500, "Something went wrong !");
      }

      // Send Response
      return res.status(201).json(
        new ApiResponse(200, "success", {
          accessToken,
          role: foundUser.role,
        })
      );
    } catch (error) {
      next(error);
    }
  },
};

export default AuthController;
