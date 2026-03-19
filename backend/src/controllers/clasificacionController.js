const jwt = require('jsonwebtoken');
const db = require('../models/db');
require('dotenv').config();

module.exports.verifySession = (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    // Evitamos que intente validar la palabra "undefined"
    if (!token || token === 'undefined' || token === 'null') {
        return res.status(401).json({ valid: false, message: "No hay sesión activa" });
    }

    jwt.verify(token, process.env.JWT_SECRET, (error) => {
        if (error) {
            return res.status(401).json({ valid: false, message: "Sesión caducada o inválida" });
        }
        const consulta = "CALL Top_racha();";

        db.query(consulta, (err, resultados) => {
            if (err) {
                console.error("Error consultando BD en verify-session:", err);
                return res.status(500).json({ valid: false, message: "Error interno del servidor" });
            }

            if (resultados.length > 0) {

                // Ya no generamos token aquí. Devolvemos la info del usuario.
                return res.status(200).json({
                    valid: true,
                    user: resultados[0] // Main.jsx necesita esto para setUserData()
                });
            } else {
                return res.status(404).json({ valid: false, message: "Sin registros" });
            }
        });

    });
}
