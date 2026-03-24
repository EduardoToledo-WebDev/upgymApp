const db = require('../models/db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt'); // Importamos bcrypt
require('dotenv').config();

module.exports.checkin = async (req, res) => {
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({ message: "id es requerido" });
    }

    try {
        const consulta = "CALL validar_gimnasio(?);";

        db.query(consulta, [id], (error, results) => {

            if (error) {
                console.error("Error al hacer checkin", error);
                return res.status(500).json({ message: "Error interno del servidor" });
            }

            const gimnasio = results[0][0];

            return res.status(200).json({ message: "Checkin exitoso", gimnasio });

        });
    } catch (e) {
        console.error("Error inesperado en registro:", e);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
};