const httpStatus = require('http-status');
const { Test, AnswerSheet } = require('../models');
const answerSheetService = require('./answerSheet.service');
const ApiError = require('../utils/ApiError');
const pick = require('../utils/pick');

/**
 * Create a test
 * @param {Object} testBody
 * @returns {Promise<Test>}
 */
const createTest = async (testBody) => {
  //   if (await Test.isEmailTaken(testBody.email)) {
  //     throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  //   }
  return Test.create(testBody);
};

/**
 * Query for tests
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryTests = async (filter, options) => {
  if (filter.name) filter.name = { $regex: filter.name, "$options": "i" };
  if (filter.tags) tags = { $all: filter.tags.split(",") };
  console.log(filter);
  const tests = await Test.paginate(filter, options);
  return tests;
};

const detectNullTests = async (ids) => {
  let foundTests = await Test.find({ _id: { $in: ids } });
  foundTests = foundTests.map(v => v._id.toString());
  return ids.filter(id => !foundTests.includes(id));
}

/**
 * Get test by id
 * @param {ObjectId} id
 * @returns {Promise<Test>}
 */
const getTestById = async (id, options) => {
  let testPromise = Test.findById(id);
  if (options?.populate) {
    options.populate.split(',').forEach((populateOption) => {
      testPromise = testPromise.populate(
        populateOption
          .split('.')
          .reverse()
          .reduce((a, b) => ({ path: b, populate: a }))
      );
    });
  }

  testPromise = testPromise.exec();

  return testPromise;
};

/**
 * Get test by email
 * @param {string} email
 * @returns {Promise<Test>}
 */
const getTestByEmail = async (email) => {
  return Test.findOne({ email });
};

const getTestKey = async (testId) => {
  const test = await getTestById(testId, { populate: "questions" });
  if (!test) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Test not found');
  }
  const key = test.getKey();
  return key;
}

/**
 * Update test by id
 * @param {ObjectId} testId
 * @param {Object} updateBody
 * @returns {Promise<Test>}
 */
const updateTestById = async (testId, updateBody) => {
  const test = await getTestById(testId);
  if (!test) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Test not found');
  }
  Object.assign(test, updateBody);
  console.log(test);
  await test.save();
  return test;
};

/**
 * Delete test by id
 * @param {ObjectId} testId
 * @returns {Promise<Test>}
 */
const deleteTestById = async (testId) => {
  const test = await getTestById(testId);
  if (!test) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Test not found');
  }
  await AnswerSheet.deleteMany({ testId });
  await test.remove();
  return test;
};

const getResultTableById = async (testId, userId) => {
  const test = await getTestById(testId, { populate: "questions" });
  if (!test) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Test not found');
  }
  const key = test.getKey();
  const sheetFilter = { testId: testId }
  if (userId) sheetFilter.user = userId;
  const { results: sheets } = await answerSheetService.queryAnswerSheets(sheetFilter, { populate: "user", limit: 1000 });
  const results = sheets.map(sheet => {
    sheet = sheet.toJSON();
    const result = pick(sheet, ['createdAt', 'updatedAt', 'finishedAt', 'id', 'blurCount']);
    // result.id = result._id;
    result.user = pick(sheet.user, ['displayName', 'photoURL', 'email', 'id']);
    result.trueCount = sheet.choices.filter(c => key.includes(c.choiceId.toString())).length;
    result.mark = result.trueCount / test.questions.length * 10;
    return result;
  })
  return results;
}

module.exports = {
  createTest,
  queryTests,
  getTestById,
  getTestKey,
  getTestByEmail,
  updateTestById,
  deleteTestById,
  getResultTableById,
  detectNullTests,
};
