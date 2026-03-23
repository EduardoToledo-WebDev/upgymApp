import { useState, useEffect, useMemo, useCallback } from "react";
import { traductor } from "./traducciones";

export const useNuevaRutina = () => {
    const [ejercicioAgregado, setEjercicioAgregado] = useState([]);
    const [busqueda, setBusqueda] = useState("");
    const [nombreRutina, setNombreRutina] = useState("");

    const [ejerciciosAPI, setEjerciciosAPI] = useState([]);
    const [cargando, setCargando] = useState(false);
    const [offset, setOffset] = useState(0);

    // 🔴 NUEVA VARIABLE DE SEGURIDAD
    const [hasMore, setHasMore] = useState(true);
    const LIMIT = 25;

    // Resetear búsqueda y seguridad al escribir algo nuevo
    useEffect(() => {
        setOffset(0);
        setEjerciciosAPI([]);
        setHasMore(true); // Volvemos a encender el scroll infinito para la nueva búsqueda
    }, [busqueda]);

    // Fetch a la API
    useEffect(() => {
        const fetchEjercicios = async () => {
            // Si ya no hay más resultados, ni siquiera intentamos hacer la petición
            if (!hasMore) return;

            setCargando(true);
            try {
                let url = `https://www.exercisedb.dev/api/v1/exercises?limit=${LIMIT}&offset=${offset}`;

                if (busqueda.trim() !== '') {
                    const terminoEnIngles = traductor[busqueda.toLowerCase().trim()] || busqueda;
                    url += `&search=${encodeURIComponent(terminoEnIngles)}`;
                }

                const response = await fetch(url);

                // Si la API nos bloqueó (429), lanzamos un error claro
                if (response.status === 429) {
                    throw new Error("Demasiadas peticiones. La API nos bloqueó temporalmente.");
                }
                if (!response.ok) throw new Error("Error en la red");

                const json = await response.json();

                if (json.success && Array.isArray(json.data)) {
                    const listaReal = json.data;

                    // 🔴 EL BLINDAJE: Si nos trajo menos de 25, ya no hay más páginas
                    if (listaReal.length < LIMIT) {
                        setHasMore(false);
                    }

                    if (offset === 0) {
                        setEjerciciosAPI(listaReal);
                    } else {
                        setEjerciciosAPI(prev => [...prev, ...listaReal]);
                    }
                } else {
                    // Si la respuesta fue rara o vacía, apagamos el scroll
                    setHasMore(false);
                    if (offset === 0) setEjerciciosAPI([]);
                }
            } catch (error) {
                console.error("Error obteniendo ejercicios:", error.message);
                // Apagamos el scroll si hay error para no seguir bombardeando
                setHasMore(false);
            } finally {
                setCargando(false);
            }
        };

        const timeoutId = setTimeout(() => {
            fetchEjercicios();
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [busqueda, offset, hasMore]); // Agregamos hasMore a las dependencias

    // Memorizar y filtrar lista
    const ejerciciosAMostrar = useMemo(() => {
        return (Array.isArray(ejerciciosAPI) ? ejerciciosAPI : []).filter(
            (ejercicio) => !ejercicioAgregado.some((agregado) => agregado.exerciseId === ejercicio.exerciseId)
        );
    }, [ejerciciosAPI, ejercicioAgregado]);

    // Acciones
    const agregarEjercicio = useCallback((ejercicio) => {
        setEjercicioAgregado(prev => [...prev, ejercicio]);
    }, []);

    const removerEjercicio = useCallback((ejercicio) => {
        setEjercicioAgregado(prev => prev.filter(e => e.exerciseId !== ejercicio.exerciseId));
    }, []);

    const handleScroll = (e) => {
        const { scrollTop, clientHeight, scrollHeight } = e.currentTarget;
        // 🔴 AHORA REVISAMOS hasMore ANTES DE CAMBIAR EL OFFSET
        if (scrollHeight - scrollTop <= clientHeight + 20 && !cargando && hasMore) {
            setOffset(prev => prev + LIMIT);
        }
    };

    const isBotonDeshabilitado = nombreRutina.trim() === "" || ejercicioAgregado.length === 0;
    const limpiarTodo = useCallback(() => {
        setNombreRutina("");
        setBusqueda("");
        setEjercicioAgregado([]);
    }, []);

    return {
        ejercicioAgregado,
        busqueda, setBusqueda,
        nombreRutina, setNombreRutina,
        ejerciciosAMostrar,
        cargando,
        agregarEjercicio,
        removerEjercicio,
        handleScroll,
        isBotonDeshabilitado,
        hasMore, // Exportamos por si en el futuro quieres poner un texto de "Fin de los resultados"
        limpiarTodo
    };
};