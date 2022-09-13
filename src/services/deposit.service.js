const httpStatus = require('http-status');
const { Deposit } = require('../models');
const ApiError = require('../utils/ApiError');
const pick = require('../utils/pick');

/**
 * Create a deposit
 * @param {Object} depositBody
 * @returns {Promise<Deposit>}
 */
const createDeposit = async (depositBody) => {
    return Deposit.create(depositBody);
};

/**
 * Query for deposits
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryDeposits = async (filter, options) => {
    const deposits = await Deposit.paginate(filter, options);
    return deposits;
};

/**
 * Get deposit by id
 * @param {ObjectId} id
 * @returns {Promise<Deposit>}
 */
const getDepositById = async (id, options) => {
    let depositPromise = Deposit.findById(id);
    if (options?.populate) {
        options.populate.split(',').forEach((populateOption) => {
            depositPromise = depositPromise.populate(
                populateOption
                    .split('.')
                    .reverse()
                    .reduce((a, b) => ({ path: b, populate: a }))
            );
        });
    }

    depositPromise = depositPromise.exec();

    return depositPromise;
};

/**
 * Update deposit by id
 * @param {ObjectId} depositId
 * @param {Object} updateBody
 * @returns {Promise<Deposit>}
 */
const updateDepositById = async (depositId, updateBody) => {
    const deposit = await getDepositById(depositId);
    if (!deposit) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Deposit not found');
    }
    Object.assign(deposit, updateBody);
    await deposit.save();
    return deposit;
};

/**
 * Delete deposit by id
 * @param {ObjectId} depositId
 * @returns {Promise<Deposit>}
 */
const deleteDepositById = async (depositId) => {
    const deposit = await getDepositById(depositId);
    if (!deposit) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Deposit not found');
    }
    await deposit.remove();
    return deposit;
};

module.exports = {
    createDeposit,
    queryDeposits,
    getDepositById,
    updateDepositById,
    deleteDepositById,
};
