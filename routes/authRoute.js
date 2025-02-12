const express = require('express');
const authRouter = express.Router();
const authController = require('../controllers/authController');


authRouter.get('/signin', authController.getSignIn);

authRouter.get('/signup', authController.getSignUp);

authRouter.get('/admin/signin', authController.getAdminSignIn);

//post routes - user
authRouter.post('/signup', authController.signUp);

authRouter.post('/signin', authController.signIn);

authRouter.post("/signout", authController.signOut);

//post routes - admin

authRouter.post('/admin/signup', authController.adminSignUp);

authRouter.post('/admin/signin', authController.adminSignIn);

module.exports = authRouter;