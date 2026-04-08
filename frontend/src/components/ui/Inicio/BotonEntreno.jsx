import { FaDumbbell, FaLocationDot, FaCircleStop } from "react-icons/fa6";
import { useContext } from "react";
import { AppContext } from "../../../context/AppContext";
import { Preferences } from '@capacitor/preferences';
import { LocalNotifications } from '@capacitor/local-notifications';

function BotonEntreno() {
    const {
        userData, setUserData, validacionUbicacion, setGimnasio, gimnasio,
        segundos, setSegundos, idCheckinActual, setIdCheckinActual,
        setSesionActiva, setRutinaEmpezada, setMostrarCheckin
    } = useContext(AppContext);

    const API_URL = import.meta.env.VITE_API_URL;
    const mins = Math.floor(segundos / 60);
    const segs = String(segundos % 60).padStart(2, '0');

    const finalizarRutina = async () => {
        const { value: token } = await Preferences.get({ key: 'token' });
        try {
            const resp = await fetch(`http://${API_URL}/checkin/terminar`, {
                method: "PUT",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify({ id_checkin: idCheckinActual, duracion_minutos: Math.max(1, mins) }),
            });
            if (resp.ok) {
                await LocalNotifications.cancel({ notifications: [{ id: 1 }] });
                await Preferences.remove({ key: 'active_session' });
                setUserData(prev => ({ ...prev, racha_act: (prev.racha_act || 0) + 1, estado_racha: 'Activa' }));
                setSesionActiva(false); setRutinaEmpezada(false); setGimnasio(null); setSegundos(0); setMostrarCheckin(true);
            }
        } catch (e) { console.error(e); }
    };

    const getStatusColor = () => {
        if (validacionUbicacion === null) return "from-slate-700 to-slate-800";
        return validacionUbicacion ? "from-blue-600 to-indigo-700" : "from-red-500 to-red-600";
    };

    return (
        /* 🔴 MARGEN IGUAL AL DE RACHACARD */
        <div className="px-6 mt-6 w-full">
            <div className={`w-full bg-gradient-to-br ${getStatusColor()} rounded-[2.5rem] p-7 text-white shadow-xl relative overflow-hidden transition-all duration-500`}>

                {/* HEADER: Nombre y GPS */}
                <div className="flex justify-between items-start mb-10">
                    <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Entrenando en</span>
                        <h2 className="text-xl font-black italic uppercase tracking-tight leading-none">
                            {gimnasio?.nombre || "Cargando..."}
                        </h2>
                    </div>
                    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider backdrop-blur-md border border-white/10 ${validacionUbicacion ? 'bg-green-500/20' : 'bg-white/10'}`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${validacionUbicacion ? 'bg-green-400 animate-pulse' : 'bg-white/40'}`}></div>
                        {validacionUbicacion ? "En rango" : "Buscando"}
                    </div>
                </div>

                {/* CONTADOR CENTRAL: Ahora con mucho más aire */}
                <div className="flex flex-col items-center mb-10">
                    <p className="text-6xl font-mono font-black tracking-tighter drop-shadow-lg">
                        {mins}<span className="opacity-40">:</span>{segs}
                    </p>
                    <div className="flex items-center gap-2 mt-2 opacity-60">
                        <FaDumbbell size={12} />
                        <span className="text-[10px] font-bold uppercase tracking-[0.3em]">Tiempo Total</span>
                    </div>
                </div>

                {/* BOTÓN: Integrado pero con su propio nivel visual */}
                <button
                    onClick={finalizarRutina}
                    className="w-full bg-white text-slate-900 h-16 rounded-[1.5rem] flex items-center justify-center gap-3 font-black text-xs uppercase tracking-[0.2em] shadow-lg active:scale-[0.97] transition-all"
                >
                    <FaCircleStop className="text-red-500" size={18} />
                    Finalizar Sesión
                </button>

                {/* Decoración sutil de fondo para que no se vea vacío */}
                <div className="absolute -right-4 -bottom-4 opacity-10">
                    <FaDumbbell size={120} />
                </div>
            </div>
        </div>
    );
}

export { BotonEntreno };