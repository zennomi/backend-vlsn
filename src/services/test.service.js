const httpStatus = require('http-status');
const { Test } = require('../models');
const ApiError = require('../utils/ApiError');

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
  const tests = await Test.paginate(filter, options);
  return tests;
};

/**
 * Get test by id
 * @param {ObjectId} id
 * @returns {Promise<Test>}
 */
const getTestById = async (id, options) => {
  let testPromise = Test.findOne({ _id: id });

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
  const key = [];
  test.questions.forEach(q => {
    key.push(...q.getTrueChoiceArray());
  })
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
  //   if (updateBody.email && (await Test.isEmailTaken(updateBody.email, testId))) {
  //     throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  //   }
  Object.assign(test, updateBody);
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
  await test.remove();
  return test;
};

module.exports = {
  createTest,
  queryTests,
  getTestById,
  getTestKey,
  getTestByEmail,
  updateTestById,
  deleteTestById,
};
