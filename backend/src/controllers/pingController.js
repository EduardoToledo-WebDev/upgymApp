const db = require('../models/db');


module.exports.ping = (req, res) => {
    const consulta = "SELECT * FROM usuarios";
    try {
        db.query(consulta, (error, resultados) => {
            console.log(resultados);
            res.json(resultados);
        });
    } catch (e) {
        res.json({ error: e });
    }
};