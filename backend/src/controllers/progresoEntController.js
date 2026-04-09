const jwt = require('jsonwebtoken');
const db = require('../models/db');

module.exports.guardarProgresoMasivo = (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ valid: false, message: "Acceso denegado. Token no proporcionado." });

    jwt.verify(token, process.env.JWT_SECRET, (error, decodificado) => {
        if (error) return res.status(401).json({ valid: false, message: "Token inválido o expirado." });

        const { logs } = req.body;
        if (!logs || !Array.isArray(logs) || logs.length === 0) {
            return res.status(400).json({ valid: false, message: "No hay logs válidos para guardar." });
        }

        // 🔴 INICIAMOS LA TRANSACCIÓN AL ESTILO CLÁSICO (Callback)
        db.beginTransaction(async (err) => {
            if (err) {
                console.error("Error al iniciar transacción:", err);
                return res.status(500).json({ valid: false, message: "Error en el servidor." });
            }

            try {
                const query = `
                    INSERT INTO progreso_entrenamientos 
                    (id_checkin, id_rutina_ejercicio, serie_numero, repeticiones, peso_kg) 
                    VALUES (?, ?, ?, ?, ?)
                `;

                // 🔴 TRUCO: Convertimos tu db.query clásico en una Promesa 
                // solo para esta función, así podemos usar 'await' en el bucle
                const ejecutarQuery = (sql, params) => {
                    return new Promise((resolve, reject) => {
                        db.query(sql, params, (error, results) => {
                            if (error) reject(error);
                            else resolve(results);
                        });
                    });
                };

                // Insertamos cada serie una por una de forma segura
                for (const log of logs) {
                    await ejecutarQuery(query, [
                        log.id_checkin,
                        log.id_rutina_ejercicio,
                        log.serie_numero,
                        log.repeticiones,
                        log.peso_kg
                    ]);
                }

                // 🔴 SI TODO SALE BIEN, CONFIRMAMOS (Commit)
                db.commit((commitErr) => {
                    if (commitErr) {
                        return db.rollback(() => {
                            console.error("Error al hacer commit:", commitErr);
                            res.status(500).json({ valid: false, message: "Error al confirmar guardado." });
                        });
                    }

                    res.status(200).json({
                        valid: true,
                        message: `Progreso guardado con éxito. Se insertaron ${logs.length} series.`
                    });
                });

            } catch (dbError) {
                // 🔴 SI ALGO FALLA EN EL BUCLE, REVERTIMOS TODO (Rollback)
                db.rollback(() => {
                    console.error("Error al guardar progreso en DB:", dbError);
                    res.status(500).json({ valid: false, message: "Error interno al guardar el entrenamiento." });
                });
            }
        });
    });
};