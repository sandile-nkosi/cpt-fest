const express = require("express");
const adminController = require("../controllers/adminController");
const adminRouter = express.Router();

adminRouter.get("/dashboard", adminController.getDashboard);

module.exports = adminRouter;