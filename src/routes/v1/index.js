const express = require('express');
// const authRoute = require('./auth.route');
const userRoute = require('./user.route');
const questionRoute = require('./question.route');
const testRoute = require('./test.route');
const videoRoute = require('./video.route');
const courseRoute = require('./course.route');
const depositRoute = require('./deposit.route');
const answerSheetRoute = require('./answerSheet.route');
const managementRoute = require('./management.route');
const config = require('../../configs/config');

const router = express.Router();

const defaultRoutes = [
  {
    path: '/users',
    route: userRoute,
  },
  {
    path: '/questions',
    route: questionRoute,
  },
  {
    path: '/tests',
    route: testRoute,
  },
  {
    path: '/videos',
    route: videoRoute,
  },
  {
    path: '/deposits',
    route: depositRoute,
  },
  {
    path: '/courses',
    route: courseRoute,
  },
  {
    path: '/answersheets',
    route: answerSheetRoute,
  },
  {
    path: '/managementapp',
    route: managementRoute,
  },
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

module.exports = router;
