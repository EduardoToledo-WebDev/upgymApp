import { createContext, useState } from "react";

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
    const [validacionUbicacion, setValidacionUbicacion] = useState(false);
    const [qrData, setQrData] = useState("");
    const [gimnasio, setGimnasio] = useState();
    const [segundos, setSegundos] = useState(0);
    const [mostrarAlerta, setMostrarAlerta] = useState(false);
    const [checkinValido, setCheckinValido] = useState(false);
    const [clasificacionData, setClasificacionData] = useState([]);
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
            setClasificacionData
        }}>
            {children}
        </AppContext.Provider>
    );
}