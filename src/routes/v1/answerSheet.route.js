const express = require('express');
const answerSheetController = require('../../controllers/answerSheet.controller');
const { authRequire } = require("../../middlewares/auth.middleware");

const router = express.Router();

router
  .route('/')
  .post(authRequire, answerSheetController.createAnswerSheet)
  .get(answerSheetController.getAnswerSheets);

router
  .route('/:answerSheetId')
  .get(answerSheetController.getAnswerSheet)
  .patch(authRequire, answerSheetController.updateAnswerSheet)
  // .delete(answerSheetController.deleteAnswerSheet);

module.exports = router;
