const express = require('express');
const videoController = require('../../controllers/video.controller');
const { authRequire, staffRequire, auth } = require("../../middlewares/auth.middleware");
const cacheRequest = require('../../middlewares/cache');

const router = express.Router();

router
  .route('/')
  .post(staffRequire, videoController.createVideo)
  .get(auth, videoController.getVideos);

router
  .route('/:videoId')
  .get(cacheRequest.setCache(60 * 5), videoController.getVideo)
  .patch(cacheRequest.deleteCache, staffRequire, videoController.updateVideo)
  .delete(authRequire, staffRequire, videoController.deleteVideo);

router.route('/:videoId/key')
  .get(authRequire, cacheRequest.setCache(60 * 5), videoController.getVideoKey)

router.route('/:videoId/result-table')
  .get(videoController.getResultTable);

module.exports = router;
