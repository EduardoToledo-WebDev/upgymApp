const express = require('express');
const router = express.Router();


const { login } = require('../controllers/loginController');
const { register } = require('../controllers/registerController');
const authController = require('../controllers/authController');
const clasificacionController = require('../controllers/clasificacionController');
const rutinasController = require('../controllers/rutinasController');

router.post('/login', login);
router.post('/register', register);
router.get('/verify-session', authController.verifySession);
router.get('/clasificacion', clasificacionController.verifySession);
router.get('/rutinas', rutinasController.obtenerRutinas);
router.post('/rutinas', rutinasController.crearRutina);
router.put('/rutinas/:id', rutinasController.editarRutina);
router.delete('/rutinas/:id', rutinasController.eliminarRutina);

module.exports = router;