const db = require('../models/db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
require('dotenv').config();

module.exports.login = (req, res) => {
    const { email, password } = req.body;

    // 1. Validaciones básicas
    if (!email || !password) {
        return res.status(400).json({ message: "Email y contraseña son requeridos" });
    }

    // 2. Llamada al procedimiento (Asegúrate que el nombre coincida con tu SQL)
    const consulta = "CALL ObtenerIdUsuarioCompletoPorEmail(?)";

    db.query(consulta, [email], async (error, resultados) => {
        if (error) {
            console.error("Error en DB:", error);
            return res.status(500).json({ message: "Error interno del servidor" });
        }

        /* OJO AQUÍ: 
           Cuando usas 'CALL', resultados es: [ [Filas], [Metadatos] ]
           Por eso accedemos a resultados[0] para las filas, 
           y a resultados[0][0] para el primer (y único) usuario.
        */
        const filas = resultados[0];

        if (filas && filas.length > 0) {
            const usuario = filas[0];

            try {
                // 3. Verificamos que la columna 'contraseña' exista en el objeto
                if (!usuario.contraseña) {
                    console.error("Error: La columna 'contraseña' no viene en el SP.");
                    return res.status(500).json({ message: "Error en la estructura de la base de datos" });
                }

                // 4. Comparar hash
                const passwordValida = await bcrypt.compare(password, usuario.contraseña);

                if (passwordValida) {
                    // 5. Generar JWT (No metas la contraseña en el token, solo datos útiles)
                    const token = jwt.sign(
                        {
                            id: usuario.id_usuario,
                            email: usuario.email,
                            nombre: usuario.nombre
                        },
                        process.env.JWT_SECRET,
                        { expiresIn: "7d" }
                    );

                    return res.status(200).json({
                        message: "¡Bienvenido de nuevo!",
                        token: token,
                        user: {
                            id: usuario.id_usuario,
                            nombre: usuario.nombre,
                            email: usuario.email
                        }
                    });
                } else {
                    return res.status(401).json({ message: "Credenciales inválidas" });
                }
            } catch (compareError) {
                console.error("Error en bcrypt:", compareError);
                return res.status(500).json({ message: "Error al validar acceso" });
            }

        } else {
            // No se encontró el email
            return res.status(401).json({ message: "Credenciales inválidas" });
        }
    });
};