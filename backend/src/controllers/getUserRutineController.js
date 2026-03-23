const jwt = require('jsonwebtoken');
const db = require('../models/db');
require('dotenv').config();

module.exports.obtenerRutinas = (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token || token === 'undefined' || token === 'null') {
        return res.status(401).json({ valid: false, message: "No hay sesión activa" });
    }

    jwt.verify(token, process.env.JWT_SECRET, (error, decodificado) => {
        if (error) {
            return res.status(401).json({ valid: false, message: "Sesión caducada o inválida" });
        }

        const emailUsuario = decodificado.email;

        db.query('SELECT id_usuario FROM usuarios WHERE email = ?', [emailUsuario], (err, resultados) => {
            if (err || resultados.length === 0) {
                return res.status(500).json({ valid: false, message: "Error verificando usuario" });
            }

            const idUsuario = resultados[0].id_usuario;

            // Llamamos al nuevo Stored Procedure
            db.query('CALL ObtenerRutinasCompletas(?)', [idUsuario], (err, resultadosDB) => {
                if (err) {
                    console.error("Error cargando rutinas:", err);
                    return res.status(500).json({ valid: false, message: "Error al cargar las rutinas" });
                }

                const filasPlanas = resultadosDB[0];

                // 🔴 MAGIA DE NODE: Convertimos la tabla plana en un JSON anidado
                const rutinasAgrupadas = filasPlanas.reduce((acumulador, fila) => {
                    // Buscamos si ya empezamos a armar esta rutina
                    let rutinaExistente = acumulador.find(r => r.rutina_id === fila.rutina_id);

                    // Si no existe, la creamos con su arreglo de ejercicios vacío
                    if (!rutinaExistente) {
                        rutinaExistente = {
                            rutina_id: fila.rutina_id,
                            nombre: fila.rutina_nombre,
                            fecha_creacion: fila.fecha_creacion,
                            ejercicios: [] // Aquí meteremos los ejercicios
                        };
                        acumulador.push(rutinaExistente);
                    }

                    // Si la fila trae datos de un ejercicio, lo empujamos al arreglo
                    if (fila.exercise_id) {
                        rutinaExistente.ejercicios.push({
                            detalleId: fila.detalle_id,
                            exerciseId: fila.exercise_id,
                            name: fila.nombre_ejercicio,
                            gifUrl: fila.gif_url,
                            series: fila.series,
                            tipoObjetivo: fila.tipo_objetivo,
                            valorObjetivo: fila.valor_objetivo,
                            descanso: fila.descanso_segundos,
                            orden: fila.orden
                        });
                    }

                    return acumulador;
                }, []); // [] es el valor inicial del acumulador

                return res.status(200).json({
                    valid: true,
                    rutinas: rutinasAgrupadas
                });
            });
        });
    });
};