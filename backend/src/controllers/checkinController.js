const db = require('../models/db');
require('dotenv').config();

module.exports.crearCheckin = async (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    const { id_usuario, ult_activo, racha_act, activo } = req.body;

    if (!token) {
        return res.status(401).json({ message: "Token no proporcionado" });
    }

    try {
        const consulta = "CALL sp_insertar_racha(?);";

        db.query(consulta, [token], (error, results) => {

            if (error) {
                console.error("Error al crear checkin", error);
                return res.status(500).json({ message: "Error interno del servidor" });
            }

            const checkin = results[0][0];

            return res.status(200).json({ message: "Checkin creado exitosamente", checkin });

        });
    } catch (e) {
        console.error("Error inesperado en crear checkin:", e);
        return res.status(500).json({ message: "Error interno del servidor" });
    }

};