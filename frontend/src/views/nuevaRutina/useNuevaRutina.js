import { useState, useEffect, useMemo, useCallback } from "react";
const API_URL = import.meta.env.VITE_API_URL;

export const useNuevaRutina = (rutinaEditar = null) => {
    const [ejercicioAgregado, setEjercicioAgregado] = useState([]);
    const [busqueda, setBusqueda] = useState("");
    const [nombreRutina, setNombreRutina] = useState("");

    const [catalogoCompleto, setCatalogoCompleto] = useState([]);
    const [cargandoInicial, setCargandoInicial] = useState(true);
    // 🔴 1. Nuevo estado para evitar que el scroll se vuelva loco
    const [cargandoMas, setCargandoMas] = useState(false);

    const [offset, setOffset] = useState(25);
    const LIMIT = 25;

    useEffect(() => {
        if (rutinaEditar) {
            setNombreRutina(rutinaEditar.nombre);
            setEjercicioAgregado(rutinaEditar.ejercicios);
        } else {
            setNombreRutina("");
            setEjercicioAgregado([]);
        }

        setOffset(LIMIT);
    }, [rutinaEditar]);

    useEffect(() => {
        const fetchCatalogo = async () => {
            try {
                const response = await fetch(`http://${API_URL}/exercises`);
                if (!response.ok) throw new Error("Error en red");
                const data = await response.json();
                setCatalogoCompleto(data);
            } catch (error) {
                console.error("Error al cargar el catálogo:", error);
            } finally {
                setCargandoInicial(false);
            }
        };
        fetchCatalogo();
    }, []);

    useEffect(() => {
        setOffset(LIMIT);
    }, [busqueda]);

    const { ejerciciosAMostrar, hasMore } = useMemo(() => {
        let filtrados = catalogoCompleto;

        if (busqueda.trim() !== "") {
            const termino = busqueda.toLowerCase().trim();
            filtrados = catalogoCompleto.filter(ej =>
                (ej.name || "").toLowerCase().includes(termino)
            );
        }

        filtrados = filtrados.filter(
            ejercicio => !ejercicioAgregado.some(agregado => agregado.exerciseId === ejercicio.exerciseId)
        );

        const mostrados = filtrados.slice(0, offset);

        return {
            ejerciciosAMostrar: mostrados,
            hasMore: mostrados.length < filtrados.length
        };
    }, [catalogoCompleto, busqueda, ejercicioAgregado, offset]);

    const handleScroll = (e) => {
        const { scrollTop, clientHeight, scrollHeight } = e.currentTarget;

        // 🔴 2. Calculamos cuántos píxeles faltan para llegar al fondo exacto
        const pixelesFaltantes = scrollHeight - scrollTop - clientHeight;

        // 🔴 3. Activamos la carga 100px ANTES de llegar al fondo, y solo si NO está cargando ya
        if (pixelesFaltantes <= 100 && hasMore && !cargandoMas) {
            setCargandoMas(true); // Ponemos el escudo

            // Simulamos 400ms de carga para dar feedback visual y evitar bugs
            setTimeout(() => {
                setOffset(prev => prev + LIMIT);
                setCargandoMas(false); // Quitamos el escudo
            }, 400);
        }
    };

    const isBotonDeshabilitado = nombreRutina.trim() === "" || ejercicioAgregado.length === 0;

    const limpiarTodo = useCallback(() => {
        setNombreRutina("");
        setBusqueda("");
        setEjercicioAgregado([]);
        setOffset(LIMIT);
    }, []);

    const agregarEjercicio = useCallback((ejercicio) => {
        setEjercicioAgregado(prev => [...prev, ejercicio]);
    }, []);

    const removerEjercicio = useCallback((ejercicio) => {
        setEjercicioAgregado(prev => prev.filter(e => e.exerciseId !== ejercicio.exerciseId));
    }, []);

    return {
        ejercicioAgregado,
        busqueda, setBusqueda,
        nombreRutina, setNombreRutina,
        ejerciciosAMostrar,
        // 🔴 4. Devolvemos "true" si es la carga inicial O si estamos haciendo scroll
        cargando: cargandoInicial || cargandoMas,
        agregarEjercicio,
        removerEjercicio,
        handleScroll,
        isBotonDeshabilitado,
        hasMore,
        limpiarTodo
    };
};