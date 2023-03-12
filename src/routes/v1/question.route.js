const express = require("express");
const questionController = require("../../controllers/question.controller");
const { staffRequire } = require("../../middlewares/auth.middleware");

const router = express.Router();

router
  .route("/")
  .post(staffRequire, questionController.createQuestion)
  .get(questionController.getQuestions);

router.route("/bulk")
  .post(staffRequire, questionController.createQuestions)

router
  .route("/:questionId")
  .get(questionController.getQuestion)
  .patch(staffRequire, questionController.updateQuestion);
// .delete(questionController.deleteQuestion);

router.route("/random").post(questionController.getQuestionsWithCriterias);

module.exports = router;
