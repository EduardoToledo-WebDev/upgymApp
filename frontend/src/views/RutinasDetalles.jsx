import { ArrowLeft, Play, Dumbbell, Timer, Repeat, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { Preferences } from "@capacitor/preferences";
const API_URL = import.meta.env.VITE_API_URL;

// 🔴 1. Agregamos "abrirEdicion" a los props
const RutinasDetalles = ({ detalleView, setDetalleView, rutina, actualizarLista, abrirEdicion }) => {
    const [menuAbierto, setMenuAbierto] = useState(false);
    const [confirmarEliminar, setConfirmarEliminar] = useState(false);

    const ejecutarEliminacion = async () => {
        try {
            const token = await Preferences.get({ key: 'token' });
            const res = await fetch(`http://${API_URL}/rutinas/${rutina.rutina_id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token.value}` }
            });
            const data = await res.json();

            if (data.valid) {
                setConfirmarEliminar(false);
                setDetalleView(false);
                setMenuAbierto(false);
                if (actualizarLista) actualizarLista();
            } else {
                console.error("Error del servidor:", data.message);
            }
        } catch (error) {
            console.error("Error al eliminar la rutina:", error);
        }
    };

    return (
        <>
            <div className={`fixed inset-0 bg-gray-50 z-40 flex flex-col transform transition-transform duration-300 ease-in-out ${detalleView ? "translate-x-0" : "translate-x-full"}`}>

                {/* 1. CABECERA */}
                <div className="flex items-center px-4 h-20 border-b border-gray-200 shrink-0 bg-white z-20 shadow-sm relative">
                    <div className="w-1/4">
                        <button
                            onClick={() => { setDetalleView(false); setMenuAbierto(false); }}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <ArrowLeft size={28} className="text-gray-800" />
                        </button>
                    </div>
                    <div className="w-2/4 text-center">
                        <h1 className="font-bold text-lg text-gray-900 truncate px-2">{rutina?.nombre}</h1>
                    </div>

                    <div className="w-1/4 flex justify-end relative">
                        <button onClick={() => setMenuAbierto(!menuAbierto)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                            <MoreVertical size={24} className="text-gray-800" />
                        </button>

                        {/* Menú Desplegable */}
                        {menuAbierto && (
                            <div className="absolute top-12 right-0 mt-1 w-40 bg-white border border-gray-200 rounded-xl shadow-lg z-50 py-2 overflow-hidden">
                                <button
                                    onClick={() => {
                                        // 🔴 2. Activamos la función para ir a Editar
                                        if (abrirEdicion) abrirEdicion();
                                        setMenuAbierto(false);
                                    }}
                                    className="w-full text-left px-4 py-2 flex items-center gap-2 hover:bg-gray-50 text-gray-700 font-medium transition-colors"
                                >
                                    <Pencil size={16} /> Editar
                                </button>
                                <button
                                    onClick={() => {
                                        setConfirmarEliminar(true);
                                        setMenuAbierto(false);
                                    }}
                                    className="w-full text-left px-4 py-2 flex items-center gap-2 hover:bg-red-50 text-red-600 font-medium transition-colors"
                                >
                                    <Trash2 size={16} /> Eliminar
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* 2. CONTENIDO */}
                <div className="flex-1 overflow-y-auto px-4 py-6" onClick={() => setMenuAbierto(false)}>
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="font-bold text-gray-700 text-sm uppercase tracking-wider">
                            Ejercicios de la rutina
                        </h2>
                        <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2.5 py-1 rounded-full">
                            {rutina?.ejercicios?.length || 0}
                        </span>
                    </div>

                    <div className="flex flex-col gap-4">
                        {rutina?.ejercicios?.map((ejercicio, index) => (
                            <div key={ejercicio.detalleId || index} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">

                                <div className="flex items-center gap-4 mb-4">
                                    <span className="text-gray-300 font-bold text-xl w-4 text-center">
                                        {index + 1}
                                    </span>

                                    {ejercicio.gifUrl ? (
                                        <img
                                            // 🔴 3. Construimos la URL apuntando al backend
                                            src={ejercicio.gifUrl.startsWith('http') ? ejercicio.gifUrl : `http://${API_URL}/gifs/${ejercicio.gifUrl}`}
                                            alt={ejercicio.name}
                                            className="w-14 h-14 rounded-lg object-cover bg-gray-100"
                                            loading="lazy"
                                        />
                                    ) : (
                                        <div className="w-14 h-14 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                                            <Dumbbell size={24} className="text-gray-400" />
                                        </div>
                                    )}

                                    <h3 className="font-semibold text-gray-800 capitalize leading-tight flex-1">
                                        {ejercicio.name}
                                    </h3>
                                </div>

                                <div className="flex flex-wrap gap-2 pl-8">
                                    <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-lg text-sm">
                                        <Repeat size={16} className="text-gray-500" />
                                        <span className="font-medium text-gray-700">{ejercicio.series} Series</span>
                                    </div>

                                    <div className="flex items-center gap-1.5 bg-blue-50 border border-blue-100 px-3 py-1.5 rounded-lg text-sm">
                                        <Dumbbell size={16} className="text-blue-600" />
                                        <span className="font-medium text-blue-700">
                                            {ejercicio.valorObjetivo} {ejercicio.tipoObjetivo === "Reps" ? "Reps" : ""}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-lg text-sm">
                                        <Timer size={16} className="text-gray-500" />
                                        <span className="font-medium text-gray-700">{ejercicio.descanso}s Rest</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 3. PIE DE PÁGINA */}
                <div className="shrink-0 bg-white border-t border-gray-200 p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] pb-6">
                    <button className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-lg py-4 rounded-xl shadow-md transition-colors flex items-center justify-center gap-2">
                        <Play size={24} fill="currentColor" /> Empezar Entrenamiento
                    </button>
                </div>
            </div>

            {/* MODAL DE CONFIRMACIÓN DE ELIMINACIÓN */}
            {confirmarEliminar && (
                <div className="fixed inset-0 flex items-center justify-center p-6 bg-black/50 backdrop-blur-sm" style={{ zIndex: 100 }}>
                    <div className="bg-white w-full max-w-xs rounded-2xl p-6 shadow-2xl">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">¿Eliminar rutina?</h3>
                        <p className="text-gray-500 mb-6 text-sm">Esta acción no se puede deshacer. Se perderán todos los ejercicios configurados.</p>
                        <div className="flex flex-col gap-3">
                            <button
                                onClick={ejecutarEliminacion}
                                className="w-full py-3 bg-red-600 text-white font-bold rounded-xl active:bg-red-700 transition-colors"
                            >
                                Sí, eliminar
                            </button>
                            <button
                                onClick={() => setConfirmarEliminar(false)}
                                className="w-full py-3 bg-gray-100 text-gray-700 font-bold rounded-xl active:bg-gray-200 transition-colors"
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export { RutinasDetalles };