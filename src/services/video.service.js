const httpStatus = require('http-status');
const { Video, AnswerSheet } = require('../models');
const answerSheetService = require('./answerSheet.service');
const ApiError = require('../utils/ApiError');
const pick = require('../utils/pick');

/**
 * Create a video
 * @param {Object} videoBody
 * @returns {Promise<Video>}
 */
const createVideo = async (videoBody) => {
  return Video.create(videoBody);
};

/**
 * Query for videos
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryVideos = async (filter, options) => {
  if (filter.name) filter.name = { $regex: filter.name, "$options": "i" };
  if (filter.tags) tags = { $all: filter.tags.split(",") };
  console.log(filter);
  const videos = await Video.paginate(filter, options);
  return videos;
};

const detectNullVideos = async (ids) => {
  let foundVideos = await Video.find({ _id: { $in: ids } });
  foundVideos = foundVideos.map(v => v._id.toString());
  return ids.filter(id => !foundVideos.includes(id));
}

/**
 * Get video by id
 * @param {ObjectId} id
 * @returns {Promise<Video>}
 */
const getVideoById = async (id, options) => {
  let videoPromise = Video.findById(id);
  if (options?.populate) {
    options.populate.split(',').forEach((populateOption) => {
      videoPromise = videoPromise.populate(
        populateOption
          .split('.')
          .reverse()
          .reduce((a, b) => ({ path: b, populate: a }))
      );
    });
  }

  videoPromise = videoPromise.exec();

  return videoPromise;
};

/**
 * Get video by email
 * @param {string} email
 * @returns {Promise<Video>}
 */
const getVideoByEmail = async (email) => {
  return Video.findOne({ email });
};

const getVideoKey = async (videoId) => {
  const video = await getVideoById(videoId, { populate: "questions" });
  if (!video) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Video not found');
  }
  const key = video.getKey();
  return key;
}

/**
 * Update video by id
 * @param {ObjectId} videoId
 * @param {Object} updateBody
 * @returns {Promise<Video>}
 */
const updateVideoById = async (videoId, updateBody) => {
  const video = await getVideoById(videoId);
  if (!video) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Video not found');
  }
  Object.assign(video, updateBody);
  await video.save();
  return video;
};

/**
 * Delete video by id
 * @param {ObjectId} videoId
 * @returns {Promise<Video>}
 */
const deleteVideoById = async (videoId) => {
  const video = await getVideoById(videoId);
  if (!video) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Video not found');
  }
  await AnswerSheet.deleteMany({ videoId });
  await video.remove();
  return video;
};

const getResultTableById = async (videoId, userId) => {
  const video = await getVideoById(videoId, { populate: "questions" });
  if (!video) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Video not found');
  }
  const key = video.getKey();
  const sheetFilter = { videoId: videoId }
  if (userId) sheetFilter.user = userId;
  const { results: sheets } = await answerSheetService.queryAnswerSheets(sheetFilter, { populate: "user", limit: 1000 });
  const results = sheets.map(sheet => {
    sheet = sheet.toJSON();
    const result = pick(sheet, ['createdAt', 'updatedAt', 'finishedAt', 'id', 'blurCount']);
    // result.id = result._id;
    result.user = pick(sheet.user, ['displayName', 'photoURL', 'email', 'id']);
    result.trueCount = sheet.choices.filter(c => key.includes(c.choiceId.toString())).length;
    result.mark = result.trueCount / video.questions.length * 10;
    return result;
  })
  return results;
}

module.exports = {
  createVideo,
  queryVideos,
  getVideoById,
  getVideoKey,
  getVideoByEmail,
  updateVideoById,
  deleteVideoById,
  getResultTableById,
  detectNullVideos,
};
