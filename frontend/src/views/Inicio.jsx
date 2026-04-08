import { useContext, useEffect } from "react";
import { RachaCard } from "../components/ui/Inicio/rachaCard";
import { Header } from "../components/ui/Inicio/header";
import Configuracion from "./configuracion";
import { Checkin } from "../components/Checkin";
import { BotonEntreno } from "../components/ui/Inicio/BotonEntreno";
// 🔴 1. IMPORTAMOS EL STEPPER

import { AppContext } from "../context/AppContext";
import { Preferences } from '@capacitor/preferences';
import { App } from '@capacitor/app';
import { Geolocation } from '@capacitor/geolocation';
import { LocalNotifications } from '@capacitor/local-notifications';

export default function Inicio() {
    const {
        userData, mostrarConfiguracion, setMostrarConfiguracion,
        setSesionActiva, setIdCheckinActual, setSegundos,
        rutinaEmpezada, setRutinaEmpezada, setGimnasio,
        setValidacionUbicacion, gimnasio,
        // 🔴 2. TRAEMOS EL ESTADO DEL ENTRENAMIENTO (Para saber si el Stepper debe verse)
        entrenamientoState, setEntrenamientoState
    } = useContext(AppContext);

    // 🔴 3. ACTUALIZAMOS LA RECUPERACIÓN PARA QUE LEA AMBOS DISCOS (Checkin + Stepper)
    const sincronizarSesion = async () => {
        // --- A. RECUPERAR EL CHECK-IN (La estancia en el gym) ---
        const { value: sessionValue } = await Preferences.get({ key: 'active_session' });
        if (sessionValue) {
            const sesion = JSON.parse(sessionValue);
            const segundosReales = Math.floor((Date.now() - sesion.inicio) / 1000);

            setSesionActiva(true);
            setIdCheckinActual(sesion.id_checkin);
            setSegundos(segundosReales);
            setRutinaEmpezada(true);
            setGimnasio(sesion.gimnasio);

            await LocalNotifications.schedule({
                notifications: [{
                    id: 1,
                    title: `Entrenando en ${sesion.gimnasio.nombre}`,
                    body: `Tu sesión sigue activa.`,
                    ongoing: true, sticky: true
                }]
            });
        }

        // --- B. RECUPERAR EL STEPPER (Si el usuario estaba a mitad de rutina) ---
        const { value: workoutValue } = await Preferences.get({ key: 'workout_state' });
        if (workoutValue) {
            setEntrenamientoState(JSON.parse(workoutValue));
        } else {
            setEntrenamientoState(null);
        }
    };

    // GPS PERSISTENTE
    useEffect(() => {
        if (!gimnasio) return;

        const watchId = Geolocation.watchPosition({ enableHighAccuracy: true }, (position) => {
            if (position) {
                const R = 6371e3;
                const toRad = (deg) => deg * Math.PI / 180;
                const dLat = toRad(position.coords.latitude - gimnasio.latitud);
                const dLon = toRad(position.coords.longitude - gimnasio.longitud);
                const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(gimnasio.latitud)) * Math.cos(toRad(position.coords.latitude)) * Math.sin(dLon / 2) ** 2;
                const dist = R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));

                if (position.coords.accuracy < 100) {
                    setValidacionUbicacion(dist <= 150);
                }
            }
        });
        return () => Geolocation.clearWatch({ id: watchId });
    }, [gimnasio]);

    // EFECTOS DE ARRANQUE Y RESUME
    useEffect(() => {
        sincronizarSesion();
        const listener = App.addListener('appStateChange', ({ isActive }) => {
            if (isActive) sincronizarSesion();
        });
        return () => listener.remove();
    }, []);

    // CRONÓMETRO GLOBAL
    useEffect(() => {
        let interval;
        if (rutinaEmpezada) {
            interval = setInterval(() => setSegundos(prev => prev + 1), 1000);
        }
        return () => clearInterval(interval);
    }, [rutinaEmpezada]);

    return (
        // 🔴 4. Agregamos "relative" al contenedor principal para que el Stepper pueda cubrirlo
        <div className="flex flex-col w-full h-full bg-slate-50 relative">
            <Header userData={userData} mostrarConfiguracion={mostrarConfiguracion} setMostrarConfiguracion={setMostrarConfiguracion} />
            <RachaCard />
            <Configuracion mostrar={mostrarConfiguracion} setMostrar={setMostrarConfiguracion} />

            {/* VISTA BASE: Escáner o Cronómetro de Estancia */}
            <div className="flex-1 overflow-y-auto mt-4">
                {!rutinaEmpezada ? <Checkin /> : <BotonEntreno />}
            </div>

            {/* 🔴 5. LA VISTA SUPERPUESTA DEL STEPPER */}

        </div>
    );
}