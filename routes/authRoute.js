const express = require('express');
const authRouter = express.Router();
const authController = require('../controllers/authController');


authRouter.get('/signin', authController.getSignIn);

authRouter.get('/signup', authController.getSignUp);

//post routes
authRouter.post('/signup', authController.signUp);

authRouter.post('/signin', authController.signIn);

authRouter.post("/signout", authController.signOut);


module.exports = authRouter;