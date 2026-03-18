const db = require('../models/db');
const jwt = require('jsonwebtoken');

module.exports.register = (req, res) => {
    const { nombre, email, password } = req.body;
    const consulta = "INSERT INTO usuarios (nombre,email, contraseña) VALUES (?, ?, ?)";
    try {
        db.query(consulta, [nombre, email, password], (error, resultados) => {
            if (error) {
                res.send(error);
            }
            if (!nombre || !email || !password) {
                return res.status(400).json({ message: "Username y password son requeridos" });
            }
            if (resultados.length > 0) {
                const token = jwt.sign({ nombre, email, password }, "Stack", {
                    expiresIn: "24h"
                })
                res.cookie('access_token', token, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'lax',
                    maxAge: 24 * 60 * 60 * 1000
                });
                res.send({ token });
            } else {
                console.log("Usuario no encontrado");
                res.send("Usuario no encontrado");
            }


        });
    } catch (e) {
    }
};