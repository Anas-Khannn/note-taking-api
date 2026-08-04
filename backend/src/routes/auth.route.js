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
} = require("../validations/auth.validation");

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

router.get(
  "/me",
  authenticate,
  asyncHandler(authController.me)
);

router.post(
  "/logout",
  asyncHandler(authController.logout)
);

module.exports = router;
