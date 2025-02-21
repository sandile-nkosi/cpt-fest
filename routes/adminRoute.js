const express = require("express");
const adminController = require("../controllers/adminController");
const adminRouter = express.Router();
const imageUploadMiddleware = require("../middleware/image-upload");

adminRouter.get("/dashboard", adminController.getDashboard);
adminRouter.get("/events/all", adminController.getAllEvents);
adminRouter.get("/events/new", adminController.getAddEvent); // get add event
adminRouter.get("/events/edit/:id", adminController.getEditEvent); // get edit event

adminRouter.post("/events/new", imageUploadMiddleware, adminController.addEvent); // post add event
adminRouter.post("/events/edit/:id", imageUploadMiddleware, adminController.editEvent); // post edit event
adminRouter.post("/events/archive/:id", adminController.archiveEvent); // post archive event
adminRouter.post("/events/unarchive/:id", adminController.unarchiveEvent); // post unarchive event

module.exports = adminRouter;