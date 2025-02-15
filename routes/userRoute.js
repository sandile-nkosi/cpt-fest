const express = require("express");
const userController = require("../controllers/userController");
const userRouter = express.Router();


//user

userRouter.get("/events", userController.getEvents);



module.exports = userRouter;