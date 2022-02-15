const express = require('express');
const testController = require('../../controllers/test.controller');
const { authRequire, adminRequire } = require("../../middlewares/auth.middleware");

const router = express.Router();

router
  .route('/')
  // .post(testController.createTest)
  .get(testController.getTests);

router
  .route('/:testId')
  .get(testController.getTest)
// .patch(testController.updateTest)
// .delete(authRequire, testController.deleteTest);

router.route('/:testId/key')
  .get(authRequire, testController.getTestKey)

router.route('/:testId/result-table')
  .get(testController.getResultTable);

module.exports = router;
