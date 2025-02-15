const express = require("express");
const eventController = require("../controllers/eventController");
const eventRouter = express.Router();


//user

eventRouter.get("/", eventController.getEvents);



module.exports = eventRouter;