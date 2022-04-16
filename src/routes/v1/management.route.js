const express = require("express");
const managementController = require("../../controllers/management.controller");
const { authRequire } = require("../../middlewares/auth.middleware");

const router = express.Router();

router
  .route("/connect")
  .post(authRequire, managementController.connectToManagementApp);

module.exports = router;
