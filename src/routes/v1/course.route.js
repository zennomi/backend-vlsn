const express = require('express');
const courseController = require('../../controllers/course.controller');
const { authRequire, staffRequire, auth } = require("../../middlewares/auth.middleware");
const cacheRequest = require('../../middlewares/cache');

const router = express.Router();

router
  .route('/')
  .post(staffRequire, courseController.createCourse)
  .get(auth, courseController.getCourses);

router.route('/active').get(authRequire, courseController.activedCourse).post(authRequire, courseController.activeCourse)

router.route('/actived').get(authRequire, courseController.getActivedCourses)

router
  .route('/:courseId')
  .get(cacheRequest.setCache(60 * 5), courseController.getCourse)
  .patch(cacheRequest.deleteCache, staffRequire, courseController.updateCourse)
  .delete(authRequire, staffRequire, courseController.deleteCourse);

module.exports = router;
