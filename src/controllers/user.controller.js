const httpStatus = require('http-status');
const { getAuth } = require("firebase-admin/auth");
const firebaseApp = require('../configs/firebase');
const jwt = require("jsonwebtoken");
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { userService } = require('../services');

const createUser = catchAsync(async (req, res) => {
  const user = await userService.createUser(req.body);
  res.status(httpStatus.CREATED).send(user);
});

const getUsers = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['name', 'role']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await userService.queryUsers(filter, options);
  res.send(result);
});

const getUser = catchAsync(async (req, res) => {
  const user = await userService.getUserById(req.params.userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  res.send(user);
});

const updateUser = catchAsync(async (req, res) => {
  const user = await userService.updateUserById(req.params.userId, req.body);
  res.send(user);
});

const deleteUser = catchAsync(async (req, res) => {
  await userService.deleteUserById(req.params.userId);
  res.status(httpStatus.NO_CONTENT).send();
});

const getToken = catchAsync(async (req, res) => {
  const { user: bodyUser } = req.body;
  try {
    if (bodyUser) {
      const AUTH = getAuth(firebaseApp);
      const decodedUser = await AUTH.verifyIdToken(bodyUser.stsTokenManager.accessToken);
      if (decodedUser.uid != bodyUser.uid) throw new ApiError(httpStatus.FORBIDDEN, "detect cheat");
      let user = await userService.getUserById(bodyUser.uid);
      if (!user) {
        user = await userService.updateUserById(bodyUser.uid, bodyUser);
      }
      const { role, _id, email, displayName, photoURL, managementAppAccount, balance } = user;
      const token = jwt.sign({ role, id: _id, email, displayName, photoURL, managementAppAccount, balance }, process.env.TOKEN_KEY, { expiresIn: "2h" });
      return res.status(httpStatus.CREATED).send(token);
    }
  } catch (error) {
    console.log(error);
  }
  throw new ApiError(httpStatus.CONFLICT, "cant't get token");
});

module.exports = {
  createUser,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  getToken
};
