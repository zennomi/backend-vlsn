const httpStatus = require('http-status');
const { PurchaseCode } = require('../models');
const ApiError = require('../utils/ApiError');

module.exports.createPurchaseCode = async (body) => {
    return PurchaseCode.create(body);
};

module.exports.getPurchaseCodeByCode = async (code) => {
    return PurchaseCode.findById(code)
}

module.exports.getPurchaseCodeByUserIdAndCourseId = async (userId, courseId) => {
    return PurchaseCode.findOne({ user: userId, courses: courseId })
}

module.exports.getPurchaseCodesByUserId = async (userId) => {
    return PurchaseCode.find({ user: userId })
}