const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { testService, purchaseCodeService } = require('../services');
const courseModel = require('../models/course.model');

const createTest = catchAsync(async (req, res) => {
  const test = await testService.createTest(req.body);
  res.status(httpStatus.CREATED).send(test);
});

const getTests = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['name', 'grade', 'tags']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  if (!req.user?.isStaff) filter.isPublic = true;
  const result = await testService.queryTests(filter, options);
  res.send(result);
});

const getTest = catchAsync(async (req, res) => {
  const options = pick(req.query, ['populate']);
  const test = await testService.getTestById(req.params.testId, options);
  if (!test) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Test not found');
  }
  if (options?.populate?.includes("questions")) {
    test.questions = test.questions.map(q => {
      q.choices = q.choices.map(c => ({ ...c.toJSON(), isTrue: undefined }));
      return q;
    });
  }
  res.send(test);
});

const getTestWithQuestions = catchAsync(async (req, res) => {
  const user = req.user
  const test = await testService.getTestById(req.params.testId, { populate: 'questions' });
  if (!test) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Test not found');
  }
  test.questions = test.questions.map(q => {
    q.choices = q.choices.map(c => ({ ...c.toJSON(), isTrue: undefined }));
    return q;
  });
  if (test.isPublic) return res.send(test)
  if (user.role === 'admin') return res.send(test)
  const courses = await courseModel.find({ "tests.id": test.id })
  for (const course of courses) {
    const purchaseCode = await purchaseCodeService.getPurchaseCodeByUserIdAndCourseId(user.id, course.id)
    if (purchaseCode) return res.send(test)
  }
  res.status(httpStatus.LOCKED).send()
});

const getTestKey = catchAsync(async (req, res) => {
  const key = await testService.getTestKey(req.params.testId);
  res.send(key);
});

const updateTest = catchAsync(async (req, res) => {
  const test = await testService.updateTestById(req.params.testId, req.body);
  res.send(test);
});

const deleteTest = catchAsync(async (req, res) => {
  await testService.deleteTestById(req.params.testId);
  res.status(httpStatus.NO_CONTENT).send();
});

const getResultTable = catchAsync(async (req, res) => {
  const table = await testService.getResultTableById(req.params.testId, req.query.userId);
  res.status(httpStatus.OK).send(table);
});

module.exports = {
  createTest,
  getTests,
  getTest,
  getTestKey,
  updateTest,
  deleteTest,
  getResultTable,
  getTestWithQuestions,
};
