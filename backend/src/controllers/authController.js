const jwt = require('jsonwebtoken');
const db = require('../models/db');
require('dotenv').config();

module.exports.verifySession = (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    // 1. Validar que el token no sea basura
    if (!token || token === 'undefined' || token === 'null') {
        return res.status(401).json({ valid: false, message: "No hay sesión activa" });
    }

    // 2. Verificar el JWT
    jwt.verify(token, process.env.JWT_SECRET, (error, decodificado) => {
        if (error) {
            return res.status(401).json({ valid: false, message: "Sesión caducada o inválida" });
        }

        // Extraemos el email del payload del token
        const emailUsuario = decodificado.email;
        const consulta = "CALL ObtenerUsuario(?)";

        db.query(consulta, [emailUsuario], (err, resultados) => {
            if (err) {
                console.error("Error consultando BD en verify-session:", err);
                return res.status(500).json({ valid: false, message: "Error interno del servidor" });
            }

            /* RECORDATORIO: 
               resultados[0] = Arreglo de filas (los datos del usuario)
               resultados[0][0] = El objeto del usuario específico
            */
            const filas = resultados[0];

            if (filas && filas.length > 0) {
                const usuario = filas[0];

                // Devolvemos el OBJETO del usuario, no el arreglo
                return res.status(200).json({
                    valid: true,
                    user: usuario
                });
            } else {
                return res.status(404).json({ valid: false, message: "Usuario no encontrado en la base de datos" });
            }
        });
    });
};