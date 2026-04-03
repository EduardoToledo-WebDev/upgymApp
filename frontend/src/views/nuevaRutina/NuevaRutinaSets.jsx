import { ArrowLeft, RefreshCw } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
const API_URL = import.meta.env.VITE_API_URL;
import { Preferences } from "@capacitor/preferences";

const deducirObjetivoAutomatico = (ejercicio) => {
    const nombre = (ejercicio.name || "").toLowerCase();
    const musculosText = (ejercicio.targetMuscles || []).join(" ").toLowerCase();
    const equipoText = (ejercicio.equipments || []).join(" ").toLowerCase();
    const bodyPartText = (ejercicio.bodyParts || []).join(" ").toLowerCase();

    const palabrasTiempo = ["plank", "planche", "hold", "wall sit", "static", "isometric", "stretch", "pose", "bridge"];
    if (palabrasTiempo.some(palabra => nombre.includes(palabra))) return { tipo: "Tiempo", valor: "60s" };

    const palabrasCardio = ["cardio", "cardiovascular", "heart", "treadmill", "elliptical", "bike", "cycle", "rower", "ergometer", "skierg", "rope skip", "battle rope", "running", "walking", "jogging", "jumping jack", "burpee", "clisbing", "run", "walk"];
    if (palabrasCardio.some(palabra => nombre.includes(palabra)) || palabrasCardio.some(palabra => equipoText.includes(palabra)) || palabrasCardio.some(palabra => bodyPartText.includes(palabra))) {
        return { tipo: "Tiempo", valor: "15m" };
    }
    return { tipo: "Reps", valor: "10-12" };
};

const NuevaRutinaSets = ({ paso, nombreRutina, ejercicios, volverAtras, cerrarVentana, esEdicion = false, idRutina = null }) => {
    const [configuracion, setConfiguracion] = useState([]);

    useEffect(() => {
        const configsIniciales = ejercicios.map(ej => {
            const objetivoInteligente = deducirObjetivoAutomatico(ej);
            return {
                exerciseId: ej.exerciseId,
                name: ej.name,
                gifUrl: ej.gifUrl,
                series: 4,
                tipoObjetivo: objetivoInteligente.tipo,
                valorObjetivo: objetivoInteligente.valor,
                descanso: 90
            };
        });
        setConfiguracion(configsIniciales);
    }, [ejercicios]);

    const actualizarCampo = (exerciseId, campo, valor) => {
        setConfiguracion(prev => prev.map(item =>
            item.exerciseId === exerciseId ? { ...item, [campo]: valor } : item
        ));
    };

    // 🔴 NUEVA FUNCIÓN: Valida y actualiza el campo Series
    const manejarCambioSeries = (exerciseId, valorIngresado) => {
        // MODO ESTRICTO: Solo números. Cero letras o símbolos.
        const valorFiltrado = valorIngresado.replace(/[^0-9]/g, '');
        // Límite razonable: Máximo 2 dígitos (ej. 99 series), nadie hace más que eso.
        actualizarCampo(exerciseId, 'series', valorFiltrado.slice(0, 2));
    };

    // 🔴 NUEVA FUNCIÓN: Valida y actualiza el campo Descanso
    const manejarCambioDescanso = (exerciseId, valorIngresado) => {
        // MODO ESTRICTO: Solo números.
        const valorFiltrado = valorIngresado.replace(/[^0-9]/g, '');
        // Límite: Máximo 4 dígitos (ej. 9999s = ~2.7 horas).
        actualizarCampo(exerciseId, 'descanso', valorFiltrado.slice(0, 4));
    };

    // 🔴 FUNCIÓN ACTUALIZADA: Filtro estricto para el objetivo central
    const manejarCambioObjetivo = (exerciseId, tipoObjetivo, valorIngresado) => {
        let valorFiltrado = valorIngresado;
        if (tipoObjetivo === "Reps") {
            // MODO ESTRICTO: Solo números y guion medio. Cero letras o espacios.
            valorFiltrado = valorFiltrado.replace(/[^0-9-]/g, '');
        } else if (tipoObjetivo === "Tiempo") {
            // Solo números, dos puntos (:) y letras s, m, h
            valorFiltrado = valorFiltrado.replace(/[^0-9:smh]/gi, '');
        } else if (tipoObjetivo === "Distancia") {
            // Solo números, punto, coma y letras k, m
            valorFiltrado = valorFiltrado.replace(/[^0-9.,km]/gi, '');
        }
        // Limitamos a 7 caracteres máximo para mantener la tarjeta limpia (ej. 100-120)
        actualizarCampo(exerciseId, 'valorObjetivo', valorFiltrado.slice(0, 7));
    };

    const alternarTipoObjetivo = (exerciseId) => {
        setConfiguracion(prev => prev.map(item => {
            if (item.exerciseId === exerciseId) {
                let nuevoTipo, nuevoValor;
                if (item.tipoObjetivo === "Reps") {
                    nuevoTipo = "Tiempo"; nuevoValor = "60s";
                } else if (item.tipoObjetivo === "Tiempo") {
                    nuevoTipo = "Distancia"; nuevoValor = "1km";
                } else {
                    nuevoTipo = "Reps"; nuevoValor = "10-12";
                }
                return { ...item, tipoObjetivo: nuevoTipo, valorObjetivo: nuevoValor };
            }
            return item;
        }));
    };

    // 🔴 MENTE MAESTRA DE LA VALIDACIÓN ACTUALIZADA
    const formularioValido = useMemo(() => {
        if (configuracion.length === 0) return false;

        return configuracion.every(item => {
            // A. Que no haya campos vacíos
            // El input filtrado ya es numérico, solo revisamos que tenga valor
            if (item.series === '' || item.series < 1) return false;
            // Un descanso de 0 es válido, pero no vacío
            if (item.descanso === '') return false;
            if (!item.valorObjetivo || item.valorObjetivo.trim() === '') return false;

            // B. Validación para rangos (Ej. "10-12")
            if (item.tipoObjetivo === "Reps" && item.valorObjetivo.includes("-")) {
                const partes = item.valorObjetivo.split("-");
                if (partes.length !== 2 || partes[0] === '' || partes[1] === '') return false;

                const min = parseInt(partes[0]);
                const max = parseInt(partes[1]);
                if (min > max) return false;
            }

            // Si pasa todas las pruebas, este ejercicio es válido
            return true;
        });
    }, [configuracion]);

    const handleGuardar = async () => {
        if (!formularioValido) return;

        const token = await Preferences.get({ key: 'token' });

        // Armamos el objeto. Si estamos editando, mandamos el id_rutina.
        const rutinaFinalizada = {
            id_rutina: idRutina,
            nombre: nombreRutina,
            ejercicios: configuracion
        };

        // 🔴 MAGIA: Decidimos a qué URL y con qué Método vamos a golpear
        const urlPeticion = esEdicion
            ? `http://${API_URL}/rutinas/${idRutina}`  // Modo Editar (PUT)
            : `http://${API_URL}/rutinas`;             // Modo Crear (POST)

        const metodoHTTP = esEdicion ? 'PUT' : 'POST';

        fetch(urlPeticion, {
            method: metodoHTTP,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token.value}`
            },
            body: JSON.stringify(rutinaFinalizada)
        })
            .then(response => response.json())
            .then(data => {
                console.log(data);
                cerrarVentana();
                if (!esEdicion) limpiarFormulario(); // Si existe
            })
            .catch(error => console.error('Error:', error));
    };
    return (
        <div className={`fixed inset-0 z-50 bg-gray-50 flex flex-col transform transition-transform duration-300 ease-in-out ${paso === 2 ? "translate-x-0" : "translate-x-full"}`}>

            <div className="flex items-center justify-between px-4 h-20 border-b border-gray-200 shrink-0 bg-white z-20 shadow-sm">
                <div className="w-1/4">
                    <button onClick={volverAtras} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <ArrowLeft size={28} className="text-gray-800" />
                    </button>
                </div>
                <div className="w-2/4 text-center">
                    <h1 className="font-bold text-lg text-gray-900 truncate px-2">{nombreRutina}</h1>
                </div>
                <div className="w-1/4 text-right">
                    <button
                        onClick={handleGuardar}
                        disabled={!formularioValido}
                        className={`font-semibold transition-colors ${formularioValido ? 'text-blue-600 hover:text-blue-800' : 'text-gray-400 cursor-not-allowed'}`}
                    >
                        Guardar
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-6">
                <div className="flex flex-col gap-4">
                    {configuracion.map((item) => (
                        <div key={item.exerciseId} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">

                            <div className="flex items-center gap-3 mb-4 border-b border-gray-50 pb-3">
                                <img src={item.gifUrl} alt={item.name} className="w-12 h-12 rounded-md object-cover bg-gray-100" loading="lazy" />
                                <h2 className="font-semibold text-gray-800 capitalize leading-tight">{item.name}</h2>
                            </div>

                            <div className="grid grid-cols-3 gap-3">
                                {/* 🔴 CAMPO SERIES ACTUALIZADO A MODO ESTRICTO */}
                                <div className="flex flex-col">
                                    <label className="text-[10px] font-bold text-gray-500 mb-1 uppercase tracking-wider text-center flex h-4 items-center justify-center">
                                        Series
                                    </label>
                                    <input
                                        type="text" // Cambiado de 'number' a 'text' para el filtro manual
                                        placeholder="Ej. 4"
                                        className={`w-full p-2 bg-gray-50 border rounded-md text-center font-medium text-gray-800 focus:outline-none transition-colors 
                                            ${(item.series === '' || item.series < 1) ? 'border-red-300' : 'border-gray-200 focus:border-blue-500'}`
                                        }
                                        value={item.series}
                                        onChange={(e) => manejarCambioSeries(item.exerciseId, e.target.value)} // Llama a la función estricta
                                    />
                                </div>

                                <div className="flex flex-col">
                                    <button
                                        onClick={() => alternarTipoObjetivo(item.exerciseId)}
                                        className="text-[10px] font-bold text-blue-600 hover:text-blue-800 mb-1 uppercase tracking-wider text-center flex items-center justify-center gap-1 cursor-pointer h-4 transition-colors"
                                    >
                                        {item.tipoObjetivo} <RefreshCw size={10} strokeWidth={3} />
                                    </button>
                                    <input
                                        type="text"
                                        placeholder={`Ej. ${item.tipoObjetivo === 'Reps' ? '10-12' : item.tipoObjetivo === 'Tiempo' ? '60s' : '5km'}`}
                                        className={`w-full p-2 bg-gray-50 border rounded-md text-center font-medium text-gray-800 focus:outline-none transition-colors 
                                            ${!item.valorObjetivo ? 'border-red-300' : 'border-gray-200 focus:border-blue-500'}`
                                        }
                                        value={item.valorObjetivo}
                                        onChange={(e) => manejarCambioObjetivo(item.exerciseId, item.tipoObjetivo, e.target.value)}
                                    />
                                </div>

                                {/* 🔴 CAMPO DESCANSO ACTUALIZADO A MODO ESTRICTO */}
                                <div className="flex flex-col">
                                    <label className="text-[10px] font-bold text-gray-500 mb-1 uppercase tracking-wider text-center flex h-4 items-center justify-center">
                                        Descanso
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text" // Cambiado de 'number' a 'text'
                                            placeholder="Ej. 90"
                                            className={`w-full p-2 pr-6 bg-gray-50 border rounded-md text-center font-medium text-gray-800 focus:outline-none transition-colors 
                                                ${item.descanso === '' ? 'border-red-300' : 'border-gray-200 focus:border-blue-500'}`
                                            }
                                            value={item.descanso}
                                            onChange={(e) => manejarCambioDescanso(item.exerciseId, e.target.value)} // Llama a la función estricta
                                        />
                                        <span className="absolute right-2 top-2.5 text-xs text-gray-400 font-medium pointer-events-none">s</span>
                                    </div>
                                </div>

                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export { NuevaRutinaSets };