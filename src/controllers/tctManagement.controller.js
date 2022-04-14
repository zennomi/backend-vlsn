const httpStatus = require("http-status");
const ApiError = require("../utils/ApiError");
const catchAsync = require("../utils/catchAsync");
const axios = require("axios");
const { managementAppUrl } = require("../configs/config");

const connectToTCT = catchAsync(async (req, res) => {
  const { data } = axios({
    url: `${managementAppUrl}/v1/users/login`,
    method: "get",
    params: req.query,
  });
});

module.exports = {};
