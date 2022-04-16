const express = require('express');
// const authRoute = require('./auth.route');
const userRoute = require('./user.route');
const questionRoute = require('./question.route');
const testRoute = require('./test.route');
const answerSheetRoute = require('./answerSheet.route');
const managementRoute = require('./management.route');
const docsRoute = require('./docs.route');
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
    path: '/answersheets',
    route: answerSheetRoute,
  },
  {
    path: '/managementapp',
    route: managementRoute,
  },
];

const devRoutes = [
  // routes available only in development mode
  {
    path: '/docs',
    route: docsRoute,
  },
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

/* istanbul ignore next */
if (config.env === 'development') {
  devRoutes.forEach((route) => {
    router.use(route.path, route.route);
  });
}

module.exports = router;
