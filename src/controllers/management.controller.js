const httpStatus = require("http-status");
const ApiError = require("../utils/ApiError");
const catchAsync = require("../utils/catchAsync");
const axios = require("axios");
const { managementAppUrl } = require("../configs/config");
const { userService } = require("../services");

const connectToManagementApp = catchAsync(async (req, res) => {
  try {
    const { data: loginData } = await axios({
      url: `${managementAppUrl}/api/v1/users/login`,
      method: "get",
      params: req.body,
    });

    const { token, id: userId, userName, fullName } = loginData;

    await axios({
      url: `${managementAppUrl}/api/v1/users/asscociate`,
      method: "put",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      data: {
        userId,
        testingSystemId: req.user.id,
        facebookUrl: req.user.photoURL,
      },
    });

    await userService.updateUserById(req.user.id, {
      managementAppAccount: {
        userId,
        userName,
        fullName,
      },
    });

    return res.send({ userId, userName, fullName });
  } catch (error) {
    console.log(error);
    throw new ApiError(
      httpStatus.UNAUTHORIZED,
      "Thông tin đăng nhập không chính xác."
    );
  }
});

module.exports = {
  connectToManagementApp,
};
