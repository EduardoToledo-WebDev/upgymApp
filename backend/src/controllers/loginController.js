
const db = require('../models/db');
const jwt = require('jsonwebtoken');
require('dotenv').config();

module.exports.login = (req, res) => {
    const { email, password } = req.body;

    // 1. Validar ANTES de ir a la base de datos
    if (!email || !password) {
        return res.status(400).json({ message: "Email y contraseña son requeridos" });
    }

    const consulta = "SELECT * FROM usuarios WHERE email = ? AND contraseña = ?";

    db.query(consulta, [email, password], (error, resultados) => {
        if (error) {
            console.error("Error en DB:", error);
            return res.status(500).json({ message: "Error interno del servidor" });
        }

        if (resultados.length > 0) {
            // 2. Generar el token 
            const token = jwt.sign({ email }, process.env.JWT_SECRET, {
                expiresIn: "7d"
            });

            return res.status(200).json({
                message: "Login exitoso",
                token: token
            });
        } else {
            return res.status(401).json({ message: "Email o contraseña incorrectos" });
        }
    });
};