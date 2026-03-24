import { useOutletContext } from "react-router-dom";
import { RachaCard } from "../components/ui/Inicio/rachaCard";
import { Header } from "../components/ui/Inicio/header";
import Configuracion from "./configuracion";
import { useState } from "react";
import { Checkin } from "../components/Checkin";

export default function Inicio() {
    const { userData } = useOutletContext();
    const [mostrarConfiguracion, setMostrarConfiguracion] = useState(false);

    return (
        <div className="flex flex-col w-full h-full">


            <Header userData={userData} mostrarConfiguracion={mostrarConfiguracion} setMostrarConfiguracion={setMostrarConfiguracion} />
            <RachaCard racha={userData?.racha_act} estado={userData?.estado_racha} />
            <Configuracion mostrar={mostrarConfiguracion} setMostrar={setMostrarConfiguracion} />
            <Checkin />
        </div>
    );
}