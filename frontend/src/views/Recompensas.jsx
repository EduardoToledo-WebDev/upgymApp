import { TrendingUp, ArrowRight, Ticket, X, CheckCircle2 } from 'lucide-react';
import { useState, useEffect, useContext } from 'react';
import { Preferences } from '@capacitor/preferences';
import { AppContext } from '../context/AppContext';
import { toast, Toaster } from 'sonner';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

const Recompensas = () => {
    const API_URL = import.meta.env.VITE_API_URL;

    // 1. Contexto para los puntos reales
    const { userData, setUserData } = useContext(AppContext);

    const [premios, setPremios] = useState([]);
    const [chipActiva, setChipActiva] = useState('todos');

    // 2. Estados para el canje y tickets
    const [modalCanjeVisible, setModalCanjeVisible] = useState(false);
    const [premioSeleccionado, setPremioSeleccionado] = useState(null);
    const [misRecompensasVisible, setMisRecompensasVisible] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [misPremiosReclamados, setMisPremiosReclamados] = useState([]);

    // 🔴 UN SOLO useEffect: Carga todo al abrir la pantalla por primera vez
    useEffect(() => {
        ObtenerPremios();
        CargarMisRecompensas();
    }, []);

    const CargarMisRecompensas = async () => {
        const { value: token } = await Preferences.get({ key: 'token' });
        try {
            // Se respeta tu ruta original
            const res = await fetch(`http://${API_URL}/recompensas/mis-premios`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.valid) {
                setMisPremiosReclamados(data.reclamos);
            }
        } catch (error) {
            console.error("Error cargando historial:", error);
        }
    };

    const ObtenerPremios = async () => {
        const { value: tokenGuardado } = await Preferences.get({ key: 'token' });

        try {
            const response = await fetch(`http://${API_URL}/catalogo-premios`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${tokenGuardado}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setPremios(data.premios);
            } else {
                setPremios([]);
            }
        } catch (error) {
            console.error("Error obteniendo premios:", error);
            setPremios([]);
        }
    };

    // --- FUNCIONES PARA EL CANJE ---
    const abrirModalCanje = (premio) => {
        setPremioSeleccionado(premio);
        setModalCanjeVisible(true);
        Haptics.impact({ style: ImpactStyle.Light });
    };

    const procesarCanje = async () => {
        setIsSubmitting(true);
        try {
            const { value: token } = await Preferences.get({ key: 'token' });

            const res = await fetch(`http://${API_URL}/recompensas/canjear`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ id_premio: premioSeleccionado.id_premio })
            });

            const data = await res.json();

            if (res.ok && data.valid) {
                // Éxito: Trigger y Procedure lo aprobaron
                Haptics.notification({ type: "SUCCESS" });
                toast.success("¡Premio canjeado! 🎉", { description: "Ve a 'Mis Recompensas'." });

                // Descontar puntos visualmente en milisegundos
                setUserData(prev => ({ ...prev, puntos: (prev.puntos || 0) - premioSeleccionado.costo }));

                // Guardar el ticket nuevo localmente para no recargar de la BD
                setMisPremiosReclamados(prev => [{
                    id_reclamo: Date.now(),
                    nombre: premioSeleccionado.nombre,
                    codigo_canje: data.codigo_canje,
                    estado: data.estado
                }, ...prev]);

                setModalCanjeVisible(false);
            } else {
                // Error: Trigger lo rebotó (sin saldo/stock)
                Haptics.notification({ type: "ERROR" });
                toast.error("No se pudo canjear", { description: data.message });
                setModalCanjeVisible(false);
            }
        } catch (error) {
            console.error("Error de red:", error);
            toast.error("Error de conexión");
        } finally {
            setIsSubmitting(false);
            setPremioSeleccionado(null);
        }
    };

    return (
        <div className="bg-gray-50 min-h-screen pb-24 relative overflow-hidden">
            <Toaster position="bottom-center" richColors closeButton />

            <h1 className="font-bold text-3xl text-gray-900 pt-4 mx-5">Recompensas</h1>

            {/* PUNTOS REALES */}
            <div className="flex bg-slate-900 mx-5 mt-5 flex-col h-auto w-auto p-5 rounded-3xl shadow-lg">
                <p className="text-gray-300 text-sm">TUS PUNTOS
                    <br />
                    <span className="text-white font-bold text-5xl">
                        {userData?.puntos || 0} <span className="text-orange-500 text-xl">PTS</span>
                    </span>
                </p>
                <p className="flex items-center gap-2 text-gray-300 text-sm mt-5">
                    <span className="text-green-500"><TrendingUp size={18} /></span> Ganaste +100 esta semana
                </p>
            </div>

            {/* BOTÓN MIS RECOMPENSAS */}
            <div
                onClick={() => setMisRecompensasVisible(true)}
                className='bg-slate-900 mx-5 mt-5 flex justify-between items-center text-white rounded-2xl shadow-lg p-5 cursor-pointer active:scale-[0.98] transition-transform'
            >
                <h1 className="font-bold text-2xl mx-5">Mis Recompensas</h1>
                <ArrowRight className='text-orange-500 mr-5' size={24} />
            </div>

            <div className='flex mx-5 gap-3 w-auto mt-8 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden pb-2'>
                <div onClick={() => setChipActiva('todos')} className={`p-2 rounded-full px-5 flex justify-center items-center font-semibold transition-colors cursor-pointer shrink-0 ${chipActiva === 'todos' ? 'bg-orange-500 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200'}`}>Todas</div>
                <div onClick={() => setChipActiva('descuentos')} className={`p-2 rounded-full px-5 flex justify-center items-center font-semibold transition-colors cursor-pointer shrink-0 ${chipActiva === 'descuentos' ? 'bg-orange-500 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200'}`}>Descuentos</div>
                <div onClick={() => setChipActiva('suplementos')} className={`p-2 rounded-full px-5 flex justify-center items-center font-semibold transition-colors cursor-pointer shrink-0 ${chipActiva === 'suplementos' ? 'bg-orange-500 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200'}`}>Suplementos</div>
                <div onClick={() => setChipActiva('ropa')} className={`p-2 rounded-full px-5 flex justify-center items-center font-semibold transition-colors cursor-pointer shrink-0 ${chipActiva === 'ropa' ? 'bg-orange-500 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200'}`}>Ropa</div>
            </div>

            <div className='flex flex-col w-auto mx-5 mt-6 gap-6'>
                {premios
                    .filter(premio => chipActiva === 'todos' || (premio.categoria && premio.categoria.toLowerCase() === chipActiva))
                    .map(premio => (
                        <div key={premio.id_premio} className='flex flex-col w-full rounded-3xl border border-gray-200 bg-white overflow-hidden shadow-sm'>
                            <div className="relative w-full h-48 bg-gray-200">
                                <img
                                    className='w-full h-full object-cover'
                                    src={`http://${API_URL}/premios/${premio.img_path}`}
                                    alt={premio.nombre}
                                />
                                <span className='absolute top-3 left-3 bg-blue-500/90 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-full capitalize shadow-md'>
                                    {premio.categoria}
                                </span>
                                <div className='absolute bottom-3 right-3 bg-white/95 backdrop-blur-sm text-orange-500 text-lg font-black px-4 py-1.5 rounded-full shadow-lg flex items-center gap-1'>
                                    {premio.costo} <span className='text-gray-400 text-[10px] uppercase tracking-wider mt-1'>PTS</span>
                                </div>
                            </div>

                            <div className="p-5 flex flex-col gap-2">
                                <h2 className='text-gray-900 font-bold text-xl leading-tight'>{premio.nombre}</h2>
                                <p className='text-gray-500 text-sm leading-relaxed'>{premio.descripcion}</p>

                                <button
                                    onClick={() => abrirModalCanje(premio)}
                                    className='w-full text-center flex justify-center items-center bg-slate-900 active:bg-slate-800 transition-colors text-white font-bold text-lg rounded-xl px-5 py-3.5 mt-4 shadow-md'
                                >
                                    Canjear Recompensa
                                </button>
                            </div>
                        </div>
                    ))
                }

                {premios.filter(premio => chipActiva === 'todos' || (premio.categoria && premio.categoria.toLowerCase() === chipActiva)).length === 0 && (
                    <div className="text-center text-gray-400 mt-10">
                        <p>No hay recompensas en esta categoría por ahora.</p>
                    </div>
                )}
            </div>

            {/* ================= MODALES ================= */}
            {modalCanjeVisible && (
                <div className="fixed inset-0 bg-slate-900/60 z-[100] flex items-center justify-center p-6 animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-sm rounded-[2rem] p-8 shadow-2xl animate-in zoom-in-95">
                        <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mb-6">
                            <Ticket className="text-orange-500" size={32} />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">¿Canjear premio?</h3>
                        <p className="text-gray-500 text-sm mb-8">
                            Se descontarán <span className="font-bold text-gray-900">{premioSeleccionado?.costo} puntos</span> de tu cuenta por: <br /><b>{premioSeleccionado?.nombre}</b>.
                        </p>
                        <div className="flex flex-col gap-3">
                            <button
                                onClick={procesarCanje}
                                disabled={isSubmitting}
                                className="w-full bg-orange-500 text-white font-bold py-4 rounded-2xl active:scale-[0.98] disabled:opacity-50"
                            >
                                {isSubmitting ? "Procesando..." : "Sí, canjear ahora"}
                            </button>
                            <button
                                onClick={() => setModalCanjeVisible(false)}
                                disabled={isSubmitting}
                                className="w-full bg-gray-100 text-gray-900 font-bold py-4 rounded-2xl active:bg-gray-200"
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ================= VISTA MIS RECOMPENSAS ================= */}
            <div className={`fixed inset-0 bg-gray-50 z-[200] flex flex-col transform transition-transform duration-300 ease-in-out ${misRecompensasVisible ? "translate-y-0" : "translate-y-full"}`}>
                <div className="bg-white px-6 pt-12 pb-4 shadow-sm flex items-center justify-between shrink-0">
                    <h2 className="text-2xl font-bold text-gray-900">Tus Códigos</h2>
                    <button onClick={() => setMisRecompensasVisible(false)} className="p-2 bg-gray-100 rounded-full text-gray-500 active:bg-gray-200">
                        <X size={24} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    {misPremiosReclamados.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400 opacity-60 pt-20">
                            <Ticket size={64} className="mb-4" />
                            <p>Aún no has reclamado ningún premio.</p>
                        </div>
                    ) : (
                        misPremiosReclamados.map(reclamo => (
                            <div key={reclamo.id_reclamo} className="bg-white rounded-[2rem] border border-gray-200 shadow-sm p-6 mb-4 relative overflow-hidden">
                                <div className="absolute top-1/2 -left-3 w-6 h-6 bg-gray-50 rounded-full transform -translate-y-1/2 border-r border-gray-200"></div>
                                <div className="absolute top-1/2 -right-3 w-6 h-6 bg-gray-50 rounded-full transform -translate-y-1/2 border-l border-gray-200"></div>

                                <div className="flex justify-between items-start mb-4 border-b border-dashed border-gray-200 pb-4">
                                    <div>
                                        <h4 className="font-bold text-gray-900 text-lg">{reclamo.nombre}</h4>
                                        <span className="text-xs text-orange-500 font-bold uppercase tracking-widest">{reclamo.estado}</span>
                                    </div>
                                    <CheckCircle2 className="text-green-500" />
                                </div>

                                <div className="text-center pt-2">
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Código en recepción</span>
                                    <span className="text-3xl font-mono font-bold text-gray-900 tracking-widest bg-gray-100 py-2 px-4 rounded-xl inline-block">
                                        {reclamo.codigo_canje}
                                    </span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default Recompensas;