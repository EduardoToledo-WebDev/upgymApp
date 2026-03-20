import { useState } from "react"; // Necesario para la advertencia
import { useNavigate } from "react-router-dom";
import { ChevronRight, HelpCircle, Mail, Star, Users, Info, ArrowLeft, Bell, LogOut, AlertCircle } from "lucide-react";

const Configuracion = ({ mostrar, setMostrar }) => {
    const navigate = useNavigate();
    const [mostrarAlerta, setMostrarAlerta] = useState(false); // Estado para la advertencia

    // --- Función Final de Cierre ---
    const confirmarCerrarSesion = () => {
        localStorage.removeItem("token"); // O el método que uses
        localStorage.removeItem("user");
        setMostrarAlerta(false);
        setMostrar(false); // Cierra el panel de ajustes
        navigate("/login"); // Te regresa al login
    };

    const opcionesAyuda = [
        { icono: <HelpCircle size={22} className="text-[#10a5f5]" />, texto: "Preguntas frecuentes", bgColor: "bg-[#e6f6ff]" },
        { icono: <Mail size={22} className="text-[#2ecc71]" />, texto: "Ponte en contacto con nosotros", bgColor: "bg-[#e8f9ef]" },
        { icono: <Star size={22} className="text-[#ff8a00]" />, texto: "Escribir Reseña", bgColor: "bg-[#fff4e6]" },
        { icono: <Users size={22} className="text-[#9b51e0]" />, texto: "Conviértete en afiliado", bgColor: "bg-[#f5eeff]" },
        { icono: <Info size={22} className="text-[#eb4335]" />, texto: "Acerca de Upgym", bgColor: "bg-[#fdecea]" },
    ];

    return (
        <>
            <div className={`fixed inset-0 h-full z-50 w-full bg-[#f8f9fb] flex flex-col transition-transform duration-300 ${mostrar ? "translate-x-0" : "translate-x-full"}`}>

                {/* Header */}
                <div className="flex items-center p-4 bg-white border-b border-gray-100">
                    <button onClick={() => setMostrar(false)} className="text-gray-600 p-2"><ArrowLeft size={24} /></button>
                    <h1 className="text-xl font-bold flex-1 text-center mr-10 text-[#2d3436]">Ajustes</h1>
                </div>

                <div className="p-4 overflow-y-auto">
                    {/* Sección Notificaciones */}
                    <div className="bg-white rounded-[30px] p-5 mb-8 shadow-sm flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="bg-[#fff4e6] p-3 rounded-full"><Bell size={24} className="text-[#d35400]" /></div>
                            <div>
                                <h3 className="font-bold text-[#2d3436] text-lg">Notificaciones</h3>
                                <p className="text-gray-400 text-sm">Alertas y recordatorios</p>
                            </div>
                        </div>
                        <ChevronRight size={20} className="text-gray-300" />
                    </div>

                    <h2 className="text-gray-400 text-xs font-bold mb-4 uppercase tracking-wider ml-2">Ayuda</h2>

                    {/* Lista de Opciones */}
                    <div className="bg-white rounded-[30px] shadow-sm border border-gray-50 overflow-hidden mb-10">
                        {opcionesAyuda.map((item, index) => (
                            <div key={index} className="flex items-center justify-between p-5 border-b border-gray-50 last:border-none active:bg-gray-50">
                                <div className="flex items-center gap-4">
                                    <div className={`${item.bgColor} p-3 rounded-full`}>{item.icono}</div>
                                    <span className="font-bold text-[#34495e] text-[17px]">{item.texto}</span>
                                </div>
                                <ChevronRight size={22} className="text-gray-300" />
                            </div>
                        ))}
                    </div>

                    {/* BOTÓN CERRAR SESIÓN (Dispara la advertencia) */}
                    <div className="flex justify-center mb-10">
                        <button
                            onClick={() => setMostrarAlerta(true)}
                            className="flex items-center justify-center gap-3 px-10 py-4 bg-[#fcecef] text-[#b32b39] font-bold text-lg rounded-full active:scale-95 transition-all"
                        >
                            <LogOut size={22} strokeWidth={2.5} />
                            <span>Cerrar Sesión</span>
                        </button>
                    </div>
                </div>
            </div>
            {/* --- MODAL DE ADVERTENCIA PREMIUM (ESTILO UPGYM PRO) --- */}
            {mostrarAlerta && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-[#2d3436]/40 backdrop-blur-md transition-all duration-300">
                    <div className="bg-white/95 w-full max-w-[340px] rounded-[40px] p-10 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.15)] text-center border border-white relative overflow-hidden">

                        {/* Detalle decorativo Premium: Resplandor naranja sutil al fondo */}
                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#ff8a00]/5 rounded-full blur-3xl"></div>

                        {/* Icono Estilizado */}
                        <div className="flex justify-center mb-8">
                            <div className="w-20 h-20 rounded-full bg-white shadow-[0_10px_25px_rgba(255,138,0,0.15)] flex items-center justify-center border border-orange-50 relative">
                                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#ff8a00] to-[#ffb347] flex items-center justify-center">
                                    <span className="text-white text-4xl font-light italic">!</span>
                                </div>
                            </div>
                        </div>

                        {/* Texto con espaciado elegante */}
                        <h3 className="text-[24px] font-black text-[#2d3436] mb-3 tracking-tight leading-none uppercase">
                            Cerrar Sesión
                        </h3>

                        <p className="text-[#636e72] text-[16px] font-medium leading-relaxed mb-10">
                            Tu racha y progreso de <span className="text-[#ff8a00] font-bold">Upgym</span> están a salvo. ¿Deseas salir?
                        </p>

                        {/* Botones con acabados premium */}
                        <div className="flex flex-col gap-4">
                            {/* Botón Principal: Sombra proyectada y color sólido */}
                            <button
                                onClick={confirmarCerrarSesion}
                                className="w-full py-4 bg-[#2d3436] text-white font-bold text-[17px] rounded-2xl shadow-xl shadow-gray-200 active:scale-95 transition-all duration-300"
                            >
                                Confirmar Salida
                            </button>

                            {/* Botón Secundario: Texto naranja sobre fondo ultra claro */}
                            <button
                                onClick={() => setMostrarAlerta(false)}
                                className="w-full py-4 bg-transparent text-[#ff8a00] font-bold text-[17px] rounded-2xl transition-all duration-300 hover:bg-orange-50/50"
                            >
                                Volver
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Configuracion;