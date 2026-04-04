import { RachaCard } from "../components/ui/Inicio/rachaCard";
import { Header } from "../components/ui/Inicio/header";
import Configuracion from "./configuracion";
import { useState } from "react";
import { Checkin } from "../components/Checkin";
import { useEffect } from "react";
import { BotonEntreno } from "../components/ui/Inicio/BotonEntreno";
import { AppContext } from "../context/AppContext";
import { useContext } from "react";

export default function Inicio() {
    const { userData, setUserData } = useContext(AppContext);
    const { mostrarConfiguracion, setMostrarConfiguracion } = useContext(AppContext);
    const { rachaUsuario, setRachaUsuario } = useContext(AppContext);
    const { rutinaEmpezada, setRutinaEmpezada } = useContext(AppContext);
    const API_URL = import.meta.env.VITE_API_URL;
    useEffect(() => {
        const obtenerRachaUsuario = async () => {
            const response = await fetch(`http://${API_URL}/dias-racha/` + userData.id_usuario);

            if (response.ok) {
                const data = await response.json();
                setRachaUsuario(data);
            }
        };

        obtenerRachaUsuario();
    }, []);

    return (
        <div className="flex flex-col w-full h-full">

            <Header />
            <RachaCard />
            <Configuracion />
            {
                !rutinaEmpezada ? (
                    <Checkin />
                ) : (
                    <BotonEntreno />
                )
            }
        </div>
    );
}