import { Request } from "express";
import jwt from "jsonwebtoken";
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
