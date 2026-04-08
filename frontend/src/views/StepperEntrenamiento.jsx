import { useState, useEffect, useContext } from "react";
import { AppContext } from "../context/AppContext";
import { Preferences } from "@capacitor/preferences";
import { Haptics, ImpactStyle } from "@capacitor/haptics";
import { Check, Timer, X, Play, Dumbbell, Trophy } from "lucide-react";

const StepperEntrenamiento = () => {
    const { entrenamientoState, setEntrenamientoState } = useContext(AppContext);

    const [isVisible, setIsVisible] = useState(false);
    const [pesoInput, setPesoInput] = useState("");
    const [repsInput, setRepsInput] = useState("");
    const [tiempoRestante, setTiempoRestante] = useState(0);
    const [mostrarModalCancelar, setMostrarModalCancelar] = useState(false);

    useEffect(() => {
        if (entrenamientoState) {
            const timer = requestAnimationFrame(() => setIsVisible(true));
            return () => cancelAnimationFrame(timer);
        }
    }, [entrenamientoState]);

    useEffect(() => {
        let interval;
        if (entrenamientoState?.tracker?.fase === "descanso") {
            interval = setInterval(() => {
                const { tracker, ejercicios } = entrenamientoState;
                const ejercicioActual = ejercicios[tracker.ejercicioActualIndex];
                const tiempoPasado = Math.floor((Date.now() - tracker.inicio_descanso) / 1000);
                const restante = ejercicioActual.descanso_segundos - tiempoPasado;

                if (restante <= 0) {
                    clearInterval(interval);
                    Haptics.impact({ style: ImpactStyle.Heavy });
                    avanzarSiguientePaso();
                } else {
                    setTiempoRestante(restante);
                }
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [entrenamientoState]);

    const guardarEstadoPersistente = async (nuevoEstado) => {
        setEntrenamientoState(nuevoEstado);
        await Preferences.set({ key: 'workout_state', value: JSON.stringify(nuevoEstado) });
    };

    const cerrarStepperConAnimacion = () => {
        setIsVisible(false);
        setTimeout(async () => {
            await Preferences.remove({ key: 'workout_state' });
            setEntrenamientoState(null);
        }, 300);
    };

    const finalizarRutinaYEnviar = async () => {
        const logsParaBD = [];
        entrenamientoState.ejercicios.forEach(ej => {
            ej.logs.filter(log => log.completada).forEach(log => {
                logsParaBD.push({
                    id_checkin: entrenamientoState.id_checkin,
                    id_rutina_ejercicio: ej.id_rutina_ejercicio,
                    serie_numero: log.serie_numero,
                    repeticiones: parseInt(log.repeticiones, 10) || 0,
                    peso_kg: parseFloat(log.peso_kg) || 0
                });
            });
        });

        console.log("JSON FINAL PARA MYSQL:", logsParaBD);
        // Aquí ejecutas tu fetch masivo a la BD
        cerrarStepperConAnimacion();
    };

    const completarSerie = async () => {
        if (!repsInput && !pesoInput) return;
        const nuevoEstado = JSON.parse(JSON.stringify(entrenamientoState));
        const refTracker = nuevoEstado.tracker;
        const refEjercicios = nuevoEstado.ejercicios;
        const refLog = refEjercicios[refTracker.ejercicioActualIndex].logs[refTracker.serieActualIndex];

        refLog.repeticiones = repsInput;
        refLog.peso_kg = pesoInput;
        refLog.completada = true;

        // VERIFICAR SI ES LA ÚLTIMA SERIE DEL ÚLTIMO EJERCICIO
        const esUltimaSerie = refTracker.serieActualIndex === refEjercicios[refTracker.ejercicioActualIndex].series_totales - 1;
        const esUltimoEjercicio = refTracker.ejercicioActualIndex === refEjercicios.length - 1;

        if (esUltimaSerie && esUltimoEjercicio) {
            refTracker.fase = "finalizado";
        } else {
            refTracker.fase = "descanso";
            refTracker.inicio_descanso = Date.now();
            const tiempoDeDescanso = refEjercicios[refTracker.ejercicioActualIndex].descanso_segundos;
            setTiempoRestante(tiempoDeDescanso);
        }

        setRepsInput(""); setPesoInput("");
        await guardarEstadoPersistente(nuevoEstado);
        await Haptics.impact({ style: ImpactStyle.Medium });
    };

    const avanzarSiguientePaso = async () => {
        if (!entrenamientoState) return;
        const nuevoEstado = JSON.parse(JSON.stringify(entrenamientoState));
        const refTracker = nuevoEstado.tracker;
        const ejActualObj = nuevoEstado.ejercicios[refTracker.ejercicioActualIndex];

        if (refTracker.serieActualIndex < ejActualObj.series_totales - 1) {
            refTracker.serieActualIndex += 1;
        } else if (refTracker.ejercicioActualIndex < nuevoEstado.ejercicios.length - 1) {
            refTracker.ejercicioActualIndex += 1;
            refTracker.serieActualIndex = 0;
        }

        refTracker.fase = "ejecucion";
        await guardarEstadoPersistente(nuevoEstado);
    };
    const cancelarRutina = () => {
        cerrarStepperConAnimacion();
    };
    if (!entrenamientoState) return null;

    const { tracker, ejercicios } = entrenamientoState;
    const ejercicioActual = ejercicios[tracker.ejercicioActualIndex];
    const totalSeries = ejercicios.reduce((acc, ej) => acc + ej.series_totales, 0);
    const seriesCompletadas = ejercicios.reduce((acc, ej) => acc + ej.logs.filter(log => log.completada).length, 0);
    const progresoPorcentaje = (seriesCompletadas / totalSeries) * 100;

    return (
        <div className={`fixed inset-0 bg-white z-[100] flex flex-col transform transition-transform duration-300 ease-in-out ${isVisible ? "translate-x-0" : "translate-x-full"}`}>

            <div className="w-full h-1.5 bg-slate-100 shrink-0">
                <div className="h-full bg-blue-600 transition-all duration-700 ease-out" style={{ width: `${progresoPorcentaje}%` }}></div>
            </div>

            <div className="flex justify-between items-center px-4 py-3 shrink-0">
                <button onClick={() => setMostrarModalCancelar(true)} className="p-2 text-slate-400 active:bg-slate-100 rounded-full transition-colors">
                    <X size={24} />
                </button>
                <span className="font-bold text-[10px] text-slate-400 tracking-widest uppercase">
                    {tracker.fase === 'finalizado' ? '¡Rutina Lista!' : `${seriesCompletadas} / ${totalSeries} Series`}
                </span>
                <div className="w-10"></div>
            </div>

            <div className="flex-1 flex flex-col overflow-y-auto">
                {tracker.fase === "ejecucion" ? (
                    <div className="flex-1 flex flex-col animate-in slide-in-from-right duration-300">
                        <div className="w-full h-[45%] bg-slate-50 relative shrink-0">
                            {ejercicioActual.gif_url ? (
                                <img src={`http://${import.meta.env.VITE_API_URL}/gifs/${ejercicioActual.gif_url}`} alt="ejercicio" className="w-full h-full object-contain" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center"><Dumbbell size={64} className="text-slate-200" /></div>
                            )}
                        </div>

                        <div className="flex-1 flex flex-col px-8 py-6">
                            <h2 className="text-3xl font-black text-slate-900 leading-tight uppercase tracking-tight mb-1 italic">{ejercicioActual.nombre_ejercicio}</h2>
                            <p className="text-blue-600 font-black uppercase text-[10px] tracking-widest mb-8">Serie {tracker.serieActualIndex + 1} de {ejercicioActual.series_totales}</p>

                            <div className="w-full flex gap-4 mt-auto">
                                <div className="flex-1 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block text-center mb-1">Peso</label>
                                    <input type="number" value={pesoInput} onChange={(e) => setPesoInput(e.target.value)} className="w-full text-center text-4xl font-black text-slate-800 bg-transparent outline-none" placeholder="0" />
                                </div>
                                <div className="flex-1 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block text-center mb-1">Reps</label>
                                    <input type="number" value={repsInput} onChange={(e) => setRepsInput(e.target.value)} className="w-full text-center text-4xl font-black text-slate-800 bg-transparent outline-none" placeholder="0" />
                                </div>
                            </div>
                        </div>
                    </div>
                ) : tracker.fase === "descanso" ? (
                    <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 animate-in fade-in duration-500">
                        <Timer size={48} className="text-blue-500 mb-4" />
                        <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-2">Descanso</h2>
                        <span className="text-9xl font-black text-slate-900 tracking-tighter">{tiempoRestante}</span>
                    </div>
                ) : (
                    // --- PANTALLA DE ÉXITO FINAL ---
                    <div className="flex-1 flex flex-col items-center justify-center px-10 animate-in zoom-in-95 duration-500">
                        <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center mb-6 shadow-xl shadow-blue-500/20 animate-bounce">
                            <Trophy size={48} className="text-white" />
                        </div>
                        <h2 className="text-4xl font-black text-slate-900 text-center uppercase tracking-tighter leading-none mb-4 italic">¡Rutina<br />Completada!</h2>
                        <p className="text-slate-400 text-center text-sm font-medium leading-relaxed">Has terminado todos los ejercicios. Tus resultados están listos para guardarse.</p>
                    </div>
                )}
            </div>

            <div className="px-6 py-6 pb-10 bg-white">
                {tracker.fase === "ejecucion" ? (
                    <button onClick={completarSerie} disabled={!repsInput && !pesoInput} className="w-full h-16 bg-blue-600 disabled:bg-slate-100 text-white disabled:text-slate-300 font-black text-sm uppercase tracking-widest rounded-2xl active:scale-[0.98] transition-all">
                        Siguiente Serie
                    </button>
                ) : tracker.fase === "descanso" ? (
                    <button onClick={avanzarSiguientePaso} className="w-full h-16 bg-slate-900 text-white font-black text-sm uppercase tracking-widest rounded-2xl active:scale-[0.98] transition-all">
                        Omitir Descanso
                    </button>
                ) : (
                    <button onClick={finalizarRutinaYEnviar} className="w-full h-16 bg-blue-600 text-white font-black text-sm uppercase tracking-widest rounded-2xl active:scale-[0.98] transition-all shadow-lg shadow-blue-500/30">
                        Guardar y Salir
                    </button>
                )}
            </div>

            {/* MODAL CANCELAR */}
            {mostrarModalCancelar && (
                <div className="fixed inset-0 bg-slate-900/60 z-[200] flex items-center justify-center p-6 animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-sm rounded-[2rem] p-8 shadow-2xl animate-in zoom-in-95">
                        <h3 className="text-2xl font-black text-slate-900 mb-2 uppercase tracking-tighter italic">¿Cancelar?</h3>
                        <p className="text-slate-500 text-sm mb-8 font-medium">Se perderá el progreso de esta rutina.</p>
                        <div className="flex flex-col gap-3">
                            <button onClick={cancelarRutina} className="w-full h-14 bg-red-50 text-red-600 font-bold uppercase tracking-widest rounded-2xl text-xs">Sí, cancelar</button>
                            <button onClick={() => setMostrarModalCancelar(false)} className="w-full h-14 bg-slate-100 text-slate-900 font-bold uppercase tracking-widest rounded-2xl text-xs">Volver</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export { StepperEntrenamiento };