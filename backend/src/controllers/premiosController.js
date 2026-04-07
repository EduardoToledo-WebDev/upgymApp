const jwt = require('jsonwebtoken');
const db = require('../models/db');
require('dotenv').config();

module.exports.obtenerCatalogoPremios = (req, res) => {
    // 1. Verificación del Token (El cadenero)
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token || token === 'undefined' || token === 'null') {
        return res.status(401).json({ valid: false, message: "No hay sesión activa" });
    }

    jwt.verify(token, process.env.JWT_SECRET, (error, decodificado) => {
        if (error) {
            return res.status(401).json({ valid: false, message: "Sesión caducada o inválida" });
        }

        // 2. La consulta SQL Directa y Segura (Sin Stored Procedures)
        // Filtramos: Solo premios activos y que no hayan caducado (o que no tengan fecha límite)
        const query = `
            SELECT 
                id_premio, 
                nombre, 
                descripcion_corta, 
                descripcion, 
                categoria, 
                costo, 
                stock, 
                img_path 
            FROM premios 
            WHERE activo = 1 
            AND (fecha_vencimiento IS NULL OR fecha_vencimiento >= CURDATE())
        `;

        db.query(query, (err, resultados) => {
            if (err) {
                console.error("Error obteniendo el catálogo de premios:", err);
                return res.status(500).json({ valid: false, message: "Error al cargar los premios" });
            }


            return res.status(200).json({
                valid: true,
                premios: resultados
            });
        });
    });
};