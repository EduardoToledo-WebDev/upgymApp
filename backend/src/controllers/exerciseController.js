const path = require('path');
const fs = require('fs');

// Función auxiliar para leer los JSON
const leerJsonLocal = (nombreArchivo, res) => {
    try {
        // Apunta a la carpeta 'data' que creamos en el paso 1
        const ruta = path.join(__dirname, `../data/${nombreArchivo}`);
        const data = fs.readFileSync(ruta, 'utf8');
        return res.status(200).json(JSON.parse(data));
    } catch (error) {
        console.error(`Error leyendo ${nombreArchivo}:`, error);
        return res.status(500).json({ valid: false, message: "Error cargando catálogo local" });
    }
};

module.exports.getEjercicios = (req, res) => leerJsonLocal('exercises.json', res);
module.exports.getBodyParts = (req, res) => leerJsonLocal('bodyParts.json', res);
module.exports.getEquipments = (req, res) => leerJsonLocal('equipments.json', res);
module.exports.getMuscles = (req, res) => leerJsonLocal('muscles.json', res);