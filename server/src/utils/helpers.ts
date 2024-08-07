import jwt from "jsonwebtoken";
import crypto from "crypto";
import { JwtPayload, RefreshTokenPayLoad } from "../types/types.js";
import config from "../config/index.js";

export const generateAccessToken = (
  tokenPayload: JwtPayload
): string | null => {
  try {
    const accessToken = jwt.sign(tokenPayload, config.jwtSecret, {
      expiresIn: config.jwtTokenExpiry,
    });
    return accessToken;
  } catch (error) {
    return null;
  }
};

export const generateRefreshToken = (
  tokenPayload: RefreshTokenPayLoad
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

export const verifyToken = <T>(
  token: string,
  type: "access" | "refresh" = "access"
): T | null => {
  try {
    const secret =
      type === "access" ? config.jwtSecret : config.jwtRefreshSecret;
    const decoded = jwt.verify(token, secret) as T;
    return decoded;
  } catch (error) {
    return null;
  }
};

export const createHashToken = function (unHashedToken: string): string {
  return crypto.createHash("sha256").update(unHashedToken).digest("hex");
};

export const generateTemporaryToken = function () {
  // This token should be client facing
  // for example: for email verification unHashedToken should go into the user's mail
  const unHashedToken = crypto.randomBytes(20).toString("hex");

  // This should stay in the DB to compare at the time of verification
  const hashedToken = createHashToken(unHashedToken);

  // This is the expiry time for the token (20 minutes)
  const tokenExpiry = new Date(
    Date.now() + config.userTemporaryTokenExpiry
  ).toISOString();

  return { unHashedToken, hashedToken, tokenExpiry };
};
