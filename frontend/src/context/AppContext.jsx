import { createContext, useState } from "react";
import { Preferences } from "@capacitor/preferences";

export const AppContext = createContext();

export function AppProvider({ children }) {
    const [puntaje, setPuntaje] = useState(0);
    const [rutinas, setRutinas] = useState([]);
    const [mostrarConfiguracion, setMostrarConfiguracion] = useState(false);
    const [rachaUsuario, setRachaUsuario] = useState(0);
    const [rutinaEmpezada, setRutinaEmpezada] = useState(false);
    const [userData, setUserData] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [mostrarCheckin, setMostrarCheckin] = useState(true);
    const [validacionUbicacion, setValidacionUbicacion] = useState(null);
    const [qrData, setQrData] = useState("");
    const [gimnasio, setGimnasio] = useState();
    const [segundos, setSegundos] = useState(0);
    const [mostrarAlerta, setMostrarAlerta] = useState(false);
    const [checkinValido, setCheckinValido] = useState(false);
    const [clasificacionData, setClasificacionData] = useState([]);
    const [idCheckinActual, setIdCheckinActual] = useState(null);
    const [sesionActiva, setSesionActiva] = useState(false);
    const [entrenamientoState, setEntrenamientoState] = useState(null);

    // Esta función debe envolver tus botones de rutina en la UI
    const puedeEntrenar = () => {
        return sesionActiva && validacionUbicacion;
    };

    const inicializarStepper = async (rutinaCompleta, idCheckin) => {
        const ejerciciosFormateados = rutinaCompleta.ejercicios.map((ej) => {
            // Crea los espacios en blanco para las series
            const logsVacios = Array.from({ length: ej.series }, (_, index) => ({
                serie_numero: index + 1,
                completada: false,
                repeticiones: null,
                peso_kg: null,
                tiempo_segundos: null
            }));

            return {
                id_rutina_ejercicio: ej.detalleId || ej.id, // ID relacional de tu BD
                nombre_ejercicio: ej.name,
                gif_url: ej.gifUrl,
                series_totales: ej.series,
                tipo_objetivo: ej.tipoObjetivo,
                valor_objetivo: ej.valorObjetivo,
                descanso_segundos: ej.descanso || 90,
                logs: logsVacios
            };
        });

        const nuevoEstado = {
            id_checkin: idCheckin,
            id_rutina: rutinaCompleta.rutina_id,
            nombre_rutina: rutinaCompleta.nombre,
            tracker: {
                ejercicioActualIndex: 0,
                serieActualIndex: 0,
                fase: "ejecucion",
                inicio_entrenamiento: Date.now()
            },
            ejercicios: ejerciciosFormateados
        };

        // Actualiza React y el disco duro
        setEntrenamientoState(nuevoEstado);
        await Preferences.set({
            key: 'workout_state',
            value: JSON.stringify(nuevoEstado)
        });
    };
    return (
        <AppContext.Provider value={{
            puntaje,
            setPuntaje,
            rutinas,
            setRutinas,
            userData,
            setUserData,
            mostrarConfiguracion,
            setMostrarConfiguracion,
            rachaUsuario,
            setRachaUsuario,
            rutinaEmpezada,
            setRutinaEmpezada,
            isAuthenticated,
            setIsAuthenticated,
            isLoading,
            setIsLoading,
            mostrarAlerta,
            setMostrarAlerta,
            mostrarCheckin,
            setMostrarCheckin,
            validacionUbicacion,
            setValidacionUbicacion,
            qrData,
            setQrData,
            gimnasio,
            setGimnasio,
            segundos,
            setSegundos,
            checkinValido,
            setCheckinValido,
            clasificacionData,
            setClasificacionData,
            idCheckinActual,
            setIdCheckinActual,
            sesionActiva,
            setSesionActiva,
            puedeEntrenar,
            entrenamientoState,
            setEntrenamientoState,
            inicializarStepper
        }}>
            {children}
        </AppContext.Provider>
    );
}