import { Request, Response, NextFunction } from "express";
import { isAuthenticated, verifyToken } from "../utils/helpers.js";
import userService from "../services/v1/user.services.js";

// Types
import { ApiError } from "../utils/response-handler.js";

interface AuthRequest extends Request {
  user?: TokenPayload.JwtPayload["user"];
  __isAuthenticated?: boolean;
}

// Authentication Middleware
export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({
        status: false,
        message: "Unauthorized!",
      });
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyToken<TokenPayload.JwtPayload>(token, "access");

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
    req.__isAuthenticated = true;
    next();
  } catch (error) {
    next(error);
  }
};

// Authorization Middleware
export const adminOnly = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // if user is not authenticated
    if (!isAuthenticated(req)) {
      throw new ApiError(401, "Unauthorized!");
    }

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
