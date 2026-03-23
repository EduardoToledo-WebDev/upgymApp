import { useOutletContext } from "react-router-dom";
import { Plus, FolderOpen, ArrowLeft, Dumbbell } from "lucide-react";
import { useState, useEffect } from "react";
import { NuevaRutina } from "./nuevaRutina/NuevaRutina";
import { Preferences } from "@capacitor/preferences";
const API_URL = import.meta.env.VITE_API_URL;

export default function Entrenar() {
    const [rutinaView, setRutinaView] = useState(false);
    const { userData } = useOutletContext();
    const [rutinas, setRutinas] = useState([]);

    const styles = {
        title: "ml-5 font-bold text-3xl",
        // Botones superiores mejorados visualmente
        topButtons: "mx-5 justify-center gap-2 flex mt-4 font-semibold text-gray-700 bg-white border border-gray-300 h-12 rounded-xl items-center shadow-sm active:bg-gray-50 transition-colors"
    }

    useEffect(() => {
        const obtenerRutinas = async () => {
            try {
                const token = await Preferences.get({ key: 'token' });
                const response = await fetch(`http://${API_URL}/rutinas`, { // Asegúrate de que esta URL coincida con tu backend
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token.value}`
                    }
                });
                const data = await response.json();
                if (data.valid) {
                    setRutinas(data.rutinas);
                }
            } catch (error) {
                console.error("Error al obtener rutinas:", error);
            }
        };
        obtenerRutinas();
    }, [rutinaView]); // 🔴 TRUCO: Al pasar rutinaView aquí, la lista se recarga automáticamente cuando cierras el modal de crear rutina

    return (
        <div className="pantalla-contenido pb-20 bg-gray-50 min-h-screen pt-4">
            <h1 className={styles.title}>Rutinas</h1>

            <button onClick={() => setRutinaView(true)} className={`${styles.topButtons} w-[calc(100%-40px)]`}>
                <Plus size={20} className="text-blue-600" /> Crear rutina nueva
            </button>

            <button className={`${styles.topButtons} w-[calc(100%-40px)]`}>
                <FolderOpen size={20} className="text-gray-500" /> Importar Rutina
            </button>

            <div className="flex items-center justify-between mx-5 mt-8 mb-4">
                <h2 className="font-bold text-lg text-gray-800">Mis Rutinas</h2>
                <span className="bg-gray-200 text-gray-600 text-xs font-bold px-2 py-1 rounded-full">
                    {rutinas.length}
                </span>
            </div>

            {/* LISTA DE RUTINAS ESTILIZADA */}
            <div className="flex flex-col gap-4 px-5">
                {rutinas.map((rutina) => (
                    <div key={rutina.rutina_id} className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm active:bg-gray-50 transition-colors cursor-pointer">

                        {/* Cabecera de la Tarjeta */}
                        <div className="flex justify-between items-start mb-3 gap-2">
                            {/* truncate hace que el texto largo se vuelva "Día de piern..." */}
                            <h3 className="font-bold text-lg text-gray-900 truncate">{rutina.nombre}</h3>
                        </div>

                        {/* Previsualización de Ejercicios */}
                        <div className="flex flex-col gap-1.5">
                            {/* Solo mostramos los primeros 3 para no saturar la UI */}
                            {rutina.ejercicios.slice(0, 3).map((ejercicio) => (
                                <div key={ejercicio.exerciseId} className="flex items-center gap-2 overflow-hidden">
                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0"></div>
                                    <p className="text-sm text-gray-500 truncate capitalize flex-1">
                                        <span className="font-medium text-gray-700 mr-1">{ejercicio.series}x</span>
                                        {ejercicio.name}
                                    </p>
                                </div>
                            ))}

                            {/* Indicador de ejercicios ocultos */}
                            {rutina.ejercicios.length > 3 && (
                                <p className="text-xs text-gray-400 mt-1 font-medium ml-3.5">
                                    + {rutina.ejercicios.length - 3} ejercicios más
                                </p>
                            )}
                        </div>
                    </div>
                ))}

                {rutinas.length === 0 && (
                    <div className="text-center text-gray-400 mt-10 flex flex-col items-center">
                        <Dumbbell size={40} className="mb-2 opacity-50" />
                        <p>Aún no tienes rutinas creadas.</p>
                    </div>
                )}
            </div>

            <NuevaRutina rutinaView={rutinaView} setRutinaView={setRutinaView} />
        </div>
    );
}