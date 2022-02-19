const redisClient = require('../configs/cache');
const catchAsync = require('../utils/catchAsync');
const logger = require('../configs/logger');
const { env } = require('../configs/config');

const cacheRequest = (second) =>
  catchAsync(async (req, res, next) => {
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

module.exports = cacheRequest;
