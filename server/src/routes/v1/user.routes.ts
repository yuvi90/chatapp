import express from "express";
import UserController from "@/controllers/v1/user.controllers.js";
import { authenticate } from "@/middlewares/auth.middlewares.js";
import { validate } from "@/middlewares/validate.middlewares.js";
import { upload } from "@/middlewares/multer.middlewares.js";
import {
  ChangePasswordSchema,
  ForgotPasswordSchema,
  PasswordResetSchema,
} from "@/validators/user.validators.js";

const router = express.Router();

// Public Routes - /api/users

router.get("/verify-email/:token", UserController.verifyEmail);

router.post("/forgot-password", validate(ForgotPasswordSchema), UserController.forgotPassword);

router.post("/reset-password/:token", validate(PasswordResetSchema), UserController.resetPassword);

// Private Routes - /api/users

router.get("/me", authenticate, UserController.getMe);

router.post("/resend-verification-email", authenticate, UserController.resendVerificationEmail);

router.post(
  "/change-password",
  authenticate,
  validate(ChangePasswordSchema),
  UserController.changePassword,
);

router.patch("/avatar", authenticate, upload.single("avatar"), UserController.updateAvatar);

export default router;
