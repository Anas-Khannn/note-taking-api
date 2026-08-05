const AuthService = require(
  "../services/auth.service"
);

const HTTP_STATUS = require(
  "../enums/http-status.enum"
);

const register = async (req, res) => {
  const result = await AuthService.registerUser(
    req.body
  );

  return res.status(HTTP_STATUS.CREATED).json({
    success: true,
    message: "Account created successfully",
    data: {
      user: result.user,
      token: result.token,
    },
  });
};

const login = async (req, res) => {
  const result = await AuthService.loginUser(
    req.body
  );

  return res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "Login successful",
    data: {
      user: result.user,
      token: result.token,
    },
  });
};

const me = async (req, res) => {
  const user = await AuthService.getCurrentUser(
    req.user.id
  );

  return res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "User retrieved successfully",
    data: user,
  });
};

const forgotPassword = async (req, res) => {
  const result =
    await AuthService.requestPasswordReset(
      req.body.email
    );

  return res.status(HTTP_STATUS.OK).json({
    success: true,
    message: result.message,
    ...(result.resetToken
      ? { data: { resetToken: result.resetToken } }
      : {}),
  });
};

const resetPassword = async (req, res) => {
  const result = await AuthService.resetPassword(
    req.body.token,
    req.body.password
  );

  return res.status(HTTP_STATUS.OK).json({
    success: true,
    message: result.message,
  });
};

const logout = async (req, res) => {
  // JWTs are stateless, so logout is handled on the client by discarding the
  // local session. This endpoint acknowledges the request without claiming
  // any server-side token revocation.
  return res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "Logged out successfully",
  });
};

module.exports = {
  register,
  login,
  me,
  forgotPassword,
  resetPassword,
  logout,
};
