const express = require("express");
const userController = require("../controllers/userController");
const userRouter = express.Router();


//user

userRouter.get("/events", userController.getAllEvents);
userRouter.get("/events/:eventId", userController.getEvent);

userRouter.post("/events/:eventId/rsvp", userController.toggleRSVP);
userRouter.post("/events/:eventId/rate", userController.eventRating);

module.exports = userRouter;