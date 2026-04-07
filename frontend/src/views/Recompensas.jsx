import { TrendingUp } from 'lucide-react'
import { useState, useEffect } from 'react'
import { Preferences } from '@capacitor/preferences';

const Recompensas = () => {
    const API_URL = import.meta.env.VITE_API_URL;
    const [premios, setPremios] = useState([]);
    const [chipActiva, setChipActiva] = useState('todos');

    useEffect(() => {
        ObtenerPremios();
    }, []);

    const ObtenerPremios = async () => {
        const { value: tokenGuardado } = await Preferences.get({ key: 'token' });

        fetch(`http://${API_URL}/catalogo-premios`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${tokenGuardado}`
            }
        })
            .then(async response => {
                if (response.ok) {
                    const data = await response.json();
                    setPremios(data.premios);
                } else {
                    setPremios([]);
                }
            })
            .catch(error => {
                console.error("Error obteniendo premios:", error);
                setPremios([]);
            });
    };

    return (
        <div className="bg-gray-50 min-h-screen pb-24">
            <h1 className="font-bold text-3xl text-gray-900 pt-4 mx-5">Recompensas</h1>

            <div className="flex bg-slate-900 mx-5 mt-5 flex-col h-auto w-auto p-5 rounded-3xl shadow-lg">
                <p className="text-gray-300 text-sm">TUS PUNTOS
                    <br />
                    <span className="text-white font-bold text-5xl">100 <span className="text-orange-500 text-xl">PTS</span></span>
                </p>
                <p className="flex items-center gap-2 text-gray-300 text-sm mt-5">
                    <span className="text-green-500"><TrendingUp size={18} /></span> Ganaste +100 esta semana
                </p>
            </div>

            <div className='flex mx-5 gap-3 w-auto mt-8 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden pb-2'>
                <div onClick={() => setChipActiva('todos')} className={`p-2 rounded-full px-5 flex justify-center items-center font-semibold transition-colors cursor-pointer ${chipActiva === 'todos' ? 'bg-orange-500 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200'}`}>Todas</div>
                <div onClick={() => setChipActiva('descuentos')} className={`p-2 rounded-full px-5 flex justify-center items-center font-semibold transition-colors cursor-pointer ${chipActiva === 'descuentos' ? 'bg-orange-500 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200'}`}>Descuentos</div>
                <div onClick={() => setChipActiva('suplementos')} className={`p-2 rounded-full px-5 flex justify-center items-center font-semibold transition-colors cursor-pointer ${chipActiva === 'suplementos' ? 'bg-orange-500 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200'}`}>Suplementos</div>
                <div onClick={() => setChipActiva('ropa')} className={`p-2 rounded-full px-5 flex justify-center items-center font-semibold transition-colors cursor-pointer ${chipActiva === 'ropa' ? 'bg-orange-500 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200'}`}>Ropa</div>
            </div>

            <div className='flex flex-col w-auto mx-5 mt-6 gap-6'>
                {premios
                    // 🔴 FIX: Convertimos a minúsculas por si en BD dice "Ropa" en vez de "ropa"
                    .filter(premio => chipActiva === 'todos' || (premio.categoria && premio.categoria.toLowerCase() === chipActiva))
                    // 🔴 FIX: Cambié la variable iteradora a 'premio' (singular) para no confundir a React
                    .map(premio => (
                        // 🔴 FIX: Usamos premio.id_premio
                        <div key={premio.id_premio} className='flex flex-col w-full rounded-3xl border border-gray-200 bg-white overflow-hidden shadow-sm'>

                            {/* CONTENEDOR DE IMAGEN Y BADGES (Forma correcta de posicionar elementos) */}
                            <div className="relative w-full h-48 bg-gray-200">
                                {/* 🔴 FIX: La ruta correcta que armamos en Express es /premios/ */}
                                <img
                                    className='w-full h-full object-cover'
                                    src={`http://${API_URL}/premios/${premio.img_path}`}
                                    alt={premio.nombre}
                                />

                                {/* Badge de Categoría (Arriba Izquierda) */}
                                <span className='absolute top-3 left-3 bg-blue-500/90 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-full capitalize shadow-md'>
                                    {premio.categoria}
                                </span>

                                {/* Badge de Precio (Abajo Derecha) */}
                                {/* 🔴 FIX: Usamos premio.costo en vez de premio.precio */}
                                <div className='absolute bottom-3 right-3 bg-white/95 backdrop-blur-sm text-orange-500 text-lg font-black px-4 py-1.5 rounded-full shadow-lg flex items-center gap-1'>
                                    {premio.costo} <span className='text-gray-400 text-[10px] uppercase tracking-wider mt-1'>PTS</span>
                                </div>
                            </div>

                            {/* INFORMACIÓN Y BOTÓN */}
                            <div className="p-5 flex flex-col gap-2">
                                {/* 🔴 FIX: Usamos premio.nombre */}
                                <h2 className='text-gray-900 font-bold text-xl leading-tight'>{premio.nombre}</h2>
                                <p className='text-gray-500 text-sm leading-relaxed'>{premio.descripcion}</p>

                                <button className='w-full text-center flex justify-center items-center bg-slate-900 active:bg-slate-800 transition-colors text-white font-bold text-lg rounded-xl px-5 py-3.5 mt-4 shadow-md'>
                                    Canjear Recompensa
                                </button>
                            </div>
                        </div>
                    ))
                }

                {/* Estado vacío por si no hay premios en esa categoría */}
                {premios.filter(premio => chipActiva === 'todos' || (premio.categoria && premio.categoria.toLowerCase() === chipActiva)).length === 0 && (
                    <div className="text-center text-gray-400 mt-10">
                        <p>No hay recompensas en esta categoría por ahora.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Recompensas;