const redisClient = require("../configs/cache");
const catchAsync = require("../utils/catchAsync");
const logger = require("../configs/logger");
const { env } = require("../configs/config");

const setCache = (second) =>
  catchAsync(async (req, res, next) => {
    if (req.query.cache == "false") return next();

    const data = await redisClient.get(req.originalUrl);
    if (data) {
      logger.info(`Cached ${req.method} ${req.originalUrl}`);
      res.send(JSON.parse(data));
    } else {
      const send = res.send.bind(res);

      // wrapper send response function
      res.send = function (body) {
        if (body && !(body.code != 200 || body.message))
          redisClient.setEx(req.originalUrl, second, JSON.stringify(body));
        send(body);
      };
      next();
    }
  });

const deleteCache = catchAsync(async (req, res, next) => {
  if (req.query.cache == "false") return next();
  // await redisClient.del(req.originalUrl);
  await scanAndDelete(req.originalUrl + "*");
  next();
});

async function scanAndDelete(pattern) {
  let cursor = "0";
  // delete any paths with query string matches
  const reply = await redisClient.scan(cursor, { MATCH: pattern, COUNT: 1000 });
  for (key of reply.keys) {
    cursor = reply.cursor;
    logger.info(`DELETE CACHE ${key}`);
    await redisClient.del(key);
  }
}

module.exports = { setCache, deleteCache };
