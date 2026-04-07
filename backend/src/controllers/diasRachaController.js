const jwt = require('jsonwebtoken');
const db = require('../models/db');
require('dotenv').config();

module.exports.obtenerDiasRachaUsuario = async (req, res) => {
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({ message: "id es requerido" });
    }

    try {
        const consulta = "CALL sp_obtener_racha_por_id(?);";

        db.query(consulta, [id], (error, results) => {

            if (error) {
                console.error("Error al obtener dias de racha", error);
                return res.status(500).json({ message: "Error interno del servidor" });
            }

            const diasRacha = results[0][0];

            return res.status(200).json({ message: "Dias de racha obtenidos exitosamente", diasRacha });

        });
    } catch (e) {
        console.error("Error inesperado en obtener dias de racha:", e);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
};
