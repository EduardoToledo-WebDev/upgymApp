const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });


const { login } = require('../controllers/loginController');
const { register } = require('../controllers/registerController');

const { gimnasioController } = require('../controllers/gimnasioController');


const checkinController = require('../controllers/checkinController');
const diasRachaController = require('../controllers/diasRachaController');
const authController = require('../controllers/authController');
const clasificacionController = require('../controllers/clasificacionController');
const rutinasController = require('../controllers/rutinasController');
const exerciseController = require('../controllers/exerciseController');
const premiosController = require('../controllers/premiosController');

router.post('/login', login);
router.post('/register', register);
router.get('/verify-session', authController.verifySession);
router.get('/clasificacion', clasificacionController.verifySession);
router.get("/gimnasio/:id", gimnasioController);
router.post('/checkin/iniciar', checkinController.iniciarCheckin);
router.put('/checkin/terminar', checkinController.terminarCheckin);
router.get('/rutinas', rutinasController.obtenerRutinas);
router.post('/rutinas', rutinasController.crearRutina);
router.put('/rutinas/:id', rutinasController.editarRutina);
router.delete('/rutinas/:id', rutinasController.eliminarRutina);
router.get('/exercises', exerciseController.getEjercicios);
router.get('/body-parts', exerciseController.getBodyParts);
router.get('/equipments', exerciseController.getEquipments);
router.get('/muscles', exerciseController.getMuscles);
router.put('/carpetas/asignar', rutinasController.asignarCarpeta);
router.post('/rutinas/importar', upload.single('documento'), rutinasController.importarRutinaIA);
router.get('/catalogo-premios', premiosController.obtenerCatalogoPremios);

module.exports = router;