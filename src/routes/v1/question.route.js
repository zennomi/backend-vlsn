const express = require('express');
const questionController = require('../../controllers/question.controller');

const router = express.Router();

router
  .route('/')
  // .post(questionController.createQuestion)
  .get(questionController.getQuestions);

router
  .route('/:questionId')
  .get(questionController.getQuestion)
  // .patch(questionController.updateQuestion)
  // .delete(questionController.deleteQuestion);

module.exports = router;
