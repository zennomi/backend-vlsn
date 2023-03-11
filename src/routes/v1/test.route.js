const express = require('express');
const testController = require('../../controllers/test.controller');
const { authRequire, staffRequire, auth } = require("../../middlewares/auth.middleware");
const cacheRequest = require('../../middlewares/cache');

const router = express.Router();

router
  .route('/')
  .post(staffRequire, testController.createTest)
  .get(auth, testController.getTests);

router
  .route('/:testId')
  .get(cacheRequest.setCache(60 * 5), testController.getTest)
  .patch(cacheRequest.deleteCache, staffRequire, testController.updateTest)
  .delete(authRequire, staffRequire, testController.deleteTest);

router.route('/:testId/key')
  .get(authRequire, cacheRequest.setCache(60 * 5), testController.getTestKey)

router.route('/:testId/questions')
  .get(authRequire, cacheRequest.setCache(60 * 5), testController.getTestWithQuestions)

router.route('/:testId/result-table')
  .get(testController.getResultTable);

module.exports = router;
