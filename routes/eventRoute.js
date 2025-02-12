const express = require("express");
const eventController = require("../controllers/eventController");
const eventRouter = express.Router();
const imageUploadMiddleware = require("../middleware/image-upload");

//user

eventRouter.get("/", eventController.getEvents);



//admin
eventRouter.get("/admin/all", eventController.getAllEvents);
eventRouter.get("/admin/new", eventController.getAddEvent); // get add event
eventRouter.get("/admin/edit", eventController.getEditEvent); // get edit event

eventRouter.post("/admin/new", imageUploadMiddleware, eventController.addEvent); // post add event



module.exports = eventRouter;