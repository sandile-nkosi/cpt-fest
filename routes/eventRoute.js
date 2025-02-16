const express = require("express");
const eventController = require("../controllers/eventController");
const baseRouter = express.Router();

baseRouter.get("/", eventController.getIndex);

module.exports = baseRouter;