import { ArrowLeft, Plus, Minus, Loader2 } from "lucide-react";
import { useEffect, useState, memo } from "react";
import { App } from "@capacitor/app";
import { FaDumbbell } from "react-icons/fa6";
import { NuevaRutinaSets } from "./NuevaRutinaSets";
import { traductor } from "./traducciones";
import { useNuevaRutina } from "./useNuevaRutina";

const traducirArray = (arr) => {
    if (!arr) return [];
    return arr.map(item => traductor[item.toLowerCase()] || item);
};

const EjercicioCard = memo(({ ejercicio, onAction, isAgregado }) => {
    const [imageError, setImageError] = useState(false);

    useEffect(() => {
        setImageError(false);
    }, [ejercicio.exerciseId]);

    const mostrarImagen = ejercicio.gifUrl && !imageError;

    return (
        <div className={`flex border rounded-md items-center gap-2 p-2 ${isAgregado ? 'border-blue-200 bg-blue-50' : 'border-gray-300'}`}>
            {mostrarImagen ? (
                <img
                    className={`flex w-16 h-16 rounded-md object-cover ${isAgregado ? 'bg-white' : ''}`}
                    src={ejercicio.gifUrl}
                    alt={ejercicio.name}
                    loading="lazy"
                    onError={() => setImageError(true)}
                />
            ) : (
                <div className={`flex w-16 h-16 rounded-md bg-gray-100 items-center justify-center shrink-0 ${isAgregado ? 'bg-white' : ''}`}>
                    <FaDumbbell size={30} className="text-gray-400" />
                </div>
            )}
            <div className="flex-1 ml-2">
                <p className="font-semibold text-gray-800 text-sm capitalize">{ejercicio.name}</p>
                <p className="text-gray-500 text-xs capitalize">
                    {traducirArray(ejercicio.targetMuscles).join(", ")} • {traducirArray(ejercicio.equipments).join(", ")}
                </p>
            </div>
            <button
                className={`p-2 rounded-md text-white transition-colors shrink-0 ${isAgregado ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-600 hover:bg-blue-700'}`}
                onClick={() => onAction(ejercicio)}
            >
                {isAgregado ? <Minus size={20} /> : <Plus size={20} />}
            </button>
        </div>
    );
});

const NuevaRutina = ({ setRutinaView, rutinaView }) => {
    // 1. Extraemos todo del Custom Hook
    const {
        ejercicioAgregado, busqueda, setBusqueda, nombreRutina, setNombreRutina,
        ejerciciosAMostrar, cargando, agregarEjercicio, removerEjercicio,
        handleScroll, isBotonDeshabilitado, limpiarTodo
    } = useNuevaRutina();

    // 2. Estado para manejar en qué pantalla estamos (1 = Buscar, 2 = Configurar Series)
    const [paso, setPaso] = useState(1);

    // 3. Lógica del botón de retroceso nativo
    useEffect(() => {
        let listener;
        const setupBackButton = async () => {
            if (rutinaView) {
                listener = await App.addListener('backButton', () => {
                    if (paso === 2) {
                        setPaso(1); // Si estamos en los sets, vuelve al buscador
                    } else {
                        setRutinaView(false); // Si estamos en el buscador, cierra la ventana
                    }
                });
            }
        };
        setupBackButton();
        return () => { if (listener) listener.remove(); };
    }, [rutinaView, paso, setRutinaView]);

    // RENDERIZADO NORMAL: Paso 1 (Buscador)
    return (
        <div className={`fixed inset-0 bg-white z-50 flex flex-col transform transition-transform duration-300 ease-in-out ${rutinaView ? "translate-x-0" : "translate-x-full"}`}>

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
                        onClick={() => setPaso(2)} // Avanza al paso 2
                        disabled={isBotonDeshabilitado}
                        className={`font-semibold transition-colors ${isBotonDeshabilitado ? "text-gray-300 cursor-not-allowed" : "text-blue-600 hover:text-blue-800"}`}
                    >
                        Siguiente
                    </button>
                </div>
            </div>

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

                {ejercicioAgregado.length > 0 && (
                    <div className="mt-4 shrink-0 flex flex-col">
                        <h2 className="block mb-2 font-semibold text-blue-600">Rutina Agregada:</h2>
                        <div className="flex flex-col gap-2 overflow-y-auto max-h-48 pr-1">
                            {ejercicioAgregado.map((ejercicio) => (
                                <EjercicioCard key={ejercicio.exerciseId} ejercicio={ejercicio} onAction={removerEjercicio} isAgregado={true} />
                            ))}
                        </div>
                    </div>
                )}

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

            <div className="flex-1 overflow-y-auto px-6 py-4 bg-gray-50/30" onScroll={handleScroll}>
                <div className="flex flex-col gap-2">
                    {ejerciciosAMostrar.length > 0 ? (
                        ejerciciosAMostrar.map((ejercicio) => (
                            <EjercicioCard key={ejercicio.exerciseId} ejercicio={ejercicio} onAction={agregarEjercicio} isAgregado={false} />
                        ))
                    ) : (
                        !cargando && <p className="text-gray-500 text-center py-4">No se encontraron ejercicios.</p>
                    )}

                    {cargando && (
                        <div className="flex justify-center items-center py-6">
                            <Loader2 className="animate-spin text-blue-500" size={30} />
                            <span className="ml-2 text-gray-500 font-medium">Cargando más...</span>
                        </div>
                    )}
                </div>
            </div>
            <NuevaRutinaSets
                paso={paso}
                nombreRutina={nombreRutina}
                ejercicios={ejercicioAgregado}
                volverAtras={() => setPaso(1)}
                cerrarVentana={() => {
                    limpiarTodo();
                    setPaso(1); // Reseteamos al paso 1 por si vuelve a abrir "Nueva Rutina" mañana
                    setRutinaView(false); // Cerramos el modal grande
                }}
            />

        </div>
    );
};

export { NuevaRutina };