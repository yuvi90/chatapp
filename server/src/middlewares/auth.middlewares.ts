import { Response, NextFunction } from "express";

import { verifyToken } from "../utils/helpers.js";
import userService from "../services/user.services.js";

// Types
import { JwtPayload, AuthUserRequest } from "../types/types.js";

// Authentication Middleware
export const authenticate = async (
  req: AuthUserRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({
        status: false,
        message: "Unauthorized!",
      });
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyToken<JwtPayload>(token, "access");

    if (
      !decoded ||
      !("user" in decoded) ||
      !("_id" in decoded.user) ||
      !("username" in decoded.user) ||
      !("role" in decoded.user)
    ) {
      return res.status(403).json({
        status: false,
        message: "Invalid Token!",
      });
    }

    req.user = decoded.user;
    next();
  } catch (error) {
    next(error);
  }
};

// Authorization Middleware
export const adminOnly = async (
  req: AuthUserRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user;

    if (!user?._id || !user?.username || !user?.role)
      return res.status(401).json({
        status: false,
        message: "Authentication Required!",
      });

    const foundedUser = await userService.getUserByUsername(user.username);

    if (!foundedUser)
      return res.status(401).json({
        status: false,
        message: "Unauthorized!",
      });

    const allowedRoles = ["admin"];
    if (!allowedRoles.includes(user.role))
      return res.status(403).json({
        status: false,
        message: "Unauthorized!",
      });

    next();
  } catch (error) {
    next(error);
  }
};
