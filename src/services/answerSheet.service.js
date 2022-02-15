const httpStatus = require('http-status');
const { AnswerSheet } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Create a answerSheet
 * @param {Object} answerSheetBody
 * @returns {Promise<AnswerSheet>}
 */
const createAnswerSheet = async (answerSheetBody) => {
  //   if (await AnswerSheet.isEmailTaken(answerSheetBody.email)) {
  //     throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  //   }
  return AnswerSheet.create(answerSheetBody);
};

/**
 * Query for answerSheets
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryAnswerSheets = async (filter, options) => {
  const answerSheets = await AnswerSheet.paginate(filter, options);
  return answerSheets;
};

/**
 * Get answerSheet by id
 * @param {ObjectId} id
 * @returns {Promise<AnswerSheet>}
 */
const getAnswerSheetById = async (id, options) => {
  let answerSheetPromise = AnswerSheet.findOne({ _id: id });

  if (options?.populate) {
    options.populate.split(',').forEach((populateOption) => {
      answerSheetPromise = answerSheetPromise.populate(
        populateOption
          .split('.')
          .reverse()
          .reduce((a, b) => ({ path: b, populate: a }))
      );
    });
  }

  answerSheetPromise = answerSheetPromise.exec();

  return answerSheetPromise;
};

/**
 * Update answerSheet by id
 * @param {ObjectId} answerSheetId
 * @param {Object} updateBody
 * @returns {Promise<AnswerSheet>}
 */
const updateAnswerSheetById = async (answerSheetId, updateBody) => {
  const answerSheet = await getAnswerSheetById(answerSheetId);
  if (!answerSheet) {
    throw new ApiError(httpStatus.NOT_FOUND, 'AnswerSheet not found');
  }
  Object.assign(answerSheet, updateBody);
  await answerSheet.save();
  return answerSheet;
};

/**
 * Delete answerSheet by id
 * @param {ObjectId} answerSheetId
 * @returns {Promise<AnswerSheet>}
 */
const deleteAnswerSheetById = async (answerSheetId) => {
  const answerSheet = await getAnswerSheetById(answerSheetId);
  if (!answerSheet) {
    throw new ApiError(httpStatus.NOT_FOUND, 'AnswerSheet not found');
  }
  await answerSheet.remove();
  return answerSheet;
};

const deleteManyAnswerSheetById = (answerSheetIds) => {
  return AnswerSheet.deleteMany({_id: {$in: answerSheetIds}})
};

module.exports = {
  createAnswerSheet,
  queryAnswerSheets,
  getAnswerSheetById,
  updateAnswerSheetById,
  deleteAnswerSheetById,
  deleteManyAnswerSheetById,
};
