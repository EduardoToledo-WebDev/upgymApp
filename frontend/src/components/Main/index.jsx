import React, { useState, useEffect, useContext } from 'react';
import { Login } from '../Login';
import AppRouter from '../../AppRouter';
import { Preferences } from '@capacitor/preferences';
import '../../globalStyles/global.css';
import { AppContext } from '../../context/AppContext';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Geolocation } from '@capacitor/geolocation';

function Main() {
    const API_URL = import.meta.env.VITE_API_URL;
    const { isAuthenticated, setIsAuthenticated, userData, setUserData, isLoading, setIsLoading } = useContext(AppContext);

    const solicitarPermisosIniciales = async () => {
        try {
            // 🔴 IMPORTANTE: Pedir permisos de notificaciones para Android 13+
            const permNotif = await LocalNotifications.requestPermissions();
            console.log('Permiso notificaciones:', permNotif.display);

            // 🔴 Pedir permisos de GPS (Coarse y Fine)
            const permGPS = await Geolocation.requestPermissions();
            console.log('Permiso GPS:', permGPS.location);
        } catch (error) {
            console.error("Error solicitando permisos:", error);
        }
    };

    const verificarSesion = async () => {
        setIsLoading(true);
        const { value: tokenGuardado } = await Preferences.get({ key: 'token' });

        if (!tokenGuardado) {
            setIsAuthenticated(false);
            setIsLoading(false);
            return;
        }

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
                    setUserData(data.user);
                } else {
                    setIsAuthenticated(false);
                }
            })
            .catch(() => setIsAuthenticated(false))
            .finally(() => setIsLoading(false));
    };

    useEffect(() => {
        // 1. Verificamos la sesión
        verificarSesion();

        // 2. 🔴 LLAMAMOS A LOS PERMISOS: Solo si el usuario ya entró es más amigable, 
        // pero puedes ponerlo aquí para que sea desde el inicio.
        solicitarPermisosIniciales();
    }, []);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen bg-slate-50">
                <h2 className="text-xl font-bold animate-pulse text-blue-600">UpGym está cargando...</h2>
            </div>
        );
    }

    return (
        <>
            {isAuthenticated ? (
                <AppRouter userData={userData} />
            ) : (
                <Login onLoginSuccess={verificarSesion} />
            )}
        </>
    );
}

export { Main };