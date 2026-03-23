const db = require('../models/db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt'); // Importamos bcrypt
require('dotenv').config();

module.exports.register = async (req, res) => {
    const { nombre, email, password } = req.body;

    // 1. Validar ANTES de hacer nada
    if (!nombre || !email || !password) {
        return res.status(400).json({ message: "Nombre, email y contraseña son requeridos" });
    }

    try {
        // 2. Hashear la contraseña
        const saltRounds = 10;
        const passwordHasheada = await bcrypt.hash(password, saltRounds);

        // 3. Guardar en la base de datos
        const consulta = "INSERT INTO usuarios (nombre, email, contraseña) VALUES (?, ?, ?)";

        db.query(consulta, [nombre, email, passwordHasheada], (error, resultados) => {
            if (error?.code === 'ER_DUP_ENTRY') {
                return res.status(400).json({ message: "El email ya está registrado" });
            }
            if (error) {
                console.error("Error al registrar:", error);
                // Aquí podrías validar si el error es por email duplicado (ej. error.code === 'ER_DUP_ENTRY')
                return res.status(500).json({ message: "Error al crear el usuario", error: error.code });
            }


            // En un INSERT exitoso, resultados.affectedRows es mayor a 0
            if (resultados.affectedRows > 0) {
                // 4. Auto-login: Generamos el token usando el email (igual que en el login)
                const token = jwt.sign({ email }, process.env.JWT_SECRET, {
                    expiresIn: "7d" // Unificado con el tiempo del login
                });

                // Devolvemos exactamente la misma estructura que el login
                return res.status(201).json({
                    message: "Usuario registrado y logueado exitosamente",
                    token: token
                });
            } else {
                return res.status(400).json({ message: "No se pudo registrar el usuario" });
            }
        });
    } catch (e) {
        console.error("Error inesperado en registro:", e);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
};