const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');

const jwt = require("jsonwebtoken");

const adminRequire = async (req, res, next) => {
    const token = req.headers['x-access-token'];
    if (token) {
        try {
            req.user = jwt.verify(token, process.env.TOKEN_KEY);
            if (req.user.role == 'admin') return next();
        } catch (error) {
            console.log(error);
        }
    }
    throw new ApiError(httpStatus.UNAUTHORIZED, 'UNAUTHORIZED');
}

const staffRequire = async (req, res, next) => {
    const token = req.headers['x-access-token'];
    if (token) {
        try {
            req.user = jwt.verify(token, process.env.TOKEN_KEY);
            if (['admin', 'mod'].includes(req.user.role)) return next();
        } catch (error) {
            console.log(error);
        }
    }
    throw new ApiError(httpStatus.UNAUTHORIZED, 'UNAUTHORIZED');
}

const authRequire = async (req, res, next) => {
    const token = req.headers['x-access-token'];
    if (token) {
        try {
            req.user = jwt.verify(token, process.env.TOKEN_KEY);
            return next();
        } catch (error) {
            console.log(error);
        }
    }
    throw new ApiError(httpStatus.UNAUTHORIZED, 'UNAUTHORIZED');
}

module.exports = { adminRequire, authRequire, staffRequire };