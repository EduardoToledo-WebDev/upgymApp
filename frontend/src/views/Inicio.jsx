import { useOutletContext } from "react-router-dom";
import { RachaCard } from "../components/ui/Inicio/rachaCard";
import { Header } from "../components/ui/Inicio/header";

export default function Inicio() {
    const { userData } = useOutletContext();

    return (
        <div className="flex flex-col w-full h-full">


            <Header userData={userData} />
            <RachaCard racha={userData?.racha_act} estado={userData?.estado_racha} />


        </div>
    );
}