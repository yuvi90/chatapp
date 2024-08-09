import { Request } from "express";
import jwt from "jsonwebtoken";
import fs from "fs";
import crypto from "crypto";
import config from "@/config/index.js";

/**
 * Checks if a request is authenticated by verifying the presence of required properties in the request object.
 *
 * @param {Request} req - The Express request object to be checked for authentication.
 * @return {boolean} True if the request is authenticated, false otherwise.
 */
export function isAuthenticated(
  req: Request,
): req is Request & TokenPayload.JwtPayload & { __isAuthenticated: true } {
  return (
    (req as Request & { __isAuthenticated: true } & TokenPayload.JwtPayload).__isAuthenticated &&
    (req as Request & { __isAuthenticated: true } & TokenPayload.JwtPayload).user !== undefined &&
    (req as Request & { __isAuthenticated: true } & TokenPayload.JwtPayload).user._id !==
      undefined &&
    (req as Request & { __isAuthenticated: true } & TokenPayload.JwtPayload).user.username !==
      undefined
  );
}

/**
 * Checks if the authenticated user is the owner of a given resource.
 *
 * @param {Request & TokenPayload.JwtPayload & { __isAuthenticated: true }} req - The Express request object.
 * @param {string} resourceUserId - The ID of the resource to check ownership for.
 * @return {Boolean} True if the authenticated user is the owner of the resource, false otherwise.
 */
export const isResourceOwner = (
  req: Request & TokenPayload.JwtPayload & { __isAuthenticated: true },
  resourceUserId: string,
): Boolean => {
  return req.user._id === resourceUserId;
};

/**
 * Generates an access token based on the provided token payload.
 *
 * @param {TokenPayload.JwtPayload} tokenPayload - The payload for generating the access token.
 * @return {string | null} The generated access token or null if an error occurs.
 */
export const generateAccessToken = (tokenPayload: TokenPayload.JwtPayload): string | null => {
  try {
    const accessToken = jwt.sign(tokenPayload, config.jwtSecret, {
      expiresIn: config.jwtTokenExpiry,
    });
    return accessToken;
  } catch (error) {
    return null;
  }
};

/**
 * Generates a refresh token based on the provided token payload.
 *
 * @param {TokenPayload.RefreshTokenPayLoad} tokenPayload - The payload for generating the refresh token.
 * @return {string | null} The generated refresh token or null if an error occurs.
 */
export const generateRefreshToken = (
  tokenPayload: TokenPayload.RefreshTokenPayLoad,
): string | null => {
  try {
    const accessToken = jwt.sign(tokenPayload, config.jwtRefreshSecret, {
      expiresIn: config.jwtRefreshTokenExpiry,
    });
    return accessToken;
  } catch (error) {
    return null;
  }
};

/**
 * Verifies a JSON Web Token (JWT) using the specified type and returns the decoded payload.
 *
 * @param {string} token - The JWT to be verified.
 * @param {"access" | "refresh"} [type="access"] - The type of token to verify. Defaults to "access".
 * @return {T | null} - The decoded payload of the JWT if verification is successful, otherwise null.
 */
export const verifyToken = <T>(token: string, type: "access" | "refresh" = "access"): T | null => {
  try {
    const secret = type === "access" ? config.jwtSecret : config.jwtRefreshSecret;
    const decoded = jwt.verify(token, secret) as T;
    return decoded;
  } catch (error) {
    return null;
  }
};

/**
 * Generates a SHA-256 hash of the given unhashed token.
 *
 * @param {string} unHashedToken - The unhashed token to be hashed.
 * @return {string} The SHA-256 hash of the unhashed token.
 */
export const createHashToken = function (unHashedToken: string): string {
  return crypto.createHash("sha256").update(unHashedToken).digest("hex");
};

/**
 * Generates a temporary token for verification purposes.
 *
 * @return {{unHashedToken: string, hashedToken: string, tokenExpiry: string}} An object containing the unhashed token, hashed token, and token expiry time.
 */
export const generateTemporaryToken = function (): {
  unHashedToken: string;
  hashedToken: string;
  tokenExpiry: string;
} {
  // This token should be client facing
  // for example: for email verification unHashedToken should go into the user's mail
  const unHashedToken = crypto.randomBytes(20).toString("hex");

  // This should stay in the DB to compare at the time of verification
  const hashedToken = createHashToken(unHashedToken);

  // This is the expiry time for the token (20 minutes)
  const tokenExpiry = new Date(Date.now() + config.userTemporaryTokenExpiry).toISOString();

  return { unHashedToken, hashedToken, tokenExpiry };
};

/**
 * @param {Request} req
 * @description **This utility function is responsible for removing unused image files due to the api fail**.
 *
 * **For example:**
 * * This can occur when product is created.
 * * In product creation process the images are getting uploaded before product gets created.
 * * Once images are uploaded and if there is an error creating a product, the uploaded images are unused.
 * * In such case, this function will remove those unused images.
 */
export const removeUnusedMulterImageFilesOnError = (req: Request) => {
  try {
    const multerFile = req.file;
    const multerFiles = req.files;

    if (multerFile) {
      // If there is file uploaded and there is validation error
      fs.unlink(multerFile.path, (err) => {
        if (err) console.log("Error while removing local files: ", err);
        else {
          console.log("Removed local: ", multerFile.path);
        }
      });
    }

    if (multerFiles) {
      // If there are multiple files uploaded for more than one fields
      const filesValueArray = Object.values(multerFiles) as Express.Multer.File[][];
      filesValueArray.map((fileFields: Express.Multer.File[]) => {
        fileFields.map((fileObject) => {
          fs.unlink(fileObject.path, (err) => {
            if (err) console.log("Error while removing local files: ", err);
            else {
              console.log("Removed local: ", fileObject.path);
            }
          });
        });
      });
    }
  } catch (error) {
    // fail silently
    console.log("Error while removing image files: ", error);
  }
};
