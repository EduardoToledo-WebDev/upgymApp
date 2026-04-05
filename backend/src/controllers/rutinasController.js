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

        // 1. Primer "CALL": Accedemos a resultados[0][0]
        db.query('CALL ObtenerIdUsuarioPorEmail(?)', [emailUsuario], (err, resultados) => {
            // Verificamos que no haya error y que el arreglo interno tenga datos
            if (err || !resultados[0] || resultados[0].length === 0) {
                console.error("Error o usuario no encontrado:", err);
                return res.status(500).json({ valid: false, message: "Error verificando usuario" });
            }

            // CORRECCIÓN AQUÍ: resultados[0] es la lista de filas, resultados[0][0] es el usuario
            const idUsuario = resultados[0][0].id_usuario;

            // 2. Segundo "CALL": Obtener todas las filas de rutinas + ejercicios
            db.query('CALL ObtenerRutinasCompletas(?)', [idUsuario], (err, resultadosDB) => {
                if (err) {
                    console.error("Error cargando rutinas:", err);
                    return res.status(500).json({ valid: false, message: "Error al cargar las rutinas" });
                }

                // Aquí ya lo tenías bien: resultadosDB[0] contiene las filas planas
                const filasPlanas = resultadosDB[0];

                if (!filasPlanas || filasPlanas.length === 0) {
                    return res.status(200).json({
                        valid: true,
                        rutinas: [],
                        message: "Aún no tienes rutinas creadas"
                    });
                }

                // 3. Agrupamiento (Tu lógica de reduce está excelente)
                const rutinasAgrupadas = filasPlanas.reduce((acumulador, fila) => {
                    let rutinaExistente = acumulador.find(r => r.rutina_id === fila.rutina_id);

                    if (!rutinaExistente) {
                        rutinaExistente = {
                            rutina_id: fila.rutina_id,
                            nombre: fila.rutina_nombre,
                            grupo_rutina: fila.grupo_rutina,
                            fecha_creacion: fila.fecha_creacion,
                            ejercicios: []
                        };
                        acumulador.push(rutinaExistente);
                    }

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
                }, []);

                return res.status(200).json({
                    valid: true,
                    rutinas: rutinasAgrupadas
                });
            });
        });
    });
};

// 1. CREAR RUTINA
module.exports.crearRutina = (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token || token === 'undefined' || token === 'null') {
        return res.status(401).json({ valid: false, message: "No hay sesión activa" });
    }

    jwt.verify(token, process.env.JWT_SECRET, (error, decodificado) => {
        if (error) return res.status(401).json({ valid: false, message: "Sesión caducada o inválida" });

        const emailUsuario = decodificado.email;
        const { nombre, ejercicios } = req.body;

        if (!nombre || !ejercicios || ejercicios.length === 0) {
            return res.status(400).json({ valid: false, message: "Faltan datos de la rutina" });
        }

        db.query('CALL ObtenerIdUsuarioPorEmail(?)', [emailUsuario], (err, resultados) => {
            if (err || !resultados[0] || resultados[0].length === 0) {
                return res.status(500).json({ valid: false, message: "Error verificando usuario" });
            }

            const idUsuario = resultados[0][0].id_usuario;
            const ejerciciosJSON = JSON.stringify(ejercicios);

            db.query('CALL CrearRutina(?, ?, ?)', [idUsuario, nombre, ejerciciosJSON], (err) => {
                if (err) return res.status(500).json({ valid: false, message: "Error al guardar la rutina" });

                return res.status(201).json({ valid: true, message: "¡Rutina creada exitosamente!" });
            });
        });
    });
};

// 2. ELIMINAR RUTINA
module.exports.eliminarRutina = (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    // 🔴 Ahora sí, extraemos el ID correctamente de la URL
    const id_rutina = req.params.id;

    if (!token) return res.status(401).json({ valid: false });

    jwt.verify(token, process.env.JWT_SECRET, (error, decodificado) => {
        if (error) return res.status(401).json({ valid: false });

        const emailUsuario = decodificado.email;

        db.query('CALL ObtenerIdUsuarioPorEmail(?)', [emailUsuario], (err, resultados) => {
            if (err || !resultados[0] || resultados[0].length === 0) return res.status(500).json({ valid: false });

            const idUsuario = resultados[0][0].id_usuario;

            // Al ejecutar esto, MySQL hará el CASCADE y borrará ejercicios y progresos automáticamente
            db.query('DELETE FROM rutinas WHERE id = ? AND usuario_id = ?', [id_rutina, idUsuario], (err, result) => {
                if (err) {
                    console.error("Error al eliminar en DB:", err);
                    return res.status(500).json({ valid: false, message: "Error al eliminar" });
                }

                // Si affectedRows es 0, intentó borrar algo que no existe o no es suyo
                if (result.affectedRows === 0) {
                    return res.status(404).json({ valid: false, message: "Rutina no encontrada o sin permisos" });
                }

                res.status(200).json({ valid: true, message: "Rutina y detalles eliminados con éxito" });
            });
        });
    });
};

// 3. EDITAR RUTINA (Blindado)
module.exports.editarRutina = (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ valid: false });

    jwt.verify(token, process.env.JWT_SECRET, (error, decodificado) => {
        if (error) return res.status(401).json({ valid: false });

        const emailUsuario = decodificado.email;
        const id_rutina = req.params.id;
        const { nombre, ejercicios } = req.body;

        db.query('CALL ObtenerIdUsuarioPorEmail(?)', [emailUsuario], (err, resultados) => {
            if (err || !resultados[0] || resultados[0].length === 0) return res.status(500).json({ valid: false });

            const idUsuario = resultados[0][0].id_usuario;

            db.beginTransaction((err) => {
                if (err) return res.status(500).json({ valid: false });

                // 1. Actualizamos el nombre de la rutina, ASEGURANDO que sea del usuario dueño
                db.query('UPDATE rutinas SET nombre = ? WHERE id = ? AND usuario_id = ?', [nombre, id_rutina, idUsuario], (err, resultUpdate) => {
                    if (err) return db.rollback(() => res.status(500).json({ valid: false }));

                    // Si no afectó ninguna fila, es porque intentó editar una rutina que no es suya
                    if (resultUpdate.affectedRows === 0) {
                        return db.rollback(() => res.status(403).json({ valid: false, message: "Sin permisos para editar esta rutina" }));
                    }

                    // 2. Borramos los ejercicios viejos
                    db.query('DELETE FROM rutina_ejercicios WHERE rutina_id = ?', [id_rutina], (err) => {
                        if (err) return db.rollback(() => res.status(500).json({ valid: false }));

                        // 3. Insertamos los ejercicios actualizados
                        const valores = ejercicios.map((ej, index) => [
                            id_rutina, ej.exerciseId, ej.name, ej.gifUrl || '', ej.series,
                            ej.tipoObjetivo, ej.valorObjetivo, ej.descanso, index + 1
                        ]);

                        const queryInsert = 'INSERT INTO rutina_ejercicios (rutina_id, exercise_id, nombre_ejercicio, gif_url, series, tipo_objetivo, valor_objetivo, descanso_segundos, orden) VALUES ?';

                        db.query(queryInsert, [valores], (err) => {
                            if (err) return db.rollback(() => res.status(500).json({ valid: false }));

                            db.commit((err) => {
                                if (err) return db.rollback(() => res.status(500).json({ valid: false }));
                                res.status(200).json({ valid: true, message: "Rutina actualizada exitosamente" });
                            });
                        });
                    });
                });
            });
        });
    });
};
module.exports.asignarCarpeta = (req, res) => {
    // 1. Verificamos el Token (Igual que en tus otras funciones)
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ valid: false, message: "No hay sesión activa" });

    jwt.verify(token, process.env.JWT_SECRET, (error, decodificado) => {
        if (error) return res.status(401).json({ valid: false, message: "Sesión caducada" });

        const emailUsuario = decodificado.email;
        const { nombreCarpeta, nombreCarpetaAnterior, rutinasIds } = req.body;

        // 2. Obtenemos el ID del usuario
        db.query('CALL ObtenerIdUsuarioPorEmail(?)', [emailUsuario], (err, resultados) => {
            if (err || !resultados[0] || resultados[0].length === 0) {
                return res.status(500).json({ valid: false, message: "Error verificando usuario" });
            }

            const idUsuario = resultados[0][0].id_usuario;

            // 3. Función auxiliar para asignar las nuevas carpetas
            const asignarNuevas = () => {
                if (rutinasIds && rutinasIds.length > 0) {
                    const idsString = rutinasIds.join(',');
                    // OJO: Usamos 'id' y 'usuario_id' como en tu función editarRutina
                    const queryUpdate = `UPDATE rutinas SET grupo_rutina = ? WHERE id IN (${idsString}) AND usuario_id = ?`;

                    db.query(queryUpdate, [nombreCarpeta, idUsuario], (err) => {
                        if (err) return res.status(500).json({ valid: false, message: "Error asignando la carpeta" });
                        return res.json({ valid: true, message: "Carpetas actualizadas" });
                    });
                } else {
                    return res.json({ valid: true, message: "Carpetas limpiadas" });
                }
            };

            // 4. Lógica Principal: Si había una carpeta anterior, la borramos primero
            if (nombreCarpetaAnterior) {
                db.query(
                    "UPDATE rutinas SET grupo_rutina = NULL WHERE grupo_rutina = ? AND usuario_id = ?",
                    [nombreCarpetaAnterior, idUsuario],
                    (err) => {
                        if (err) return res.status(500).json({ valid: false, message: "Error limpiando carpeta anterior" });
                        asignarNuevas(); // Pasamos al siguiente paso
                    }
                );
            } else {
                // Si es una carpeta 100% nueva, pasamos directo a asignar
                asignarNuevas();
            }
        });
    });
};