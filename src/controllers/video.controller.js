const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { videoService } = require('../services');

const createVideo = catchAsync(async (req, res) => {
  const video = await videoService.createVideo(req.body);
  res.status(httpStatus.CREATED).send(video);
});

const getVideos = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['name', 'grade', 'tags']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  if (!req.user?.isStaff) filter.isPublic = true;
  const result = await videoService.queryVideos(filter, options);
  res.send(result);
});

const getVideo = catchAsync(async (req, res) => {
  const options = pick(req.query, ['populate']);
  const video = await videoService.getVideoById(req.params.videoId, options);
  if (!video) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Video not found');
  }
  res.send(video);
});

const getVideoKey = catchAsync(async (req, res) => {
  const key = await videoService.getVideoKey(req.params.videoId);
  res.send(key);
});

const updateVideo = catchAsync(async (req, res) => {
  const video = await videoService.updateVideoById(req.params.videoId, req.body);
  res.send(video);
});

const deleteVideo = catchAsync(async (req, res) => {
  await videoService.deleteVideoById(req.params.videoId);
  res.status(httpStatus.NO_CONTENT).send();
});

const getResultTable = catchAsync(async (req, res) => {
  const table = await videoService.getResultTableById(req.params.videoId, req.query.userId);
  res.status(httpStatus.OK).send(table);
});

module.exports = {
  createVideo,
  getVideos,
  getVideo,
  getVideoKey,
  updateVideo,
  deleteVideo,
  getResultTable,
};
