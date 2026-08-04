const { UnauthorizedError } = require(
  "../errors/app.error"
);

const { verifyAccessToken } = require(
  "../utils/jwt.util"
);

const BEARER_PREFIX = "Bearer ";

const authenticate = (req, res, next) => {
  const authorizationHeader = req.headers.authorization;

  if (
    !authorizationHeader ||
    typeof authorizationHeader !== "string"
  ) {
    return next(
      new UnauthorizedError(
        "Authentication token is required"
      )
    );
  }

  if (
    !authorizationHeader.startsWith(BEARER_PREFIX)
  ) {
    return next(
      new UnauthorizedError(
        "Invalid authorization header"
      )
    );
  }

  const token = authorizationHeader.slice(
    BEARER_PREFIX.length
  );

  if (!token || token.trim().length === 0) {
    return next(
      new UnauthorizedError(
        "Authentication token is required"
      )
    );
  }

  let decoded;

  try {
    decoded = verifyAccessToken(token);
  } catch {
    return next(
      new UnauthorizedError(
        "Invalid or expired authentication token"
      )
    );
  }

  if (!decoded || !decoded.sub) {
    return next(
      new UnauthorizedError(
        "Invalid authentication token"
      )
    );
  }

  req.user = {
    id: decoded.sub,
  };

  next();
};

module.exports = authenticate;
