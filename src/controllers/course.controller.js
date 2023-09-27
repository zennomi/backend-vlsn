const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { courseService, videoService, testService, purchaseCodeService } = require('../services');
const axios = require("axios");
const { shopAppUrl } = require('../configs/config');

const createCourse = catchAsync(async (req, res) => {
  const nullVideos = await videoService.detectNullVideos(req.body.videos.map(v => v.id));
  const nullTests = await testService.detectNullTests(req.body.tests.map(v => v.id));
  if (nullVideos.length > 0 || nullTests.length > 0) return res.status(httpStatus.CONFLICT).send({ videos: nullVideos, tests: nullTests });
  const course = await courseService.createCourse(req.body);
  res.status(httpStatus.CREATED).send(course);
});

const getCourses = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['title', 'grade', 'tags']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  if (!req.user?.isStaff) filter.isPublished = true;
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

const activeCourse = catchAsync(async (req, res) => {
  const code = req.body.purchaseCode
  if (await purchaseCodeService.getPurchaseCodeByCode(code))
    return res.status(httpStatus.NOT_ACCEPTABLE).send()
  const url = `${shopAppUrl}/get-product-by-purchase-code/${code}`
  const { data } = await axios.get(url)
  if (!data) return res.status(httpStatus.NOT_FOUND).send()
  const field = data.product.customFields.find(field => field.product_filter_key = "course_ids")
  if (!field) return res.status(httpStatus.NOT_FOUND).send()
  const purchaseCode = await purchaseCodeService.createPurchaseCode({ _id: code, user: req.user.id, courses: field.value.split(", ") })
  res.json({ purchaseCode })
})

const activedCourse = catchAsync(async (req, res) => {
  const { courseId } = req.query;
  const code = await purchaseCodeService.getPurchaseCodeByUserIdAndCourseId(req.user.id, courseId)
  res.json({
    actived: !!code
  })
})

const getActivedCourses = catchAsync(async (req, res) => {
  const codes = await purchaseCodeService.getPurchaseCodesByUserId(req.user.id)
  const courseIds = []
  for (const code of codes) courseIds.push(...code.courses)
  const result = await courseService.queryCourses({ ids: courseIds.join(",") }, {limit: 100})
  res.json(result)
})

module.exports = {
  createCourse,
  getCourses,
  getCourse,
  updateCourse,
  deleteCourse,
  getResultTable,
  activeCourse,
  activedCourse,
  getActivedCourses,
};
