import { Request, Response, NextFunction } from "express";

// AccessToken Payload
export interface JwtPayload {
  user: { _id: string; username: string; role?: string };
}
// RefreshToken Payload
export interface RefreshTokenPayLoad {
  _id: string;
  username: string;
}
// Authenticate User Request Body
export interface AuthUserRequest extends Request {
  user?: { _id: string; username: string; role?: string };
}
