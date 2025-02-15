const express = require("express");
const userController = require("../controllers/userController");
const userRouter = express.Router();


//user

userRouter.get("/events", userController.getAllEvents);
userRouter.get("/events/:eventId", userController.getEvent);

userRouter.post("/events/:eventId/rsvp", userController.rsvpToEvent);



module.exports = userRouter;