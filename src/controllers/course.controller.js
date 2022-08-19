const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { courseService, videoService, testService } = require('../services');

const createCourse = catchAsync(async (req, res) => {
  const nullVideos = await videoService.detectNullVideos(req.body.videos.map(v => v.id));
  const nullTests = await testService.detectNullTests(req.body.tests.map(v => v.id));
  if (nullVideos.length > 0 || nullTests.length > 0) return res.status(httpStatus.CONFLICT).send({ videos: nullVideos, tests: nullTests });
  const course = await courseService.createCourse(req.body);
  res.status(httpStatus.CREATED).send(course);
});

const getCourses = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['name', 'grade', 'tags']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  if (!req.user?.isStaff) filter.isPublic = true;
  const result = await courseService.queryCourses(filter, options);
  res.send(result);
});

const getCourse = catchAsync(async (req, res) => {
  const options = pick(req.query, ['populate']);
  options.populate = Array.from((new Set(options.populate?.split(",") || [])).add('videos.id').add('tests.id')).join(",");
  let course = await courseService.getCourseById(req.params.courseId, options);
  if (!course) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Course not found');
  }
  course = course.toJSON();
  course.components = [...course.videos.map(v => ({ ...v.id, index: v.index, type: 'video' })), ...course.tests.map(v => ({ ...v.id, index: v.index, type: 'test' }))].sort((a, b) => (a.index - b.index));
  delete course.videos;
  delete course.tests;
  console.log(course);
  res.send(course);
});

const updateCourse = catchAsync(async (req, res) => {
  const nullVideos = await videoService.detectNullVideos(req.body.videos.map(v => v.id));
  const nullTests = await testService.detectNullTests(req.body.tests.map(v => v.id));
  if (nullVideos.length > 0 || nullTests.length > 0) return res.status(httpStatus.CONFLICT).send({ videos: nullVideos, tests: nullTests });
  const course = await courseService.updateCourseById(req.params.courseId, req.body);
  res.send(course);
});

const deleteCourse = catchAsync(async (req, res) => {
  await courseService.deleteCourseById(req.params.courseId);
  res.status(httpStatus.NO_CONTENT).send();
});

const getResultTable = catchAsync(async (req, res) => {
  const table = await courseService.getResultTableById(req.params.courseId, req.query.userId);
  res.status(httpStatus.OK).send(table);
});

module.exports = {
  createCourse,
  getCourses,
  getCourse,
  updateCourse,
  deleteCourse,
  getResultTable,
};
