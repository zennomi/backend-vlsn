const httpStatus = require("http-status");
const pick = require("../utils/pick");
const ApiError = require("../utils/ApiError");
const catchAsync = require("../utils/catchAsync");
const { answerSheetService, testService } = require("../services");
const redisClient = require("../configs/cache");

const createAnswerSheet = catchAsync(async (req, res) => {
  const sheetBody = req.body;
  sheetBody.user = req.user.id;
  sheetBody.userAgent = req.get("User-Agent");
  sheetBody.userIp = req.ip;
  const answerSheet = await answerSheetService.createAnswerSheet(sheetBody);
  res.status(httpStatus.CREATED).send(answerSheet);
});

const getAnswerSheets = catchAsync(async (req, res) => {
  const filter = pick(req.query, ["user"]);
  const options = pick(req.query, ["sortBy", "limit", "page", "populate"]);
  const result = await answerSheetService.queryAnswerSheets(filter, options);
  res.send(result);
});

const getAnswerSheet = catchAsync(async (req, res) => {
  const answerSheet = await answerSheetService.getAnswerSheetById(
    req.params.answerSheetId
  );
  if (!answerSheet) {
    throw new ApiError(httpStatus.NOT_FOUND, "AnswerSheet not found");
  }
  res.send(answerSheet);
});

const updateAnswerSheet = catchAsync(async (req, res) => {
  // block when finished
  if (req.body.isFinished) req.body.finishedAt = new Date();
  const answerSheet = await answerSheetService.getAnswerSheetById(
    req.params.answerSheetId
  );
  if (answerSheet.isFinished)
    throw new ApiError(httpStatus.FORBIDDEN, "This answer was submitted.");
  Object.assign(answerSheet, req.body);
  if (answerSheet.isFinished) {
    let testKey = await redisClient.get(`/v1/tests/${answerSheet.testId}/key`);
    if (!testKey) testKey = await testService.getTestKey(answerSheet.testId);
    answerSheet.mark =
      (answerSheet.choices.filter((c) => testKey.includes(c.choiceId.toString())).length /
        testKey.length) *
      10;
    console.log(answerSheet.choices, testKey, answerSheet.mark);
    await answerSheet.save();
    return res.send({ answerSheet, testKey });
  }
  await answerSheet.save();
  res.send({ answerSheet });
});

const deleteAnswerSheet = catchAsync(async (req, res) => {
  await answerSheetService.deleteAnswerSheetById(req.params.answerSheetId);
  res.status(httpStatus.NO_CONTENT).send();
});

const deleteManyAnswerSheets = catchAsync(async (req, res) => {
  await answerSheetService.deleteManyAnswerSheetById(req.body.ids);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  createAnswerSheet,
  getAnswerSheets,
  getAnswerSheet,
  updateAnswerSheet,
  deleteAnswerSheet,
  deleteManyAnswerSheets,
};
