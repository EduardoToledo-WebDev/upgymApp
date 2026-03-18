import React, { useState, useEffect } from 'react';
import { Login } from '../Login';
import AppRouter from '../../AppRouter';
import { Preferences } from '@capacitor/preferences';
import '../../globalStyles/global.css';


function Main() {
    const API_URL = import.meta.env.VITE_API_URL;
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userData, setUserData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const verificarSesion = async () => {
        setIsLoading(true);
        const { value: tokenGuardado } = await Preferences.get({ key: 'token' });


        fetch(`http://${API_URL}/verify-session`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${tokenGuardado}`
            }
        })
            .then(async response => {
                if (response.ok) {
                    const data = await response.json();
                    setIsAuthenticated(true);
                    setUserData(data.user); // Guardamos el { email: '...' } que viene del backend
                } else {
                    setIsAuthenticated(false);
                    setUserData(null);
                }
            })
            .catch(error => {
                console.error("Error validando sesión:", error);
                setIsAuthenticated(false);
            })
            .finally(() => {
                setIsLoading(false);
            });
    };

    // Se ejecuta una vez al abrir la app
    useEffect(() => {
        verificarSesion();
    }, []);

    if (isLoading) {
        return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><h2>Cargando...</h2></div>;
    }

    return (
        <>
            {isAuthenticated ? (
                // Le pasamos los datos del usuario al enrutador
                <AppRouter userData={userData} />
            ) : (
                // Si el login es exitoso, volvemos a verificar la sesión para obtener los datos
                <Login onLoginSuccess={verificarSesion} />
            )}
        </>
    );
}

export { Main };