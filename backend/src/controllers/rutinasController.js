const jwt = require('jsonwebtoken');
const db = require('../models/db');
const pdfParse = require('pdf-extraction');
const mammoth = require('mammoth');
const { GoogleGenerativeAI, SchemaType } = require("@google/generative-ai");
const fs = require('fs');
const path = require('path');
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

    if (!token) return res.status(401).json({ valid: false, message: "No hay sesión activa" });

    jwt.verify(token, process.env.JWT_SECRET, (error, decodificado) => {
        if (error) return res.status(401).json({ valid: false, message: "Sesión caducada o inválida" });

        const emailUsuario = decodificado.email;
        // 🔴 Extraemos grupo_rutina del body que nos manda React
        const { nombre, ejercicios, grupo_rutina } = req.body;

        if (!nombre || !ejercicios || ejercicios.length === 0) {
            return res.status(400).json({ valid: false, message: "Faltan datos de la rutina" });
        }

        db.query('CALL ObtenerIdUsuarioPorEmail(?)', [emailUsuario], (err, resultados) => {
            if (err || !resultados[0] || resultados[0].length === 0) {
                return res.status(500).json({ valid: false, message: "Error verificando usuario" });
            }

            const idUsuario = resultados[0][0].id_usuario;

            // 🔴 Iniciamos transacción (adiós Stored Procedure, hola código limpio)
            db.beginTransaction((err) => {
                if (err) return res.status(500).json({ valid: false });

                // 1. Insertamos la rutina incluyendo la carpeta
                const queryInsertRutina = 'INSERT INTO rutinas (usuario_id, nombre, grupo_rutina) VALUES (?, ?, ?)';
                db.query(queryInsertRutina, [idUsuario, nombre, grupo_rutina || null], (err, resultInsert) => {
                    if (err) return db.rollback(() => res.status(500).json({ valid: false }));

                    // Sacamos el ID de la rutina que acabamos de crear
                    const id_rutina = resultInsert.insertId;

                    // 2. Preparamos los ejercicios
                    const valores = ejercicios.map((ej, index) => [
                        id_rutina, ej.exerciseId, ej.name, ej.gifUrl || '', ej.series,
                        ej.tipoObjetivo, ej.valorObjetivo, ej.descanso, index + 1
                    ]);

                    const queryInsertEjercicios = 'INSERT INTO rutina_ejercicios (rutina_id, exercise_id, nombre_ejercicio, gif_url, series, tipo_objetivo, valor_objetivo, descanso_segundos, orden) VALUES ?';

                    // 3. Insertamos los ejercicios
                    db.query(queryInsertEjercicios, [valores], (err) => {
                        if (err) return db.rollback(() => res.status(500).json({ valid: false }));

                        // 4. Todo salió perfecto, guardamos definitivamente
                        db.commit((err) => {
                            if (err) return db.rollback(() => res.status(500).json({ valid: false }));
                            res.status(201).json({ valid: true, message: "¡Rutina creada exitosamente!" });
                        });
                    });
                });
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
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

module.exports.importarRutinaIA = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ valid: false, message: "No se subió ningún archivo" });

        const archivo = req.file;
        let textoExtraido = "";

        // 1. EXTRACCIÓN DE TEXTO (PDF, DOCX, TXT)
        if (archivo.mimetype === 'application/pdf') {
            const pdfData = await pdfParse(archivo.buffer);
            textoExtraido = pdfData.text;
        } else if (archivo.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
            const docxData = await mammoth.extractRawText({ buffer: archivo.buffer });
            textoExtraido = docxData.value;
        } else if (archivo.mimetype === 'text/plain') {
            textoExtraido = archivo.buffer.toString('utf-8');
        } else {
            return res.status(400).json({ valid: false, message: "Formato no soportado." });
        }

        if (!textoExtraido.trim()) {
            return res.status(400).json({ valid: false, message: "No se pudo extraer texto del documento." });
        }

        // 2. LEER TU ARCHIVO JSON DE EJERCICIOS
        // Ajusta la ruta '..' según dónde esté tu carpeta de datos
        const rutaJson = path.join(__dirname, '../data/exercises.json');
        const rawData = fs.readFileSync(rutaJson);
        const ejerciciosCompletos = JSON.parse(rawData);

        // 🔴 OPTIMIZACIÓN DE TOKENS: 
        // Solo le pasamos a Gemini el ID y el Nombre. 
        // No le mandamos GIFs ni descripciones para que la petición sea barata y rápida.
        const catalogoReducido = ejerciciosCompletos.map(ej => ({
            exerciseId: ej.exerciseId,
            name: ej.name
        }));


        // 3. CONFIGURAR GEMINI (Ahora espera MÚLTIPLES rutinas)
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash-lite",
            generationConfig: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: SchemaType.OBJECT,
                    properties: {
                        rutinasDetectadas: {
                            type: SchemaType.ARRAY,
                            description: "Lista de rutinas separadas por día o grupo muscular.",
                            items: {
                                type: SchemaType.OBJECT,
                                properties: {
                                    nombre: { type: SchemaType.STRING, description: "Ej. Día 1 - Pecho, o Lunes" },
                                    ejercicios: {
                                        type: SchemaType.ARRAY,
                                        items: {
                                            type: SchemaType.OBJECT,
                                            properties: {
                                                exerciseId: { type: SchemaType.STRING },
                                                name: { type: SchemaType.STRING },
                                                series: { type: SchemaType.NUMBER },
                                                tipoObjetivo: { type: SchemaType.STRING },
                                                valorObjetivo: { type: SchemaType.STRING },
                                                descanso: { type: SchemaType.NUMBER }
                                            },
                                            required: ["exerciseId", "name", "series", "tipoObjetivo", "valorObjetivo", "descanso"]
                                        }
                                    }
                                },
                                required: ["nombre", "ejercicios"]
                            }
                        }
                    },
                    required: ["rutinasDetectadas"]
                }
            }
        });

        const prompt = `
        Actúa como un experto en fitness. Analiza este documento:
        """${textoExtraido}"""

        Tu misión es extraer TODAS las rutinas presentes (separadas por días o músculos) y mapear los ejercicios a mi catálogo.
        CATÁLOGO DE EJERCICIOS PERMITIDOS:
        ${JSON.stringify(catalogoReducido)}

        INSTRUCCIONES CRÍTICAS:
        1. El documento puede tener varias rutinas (Lunes, Martes, etc.). Crea un objeto para CADA una.
        2. USA SINÓNIMOS INTELIGENTES: Si el texto dice "Cristos", busca "Aperturas". Si dice "Pull ups", busca "Dominadas". Si dice "Militar", busca "Press de hombros".
        3. Si un ejercicio no tiene equivalente en el catálogo, IGNÓRALO.
        4. Si el documento es basura (ej. lista de compras o recibos) y no hay rutinas de ejercicio, devuelve "rutinasDetectadas" como un arreglo vacío [].
        `;

        // 4. EJECUTAR IA
        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        const iaData = JSON.parse(responseText);

        // Si la IA no encontró nada, cortamos aquí.
        if (!iaData.rutinasDetectadas || iaData.rutinasDetectadas.length === 0) {
            return res.json({ valid: true, cantidad: 0, rutinasIA: [] });
        }

        // Creamos la carpeta con la fecha
        const fechaActual = new Date();
        const dia = String(fechaActual.getDate()).padStart(2, '0');
        const mes = String(fechaActual.getMonth() + 1).padStart(2, '0');
        const anio = fechaActual.getFullYear();
        const hora = String(fechaActual.getHours()).padStart(2, '0');
        const minuto = String(fechaActual.getMinutes()).padStart(2, '0');
        const segundo = String(fechaActual.getSeconds()).padStart(2, '0');
        const nombreCarpetaFechada = `Importación (${dia}-${mes}-${anio} ${hora}:${minuto}:${segundo})`;

        // Procesamos todas las rutinas detectadas
        const rutinasFinales = iaData.rutinasDetectadas.map(rutina => {
            // Buscamos los GIFs para cada ejercicio
            const ejerciciosCompletados = rutina.ejercicios.map(ejIA => {
                const original = ejerciciosCompletos.find(o => o.exerciseId === ejIA.exerciseId);
                return { ...ejIA, gifUrl: original ? original.gifUrl : "" };
            });

            return {
                nombre: rutina.nombre,
                grupo_rutina: nombreCarpetaFechada,
                ejercicios: ejerciciosCompletados
            };
        });

        return res.json({
            valid: true,
            cantidad: rutinasFinales.length,
            carpeta: nombreCarpetaFechada,
            rutinasIA: rutinasFinales
        });

    } catch (error) {
        console.error("Error en importación IA:", error);
        res.status(500).json({ valid: false, message: "Error al procesar el archivo." });
    }
};