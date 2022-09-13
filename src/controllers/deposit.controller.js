const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { depositService } = require('../services');

const createDeposit = catchAsync(async (req, res) => {
    const deposit = await depositService.createDeposit(req.body);
    res.status(httpStatus.CREATED).send(deposit);
});

const getDeposits = catchAsync(async (req, res) => {
    const filter = pick(req.query, ['user']);
    const options = pick(req.query, ['sortBy', 'limit', 'page']);
    const result = await depositService.queryDeposits(filter, options);
    res.send(result);
});

const getDeposit = catchAsync(async (req, res) => {
    const options = pick(req.query, ['populate']);
    let deposit = await depositService.getDepositById(req.params.depositId, options);
    if (!deposit) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Deposit not found');
    }
    deposit = deposit.toJSON();
    res.send(deposit);
});

const updateDeposit = catchAsync(async (req, res) => {
    const deposit = await depositService.updateDepositById(req.params.depositId, req.body);
    res.send(deposit);
});

const verifyDeposit = catchAsync(async (req, res) => {
    updateInfo = {
        isVerified: true,
        verifiedAt: new Date(),
        verifiedUser: req.user.id,
    }
    const deposit = await depositService.updateDepositById(req.params.depositId, req.body);
    res.send(deposit);
})

const deleteDeposit = catchAsync(async (req, res) => {
    await depositService.deleteDepositById(req.params.depositId);
    res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
    createDeposit,
    getDeposits,
    getDeposit,
    updateDeposit,
    deleteDeposit,
    verifyDeposit,
};
