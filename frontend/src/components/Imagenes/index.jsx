import React from "react";

//funcion para obtener imagenes random de usuarios
function imagenes(cantidad) {
    const imagenesRandom = [];
    for (let i = 1; i <= cantidad; i++) {
        imagenesRandom.push(`https://i.pravatar.cc/150?u=${i}`);
    }
    return imagenesRandom;
}

export { imagenes };