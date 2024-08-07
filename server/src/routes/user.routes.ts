import express from "express";
import UserController from "../controllers/user.controllers.js";
import { authenticate } from "../middlewares/auth.middlewares.js";
import { validate } from "../middlewares/validate.middlewares.js";
import {
  ChangePasswordSchema,
  ForgotPasswordSchema,
  PasswordResetSchema,
} from "../validators/user.validators.js";

const router = express.Router();

// Public Routes - /api/users

router.post(
  "/forgot-password",
  validate(ForgotPasswordSchema),
  UserController.forgotPassword
);

router.post(
  "/reset-password/:token",
  validate(PasswordResetSchema),
  UserController.resetPassword
);

router.get("/verify-email/:token", UserController.verifyEmail);

// Private Routes - /api/users

router.post(
  "/resend-verification-email",
  authenticate,
  UserController.resendVerificationEmail
);

router.post(
  "/change-password",
  authenticate,
  validate(ChangePasswordSchema),
  UserController.changePassword
);

export default router;
