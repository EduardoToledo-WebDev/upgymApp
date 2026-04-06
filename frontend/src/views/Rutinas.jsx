import { useOutletContext } from "react-router-dom";
import { Plus, FolderOpen, FolderPlus, ArrowLeft, Dumbbell, Folder, ChevronDown, ChevronRight, Pencil, Loader2 } from "lucide-react";
import { useState, useEffect, useMemo, useRef } from "react";
import { NuevaRutina } from "./nuevaRutina/NuevaRutina";
import { Preferences } from "@capacitor/preferences";
import { RutinasDetalles } from "./RutinasDetalles";
import { toast, Toaster } from 'sonner';
import { feedback } from '../utils/haptics';

const API_URL = import.meta.env.VITE_API_URL;

export default function Entrenar() {
    const [rutinaView, setRutinaView] = useState(false);
    const [detalleView, setDetalleView] = useState(false);
    const { userData } = useOutletContext();
    const [rutinas, setRutinas] = useState([]);
    const [rutinaSeleccionada, setRutinaSeleccionada] = useState(null);
    const [rutinaAEditar, setRutinaAEditar] = useState(null);
    const [refrescarLista, setRefrescarLista] = useState(false);

    // --- ESTADOS PARA IMPORTACIÓN CON IA ---
    const fileInputRef = useRef(null);
    const [importando, setImportando] = useState(false);
    const [abortController, setAbortController] = useState(null);

    // ESTADOS PARA CARPETAS Y EL MODAL
    const [carpetasAbiertas, setCarpetasAbiertas] = useState({});
    const [modalCarpeta, setModalCarpeta] = useState(false);

    // Estados internos del modal de carpetas
    const [carpetaAEditar, setCarpetaAEditar] = useState(null);
    const [nombreNuevaCarpeta, setNombreNuevaCarpeta] = useState("");
    const [rutinasSeleccionadas, setRutinasSeleccionadas] = useState([]);

    const styles = {
        title: "font-bold text-3xl text-gray-900",
        topButtons: "flex justify-center gap-2 font-semibold text-gray-700 bg-white border border-gray-300 h-12 rounded-xl items-center shadow-sm active:bg-gray-50 transition-colors"
    }

    useEffect(() => {
        const obtenerRutinas = async () => {
            try {
                const token = await Preferences.get({ key: 'token' });
                const response = await fetch(`http://${API_URL}/rutinas`, {
                    headers: { 'Authorization': `Bearer ${token.value}` }
                });
                const data = await response.json();
                if (data.valid) setRutinas(data.rutinas);
            } catch (error) {
                console.error("Error al obtener rutinas:", error);
            }
        };
        obtenerRutinas();
    }, [rutinaView, detalleView, refrescarLista]);

    // AGRUPACIÓN INTELIGENTE
    const { carpetas, rutinasSueltas } = useMemo(() => {
        const mapaCarpetas = {};
        const sueltas = [];

        rutinas.forEach(rutina => {
            const nombreCarpeta = rutina.grupo_rutina?.trim();
            if (nombreCarpeta) {
                if (!mapaCarpetas[nombreCarpeta]) mapaCarpetas[nombreCarpeta] = [];
                mapaCarpetas[nombreCarpeta].push(rutina);
            } else {
                sueltas.push(rutina);
            }
        });

        return { carpetas: mapaCarpetas, rutinasSueltas: sueltas };
    }, [rutinas]);

    const toggleCarpeta = (nombre) => {
        setCarpetasAbiertas(prev => ({ ...prev, [nombre]: !prev[nombre] }));
    };

    // --- LÓGICA DE IMPORTACIÓN (IA) ---
    const handleSubirArchivo = async (event) => {
        const archivo = event.target.files[0];
        if (!archivo) return;

        setImportando(true);
        const controller = new AbortController();
        setAbortController(controller);

        const formData = new FormData();
        formData.append('documento', archivo);

        try {
            const token = await Preferences.get({ key: 'token' });

            // 1. Mandamos el archivo a la IA
            const response = await fetch(`http://${API_URL}/rutinas/importar`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token.value}` },
                body: formData,
                signal: controller.signal
            });

            const data = await response.json();

            if (data.valid) {
                // Validación: Si la IA devolvió 0 rutinas (Documento Basura)
                if (data.cantidad === 0) {
                    feedback.error();
                    toast.error("Documento no válido", {
                        description: "No encontramos ejercicios que coincidan con el catálogo."
                    });
                    return; // Salimos sin hacer nada más
                }

                const { rutinasIA, carpeta } = data;

                // 2. Guardamos TODAS las rutinas en lote automáticamente
                const promesasDeGuardado = rutinasIA.map(rutina => {
                    return fetch(`http://${API_URL}/rutinas`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token.value}`
                        },
                        body: JSON.stringify({
                            nombre: rutina.nombre,
                            grupo_rutina: rutina.grupo_rutina,
                            ejercicios: rutina.ejercicios
                        })
                    });
                });

                // Esperamos a que todas se guarden en la base de datos
                await Promise.all(promesasDeGuardado);

                // 3. Mostramos el resultado en la pantalla
                setCarpetasAbiertas(prev => ({ ...prev, [carpeta]: true })); // Abrimos la carpeta automáticamente
                setRefrescarLista(prev => !prev); // Recargamos las rutinas de la BD

                // Opcional: Un alert amigable para confirmar
                feedback.success();
                toast.success("¡Éxito!", {
                    description: `Se generaron ${data.cantidad} rutinas en la carpeta "${carpeta}".`
                });
            } else {
                feedback.error();
                toast.error("Error", {
                    description: data.message
                });
            }
        } catch (error) {
            if (error.name === 'AbortError') {
                console.log("Importación cancelada por el usuario");
            } else {
                console.error("Error importando:", error);
                feedback.error();
                toast.error("Error de conexión", {
                    description: "No se pudo conectar con el servidor."
                });
            }
        } finally {
            setImportando(false);
            setAbortController(null);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const cancelarImportacion = () => {
        if (abortController) abortController.abort();
        setImportando(false);
    };

    // --- LÓGICA DEL MODAL DE CARPETAS ---
    const abrirModalCrear = () => {
        setCarpetaAEditar(null);
        setNombreNuevaCarpeta("");
        setRutinasSeleccionadas([]);
        setModalCarpeta(true);
    };

    const abrirModalEditar = (nombreCarpeta, e) => {
        e.stopPropagation();
        setCarpetaAEditar(nombreCarpeta);
        setNombreNuevaCarpeta(nombreCarpeta);

        const idsDeEstaCarpeta = carpetas[nombreCarpeta].map(r => r.rutina_id);
        setRutinasSeleccionadas(idsDeEstaCarpeta);

        setModalCarpeta(true);
    };

    const toggleSeleccionRutina = (rutinaId) => {
        setRutinasSeleccionadas(prev =>
            prev.includes(rutinaId) ? prev.filter(id => id !== rutinaId) : [...prev, rutinaId]
        );
    };

    const handleGuardarCarpeta = async (e) => {
        e.preventDefault();
        if (nombreNuevaCarpeta.trim() === "" || rutinasSeleccionadas.length === 0) return;

        try {
            const token = await Preferences.get({ key: 'token' });
            const response = await fetch(`http://${API_URL}/carpetas/asignar`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token.value}`
                },
                body: JSON.stringify({
                    nombreCarpeta: nombreNuevaCarpeta.trim(),
                    nombreCarpetaAnterior: carpetaAEditar,
                    rutinasIds: rutinasSeleccionadas
                })
            });

            if (response.ok) {
                setModalCarpeta(false);
                setCarpetasAbiertas(prev => ({ ...prev, [nombreNuevaCarpeta.trim()]: true }));
                setRefrescarLista(prev => !prev);
            }
        } catch (error) {
            console.error("Error guardando carpeta:", error);
        }
    };

    const renderTarjetaRutina = (rutina) => (
        <div
            key={rutina.rutina_id}
            onClick={() => { setRutinaSeleccionada(rutina); setDetalleView(true); }}
            className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm active:bg-gray-50 transition-colors cursor-pointer"
        >
            <div className="flex justify-between items-start mb-3 gap-2">
                <h3 className="font-bold text-lg text-gray-900 truncate">{rutina.nombre}</h3>
            </div>
            <div className="flex flex-col gap-1.5">
                {rutina.ejercicios?.slice(0, 3).map((ejercicio, index) => (
                    <div key={`${ejercicio.exerciseId}-${index}`} className="flex items-center gap-2 overflow-hidden">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0"></div>
                        <p className="text-sm text-gray-500 truncate capitalize flex-1">
                            <span className="font-medium text-gray-700 mr-1">{ejercicio.series}x</span>
                            {ejercicio.name}
                        </p>
                    </div>
                ))}
                {rutina.ejercicios?.length > 3 && (
                    <p className="text-xs text-gray-400 mt-1 font-medium ml-3.5">
                        + {rutina.ejercicios.length - 3} ejercicios más
                    </p>
                )}
            </div>
        </div>
    );

    return (
        <div className="bg-gray-50 min-h-screen pb-24">
            <Toaster position="bottom-center" expand={false} richColors closeButton />
            {/* HEADER FIJO */}
            <div className="sticky top-0 bg-gray-50 z-30 pt-4 pb-4 px-5 shadow-[0_4px_6px_-4px_rgba(0,0,0,0.05)]">
                <h1 className={styles.title}>Rutinas</h1>

                <div className="flex flex-col gap-3 mt-4">
                    <button onClick={() => setRutinaView(true)} className={`${styles.topButtons} w-full`}>
                        <Plus size={20} className="text-blue-600" /> Crear rutina nueva
                    </button>

                    <div className="grid grid-cols-2 gap-3">
                        {/* 🔴 2. INPUT OCULTO Y BOTÓN DE IMPORTAR CONECTADO */}
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleSubirArchivo}
                            accept=".pdf, text/plain, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                            className="hidden"
                        />
                        <button onClick={() => fileInputRef.current.click()} className={styles.topButtons}>
                            <FolderOpen size={20} className="text-gray-500" /> Importar
                        </button>

                        <button onClick={abrirModalCrear} className={styles.topButtons}>
                            <FolderPlus size={20} className="text-gray-500" /> Carpeta
                        </button>
                    </div>
                </div>

                <div className="flex items-center justify-between mt-6">
                    <h2 className="font-bold text-lg text-gray-800">Mis Rutinas</h2>
                    <span className="bg-gray-200 text-gray-600 text-xs font-bold px-2 py-1 rounded-full">
                        {rutinas.length}
                    </span>
                </div>
            </div>

            {/* CONTENIDO SCROLL */}
            <div className="px-5 pt-4 flex flex-col gap-4">

                {Object.entries(carpetas).map(([nombreCarpeta, rutinasDeCarpeta]) => (
                    <div key={nombreCarpeta} className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                        <div
                            onClick={() => toggleCarpeta(nombreCarpeta)}
                            className="w-full flex items-center justify-between p-4 bg-gray-50/50 hover:bg-gray-50 transition-colors cursor-pointer"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 rounded-lg shrink-0">
                                    <Folder className="text-blue-600" size={20} fill="currentColor" fillOpacity={0.2} />
                                </div>
                                <span className="font-bold text-gray-800 text-lg truncate max-w-[150px]">{nombreCarpeta}</span>
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={(e) => abrirModalEditar(nombreCarpeta, e)}
                                    className="p-1.5 hover:bg-blue-100 rounded-lg transition-colors mr-1"
                                >
                                    <Pencil size={18} className="text-blue-600" />
                                </button>

                                <span className="text-xs font-bold bg-white px-2 py-1 rounded-full border border-gray-200 shadow-sm text-gray-500">
                                    {rutinasDeCarpeta.length}
                                </span>
                                <div className="text-gray-400">
                                    {carpetasAbiertas[nombreCarpeta] ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                                </div>
                            </div>
                        </div>

                        <div className={`transition-all duration-300 ease-in-out origin-top ${carpetasAbiertas[nombreCarpeta] ? 'max-h-[2000px] opacity-100 scale-y-100' : 'max-h-0 opacity-0 scale-y-0'} overflow-hidden`}>
                            <div className="p-4 flex flex-col gap-3 bg-gray-50/30 border-t border-gray-100">
                                {rutinasDeCarpeta.map(rutina => renderTarjetaRutina(rutina))}
                            </div>
                        </div>
                    </div>
                ))}

                {rutinasSueltas.map(rutina => renderTarjetaRutina(rutina))}

                {rutinas.length === 0 && (
                    <div className="text-center text-gray-400 mt-10 flex flex-col items-center">
                        <Dumbbell size={40} className="mb-2 opacity-50" />
                        <p>Aún no tienes rutinas creadas.</p>
                    </div>
                )}
            </div>

            {/* --- MODAL INTELIGENTE (CREAR Y EDITAR CARPETAS) --- */}
            {modalCarpeta && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-black/50 backdrop-blur-sm">
                    <form onSubmit={handleGuardarCarpeta} className="bg-white w-full max-w-[350px] flex flex-col rounded-2xl shadow-2xl animate-in fade-in zoom-in duration-200 overflow-hidden max-h-[85vh]">

                        <div className="p-5 pb-0 shrink-0">
                            <h3 className="text-xl font-bold text-gray-900 mb-1">
                                {carpetaAEditar ? "Editar Carpeta" : "Nueva Carpeta"}
                            </h3>
                            <p className="text-gray-500 text-sm mb-4">Selecciona al menos una rutina.</p>

                            <input
                                type="text"
                                autoFocus
                                placeholder="Nombre de la carpeta..."
                                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 font-medium text-gray-800"
                                value={nombreNuevaCarpeta}
                                onChange={(e) => setNombreNuevaCarpeta(e.target.value)}
                            />
                        </div>

                        {/* LISTA DE RUTINAS CON CHECKBOXES */}
                        <div className="px-5 py-4 overflow-y-auto min-h-[100px] flex-1">
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Tus Rutinas</h4>
                            <div className="flex flex-col gap-2">
                                {rutinas.map(rutina => (
                                    <label key={rutina.rutina_id} className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-100 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={rutinasSeleccionadas.includes(rutina.rutina_id)}
                                            onChange={() => toggleSeleccionRutina(rutina.rutina_id)}
                                            className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        <div className="flex flex-col overflow-hidden">
                                            <span className="text-sm font-bold text-gray-800 truncate">{rutina.nombre}</span>
                                            {rutina.grupo_rutina && rutina.grupo_rutina !== carpetaAEditar && (
                                                <span className="text-[10px] text-gray-400 truncate">En: {rutina.grupo_rutina}</span>
                                            )}
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="p-5 pt-0 shrink-0 flex gap-3 bg-white">
                            <button
                                type="button"
                                onClick={() => setModalCarpeta(false)}
                                className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl active:bg-gray-200 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={nombreNuevaCarpeta.trim() === "" || rutinasSeleccionadas.length === 0}
                                className={`flex-1 py-3 font-bold rounded-xl transition-colors ${nombreNuevaCarpeta.trim() === "" || rutinasSeleccionadas.length === 0 ? "bg-blue-300 text-white cursor-not-allowed" : "bg-blue-600 text-white active:bg-blue-700"}`}
                            >
                                Guardar
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* 🔴 3. MODAL DE CARGA IA CANCELABLE */}
            {importando && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm transition-opacity">
                    <div className="bg-white w-full max-w-xs rounded-3xl p-8 shadow-2xl flex flex-col items-center animate-in zoom-in duration-200">

                        <div className="relative flex justify-center items-center mb-6 mt-2">
                            <div className="absolute animate-ping w-16 h-16 rounded-full bg-blue-100 opacity-75"></div>
                            <Loader2 size={48} className="animate-spin text-blue-600 relative z-10" />
                        </div>

                        <h3 className="text-lg font-bold text-gray-900 mb-2 text-center">Analizando rutina...</h3>
                        <p className="text-gray-500 text-sm text-center mb-8">Nuestra IA está interpretando tu documento.</p>

                        <button
                            onClick={cancelarImportacion}
                            className="w-full py-3 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-xl transition-colors active:bg-red-200"
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            )}

            {/* --- OTROS COMPONENTES INVISIBLES --- */}
            <NuevaRutina rutinaView={rutinaView} setRutinaView={setRutinaView} rutinaAEditar={rutinaAEditar} setRutinaAEditar={setRutinaAEditar} actualizarLista={() => setRefrescarLista(prev => !prev)} />
            <RutinasDetalles detalleView={detalleView} setDetalleView={setDetalleView} rutina={rutinaSeleccionada} actualizarLista={() => setRefrescarLista(prev => !prev)} abrirEdicion={() => { setDetalleView(false); setRutinaAEditar(rutinaSeleccionada); setTimeout(() => setRutinaView(true), 300); }} />
        </div>
    );
}