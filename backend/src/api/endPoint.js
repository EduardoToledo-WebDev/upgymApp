const express = require('express');
const router = express.Router();
const { ping } = require('../controllers/pingController');
const { login } = require('../controllers/loginController');
const { register } = require('../controllers/registerController');
const { logout } = require('../controllers/logoutController');
const { gimnasioController } = require('../controllers/gimnasioController');
const authController = require('../controllers/authController');
const clasificacionController = require('../controllers/clasificacionController');

router.get('/ping', ping);
router.post('/login', login);
router.post('/register', register);
router.post('/logout', logout);
router.get('/verify-session', authController.verifySession);
router.get('/clasificacion', clasificacionController.verifySession);
router.get("/gimnasio/:id", gimnasioController);
module.exports = router;