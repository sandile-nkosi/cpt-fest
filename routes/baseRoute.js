const express = require("express");
const baseController = require("../controllers/baseController");
const baseRouter = express.Router();

baseRouter.get("/", baseController.getIndex);

module.exports = baseRouter;