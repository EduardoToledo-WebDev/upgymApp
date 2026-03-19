import { ArrowLeft } from "lucide-react";
import { useEffect } from "react";
import { App } from "@capacitor/app";

const NuevaRutina = ({ setRutinaView, rutinaView }) => {
    useEffect(() => {
        let listener;

        const setupBackButton = async () => {
            // Solo escuchamos el evento si el modal está abierto
            if (rutinaView) {
                listener = await App.addListener('backButton', () => {
                    // Cerramos el modal cuando el usuario hace el gesto de atrás
                    setRutinaView(false);
                });
            }
        };

        setupBackButton();

        // Limpieza: Removemos el listener cuando el modal se cierra 
        // o el componente se desmonta para evitar comportamientos extraños
        return () => {
            if (listener) {
                listener.remove();
            }
        };
    }, [rutinaView, setRutinaView]);
    return (
        <div
            className={`fixed inset-0 bg-white z-50 flex flex-col transform transition-transform duration-300 ease-in-out ${rutinaView ? "translate-x-0" : "translate-x-full"
                }`}
        >
            {/* Header */}
            <div className="flex items-center justify-between px-4 h-20 border-b border-gray-100">

                {/* Lado Izquierdo: Botón Volver */}
                <div className="w-1/4">
                    <button
                        onClick={() => setRutinaView(false)}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <ArrowLeft size={28} className="text-gray-800" />
                    </button>
                </div>

                {/* Centro: Título */}
                <div className="w-2/4 text-center">
                    <h1 className="font-bold text-lg text-gray-900">Nueva Rutina</h1>
                </div>

                {/* Lado Derecho: Acción */}
                <div className="w-1/4 text-right">
                    <button
                        className="text-blue-600 font-semibold hover:text-blue-800 transition-colors"
                    >
                        Guardar
                    </button>
                </div>

            </div>

            {/* Contenido */}
            <div className="flex-1 p-6 overflow-y-auto">
                <form action="">
                    <input type="text" name="nombre" id="nombre" placeholder="Nombre de la rutina" className="w-full p-2 border border-gray-300 rounded-md" required />
                </form>
                <label htmlFor="buscar" className="block mt-5 mb-2">Buscar Ejercicios:</label>
                <input type="search" placeholder="Buscar" className="w-full p-2 border border-gray-300 rounded-md" />
            </div>
        </div>
    );
};

export { NuevaRutina };