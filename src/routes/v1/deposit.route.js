const express = require('express');
const depositController = require('../../controllers/deposit.controller');
const { authRequire, staffRequire, auth } = require("../../middlewares/auth.middleware");

const router = express.Router();

router
    .route('/')
    .post(depositController.createDeposit)
    .get(auth, depositController.getDeposits);

router
    .route('/:depositId')
    .patch(staffRequire, depositController.updateDeposit)
    .delete(authRequire, staffRequire, depositController.deleteDeposit);

router
    .route('/:depositId/verify')
    .get(staffRequire, depositController.verifyDeposit)

module.exports = router;
