const express = require('express');
const depositController = require('../../controllers/deposit.controller');
const { authRequire, staffRequire, auth } = require("../../middlewares/auth.middleware");
const cacheRequest = require('../../middlewares/cache');

const router = express.Router();

router
    .route('/')
    .post(staffRequire, depositController.createCourse)
    .get(auth, depositController.getCourses);

router
    .route('/:depositId')
    .patch(staffRequire, depositController.updateCourse)
    .delete(authRequire, staffRequire, depositController.deleteCourse);

router
    .route('/:depositId/verify')
    .get(staffRequire, depositController.verifyDeposit)

module.exports = router;
