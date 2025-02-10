const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');


router.get('/login', (req, res) => {
  res.render('user/user-login');
});

router.get('/register', authController.getRegister);

//post routes
router.post('/register', (req, res) => {
  res.send('Register user');
});


module.exports = router;