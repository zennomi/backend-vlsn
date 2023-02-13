const httpStatus = require('http-status');
const { Course, AnswerSheet } = require('../models');
const answerSheetService = require('./answerSheet.service');
const ApiError = require('../utils/ApiError');
const pick = require('../utils/pick');

/**
 * Create a course
 * @param {Object} courseBody
 * @returns {Promise<Course>}
 */
const createCourse = async (courseBody) => {
  return Course.create(courseBody);
};

/**
 * Query for courses
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryCourses = async (filter, options) => {
  if (filter.name) filter.name = { $regex: filter.name, "$options": "i" };
  if (filter.tags) tags = { $all: filter.tags.split(",") };
  const courses = await Course.paginate(filter, options);
  return courses;
};

/**
 * Get course by id
 * @param {ObjectId} id
 * @returns {Promise<Course>}
 */
const getCourseById = async (id, options) => {
  let coursePromise = Course.findById(id);
  if (options?.populate) {
    options.populate.split(',').forEach((populateOption) => {
      coursePromise = coursePromise.populate(
        populateOption
          .split('.')
          .reverse()
          .reduce((a, b) => ({ path: b, populate: a }))
      );
    });
  }

  coursePromise = coursePromise.exec();

  return coursePromise;
};

/**
 * Get course by email
 * @param {string} email
 * @returns {Promise<Course>}
 */
const getCourseByEmail = async (email) => {
  return Course.findOne({ email });
};

const getCourseKey = async (courseId) => {
  const course = await getCourseById(courseId, { populate: "questions" });
  if (!course) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Course not found');
  }
  const key = course.getKey();
  return key;
}

/**
 * Update course by id
 * @param {ObjectId} courseId
 * @param {Object} updateBody
 * @returns {Promise<Course>}
 */
const updateCourseById = async (courseId, updateBody) => {
  const course = await getCourseById(courseId);
  if (!course) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Course not found');
  }
  Object.assign(course, updateBody);
  console.log(course);
  await course.save();
  return course;
};

/**
 * Delete course by id
 * @param {ObjectId} courseId
 * @returns {Promise<Course>}
 */
const deleteCourseById = async (courseId) => {
  const course = await getCourseById(courseId);
  if (!course) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Course not found');
  }
  await AnswerSheet.deleteMany({ courseId });
  await course.remove();
  return course;
};

const getResultTableById = async (courseId, userId) => {
  const course = await getCourseById(courseId, { populate: "questions" });
  if (!course) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Course not found');
  }
  const key = course.getKey();
  const sheetFilter = { courseId: courseId }
  if (userId) sheetFilter.user = userId;
  const { results: sheets } = await answerSheetService.queryAnswerSheets(sheetFilter, { populate: "user", limit: 1000 });
  const results = sheets.map(sheet => {
    sheet = sheet.toJSON();
    const result = pick(sheet, ['createdAt', 'updatedAt', 'finishedAt', 'id', 'blurCount']);
    // result.id = result._id;
    result.user = pick(sheet.user, ['displayName', 'photoURL', 'email', 'id']);
    result.trueCount = sheet.choices.filter(c => key.includes(c.choiceId.toString())).length;
    result.mark = result.trueCount / course.questions.length * 10;
    return result;
  })
  return results;
}

module.exports = {
  createCourse,
  queryCourses,
  getCourseById,
  getCourseKey,
  getCourseByEmail,
  updateCourseById,
  deleteCourseById,
  getResultTableById,
};
