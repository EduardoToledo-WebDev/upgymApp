const jwt = require('jsonwebtoken');
const db = require('../models/db');

exports.canjearPremio = (req, res) => {
    // 1. Extraemos el token del header
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ valid: false, message: "Token no proporcionado." });

    // 2. Verificamos el token
    jwt.verify(token, process.env.JWT_SECRET, async (error, decodificado) => {
        if (error) return res.status(401).json({ valid: false, message: "Token inválido o expirado." });

        const { id_premio } = req.body;
        const emailUsuario = decodificado.email;

        if (!id_premio) return res.status(400).json({ valid: false, message: "ID del premio es requerido." });

        try {
            // 3. Obtenemos el ID del usuario usando tu procedimiento existente
            const [userResults] = await db.promise().query('CALL ObtenerIdUsuarioPorEmail(?)', [emailUsuario]);

            if (!userResults[0] || userResults[0].length === 0) {
                return res.status(404).json({ valid: false, message: "Usuario no encontrado." });
            }
            const idUsuario = userResults[0][0].id_usuario;

            // 4. Generamos el código alfanumérico aleatorio (Ej: UPG-8F2A9)
            const codigoCanje = 'UPG-' + Math.random().toString(36).substring(2, 7).toUpperCase();

            // 5. LLAMAMOS AL PROCEDIMIENTO (Él se encarga del saldo, el trigger del stock)
            await db.promise().query('CALL RealizarReclamo(?, ?, ?)', [idUsuario, id_premio, codigoCanje]);

            // 6. Si pasamos la línea anterior, fue un éxito rotundo
            res.status(200).json({
                valid: true,
                codigo_canje: codigoCanje,
                estado: 'Pendiente',
                message: "Premio canjeado con éxito"
            });

        } catch (dbError) {
            // 🔴 AQUÍ ATRAPAMOS EL TRIGGER O EL PROCEDURE
            // Si el SQLState es '45000', es porque no alcanzó el saldo o no hay stock
            if (dbError.sqlState === '45000') {
                return res.status(400).json({ valid: false, message: dbError.sqlMessage });
            }

            // Si es otro error (se cayó la base de datos, etc.)
            console.error("Error al canjear premio:", dbError);
            res.status(500).json({ valid: false, message: "Error interno del servidor." });
        }
    });
};
exports.obtenerMisRecompensas = (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    jwt.verify(token, process.env.JWT_SECRET, async (error, decodificado) => {
        if (error) return res.status(401).json({ valid: false });

        try {
            // Buscamos los reclamos uniendo con la tabla premios para tener el nombre
            const [rows] = await db.promise().query(
                `SELECT r.id_reclamo, p.nombre, r.codigo_canje, r.estado, r.fecha_reclamo 
                 FROM reclamos_premios r
                 JOIN premios p ON r.id_premio = p.id_premio
                 JOIN usuarios u ON r.id_usuario = u.id_usuario
                 WHERE u.email = ?
                 ORDER BY r.fecha_reclamo DESC`,
                [decodificado.email]
            );

            res.status(200).json({ valid: true, reclamos: rows });
        } catch (err) {
            res.status(500).json({ valid: false });
        }
    });
};