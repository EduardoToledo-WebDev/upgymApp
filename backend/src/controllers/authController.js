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

    jwt.verify(token, process.env.JWT_SECRET, (error, decodificado) => {
        if (error) {
            return res.status(401).json({ valid: false, message: "Sesión caducada o inválida" });
        }

        const emailUsuario = decodificado.email;

        const consulta = `SELECT 
    u.id_usuario,
    u.nombre,
    u.email,
    IFNULL(dr.racha_act, 0) AS racha_act,
    CASE 
        WHEN dr.activo = 1 THEN 'Activa'
        ELSE 'Inactiva'
    END AS estado_racha
FROM usuarios u
LEFT JOIN dias_racha dr ON u.id_usuario = dr.id_usuario
WHERE u.email = ?;`;

        db.query(consulta, [emailUsuario], (err, resultados) => {
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
                return res.status(404).json({ valid: false, message: "Usuario no encontrado" });
            }
        });
    });
};