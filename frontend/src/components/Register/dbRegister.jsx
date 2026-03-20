import { useState } from "react";


export function useDbRegister(nombre, email, password) {
    const [errorMessage, setErrorMessage] = useState('');
    const API_URL = import.meta.env.VITE_API_URL;

    const register = async (nombre, email, password) => {
        try {
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
                // 1. Guardamos el token en el teléfono
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
            setErrorMessage(`Error de conexión con el servidor ${error.message || error.toString()} ${API_URL}`);
            return false;
        }
    };

    return { register, errorMessage };

}

