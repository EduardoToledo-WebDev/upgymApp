import { ArrowLeft, Plus, Minus, Loader2 } from "lucide-react";
import { useEffect, useState, memo } from "react";
import { App } from "@capacitor/app";
import { FaDumbbell } from "react-icons/fa6";
import { NuevaRutinaSets } from "./NuevaRutinaSets";
import { useNuevaRutina } from "./useNuevaRutina";

const API_URL = import.meta.env.VITE_API_URL;

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
                    src={`http://${API_URL}/gifs/${ejercicio.gifUrl}`}
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
                    {(ejercicio.targetMuscles || []).join(", ")} • {(ejercicio.equipments || []).join(", ")}
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

const NuevaRutina = ({ setRutinaView, rutinaView, rutinaAEditar, setRutinaAEditar, actualizarLista }) => {
    const {
        ejercicioAgregado, busqueda, setBusqueda, nombreRutina, setNombreRutina,
        ejerciciosAMostrar, cargando, agregarEjercicio, removerEjercicio,
        handleScroll, isBotonDeshabilitado, limpiarTodo
    } = useNuevaRutina(rutinaAEditar);

    const [paso, setPaso] = useState(1);

    // 🔴 1. ESTADO PARA EL MODAL DE CONFIRMACIÓN
    const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);

    // 🔴 2. FUNCIÓN PARA DESTRUIR DATOS Y CERRAR (Usada al confirmar o al guardar con éxito)
    const ejecutarCierre = () => {
        limpiarTodo();
        if (setRutinaAEditar) setRutinaAEditar(null);
        setPaso(1);
        setMostrarConfirmacion(false);
        setRutinaView(false);
    };

    // 🔴 3. FUNCIÓN DEL BOTÓN "ATRÁS"
    const handleCerrar = () => {
        // Si hay datos, mostramos el modal bonito en lugar del alert
        if (nombreRutina.trim() !== "" || ejercicioAgregado.length > 0) {
            setMostrarConfirmacion(true);
            return;
        }
        // Si no hay nada escrito, cerramos de golpe
        ejecutarCierre();
    };

    useEffect(() => {
        let listener;
        const setupBackButton = async () => {
            if (rutinaView) {
                listener = await App.addListener('backButton', () => {
                    if (paso === 2) setPaso(1);
                    else handleCerrar();
                });
            }
        };
        setupBackButton();
        return () => { if (listener) listener.remove(); };
    }, [rutinaView, paso, nombreRutina, ejercicioAgregado]);

    return (
        <> {/* 🔴 FRAGMENTO AÑADIDO PARA PODER PONER EL MODAL POR ENCIMA */}
            <div className={`fixed inset-0 bg-white z-50 flex flex-col transform transition-transform duration-300 ease-in-out ${rutinaView ? "translate-x-0" : "translate-x-full"}`}>

                <div className="flex items-center justify-between px-4 h-20 border-b border-gray-100 shrink-0 bg-white z-20">
                    <div className="w-1/4">
                        <button onClick={handleCerrar} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                            <ArrowLeft size={28} className="text-gray-800" />
                        </button>
                    </div>
                    <div className="w-2/4 text-center">
                        <h1 className="font-bold text-lg text-gray-900">
                            {rutinaAEditar ? "Editar Rutina" : "Nueva Rutina"}
                        </h1>
                    </div>
                    <div className="w-1/4 text-right">
                        <button
                            onClick={() => setPaso(2)}
                            disabled={isBotonDeshabilitado}
                            className={`font-semibold transition-colors ${isBotonDeshabilitado ? "text-gray-300 cursor-not-allowed" : "text-blue-600 hover:text-blue-800"}`}
                        >
                            Siguiente
                        </button>
                    </div>
                </div>

                <div className="px-6 pt-6 pb-4 shrink-0 flex flex-col bg-white z-10 shadow-sm border-b border-gray-50">
                    <form onSubmit={(e) => e.preventDefault()} className="shrink-0">
                        <div className="flex flex-col">
                            <label
                                htmlFor="nombre-rutina"
                                className="block mb-2 font-semibold text-gray-800"
                            >
                                Nombre de la rutina:
                            </label>
                            <input
                                type="text"
                                name="nombre"
                                id="nombre-rutina" // ID único y descriptivo
                                placeholder="Ej. Día de Pierna Pesado"
                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                value={nombreRutina}
                                onChange={(e) => setNombreRutina(e.target.value)}
                                required
                                aria-required="true" // Indica a lectores de pantalla que es obligatorio
                            />
                        </div>
                    </form>

                    {ejercicioAgregado.length > 0 && (
                        <section className="mt-4 shrink-0 flex flex-col" aria-labelledby="titulo-rutina-agregada">
                            <h2 id="titulo-rutina-agregada" className="block mb-2 font-semibold text-blue-600">
                                Rutina Agregada:
                            </h2>
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
                        </section>
                    )}

                    <div className="mt-4 shrink-0">
                        <label
                            htmlFor="buscar-ejercicios"
                            className="block mb-2 font-semibold text-gray-800"
                        >
                            Buscar Ejercicios:
                        </label>
                        <div className="relative">
                            <input
                                type="search"
                                id="buscar-ejercicios" // Vinculación clara con el label
                                placeholder="Ej. pecho, espalda, barra..."
                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 bg-gray-50 outline-none"
                                value={busqueda}
                                onChange={(e) => setBusqueda(e.target.value)}
                                aria-label="Buscar ejercicios por nombre o músculo" // Refuerzo de contexto
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
                    grupoRutina={rutinaAEditar?.grupo_rutina || null}
                    ejercicios={ejercicioAgregado}
                    volverAtras={() => setPaso(1)}
                    cerrarVentana={() => {
                        ejecutarCierre(); // 🔴 Usamos la función maestra aquí también
                        if (actualizarLista) actualizarLista();
                    }}
                    esEdicion={!!rutinaAEditar}
                    idRutina={rutinaAEditar?.rutina_id}
                />
            </div>

            {/* 🔴 4. EL MODAL PROFESIONAL DE TAILWIND */}
            {mostrarConfirmacion && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-xs rounded-2xl p-6 shadow-2xl">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">¿Descartar cambios?</h3>
                        <p className="text-gray-500 mb-6 text-sm">Si sales ahora, perderás la configuración actual de tu rutina.</p>
                        <div className="flex flex-col gap-3">
                            <button
                                onClick={ejecutarCierre}
                                className="w-full py-3 bg-red-600 text-white font-bold rounded-xl active:bg-red-700 transition-colors"
                            >
                                Sí, salir
                            </button>
                            <button
                                onClick={() => setMostrarConfirmacion(false)}
                                className="w-full py-3 bg-gray-100 text-gray-700 font-bold rounded-xl active:bg-gray-200 transition-colors"
                            >
                                Seguir editando
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export { NuevaRutina };