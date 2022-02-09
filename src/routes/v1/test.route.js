const express = require('express');
const testController = require('../../controllers/test.controller');

const router = express.Router();

router
  .route('/')
  .post(testController.createTest)
  .get(testController.getTests);

router
  .route('/:testId')
  .get(testController.getTest)
  .patch(testController.updateTest)
  .delete(testController.deleteTest);

  router.route('/:testId/key')
  .get(testController.getTestKey)
module.exports = router;
