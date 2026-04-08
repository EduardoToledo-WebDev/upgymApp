const jwt = require('jsonwebtoken');
const db = require('../models/db');
require('dotenv').config();

// 1. Iniciar Rutina: Crea el checkin con duración NULL
module.exports.iniciarCheckin = (req, res) => {
    // 🔒 BARRERA DE SEGURIDAD
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token || token === 'undefined' || token === 'null') {
        return res.status(401).json({ valid: false, message: "No hay sesión activa" });
    }

    jwt.verify(token, process.env.JWT_SECRET, (error, decodificado) => {
        if (error) {
            return res.status(401).json({ valid: false, message: "Sesión caducada o inválida" });
        }

        const { id_usuario, id_gimnasio } = req.body;

        if (!id_usuario || !id_gimnasio) {
            return res.status(400).json({ valid: false, message: "Faltan datos" });
        }

        // 🔴 FIX: Quitamos "fecha". Solo mandamos usuario, gimnasio y duracion NULL.
        // MySQL llenará "fecha_entrada" automáticamente gracias a tu DEFAULT CURRENT_TIMESTAMP.
        const query = `INSERT INTO checkins (id_usuario, id_gimnasio, duracion) VALUES (?, ?, NULL)`;

        db.query(query, [id_usuario, id_gimnasio], (err, results) => {
            if (err) {
                console.error("Error al iniciar checkin:", err);
                return res.status(500).json({ valid: false, message: "Error interno al registrar entrada" });
            }

            return res.status(200).json({
                valid: true,
                message: "Checkin iniciado exitosamente",
                id_checkin: results.insertId
            });
        });
    });
};

// 2. Terminar Rutina: Actualiza la duración y detona el Trigger
module.exports.terminarCheckin = (req, res) => {
    // 🔒 BARRERA DE SEGURIDAD
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token || token === 'undefined' || token === 'null') {
        return res.status(401).json({ valid: false, message: "No hay sesión activa" });
    }

    jwt.verify(token, process.env.JWT_SECRET, (error, decodificado) => {
        if (error) {
            return res.status(401).json({ valid: false, message: "Sesión caducada o inválida" });
        }

        const { id_checkin, duracion_minutos } = req.body;

        if (!id_checkin || !duracion_minutos) {
            return res.status(400).json({ valid: false, message: "Faltan datos" });
        }


        const query = `UPDATE checkins SET duracion = ?, fecha_salida = NOW() WHERE id_checkin = ?`;

        db.query(query, [duracion_minutos, id_checkin], (err, results) => {
            if (err) {
                console.error("Error al terminar checkin:", err);
                return res.status(500).json({ valid: false, message: "Error interno al finalizar rutina" });
            }

            return res.status(200).json({
                valid: true,
                message: "Rutina terminada, Trigger de BD ejecutado correctamente"
            });
        });
    });
};