import { ArrowLeft, Plus, Minus, Loader2 } from "lucide-react";
import { useEffect, useState, useMemo, useCallback, memo } from "react";
import { App } from "@capacitor/app";
import curlBiceps from "../assets/1.png";
import { FaDumbbell } from "react-icons/fa6";

// 1. EL DICCIONARIO BILINGÜE (El secreto para no usar backend)
// EL DICCIONARIO BILINGÜE EXPANDIDO (Para la Demo de UpGym)
const traductor = {
    // ----------------------------------------------------
    // 1. MÚSCULOS Y PARTES DEL CUERPO (Inglés a Español)
    // ----------------------------------------------------
    "abductors": "abductores",
    "abs": "abdomen",
    "adductors": "aductores",
    "biceps": "bíceps",
    "calves": "pantorrillas",
    "cardiovascular system": "sistema cardiovascular",
    "cardio": "cardio",
    "chest": "pecho",
    "delts": "deltoides",
    "forearms": "antebrazos",
    "glutes": "glúteos",
    "hamstrings": "isquiotibiales",
    "lats": "dorsales",
    "levator scapulae": "elevador de la escápula",
    "lower arms": "antebrazos",
    "lower back": "espalda baja",
    "lower legs": "pantorrillas",
    "neck": "cuello",
    "obliques": "oblicuos",
    "pectorals": "pectorales",
    "quads": "cuádriceps",
    "serratus anterior": "serrato anterior",
    "shoulders": "hombros",
    "spine": "columna",
    "traps": "trapecios",
    "triceps": "tríceps",
    "upper arms": "brazos",
    "upper back": "espalda alta",
    "upper legs": "piernas",
    "back": "espalda",
    "waist": "cintura",

    // ----------------------------------------------------
    // 2. EQUIPAMIENTO (Inglés a Español)
    // ----------------------------------------------------
    "assisted": "asistido",
    "band": "banda de resistencia",
    "barbell": "barra",
    "battle rope": "cuerdas de batalla",
    "body weight": "peso corporal",
    "bosu ball": "balón bosu",
    "cable": "polea",
    "dumbbell": "mancuerna",
    "elliptical machine": "elíptica",
    "ez barbell": "barra ez",
    "hammer": "martillo",
    "kettlebell": "pesa rusa",
    "leverage machine": "máquina de palanca",
    "machine": "máquina",
    "medicine ball": "balón medicinal",
    "olympic barbell": "barra olímpica",
    "resistance band": "banda elástica",
    "roller": "rodillo",
    "rope": "cuerda",
    "skierg machine": "máquina skierg",
    "sled machine": "trineo",
    "smith machine": "máquina smith",
    "stability ball": "pelota suiza",
    "stationary bike": "bicicleta estática",
    "stepboard": "step",
    "suspension": "trx (suspensión)",
    "tire": "llanta",
    "trap bar": "barra hexagonal",
    "upper body ergometer": "ergómetro de brazos",
    "weight": "disco de peso",

    // ----------------------------------------------------
    // 3. BÚSQUEDAS DEL USUARIO (Español a Inglés)
    // Para engañar a la API cuando el usuario escriba en español
    // ----------------------------------------------------
    "espalda": "back",
    "pecho": "chest",
    "pierna": "upper leg",
    "piernas": "upper leg",
    "brazo": "upper arm",
    "brazos": "upper arm",
    "hombro": "shoulders",
    "hombros": "shoulders",
    "abdomen": "waist",
    "abdominales": "abs",
    "pantorrilla": "calves",
    "pantorrillas": "calves",
    "gluteo": "glutes",
    "glúteo": "glutes",
    "gluteos": "glutes",
    "glúteos": "glutes",
    "tricep": "triceps",
    "tríceps": "triceps",
    "bicep": "biceps",
    "bíceps": "biceps",
    "mancuerna": "dumbbell",
    "mancuernas": "dumbbell",
    "barra": "barbell",
    "polea": "cable",
    "poleas": "cable",
    "maquina": "machine",
    "máquina": "machine",
    "peso corporal": "body weight",
    "banda": "band"
};

// Función rápida para traducir arreglos
const traducirArray = (arr) => {
    if (!arr) return [];
    return arr.map(item => traductor[item.toLowerCase()] || item);
};

// 2. TARJETA OPTIMIZADA CON TRADUCCIÓN
const EjercicioCard = memo(({ ejercicio, onAction, isAgregado }) => {

    // Rastrea si esta imagen específica falló al cargar
    const [imageError, setImageError] = useState(false);

    // Reiniciamos el error si el ejercicio cambia
    useEffect(() => {
        setImageError(false);
    }, [ejercicio.exerciseId]);

    // Decidimos qué mostrar: si hay URL y NO ha dado error, mostramos <img>
    const mostrarImagen = ejercicio.gifUrl && !imageError;

    return (
        <div className={`flex border rounded-md items-center gap-2 p-2 ${isAgregado ? 'border-blue-200 bg-blue-50' : 'border-gray-300'}`}>

            {/* MANEJO DE IMÁGENES ROTAS */}
            {mostrarImagen ? (
                <img
                    className={`flex w-16 h-16 rounded-md object-cover ${isAgregado ? 'bg-white' : ''}`}
                    src={ejercicio.gifUrl}
                    alt={ejercicio.name}
                    loading="lazy"
                    onError={() => setImageError(true)} // Si falla, activamos el fallback
                />
            ) : (
                <div className={`flex w-16 h-16 rounded-md bg-gray-100 items-center justify-center shrink-0 ${isAgregado ? 'bg-white' : ''}`}>
                    <FaDumbbell size={30} className="text-gray-400" />
                </div>
            )}

            <div className="flex-1 ml-2">
                <p className="font-semibold text-gray-800 text-sm capitalize">{ejercicio.name}</p>

                {/* 🔴 AQUÍ REGRESAN LAS TRADUCCIONES */}
                <p className="text-gray-500 text-xs capitalize">
                    {traducirArray(ejercicio.targetMuscles).join(", ")} • {traducirArray(ejercicio.equipments).join(", ")}
                </p>
            </div>

            <button
                className={`p-2 rounded-md text-white transition-colors shrink-0 ${isAgregado ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                onClick={() => onAction(ejercicio)}
            >
                {isAgregado ? <Minus size={20} /> : <Plus size={20} />}
            </button>
        </div>
    );
});

const NuevaRutina = ({ setRutinaView, rutinaView }) => {
    const [ejercicioAgregado, setEjercicioAgregado] = useState([]);
    const [busqueda, setBusqueda] = useState("");
    const [nombreRutina, setNombreRutina] = useState("");

    const [ejerciciosAPI, setEjerciciosAPI] = useState([]);
    const [cargando, setCargando] = useState(false);
    const [offset, setOffset] = useState(0);
    const LIMIT = 25;

    useEffect(() => {
        let listener;
        const setupBackButton = async () => {
            if (rutinaView) {
                listener = await App.addListener('backButton', () => {
                    setRutinaView(false);
                });
            }
        };
        setupBackButton();
        return () => {
            if (listener) listener.remove();
        };
    }, [rutinaView, setRutinaView]);

    useEffect(() => {
        setOffset(0);
        setEjerciciosAPI([]);
    }, [busqueda]);

    useEffect(() => {
        const fetchEjercicios = async () => {
            setCargando(true);
            try {
                let url = `https://www.exercisedb.dev/api/v1/exercises?limit=${LIMIT}&offset=${offset}`;

                if (busqueda.trim() !== '') {
                    // INTERCEPTAMOS LA BÚSQUEDA: Si el usuario escribe "pecho", enviamos "chest"
                    const terminoEnIngles = traductor[busqueda.toLowerCase().trim()] || busqueda;
                    url += `&search=${encodeURIComponent(terminoEnIngles)}`;
                }

                const response = await fetch(url);
                if (!response.ok) throw new Error("Error en la red");
                const json = await response.json();

                if (json.success && Array.isArray(json.data)) {
                    const listaReal = json.data;
                    if (offset === 0) {
                        setEjerciciosAPI(listaReal);
                    } else {
                        setEjerciciosAPI(prev => [...prev, ...listaReal]);
                    }
                } else {
                    if (offset === 0) setEjerciciosAPI([]);
                }
            } catch (error) {
                console.error("Error obteniendo ejercicios:", error);
            } finally {
                setCargando(false);
            }
        };

        const timeoutId = setTimeout(() => {
            fetchEjercicios();
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [busqueda, offset]);

    const ejerciciosAMostrar = useMemo(() => {
        return (Array.isArray(ejerciciosAPI) ? ejerciciosAPI : []).filter(
            (ejercicio) => !ejercicioAgregado.some((agregado) => agregado.exerciseId === ejercicio.exerciseId)
        );
    }, [ejerciciosAPI, ejercicioAgregado]);

    const agregarEjercicio = useCallback((ejercicio) => {
        setEjercicioAgregado(prev => [...prev, ejercicio]);
    }, []);

    const removerEjercicio = useCallback((ejercicio) => {
        setEjercicioAgregado(prev => prev.filter(e => e.exerciseId !== ejercicio.exerciseId));
    }, []);

    const handleScroll = (e) => {
        const { scrollTop, clientHeight, scrollHeight } = e.currentTarget;
        if (scrollHeight - scrollTop <= clientHeight + 20 && !cargando) {
            setOffset(prev => prev + LIMIT);
        }
    };

    const isBotonDeshabilitado = nombreRutina.trim() === "" || ejercicioAgregado.length === 0;

    const handleGuardar = () => {
        const rutinaAGuardar = {
            nombre: nombreRutina.trim(),
            ejercicios: ejercicioAgregado
        };
        console.log("Rutina guardada exitosamente:", rutinaAGuardar);

        setNombreRutina("");
        setEjercicioAgregado([]);
        setBusqueda("");
        setRutinaView(false);
    };

    return (
        <div className={`fixed inset-0 bg-white z-50 flex flex-col transform transition-transform duration-300 ease-in-out ${rutinaView ? "translate-x-0" : "translate-x-full"}`}>

            {/* 1. HEADER (Top Bar) */}
            <div className="flex items-center justify-between px-4 h-20 border-b border-gray-100 shrink-0 bg-white z-20">
                <div className="w-1/4">
                    <button onClick={() => setRutinaView(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <ArrowLeft size={28} className="text-gray-800" />
                    </button>
                </div>
                <div className="w-2/4 text-center">
                    <h1 className="font-bold text-lg text-gray-900">Nueva Rutina</h1>
                </div>
                <div className="w-1/4 text-right">
                    <button
                        onClick={handleGuardar}
                        disabled={isBotonDeshabilitado}
                        className={`font-semibold transition-colors ${isBotonDeshabilitado ? "text-gray-300 cursor-not-allowed" : "text-blue-600 hover:text-blue-800"}`}
                    >
                        Guardar
                    </button>
                </div>
            </div>

            {/* 2. CONTROLES FIJOS (Nombre, Rutina Agregada y Buscador) */}
            {/* shrink-0 evita que este bloque se aplaste, shadow-sm le da un toque flotante */}
            <div className="px-6 pt-6 pb-4 shrink-0 flex flex-col bg-white z-10 shadow-sm border-b border-gray-50">

                <form action="" onSubmit={(e) => e.preventDefault()} className="shrink-0">
                    <label htmlFor="nombre" className="block mb-2 font-semibold text-gray-800">Nombre de la rutina:</label>
                    <input
                        type="text"
                        name="nombre"
                        id="nombre"
                        placeholder="Ej. Día de Pierna Pesado"
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                        value={nombreRutina}
                        onChange={(e) => setNombreRutina(e.target.value)}
                        required
                    />
                </form>

                {/* Rutina Agregada (Con scroll interno protegido) */}
                {ejercicioAgregado.length > 0 && (
                    <div className="mt-4 shrink-0 flex flex-col">
                        <h2 className="block mb-2 font-semibold text-blue-600">Rutina Agregada:</h2>
                        {/* max-h-48 y overflow-y-auto evitan que esta lista empuje al buscador fuera de la pantalla */}
                        <div className="flex flex-col gap-2 overflow-y-auto max-h-48 pr-1">
                            {ejercicioAgregado.map((ejercicio) => (
                                <EjercicioCard
                                    key={ejercicio.exerciseId}
                                    ejercicio={ejercicio}
                                    onAction={removerEjercicio}
                                    isAgregado={true}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* Buscador */}
                <div className="mt-4 shrink-0">
                    <label htmlFor="buscar" className="block mb-2 font-semibold text-gray-800">Buscar Ejercicios:</label>
                    <div className="relative">
                        <input
                            type="search"
                            placeholder="Ej. pecho, espalda, barra..."
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 bg-gray-50"
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* 3. LISTA DE RESULTADOS (Scroll Infinito) */}
            {/* flex-1 toma todo el alto restante. Aquí movemos el onScroll */}
            <div className="flex-1 overflow-y-auto px-6 py-4 bg-gray-50/30" onScroll={handleScroll}>
                <div className="flex flex-col gap-2">
                    {ejerciciosAMostrar.length > 0 ? (
                        ejerciciosAMostrar.map((ejercicio) => (
                            <EjercicioCard
                                key={ejercicio.exerciseId}
                                ejercicio={ejercicio}
                                onAction={agregarEjercicio}
                                isAgregado={false}
                            />
                        ))
                    ) : (
                        !cargando && <p className="text-gray-500 text-center py-4">No se encontraron ejercicios.</p>
                    )}

                    {/* Indicador de carga */}
                    {cargando && (
                        <div className="flex justify-center items-center py-6">
                            <Loader2 className="animate-spin text-blue-500" size={30} />
                            <span className="ml-2 text-gray-500 font-medium">Cargando más...</span>
                        </div>
                    )}
                </div>
            </div>

        </div>
    );
};

export { NuevaRutina };