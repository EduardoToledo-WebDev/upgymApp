import { Flame } from "lucide-react";
import { AppContext } from "../../../context/AppContext";
import { useContext } from "react";

const RachaCard = () => {
    const { userData } = useContext(AppContext);
    const activa = userData?.estado_racha === "Activa";

    return (
        <div className="px-6 mt-4">
            <div className={`
                ${activa
                    ? "bg-gradient-to-br from-blue-600 via-indigo-600 to-orange-500 shadow-xl shadow-blue-500/20"
                    : "bg-gradient-to-br from-slate-400 to-slate-600"}
                rounded-[2.5rem] p-7 text-white relative overflow-hidden flex flex-col items-center transition-all duration-500`}
            >
                {/* Elementos decorativos para llenar espacio */}
                <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                <div className="absolute -left-4 -top-4 w-24 h-24 bg-blue-400/20 rounded-full blur-xl"></div>

                {/* Badge superior */}
                <div className="bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10 mb-4 flex items-center gap-2">
                    <Flame size={14} color="white" fill={activa ? "white" : "none"} />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Racha Actual</span>
                </div>

                {/* Numero Central */}
                <div className="text-center z-10">
                    <div className="flex items-baseline justify-center gap-2">
                        <h1 className="text-6xl font-black tracking-tighter drop-shadow-md">
                            {userData?.racha_act}
                        </h1>
                        {userData?.racha_act === 1 ? (
                            <span className="text-xl font-bold opacity-80 uppercase italic tracking-tighter">Día</span>
                        ) : (
                            <span className="text-xl font-bold opacity-80 uppercase italic tracking-tighter">Días</span>
                        )}
                    </div>

                    {/* Frase de motivación con más presencia */}
                    <p className="text-xs font-medium opacity-90 mt-2 max-w-[200px] leading-relaxed">
                        {userData?.racha_act === 0
                            ? "¡El mejor momento para empezar es ahora!"
                            : `Tu racha está ${userData?.estado_racha.toLowerCase()}, ¡mantén el fuego encendido!`}
                    </p>
                </div>

                {/* Indicador de "Fuego" en el fondo sutil */}
                <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-10">
                    <Flame size={100} strokeWidth={1} />
                </div>
            </div>
        </div>
    );
};

export { RachaCard };