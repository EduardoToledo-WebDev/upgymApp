import { FaCrown, FaAward, FaMedal } from "react-icons/fa";
import { FaFireFlameCurved } from "react-icons/fa6";
import { useEffect, useContext, useState } from 'react';
import { Preferences } from '@capacitor/preferences';
import { imagenes } from '../components/Imagenes/index.jsx';
import { AppContext } from "../context/AppContext";

function Puntaje() {
    // 🔴 Loading local para matar el parpadeo de pantalla
    const [loadingLocal, setLoadingLocal] = useState(true);
    const { clasificacionData, setClasificacionData } = useContext(AppContext);
    const API_URL = import.meta.env.VITE_API_URL;
    const imagenesUsuarios = imagenes(clasificacionData?.length || 10);

    const ObtenerTop = async () => {
        const { value: tokenGuardado } = await Preferences.get({ key: 'token' });
        try {
            const response = await fetch(`http://${API_URL}/clasificacion`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${tokenGuardado}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                setClasificacionData(data.user);
            }
        } catch (error) {
            console.error("Error en ranking:", error);
        } finally {
            setLoadingLocal(false);
        }
    };

    useEffect(() => {
        ObtenerTop();
    }, []);

    if (loadingLocal && !clasificacionData) {
        return (
            <div className="flex items-center justify-center h-full pt-20">
                <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="flex flex-col w-full min-h-screen bg-slate-50 pb-24">
            {/* HEADER */}
            <div className="px-6 pt-10 pb-4">
                <h1 className="text-3xl font-black  text-slate-900  ">Clasificación</h1>
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em]">Los más constantes</p>
            </div>

            {/* 🔴 PODIO MODERNO (Diseño de 3 columnas) */}
            <div className="px-6 flex justify-center items-end gap-3 mt-6 mb-12">

                {/* TOP 2 */}
                <div className="flex flex-col items-center flex-1">
                    <div className="relative mb-3">
                        <img
                            src={imagenesUsuarios[1]}
                            className="w-16 h-16 rounded-[1.5rem] object-cover border-4 border-white shadow-xl bg-slate-200"
                            alt="2"
                        />
                        <div className="absolute -bottom-2 -right-2 bg-slate-400 text-white w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black shadow-lg ring-2 ring-white">2</div>
                    </div>
                    <p className="text-[10px] font-black uppercase text-slate-400 truncate w-20 text-center mb-1">{clasificacionData[1]?.nombre}</p>
                    <div className="flex items-center gap-1 text-slate-600 font-black text-sm">
                        <FaFireFlameCurved size={12} />
                        {clasificacionData[1]?.racha_act}
                    </div>
                </div>

                {/* TOP 1 - EL REY */}
                <div className="flex flex-col items-center flex-1.2 relative">
                    {/* Corona flotante */}
                    <FaCrown size={24} className="text-orange-500 absolute -top-8 animate-bounce" />

                    <div className="relative mb-4">
                        <img
                            src={imagenesUsuarios[0]}
                            className="w-24 h-24 rounded-[2rem] object-cover border-[6px] border-white shadow-2xl ring-4 ring-orange-500/10 bg-slate-200"
                            alt="1"
                        />
                        <div className="absolute -bottom-2 -right-2 bg-gradient-to-br from-blue-600 to-indigo-700 text-white w-9 h-9 rounded-full flex items-center justify-center text-xs font-black shadow-xl ring-4 ring-white">1</div>
                    </div>
                    <p className="text-xs font-black uppercase text-slate-900 truncate w-24 text-center mb-1">{clasificacionData[0]?.nombre}</p>
                    <div className="bg-orange-500 text-white px-4 py-1.5 rounded-full flex items-center gap-2 text-xs font-black shadow-lg shadow-orange-500/20">
                        <FaAward size={14} />
                        {clasificacionData[0]?.racha_act}
                    </div>
                </div>

                {/* TOP 3 */}
                <div className="flex flex-col items-center flex-1">
                    <div className="relative mb-3">
                        <img
                            src={imagenesUsuarios[2]}
                            className="w-16 h-16 rounded-[1.5rem] object-cover border-4 border-white shadow-xl bg-slate-200"
                            alt="3"
                        />
                        <div className="absolute -bottom-2 -right-2 bg-orange-400 text-white w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black shadow-lg ring-2 ring-white">3</div>
                    </div>
                    <p className="text-[10px] font-black uppercase text-slate-400 truncate w-20 text-center mb-1">{clasificacionData[2]?.nombre}</p>
                    <div className="flex items-center gap-1 text-slate-600 font-black text-sm">
                        <FaFireFlameCurved size={12} />
                        {clasificacionData[2]?.racha_act}
                    </div>
                </div>
            </div>

            {/* 🔴 LISTA DE RANKING (Cards Estilizadas) */}
            <div className="px-6 flex flex-col gap-3">
                <div className="flex justify-between items-center px-4 mb-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Atleta</span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Racha</span>
                </div>

                {clasificacionData.slice(3, 15).map((user, index) => (
                    <div
                        key={index}
                        className="bg-white rounded-[1.5rem] p-4 flex items-center gap-4 border border-slate-100 shadow-sm active:scale-[0.98] transition-all"
                    >
                        {/* Posición con estilo minimalista */}
                        <span className="text-xs font-black text-slate-300 w-5">#{index + 4}</span>

                        {/* Avatar con borde suave */}
                        <div className="relative">
                            <img
                                src={imagenesUsuarios[index + 3]}
                                className="w-12 h-12 rounded-2xl object-cover bg-slate-50 border border-slate-100"
                                alt="user"
                            />
                            {user.activo === 1 && (
                                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                            )}
                        </div>

                        {/* Nombre y Email */}
                        <div className="flex flex-col flex-1 min-w-0">
                            <p className="text-sm font-black text-slate-800 uppercase tracking-tight truncate">
                                {user.nombre}
                            </p>

                        </div>

                        {/* Valor de racha */}
                        <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-2xl">
                            <span className="text-sm font-black text-slate-700">{user.racha_act}</span>
                            <FaFireFlameCurved className="text-orange-500" size={14} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Puntaje;