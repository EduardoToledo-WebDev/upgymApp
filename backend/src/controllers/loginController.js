const db = require('../models/db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt'); // Importamos bcrypt
require('dotenv').config();

module.exports.login = (req, res) => {
    const { email, password } = req.body;

    // 1. Validar inputs
    if (!email || !password) {
        return res.status(400).json({ message: "Email y contraseña son requeridos" });
    }

    // 2. Buscar al usuario SOLO por email (no pongas la contraseña en el WHERE)
    const consulta = "SELECT * FROM usuarios WHERE email = ?";

    db.query(consulta, [email], async (error, resultados) => {
        if (error) {
            console.error("Error en DB:", error);
            return res.status(500).json({ message: "Error interno del servidor" });
        }

        // Si existe el usuario
        if (resultados.length > 0) {
            const usuario = resultados[0];

            try {
                // 3. Comparar la contraseña ingresada con el hash guardado
                // usuario.contraseña debe ser el string hasheado ($2b$10$...)
                const passwordValida = await bcrypt.compare(password, usuario.contraseña);

                if (passwordValida) {
                    // 4. Generar el token
                    const token = jwt.sign({ email: usuario.email }, process.env.JWT_SECRET, {
                        expiresIn: "7d"
                    });

                    return res.status(200).json({
                        message: "Login exitoso",
                        token: token
                    });
                } else {
                    // Contraseña incorrecta
                    return res.status(401).json({ message: "Email o contraseña incorrectos" });
                }
            } catch (compareError) {
                console.error("Error al comparar contraseñas:", compareError);
                return res.status(500).json({ message: "Error interno del servidor" });
            }

        } else {
            // Usuario no encontrado
            return res.status(401).json({ message: "Email o contraseña incorrectos" });
        }
    });
};