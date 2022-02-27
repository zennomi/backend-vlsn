const redisClient = require('../configs/cache');
const catchAsync = require('../utils/catchAsync');
const logger = require('../configs/logger');
const { env } = require('../configs/config');

const setCache = (second) =>
  catchAsync(async (req, res, next) => {
    if (req.query.cache == 'false') return next();

    const data = await redisClient.get(req.originalUrl);
    if (data) {
      logger.info(`Cached ${req.method} ${req.originalUrl}`);
      res.send(JSON.parse(data));
    } else {
      const send = res.send.bind(res);

      // wrapper send response function
      res.send = function (body) {
        redisClient.setEx(req.originalUrl, second, JSON.stringify(body));
        send(body);
      };
      next();
    }
  });

const deleteCache = catchAsync(async (req, res, next) => {
  if (req.query.cache == 'false') return next();
  console.log('hello');
  logger.info(`Delete ${req.method} ${req.originalUrl}`);
  await redisClient.del(req.originalUrl);
  next();
});

module.exports = { setCache, deleteCache };
