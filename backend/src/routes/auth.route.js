const express = require("express");

const authController = require(
  "../controllers/auth.controller"
);

const asyncHandler = require(
  "../utils/async-handler"
);

const validate = require(
  "../middleware/validate-request.middleware"
);

const authenticate = require(
  "../middleware/auth.middleware"
);

const {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  updateProfileSchema,
} = require("../validations/auth.validation");

const { profileUpload } = require(
  "../middleware/profile-upload.middleware"
);

const router = express.Router();

router.post(
  "/register",
  validate(registerSchema, "body"),
  asyncHandler(authController.register)
);

router.post(
  "/login",
  validate(loginSchema, "body"),
  asyncHandler(authController.login)
);

router.post(
  "/forgot-password",
  validate(forgotPasswordSchema, "body"),
  asyncHandler(authController.forgotPassword)
);

router.post(
  "/reset-password",
  validate(resetPasswordSchema, "body"),
  asyncHandler(authController.resetPassword)
);

router.get(
  "/me",
  authenticate,
  asyncHandler(authController.me)
);

router.patch(
  "/profile",
  authenticate,
  profileUpload.single("profileImage"),
  validate(updateProfileSchema, "body"),
  asyncHandler(authController.updateProfile)
);

router.post(
  "/logout",
  asyncHandler(authController.logout)
);

module.exports = router;
