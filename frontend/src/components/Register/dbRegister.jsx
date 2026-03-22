import { useState } from "react";
// 1. IMPORTANTE: Debes importar Preferences de Capacitor
import { Preferences } from '@capacitor/preferences';

// 2. Quitamos los parámetros de la inicialización del hook, no los necesitas aquí
export function useDbRegister() {
    const [errorMessage, setErrorMessage] = useState('');
    const API_URL = import.meta.env.VITE_API_URL;

    const register = async (nombre, email, password) => {
        try {
            // Asegúrate de que en tu archivo .env, VITE_API_URL no incluya "http://" 
            // para que no quede como http://http://localhost:3000
            const response = await fetch(`http://${API_URL}/register`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    nombre,
                    email,
                    password
                })
            });

            const result = await response.json();

            if (response.ok) {
                // 3. Guardamos el token en el almacenamiento nativo
                await Preferences.set({
                    key: 'token',
                    value: result.token,
                });
                return true;
            } else {
                setErrorMessage(result.message || "Error al registrar");
                return false;
            }

        } catch (error) {
            console.error(error);
            setErrorMessage(`Error de conexión con el servidor`);
            return false;
        }
    };

    return { register, errorMessage };
}