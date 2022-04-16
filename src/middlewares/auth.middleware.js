const httpStatus = require("http-status");
const catchAsync = require("../utils/catchAsync");
const logger = require("../configs/logger");
const ApiError = require("../utils/ApiError");

const jwt = require("jsonwebtoken");

const auth = catchAsync(async (req, res, next) => {
  const token = req.headers["x-access-token"];
  if (token) {
    try {
      req.user = jwt.verify(token, process.env.TOKEN_KEY);
      if (["admin", "mod"].includes(req.user.role)) req.user.isStaff = true;
    } catch (error) {
      logger.error(error);
      throw new ApiError(httpStatus.FORBIDDEN, "INVALID TOKEN");
    }
  }
  next();
});

const adminRequire = catchAsync(async (req, res, next) => {
  const token = req.headers["x-access-token"];
  if (token) {
    try {
      req.user = jwt.verify(token, process.env.TOKEN_KEY);
      if (req.user.role == "admin") return next();
    } catch (error) {
      logger.error(error);
    }
  }
  throw new ApiError(httpStatus.UNAUTHORIZED, "ADMIN REQUIRED");
});

const staffRequire = catchAsync(async (req, res, next) => {
  const token = req.headers["x-access-token"];
  if (token) {
    try {
      req.user = jwt.verify(token, process.env.TOKEN_KEY);
      if (["admin", "mod"].includes(req.user.role)) return next();
    } catch (error) {
      logger.error(error);
    }
  }
  throw new ApiError(httpStatus.UNAUTHORIZED, "STAFF REQUIRE");
});

const authRequire = catchAsync(async (req, res, next) => {
  const token = req.headers["x-access-token"];
  if (token) {
    try {
      req.user = jwt.verify(token, process.env.TOKEN_KEY);
      return next();
    } catch (error) {
      logger.error(error);
    }
  }
  throw new ApiError(httpStatus.UNAUTHORIZED, "UNAUTHORIZED");
});

module.exports = { auth, adminRequire, authRequire, staffRequire };
