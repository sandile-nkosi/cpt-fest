const mongoose = require("mongoose");
const express = require("express");
const userController = require("../controllers/userController");
const userRouter = express.Router();

// Middleware to validate MongoDB ObjectId
function validateObjectId(req, res, next) {
    if (!mongoose.Types.ObjectId.isValid(req.params.eventId)) {
        return res.status(400).send("Invalid Event ID");
    }
    next();
}

// User routes
userRouter.get("/events", userController.getAllEvents);

// Routes that don't need an eventId
userRouter.get("/events/own", userController.getUserRSVPs);

// ✅ Apply validation before getEvent()
userRouter.get("/events/:eventId", validateObjectId, userController.getEvent);

// Other routes that require an eventId
userRouter.post("/events/:eventId/rsvp", validateObjectId, userController.toggleRSVP);
userRouter.post("/events/:eventId/rate", validateObjectId, userController.eventRating);

module.exports = userRouter;
