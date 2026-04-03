import { NuevaRutinaSets } from "./nuevaRutina/NuevaRutinaSets";

export const EditarRutina = ({ editView, setEditView, rutinaOriginal, actualizarLista }) => {
    if (!editView || !rutinaOriginal) return null;

    return (
        <NuevaRutinaSets
            paso={2} // Lo mandamos directo a la configuración de series
            nombreRutina={rutinaOriginal.nombre}
            ejercicios={rutinaOriginal.ejercicios} // Como ya vienen armados de la BD, entran directo
            volverAtras={() => setEditView(false)}
            cerrarVentana={() => {
                setEditView(false);
                if (actualizarLista) actualizarLista(); // Para que recargue la lista de atrás
            }}
            esEdicion={true} // 🔴 El switch que cambia todo
            idRutina={rutinaOriginal.rutina_id}
        />
    );
};