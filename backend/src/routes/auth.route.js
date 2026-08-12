const express = require("express");

const authController = require(
  "../controllers/auth.controller"
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
  validateProfileUpdate,
} = require("../validations/auth.validation");

const { profileUpload } = require(
  "../middleware/profile-upload.middleware"
);

const router = express.Router();

router.post(
  "/register",
  validate(registerSchema, "body"),
  authController.register
);

router.post(
  "/login",
  validate(loginSchema, "body"),
  authController.login
);

router.post(
  "/forgot-password",
  validate(forgotPasswordSchema, "body"),
  authController.forgotPassword
);

router.post(
  "/reset-password",
  validate(resetPasswordSchema, "body"),
  authController.resetPassword
);

router.get(
  "/me",
  authenticate,
  authController.me
);

router.patch(
  "/profile",
  authenticate,
  profileUpload.single("profileImage"),
  validateProfileUpdate,
  authController.updateProfile
);

router.post(
  "/logout",
  authController.logout
);

module.exports = router;
