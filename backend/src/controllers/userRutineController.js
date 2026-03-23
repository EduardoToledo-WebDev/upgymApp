const jwt = require('jsonwebtoken');
const db = require('../models/db');
require('dotenv').config();

module.exports.crearRutina = (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token || token === 'undefined' || token === 'null') {
        return res.status(401).json({ valid: false, message: "No hay sesión activa" });
    }

    jwt.verify(token, process.env.JWT_SECRET, (error, decodificado) => {
        if (error) {
            return res.status(401).json({ valid: false, message: "Sesión caducada o inválida" });
        }

        const emailUsuario = decodificado.email;
        const { nombre, ejercicios } = req.body;

        if (!nombre || !ejercicios || ejercicios.length === 0) {
            return res.status(400).json({ valid: false, message: "Faltan datos de la rutina" });
        }

        // 1. Buscamos el ID del usuario
        db.query('SELECT id_usuario FROM usuarios WHERE email = ?', [emailUsuario], (err, resultados) => {
            if (err || resultados.length === 0) {
                return res.status(500).json({ valid: false, message: "Error verificando usuario" });
            }

            const idUsuario = resultados[0].id_usuario;

            // 2. MANDAMOS TODO A MYSQL
            // Convertimos el arreglo de ejercicios a un string JSON para que MySQL lo entienda
            const ejerciciosJSON = JSON.stringify(ejercicios);

            db.query('CALL CrearRutina(?, ?, ?)', [idUsuario, nombre, ejerciciosJSON], (err, result) => {
                if (err) {
                    console.error("Error en el Stored Procedure:", err);
                    return res.status(500).json({ valid: false, message: "Error al guardar la rutina en la base de datos" });
                }

                return res.status(201).json({
                    valid: true,
                    message: "¡Rutina creada exitosamente con Transacción SQL!"
                });
            });
        });
    });
};